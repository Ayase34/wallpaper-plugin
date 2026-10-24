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
import type { Preset } from '../core/schema.ts'
import { isFavorite, loadFavorites, pickRandomId, saveFavorites, toggleInList } from './favorites.ts'
import { buildShareLink, capturePendingShare, clearPendingShare, decodeShare, encodeShare, getPendingShare, type PendingShare } from './share.ts'
import { ShareExportDialog, ShareImportDialog } from './share-dialog.tsx'
import { t as tr } from './i18n.ts'
import { useI18n } from './use-i18n.ts'
import { renderCoverFor } from './cover-render.ts'
import { coverDataUrlFor } from '../core/cover.ts'

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
/* #107（桌面端按钮残留修复）：工作室全屏层必须让开桌面壳的原生标题栏条带。
   DSH Desktop（Windows）用「覆盖式标题栏」——preload 在 <html> 写 --dsh-windows-titlebar-height: 40px，
   应用自身布局把 --dsh-frame-top-clearance 设为该高度并用它给 frame 加 padding-top；
   带 --dsh-frame-chrome-top / --dsh-frame-overlay-top 的浮层同样据此下移。
   工作室层原先 inset:0 直贴顶端：其顶栏（‹返回 / 标题 / 活动 / 导出 ZIP / 放弃 / 保存）
   正好落在标题栏条带里，与壳内左上角的 Windows 标题栏菜单（应用 / 编辑，z-index:1100，
   height: var(--dsh-windows-titlebar-height)）重叠——用户看到「之前页面的按钮残留」。
   修法：根元素加 padding-top = 框架顶部让位（网页端为 0，零影响），
   box-sizing: border-box 保证仍铺满视口、背景仍盖住整屏。 */
