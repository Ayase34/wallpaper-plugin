/**
 * ui-presets 浏览器 half：设置入口 + 全屏工作室（M1 编辑基座）。
 * 契约（spike 实证）：__ModuleLoader__.load 包装，export name/inject/apply(ctx)。
 * 安全红线（研究文档 §7）：apply 零抛错——外部依赖 ctx.get 条件获取 + try/catch 降级。
 * M1 交付：settings.section「外观预设」（紧凑预设墙）+ settings.general.item 快捷行
 * + 全屏工作室（预设管理/分组编辑器/旋钮/mock 预览/草稿保存）。
 */
import * as React from 'react'
import { DEMO_PRESETS } from './demo.ts'
import { openStudio } from './env.ts'
import { PresetsController, getController, setController } from './controller.ts'
import { StudioShell } from './studio-shell.tsx'
import { auditPresets } from '../core/audit.ts'
import { coverDataUrlFor } from '../core/cover.ts'
import type { Preset } from '../core/schema.ts'

/** #56：预设封面图源——手设封面（含 3:1 裁剪 canvas 渲染，帧 1920×640 → 900×300）优先；
 * 无手设封面/加载失败 → 自动生成 SVG。浏览器环境专用（墙加载时调用）。 */
function coverImageFor(preset: Preset): Promise<string> {
  const cover = preset.cover
  if (cover === undefined || cover.assetId === '') return Promise.resolve(coverDataUrlFor(preset))
  const asset = (preset.assets ?? []).find(item => item.id === cover.assetId)
  if (asset === undefined) return Promise.resolve(coverDataUrlFor(preset))
  const src = asset.dataUrl ?? `/ui-presets/assets/${encodeURIComponent(asset.id)}`
  const hasCrop = typeof cover.cropX === 'string' && cover.cropX !== ''
    && typeof cover.cropW === 'string' && cover.cropW !== ''
  if (!hasCrop) return Promise.resolve(src)
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      try {
        const W = 900
        const H = 300
        const s = W / 1920 // 裁剪帧 1920×640（3:1 长边 1920）→ 900×300
        const canvas = document.createElement('canvas')
        canvas.width = W
        canvas.height = H
        const ctx = canvas.getContext('2d')
        if (ctx === null) { resolve(src); return }
        ctx.clearRect(0, 0, W, H)
        ctx.drawImage(
          img,
          Number(cover.cropX) * s, Number(cover.cropY) * s,
          Number(cover.cropW) * s, Number(cover.cropH) * s,
        )
        resolve(canvas.toDataURL('image/png'))
      } catch { resolve(src) }
    }
    img.onerror = () => { resolve(coverDataUrlFor(preset)) }
    img.src = src
  })
}

// #95：插件改名 wallpaper-plugin（注册名与 node half 一致）。
export const name = 'wallpaper-plugin'
// 评审 P1-1 修复：声明 'theme' 让 fiber 等待 ui-theme 就绪后再激活本插件
// （ui-layout 官方同款：inject: ['slots','theme']），消除启动期 adoptPersisted 竞态。
export const inject: string[] = ['slots', 'theme']

const STYLE_MARKER = 'style[data-ui-presets-style]'

