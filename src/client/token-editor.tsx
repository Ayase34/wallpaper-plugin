/**
 * 编辑器主体（M2 重构 / #74 收缩 / 2026-10 恢复）：旋钮层 + 原始令牌 + CSS/主题 + 素材部件 + 封面。
 * 2026-10：旋钮层 / CSS 补丁 / 主题注册的人用入口按「AI 之外保留人用路径」恢复
 *   （见 knob-editor.tsx / advanced-panels.tsx）——能力本就没删，删的只是入口。
 * - 令牌中文描述（core/catalog-zh.ts 内置层 + 用户「添加描述」localStorage 覆盖层）
 * - 分组染色：勾选模式多选令牌 → 新建组 → 一次改色批量写入（「明暗分别编辑」开关：
 *   不勾 = 单色同时写 light/dark；勾 = 分别填）
 */
import * as React from 'react'
import type { CssRule, Preset, PresetCover, TokenOverride } from '../core/schema.ts'
import { catalog, GROUP_ORDER, findToken, type TokenGroup } from '../core/catalog.ts'
import { isResolvableColor, resolveTokenValue } from '../core/token-utils.ts'
import { TOKEN_DESCRIPTIONS, GROUP_DESCRIPTIONS } from '../core/catalog-zh.ts'
import { COVER_RATIO } from '../core/cover.ts'
import { coverDataUrlFor } from '../core/cover.ts'
import type { WidgetAssetRef } from '../core/widgets.ts'
import type { PresetWidget } from '../core/schema.ts'
import { extractAlpha, normalizeHex, rgbaFromHex } from './color-utils.ts'
import { getCapabilities } from './capabilities.ts'
import { type ThemeEditState } from './theme-editor.tsx'
import { WidgetEditor } from './widget-editor.tsx'
import { CropDialog, type CropRequest } from './crop-dialog.tsx'
import { renderCoverFor } from './cover-render.ts'
import { CssPatchPanel, ThemeRegisterPanel } from './advanced-panels.tsx'
import { KnobEditor } from './knob-editor.tsx'
import { mergeKnobPatch } from './knob-state.ts'
import { useI18n } from './use-i18n.ts'

/** #74：用户分组（纯前端便捷层，落盘到 preset.extra.groups——schema 零改动）。 */
export interface PresetGroup {
  id: string
  name: string
  tokenNames: string[]
}

/** 编辑会话（父层持持久身份，本组件持编辑值）。 */
export interface EditorSession {
  presetId: string | null
  presetName: string
  tokens: Record<string, TokenOverride>
  /** CSS 补丁规则（M2-2 高级区）。 */
  css: CssRule[]
  /** 主题注册编辑态（M2-4 高级区）。 */
  theme: ThemeEditState
  /** 素材资产（M2-6 高级区）。 */
  assets: WidgetAssetRef[]
  /** 注入部件（M2-6 高级区）。 */
  widgets: PresetWidget[]
  /** #56 手设封面（引用预设内素材 + 3:1 裁剪矩形；undefined = 自动生成）。 */
  cover?: PresetCover
  /** #74 用户分组（extra.groups）。 */
  groups: PresetGroup[]
}

/** #74：用户令牌描述（localStorage，跨预设共享；显示优先级：用户层 > 内置层）。 */
const NOTES_KEY = 'ui-presets-token-notes'
function loadTokenNotes(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) ?? '{}') as Record<string, string> } catch { return {} }
}
function saveTokenNotes(notes: Record<string, string>): void {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)) } catch { /* 存储不可用忽略 */ }
}

export interface TokenEditorProps {
  session: EditorSession
  onSessionChange: (session: EditorSession, changedTokenNames: string[]) => void
}

/** 历史记录：令牌 + css 快照 + 本次变更名（M2-2：css 编辑可撤销）。 */
interface HistoryEntry {
  tokens: Record<string, TokenOverride>
  css: CssRule[]
  changedNames: string[]
}

const HISTORY_LIMIT = 100
/** 输入停顿窗口（评审 UX）：窗口内的连续变更合并为一条撤销历史。 */
const HISTORY_MERGE_MS = 300