[data-up-studio] { box-sizing: border-box; position: fixed; inset: 0; z-index: 1200; padding-top: var(--dsh-frame-top-clearance, 0px); background: var(--dsw-alias-bg-base, #fff); color: var(--dsw-alias-label-primary, #111); display: flex; flex-direction: column; }
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
    // 壁纸 2.0：轮换调度（本地偏好，不进预设；页面隐藏时暂停、回前台补切）。
    controller.startRotation()
  }

  // ---- 分享链接：页面渲染前捕获 #ui-presets-share=…，落成待导入横幅 ----
  // 捕获即清 hash（避免刷新/重进反复弹同一个分享；载荷已存模块级单例）。
  try {
    if (capturePendingShare(window.location.hash) !== null) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  } catch (error) {
    console.warn('[ui-presets] 分享链接解析失败：', error)
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
          label: () => tr('section.title'),
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
  const { t, locale, toggle: toggleLocale } = useI18n()
  const [auditWarnings, setAuditWarnings] = React.useState<string[]>([])
  // M3-2：合并列表（demo + 库 + 源）与逐项封面（库预设异步加载 tokens 生成）
  const [wallItems, setWallItems] = React.useState<WallItem[] | null>(null)
  const [covers, setCovers] = React.useState<Record<string, string>>({})
  const [importing, setImporting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  /** 分享待导入（启动时从链接捕获 / 面板粘贴导入）。 */
  const [pending, setPending] = React.useState<PendingShare | null>(() => getPendingShare())
  /** 收藏（localStorage 便捷层）+ 只看收藏筛选。 */
  const [favorites, setFavorites] = React.useState<string[]>(() => loadFavorites())
  const [onlyFavorite, setOnlyFavorite] = React.useState(false)
  const [shareExport, setShareExport] = React.useState<{ name: string; link: string; code: string; chars: number; omitted: number; warn?: string } | null>(null)
  const [shareImportOpen, setShareImportOpen] = React.useState(false)
  const [notice, setNotice] = React.useState<string | null>(null)

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
      // #97：仅「未被库遮蔽的 demo」用内置封面；库遮蔽项（同 id，builtin=false）必须加载
      // 生效预设封面（手设优先）——原逻辑 demoCovers 命中即跳过，库预设 default 的
      // 手设封面永不加载，墙卡片一直显示自动生成的 SVG
      if (item.builtin && demoCovers[item.id] !== undefined) continue
      void controller?.loadPreset(item.id).then(preset => {
        if (preset === null) return
        // #56：手设封面（含裁剪渲染）优先，否则自动生成 SVG
        void renderCoverFor(preset).then(src => {
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
        controller?.engine.reportError(result?.error ?? t('wall.importFailed'))
      }
    } finally { setImporting(false) }
  }

  /** 收藏/取消收藏（纯前端；写入失败也不影响本次会话）。 */
  const toggleFavorite = (id: string): void => {
    const next = toggleInList(favorites, id)
    setFavorites(next)
    saveFavorites(next)
  }

  /** 「换一个试试」：随机应用一个不同于当前的预设。 */
  const surprise = (): void => {
    const ids = (wallItems ?? []).map(item => item.id)
    const pick = pickRandomId(ids, state?.activePresetId ?? null)
    if (pick === null) {
      setNotice(t('wall.noOther'))
      return
    }
    setNotice(null)
    void controller?.applyPresetById(pick)
  }

  /** 导出分享：链接（同机）+ 分享码（跨机器）；编码前自校验，失败走状态行报错。 */
  const shareItem = async (id: string): Promise<void> => {
    if (controller === null) return
    const preset = await controller.loadPreset(id)
    if (preset === null) {
      controller.engine.reportError(t('wall.cannotRead', { id }))
      return
    }
    const result = encodeShare(preset)
    if (!result.ok) {
      controller.engine.reportError(result.error)
      return
    }
    setShareExport({
      name: preset.name,
      link: buildShareLink(window.location.href, result.code),
      code: result.code,
      chars: result.chars,
      omitted: result.omitted,
      warn: result.warn,
    })
  }

  /** 导入分享预设：只入库不激活（打开链接不等于同意换肤）；同 id 依次加后缀防覆盖。 */
  const importShared = async (preset: Preset, omitted: number): Promise<void> => {
    if (controller === null) return
    setImporting(true)
    try {
      const existing = new Set((await controller.listPresets()).map(item => item.id))
      let target = preset
      if (existing.has(target.id)) {
        let n = 2
        let id = `${preset.id}-${n}`
        while (existing.has(id)) { n += 1; id = `${preset.id}-${n}` }
        target = { ...preset, id, name: `${preset.name}（导入）` }
      }
      const ok = await controller.savePreset(target, { activate: false, preserveDraft: true })
      if (!ok) return
      await loadWall()
      setNotice(t('wall.imported', { name: target.name }) + (omitted > 0 ? t('wall.importedAssets', { count: omitted }) : ''))
    } finally {
      setImporting(false)
      clearPendingShare()
      setPending(null)
    }
  }

  const libraryEmpty = wallItems !== null && !wallItems.some(item => !item.builtin)
  const visibleItems = (wallItems ?? []).filter(item => !onlyFavorite || isFavorite(favorites, item.id))

  return (
    <div data-up-section>
      {/* 用户拍板：工作室入口 + 还原默认置顶（原在墙底部，卡片多时需滚动才能找到）；
          新增：换一个试试 / 只看收藏 / 导入分享码（借 dream-skin 的低摩擦玩法）。 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" data-up-btn data-up-btn-primary onClick={() => { openStudio() }}>{t('wall.openStudio')}</button>
        <button type="button" data-up-btn onClick={() => { controller?.clearActive() }}>{t('wall.reset')}</button>
        <button type="button" data-up-btn data-up-surprise onClick={surprise}>{t('wall.surprise')}</button>
        <button
          type="button"
          data-up-btn
          data-up-fav-filter
          data-up-fav-active={onlyFavorite ? 'true' : undefined}
          onClick={() => { setOnlyFavorite(prev => !prev) }}
          style={onlyFavorite ? { borderColor: 'var(--dsw-alias-brand-primary)' } : undefined}
        >
          {onlyFavorite ? '★' : '☆'} {favorites.length > 0 ? t('wall.favOnlyCount', { count: favorites.length }) : t('wall.favOnly')}
        </button>
        <button type="button" data-up-btn onClick={() => { setShareImportOpen(true) }}>{t('wall.importShare')}</button>
        {/* 语言切换（en 用户的第一入口；中文用户看到 EN 按钮） */}
        <button type="button" data-up-btn data-up-locale aria-label={t('lang.switchLabel')} onClick={toggleLocale}>
          {locale === 'zh' ? 'EN' : '中文'}
        </button>
      </div>
      {/* 分享待导入横幅：链接打开 / 粘贴导入后在此确认（只入库不自动应用） */}
      {pending !== null && (
        <div
          data-up-share-banner
          style={{
            display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
            padding: '8px 12px', borderRadius: 8, fontSize: 12, lineHeight: 1.5, marginBottom: 8,
            border: `1px solid ${pending.ok ? 'var(--dsw-alias-brand-primary, #4a7dff)' : 'var(--dsw-alias-state-error-primary, #d94c4c)'}`,
            background: 'var(--dsw-alias-bg-layer-1)',
          }}
        >
          {pending.ok ? (
            <>
              <span>
                {t('share.received', { name: pending.preset.name })}
                {pending.omitted > 0 ? t('share.assetsOmitted', { count: pending.omitted }) : ''}
              </span>
              <button type="button" data-up-btn data-up-btn-primary onClick={() => { void importShared(pending.preset, pending.omitted) }} disabled={importing}>
                {importing ? t('wall.importing') : t('share.importToLibrary')}
              </button>
              <button type="button" data-up-btn onClick={() => { clearPendingShare(); setPending(null) }}>{t('share.ignore')}</button>
            </>
          ) : (
            <>
              <span style={{ color: 'var(--dsw-alias-state-error-primary, #d94c4c)' }}>{t('share.invalid', { error: pending.error })}</span>
              <button type="button" data-up-btn onClick={() => { clearPendingShare(); setPending(null) }}>{t('share.gotIt')}</button>
            </>
          )}
        </div>
      )}
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
          {t('wall.auditPrefix', { warnings: auditWarnings.join(locale === 'en' ? '; ' : '；') })}
        </div>
      )}
      {/* M3-2：卡片化预设墙（demo + 库 + 源合并；整卡点击 = 一键切换） */}
      {/* review P3：加载态提示（wallItems 初始 null——原实现先渲染空网格再闪入） */}
      {wallItems === null && <div data-up-status>{t('wall.loading')}</div>}
      <div data-up-wall>
        {visibleItems.map(item => {
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
              <div data-up-card-desc>{item.builtin ? t('wall.builtin') : t('wall.mine')}{item.id === 'default' ? '' : ` · ${item.id}`}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  data-up-btn
                  data-up-btn-primary
                  onClick={e => { e.stopPropagation(); void controller?.applyPresetById(item.id) }}
                >
                  {active ? t('wall.applied') : t('wall.apply')}
                </button>
                <button
                  type="button"
                  data-up-fav
                  aria-label={`${isFavorite(favorites, item.id) ? t('wall.unfavorite') : t('wall.favorite')} ${item.name}`}
                  aria-pressed={isFavorite(favorites, item.id)}
                  onClick={e => { e.stopPropagation(); toggleFavorite(item.id) }}
                  style={{ padding: '2px 8px', fontSize: 12, borderRadius: 6, border: '1px solid var(--dsw-alias-border-l2, #ddd)', background: 'transparent', color: isFavorite(favorites, item.id) ? 'var(--dsw-alias-brand-primary, #4a7dff)' : 'var(--dsw-alias-label-secondary, #666)', cursor: 'pointer' }}
                >
                  {isFavorite(favorites, item.id) ? '★' : '☆'}
                </button>
                <button
                  type="button"
                  data-up-share
                  onClick={e => { e.stopPropagation(); void shareItem(item.id) }}
                  style={{ padding: '2px 8px', fontSize: 12, borderRadius: 6, border: '1px solid var(--dsw-alias-border-l2, #ddd)', background: 'transparent', color: 'var(--dsw-alias-label-secondary, #666)', cursor: 'pointer' }}
                >
                  {t('wall.share')}
                </button>
                {active && <span data-up-status>{t('wall.current')}</span>}
              </div>
            </div>
          )
        })}
      </div>
      {/* 只看收藏且无命中时的空态（与「库为空」区分开） */}
      {onlyFavorite && visibleItems.length === 0 && (
        <div data-up-status style={{ marginTop: 8 }}>{t('wall.favEmpty')}</div>
      )}
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
          <div style={{ fontWeight: 600, color: 'var(--dsw-alias-label-primary, #111)' }}>{t('wall.emptyTitle')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span>{t('wall.emptyBody')}</span>
            <button type="button" data-up-btn onClick={() => fileInputRef.current?.click()} disabled={importing}>
              {importing ? t('wall.importing') : t('wall.importFile')}
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
      {notice !== null && (
        <div data-up-status data-up-notice style={{ marginTop: 8 }}>{notice}</div>
      )}
      {state?.lastError !== null && state?.lastError !== undefined && (
        <div data-up-status style={{ marginTop: 8 }}>
          <span data-up-error>{state.lastError}</span>
        </div>
      )}
      <StudioShell />
      {shareExport !== null && (
        <ShareExportDialog
          presetName={shareExport.name}
          link={shareExport.link}
          code={shareExport.code}
          chars={shareExport.chars}
          omitted={shareExport.omitted}
          warn={shareExport.warn}
          onClose={() => { setShareExport(null) }}
        />
      )}
      {shareImportOpen && (
        <ShareImportDialog
          onClose={() => { setShareImportOpen(false) }}
          onImport={text => {
            const decoded = decodeShare(text)
            setShareImportOpen(false)
            if (!decoded.ok) {
              controller?.engine.reportError(decoded.error)
              return
            }
            void importShared(decoded.preset, decoded.omitted)
          }}
        />
      )}
    </div>
  )
}