/** 共享样式（第三方插件无 CSS Modules 管线，手写 CSS 字符串注入）。 */
const CSS = `
[data-up-section] { padding: 4px 0; }
[data-up-wall] { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
[data-up-card] { border: 1px solid var(--dsw-alias-border-l2, #ddd); border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s; }
[data-up-card]:hover { border-color: var(--dsw-alias-button-info-fill, #416fe6); box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
[data-up-card-active] { border-color: var(--dsw-alias-button-info-fill, #416fe6); box-shadow: 0 0 0 1px var(--dsw-alias-button-info-fill, #416fe6); }
/* M4-2：prefers-reduced-motion——关闭过渡与动效 */
@media (prefers-reduced-motion: reduce) {
  [data-up-card], [data-up-btn], [data-up-studio] * { transition: none !important; animation: none !important; }
}
/* M4-3：窄屏响应式——工作室三栏 <900px 纵向堆叠（中栏优先，左右栏限高内滚） */
@media (max-width: 899px) {
  [data-up-studio-body] { flex-direction: column !important; overflow: auto !important; }
  [data-up-studio-body] > aside { width: auto !important; flex-shrink: 1 !important; max-height: 220px; overflow: auto !important; }
  [data-up-studio-body] > main { min-height: 0 !important; overflow: visible !important; }
  /* review P3：窄屏标题栏 7 控件换行（原无换行策略，~400px 溢出） */
  [data-up-studio-bar] { flex-wrap: wrap !important; }
  [data-up-studio-title] { min-width: 0 !important; }
}
[data-up-card-title] { font-size: 14px; font-weight: 600; }
[data-up-card-desc] { font-size: 12px; color: var(--dsw-alias-label-secondary, #666); }
[data-up-btn] { border-radius: 18px; border: 1px solid var(--dsw-alias-border-l2, #ddd); background: var(--dsw-alias-bg-layer-2, #fff); color: var(--dsw-alias-label-primary, #111); padding: 6px 16px; font-size: 13px; cursor: pointer; }
[data-up-btn-primary] { background: var(--dsw-alias-button-info-fill, #416fe6); border-color: transparent; color: #fff; }
[data-up-status] { font-size: 12px; color: var(--dsw-alias-label-tertiary, #999); min-height: 16px; }
[data-up-error] { color: var(--dsw-alias-state-error-primary, #d94c4c); font-size: 12px; }
[data-up-studio] { position: fixed; inset: 0; z-index: 1200; background: var(--dsw-alias-bg-base, #fff); color: var(--dsw-alias-label-primary, #111); display: flex; flex-direction: column; }
[data-up-studio-bar] { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--dsw-alias-border-l2, #ddd); }
[data-up-studio-title] { font-size: 15px; font-weight: 600; flex: 1; }
[data-up-studio-body] { flex: 1; overflow: auto; padding: 24px; }
[data-up-row] { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--dsw-alias-border-l2, #eee); font-size: 13px; }
`

/** 最小 slots 面。 */
interface SlotsLike {
  inject(name: string, factory: () => unknown): void
  register(options: Record<string, unknown>, component: unknown): unknown
}

/** 插件上下文（最小面，避免引入运行时类型依赖）。 */
interface ClientCtx {
  get<T = unknown>(name: string): T | undefined
  effect(fn: () => (() => void) | void, label?: string): void
  slots: SlotsLike
}

export function apply(ctx: ClientCtx): void {
  // ---- 控制器接线（零抛错：任何失败降级为"仅演示"模式） ----
  let controller: PresetsController | null = null
  try {
    controller = new PresetsController(ctx)
    setController(controller)
  } catch (error) {
    console.error('[ui-presets] controller init failed:', error)
  }
  if (controller !== null) {
    ctx.effect(() => () => {
      // #96（审计）：完整卸载——观察器/通道断开（旧实例残留会驱动已 dispose 的引擎
      // 清掉新实例的内联壁纸样式、旧 channel 互踩），引擎与桥照旧清理
      controller?.dispose()
      controller?.engine.dispose()
      controller?.stopAiBridge()
      setController(null)
    }, 'wallpaper-plugin: engine')
    // 启动时应用已存活动预设（apply 早于 boot settle → 加载页即带美化；
    // 跨窗口实时同步后置，见 controller 注释）。
    void controller.adoptPersisted()
    // M4 简化（用户拍板）：入口统一标准版——掩码固定 standard（DEFAULT_CAPABILITIES
    // 即 standard，#96 起不再显式 setCapabilities——与默认值相等是 no-op 且误导）
    // M2-3：AI bridge——Node half preset_apply 的变更经 revision 轮询在浏览器即时生效。
    controller.startAiBridge()
  }

  // ---- 共享样式注入（幂等守卫 + 随 fiber 回收） ----
  if (document.querySelector(STYLE_MARKER) === null) {
    const styleEl = document.createElement('style')
    styleEl.setAttribute('data-ui-presets-style', '')
    styleEl.setAttribute('data-plugin', 'ui-presets')
    styleEl.textContent = CSS
    document.head.append(styleEl)
    ctx.effect(() => () => { styleEl.remove() }, 'ui-presets: styles')
  }

  // ---- 设置整页入口（外观预设 section，order 5，位于通用与模型之间） ----
  // 评审 P1-2 修复：slots 面异常不得令 apply throw（零抛错红线）——inject 与 factory 均守卫。
  try {
    ctx.slots.inject('settings.section', () => {
      try {
        return ctx.slots.register({
          name: 'settings.section',
          id: 'appearance-presets',
          order: 5,
          label: () => '外观预设',
          inject: () => ({}),
        }, SectionPage)
      } catch (error) {
        console.warn('[ui-presets] settings.section 注册失败：', error)
        return undefined
      }
    })
  } catch (error) {
    console.warn('[ui-presets] settings.section inject 失败：', error)
  }
  // #59（用户拍板）：通用设置里的「外观预设」快捷行已移除——入口只保留侧栏「外观预设」选项卡。
}

