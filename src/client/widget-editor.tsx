/**
 * 素材与部件编辑器（M2-6/8）：壁纸库（文件上传，≤20MB）+ 固定部件清单。
 * - 素材：经 controller.uploadAsset 上传到壁纸库（<dshHome>/.ui-presets/assets），预设只存引用
 * - 部件：固定目录（core/widgets.ts），CSS 由引擎生成（安全边界）
 * - #52：把素材指定给部件（下拉选择 / 一键设为聊天背景）→ 按部件固定比例裁剪
 *   （放大缩小 + 拖动定位，未覆盖区域透明填充）→ 裁剪副本入库并赋值
 * - 变更经 applySession 走 patchDraft——编译 cssText 变化即重挂（部件/素材变更天然生效）
 */
import * as React from 'react'
import { WIDGETS, MAX_ASSETS, MAX_ASSET_FILE_SIZE, type WidgetAssetRef, type WidgetParamDef } from '../core/widgets.ts'
import { WIDGET_CROP_RATIOS } from '../core/crop.ts'
import type { PresetWidget } from '../core/schema.ts'
import { getController } from './controller.ts'
import { CropDialog, type CropRequest } from './crop-dialog.tsx'
import { ConfirmDialog } from './confirm-dialog.tsx'
// #85 图层合成（#95 正式内化）
import { LayerComposerDialog } from './layer-composer.tsx'
// #89 素材缩略图（首帧 canvas）
import { AssetThumb } from './asset-thumb.tsx'

export interface WidgetEditorProps {
  assets: WidgetAssetRef[]
  widgets: PresetWidget[]
  onAssetsChange: (assets: WidgetAssetRef[]) => void
  onWidgetsChange: (widgets: PresetWidget[]) => void
  /** 修复轮 #40：素材+部件批量更新（删除素材需同时改两个字段——分开调两次
   * 会基于同一旧 session 闭包，React 批处理下后一次覆盖前一次，被删素材被顶回）。 */
  onAssetsAndWidgetsChange: (assets: WidgetAssetRef[], widgets: PresetWidget[]) => void
}

