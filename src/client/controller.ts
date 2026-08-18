/**
 * 预设控制器：引擎 + 活动预设持久化（Node half 文件路由）+ 预设库加载的单一事实源。
 * 持久化架构：settings 文档对第三方插件不可用（host apiproxy namespace 白名单，
 * settings-not-exposed）——活动预设 id 经 /ui-presets/active（Node half 写
 * <dshHome>/data/ui-presets/active.json），AI 工具（Node half）与浏览器共用同一事实源。
 * 跨窗口实时同步（storage 事件/轮询）列为后置项（M0 桌面端单窗口无此需求）。
 */
import { PresetEngine } from '../core/engine.ts'
import { validatePreset } from '../core/schema.ts'
import type { Preset } from '../core/schema.ts'
import { CURRENT_DSH_VERSION } from '../core/version.ts'
import { listPresetSources } from '../core/preset-source.ts'
import { MAX_ASSET_FILE_SIZE, WIDGET_TARGET_SELECTOR, WIDGET_WASH_TOKEN } from '../core/widgets.ts'
import {
  WIDGET_CROP_RATIOS,
  cropFrameSize,
  cropElementStyle,
  layeredElementStyle,
  parseCropMarkers,
  sidebarPosterFitFor,
  type CropMarkerInfo,
} from '../core/crop.ts'
import { DEMO_PRESETS } from './demo.ts'

/** 主题面（ctx.theme，ui-theme 提供）。 */
export interface ThemeLike {
  overrideTokens(source: string, tokens: Record<string, { light: string; dark: string }>): () => void
  register?(definition: { id: string; colorScheme: 'light' | 'dark'; tokens: Record<string, string> }): () => void
  /** M2-4 选择入口：切换活动主题（未知 id 抛错——调用方守卫）。 */
  setTheme?(id: string): void
  /** 当前主题快照（活动 id + 已注册清单）。 */
  getTheme?(): { active?: { id: string }; themes?: Array<{ id: string }> }
}

/** 样式注入（DOM 实现）。 */
function createStyleAdapter() {
  return {
    injectCss(_source: string, cssText: string): () => void {
      const styleEl = document.createElement('style')
      styleEl.setAttribute('data-plugin', 'ui-presets')
      styleEl.setAttribute('data-up-patch', '')
      styleEl.textContent = cssText
      document.head.append(styleEl)
      return () => { styleEl.remove() }
    },
  }
}

export class PresetsController {
  readonly engine: PresetEngine
  private readonly stateListeners = new Set<() => void>()
  private memoryActiveId: string | null = null
  private readonly currentDshVersion: string
  /** 用户主动操作标记：启动期 adoptPersisted 完成时若用户已操作则不覆盖（竞态修复）。 */
  private userInteracted = false
  /** AI bridge（M2-3）：active.json revision 轮询定时器（setTimeout 链式）；lastSeen 防自写回环。 */
  private aiBridgeTimer: ReturnType<typeof setTimeout> | null = null
  private lastSeenRevision = -1
  /** 原始主题服务引用（selectTheme/getThemeInfo 用）。 */
  private readonly rawTheme: ThemeLike | undefined
  /** M5-2 跨窗口同步：BroadcastChannel 即时广播（环境不支持 → null，降级为仅轮询桥）。 */
  private readonly syncChannel: BroadcastChannel | null
  /** 库变更监听器（预设墙跨窗口刷新）。 */
  private readonly libraryListeners = new Set<() => void>()
  /** #52b 动态裁剪渲染：已应用内联样式的目标元素 → 其浅/深标记信息（ResizeObserver 重算用）。 */
  private readonly cropStyleElements = new Map<Element, { light?: CropMarkerInfo; dark?: CropMarkerInfo }>()
  private readonly cropResizeObservers = new Map<Element, ResizeObserver>()
  /** #55：body 明暗属性监听（应用切换浅色/深色主题 → 壁纸即时切换）。 */
  private schemeObserver: MutationObserver | null = null
  /** #77（用户 bug）：目标元素出现/替换监听——会话切换重挂载滚动容器后裁剪壁纸
   * 内联样式丢失且无重同步（原只监听引擎状态变化与明暗切换）→ body childList 观察 +
   * rAF 去抖重同步，元素换新后自动恢复。 */
  private cropDomObserver: MutationObserver | null = null
  private cropResyncScheduled = false
  /** #90 分层合成壁纸：素材 id → layers 规格（null = 已查非分层；undefined = 未查）。
   * controller 渲染裁剪标记时据此把单图样式升级为"静态底 + 原生动图"多背景。 */
  private readonly layersMeta = new Map<string, { animAssetId: string; x: number; y: number; w: number; h: number } | null>()
  private layersMetaFetching = false