/** 统一状态订阅（评审 P1-2 修复：SectionPage/StudioShell 共用，
 * 消除"渲染时读一次快照"的响应式缺陷）。
 * #96（审计）：subscribe 依赖 getController() 实例（固定 [] 会让重挂后的订阅指向
 * 旧引擎——已 dispose 不再发状态，预设墙失明）。 */
function useControllerState(): ReturnType<PresetsController['getState']> | null {
  const instance = getController()
  return React.useSyncExternalStore(
    React.useCallback(
      (listener: () => void) => (instance === null ? () => {} : instance.subscribeState(listener)),
      [instance],
    ),
    () => getController()?.getState() ?? null,
  )
}

// ---- 组件层 ----

/** 设置整页：卡片化预设墙（网格 + 封面缩略图；简单用户点卡片即换肤，无需进全屏工作室）。
 * M2-2b：diff 告警横幅（所有版本）。
 * M3-2：卡片网格化 + 库预设并入（demo/库/源合并列表，封面异步加载）+ 整卡一键切换
 *       + 空态引导（库为空时提示创建/导入路径）。
 * M4 简化（用户拍板）：移除对外档位切换行——入口统一标准版（工作室入口常驻）。 */
interface WallItem { id: string; name: string; edition: string; builtin: boolean }

