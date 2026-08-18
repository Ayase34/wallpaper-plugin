/**
 * 预设应用引擎：活动层 / 草稿层的 disposer 链 + 损坏自动回退。
 * 设计（§2.2/§2.3/§8）：
 * - 应用 = 编译预设 → 逐产物挂载（tokens → overrideTokens；css → <style data-plugin>；theme → register）
 * - 每次应用返回 disposer；活动层与草稿层各持一条链
 * - 损坏回退：应用新预设任一步抛错 → 自动还原上一个成功活动预设
 * - 引擎不直接依赖 DSH：主题/样式注入经 ThemeAdapter 注入（可单测，fake adapter）
 * 浏览器 half 使用；Node half 的 preset_apply 工具经 settings 文档驱动浏览器订阅生效（单一事实源）。
 */

import type { Preset, TokenOverride, CssRule, ThemeDef } from './schema.ts'
import { checkDshCompatibility, cssRulesToText } from './schema.ts'
import { widgetsToCss } from './widgets.ts'

/** 主题适配器：引擎对 DSH 主题面的唯一依赖（浏览器 half 注入 ctx.theme 实现）。 */
export interface ThemeAdapter {
  /** 叠加令牌层，返回 disposer。 */
  overrideTokens(source: string, tokens: Record<string, TokenOverride>): () => void
  /** 注册可选主题（M2 高级区），返回 disposer；缺省 = 无该能力。 */
  register?(definition: { id: string; colorScheme: 'light' | 'dark'; tokens: Record<string, string> }): () => void
  /** 当前明暗（编译快照扁平化用）；缺省 = light。 */
  getScheme?(): 'light' | 'dark'
}

/** 样式注入适配器（浏览器 half 注入 DOM 实现；测试注入记录器）。 */
export interface StyleAdapter {
  /** 注入 CSS 补丁，返回 disposer。 */
  injectCss(source: string, cssText: string): () => void
}

/** 引擎对外状态（快照，供 UI 订阅）。 */
export interface EngineState {
  /** 已保存的活动预设 id（null = 无活动预设）。 */
  activePresetId: string | null
  /** 是否有未保存草稿。 */
  hasDraft: boolean
  /** 草稿预设 id（hasDraft=true 时有值）。 */
  draftPresetId: string | null
  /** 最近一次应用失败信息（损坏回退触发时设置）。 */
  lastError: string | null
  /** 单调修订号（UI 以此判断状态变化）。 */
  revision: number
}

export interface EngineOptions {
  theme: ThemeAdapter
  style?: StyleAdapter
  /** 当前 DSH 版本（版本契约检查用；缺省跳过）。 */
  currentDshVersion?: string
  onStateChange?: (state: EngineState) => void
}

/** 编辑会话快照（编辑器取数：改前/改后对比、undo/redo 基线）。
 * 存双值令牌（明暗两套），预览组件自行按目标明暗展平——明暗切换无需重新取数。 */
export interface CompiledSnapshot {
  /** 该层完整双值令牌。 */
  tokens: Record<string, TokenOverride>
  /** 是否携带 css 补丁。 */
  hasCss: boolean
}

/** 编译产物：预设 → 引擎可挂载的单元清单。 */
export interface CompiledPreset {
  preset: Preset
  tokens: Record<string, TokenOverride>
  css?: { source: string; text: string }
  theme?: { id: string; colorScheme: 'light' | 'dark'; tokens: Record<string, string> }
}

/** 把令牌对象转成单值（注册主题用：取当前明暗）。 */
function flattenTokens(tokens: Record<string, TokenOverride>, scheme: 'light' | 'dark'): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(tokens)) out[k] = v[scheme]
  return out
}

/** review P3（全量评审）：规范化 JSON 序列化（递归键排序）——用于基线比较，
 * 消除对象键序差异导致的伪差异（theme 基线）。 */