  constructor(ctx: { get?<T>(name: string): T | undefined }) {
    const theme = ctx.get<ThemeLike>('theme')
    this.rawTheme = theme
    this.currentDshVersion = CURRENT_DSH_VERSION
    this.engine = new PresetEngine({
      theme: {
        overrideTokens: (source, tokens) => {
          if (theme === undefined) throw new Error('theme 服务不可用')
          return theme.overrideTokens(source, tokens)
        },
        ...(theme?.register !== undefined
          ? { register: (d: { id: string; colorScheme: 'light' | 'dark'; tokens: Record<string, string> }) => theme.register(d) }
          : {}),
      },
      style: createStyleAdapter(),
      currentDshVersion: this.currentDshVersion,
      onStateChange: () => {
        // #52b：任何引擎状态变化（应用/草稿编辑/撤销/还原）→ 重算裁剪内联样式。
        this.syncCropWidgets()
        for (const listener of this.stateListeners) listener()
      },
    })
    // M5-2：BroadcastChannel 初始化 + 接收广播（活动预设即时应用 / 库变更刷新）。
    // 自写回环防护：revision 单调检查 + id 与引擎一致即跳过（与 AI bridge 同款）。
    let channel: BroadcastChannel | null = null
    try {
      if (typeof BroadcastChannel !== 'undefined') channel = new BroadcastChannel('ui-presets-sync')
    } catch { channel = null }
    this.syncChannel = channel
    channel?.addEventListener('message', (event: MessageEvent) => {
      const data = event.data as { type?: string; activePresetId?: unknown; revision?: unknown } | null
      if (data?.type !== 'active' || typeof data.activePresetId !== 'string' || !Number.isInteger(data.revision)) return
      if ((data.revision as number) <= this.lastSeenRevision) return
      this.lastSeenRevision = data.revision as number
      // #63 P0-1：id 相同也重应用（其他窗口/本窗口对同一活动预设做了内容更新→即时同步）；
      // applyPresetById 内部对"已活动预设"跳过重复持久化（防广播回环）。
      void this.applyPresetById(data.activePresetId)
    })
    channel?.addEventListener('message', (event: MessageEvent) => {
      const data = event.data as { type?: string } | null
      if (data?.type === 'library') {
        for (const listener of this.libraryListeners) listener()
      }
    })
  }

  /** 广播活动预设变更（浏览器侧 apply/clear 后即时通知其他窗口）。 */
  private broadcastActive(id: string | null): void {
    this.syncChannel?.postMessage({ type: 'active', activePresetId: id, revision: this.lastSeenRevision + 1 })
  }

  /** 广播库变更（新建/保存/删除/导入后通知刷新预设墙）。
   * #56：BroadcastChannel 不向**本窗口**回传（规范：仅送达其他同源上下文）——
   * 同窗口工作室保存后设置页墙不刷新（改名不反映）——补本地监听器直通。 */
  private broadcastLibrary(): void {
    this.syncChannel?.postMessage({ type: 'library' })
    for (const listener of this.libraryListeners) listener()
  }

  /** 引擎状态快照（UI 渲染数据源）。 */
  getState(): ReturnType<PresetEngine['getState']> {
    return this.engine.getState()
  }

  /** 订阅引擎状态变化（UI 重渲染驱动）。 */
  subscribeState(listener: () => void): () => void {
    this.stateListeners.add(listener)
    return () => { this.stateListeners.delete(listener) }
  }

  /** 订阅库变更（M5-2：预设墙跨窗口刷新）。 */
  subscribeLibrary(listener: () => void): () => void {
    this.libraryListeners.add(listener)
    return () => { this.libraryListeners.delete(listener) }
  }

  /** 关闭跨窗口广播通道（node 环境下 BroadcastChannel 实例会保持事件循环活跃——
   * 测试/卸载时调用；浏览器端随插件生命周期 dispose 即可）。 */
  closeSyncChannel(): void {
    try { this.syncChannel?.close() } catch { /* 关闭失败无碍 */ }
  }

  /** #96：卸载清理（观察器/通道断开——防旧实例残留驱动已 dispose 的引擎与新实例互踩）。 */
  dispose(): void {
    try { this.schemeObserver?.disconnect() } catch { /* 忽略 */ }
    this.schemeObserver = null
    try { this.cropDomObserver?.disconnect() } catch { /* 忽略 */ }
    this.cropDomObserver = null
    for (const observer of this.cropResizeObservers.values()) {
      try { observer.disconnect() } catch { /* 忽略 */ }
    }
    this.cropResizeObservers.clear()
    this.cropStyleElements.clear()
    this.closeSyncChannel()
  }


  /** 读取持久化的活动预设（Node half 文件；含 revision——AI bridge 变更检测）。 */
  private async fetchPersistedState(): Promise<{ activePresetId: string | null; revision: number }> {
    try {
      const res = await fetch('/ui-presets/active', { headers: { accept: 'application/json' } })
      if (!res.ok) return { activePresetId: this.memoryActiveId, revision: this.lastSeenRevision }
      const body = (await res.json()) as { activePresetId?: unknown; revision?: unknown }
      return {
        activePresetId: typeof body.activePresetId === 'string' ? body.activePresetId : null,
        revision: Number.isInteger(body.revision) && (body.revision as number) >= 0 ? body.revision as number : 0,
      }
    } catch { return { activePresetId: this.memoryActiveId, revision: this.lastSeenRevision } }
  }

  async fetchPersistedId(): Promise<string | null> {
    const state = await this.fetchPersistedState()
    if (state.revision > this.lastSeenRevision) this.lastSeenRevision = state.revision
    return state.activePresetId
  }