function SectionPage(): React.ReactElement {
  const controller = getController()
  const state = useControllerState()
  const [auditWarnings, setAuditWarnings] = React.useState<string[]>([])
  // M3-2：合并列表（demo + 库 + 源）与逐项封面（库预设异步加载 tokens 生成）
  const [wallItems, setWallItems] = React.useState<WallItem[] | null>(null)
  const [covers, setCovers] = React.useState<Record<string, string>>({})
  const [importing, setImporting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  // 加载预设墙合并列表（demo 优先，库/源补位——controller 已按查序合并）
  const loadWall = React.useCallback(async (): Promise<void> => {
    const items = await controller?.listPresets() ?? []
    setWallItems(items)
    // 封面：demo 同步生成；库/源预设异步取完整预设再生成（加载失败降级占位）
    // review P2-6（全量评审）：库封面总是重新生成（去掉 prev 短路缓存）——
    // 改名/改令牌后刷新即显示新封面（原实现缓存不失效）。
    const demoCovers: Record<string, string> = {}
    for (const demo of DEMO_PRESETS) demoCovers[demo.id] = coverDataUrlFor(demo)
    setCovers(demoCovers)
    for (const item of items) {
      if (demoCovers[item.id] !== undefined) continue
      void controller?.loadPreset(item.id).then(preset => {
        if (preset === null) return
        // #56：手设封面（含裁剪渲染）优先，否则自动生成 SVG
        void coverImageFor(preset).then(src => {
          setCovers(prev => ({ ...prev, [item.id]: src }))
        })
      })
    }
  }, [controller])

  React.useEffect(() => {
    let alive = true
    void loadWall()
    // M5-2：跨窗口库变更广播 → 刷新预设墙（其他窗口新建/删除/导入预设即时可见）。
    const unsubscribe = controller?.subscribeLibrary(() => {
      if (!alive) return
      void loadWall()
    })
    return () => {
      alive = false
      unsubscribe?.()
    }
  }, [controller, loadWall])

  // diff 告警：demo + 活动预设审计（版本契约/未知令牌）
  React.useEffect(() => {
    const base = auditPresets(DEMO_PRESETS)
    setAuditWarnings(base)
    const activeId = state?.activePresetId
    if (activeId !== null && activeId !== undefined) {
      void controller?.loadPreset(activeId).then(preset => {
        if (preset !== null) {
          const extra = auditPresets([preset]).filter(w => !base.includes(w))
          if (extra.length > 0) setAuditWarnings([...base, ...extra])
        }
      })
    }
  }, [controller, state?.activePresetId])

  const importPreset = async (file: File | null): Promise<void> => {
    if (file === null) return
    setImporting(true)
    try {
      const result = await controller?.importPresetFile(file)
      if (result?.ok === true) {
        await loadWall()
      } else {
        // review P2-5（全量评审）：导入失败静默无反馈——在状态行显示具体错误。
        controller?.engine.reportError(result?.error ?? '导入失败')
      }
    } finally { setImporting(false) }
  }

  const libraryEmpty = wallItems !== null && !wallItems.some(item => !item.builtin)

  return (
    <div data-up-section>
      {/* 用户拍板：工作室入口 + 还原默认置顶（原在墙底部，卡片多时需滚动才能找到） */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" data-up-btn data-up-btn-primary onClick={() => { openStudio() }}>打开美化工作室 →</button>
        <button type="button" data-up-btn onClick={() => { controller?.clearActive() }}>还原默认</button>
      </div>
      {/* M2-2b：diff 告警横幅（所有版本可见） */}
      {auditWarnings.length > 0 && (
        <div
          data-up-banner
          style={{
            padding: '8px 12px', borderRadius: 8, fontSize: 12, lineHeight: 1.5, marginBottom: 8,
            border: '1px solid var(--dsw-alias-state-warn-primary, #b7791f)',
            color: 'var(--dsw-alias-state-warn-primary, #b7791f)', background: 'var(--dsw-alias-bg-layer-1)',
          }}
        >
          ⚠ {auditWarnings.join('；')}
        </div>
      )}
      {/* M3-2：卡片化预设墙（demo + 库 + 源合并；整卡点击 = 一键切换） */}
      {/* review P3：加载态提示（wallItems 初始 null——原实现先渲染空网格再闪入） */}
      {wallItems === null && <div data-up-status>加载预设中…</div>}
      <div data-up-wall>
        {(wallItems ?? []).map(item => {
          const active = state?.activePresetId === item.id
          return (
            <div
              key={item.id}
              data-up-card
              data-up-card-active={active ? 'true' : undefined}
              role="button"
              tabIndex={0}
              onClick={() => { if (!active) void controller?.applyPresetById(item.id) }}
              // review P3（全量评审）：补 Space 触发（原仅 Enter）——role=button 键盘语义。
              onKeyDown={e => {
                if ((e.key === 'Enter' || e.key === ' ') && !active) {
                  e.preventDefault()
                  void controller?.applyPresetById(item.id)
                }
              }}
            >
              <img
                data-up-cover
                // review P3：占位用 1×1 透明 data URL（原 src='' 部分浏览器渲染破损图标闪烁）
                src={covers[item.id] ?? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
                alt={item.name}
                // #56：封面显示比例固定 3:1（aspect-ratio，替代原固定高度 84）——与手设封面裁剪比例一致
                style={{ width: '100%', aspectRatio: '3 / 1', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)' }}
              />
              <div data-up-card-title>{item.name}</div>
              <div data-up-card-desc>{item.builtin ? '出厂预设' : '我的预设'}{item.id === 'default' ? '' : ` · ${item.id}`}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  data-up-btn
                  data-up-btn-primary
                  onClick={e => { e.stopPropagation(); void controller?.applyPresetById(item.id) }}
                >
                  {active ? '已应用' : '应用'}
                </button>
                {active && <span data-up-status>✓ 当前应用</span>}
              </div>
            </div>
          )
        })}
      </div>
      {/* M3-2：空态引导（库为空时；统一给创建/导入路径——M4 简化后仅标准版） */}
      {libraryEmpty && (
        <div
          data-up-empty
          style={{
            marginTop: 12, padding: '14px 16px', borderRadius: 10, fontSize: 13, lineHeight: 1.7,
            border: '1px dashed var(--dsw-alias-border-l2, #bbb)',
            background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-secondary, #666)',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--dsw-alias-label-primary, #111)' }}>还没有自己的预设</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span>打开工作室创建，或导入预设文件（ZIP）：</span>
            <button type="button" data-up-btn onClick={() => fileInputRef.current?.click()} disabled={importing}>
              {importing ? '导入中…' : '导入预设文件'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              style={{ display: 'none' }}
              onChange={e => { void importPreset(e.target.files?.[0] ?? null); e.target.value = '' }}
            />
          </div>
        </div>
      )}
      {/* 用户拍板：状态行仅在有错误时显示（原"出厂 7 预设…"宣传小字已删） */}
      {state?.lastError !== null && state?.lastError !== undefined && (
        <div data-up-status style={{ marginTop: 8 }}>
          <span data-up-error>{state.lastError}</span>
        </div>
      )}
      <StudioShell />
    </div>
  )
}
