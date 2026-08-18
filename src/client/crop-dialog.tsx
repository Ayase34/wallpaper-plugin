/**
 * 图片裁剪对话框（#52/#53）：选素材给部件时按固定比例裁剪。
 * - 固定比例（部件决定）：聊天背景 16:9 / 设置卡 1:1 / 侧栏海报 1:5
 * - 用户：缩放滑杆（±按钮 + 滑杆，50%–800% 相对适配倍率）+ 拖动图片定位
 * - #53（用户反馈）：裁剪结果不落库——确认时把绘制矩形（帧坐标 x/y/w/h）交回编辑器，
 *   部件存参数引用原图；实际应用范围 = 裁剪框本身，**框外全部涂黑**（黑底 + 画布
 *   精确按帧比例铺满，无 letterbox）——框内未覆盖区域保持棋盘格（输出为透明）
 * - Esc 取消（capture + stopPropagation，防止连带关闭工作室）；对焦自持
 */
import * as React from 'react'
import {
  cropFrameSize,
  cropDrawRect,
  clampPanForCrop,
  cropRatioLabel,
  CROP_ZOOM_MIN,
  CROP_ZOOM_MAX,
  type CropRatio,
} from '../core/crop.ts'

export interface CropRequest {
  widgetId: string
  widgetName: string
  ratio: CropRatio
  sourceAssetId: string
  sourceUrl: string
  sourceName: string
  /** #55：true = 深色风格配置（结果写 assetIdDark/cropXDark…），false = 浅色/默认。 */
  dark: boolean
}

/** 确认回调：绘制矩形（帧坐标 px，已四舍五入到 0.1）。 */
export type CropRect = { x: number; y: number; w: number; h: number }

export interface CropDialogProps {
  request: CropRequest
  onConfirm: (crop: CropRect) => void
  onCancel: () => void
}

const FRAME_MAX_LONG = 1920