  /** AI bridge（M2-3/8）：轮询 active.json revision——Node half 的 preset_apply/revert 经此在浏览器即时生效。
   * 自写回环防护：轮询触发的应用会再 PUT（revision+1），但 id 与引擎一致 → 跳过；
   * M2-8 修复：id 为 null（preset_revert 还原默认）→ 清除活动外观。
   * review P2-7（全量评审）：页面隐藏时暂停轮询（document.visibilitychange），
   * 连续失败指数退避（1s→2s→4s→8s 上限，成功恢复 1s）——空闲不浪费、异常不刷屏。 */
  startAiBridge(): void {
    if (this.aiBridgeTimer !== null) return
    const poll = (): void => {
      void this.fetchPersistedState().then(
        state => {
          this.pollFailCount = 0
          this.scheduleAiBridge(1000)
          // review P3（全量评审）：revision 倒退（active.json 损坏被归零重建）→ 重置 lastSeen，
          // 避免桥永久失明（原实现 lastSeen 高水位 > 归零序列，外部 AI 变更不再到达浏览器）。
          if (state.revision < this.lastSeenRevision && this.lastSeenRevision > 0) {
            this.lastSeenRevision = state.revision
          }
          if (state.revision <= this.lastSeenRevision) return
          this.lastSeenRevision = state.revision
          const current = this.engine.getState().activePresetId
          if (state.activePresetId === null) {
            // preset_revert：外部还原默认 → 清除活动外观（引擎已无活动时跳过）
            if (current !== null) this.clearActive()
            return
          }
          // #63 P0-1：**id 相同也要重应用**——preset_update 更新活动预设内容后 revision 变化
          // 但 id 不变；applyPresetById 内部对"已活动预设"跳过重复持久化（防自激循环）。
          void this.applyPresetById(state.activePresetId)
        },
        () => {
          this.pollFailCount = Math.min(this.pollFailCount + 1, 3)
          this.scheduleAiBridge(1000 * 2 ** this.pollFailCount)
        },
      )
    }
    this.scheduleAiBridge = (delay: number) => {
      if (this.aiBridgeTimer !== null) clearTimeout(this.aiBridgeTimer)
      this.aiBridgeTimer = window.setTimeout(() => {
        this.aiBridgeTimer = null
        // review P2-7：页面隐藏时跳过本轮（重排下一轮，不空转）
        if (document.hidden) {
          this.scheduleAiBridge(1000)
          return
        }
        poll()
      }, delay)
    }
    this.scheduleAiBridge(1000)
  }

  /** 轮询失败计数（指数退避用）。 */
  private pollFailCount = 0
  /** 轮询定时器句柄（setTimeout 链式——review P2-7 替代 setInterval 防重入）。 */
  private scheduleAiBridge: (delay: number) => void = () => {}

  stopAiBridge(): void {
    if (this.aiBridgeTimer !== null) {
      clearTimeout(this.aiBridgeTimer)
      this.aiBridgeTimer = null
    }
  }

