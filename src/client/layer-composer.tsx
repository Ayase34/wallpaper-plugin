/**
 * #85 壁纸图层合成编辑器（#95 正式内化——不再属实验/回滚范围）：
 * - 弹层画布（目标部件固定比例帧，复用 cropFrameSize）+ 素材面板（库素材点击加入）
 * - 画布交互：Pointer 拖动定位（帧坐标换算）/ 滚轮缩放 / 旋转与透明度滑杆 / 置顶置底 / 删除 / 撤销栈
 * - 「合成并上传」：离屏 canvas 按帧尺寸渲染全部图层（z 序、旋转绕中心、透明度）→ PNG →
 *   controller.uploadAsset 上传壁纸库 → onComposed(id, name)
 * - 零抛错红线：任何异常 → 状态行提示，不冒泡
 */
import * as React from 'react'
import { cropFrameSize, WIDGET_CROP_RATIOS } from '../core/crop.ts'
import { createLayer, composeMode, type LayerSpec } from '../core/layer-compose.ts'
// #86：多 GIF 拼接 → 帧时间轴合成 + GIF 重编码（canvas 只能画 GIF 首帧，必须自解码）
import { decodeGif, encodeGif } from '../core/gif-codec.ts'
import { getController } from './controller.ts'
import type { WidgetAssetRef } from '../core/widgets.ts'
// #89 素材面板缩略图：首帧 canvas 绘制，不再全量解码动图（内存累积根因）
import { AssetThumb } from './asset-thumb.tsx'

export interface LayerComposerProps {
  assets: WidgetAssetRef[]
  onClose: () => void
  /** 合成成功：已上传的新素材（可直接加入预设素材列表）。 */
  onComposed: (asset: { id: string; name: string; mime: string }) => void
}

const RATIO_OPTIONS: Array<{ key: string; label: string }> = [
  { key: 'chat-background', label: '16:9（聊天背景）' },
  { key: 'settings-background', label: '1:1（设置卡）' },
  { key: 'sidebar-poster', label: '1:5（侧栏海报）' },
]