/** 单令牌条目控件（#74：中文描述 + 用户描述编辑 + 分组勾选）。 */
function TokenRow(props: {
  name: string
  value: TokenOverride
  safety: string
  /** #74 分组勾选模式（null = 未开启）。 */
  groupChecked?: boolean
  onGroupToggle?: (name: string) => void
  onChange: (mode: 'light' | 'dark', value: string) => void
}): React.ReactElement {
  const { t } = useI18n()
  const entry = findToken(props.name)
  const lightIsColor = isResolvableColor(props.value.light)
  const darkIsColor = isResolvableColor(props.value.dark)
  const lightColor = lightIsColor ? resolveTokenValue(props.value.light) : ''
  const darkColor = darkIsColor ? resolveTokenValue(props.value.dark) : ''
  // #74：描述显示优先级 = 用户自填 > 内置
  const [notes, setNotes] = React.useState<Record<string, string>>(() => loadTokenNotes())
  const userNote = notes[props.name]
  const description = userNote ?? TOKEN_DESCRIPTIONS[props.name]
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState('')
  const startEdit = (): void => {
    setDraft(userNote ?? '')
    setEditing(true)
  }
  const commitNote = (): void => {
    const next = { ...notes }
    const text = draft.trim()
    if (text === '') delete next[props.name]
    else next[props.name] = text
    setNotes(next)
    saveTokenNotes(next)
    setEditing(false)
  }
  return (
    <div data-up-token-row style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
      {props.groupChecked !== undefined && (
        <input
          type="checkbox"
          data-up-group-check
          aria-label={`加入分组：${props.name}`}
          checked={props.groupChecked}
          onChange={() => { props.onGroupToggle?.(props.name) }}
          style={{ flexShrink: 0 }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <code style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--dsw-alias-label-secondary)' }}>
            {props.name}
            {props.safety === 'caution' ? ' ⚠' : props.safety === 'expert' ? ' 🔒' : ''}
          </code>
          <button
            type="button"
            data-up-note-btn
            onClick={startEdit}
            title={description ?? '添加中文描述'}
            style={{ fontSize: 10, padding: '0 4px', border: 'none', background: 'transparent', color: 'var(--dsw-alias-label-tertiary, #999)', cursor: 'pointer' }}
          >
            {description !== undefined ? '📝' : '＋描述'}
          </button>
        </div>
        {editing ? (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', paddingTop: 2 }}>
            <input
              type="text"
              data-up-note-input
              aria-label={`描述：${props.name}`}
              value={draft}
              placeholder={t('token.notePlaceholder')}
              maxLength={80}
              onChange={e => { setDraft(e.target.value) }}
              onKeyDown={e => { if (e.key === 'Enter') commitNote() }}
              style={{ flex: 1, fontSize: 10, padding: '2px 6px', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 5, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)' }}
            />
            <button type="button" data-up-btn onClick={commitNote} style={{ padding: '1px 8px', fontSize: 10 }}>{t('token.saveNote')}</button>
          </div>
        ) : (
          description !== undefined && (
            <div data-up-token-desc style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #999)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {description}
              {userNote !== undefined ? t('token.selfNote') : ''}
            </div>
          )
        )}
      </div>
      {(['light', 'dark'] as const).map(mode => {
        const isColor = mode === 'light' ? lightIsColor : darkIsColor
        const color = mode === 'light' ? lightColor : darkColor
        return (
          <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
            {isColor && (
              <input
                type="color"
                aria-label={`${props.name} ${mode}`}
                value={normalizeHex(color)}
                onChange={e => {
                  // 评审 UX：type=color 只能表达 hex——原值 rgba 带透明度时保留 alpha。
                  const alpha = extractAlpha(props.value[mode])
                  props.onChange(mode, alpha !== null ? rgbaFromHex(e.target.value, alpha) : e.target.value)
                }}
                style={{ width: 26, height: 22, padding: 0, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, background: 'transparent' }}
              />
            )}
            <input
              type="text"
              aria-label={`${props.name} ${mode} 值`}
              value={props.value[mode]}
              onChange={e => { props.onChange(mode, e.target.value) }}
              spellCheck={false}
              style={{
                width: 92, fontSize: 11, fontFamily: 'var(--ds-font-family-code)', padding: '3px 6px',
                border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-1)',
                color: 'var(--dsw-alias-label-primary)',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

/** 分组编辑器主体（M2-1：旋钮层优先 + 高级令牌折叠；搜索 + 分组折叠 + 亮/暗列头 + 输入停顿粒度撤销）。 */
export function TokenEditor(props: TokenEditorProps): React.ReactElement {
  const { session, onSessionChange } = props
  const { t } = useI18n()
  const historyRef = React.useRef<HistoryEntry[]>([])
  const lastHistoryPushRef = React.useRef(0)
  const [canUndo, setCanUndo] = React.useState(false)
  const [expandedExpert, setExpandedExpert] = React.useState(false)
  /** M2-1：高级令牌区折叠（评审点 E：standard 默认折叠；developer 默认展开）。 */
  const [advancedOpen, setAdvancedOpen] = React.useState(getCapabilities() === 'developer')
  const [search, setSearch] = React.useState('')
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set())
  /** #56：封面裁剪请求（选封面素材 → 3:1 裁剪框；null = 未在裁剪）。 */
  const [coverCrop, setCoverCrop] = React.useState<CropRequest | null>(null)
  /** #74 分组染色：勾选模式 + 已勾选集合 + 组面板展开 + 组命名输入。 */
  const [groupMode, setGroupMode] = React.useState(false)
  const [checked, setChecked] = React.useState<Set<string>>(() => new Set())
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(() => new Set())
  const [groupName, setGroupName] = React.useState('')
  /** #74 组色「明暗分别编辑」开关（不勾 = 单色同时写 light/dark，与旋钮层同语义）。 */
  const [groupSchemeMode, setGroupSchemeMode] = React.useState(false)

  const toggleCheck = React.useCallback((name: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }, [])

  const applySession = React.useCallback((next: EditorSession, changedNames: string[]) => {
    onSessionChange(next, changedNames)
  }, [onSessionChange])

  /** #56/#113：封面预览——手设封面走与墙上**同一套**栅格化（摆放矩形），先用图源占位避免闪空。 */
  const coverFallbackSrc = React.useMemo(() => {
    const cover = session.cover
    if (cover !== undefined && cover.assetId !== '') {
      const asset = session.assets.find(item => item.id === cover.assetId)
      if (asset !== undefined) return asset.dataUrl ?? `/ui-presets/assets/${encodeURIComponent(asset.id)}`
    }
    return coverDataUrlFor({
      id: session.presetId ?? 'preview', name: session.presetName, edition: 'standard', tokens: session.tokens,
    })
  }, [session.cover, session.assets, session.presetId, session.presetName, session.tokens])

  const [coverPreview, setCoverPreview] = React.useState<string | null>(null)
  React.useEffect(() => {
    let alive = true
    const draft: Preset = {
      schemaVersion: 1,
      id: session.presetId ?? 'preview',
      name: session.presetName,
      edition: 'standard',
      tokens: session.tokens,
      assets: session.assets.map(asset => ({
        id: asset.id, name: asset.name, mime: asset.mime,
        ...(asset.dataUrl !== undefined ? { dataUrl: asset.dataUrl } : {}),
      })),
      ...(session.cover !== undefined ? { cover: session.cover } : {}),
    }
    void renderCoverFor(draft).then(src => { if (alive) setCoverPreview(src) })
    return () => { alive = false }
  }, [session.cover, session.assets, session.presetId, session.presetName, session.tokens])

  const coverPreviewSrc = coverPreview ?? coverFallbackSrc

  /** #56：选封面素材 → 弹 3:1 裁剪框。 */
  const openCoverCrop = (assetId: string): void => {
    const asset = session.assets.find(item => item.id === assetId)
    if (asset === undefined) return
    setCoverCrop({
      widgetId: 'cover',
      widgetName: '预设封面',
      ratio: COVER_RATIO,
      sourceAssetId: assetId,
      sourceUrl: asset.dataUrl ?? `/ui-presets/assets/${encodeURIComponent(assetId)}`,
      sourceName: asset.name,
      dark: false,
    })
  }

  /** #56：封面裁剪确认 → 写入 cover 参数（3:1 帧坐标，同部件裁剪）。 */
  const handleCoverCropConfirm = (crop: { x: number; y: number; w: number; h: number }): void => {
    const request = coverCrop
    setCoverCrop(null)
    if (request === null) return
    const round1 = (value: number): string => String(Math.round(value * 10) / 10)
    applySession({
      ...session,
      cover: {
        assetId: request.sourceAssetId,
        cropX: round1(crop.x),
        cropY: round1(crop.y),
        cropW: round1(crop.w),
        cropH: round1(crop.h),
      },
    }, [])
  }

  /** 历史合并（评审 UX）：同一输入停顿（300ms）内的连续变更只记一条历史——
   * 撤销粒度 = "一次输入"而非逐键；停顿起点快照保证撤销可完整回退。 */
  const pushHistory = React.useCallback((snapshot: { tokens: Record<string, TokenOverride>; css: CssRule[] }, changedNames: string[]) => {
    const now = Date.now()
    const last = historyRef.current[historyRef.current.length - 1]
    if (now - lastHistoryPushRef.current < HISTORY_MERGE_MS && last !== undefined) {
      last.changedNames = Array.from(new Set([...last.changedNames, ...changedNames]))
    } else {
      historyRef.current.push({ tokens: snapshot.tokens, css: snapshot.css, changedNames })
      if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift()
    }
    lastHistoryPushRef.current = now
    setCanUndo(true)
  }, [])

  const setToken = React.useCallback((name: string, mode: 'light' | 'dark', value: string) => {
    const prev = session.tokens[name]
    if (prev !== undefined && prev[mode] === value) return
    pushHistory({ tokens: { ...session.tokens }, css: session.css }, [name])
    const next: EditorSession = {
      ...session,
      tokens: { ...session.tokens, [name]: { ...(prev ?? { light: '', dark: '' }), [mode]: value } },
    }
    applySession(next, [name])
  }, [session, applySession, pushHistory])

  const undo = React.useCallback(() => {
    const entry = historyRef.current.pop()
    if (entry === undefined) return
    setCanUndo(historyRef.current.length > 0)
    applySession({ ...session, tokens: entry.tokens, css: entry.css }, entry.changedNames)
  }, [session, applySession])

  const setBundle = React.useCallback((names: string[], value: string) => {
    const prev = session.tokens
    pushHistory({ tokens: { ...prev }, css: session.css }, names)
    const tokens = { ...prev }
    for (const name of names) {
      tokens[name] = { light: value, dark: value }
    }
    applySession({ ...session, tokens }, names)
  }, [session, applySession, pushHistory])

  /** 旋钮「明暗分别设置」：束内只写指定方案（保留另一方案现值，一条撤销历史）。 */
  const setBundleScheme = React.useCallback((names: string[], scheme: 'light' | 'dark', value: string) => {
    const prev = session.tokens
    pushHistory({ tokens: { ...prev }, css: session.css }, names)
    const tokens = { ...prev }
    for (const name of names) {
      tokens[name] = { ...(tokens[name] ?? { light: '', dark: '' }), [scheme]: value }
    }
    applySession({ ...session, tokens }, names)
  }, [session, applySession, pushHistory])

  /** #74 分组操作（须在 applySession/setBundle 定义之后——TDZ：先定义后引用）。 */
  const createGroup = React.useCallback(() => {
    const name = groupName.trim()
    if (name === '' || checked.size === 0) return
    const group: PresetGroup = { id: `group-${Date.now().toString(36)}`, name, tokenNames: [...checked] }
    applySession({ ...session, groups: [...session.groups, group] }, [])
    setChecked(new Set())
    setGroupName('')
    setGroupMode(false)
    setExpandedGroups(prev => new Set(prev).add(group.id))
  }, [session, applySession, checked, groupName])

  const deleteGroup = React.useCallback((id: string) => {
    applySession({ ...session, groups: session.groups.filter(g => g.id !== id) }, [])
  }, [session, applySession])

  /** 组改色：一次写入组内全部令牌（「明暗分别编辑」不勾 = 双写，勾 = 单方案）——
   * 复用 setBundle/setBundleScheme 语义（一条撤销历史可整体回退）。 */
  const setGroupColor = React.useCallback((group: PresetGroup, scheme: 'light' | 'dark' | 'both', value: string) => {
    if (scheme === 'both') setBundle(group.tokenNames, value)
    else setBundleScheme(group.tokenNames, scheme, value)
  }, [setBundle, setBundleScheme])

  /** 素材资产（M2-6：编译 cssText 变化即重挂——无需单独引擎比较）。 */
  const setAssets = React.useCallback((assets: WidgetAssetRef[]) => {
    applySession({ ...session, assets }, [])
  }, [session, applySession])

  /** 注入部件（M2-6）。 */
  const setWidgets = React.useCallback((widgets: PresetWidget[]) => {
    applySession({ ...session, widgets }, [])
  }, [session, applySession])

  /** 修复轮 #40：素材+部件批量更新（删除素材场景——单次提交避免旧闭包互相覆盖）。 */
  const setAssetsAndWidgets = React.useCallback((assets: WidgetAssetRef[], widgets: PresetWidget[]) => {
    applySession({ ...session, assets, widgets }, [])
  }, [session, applySession])

  /** CSS 补丁（恢复的高级区，AI 之外的人用入口）：与令牌同粒度进撤销历史；
   * 注入前仍由引擎编译侧按 data-* 白名单过滤，非法规则不会逃逸。 */
  const setCss = React.useCallback((css: CssRule[]) => {
    pushHistory({ tokens: { ...session.tokens }, css: session.css }, [])
    applySession({ ...session, css }, [])
  }, [session, applySession, pushHistory])

  /** 原生主题注册开关：不进撤销历史（history 快照契约只含 tokens/css，与旧实现一致）。 */
  const setTheme = React.useCallback((theme: ThemeEditState) => {
    applySession({ ...session, theme }, [])
  }, [session, applySession])

  /** 旋钮层写入（M2-1 恢复）：局部覆盖合并 → 进撤销历史 → 草稿即时生效。
   * 分别设置模式下 patch 只带一个方案键，合并时不得抹掉另一套值（mergeKnobPatch）。 */
  const applyKnobPatch = React.useCallback((patch: Record<string, Partial<TokenOverride>>) => {
    const names = Object.keys(patch)
    if (names.length === 0) return
    pushHistory({ tokens: { ...session.tokens }, css: session.css }, names)
    applySession({ ...session, tokens: mergeKnobPatch(session.tokens, patch) }, names)
  }, [session, applySession, pushHistory])

  // 分组条目渲染：全量分组；搜索时按令牌名过滤
  const query = search.trim().toLowerCase()
  const groups: Array<{ group: TokenGroup; label: string; entries: Array<{ name: string }> }> = []
  for (const group of GROUP_ORDER) {
    let entries = catalog.entries
      .filter(entry => entry.group === group)
      .map(entry => ({ name: entry.name }))
    if (query !== '') entries = entries.filter(e => e.name.toLowerCase().includes(query))
    if (entries.length === 0) continue
    groups.push({ group, label: groupLabel(group), entries })
  }

  const hasExpertEntries = catalog.entries.some(entry => entry.safety === 'expert')

  const toggleGroup = (key: string): void => {
    setCollapsed(prev => {
      const nextSet = new Set(prev)
      if (nextSet.has(key)) nextSet.delete(key)
      else nextSet.add(key)
      return nextSet
    })
  }

  return (
    <div data-up-editor style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="text"
          aria-label={t('token.nameAria')}
          value={session.presetName}
          // review P3（全量评审）：输入框直接限长（schema MAX_NAME_LENGTH=64）——
          // 原实现可超长输入、保存时才报错。
          maxLength={64}
          onChange={e => { applySession({ ...session, presetName: e.target.value }, []) }}
          style={{ flex: 1, fontSize: 14, fontWeight: 600, padding: '5px 8px', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)' }}
        />
        <button type="button" data-up-btn onClick={undo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.4 }}>{t('token.undo')}</button>
      </div>
      {/* M2-1 恢复：旋钮层在顶部（决策 E「旋钮优先」），原始令牌仍在下方高级区精调 */}
      <KnobEditor tokens={session.tokens} onKnobChange={applyKnobPatch} />
      {/* #56：手设封面（3:1 裁剪，匹配设置页卡片显示比例；不设 = 自动生成 SVG） */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--dsw-alias-border-l2)', paddingBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)' }}>{t('token.cover')}</span>
        <img
          data-up-cover-preview
          src={coverPreviewSrc}
          alt={t('token.coverPreviewAlt')}
          style={{ width: 96, height: 32, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)' }}
        />
        <select
          aria-label={t('token.coverAria')}
          value={session.cover?.assetId ?? ''}
          onChange={e => {
            const id = e.target.value
            if (id === '') {
              applySession({ ...session, cover: undefined }, [])
            } else {
              openCoverCrop(id)
            }
          }}
          style={{ fontSize: 11, padding: '2px 4px', borderRadius: 5, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-primary)' }}
        >
          <option value="">{t('token.coverAuto')}</option>
          {session.assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
        </select>
        <span data-up-status style={{ fontSize: 10 }}>{t('token.coverHint')}</span>
      </div>
      {/* M2-8：素材与部件（移出高级区——换壁纸是普通用户核心诉求，常驻可见） */}
      <div style={{ borderTop: '1px solid var(--dsw-alias-border-l2)', paddingTop: 8 }}>
        <WidgetEditor
          assets={session.assets}
          widgets={session.widgets}
          onAssetsChange={setAssets}
          onWidgetsChange={setWidgets}
          onAssetsAndWidgetsChange={setAssetsAndWidgets}
          // #103：删除素材分流——本预设 id（排除自身引用；新建草稿可能为 null → 全部视为"其他预设"）
          presetId={session.presetId ?? ''}
        />
      </div>
      {/* #74：分组染色面板（用户自建组——一次改色批量写入组内令牌） */}
      {session.groups.length > 0 && (
        <div data-up-groups style={{ borderTop: '1px solid var(--dsw-alias-border-l2)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)' }}>
            <span>{t('token.groups')}</span>
            <span style={{ fontWeight: 400, fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #999)' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="checkbox" checked={groupSchemeMode} onChange={e => { setGroupSchemeMode(e.target.checked) }} />
                {t('token.groupScheme')}
              </label>
            </span>
          </div>
          {session.groups.map(group => {
            const expanded = expandedGroups.has(group.id)
            const lightValue = session.tokens[group.tokenNames[0]]?.light ?? ''
            const darkValue = session.tokens[group.tokenNames[0]]?.dark ?? ''
            return (
              <div key={group.id} data-up-group style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8, padding: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    data-up-group-head
                    onClick={() => {
                      setExpandedGroups(prev => {
                        const next = new Set(prev)
                        if (next.has(group.id)) next.delete(group.id)
                        else next.add(group.id)
                        return next
                      })
                    }}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-primary)', padding: 0 }}
                  >
                    {expanded ? '▾' : '▸'} {group.name}
                    <span style={{ fontWeight: 400, fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #999)' }}>{t('token.groupTokens', { count: group.tokenNames.length })}</span>
                  </button>
                  <button
                    type="button"
                    data-up-group-del
                    onClick={() => { deleteGroup(group.id) }}
                    style={{ marginLeft: 'auto', fontSize: 10, border: 'none', background: 'transparent', color: 'var(--dsw-alias-state-error-primary, #d94c4c)', cursor: 'pointer' }}
                  >
                    {t('token.dissolve')}
                  </button>
                </div>
                {expanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4 }}>
                    <div style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #999)' }}>
                      {t('token.members')}{group.tokenNames.map(n => n.replace('--dsw-alias-', '').replace('--dsw-specific-', '')).join('、')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #999)' }}>{t('token.groupColor')}:</span>
                      {groupSchemeMode ? (
                        <>
                          <input
                            type="text" aria-label={`组亮色：${group.name}`} value={lightValue} spellCheck={false}
                            onChange={e => { setGroupColor(group, 'light', e.target.value) }}
                            style={{ width: 92, fontSize: 11, fontFamily: 'var(--ds-font-family-code)', padding: '3px 6px', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)' }}
                          />
                          <span style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #999)' }}>{t('token.light')}</span>
                          <input
                            type="text" aria-label={`组暗色：${group.name}`} value={darkValue} spellCheck={false}
                            onChange={e => { setGroupColor(group, 'dark', e.target.value) }}
                            style={{ width: 92, fontSize: 11, fontFamily: 'var(--ds-font-family-code)', padding: '3px 6px', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)' }}
                          />
                          <span style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #999)' }}>{t('token.dark')}</span>
                        </>
                      ) : (
                        <>
                          <input
                            type="text" aria-label={`组色：${group.name}`} value={lightValue} spellCheck={false}
                            onChange={e => { setGroupColor(group, 'both', e.target.value) }}
                            style={{ width: 92, fontSize: 11, fontFamily: 'var(--ds-font-family-code)', padding: '3px 6px', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)' }}
                          />
                          <span style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #999)' }}>{t('token.both')}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {/* 高级令牌区（原始令牌，默认折叠；搜索聚焦自动展开——review P3：搜索框移到
          折叠条件外，原实现搜索框在折叠区内不可聚焦，onFocus 永不触发（死逻辑）） */}
      <div data-up-advanced>
        <div
          data-up-advanced-head
          onClick={() => { setAdvancedOpen(prev => !prev) }}
          style={{ fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)', padding: '6px 0', borderTop: '1px solid var(--dsw-alias-border-l2)', cursor: 'pointer', userSelect: 'none' }}
        >
          <span>{advancedOpen ? '▾' : '▸'}</span> {t('token.advanced')}
          <span style={{ fontWeight: 400, color: 'var(--dsw-alias-label-tertiary, #999)' }}>{t('token.advancedCount', { count: catalog.entries.length })}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 6 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="search"
              aria-label={t('token.search')}
              placeholder={t('token.search')}
              value={search}
              onChange={e => { setSearch(e.target.value) }}
              onFocus={() => { setAdvancedOpen(true) }}
              style={{ flex: 1, minWidth: 140, fontSize: 12, padding: '5px 8px', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)' }}
            />
            {/* #74：分组模式——勾选多个令牌 → 新建组（一次改色批量写入） */}
            <button type="button" data-up-group-mode onClick={() => { setGroupMode(prev => !prev) }} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: groupMode ? '1px solid var(--dsw-alias-brand-primary)' : '1px solid var(--dsw-alias-border-l2)', background: groupMode ? 'var(--dsw-alias-bg-layer-2)' : 'transparent', color: 'var(--dsw-alias-label-primary)', cursor: 'pointer' }}>
              {groupMode ? t('token.groupModeOn') : t('token.groupMode')}
            </button>
            {groupMode && (
              <>
                <input
                  type="text"
                  aria-label={t('token.groupNameAria')}
                  placeholder={t('token.groupNamePlaceholder')}
                  value={groupName}
                  maxLength={24}
                  onChange={e => { setGroupName(e.target.value) }}
                  onKeyDown={e => { if (e.key === 'Enter') createGroup() }}
                  style={{ width: 120, fontSize: 11, padding: '3px 6px', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)' }}
                />
                <button type="button" data-up-group-create onClick={createGroup} disabled={checked.size === 0 || groupName.trim() === ''} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-primary)', cursor: 'pointer', opacity: checked.size === 0 || groupName.trim() === '' ? 0.4 : 1 }}>
                  {t('token.createGroup', { count: checked.size })}
                </button>
              </>
            )}
          </div>
          {advancedOpen && (
            // 修复轮 #30：内容随中栏整体滚动（原 overflow auto 与中栏滚动嵌套冲突）
            <>
            {groups.map(group => {
              const key = String(group.group)
              const isCollapsed = collapsed.has(key) && query === ''
              return (
                <section key={key} data-up-group>
                  <div
                    data-up-group-head
                    onClick={() => { toggleGroup(key) }}
                    style={{ fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)', padding: '4px 0', borderBottom: '1px solid var(--dsw-alias-border-l2)', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <span>{isCollapsed ? '▸' : '▾'}</span> {group.label}
                    <span style={{ fontWeight: 400, color: 'var(--dsw-alias-label-tertiary, #999)' }}> · {group.entries.length}{GROUP_DESCRIPTIONS[String(group.group)] !== undefined ? ` · ${GROUP_DESCRIPTIONS[String(group.group)]}` : ''}</span>
                  </div>
                  {!isCollapsed && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #999)' }}>
                        {groupMode && <span style={{ width: 18 }} />}
                        <span style={{ flex: 1 }}>{t('token.colToken')}</span>
                        <span style={{ width: 128 }}>{t('token.colLight')}</span>
                        <span style={{ width: 128 }}>{t('token.colDark')}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {group.entries.map(({ name }) => {
                          const entry = findToken(name)
                          const isExpert = entry?.safety === 'expert'
                          if (isExpert && !expandedExpert) return null
                          const existing = session.tokens[name]
                          const value = existing ?? { light: entry?.light ?? '', dark: entry?.dark ?? '' }
                          return (
                            <TokenRow
                              key={name}
                              name={name}
                              value={value}
                              safety={entry?.safety ?? 'safe'}
                              groupChecked={groupMode ? checked.has(name) : undefined}
                              onGroupToggle={toggleCheck}
                              onChange={(mode, v) => { setToken(name, mode, v) }}
                            />
                          )
                        })}
                      </div>
                    </>
                  )}
                </section>
              )
            })}
            {hasExpertEntries && !expandedExpert && (
              <button type="button" data-up-btn onClick={() => { setExpandedExpert(true) }} style={{ alignSelf: 'flex-start' }}>
                {t('token.expandExpert')}
              </button>
            )}
            </>
          )}
        </div>
      </div>
      {/* #74 反悔：CSS 补丁 / 原生主题注册两块人用入口恢复（schema 与引擎本就支持，
          此前只剩 AI 一条路）。默认折叠，不干扰普通用户。 */}
      <CssPatchPanel css={session.css} onChange={setCss} />
      <ThemeRegisterPanel
        theme={session.theme}
        presetId={session.presetId}
        tokenCount={Object.keys(session.tokens).length}
        onChange={setTheme}
      />
      {/* #56：封面裁剪对话框（3:1；确认 = cover 参数写入，不落库） */}
      {coverCrop !== null && (
        <CropDialog
          request={coverCrop}
          onConfirm={crop => { handleCoverCropConfirm(crop) }}
          onCancel={() => { setCoverCrop(null) }}
        />
      )}
    </div>
  )
}

function groupLabel(group: TokenGroup): string {
  const labels: Record<string, string> = {
    'alias-bg': '背景', 'alias-border': '边框', 'alias-brand': '品牌', 'alias-label': '文字',
    'alias-button': '按钮', 'alias-interactive': '交互态', 'alias-state': '状态', 'alias-markdown': 'Markdown',
    'alias-scrollbar': '滚动条（alias）', 'alias-overlay': '浮层', specific: '组件专属', static: '静态色板（谨慎）',
    font: '字体', shadow: '阴影', gradient: '渐变', shiki: '代码高亮', scrollbar: '滚动条', other: '其他',
  }
  return labels[group] ?? String(group)
}