  private persistActiveId(id: string | null): void {
    this.memoryActiveId = id
    // M5-2：跨窗口即时广播（其他窗口立即应用，不等 1s 轮询桥）。
    this.broadcastActive(id)
    void fetch('/ui-presets/active', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ activePresetId: id }),
    }).catch(() => {
      // 评审 P2-4：持久化失败不得静默——提示"已应用但未持久化（重启后可能恢复旧预设）"。
      this.engine.reportError('活动预设已应用，但持久化失败（重启后可能恢复为之前的预设）')
    })
  }

  /** review P3（全量评审）：fetchTier/saveTier 已删除——决策 #43 移除对外档位切换后无调用方
   * （死代码；/ui-presets/config 路由保留兼容，不再作为 UI 档位事实源）。 */

  /** 按 id 取预设：本地库 → 内置 demo → 已注册源（评审 P2-2 查序修复：
   * 用户自建同名预设优先，demo 仅兜底；M2-7 源回退最后——异常逐源隔离）。
   * review P2-1（全量评审）：区分「损坏」（GET 200 但校验失败）——reportError 提示，
   * 不再静默落到 demo 让用户以为"不存在"。 */
  async loadPreset(id: string): Promise<Preset | null> {
    try {
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(id)}`, { headers: { accept: 'application/json' } })
      if (res.ok) {
        const body = (await res.json()) as { preset?: unknown }
        const result = validatePreset(body.preset)
        if (result.ok) return result.preset
        // review P2-1：文件存在但非法 → 明确"损坏"（非"不存在"）
        this.engine.reportError(`预设「${id}」已损坏：${result.errors[0] ?? '校验失败'}`)
        return null
      }
    } catch { /* 落到 demo 兜底 */ }
    const demo = DEMO_PRESETS.find(p => p.id === id)
    if (demo !== undefined) return demo
    // M2-7：已注册预设源回退（远程市场占位——当前默认零源）
    for (const source of listPresetSources()) {
      try {
        const raw = await source.get(id)
        if (raw === null) continue
        const result = validatePreset(raw)
        if (result.ok) return result.preset
      } catch { /* 单源异常隔离，继续下一源 */ }
    }
    return null
  }

  /** 预设库 + 内置示例 + 已注册源合并列表（预设墙数据源；#62 携带 hasBackup 供还原入口显隐）。 */
  async listPresets(): Promise<Array<{ id: string; name: string; edition: string; builtin: boolean; hasBackup: boolean }>> {
    const out: Array<{ id: string; name: string; edition: string; builtin: boolean; hasBackup: boolean }> = []
    for (const demo of DEMO_PRESETS) {
      out.push({ id: demo.id, name: demo.name, edition: demo.edition, builtin: true, hasBackup: false })
    }
    try {
      const res = await fetch('/ui-presets/presets', { headers: { accept: 'application/json' } })
      if (res.ok) {
        const body = (await res.json()) as { presets?: Array<{ id: string; name: string; edition: string; hasBackup?: unknown }> }
        for (const meta of body.presets ?? []) {
          // #97：库预设遮蔽同 id 内置示例（与 loadPreset 查序一致）——列表项必须 = 生效预设：
          // 保位替换 demo 条目（墙/左栏显示库版本——手设封面、可编辑/删除、hasBackup 正确；
          // 原"demo 优先去重"导致墙卡片显示 demo 封面/出厂徽标，与实际生效内容不一致）
          const entry = { ...meta, builtin: false, hasBackup: meta.hasBackup === true }
          const idx = out.findIndex(p => p.id === meta.id)
          if (idx === -1) out.push(entry)
          else out[idx] = entry
        }
      }
    } catch { /* 库不可用：仅 demo */ }
    for (const source of listPresetSources()) {
      try {
        for (const meta of await source.list()) {
          if (!out.some(p => p.id === meta.id)) out.push({ ...meta, builtin: false, hasBackup: false })
        }
      } catch { /* 单源异常隔离 */ }
    }
    return out
  }

  /** #62 读取预设备份（backup.json；无备份 → { backup: null, error: null }；损坏/失败带错误文案）。 */
  async getBackup(id: string): Promise<{ backup: Preset | null; error: string | null }> {
    try {
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(id)}?backup=1`, { headers: { accept: 'application/json' } })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        return { backup: null, error: body?.error ?? `读取备份失败（HTTP ${res.status}）` }
      }
      const body = (await res.json()) as { backup?: unknown }
      if (body.backup === null || body.backup === undefined) return { backup: null, error: null }
      const result = validatePreset(body.backup)
      if (!result.ok) return { backup: null, error: `备份损坏：${result.errors[0] ?? '校验失败'}` }
      return { backup: result.preset, error: null }
    } catch (error) {
      return { backup: null, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * #62 备份还原入口：用 backup.json 交换式还原预设库条目。
   * - 还原 = 校验通过的备份写回 preset.json，**当前版本写入 backup.json**（可再还原回去，单层备份）；
   * - 纯库操作：不写 active.json、不碰引擎/草稿（还原不自动应用——用户拍板）；
   * - 完成后广播库变更（跨窗口预设墙/列表刷新）。
   */
  async restoreBackup(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
    const { backup, error } = await this.getBackup(id)
    if (backup === null) return { ok: false, error: error ?? '没有可用备份' }
    // 当前版本（存在时）作为新备份随 PUT 写入——交换式还原
    let current: unknown = null
    try {
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(id)}`, { headers: { accept: 'application/json' } })
      if (res.ok) current = ((await res.json()) as { preset?: unknown }).preset ?? null
    } catch { current = null }
    try {
      const body: Record<string, unknown> = { preset: backup }
      if (current !== null) body.backup = current
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const msg = (await res.json().catch(() => null)) as { error?: string; errors?: string[] } | null
        return { ok: false, error: msg?.error ?? msg?.errors?.join('；') ?? `还原失败（HTTP ${res.status}）` }
      }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
    this.engine.reportError(null)
    // M5-2/#56：库变更广播（跨窗口 + 本窗口直通）——预设墙/左栏列表即时刷新。
    this.broadcastLibrary()
    return { ok: true }
  }

  /**
   * 保存预设（M1 评审决策：先落盘后提升；连接性评审 P1-1 修复：id 一致性）。
   * 流程：校验 → PUT 预设文件（**库中已有旧文件即写 backup.json**——新建会话也有固定 id，
   * 备份判定不依赖额外标记）→ 成功 → 引擎层同步最终 id（草稿 id 与落盘 id 不一致时
   * 先重挂草稿）→ 提升 → 写 active.json。
   * @param preset - 完整预设（已含编辑值）。
   * @param options - activate：保存后提升为活动预设（默认 true）。
   * @returns 成功与否（失败信息在 lastError）。
   */
  async savePreset(preset: Preset, options: { activate?: boolean } = {}): Promise<boolean> {
    const result = validatePreset(preset)
    if (!result.ok) {
      this.engine.reportError(result.errors.join('；'))
      return false
    }
    const activate = options.activate !== false
    // 1) 落盘（存在旧文件即备份——"有旧即备份"更安全，评审 P2-6）
    try {
      const old = await this.loadPresetRaw(preset.id)
      const backupBody = old !== null ? { ...old } : null
      const body = { preset: result.preset, ...(backupBody !== null ? { backup: backupBody } : {}) }
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(preset.id)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`保存失败（HTTP ${res.status}）`)
    } catch (error) {
      this.engine.reportError(error instanceof Error ? error.message : String(error))
      return false
    }
    // 2) 引擎层同步最终 id（P1-1 修复：新建/从当前外观新建的草稿 id 是临时 id，
    //    必须先用最终 id 重挂草稿，否则 saveDraftAsActive 提升的是临时 id）
    // 注：PUT 期间用户继续编辑的输入已在引擎草稿实时生效（onSessionChange → patchDraft），
    // 此处的快照重挂会把它顶回保存时刻（#96 审计 C12 已知微竞态：localhost 保存窗口毫秒级，
    // 且"保留草稿令牌"的替代实现会破坏 P1-1 的空草稿 id 重挂契约——不做）
    const state = this.engine.getState()
    if (state.hasDraft && state.draftPresetId !== result.preset.id) {
      const synced = this.engine.patchDraft(result.preset)
      if (!synced) {
        this.engine.reportError('保存已落盘，但活动预设未同步（可重启后恢复）')
        return false
      }
    }
    // 3) 引擎提升 + 持久化活动 id
    let promotionError: string | null = null
    if (activate) {
      const ok = this.engine.saveDraftAsActive()
      if (!ok) {
        // 无草稿（直接保存库副本）→ 用 applyPreset 提升；失败记录（评审 P2-3：不得吞错）
        const applied = this.engine.applyPreset(result.preset)
        if (!applied) promotionError = this.engine.getState().lastError
      }
      if (promotionError === null) {
        this.persistActiveId(preset.id)
      }
    } else if (this.engine.getState().draftPresetId === preset.id) {
      this.engine.saveDraftAsActive()
    }
    if (promotionError === null) {
      this.engine.reportError(null)
      // M5-2：库变更广播（新建/保存落盘 → 其他窗口预设墙刷新）。
      this.broadcastLibrary()
      return true
    }
    this.engine.reportError(promotionError)
    return false
  }

  /** 读取库中原始预设（不解析 demo），供备份。 */
  private async loadPresetRaw(id: string): Promise<unknown | null> {
    try {
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(id)}`, { headers: { accept: 'application/json' } })
      if (!res.ok) return null
      const body = (await res.json()) as { preset?: unknown }
      return body.preset ?? null
    } catch { return null }
  }

  /** 删除预设（同时清除活动引用）。 */
  async deletePreset(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) return false
      if (this.engine.getState().activePresetId === id) this.clearActive()
      if (this.engine.getState().draftPresetId === id) this.engine.discardDraft()
      // M5-2：库变更广播。
      this.broadcastLibrary()
      return true
    } catch { return false }
  }

  /** 导出预设为 JSON 文件（浏览器下载）。 */
  /** #93：下载文件名安全化（预设名 → 文件名；非法字符替换，空名回退 id）。 */
  private safeFileName(name: string, fallback: string): string {
    const cleaned = name.replace(/[\\/:*?"<>|]/g, '_').trim().slice(0, 64)
    return cleaned !== '' ? cleaned : fallback
  }

  /** M2-5：导出 zip 三件套（preset.json + cover.svg + manifest.json，Node half 生成）。
   * #93（用户建议）：默认下载名 = 预设名（此前固定为 id.zip）。 */
  async exportZipFile(preset: Preset): Promise<boolean> {
    try {
      const res = await fetch('/ui-presets/export-zip', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ preset }),
      })
      if (!res.ok) {
        this.engine.reportError(`导出 ZIP 失败（HTTP ${res.status}）`)
        return false
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${this.safeFileName(preset.name, preset.id)}.zip`
      a.click()
      URL.revokeObjectURL(url)
      this.engine.reportError(null)
      return true
    } catch {
      this.engine.reportError('导出 ZIP 失败（网络错误）')
      return false
    }
  }

  /** 导入预设文件（#93：仅支持 zip 三件套——JSON 格式已移除，用户拍板只留 zip）；
   * id 冲突循环加后缀（评审 P2-6：不覆盖已有预设）。 */
  async importPresetFile(file: File): Promise<{ ok: boolean; id?: string; error?: string }> {
    if (file.size < 4) return { ok: false, error: '不是合法的 ZIP 预设包' }
    const head = new Uint8Array(await file.slice(0, 4).arrayBuffer())
    if (!(head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04)) {
      return { ok: false, error: '仅支持 ZIP 预设包（JSON 格式已移除）' }
    }
    try {
      const res = await fetch('/ui-presets/import-zip', {
        method: 'POST',
        headers: { 'content-type': 'application/zip' },
        body: file,
      })
      const body = (await res.json()) as { ok?: unknown; id?: unknown; error?: unknown; errors?: unknown }
      if (res.ok && body.ok === true && typeof body.id === 'string') {
        // #96：zip 导入成功 → 广播库变更（跨窗口预设墙刷新；M5-2 后已启用广播，
        // 旧 P2-5 注释"不广播"为过时残留）
        this.broadcastLibrary()
        return { ok: true, id: body.id }
      }
      // review P3（全量评审）：422 的 errors 数组合并展示（原只取 body.error——422 无 error 字段 → 泛化"ZIP 导入失败"）。
      const detail = Array.isArray(body.errors) && body.errors.length > 0
        ? body.errors.join('；')
        : typeof body.error === 'string'
          ? body.error
          : 'ZIP 导入失败'
      this.engine.reportError(detail)
      return { ok: false, error: detail }
    } catch {
      return { ok: false, error: 'ZIP 导入失败（网络错误）' }
    }
  }

  /** 应用预设为活动预设并持久化。
   * #63 P0-1：重应用防自激——id 与当前活动一致（外部 preset_update 更新活动预设内容后
   * 桥/广播触发的重应用，或用户重复点击）→ 引擎重挂新内容但**跳过重复持久化/广播**：
   * 否则每次重应用都会 revision+1 → 桥再次触发 → 无限循环（轮询桥与跨窗口广播双通道均会）。 */
  async applyPresetById(id: string): Promise<boolean> {
    this.userInteracted = true
    const preset = await this.loadPreset(id)
    if (preset === null) {
      // review P2-1：应用失败必须反馈（预设不存在或已损坏——loadPreset 对损坏已 reportError）
      if (this.engine.getState().lastError === null) {
        this.engine.reportError(`预设「${id}」不存在或无法加载`)
      }
      return false
    }
    const wasActive = this.engine.getState().activePresetId === id
    const ok = this.engine.applyPreset(preset)
    if (ok && !wasActive) {
      this.persistActiveId(id)
    }
    return ok
  }

  /** M2-8 壁纸库：上传素材（≤20MB，image/*；#52 支持 Blob——裁剪副本上传，name 兜底）。
   * #90：可选 layers 规格（分层合成壁纸：动图引用 + 帧坐标矩形）→ 随 meta 落盘。 */
  async uploadAsset(
    file: File | Blob,
    name?: string,
    layers?: { animAssetId: string; x: number; y: number; w: number; h: number },
  ): Promise<{ ok: boolean; id?: string; name?: string; mime?: string; error?: string }> {
    if (!file.type.startsWith('image/')) return { ok: false, error: '只支持图片素材（image/*）' }
    if (file.size > MAX_ASSET_FILE_SIZE) return { ok: false, error: '素材超过上限（≤20MB）' }
    const fileName = (typeof (file as File).name === 'string' && (file as File).name !== '')
      ? (file as File).name.slice(0, 64)
      : (name ?? 'image.png').slice(0, 64)
    try {
      const params = new URLSearchParams({ name: fileName, mime: file.type })
      if (layers !== undefined) params.set('layers', JSON.stringify(layers))
      const res = await fetch(`/ui-presets/assets?${params}`, {
        method: 'PUT',
        headers: { 'content-type': file.type },
        body: file,
      })
      const body = (await res.json()) as { ok?: unknown; id?: unknown; name?: unknown; mime?: unknown; error?: unknown }
      if (res.ok && body.ok === true && typeof body.id === 'string') {
        if (layers !== undefined) this.layersMeta.set(body.id, layers)
        return {
          ok: true,
          id: body.id,
          name: typeof body.name === 'string' ? body.name : fileName,
          mime: typeof body.mime === 'string' ? body.mime : file.type,
        }
      }
      const message = typeof body.error === 'string' ? body.error : '上传失败'
      this.engine.reportError(message)
      return { ok: false, error: message }
    } catch {
      this.engine.reportError('素材上传失败（网络错误）')
      return { ok: false, error: '上传失败（网络错误）' }
    }
  }

  /** M2-8 壁纸库：删除素材文件。
   * review P1-3（全量评审）：返回服务端清理信息——refCount 其他预设引用数（删除时
   * 库中预设的引用已被顺带清空，UI 可提示），cleanedPresets 被清理的预设数。 */
  async deleteAsset(id: string): Promise<{ ok: boolean; refCount?: number; cleanedPresets?: number; error?: string }> {
    try {
      const res = await fetch(`/ui-presets/assets/${encodeURIComponent(id)}`, { method: 'DELETE' })
      const body = await res.json().catch(() => ({})) as { ok?: unknown; refCount?: unknown; cleanedPresets?: unknown; error?: unknown }
      if (!res.ok) {
        return { ok: false, error: typeof body.error === 'string' ? body.error : '删除失败' }
      }
      // #90：删除后分层规格可能被剥离（被删素材是某合成壁纸的动图层）——清缓存下次重拉
      this.layersMeta.clear()
      return {
        ok: true,
        refCount: typeof body.refCount === 'number' ? body.refCount : 0,
        cleanedPresets: typeof body.cleanedPresets === 'number' ? body.cleanedPresets : 0,
      }
    } catch { return { ok: false, error: '删除失败（网络错误）' } }
  }

  /** 清除活动预设（还原默认外观）。 */
  clearActive(): void {
    this.userInteracted = true
    this.engine.dispose()
    this.persistActiveId(null)
  }

  /** M2-4 选择入口：切换活动主题（未注册 id 抛错 → 捕获返回失败并提示）。 */
  selectTheme(id: string): { ok: boolean; error?: string } {
    if (this.rawTheme?.setTheme === undefined) {
      const error = '主题服务不支持切换'
      this.engine.reportError(error)
      return { ok: false, error }
    }
    try {
      this.rawTheme.setTheme(id)
      this.engine.reportError(null)
      return { ok: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.engine.reportError(`切换主题失败：${message}`)
      return { ok: false, error: message }
    }
  }

  /** 启动时应用已存活动预设（apply 早于 boot settle → 加载页即带美化）。
   * 竞态防护：fetch/应用为异步——期间用户已操作（apply/clear）则放弃覆盖。 */
  async adoptPersisted(): Promise<void> {
    const id = await this.fetchPersistedId()
    if (id === null) return
    if (this.userInteracted) return
    await this.applyPresetById(id)
  }

  // ---- #52b 动态裁剪渲染：按目标元素实际尺寸计算背景样式（裁剪结果不落库） ----

  /** #77：DOM 增删触发裁剪重同步的去抖调度（rAF 合并同帧多次变更；无 rAF 回落 setTimeout）。 */
  private scheduleCropResync(): void {
    if (this.cropResyncScheduled) return
    this.cropResyncScheduled = true
    const run = (): void => {
      this.cropResyncScheduled = false
      try { this.syncCropWidgets() } catch { /* 观察回调零抛错 */ }
    }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => run())
    else setTimeout(run, 0)
  }

  /** 当前是否深色风格（body[data-ds-dark-theme] 属性——DSH ThemePresenter 实证方案标记）。 */
  private isDarkScheme(): boolean {
    return typeof document !== 'undefined'
      && document.body !== null
      && document.body.hasAttribute('data-ds-dark-theme')
  }

  /** 应用裁剪内联样式到单个元素（无匹配标记/尺寸未知 → 清除）。
   * #55：浅色取 light 标记，深色取 dark 标记（缺省回退另一侧）。 */
  private applyCropStyle(
    el: Element,
    entry: { light?: CropMarkerInfo; dark?: CropMarkerInfo },
    isDark: boolean,
  ): void {
    const info = isDark ? (entry.dark ?? entry.light) : (entry.light ?? entry.dark)
    const s = el as HTMLElement
    /** #77：免重复写入守卫——同值跳过（DOM 观察触发的高频重同步下不产生样式写入）。 */
    const setIfChanged = (prop: 'backgroundImage' | 'backgroundSize' | 'backgroundPosition' | 'backgroundRepeat', value: string): void => {
      if (s.style[prop] !== value) s.style[prop] = value
    }
    const clear = (): void => {
      setIfChanged('backgroundImage', '')
      setIfChanged('backgroundSize', '')
      setIfChanged('backgroundPosition', '')
      setIfChanged('backgroundRepeat', '')
    }
    if (info === undefined) { clear(); return }
    const ratio = WIDGET_CROP_RATIOS[info.widgetId]
    const frame = cropFrameSize(ratio)
    const rect = el.getBoundingClientRect()
    const crop = { x: info.x, y: info.y, w: info.w, h: info.h }
    const washToken = WIDGET_WASH_TOKEN[info.widgetId] ?? 'var(--dsw-alias-bg-base, #fff)'
    // #92：侧栏海报用 contain（实际侧栏元素 280×900 ≈ 1:3.2 远宽于 1:5 帧——
    // cover 会把帧底部裁出可视区，海报"歪到看不见"；contain 整个帧完整可见、所见即所得）。
    // #99：折叠成窄栏（≈1:14 窄于帧比例）时自适应切 cover——按高度铺满、水平裁出
    // 海报竖条（海报随侧栏"折叠"），不再 contain 整体缩小成小图。
    const fit: 'cover' | 'contain' = info.widgetId === 'sidebar-poster'
      ? sidebarPosterFitFor(rect.width, rect.height, frame)
      : 'cover'
    // #90 分层合成壁纸：标记 url 对应的素材带 layers 规格 → 渲染为"静态底 + 原生动图"多背景
    // （动图按帧坐标矩形经同变换映射；meta 未加载时先用单图样式，加载后重同步升级）
    const assetMatch = /\/ui-presets\/assets\/([a-z0-9-]+)/.exec(info.url)
    let layeredSpec: { animAssetId: string; x: number; y: number; w: number; h: number } | null | undefined
    if (assetMatch !== null) layeredSpec = this.layersMeta.get(assetMatch[1])
    const style = layeredSpec !== null && layeredSpec !== undefined
      ? layeredElementStyle(rect.width, rect.height, frame, crop, info.opacity, info.url,
        `url("/ui-presets/assets/${encodeURIComponent(layeredSpec.animAssetId)}")`, layeredSpec, washToken, fit)
      : cropElementStyle(rect.width, rect.height, frame, crop, info.opacity, info.url, washToken, fit)
    if (Object.keys(style).length === 0) { clear(); return }
    setIfChanged('backgroundImage', style.backgroundImage)
    setIfChanged('backgroundSize', style.backgroundSize)
    setIfChanged('backgroundPosition', style.backgroundPosition)
    setIfChanged('backgroundRepeat', style.backgroundRepeat)
  }

  /** #90：确保分层 meta 已加载（缺失 id 触发一次列表拉取；成功后重同步以升级渲染）。 */
  private ensureLayersMeta(ids: string[]): void {
    const missing = ids.filter(id => !this.layersMeta.has(id))
    if (missing.length === 0 || this.layersMetaFetching || typeof fetch === 'undefined') return
    this.layersMetaFetching = true
    void (async () => {
      try {
        const res = await fetch('/ui-presets/assets', { headers: { accept: 'application/json' } })
        if (!res.ok) return
        const body = (await res.json()) as { assets?: Array<Record<string, unknown>> }
        const assets = Array.isArray(body.assets) ? body.assets : []
        for (const a of assets) {
          if (typeof a.id !== 'string') continue
          const layers = a.layers
          if (layers !== null && typeof layers === 'object') {
            const L = layers as Record<string, unknown>
            if (typeof L.animAssetId === 'string' && typeof L.x === 'number' && typeof L.y === 'number'
              && typeof L.w === 'number' && typeof L.h === 'number') {
              this.layersMeta.set(a.id, { animAssetId: L.animAssetId, x: L.x, y: L.y, w: L.w, h: L.h })
              continue
            }
          }
          this.layersMeta.set(a.id, null)
        }
        // 列表里没有的 id → 视为非分层（防反复拉取）
        for (const id of missing) if (!this.layersMeta.has(id)) this.layersMeta.set(id, null)
        // meta 到达后重同步：单图样式升级为分层多背景
        this.syncCropWidgets()
      } catch { /* 网络错误：保留未查状态，下次同步再试 */ }
      finally { this.layersMetaFetching = false }
    })()
  }

  /** 解析引擎当前 cssText 的裁剪标记 → 同步目标元素内联样式（含 ResizeObserver 重算）。
   * 每次引擎状态变化调用（幂等、无标记即清除旧样式）；node 环境无 DOM → 跳过。
   * #55：同部件的浅/深标记都保留，按当前明暗选一组应用；body 明暗属性变化（MutationObserver）
   * 也触发本同步——应用内切换浅色/深色主题时壁纸即时切换。 */
  private syncCropWidgets(): void {
    if (typeof document === 'undefined' || typeof ResizeObserver === 'undefined') return
    // 惰性挂明暗监听（body 可能晚于插件 apply 出现）
    if (this.schemeObserver === null && typeof MutationObserver !== 'undefined' && document.body !== null) {
      try {
        this.schemeObserver = new MutationObserver(() => { this.syncCropWidgets() })
        this.schemeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
      } catch { this.schemeObserver = null }
    }
    // #77：目标元素出现/替换监听——任何 DOM 增删都调度一次去抖重同步
    // （会话切换把滚动容器重挂载 → 内联样式丢失 → 本观察自动恢复；聊天流式
    // 追加消息也触发，但 applyCropStyle 有免重复写入守卫，重同步开销极低）。
    if (this.cropDomObserver === null && typeof MutationObserver !== 'undefined' && document.body !== null) {
      try {
        this.cropDomObserver = new MutationObserver(() => { this.scheduleCropResync() })
        this.cropDomObserver.observe(document.body, { childList: true, subtree: true })
      } catch { this.cropDomObserver = null }
    }
    const markers = parseCropMarkers(this.engine.getCurrentCssText())
    // #90：标记中的素材 id 可能带 layers 规格（分层合成壁纸）——确保 meta 已加载
    const markerAssetIds: string[] = []
    for (const info of markers) {
      const match = /\/ui-presets\/assets\/([a-z0-9-]+)/.exec(info.url)
      if (match !== null) markerAssetIds.push(match[1])
    }
    this.ensureLayersMeta(markerAssetIds)
    const byWidget = new Map<string, { light?: CropMarkerInfo; dark?: CropMarkerInfo }>()
    for (const info of markers) {
      const entry = byWidget.get(info.widgetId) ?? { light: undefined, dark: undefined }
      if (info.dark) entry.dark = info
      else entry.light = info
      byWidget.set(info.widgetId, entry)
    }
    const isDark = this.isDarkScheme()
    const next = new Map<Element, { light?: CropMarkerInfo; dark?: CropMarkerInfo }>()
    for (const [widgetId, entry] of byWidget) {
      const selector = WIDGET_TARGET_SELECTOR[widgetId]
      if (selector === undefined) continue
      for (const el of document.querySelectorAll(selector)) next.set(el, entry)
    }
    // 仍存在的元素：重算样式 + 确保 ResizeObserver 挂上
    for (const [el, entry] of next) {
      this.applyCropStyle(el, entry, isDark)
      if (!this.cropResizeObservers.has(el)) {
        let observer: ResizeObserver | null = null
        try {
          observer = new ResizeObserver(() => {
            const current = this.cropStyleElements.get(el)
            if (current !== undefined) this.applyCropStyle(el, current, this.isDarkScheme())
          })
          observer.observe(el)
        } catch { observer = null }
        if (observer !== null) this.cropResizeObservers.set(el, observer)
      }
    }
    // 消失的元素：清除内联样式 + 断开观察
    for (const [el] of this.cropStyleElements) {
      if (!next.has(el)) {
        const s = el as HTMLElement
        s.style.backgroundImage = ''
        s.style.backgroundSize = ''
        s.style.backgroundPosition = ''
        s.style.backgroundRepeat = ''
        this.cropResizeObservers.get(el)?.disconnect()
        this.cropResizeObservers.delete(el)
      }
    }
    this.cropStyleElements.clear()
    for (const [el, entry] of next) this.cropStyleElements.set(el, entry)
  }
}

/** 模块级单例（apply 时创建）。 */
let controller: PresetsController | null = null
export function getController(): PresetsController | null {
  return controller
}
export function setController(value: PresetsController | null): void {
  controller = value
}