export function LayerComposerDialog(props: LayerComposerProps): React.ReactElement {
  const controller = getController()
  const [ratioKey, setRatioKey] = React.useState('chat-background')
  const [layers, setLayers] = React.useState<LayerSpec[]>([])
  const [selected, setSelected] = React.useState<number>(-1)
  const [status, setStatus] = React.useState('')
  const [composing, setComposing] = React.useState(false)
  const [undoStack, setUndoStack] = React.useState<LayerSpec[][]>([])
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const imgCache = React.useRef(new Map<string, HTMLImageElement>())
  const dragRef = React.useRef<{ index: number; startX: number; startY: number; originX: number; originY: number } | null>(null)

  // 帧尺寸 = 目标部件固定比例（cropFrameSize 收比例字符串，非部件 key）
  const frame = cropFrameSize(WIDGET_CROP_RATIOS[ratioKey])
  // 预览画布显示尺寸（宽固定 640，高按比例）
  const viewW = 640
  const viewH = Math.round(640 * frame.h / frame.w)
  const scale = viewW / frame.w

  /** 更新图层（快照入撤销栈）。#96：函数式更新——异步回调闭包（addLayer 等）基于旧快照
   * 会把并发结果顶掉；入栈/入列都用 prev，避免撤销栈被旧快照污染。 */
  const updateLayers = (next: LayerSpec[] | ((prev: LayerSpec[]) => LayerSpec[])): void => {
    setUndoStack(stack => [...stack.slice(-49), layers])
    setLayers(prev => typeof next === 'function' ? next(prev) : next)
  }
  const undo = (): void => {
    // #96：updater 必须纯函数（StrictMode 双调用/并发重放）——从渲染闭包读当前栈，
    // 出栈用函数式 slice；连点两下的极小竞态（同渲染窗口）与旧实现等价，但不再有副作用。
    const stack = undoStack
    if (stack.length === 0) return
    const prev = stack[stack.length - 1]
    setUndoStack(s => s.slice(0, -1))
    setLayers(prev)
    setSelected(-1)
  }

  /** 预加载素材图（缓存）。 */
  const loadImage = (id: string): Promise<HTMLImageElement> => {
    const cached = imgCache.current.get(id)
    if (cached !== undefined) return Promise.resolve(cached)
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => { imgCache.current.set(id, img); resolve(img) }
      img.onerror = () => { imgCache.current.set(id, img); resolve(img) }
      img.src = `/ui-presets/assets/${encodeURIComponent(id)}`
    })
  }

  const addLayer = (assetId: string): void => {
    void loadImage(assetId).then(img => {
      const layer = createLayer(assetId, frame.w, frame.h)
      // 按素材纵横比校正初始尺寸（保持 1/4 画布宽）
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const targetW = frame.w / 4
        layer.h = targetW * img.naturalHeight / img.naturalWidth
      }
      // #96：函数式更新——连续快速点击多个素材时基于最新 prev 追加（旧闭包会顶掉前一个）
      updateLayers(prev => [...prev, layer])
      setSelected(prev => prev + 1)
    })
  }

  /** 绘制预览（含棋盘格透明底 + 选中高亮框）。 */
  const draw = (): void => {
    const canvas = canvasRef.current
    if (canvas === null) return
    const ctx = canvas.getContext('2d')
    if (ctx === null) return
    ctx.clearRect(0, 0, viewW, viewH)
    // 棋盘格
    const cell = 12
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, viewW, viewH)
    ctx.fillStyle = '#e2e2e2'
    for (let y = 0; y < viewH; y += cell) {
      for (let x = (y / cell) % 2 === 0 ? 0 : cell; x < viewW; x += cell * 2) {
        ctx.fillRect(x, y, cell, cell)
      }
    }
    void Promise.all(layers.map(layer => loadImage(layer.assetId))).then(images => {
      if (canvasRef.current !== canvas) return
      const ctx2 = canvas.getContext('2d')
      if (ctx2 === null) return
      layers.forEach((layer, index) => {
        const img = images[index]
        if (img === undefined || img.naturalWidth === 0) return
        ctx2.save()
        ctx2.globalAlpha = layer.opacity
        const cx = (layer.x + layer.w / 2) * scale
        const cy = (layer.y + layer.h / 2) * scale
        ctx2.translate(cx, cy)
        ctx2.rotate(layer.rotation)
        if (layer.flipH) ctx2.scale(-1, 1)
        if (layer.flipV) ctx2.scale(1, -1)
        ctx2.drawImage(img, -layer.w / 2 * scale, -layer.h / 2 * scale, layer.w * scale, layer.h * scale)
        ctx2.restore()
        if (index === selected) {
          ctx2.strokeStyle = 'var(--dsw-alias-button-info-fill, #416fe6)'
          ctx2.lineWidth = 2
          ctx2.strokeRect((layer.x) * scale, layer.y * scale, layer.w * scale, layer.h * scale)
        }
      })
    })
  }

  React.useEffect(() => { draw() }) // 每次渲染后重绘

  /** 命中测试（轴对齐包围盒，最上层优先）。 */
  const hitTest = (px: number, py: number): number => {
    for (let i = layers.length - 1; i >= 0; i -= 1) {
      const layer = layers[i]
      if (px >= layer.x && px <= layer.x + layer.w && py >= layer.y && py <= layer.y + layer.h) return i
    }
    return -1
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect()
    const fx = (e.clientX - rect.left) / scale
    const fy = (e.clientY - rect.top) / scale
    const index = hitTest(fx, fy)
    if (index >= 0) {
      setSelected(index)
      dragRef.current = { index, startX: e.clientX, startY: e.clientY, originX: layers[index].x, originY: layers[index].y }
      e.currentTarget.setPointerCapture(e.pointerId)
    } else {
      setSelected(-1)
    }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    const drag = dragRef.current
    if (drag === null) return
    const next = layers.map((layer, i) => i === drag.index
      ? { ...layer, x: drag.originX + (e.clientX - drag.startX) / scale, y: drag.originY + (e.clientY - drag.startY) / scale }
      : layer)
    setLayers(next)
  }
  const onPointerUp = (): void => {
    if (dragRef.current !== null) {
      setUndoStack(stack => [...stack.slice(-49), layers])
      dragRef.current = null
    }
  }
  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>): void => {
    if (selected < 0) return
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
    updateLayers(layers.map((item, i) => i === selected
      ? { ...item, w: item.w * factor, h: item.h * factor }
      : item))
  }

  /** #90 分层输出：静态层烘焙成一张底图（透明 → PNG 保透明；全不透明 → JPEG 压缩，
   * 照片 1920×1080 约 1-2MB），动图层零复制零重编码——meta.layers 记录动图引用与
   * 帧坐标矩形，渲染时 CSS 多背景叠放原生动画（照片不再被烤进 GIF 每帧——"超大 gif"根治）。 */
  const composeLayered = async (anim: { assetId: string; x: number; y: number; w: number; h: number }): Promise<void> => {
    const images = await Promise.all(layers.map(layer => loadImage(layer.assetId)))
    const canvas = document.createElement('canvas')
    canvas.width = frame.w
    canvas.height = frame.h
    const ctx = canvas.getContext('2d')
    if (ctx === null) throw new Error('canvas 不可用')
    layers.forEach((layer, index) => {
      if (layer.assetId === anim.assetId) return // 动图层不烘焙（原文件直引）
      const img = images[index]
      if (img === undefined || img.naturalWidth === 0) return
      ctx.save()
      ctx.globalAlpha = layer.opacity
      ctx.translate(layer.x + layer.w / 2, layer.y + layer.h / 2)
      ctx.rotate(layer.rotation)
      if (layer.flipH) ctx.scale(-1, 1)
      if (layer.flipV) ctx.scale(1, -1)
      ctx.drawImage(img, -layer.w / 2, -layer.h / 2, layer.w, layer.h)
      ctx.restore()
    })
    // 透明检测：任一像素 alpha<255 → PNG；全不透明 → JPEG（照片压缩率远优于 PNG）。
    // #96：探针 canvas 1/8 缩放回读（全帧 1920×1920 getImageData ≈15MB 一次性分配 + GPU 同步停顿）
    const probe = document.createElement('canvas')
    probe.width = Math.max(1, Math.round(frame.w / 8))
    probe.height = Math.max(1, Math.round(frame.h / 8))
    const pctx = probe.getContext('2d', { willReadFrequently: true })
    if (pctx === null) throw new Error('canvas 不可用')
    pctx.drawImage(canvas, 0, 0, probe.width, probe.height)
    const pixelData = pctx.getImageData(0, 0, probe.width, probe.height).data
    let hasAlpha = false
    for (let i = 3; i < pixelData.length; i += 4) {
      if (pixelData[i] < 255) { hasAlpha = true; break }
    }
    const mime = hasAlpha ? 'image/png' : 'image/jpeg'
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), mime, 0.85))
    if (blob === null) throw new Error('底图编码失败')
    const file = new File([blob], `合成壁纸-${Date.now()}.${mime === 'image/png' ? 'png' : 'jpg'}`, { type: mime })
    const result = await controller?.uploadAsset(file, undefined, {
      animAssetId: anim.assetId, x: anim.x, y: anim.y, w: anim.w, h: anim.h,
    })
    if (result?.ok === true && result.id !== undefined) {
      setStatus(`已生成分层合成壁纸「${result.name ?? '合成壁纸'}」（静态底 + 原生动图）`)
      props.onComposed({ id: result.id, name: result.name ?? '合成壁纸.png', mime })
    } else {
      setStatus(result?.error ?? '合成上传失败')
    }
  }

  /** 合成并上传：自动选模式——分层（底图+原生动图）/ 静态单图 / 烘焙动画。
   * forceBake=true（「烘焙为单文件动画」按钮）强制走时间轴烘焙。 */
  const compose = (forceBake: boolean): void => {
    if (layers.length === 0) { setStatus('请先添加至少一个图层'); return }
    setComposing(true)
    const mode = composeMode(layers, id => (props.assets.find(a => a.id === id)?.mime ?? '') === 'image/gif')
    void (async () => {
      try {
        if (mode.kind === 'layered' && !forceBake) {
          await composeLayered(mode.anim)
          return
        }
        // 判定是否有 GIF 图层（mime 来自预设素材引用）——烘焙路径
        const gifLayerIds = new Set(layers
          .filter(layer => (props.assets.find(a => a.id === layer.assetId)?.mime ?? '') === 'image/gif')
          .map(layer => layer.assetId))
        if (gifLayerIds.size === 0) {
          // ---- 静态路径（原逻辑）：PNG 输出 ----
          const images = await Promise.all(layers.map(layer => loadImage(layer.assetId)))
          const canvas = document.createElement('canvas')
          canvas.width = frame.w
          canvas.height = frame.h
          const ctx = canvas.getContext('2d')
          if (ctx === null) throw new Error('canvas 不可用')
          layers.forEach((layer, index) => {
            const img = images[index]
            if (img === undefined || img.naturalWidth === 0) return
            ctx.save()
            ctx.globalAlpha = layer.opacity
            ctx.translate(layer.x + layer.w / 2, layer.y + layer.h / 2)
            ctx.rotate(layer.rotation)
            if (layer.flipH) ctx.scale(-1, 1)
            if (layer.flipV) ctx.scale(1, -1)
            ctx.drawImage(img, -layer.w / 2, -layer.h / 2, layer.w, layer.h)
            ctx.restore()
          })
          const dataUrl = canvas.toDataURL('image/png')
          const bytes = Uint8Array.from(atob(dataUrl.slice('data:image/png;base64,'.length)), c => c.charCodeAt(0))
          const file = new File([bytes], `合成壁纸-${Date.now()}.png`, { type: 'image/png' })
          const result = await controller?.uploadAsset(file)
          if (result?.ok === true && result.id !== undefined) {
            setStatus(`已生成合成壁纸「${result.name ?? '合成壁纸'}」`)
            props.onComposed({ id: result.id, name: result.name ?? '合成壁纸.png', mime: 'image/png' })
          } else {
            setStatus(result?.error ?? '合成上传失败')
          }
          return
        }
        // ---- 动画路径：解码 GIF 图层 + 帧时间轴合成 + GIF 重编码 ----
        const gifCache = new Map<string, { width: number; height: number; frames: Array<{ pixels: Uint8ClampedArray; delayCs: number }> }>()
        for (const id of gifLayerIds) {
          const res = await fetch(`/ui-presets/assets/${encodeURIComponent(id)}`)
          if (!res.ok) throw new Error('GIF 素材读取失败')
          gifCache.set(id, decodeGif(new Uint8Array(await res.arrayBuffer())))
        }
        const staticImages = await Promise.all(layers.map(layer => loadImage(layer.assetId)))
        // 时间轴：最长总时长；边界 = 各 GIF 图层累计帧边界并集
        let totalCs = 0
        const boundaries = new Set<number>()
        for (const layer of layers) {
          const dec = gifCache.get(layer.assetId)
          if (dec === undefined) continue
          let cum = 0
          for (const f of dec.frames) {
            cum += f.delayCs
            if (cum > 0 && cum < 8640000) boundaries.add(cum)
          }
          totalCs = Math.max(totalCs, cum)
        }
        if (totalCs <= 0) throw new Error('GIF 无有效帧时长')
        const canvas = document.createElement('canvas')
        canvas.width = frame.w
        canvas.height = frame.h
        const ctx = canvas.getContext('2d')
        if (ctx === null) throw new Error('canvas 不可用')
        const frameImageDatas = new Map<string, ImageData[]>()
        /** 绘制单个图层（含 #87 镜像：translate/rotate 后 scale(-1) 绕中心翻转）。 */
        const applyTransform = (layer: LayerSpec, draw: () => void): void => {
          ctx.save()
          ctx.globalAlpha = layer.opacity
          ctx.translate(layer.x + layer.w / 2, layer.y + layer.h / 2)
          ctx.rotate(layer.rotation)
          if (layer.flipH) ctx.scale(-1, 1)
          if (layer.flipV) ctx.scale(1, -1)
          draw()
          ctx.restore()
        }
        const drawLayer = (layer: LayerSpec, index: number, timeCs: number): void => {
          const dec = gifCache.get(layer.assetId)
          if (dec !== undefined) {
            // 时间对齐帧（循环）：t mod 层总时长
            let layerTotal = 0
            for (const f of dec.frames) layerTotal += f.delayCs
            let t = timeCs % layerTotal
            let fi = 0
            for (let i = 0; i < dec.frames.length; i++) {
              if (t < dec.frames[i].delayCs) { fi = i; break }
              t -= dec.frames[i].delayCs
            }
            let datas = frameImageDatas.get(layer.assetId)
            if (datas === undefined) {
              // #96：共享缓冲零复制（f.pixels 已是 Uint8ClampedArray 且只读——旧实现
              // 每帧整体复制一份，93 帧 GIF 峰值内存翻倍）
              datas = dec.frames.map(f => new ImageData(f.pixels, dec.width, dec.height))
              frameImageDatas.set(layer.assetId, datas)
            }
            const data = datas[fi]
            if (data === undefined) return
            const temp = document.createElement('canvas')
            temp.width = dec.width
            temp.height = dec.height
            temp.getContext('2d')?.putImageData(data, 0, 0)
            applyTransform(layer, () => {
              ctx.drawImage(temp, -layer.w / 2, -layer.h / 2, layer.w, layer.h)
            })
          } else {
            const img = staticImages[index]
            if (img === undefined || img.naturalWidth === 0) return
            applyTransform(layer, () => {
              ctx.drawImage(img, -layer.w / 2, -layer.h / 2, layer.w, layer.h)
            })
          }
        }
        // #87 时间轴安全：合并 <5cs 的过短段（帧延时极短的动图边界并集会爆炸——
        // 用户实测"卡半天"根因），帧数上限 150（超限明确报错）
        const MIN_SEGMENT_CS = 5
        const rawTimes = [...boundaries].filter(t => t <= totalCs).sort((a, b) => a - b)
        const times: number[] = []
        let last = 0
        for (const t of rawTimes) {
          if (t - last >= MIN_SEGMENT_CS) { times.push(t); last = t }
        }
        if (times.length > 150) throw new Error('动图帧数过多（>150）——请使用帧率较低或时长较短的动图')
        // #87 输出降采样：长边 >1280 时缩到 1280（纯 JS 编码全分辨率 1920×1080 帧太重；
        // 合成画布仍按帧尺寸渲染保证几何正确，仅编码尺寸缩小——壁纸按 cover 缩放显示）
        // #89 体积护栏：照片类静态图铺满画布时 GIF 可达 10MB+（用户担心"超大的 gif"实证）——
        // 编码后超目标体积（8MB）自动逐级降采样重编码，直到达标或到达最小分辨率（640 长边）。
        const baseScale = Math.min(1, 1280 / Math.max(frame.w, frame.h))
        const minScale = Math.min(baseScale, 640 / Math.max(frame.w, frame.h))
        const MAX_OUTPUT_GIF_BYTES = 8 * 1024 * 1024
        if (times.length === 0) throw new Error('时间轴为空')
        setStatus(`合成中（动画 ${times.length} 帧）…`)
        const renderFrames = (scale: number): Array<{ pixels: Uint8ClampedArray; delayCs: number }> => {
          const oc = document.createElement('canvas')
          oc.width = Math.max(1, Math.round(frame.w * scale))
          oc.height = Math.max(1, Math.round(frame.h * scale))
          const octx = oc.getContext('2d')
          if (octx === null) throw new Error('canvas 不可用')
          let prev = 0
          const frames: Array<{ pixels: Uint8ClampedArray; delayCs: number }> = []
          for (const t of times) {
            ctx.clearRect(0, 0, frame.w, frame.h)
            layers.forEach((layer, index) => drawLayer(layer, index, prev))
            octx.clearRect(0, 0, oc.width, oc.height)
            octx.drawImage(canvas, 0, 0, oc.width, oc.height)
            frames.push({ pixels: new Uint8ClampedArray(octx.getImageData(0, 0, oc.width, oc.height).data), delayCs: t - prev })
            prev = t
          }
          return frames
        }
        let scale = baseScale
        let gifBytes: Uint8Array | null = null
        let finalW = 0
        let finalH = 0
        for (let attempt = 0; attempt < 5; attempt++) {
          const frames = renderFrames(scale)
          finalW = Math.max(1, Math.round(frame.w * scale))
          finalH = Math.max(1, Math.round(frame.h * scale))
          gifBytes = encodeGif(finalW, finalH, frames)
          if (gifBytes.length <= MAX_OUTPUT_GIF_BYTES || scale <= minScale + 1e-6) break
          scale = Math.max(minScale, scale * 0.75)
        }
        if (gifBytes === null) throw new Error('编码失败')
        const sizeMb = (gifBytes.length / 1048576).toFixed(1)
        const downscaled = scale < baseScale - 1e-6 ? ` · 已自动降采样至 ${finalW}×${finalH} 控制体积` : ''
        const file = new File([gifBytes], `合成壁纸-${Date.now()}.gif`, { type: 'image/gif' })
        const result = await controller?.uploadAsset(file)
        if (result?.ok === true && result.id !== undefined) {
          setStatus(`已生成合成壁纸「${result.name ?? '合成壁纸'}」（动画 ${times.length} 帧 · ${sizeMb}MB${downscaled}）`)
          props.onComposed({ id: result.id, name: result.name ?? '合成壁纸.gif', mime: 'image/gif' })
        } else {
          setStatus(result?.error ?? '合成上传失败')
        }
      } catch (error) {
        setStatus(`合成失败：${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setComposing(false)
      }
    })()
  }

  return (
    <div
      data-up-layer-composer
      style={{
        position: 'fixed', inset: 0, zIndex: 1300, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) props.onClose() }}
    >
      <div
        style={{
          width: 880, maxWidth: '94vw', maxHeight: '92vh', overflow: 'auto',
          background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'var(--dsw-alias-label-primary, #111)',
          borderRadius: 12, border: '1px solid var(--dsw-alias-border-l2)', padding: 16,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>图层合成壁纸</span>
          <select
            aria-label="合成比例"
            value={ratioKey}
            onChange={e => { setRatioKey(e.target.value); setLayers([]); setSelected(-1); setUndoStack([]) }}
            style={{ fontSize: 12, padding: '2px 6px' }}
          >
            {RATIO_OPTIONS.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
          </select>
          <span data-up-status style={{ fontSize: 11 }}>{status !== '' ? status : `画布 ${frame.w}×${frame.h} · 图层 ${layers.length}`}</span>
          <button type="button" data-up-btn onClick={undo} disabled={undoStack.length === 0} style={{ marginLeft: 'auto' }}>撤销</button>
          <button type="button" data-up-btn onClick={props.onClose}>关闭</button>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <canvas
            ref={canvasRef}
            data-up-layer-canvas
            width={viewW}
            height={viewH}
            aria-label="图层合成画布"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onWheel={onWheel}
            style={{ width: viewW, height: viewH, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8, touchAction: 'none', cursor: 'grab', flex: 'none' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
            <span style={{ fontSize: 11, fontWeight: 600 }}>素材（点击加入画布）</span>
            <div data-up-layer-palette style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 150, overflow: 'auto' }}>
              {props.assets.map(asset => (
                <AssetThumb
                  key={asset.id}
                  assetId={asset.id}
                  size={44}
                  title={asset.name}
                  dataAttrs={{ 'data-up-layer-piece': asset.id }}
                  onClick={() => addLayer(asset.id)}
                />
              ))}
            </div>
            {props.assets.length === 0 && <span data-up-status style={{ fontSize: 10 }}>库中暂无素材——先在素材与部件区上传小块图片</span>}
            {selected >= 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--dsw-alias-border-l2)', paddingTop: 6 }}>
                <label style={{ fontSize: 11 }}>
                  旋转 {Math.round(layers[selected].rotation * 180 / Math.PI)}°
                  <input
                    type="range" min={-180} max={180} step={1}
                    aria-label="图层旋转"
                    value={Math.round(layers[selected].rotation * 180 / Math.PI)}
                    onChange={e => updateLayers(layers.map((l, i) => i === selected ? { ...l, rotation: Number(e.target.value) * Math.PI / 180 } : l))}
                    style={{ width: '100%', display: 'block' }}
                  />
                </label>
                <label style={{ fontSize: 11 }}>
                  不透明度 {Math.round(layers[selected].opacity * 100)}%
                  <input
                    type="range" min={0} max={100} step={1}
                    aria-label="图层不透明度"
                    value={Math.round(layers[selected].opacity * 100)}
                    onChange={e => updateLayers(layers.map((l, i) => i === selected ? { ...l, opacity: Number(e.target.value) / 100 } : l))}
                    style={{ width: '100%', display: 'block' }}
                  />
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {/* #87b：上移 = 朝 z 顶层（数组序 = z 序，靠后在上）——用户实测反馈
                      原实现方向反了（上移变沉底），已对调 */}
                  <button type="button" data-up-btn aria-label="图层上移" onClick={() => {
                    if (selected < 0 || selected >= layers.length - 1) return
                    const next = [...layers]
                    const [item] = next.splice(selected, 1)
                    next.splice(selected + 1, 0, item)
                    updateLayers(next)
                    setSelected(selected + 1)
                  }} style={{ padding: '2px 8px', fontSize: 11 }}>上移</button>
                  <button type="button" data-up-btn aria-label="图层下移" onClick={() => {
                    if (selected <= 0) return
                    const next = [...layers]
                    const [item] = next.splice(selected, 1)
                    next.splice(selected - 1, 0, item)
                    updateLayers(next)
                    setSelected(selected - 1)
                  }} style={{ padding: '2px 8px', fontSize: 11 }}>下移</button>
                  <button type="button" data-up-btn aria-label="图层置顶" onClick={() => {
                    if (selected < 0) return
                    const next = [...layers]
                    const [item] = next.splice(selected, 1)
                    next.push(item)
                    updateLayers(next)
                    setSelected(next.length - 1)
                  }} style={{ padding: '2px 8px', fontSize: 11 }}>置顶</button>
                  <button type="button" data-up-btn aria-label="图层置底" onClick={() => {
                    if (selected < 0) return
                    const next = [...layers]
                    const [item] = next.splice(selected, 1)
                    next.unshift(item)
                    updateLayers(next)
                    setSelected(0)
                  }} style={{ padding: '2px 8px', fontSize: 11 }}>置底</button>
                  <button
                    type="button"
                    data-up-btn
                    aria-label="水平镜像"
                    onClick={() => updateLayers(layers.map((l, i) => i === selected ? { ...l, flipH: !l.flipH } : l))}
                    style={{ padding: '2px 8px', fontSize: 11, ...(selected >= 0 && layers[selected]?.flipH ? { background: 'var(--dsw-alias-button-info-fill)', color: '#fff', borderColor: 'transparent' } : {}) }}
                  >水平镜像</button>
                  <button
                    type="button"
                    data-up-btn
                    aria-label="垂直镜像"
                    onClick={() => updateLayers(layers.map((l, i) => i === selected ? { ...l, flipV: !l.flipV } : l))}
                    style={{ padding: '2px 8px', fontSize: 11, ...(selected >= 0 && layers[selected]?.flipV ? { background: 'var(--dsw-alias-button-info-fill)', color: '#fff', borderColor: 'transparent' } : {}) }}
                  >垂直镜像</button>
                  <button type="button" data-up-btn aria-label="删除图层" onClick={() => {
                    if (selected < 0) return
                    updateLayers(layers.filter((_, i) => i !== selected))
                    setSelected(-1)
                  }} style={{ padding: '2px 8px', fontSize: 11 }}>删除</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
          <span data-up-status style={{ fontSize: 10 }}>透明底——渲染时按部件不透明度向底色淡出</span>
          {/* #90：模式可分层时提供「烘焙为单文件动画」兜底（多 GIF 同步/旋转/导出单文件场景） */}
          {composeMode(layers, id => (props.assets.find(a => a.id === id)?.mime ?? '') === 'image/gif').kind === 'layered' && !composing && (
            <button type="button" data-up-btn data-up-layer-bake onClick={() => { void compose(true) }}
              style={{ padding: '4px 10px', fontSize: 11 }} title="把全部图层（含照片）烤进 GIF 每帧——体积大，仅多动图同步/旋转/单文件导出需要">
              烘焙为单文件动画
            </button>
          )}
          <button
            type="button"
            data-up-btn
            data-up-btn-primary
            data-up-layer-compose
            onClick={() => { void compose(false) }}
            disabled={composing || layers.length === 0}
          >
            {composing ? '合成中…' : '合成并上传'}
          </button>
        </div>
      </div>
    </div>
  )
}