export function WidgetEditor(props: WidgetEditorProps): React.ReactElement {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const controller = getController()
  // #52：裁剪请求（选素材给部件时弹裁剪框；null = 未在裁剪）
  const [cropRequest, setCropRequest] = React.useState<CropRequest | null>(null)
  // #55：按明暗分别配置壁纸——开关本地态（深色参数存在时自动视为开启）
  const [schemeModeOn, setSchemeModeOn] = React.useState(false)
  // #85 图层合成：弹层开关
  const [composerOpen, setComposerOpen] = React.useState(false)
  // #96：素材列表最新引用（异步回调闭包读 props.assets 是旧快照——并发上传会顶掉前一个）
  const assetsRef = React.useRef(props.assets)
  assetsRef.current = props.assets

  const addAsset = async (file: File | undefined): Promise<void> => {
    if (file === undefined) return
    if (!file.type.startsWith('image/')) {
      window.alert('只支持图片素材（image/*）')
      return
    }
    if (file.size > MAX_ASSET_FILE_SIZE) {
      window.alert('素材超过上限（≤20MB）')
      return
    }
    if (assetsRef.current.length >= MAX_ASSETS) {
      window.alert(`素材数量已达上限 ${MAX_ASSETS} 个`)
      return
    }
    const result = await controller?.uploadAsset(file)
    if (result?.ok === true && result.id !== undefined) {
      props.onAssetsChange([...assetsRef.current, { id: result.id, name: result.name ?? file.name, mime: result.mime ?? file.type }])
    } else {
      window.alert(result?.error ?? '上传失败')
    }
  }

  /** #52/#55：打开裁剪框（按部件固定比例；dark = 配置深色风格 → 写 *Dark 参数）。 */
  const openCrop = (defId: string, assetId: string, dark = false): void => {
    const def = WIDGETS.find(w => w.id === defId)
    const ratio = WIDGET_CROP_RATIOS[defId]
    const asset = props.assets.find(item => item.id === assetId)
    if (def === undefined || ratio === undefined || asset === undefined) return
    setCropRequest({
      widgetId: defId,
      widgetName: def.name,
      ratio,
      sourceAssetId: assetId,
      sourceUrl: `/ui-presets/assets/${encodeURIComponent(assetId)}`,
      sourceName: asset.name,
      dark,
    })
  }

  /** #53（用户反馈：裁剪结果不落库）：确认 → 部件参数写入绘制矩形（帧坐标 cropX/Y/W/H），
   * assetId 保持引用原图——渲染由 controller 按目标元素实际尺寸动态计算（core/crop.ts）。
   * #55：dark 请求写 assetIdDark/cropXDark…（浅色参数保持不动）。 */
  const handleCropConfirm = (crop: { x: number; y: number; w: number; h: number }): void => {
    const request = cropRequest
    setCropRequest(null)
    if (request === null) return
    const round1 = (value: number): string => String(Math.round(value * 10) / 10)
    const dark = request.dark
    const nextWidgets = props.widgets.map(widget => {
      if (widget.id !== request.widgetId) return widget
      if (dark) {
        return {
          ...widget,
          params: {
            ...widget.params,
            assetIdDark: request.sourceAssetId,
            cropXDark: round1(crop.x),
            cropYDark: round1(crop.y),
            cropWDark: round1(crop.w),
            cropHDark: round1(crop.h),
          },
        }
      }
      return {
        ...widget,
        params: {
          ...widget.params,
          assetId: request.sourceAssetId,
          cropX: round1(crop.x),
          cropY: round1(crop.y),
          cropW: round1(crop.w),
          cropH: round1(crop.h),
        },
      }
    })
    props.onWidgetsChange(nextWidgets)
  }

  const removeAsset = (id: string): void => {
    const nextAssets = props.assets.filter(asset => asset.id !== id)
    // 引用该素材的部件参数清空（与素材移除同一次批量提交——修复轮 #40：
    // 分开两次 onAssetsChange/onWidgetsChange 会因旧 session 闭包互相覆盖）
    const nextWidgets = props.widgets.map(widget => {
      const params = { ...widget.params }
      for (const [key, value] of Object.entries(params)) {
        if (value === id) params[key] = ''
      }
      return { ...widget, params }
    })
    props.onAssetsAndWidgetsChange(nextAssets, nextWidgets)
    // review P1-3（全量评审）：删除素材（库级）——服务端顺带清空库中其他预设的引用，
    // 返回引用信息供提示（素材为库级共享，其他预设的壁纸会随之失效）。
    void controller?.deleteAsset(id).then(result => {
      if (result?.ok === false) {
        window.alert(result.error ?? '删除素材失败')
        return
      }
      if ((result?.refCount ?? 0) > 0) {
        window.alert(`素材已删除；库中 ${result.refCount} 个预设引用该素材，相关部件已自动清空。`)
      }
    })
  }

  const setWidgetEnabled = (defId: string, enabled: boolean): void => {
    if (enabled) {
      if (props.widgets.some(w => w.id === defId)) return
      const def = WIDGETS.find(w => w.id === defId)
      const params: Record<string, string> = {}
      for (const param of def?.params ?? []) params[param.key] = param.default ?? ''
      props.onWidgetsChange([...props.widgets, { id: defId, params }])
    } else {
      props.onWidgetsChange(props.widgets.filter(w => w.id !== defId))
    }
  }

  const setWidgetParam = (defId: string, key: string, value: string): void => {
    props.onWidgetsChange(props.widgets.map(widget => (
      widget.id === defId ? { ...widget, params: { ...widget.params, [key]: value } } : widget
    )))
  }

  const widgetEntry = (id: string): PresetWidget | undefined => props.widgets.find(w => w.id === id)

  /** M3-3 顺手化 + #52：一键设为聊天背景 → 弹 16:9 裁剪框 → 裁剪副本赋值（一步完成换壁纸）。 */
  const quickApplyAsChatBackground = (assetId: string): void => {
    const defId = 'chat-background'
    // 裁剪完成 handleCropConfirm 会赋值 assetId；若部件未启用，先启用（默认参数）
    if (widgetEntry(defId) === undefined) {
      const params: Record<string, string> = {}
      for (const param of WIDGETS.find(w => w.id === defId)?.params ?? []) params[param.key] = param.default ?? ''
      props.onWidgetsChange([...props.widgets, { id: defId, params }])
    }
    openCrop(defId, assetId)
  }

  /** #89 素材缩略图组件（首帧 canvas；替换全量 <img>——见 asset-thumb.tsx 注释）。 */

  const renderParam = (def: { id: string }, param: WidgetParamDef): React.ReactElement => {
    const entry = widgetEntry(def.id)
    const value = entry?.params[param.key] ?? param.default ?? ''
    if (param.type === 'asset') {
      // #52：选择素材 → 弹该部件的固定比例裁剪框（选"未选择"清空素材 + 裁剪参数）
      return (
        <label key={param.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--dsw-alias-label-tertiary, #999)' }}>
          {param.label}
          <select
            aria-label={`${def.id} ${param.key}`}
            value={value}
            onChange={e => {
              const id = e.target.value
              if (id === '') {
                // 清空素材 + 裁剪参数（cropX/Y/W/H 一并移除，静态路径恢复 cover）
                props.onWidgetsChange(props.widgets.map(widget => {
                  if (widget.id !== def.id) return widget
                  const params = { ...widget.params, assetId: '' }
                  delete params.cropX
                  delete params.cropY
                  delete params.cropW
                  delete params.cropH
                  return { ...widget, params }
                }))
              } else {
                openCrop(def.id, id)
              }
            }}
            style={{ fontSize: 11, padding: '2px 4px', borderRadius: 5, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-primary)' }}
          >
            <option value="">未选择</option>
            {props.assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
          </select>
        </label>
      )
    }
    if (param.type === 'select') {
      return (
        <label key={param.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--dsw-alias-label-tertiary, #999)' }}>
          {param.label}
          <select
            aria-label={`${def.id} ${param.key}`}
            value={value}
            onChange={e => { setWidgetParam(def.id, param.key, e.target.value) }}
            style={{ fontSize: 11, padding: '2px 4px', borderRadius: 5, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-primary)' }}
          >
            {param.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      )
    }
    if (param.type === 'range') {
      // #49：不透明度滑杆（0–100%，步进 0.01 → 显示为整数百分比）
      return (
        <label key={param.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--dsw-alias-label-tertiary, #999)' }}>
          {param.label}
          <input
            type="range"
            aria-label={`${def.id} ${param.key}`}
            min={param.min}
            max={param.max}
            step={param.step}
            value={value}
            onChange={e => { setWidgetParam(def.id, param.key, e.target.value) }}
            style={{ width: 110 }}
          />
          <span style={{ minWidth: 34, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--dsw-alias-label-primary)' }}>
            {Math.round((Number(value) || 0) * 100)}%
          </span>
        </label>
      )
    }
    return (
      <label key={param.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--dsw-alias-label-tertiary, #999)' }}>
        {param.label}
        <input
          type="number"
          aria-label={`${def.id} ${param.key}`}
          min={param.min}
          max={param.max}
          step={param.step}
          value={value}
          onChange={e => { setWidgetParam(def.id, param.key, e.target.value) }}
          style={{ width: 56, fontSize: 11, padding: '2px 4px', borderRadius: 5, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-primary)' }}
        />
      </label>
    )
  }

  /** #55：深色风格参数区（素材 + 不透明度；选素材走 dark 裁剪流 → 写 *Dark 参数）。 */
  const renderDarkSection = (def: { id: string }): React.ReactElement => {
    const entry = widgetEntry(def.id)
    const darkAssetId = entry?.params.assetIdDark ?? ''
    const darkOpacity = entry?.params.opacityDark ?? '1'
    return (
      <div data-up-widget-dark style={{ paddingLeft: 10, marginTop: 4, borderLeft: '2px dashed var(--dsw-alias-border-l2)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)' }}>深色风格</span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--dsw-alias-label-tertiary, #999)' }}>
            素材
            <select
              aria-label={`${def.id} assetIdDark`}
              value={darkAssetId}
              onChange={e => {
                const id = e.target.value
                if (id === '') {
                  props.onWidgetsChange(props.widgets.map(widget => {
                    if (widget.id !== def.id) return widget
                    const params = { ...widget.params }
                    delete params.assetIdDark
                    delete params.cropXDark
                    delete params.cropYDark
                    delete params.cropWDark
                    delete params.cropHDark
                    return { ...widget, params }
                  }))
                } else {
                  openCrop(def.id, id, true)
                }
              }}
              style={{ fontSize: 11, padding: '2px 4px', borderRadius: 5, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-primary)' }}
            >
              <option value="">未选择</option>
              {props.assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--dsw-alias-label-tertiary, #999)' }}>
            不透明度
            <input
              type="range"
              aria-label={`${def.id} opacityDark`}
              min={0}
              max={1}
              step={0.01}
              value={darkOpacity}
              onChange={e => { setWidgetParam(def.id, 'opacityDark', e.target.value) }}
              style={{ width: 110 }}
            />
            <span style={{ minWidth: 34, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--dsw-alias-label-primary)' }}>
              {Math.round((Number(darkOpacity) || 0) * 100)}%
            </span>
          </label>
        </div>
      </div>
    )
  }

  /** #55：按明暗分别配置——开启态 = 本地开关 ∨ 任意部件存在 *Dark 参数（预设载入自动识别）。 */
  const schemeMode = props.widgets.some(w => Object.keys(w.params).some(k => k.endsWith('Dark')))
  const schemeChecked = schemeModeOn || schemeMode
  // #58：关闭确认用应用内模态（原生 confirm 桌面端丢键盘焦点）
  const [confirmBox, setConfirmBox] = React.useState<{ message: string; action: () => void } | null>(null)
  const toggleSchemeMode = (checked: boolean): void => {
    if (!checked && schemeMode) {
      setConfirmBox({
        message: '关闭后将清除已设置的深色壁纸配置，确定？',
        action: () => {
          props.onWidgetsChange(props.widgets.map(widget => {
            const params = { ...widget.params }
            for (const key of Object.keys(params)) {
              if (key.endsWith('Dark')) delete params[key]
            }
            return { ...widget, params }
          }))
          setSchemeModeOn(false)
        },
      })
      return
    }
    setSchemeModeOn(checked)
  }

  return (
    <div data-up-widget-editor style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)' }}>素材与部件</span>
        <button
          type="button"
          data-up-btn
          onClick={() => { fileInputRef.current?.click() }}
          style={{ padding: '3px 10px', fontSize: 11 }}
        >
          添加素材
        </button>
        <button
          type="button"
          data-up-btn
          data-up-layer-open
          onClick={() => { setComposerOpen(true) }}
          style={{ padding: '3px 10px', fontSize: 11 }}
          title="多张小块图片叠加合成一张壁纸"
        >
          图层合成壁纸
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { addAsset(e.target.files?.[0]); e.target.value = '' }}
        />
        <span data-up-status style={{ fontSize: 10 }}>
          {props.assets.length}/{MAX_ASSETS} 个素材
        </span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--dsw-alias-label-secondary)', cursor: 'pointer', userSelect: 'none', marginLeft: 'auto' }}>
          <input
            type="checkbox"
            aria-label="按明暗分别配置壁纸"
            data-up-scheme-toggle
            checked={schemeChecked}
            onChange={e => { toggleSchemeMode(e.target.checked) }}
          />
          <span>按明暗分别配置壁纸（浅色/深色）</span>
        </label>
      </div>
      {props.assets.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {props.assets.map(asset => {
            const chatEntry = widgetEntry('chat-background')
            const chatUses = chatEntry?.params.assetId === asset.id
            return (
              <span
                key={asset.id}
                data-up-asset
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, fontSize: 11, color: 'var(--dsw-alias-label-secondary)' }}
              >
                {/* #89 素材库缩略图：首帧 canvas 绘制（不再全量解码动图——内存累积根因） */}
                <AssetThumb assetId={asset.id} size={22} dataAttrs={{ 'data-up-asset-thumb': '' }} />
                {asset.name}
                {/* M3-3：一键设为聊天背景（换壁纸最常用路径：启用部件 + 选中素材一步完成） */}
                <button
                  type="button"
                  data-up-btn
                  data-up-asset-quick
                  aria-label={`用 ${asset.name} 作聊天背景`}
                  onClick={() => { quickApplyAsChatBackground(asset.id) }}
                  style={{ padding: '0 6px', fontSize: 10, ...(chatUses ? { background: 'var(--dsw-alias-button-info-fill)', color: '#fff', borderColor: 'transparent' } : {}) }}
                  title={chatUses ? '当前聊天背景' : '一键设为聊天背景'}
                >
                  {chatUses ? '✓ 聊天背景' : '设为聊天背景'}
                </button>
                <button type="button" data-up-btn aria-label={`删除素材 ${asset.name}`} onClick={() => { removeAsset(asset.id) }} style={{ padding: '0 4px', fontSize: 10 }}>✕</button>
              </span>
            )
          })}
        </div>
      )}
      {/* 修复轮 #33：素材上传 ≠ 生效——提示启用部件并选择素材；M3-3：指向快捷按钮 */}
      {props.assets.length > 0 && !props.widgets.some(w => Object.values(w.params).some(v => v !== '')) && (
        <div data-up-status style={{ fontSize: 10, color: 'var(--dsw-alias-state-warn-primary, #b7791f)' }}>
          素材已上传但尚未生效——点击素材上的「设为聊天背景」一键启用，或在下方面板勾选部件并选择素材。
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {WIDGETS.map(def => {
          const enabled = widgetEntry(def.id) !== undefined
          return (
            <div key={def.id} data-up-widget style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 6, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--dsw-alias-label-primary)', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  aria-label={`启用部件 ${def.name}`}
                  checked={enabled}
                  onChange={e => { setWidgetEnabled(def.id, e.target.checked) }}
                />
                <span style={{ fontWeight: 600 }}>{def.name}</span>
                <span style={{ fontWeight: 400, color: 'var(--dsw-alias-label-tertiary, #999)' }}>· {def.description}</span>
              </label>
              {enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* #55：明暗分列时标注浅色区（深色区在下方虚线区块） */}
                  {schemeChecked && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)', paddingLeft: 22 }}>浅色风格</span>
                  )}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingLeft: 22 }}>
                    {def.params.map(param => renderParam(def, param))}
                  </div>
                  {schemeChecked && renderDarkSection(def)}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div data-up-status style={{ fontSize: 10 }}>
        部件 CSS 由引擎生成（安全边界）；素材存于壁纸库（.ui-presets/assets，≤20MB/个），预设仅存引用——zip 导出自动内嵌素材。选素材给部件时按固定比例裁剪（未覆盖区域透明填充）。
      </div>
      {/* #52/#53：裁剪对话框（fixed 覆盖层，z 1300 高于工作室；确认 = 参数写入，不落库） */}
      {cropRequest !== null && (
        <CropDialog
          request={cropRequest}
          onConfirm={crop => { handleCropConfirm(crop) }}
          onCancel={() => { setCropRequest(null) }}
        />
      )}
      {/* #85 图层合成：合成成功 → 新素材并入预设素材列表（部件下拉即可选用） */}
      {composerOpen && (
        <LayerComposerDialog
          assets={props.assets}
          onClose={() => { setComposerOpen(false) }}
          onComposed={asset => {
            props.onAssetsChange([...props.assets, asset])
          }}
        />
      )}
      {/* #58：关闭明暗分列的确认（应用内模态） */}
      {confirmBox !== null && (
        <ConfirmDialog
          message={confirmBox.message}
          confirmLabel="清除"
          onConfirm={() => {
            const action = confirmBox.action
            setConfirmBox(null)
            action()
          }}
          onCancel={() => { setConfirmBox(null) }}
        />
      )}
    </div>
  )
}