function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const keys = Object.keys(record).sort()
    return `{${keys.map(k => `${JSON.stringify(k)}:${canonicalJson(record[k])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

/** 逐键比较两套令牌（键集合 + 每项 light/dark 双值；P1-2 修复：完整比较判定"无差异"短路）。 */
function tokensEqual(a: Record<string, TokenOverride>, b: Record<string, TokenOverride>): boolean {
  const keysA = Object.keys(a)
  if (keysA.length !== Object.keys(b).length) return false
  for (const key of keysA) {
    const va = a[key]
    const vb = b[key]
    if (vb === undefined || va.light !== vb.light || va.dark !== vb.dark) return false
  }
  return true
}

/**
 * 编译预设为挂载单元清单。
 * @param preset - 已校验预设。
 * @param colorScheme - 当前明暗（主题注册时确定色板）。
 * @returns 编译产物。
 */
export function compilePreset(preset: Preset, colorScheme: 'light' | 'dark' = 'light'): CompiledPreset {
  const compiled: CompiledPreset = { preset, tokens: { ...preset.tokens } }
  const extra = preset.extra
  // css 补丁（M2-2：一等公民 preset.css；兼容旧预设 extra.css 透传形态）
  const cssRules: CssRule[] | undefined = preset.css
    ?? (Array.isArray(extra?.css) ? (extra.css as CssRule[]) : undefined)
  // 部件注入 CSS（M2-6：引擎生成，安全；缺素材的部件产出空串）
  const widgetText = widgetsToCss(preset.widgets, preset.assets ?? [])
  if (cssRules !== undefined || widgetText !== '') {
    // cssRulesToText 已做选择器白名单 + 花括号双重过滤（防块逃逸注入）。
    const cssText = [cssRules !== undefined ? cssRulesToText(cssRules) : '', widgetText].filter(t => t !== '').join('\n')
    if (cssText !== '') compiled.css = { source: `ui-presets:${preset.id}`, text: cssText }
  }
  // theme 注册（M2-4：一等公民 preset.theme；兼容旧 extra.theme 透传形态）
  const themeDef: ThemeDef | undefined = preset.theme
    ?? (extra?.theme as ThemeDef | undefined)
  if (themeDef !== undefined
    && typeof themeDef.id === 'string'
    && (themeDef.colorScheme === 'light' || themeDef.colorScheme === 'dark')
    && typeof themeDef.tokens === 'object'
    && themeDef.tokens !== null) {
    compiled.theme = {
      id: themeDef.id,
      colorScheme: themeDef.colorScheme,
      tokens: flattenTokens(themeDef.tokens as Record<string, TokenOverride>, themeDef.colorScheme),
    }
  }
  return compiled
}

/**
 * 应用引擎。生命周期：构造 → （applyPreset / startDraft / updateDraft / discardDraft /
 * saveDraftAsActive / revertToLastActive）→ dispose。
 * 线程模型：同步（overrideTokens 是同步的）；调用方负责防抖。
 */
export class PresetEngine {
  private readonly theme: ThemeAdapter
  private readonly style: StyleAdapter | undefined
  private readonly currentDshVersion: string | undefined
  private readonly onStateChange: ((state: EngineState) => void) | undefined

  private state: EngineState = {
    activePresetId: null, hasDraft: false, draftPresetId: null, lastError: null, revision: 0,
  }
  /** 活动层 disposer 链（应用新预设前先收旧链）。 */
  private activeDisposers: Array<() => void> = []
  /** 草稿层 disposer 链。 */
  private draftDisposers: Array<() => void> = []
  /** 上一个成功活动预设 id（损坏回退目标）。 */
  private lastGoodPresetId: string | null = null
  /** 活动层编译快照（M1 预览取数：改前基线）。 */
  private activeCompiled: CompiledSnapshot = { tokens: {}, hasCss: false }
  /** 草稿层编译快照（M1 预览取数：改后）。 */
  private draftCompiled: CompiledSnapshot | null = null
  /** 草稿层当前完整令牌基线（patchDraft 差分合并用）。 */
  private draftTokenBaseline: Record<string, TokenOverride> = {}
  /** 草稿层 css 注入文本基线（M2-2：css 变更也触发重挂）。 */
  private draftCssBaseline = ''
  /** 活动层 css 注入文本基线（#52b：controller 动态裁剪渲染取数——解析裁剪标记）。 */
  private activeCssBaseline = ''
  /** 草稿层主题注册基线（M2-4：主题开关/色板变更也触发重挂——短路径只比 tokens+css 会吞掉主题变更）。 */
  private draftThemeBaseline = ''
  /** 主题注册引用计数（M2-4：草稿重挂 teardown 旧链会注销——引用计数保证
   * 只要还有挂载链引用该主题就不注销；计数归零才真正注销）。 */
  private themeRefCounts = new Map<string, { count: number; disposer: () => void; definition: { id: string; colorScheme: 'light' | 'dark'; tokens: Record<string, string> } }>()

  /** 最近一次 state 快照的稳定引用（review P3：getState 返回缓存引用——useSyncExternalStore
   * 用 Object.is 比较，每次渲染新对象会触发无限重渲染（React #185）；同时防外部直接改内部对象）。 */
  private stateSnapshot: EngineState = {
    activePresetId: null, hasDraft: false, draftPresetId: null, lastError: null, revision: 0,
  }

  constructor(options: EngineOptions) {
    this.theme = options.theme
    this.style = options.style
    this.currentDshVersion = options.currentDshVersion
    this.onStateChange = options.onStateChange
  }

  getState(): EngineState {
    return this.stateSnapshot
  }

  /** 活动层编译快照（M1 预览"改前"基线；无活动预设 = 空快照）。 */
  getActiveCompiled(): CompiledSnapshot {
    return this.activeCompiled
  }

  /** 外部报告错误（controller 落盘失败等非挂载类错误 → 状态条可见）。 */
  reportError(message: string | null): void {
    this.setState({ lastError: message })
  }

  /** 当前生效的 css 注入文本（草稿优先——编辑中即取草稿层；#52b 裁剪标记解析用）。 */
  getCurrentCssText(): string {
    return this.state.hasDraft ? this.draftCssBaseline : this.activeCssBaseline
  }

  /** 草稿层编译快照（M1 预览"改后"；无草稿 = null）。 */
  getDraftCompiled(): CompiledSnapshot | null {
    return this.draftCompiled
  }

  /**
   * 草稿更新（连接性评审 P1-2 修复后的语义）：
   * 调用方传入完整编辑态（preset.tokens 为权威目标）；引擎与基线**逐键比较**——
   * 无差异（含改名/无实质变更）→ 不重挂（短路，性能保障）；
   * 有差异（含**令牌被移除**——撤销到空令牌）→ 以目标全量重挂并更新快照，
   * 修复"空 patch 提前返回导致残留令牌泄漏到主题层/快照"的缺陷。
   * 无草稿时等价于 startDraft。
   * @param preset - 完整预设（编辑态权威）。
   * @returns 是否成功。
   */
  patchDraft(preset: Preset): boolean {
    if (!this.state.hasDraft) return this.startDraft(preset)
    try {
      const error = this.checkCompatibility(preset)
      if (error !== null) throw new Error(error)
      const compiled = compilePreset(preset)
      const target: Record<string, TokenOverride> = { ...preset.tokens }
      const cssText = compiled.css?.text ?? ''
      // review P3（全量评审）：theme 基线用规范化序列化（键排序）——JSON.stringify 对
      // 键序敏感，同一主题仅因对象键序不同（如 AI 工具重写）即触发伪重挂。
      const themeText = compiled.theme !== undefined ? canonicalJson(compiled.theme) : ''
      // 完整比较（令牌 + css + theme，M2-4）：无差异 → 短路（不重挂、不发状态）；
      // 但 id 可能不同（改名/保存同步）——必须同步 draftPresetId（P1-1 实测二级缺陷）。
      if (tokensEqual(this.draftTokenBaseline, target) && cssText === this.draftCssBaseline && themeText === this.draftThemeBaseline) {
        if (this.state.draftPresetId !== preset.id) {
          this.setState({ draftPresetId: preset.id })
        }
        return true
      }
      // 统一挂载（tokens + css + theme）——css/主题变更/移除也正确重挂（M2-2/4 修复：
      // 旧实现只 overrideTokens，令牌编辑会把草稿 css/主题层丢掉）。
      const disposers = this.mount(compiled)
      this.teardown(this.draftDisposers)
      this.draftDisposers = disposers
      this.draftTokenBaseline = target
      this.draftCssBaseline = cssText
      this.draftThemeBaseline = themeText
      this.draftCompiled = { tokens: target, hasCss: compiled.css !== undefined }
      this.setState({ hasDraft: true, draftPresetId: preset.id, lastError: null })
      return true
    } catch (error) {
      this.setState({ lastError: messageOf(error) })
      return false
    }
  }

  /**
   * 应用预设为活动预设（停用旧活动层）。任一步失败 → 自动还原旧层（损坏回退）。
   * @param preset - 已校验预设。
   * @returns true 成功；false 失败（lastError 已设置，已回退）。
   */
  applyPreset(preset: Preset): boolean {
    const oldDisposers = this.activeDisposers
    const oldId = this.state.activePresetId
    try {
      const error = this.checkCompatibility(preset)
      if (error !== null) throw new Error(error)
      const compiled = compilePreset(preset)
      const disposers = this.mount(compiled)
      this.teardown(oldDisposers)
      this.activeDisposers = disposers
      this.activeCompiled = this.snapshotOf(compiled)
      this.activeCssBaseline = compiled.css?.text ?? ''
      this.lastGoodPresetId = preset.id
      this.setState({ activePresetId: preset.id, lastError: null })
      return true
    } catch (error) {
      // 损坏回退：旧活动层保持原样（mount 失败时已自清理新层的部分挂载），仅记录错误。
      this.setState({ activePresetId: oldId, lastError: messageOf(error) })
      return false
    }
  }

  /**
   * 还原到上一个成功活动预设（失败恢复语义）。
   * @returns true 当且仅当状态被实际改变；false（无目标/已是最新好状态）并清除 lastError。
   */
  revertToLastActive(): boolean {
    // clearActive 后 lastGoodPresetId 已被 dispose 清空（评审 P1-3），
    // 损坏回退保证 active 恒等于 lastGood——此方法在正常流程下为 no-op 防御。
    if (this.lastGoodPresetId === null
      || this.activeDisposers.length === 0
      || this.state.activePresetId === this.lastGoodPresetId) {
      this.setState({ lastError: null })
      return false
    }
    this.setState({ activePresetId: this.lastGoodPresetId, lastError: null })
    return true
  }

  /** 挂草稿层（与活动层并存，草稿优先可见）。替换旧草稿；新草稿失败时旧草稿保留（P1 修复）。 */
  startDraft(preset: Preset): boolean {
    const oldDraftDisposers = this.draftDisposers
    try {
      const error = this.checkCompatibility(preset)
      if (error !== null) throw new Error(error)
      const compiled = compilePreset(preset)
      const disposers = this.mount(compiled)
      this.teardown(oldDraftDisposers)
      this.draftDisposers = disposers
      this.draftTokenBaseline = { ...preset.tokens }
      this.draftCssBaseline = compiled.css?.text ?? ''
      // #96（审计）：基线统一用规范化序列化（与 patchDraft 一致）——JSON.stringify 对
      // 键序敏感，startDraft 后首次 patchDraft 键序不同会触发一次伪重挂（仅性能影响）
      this.draftThemeBaseline = compiled.theme !== undefined ? canonicalJson(compiled.theme) : ''
      this.draftCompiled = this.snapshotOf(compiled)
      this.setState({ hasDraft: true, draftPresetId: preset.id, lastError: null })
      return true
    } catch (error) {
      // mount 失败已自清理新层部分挂载；旧草稿链保留。
      this.setState({ hasDraft: oldDraftDisposers.length > 0, draftPresetId: this.state.draftPresetId, lastError: messageOf(error) })
      return false
    }
  }

  /** 替换草稿层内容（编辑中防抖调用）。 */
  updateDraft(preset: Preset): boolean {
    return this.startDraft(preset)
  }

  /** 放弃草稿：移除草稿层，恢复活动层可见（无草稿时不发状态）。 */
  discardDraft(): void {
    if (!this.state.hasDraft) return
    this.teardown(this.draftDisposers)
    this.draftDisposers = []
    this.draftTokenBaseline = {}
    this.draftCssBaseline = ''
    this.draftThemeBaseline = ''
    this.draftCompiled = null
    this.setState({ hasDraft: false, draftPresetId: null })
  }

  /** 保存草稿为活动预设（草稿层直接提升为活动层；无草稿时 no-op）。 */
  saveDraftAsActive(): boolean {
    if (!this.state.hasDraft || this.state.draftPresetId === null) return false
    this.teardown(this.activeDisposers)
    this.activeDisposers = this.draftDisposers
    this.draftDisposers = []
    const id = this.state.draftPresetId
    this.lastGoodPresetId = id
    this.activeCompiled = this.draftCompiled ?? { tokens: {}, hasCss: false }
    this.activeCssBaseline = this.draftCssBaseline
    this.draftTokenBaseline = {}
    this.draftCssBaseline = ''
    this.draftThemeBaseline = ''
    this.draftCompiled = null
    this.setState({ hasDraft: false, draftPresetId: null, activePresetId: id, lastError: null })
    return true
  }

  /** 释放全部层（插件卸载/还原默认时调用）。 */
  dispose(): void {
    this.teardown(this.activeDisposers)
    this.teardown(this.draftDisposers)
    this.activeDisposers = []
    this.draftDisposers = []
    this.themeRefCounts.clear()
    // P1 修复：清空 lastGood——否则 clearActive 后 revertToLastActive 会谎报成功。
    this.lastGoodPresetId = null
    this.activeCompiled = { tokens: {}, hasCss: false }
    this.activeCssBaseline = ''
    this.draftTokenBaseline = {}
    this.draftCompiled = null
    this.setState({ activePresetId: null, hasDraft: false, draftPresetId: null, lastError: null })
  }

  // ---- 内部 ----

  private checkCompatibility(preset: Preset): string | null {
    if (this.currentDshVersion === undefined) return null
    return checkDshCompatibility(preset, this.currentDshVersion)
  }

  /** 快照构建：编译产物 → 双值令牌快照。 */
  private snapshotOf(compiled: CompiledPreset): CompiledSnapshot {
    return {
      tokens: { ...compiled.tokens },
      hasCss: compiled.css !== undefined,
    }
  }

  /** 挂载编译产物，返回 disposer 链；任一步失败 → 自清理已挂载部分后重抛（调用方回退）。 */
  private mount(compiled: CompiledPreset): Array<() => void> {
    const disposers: Array<() => void> = []
    try {
      disposers.push(this.theme.overrideTokens(`ui-presets:${compiled.preset.id}`, compiled.tokens))
      if (compiled.css !== undefined && this.style !== undefined) {
        disposers.push(this.style.injectCss(compiled.css.source, compiled.css.text))
      }
      if (compiled.theme !== undefined) {
        // M2-4：幂等注册——草稿重挂不重复注册（宿主注册表重复 id 抛错）；同 id 复用首次 disposer。
        disposers.push(this.registerThemeOnce(compiled.theme))
      }
      return disposers
    } catch (error) {
      for (let i = disposers.length - 1; i >= 0; i -= 1) {
        try { disposers[i]() } catch { /* 清理失败不阻塞 */ }
      }
      throw error
    }
  }

  /** 主题注册（引用计数幂等）：同一 id 多次挂载只注册一次，逐链递减，
   * 计数归零才真正注销（草稿重挂/活动+草稿并存均安全）。
   * #96（审计）：同 id **内容变化**时必须重注册——此前只计数不重注册，编辑主题令牌/明暗后
   * 切换该主题拿到的是首次注册的旧定义（功能静默失效）；计数语义保持不变。 */
  private registerThemeOnce(definition: { id: string; colorScheme: 'light' | 'dark'; tokens: Record<string, string> }): () => void {
    if (this.theme.register === undefined) return () => {}
    const existing = this.themeRefCounts.get(definition.id)
    if (existing !== undefined) {
      if (existing.definition.colorScheme === definition.colorScheme && canonicalJson(existing.definition.tokens) === canonicalJson(definition.tokens)) {
        existing.count += 1
      } else {
        // 内容变化：注销旧注册、以新定义重注册（宿主注册表按 id 覆盖）
        try { existing.disposer() } catch { /* 忽略 */ }
        const disposer = this.theme.register(definition)
        this.themeRefCounts.set(definition.id, { count: 1, disposer, definition })
      }
    } else {
      const disposer = this.theme.register(definition)
      this.themeRefCounts.set(definition.id, { count: 1, disposer, definition })
    }
    let released = false
    return () => {
      if (released) return
      released = true
      const current = this.themeRefCounts.get(definition.id)
      if (current === undefined) return
      current.count -= 1
      if (current.count <= 0) {
        this.themeRefCounts.delete(definition.id)
        try { current.disposer() } catch { /* 注销失败不阻塞 */ }
      }
    }
  }

  private teardown(disposers: Array<() => void>): void {
    for (let i = disposers.length - 1; i >= 0; i -= 1) {
      try { disposers[i]() } catch { /* 还原失败不阻塞其余 */ }
    }
  }

  private setState(patch: Partial<EngineState>): void {
    this.state = { ...this.state, ...patch, revision: this.state.revision + 1 }
    // review P3：更新稳定快照引用（getState 消费方以此做引用比较）。
    this.stateSnapshot = this.state
    // P0 修复：监听器错误隔离——onStateChange 抛错不得破坏引擎不变量
    // （否则 applyPreset 的零抛错契约被第三方监听器击穿，错误逃逸为 unhandled rejection）。
    try {
      this.onStateChange?.(this.state)
    } catch (error) {
      console.error('[ui-presets] engine state listener threw:', error)
    }
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