export function CropDialog(props: CropDialogProps): React.ReactElement {
  const { request } = props
  const frame = React.useMemo(() => cropFrameSize(request.ratio, FRAME_MAX_LONG), [request.ratio])
  const ratioLabel = cropRatioLabel(request.ratio)

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const [image, setImage] = React.useState<HTMLImageElement | null>(null)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [zoom, setZoom] = React.useState(1)
  const [pan, setPan] = React.useState({ x: 0, y: 0 })
  const dragRef = React.useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)

  // 加载源图
  React.useEffect(() => {
    const img = new Image()
    img.onload = () => { setImage(img) }
    img.onerror = () => { setLoadError('图片加载失败（素材可能已被删除）') }
    img.src = request.sourceUrl
    return () => { img.onload = null; img.onerror = null }
  }, [request.sourceUrl])

  // 渲染：帧内画图（透明底；缩放 + 平移）
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null || image === null) return
    const ctx = canvas.getContext('2d')
    if (ctx === null) return
    ctx.clearRect(0, 0, frame.w, frame.h)
    const rect = cropDrawRect(image.naturalWidth, image.naturalHeight, frame.w, frame.h, zoom, pan.x, pan.y)
    ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h)
  }, [canvasRef, image, zoom, pan, frame])

  // 对焦自持 + Esc 取消（capture 拦截，避免触发工作室整层 Esc）
  React.useEffect(() => {
    rootRef.current?.focus()
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    if (image === null) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y }
  }
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    const drag = dragRef.current
    if (drag === null || image === null) return
    // #57：屏幕像素 → 帧像素（画布按显示比例缩放——拖动手感 1:1，原实现图移量 < 鼠标移量）
    const displayScale = e.currentTarget.clientWidth > 0 ? e.currentTarget.clientWidth / frame.w : 1
    // #57：按图片当前显示尺寸（缩放后）动态钳制平移——放大后允许拖到图片边缘
    const fit = Math.min(frame.w / image.naturalWidth, frame.h / image.naturalHeight)
    const imgW = image.naturalWidth * fit * zoom
    const imgH = image.naturalHeight * fit * zoom
    const next = clampPanForCrop(
      drag.panX + (e.clientX - drag.startX) / displayScale,
      drag.panY + (e.clientY - drag.startY) / displayScale,
      frame.w, frame.h, imgW, imgH,
    )
    setPan(next)
  }
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    dragRef.current = null
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* 忽略 */ }
  }

  const zoomPercent = Math.round(zoom * 100)
  const setZoomPercent = (value: number): void => {
    setZoom(Math.min(CROP_ZOOM_MAX, Math.max(CROP_ZOOM_MIN, value / 100)))
  }

  const confirm = (): void => {
    if (image === null) return
    // 绘制矩形（帧坐标）即裁剪结果——部件存参数，不生成新素材（#53）
    const rect = cropDrawRect(image.naturalWidth, image.naturalHeight, frame.w, frame.h, zoom, pan.x, pan.y)
    props.onConfirm({
      x: Math.round(rect.x * 10) / 10,
      y: Math.round(rect.y * 10) / 10,
      w: Math.round(rect.w * 10) / 10,
      h: Math.round(rect.h * 10) / 10,
    })
  }

  return (
    <div
      ref={rootRef}
      data-up-crop
      role="dialog"
      aria-label={`图片裁剪：${request.widgetName}（${ratioLabel}）`}
      tabIndex={-1}
      onKeyDownCapture={e => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          props.onCancel()
        }
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.88)', outline: 'none',
      }}
    >
      <div
        data-up-crop-card
        style={{
          width: 'min(760px, calc(100vw - 48px))', maxHeight: 'calc(100vh - 48px)', overflow: 'auto',
          background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'var(--dsw-alias-label-primary, #111)',
          borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
          border: '1px solid var(--dsw-alias-border-l2, #ddd)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>图片裁剪：{request.widgetName}</span>
          <span data-up-crop-ratio style={{ fontSize: 12, color: 'var(--dsw-alias-label-tertiary, #999)' }}>
            固定比例 {ratioLabel}（{frame.w}×{frame.h}）· 黑框内即实际应用范围；未覆盖区域透明
          </span>
        </div>

        {loadError !== null ? (
          <div data-up-status style={{ fontSize: 12, color: 'var(--dsw-alias-state-error-primary, #d94c4c)' }}>{loadError}</div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', background: '#000', borderRadius: 8, padding: 14 }}>
            <canvas
              ref={canvasRef}
              width={frame.w}
              height={frame.h}
              data-up-crop-canvas
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                // 画布盒子精确等于帧比例（aspect-ratio + 双 max 约束，无 letterbox）——
                // 框外 = 纯黑（应用范围一目了然）；框内透明像素显示棋盘格（输出透明区）
                background: 'repeating-conic-gradient(#d9d9d9 0% 25%, #f5f5f5 0% 50%) 0 0 / 16px 16px',
                aspectRatio: `${frame.w} / ${frame.h}`,
                width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '46vh',
                cursor: 'grab', touchAction: 'none',
                border: '1px solid rgba(255, 255, 255, 0.65)',
              }}
            />
          </div>
        )}

        {image === null && loadError === null && (
          <div data-up-status style={{ fontSize: 12 }}>加载图片中…</div>
        )}

        {image !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button type="button" data-up-btn aria-label="缩小" onClick={() => { setZoomPercent(zoomPercent - 10) }} style={{ padding: '2px 10px' }}>−</button>
            <input
              type="range"
              aria-label="缩放"
              min={CROP_ZOOM_MIN * 100}
              max={CROP_ZOOM_MAX * 100}
              step={5}
              value={zoomPercent}
              onChange={e => { setZoomPercent(Number(e.target.value)) }}
              style={{ flex: 1 }}
            />
            <button type="button" data-up-btn aria-label="放大" onClick={() => { setZoomPercent(zoomPercent + 10) }} style={{ padding: '2px 10px' }}>＋</button>
            <span data-up-crop-zoom style={{ fontSize: 12, minWidth: 52, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{zoomPercent}%</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" data-up-btn onClick={props.onCancel}>取消</button>
          <button type="button" data-up-btn data-up-btn-primary onClick={confirm} disabled={image === null}>确认裁剪</button>
        </div>
      </div>
    </div>
  )
}
