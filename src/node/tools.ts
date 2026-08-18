/**
 * AI 工具（M2-3）：preset_list / preset_apply / preset_inspect / preset_create。
 * - 注册经 registerPresetTools：**动态 import('@deepseek-ai/dsh-tools')**——静态导入在
 *   模块加载期执行，解析失败会让插件 FAILED → 整应用无法启动（fail-loud 红线）；
 *   动态导入 + try/catch → 服务缺失/包不可解析时静默降级（仅 warn）。
 * - createPresetToolDefs 独立导出（注入 defineTool）：测试可直接调用工具的 execute()
 *   （与 agent 会话实际执行的代码同源）——M2 AI 功能端到端验证路径。
 * - 工具与浏览器 UI 共用同一事实源（预设库目录 + active.json），见决策 #14。
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { validatePreset } from '../core/schema.ts'
import type { Preset } from '../core/schema.ts'
import { catalog } from '../core/catalog.ts'
import { KNOBS, KNOB_CATEGORIES } from '../core/knobs.ts'
import { DEMO_PRESETS, isDemoPreset } from '../core/demo-data.ts'
// #67 P1：CSS 补丁锚点字典（与 UI 模板库单一事实源）
import { CSS_ANCHORS } from '../core/css-templates.ts'
// #72：AI 质量预检（preset_check 数据源）
import { precheckPreset } from '../core/precheck.ts'
// #73 P0-2：风格术语字典（preset_catalog styles 段）
import { STYLE_GUIDE } from '../core/style-guide.ts'
// #74：令牌中文描述（catalog 输出 description 字段——UI 与 AI 共享语义层）
import { TOKEN_DESCRIPTIONS } from '../core/catalog-zh.ts'

export interface ToolsEnv {
  presetsDir: string
  /** #65 P0-3：壁纸库目录（素材文件 + <id>.json meta sidecar）。 */
  assetsDir: string
  dataDir: string
  activeFile: string
  configFile: string
}

/** 预设 id 安全检查（与路由同款，杜绝路径穿越）。 */
export function safePresetId(id: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,63}$/.test(id)
}

/** 原子写（tmp + rename 同卷原子替换）。 */
export function writeFileAtomic(file: string, data: string): void {
  const tmp = `${file}.tmp`
  writeFileSync(tmp, data, 'utf8')
  renameSync(tmp, file)
}

export interface ActiveState {
  activePresetId: string | null
  revision: number
}

/** 读 active.json（缺省 {null, 0}；损坏不抛——降级为无活动）。 */
export function readActiveState(env: ToolsEnv): ActiveState {
  try {
    const raw = JSON.parse(readFileSync(env.activeFile, 'utf8')) as { activePresetId?: unknown; revision?: unknown }
    return {
      activePresetId: typeof raw.activePresetId === 'string' && safePresetId(raw.activePresetId) ? raw.activePresetId : null,
      revision: Number.isInteger(raw.revision) && (raw.revision as number) >= 0 ? raw.revision as number : 0,
    }
  } catch {
    return { activePresetId: null, revision: 0 }
  }
}

/** 写 active.json（revision 单调 +1——浏览器 AI bridge 轮询据此发现外部变更）。 */
export function writeActiveState(env: ToolsEnv, id: string | null): void {
  const prev = readActiveState(env)
  mkdirSync(env.dataDir, { recursive: true })
  writeFileAtomic(env.activeFile, JSON.stringify({ activePresetId: id, revision: prev.revision + 1 }))
}

/** 读预设库列表（损坏条目跳过）。 */
export function listLibraryPresets(env: ToolsEnv): Array<{ id: string; name: string; edition: string }> {
  const out: Array<{ id: string; name: string; edition: string }> = []
  let dirs: string[] = []
  try { dirs = readdirSync(env.presetsDir) } catch { /* 目录缺失 = 空库 */ }
  for (const id of dirs) {
    if (!safePresetId(id)) continue
    try {
      const raw = JSON.parse(readFileSync(join(env.presetsDir, id, 'preset.json'), 'utf8')) as { name?: unknown; edition?: unknown }
      out.push({
        id,
        name: typeof raw.name === 'string' ? raw.name : id,
        edition: typeof raw.edition === 'string' ? raw.edition : 'standard',
      })
    } catch { /* 损坏条目跳过 */ }
  }
  out.sort((a, b) => a.id.localeCompare(b.id))
  return out
}

/** 读预设库单个预设（损坏/缺失 → null）。 */
export function readLibraryPreset(env: ToolsEnv, id: string): Preset | null {
  if (!safePresetId(id)) return null
  try {
    const raw = JSON.parse(readFileSync(join(env.presetsDir, id, 'preset.json'), 'utf8'))
    const result = validatePreset(raw)
    return result.ok ? result.preset : null
  } catch { return null }
}

/** 可应用 id：库或内置 demo。 */
export function resolvablePresetId(env: ToolsEnv, id: string): boolean {
  return isDemoPreset(id) || readLibraryPreset(env, id) !== null
}

/** #64 P0-2：读指定预设详情（preset_get 数据源）——库预设或内置 demo；
 * 素材只返回元数据（dataUrl 最多 28M 字符，绝不能塞给 LLM）；
 * hasBackup 供备份还原工具（P1）铺垫。 */
export function getPresetDetail(env: ToolsEnv, id: string): {
  id: string
  name: string
  edition: string
  builtin: boolean
  tokenCount: number
  style: string | null
  tokens: Record<string, { light: string; dark: string }>
  css: Array<{ selector: string; rules: string }>
  theme: { id: string; colorScheme: 'light' | 'dark'; tokens: Record<string, { light: string; dark: string }> } | null
  assets: Array<{ id: string; name: string; mime: string; size: number }>
  widgets: Array<{ id: string; params: Record<string, string> }>
  cover: { assetId: string; cropX?: string; cropY?: string; cropW?: string; cropH?: string } | null
  hasBackup: boolean
} {
  if (!safePresetId(id)) throw new Error('preset_get: 非法 id')
  const library = readLibraryPreset(env, id)
  const demo = library === null ? DEMO_PRESETS.find(p => p.id === id) ?? null : null
  const preset = library ?? demo
  if (preset === null) throw new Error(`preset_get: 预设 ${id} 不存在（先 preset_list）`)
  // #65：素材 size 语义——内嵌 dataUrl 用其长度；壁纸库文件引用（#32 后）查 meta 真实大小
  const wallpaperSizes = new Map(listWallpaperAssets(env).map(asset => [asset.id, asset.size]))
  return {
    id: preset.id,
    name: preset.name,
    edition: preset.edition,
    builtin: demo !== null,
    tokenCount: Object.keys(preset.tokens).length,
    // #73：风格标签（style:xxx）——AI 可读出厂预设作风范例
    style: styleOf(preset.tags),
    tokens: preset.tokens,
    css: preset.css ?? [],
    // #70：theme 可写后 AI 微调需读主题令牌（与预设 tokens 同结构）
    theme: preset.theme !== undefined
      ? { id: preset.theme.id, colorScheme: preset.theme.colorScheme, tokens: preset.theme.tokens }
      : null,
    assets: (preset.assets ?? []).map(asset => ({
      id: asset.id,
      name: asset.name,
      mime: asset.mime,
      // 内嵌 dataUrl 用其长度；壁纸库文件引用查 meta 真实大小（缺文件 0）
      size: typeof asset.dataUrl === 'string' ? asset.dataUrl.length : (wallpaperSizes.get(asset.id) ?? 0),
    })),
    widgets: (preset.widgets ?? []).map(widget => ({ id: widget.id, params: widget.params })),
    cover: preset.cover ?? null,
    hasBackup: existsSync(join(env.presetsDir, id, 'backup.json')),
  }
}

/** #65 P0-3：壁纸库素材清单（asset_list 数据源）——读 <assetsDir>/<id>.json meta sidecar；
 * 损坏 meta 跳过；缺文件条目保留（悬空引用无害——编译跳过缺素材）。
 * #90：分层合成壁纸（layers 字段：动图引用 + 帧坐标矩形）作为元数据输出（无 dataUrl 泄漏）。 */
export function listWallpaperAssets(env: ToolsEnv): Array<{ id: string; name: string; mime: string; size: number; layers?: unknown }> {
  const out: Array<{ id: string; name: string; mime: string; size: number; layers?: unknown }> = []
  let files: string[] = []
  try { files = readdirSync(env.assetsDir) } catch { return out }
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    const id = file.slice(0, -5)
    if (!safePresetId(id)) continue
    try {
      const meta = JSON.parse(readFileSync(join(env.assetsDir, file), 'utf8')) as { id?: unknown; name?: unknown; mime?: unknown; size?: unknown; layers?: unknown }
      if (typeof meta.id === 'string' && typeof meta.name === 'string' && typeof meta.mime === 'string') {
        const entry: { id: string; name: string; mime: string; size: number; layers?: unknown } = {
          id: meta.id, name: meta.name, mime: meta.mime, size: typeof meta.size === 'number' ? meta.size : 0,
        }
        if (meta.layers !== undefined) entry.layers = meta.layers
        out.push(entry)
      }
    } catch { /* 损坏 meta 跳过 */ }
  }
  out.sort((a, b) => a.id.localeCompare(b.id))
  return out
}

/** #66 P1：备份交换式还原（preset_restore_backup 数据源）——与 #62 HTTP 语义一致：
 * 备份写回 preset.json、**当前版本写入 backup.json**（单层备份，可再还原回去）。
 * 无备份 → 抛「没有可用备份」；备份损坏（坏 JSON / 校验失败）→ 抛「备份损坏」。 */
export function restoreBackupFile(env: ToolsEnv, id: string): { name: string } {
  if (!safePresetId(id)) throw new Error('preset_restore_backup: 非法 id')
  const backupFile = join(env.presetsDir, id, 'backup.json')
  if (!existsSync(backupFile)) throw new Error(`preset_restore_backup: 预设 ${id} 没有可用备份（覆盖保存/更新后才会产生）`)
  let backup: Preset
  try {
    const result = validatePreset(JSON.parse(readFileSync(backupFile, 'utf8')))
    if (!result.ok) throw new Error(`备份损坏：${result.errors[0] ?? '校验失败'}`)
    backup = result.preset
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('备份损坏')) throw new Error(`preset_restore_backup: ${error.message}`)
    throw new Error(`preset_restore_backup: 备份损坏：${error instanceof Error ? error.message : String(error)}`)
  }
  // 交换：当前版本（存在时）成为新备份
  const current = readLibraryPreset(env, id)
  const dir = join(env.presetsDir, id)
  mkdirSync(dir, { recursive: true })
  writeFileAtomic(join(dir, 'preset.json'), JSON.stringify(backup, null, 2))
  if (current !== null) writeFileAtomic(join(dir, 'backup.json'), JSON.stringify(current, null, 2))
  return { name: backup.name }
}

/** review P3（全量评审）：id 生成防同毫秒碰撞——时间戳 base36 + 4 位随机后缀。
 * （原 Date.now().toString(36) 同毫秒连发会静默覆盖；UI 人工操作几乎不触发，
 * 但自动化/AI 流程可触发。） */
export function genId(prefix: string): string {
  const rand = Math.floor(Math.random() * 36 ** 4).toString(36).padStart(4, '0')
  return `${prefix}-${Date.now().toString(36)}${rand}`
}

/** 新建预设落盘（id 由 node 生成；返回 id；校验失败抛教学错误）。 */
export function createPresetFile(
  env: ToolsEnv,
  input: { name: string; tokens: unknown; css?: unknown; assets?: unknown; widgets?: unknown; theme?: unknown },
): string {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  if (name === '') throw new Error('preset_create: name 必填')
  const id = genId('preset')
  const preset: Record<string, unknown> = {
    schemaVersion: 1,
    id,
    name,
    edition: 'standard',
    tokens: input.tokens,
  }
  if (input.css !== undefined) preset.css = input.css
  // #65 P0-3：素材引用声明（{id,name,mime}，id 来自 asset_list——壁纸库文件引用，无 dataUrl）
  // + 部件参数写入（widgets.assetId 必须引用本声明——schema 校验）
  if (input.assets !== undefined) preset.assets = input.assets
  if (input.widgets !== undefined) preset.widgets = input.widgets
  // #70：主题注册写入——{ id, colorScheme, tokens? }；tokens 省略 = 自动取预设全部令牌
  // （与 UI「主题令牌取预设全量」同语义）；结构由 validatePreset 校验
  if (input.theme !== undefined && input.theme !== null) {
    const theme = input.theme as { id?: unknown; colorScheme?: unknown; tokens?: unknown }
    if (typeof theme.id !== 'string' || (theme.colorScheme !== 'light' && theme.colorScheme !== 'dark')) {
      throw new Error('preset_create: theme 必须是 { id, colorScheme: light|dark, tokens? }')
    }
    preset.theme = {
      id: theme.id.trim(),
      colorScheme: theme.colorScheme,
      tokens: theme.tokens !== undefined ? theme.tokens : preset.tokens,
    }
  }
  const result = validatePreset(preset)
  if (!result.ok) throw new Error(`preset_create: ${result.errors.join('；')}`)
  mkdirSync(join(env.presetsDir, id), { recursive: true })
  writeFileAtomic(join(env.presetsDir, id, 'preset.json'), JSON.stringify(result.preset, null, 2))
  return id
}

/** #73：从 tags 提取风格标签（style:xxx）——出厂预设的风格参考标记。 */
function styleOf(tags: string[] | undefined): string | null {
  if (!Array.isArray(tags)) return null
  const tag = tags.find(t => typeof t === 'string' && t.startsWith('style:'))
  return tag !== undefined ? tag.slice(6) : null
}

/** 当前外观快照（preset_inspect 数据源）。
 * #96（审计）：无活动预设时**省略** activePresetId/activeName 键而非置 null——
 * 输出 schema 无法声明 nullable（guard DSL 限制），null 会让宿主运行期校验报错。 */
export function inspectState(env: ToolsEnv): {
  activePresetId?: string
  activeName?: string
  revision: number
  tier: string
  tokenCount: number
  appliedTokenNames: string[]
} {
  const active = readActiveState(env)
  let activeName: string | null = null
  let tokenCount = 0
  let appliedTokenNames: string[] = []
  let found = false
  if (active.activePresetId !== null) {
    const preset = readLibraryPreset(env, active.activePresetId) ?? DEMO_PRESETS.find(p => p.id === active.activePresetId) ?? null
    if (preset !== null) {
      found = true
      activeName = preset.name
      tokenCount = Object.keys(preset.tokens).length
      appliedTokenNames = Object.keys(preset.tokens)
    }
  }
  let tier = 'standard'
  try {
    const raw = JSON.parse(readFileSync(env.configFile, 'utf8')) as { tier?: unknown }
    if (raw.tier === 'simple' || raw.tier === 'standard') tier = raw.tier
  } catch { /* 缺省标准版 */ }
  const out: { revision: number; tier: string; tokenCount: number; appliedTokenNames: string[]; activePresetId?: string; activeName?: string } = {
    revision: active.revision, tier, tokenCount, appliedTokenNames,
  }
  if (found && activeName !== null) {
    out.activePresetId = active.activePresetId ?? undefined
    out.activeName = activeName
  }
  return out
}

/** 更新预设文件（合并 name/tokens/css/assets/widgets/theme，校验后写回 + 备份旧版；#63 mergeTokens 增量合并令牌）。 */
export function updatePresetFile(
  env: ToolsEnv,
  id: string,
  patch: { name?: unknown; tokens?: unknown; css?: unknown; mergeTokens?: unknown; assets?: unknown; widgets?: unknown; theme?: unknown },
): string {
  if (!safePresetId(id)) throw new Error('preset_update: 非法 id')
  const existing = readLibraryPreset(env, id)
  if (existing === null) throw new Error(`preset_update: 预设 ${id} 不存在`)
  // #68 P2：extra 平铺（防御双保险——schema 清洗已修复 extra 展开合并；此处保证
  // update 输入无多余 extra 键，且二次校验收集结果保持同一层级，无嵌套加深）
  const merged: Record<string, unknown> = { ...existing, ...(existing.extra ?? {}) }
  delete merged.extra
  if (patch.name !== undefined) merged.name = patch.name
  if (patch.tokens !== undefined) merged.tokens = patch.tokens
  // #63 P0-1：增量合并——只更新提供的令牌键，其余保持（AI 微调场景，避免整体替换覆盖一切）；
  // 与 tokens 整体替换互斥（同时提供时 mergeTokens 优先，description 已说明二选一）。
  if (patch.mergeTokens !== undefined) {
    if (typeof patch.mergeTokens !== 'object' || patch.mergeTokens === null || Array.isArray(patch.mergeTokens)) {
      throw new Error('preset_update: merge_tokens 必须是令牌对象（令牌名 → { light, dark }）')
    }
    const base = (existing.tokens ?? {}) as Record<string, unknown>
    merged.tokens = { ...base, ...(patch.mergeTokens as Record<string, unknown>) }
  }
  if (patch.css !== undefined) merged.css = patch.css
  // #65 P0-3：素材引用声明 + 部件整体替换（与 css 同语义；widgets.assetId 必须引用 assets 声明）
  if (patch.assets !== undefined) merged.assets = patch.assets
  if (patch.widgets !== undefined) merged.widgets = patch.widgets
  // #70：主题写入——{ id, colorScheme, tokens? }（tokens 省略 = 取当前预设令牌）或 null（清除主题）
  if (patch.theme !== undefined) {
    if (patch.theme === null) {
      delete merged.theme
    } else {
      const theme = patch.theme as { id?: unknown; colorScheme?: unknown; tokens?: unknown }
      if (typeof theme.id !== 'string' || (theme.colorScheme !== 'light' && theme.colorScheme !== 'dark')) {
        throw new Error('preset_update: theme 必须是 { id, colorScheme: light|dark, tokens? } 或 null（清除）')
      }
      merged.theme = {
        id: theme.id.trim(),
        colorScheme: theme.colorScheme,
        tokens: theme.tokens !== undefined ? theme.tokens : merged.tokens,
      }
    }
  }
  const result = validatePreset(merged)
  if (!result.ok) throw new Error(`preset_update: ${result.errors.join('；')}`)
  const dir = join(env.presetsDir, id)
  mkdirSync(dir, { recursive: true })
  writeFileAtomic(join(dir, 'preset.json'), JSON.stringify(result.preset, null, 2))
  writeFileAtomic(join(dir, 'backup.json'), JSON.stringify(existing, null, 2))
  return id
}

/** 删除预设文件（目录整体移除）。 */
export function deletePresetFile(env: ToolsEnv, id: string): void {
  if (!safePresetId(id)) throw new Error('preset_delete: 非法 id')
  if (isDemoPreset(id)) throw new Error('preset_delete: 内置示例不可删除')
  rmSync(join(env.presetsDir, id), { recursive: true, force: true })
}

/** 是否已成功注册（/ui-presets/status 暴露，诊断 + e2e 用）。 */
let registered = false
export function isToolsRegistered(): boolean {
  return registered
}

/**
 * 工具定义工厂（M2 AI 功能测试注入点）：四个 preset_* 工具的 defineTool 定义。
 * @param env - 文件环境（测试可指向临时目录；生产指向 DSH_HOME）。
 * @param defineTool - 真实 dsh-tools 的 defineTool（测试可注入恒等 stub——execute 代码同源）。
 */
export function createPresetToolDefs(
  env: ToolsEnv,
  defineTool: (definition: unknown) => unknown,
): unknown[] {
  return [
    defineTool({
      name: 'preset_list',
      description: '列出所有可用的界面外观预设（内置示例 + 用户预设库），含名称/id/档位/令牌数——作为推荐与应用的目录来源。',
      parameters: {},
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            presets: {
              type: 'array',
              required: true,
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  id: { type: 'string', required: true },
                  name: { type: 'string', required: true },
                  edition: { type: 'string', required: true },
                  builtin: { type: 'boolean', required: true },
                  tokenCount: { type: 'integer', required: true },
                  // #96（审计）：execute 返回 style 键（#73 风格参考）——additionalProperties:false
                  // 下未声明键会让宿主输出校验抛 ToolOutputError（测试 stub 掩盖了运行期失败）
                  style: { type: 'string' },
                },
              },
            },
          },
        },
        render: (_args, value) => [{
          type: 'text',
          text: `共 ${value.presets.length} 个预设：${value.presets.map((p: { name: string }) => p.name).join('、')}`,
        }],
      },
      execute: () => {
        const library = listLibraryPresets(env)
        const merged = [
          ...DEMO_PRESETS.map(preset => ({
            id: preset.id, name: preset.name, edition: preset.edition, builtin: true,
            tokenCount: Object.keys(preset.tokens).length,
            // #73：风格标签（style:xxx）——AI 据此选择风格范例
            style: styleOf(preset.tags),
          })),
          ...library
            .filter(item => !isDemoPreset(item.id))
            .map(item => {
              const preset = readLibraryPreset(env, item.id)
              const entry: Record<string, unknown> = {
                ...item, builtin: false,
                tokenCount: preset !== null ? Object.keys(preset.tokens).length : 0,
              }
              // #96：style 无值（null）时省略键而非置 null——输出 schema 无法声明 nullable
              if (preset !== null) {
                const style = styleOf(preset.tags)
                if (style !== null) entry.style = style
              }
              return entry
            }),
        ]
        return Promise.resolve({ presets: merged })
      },
      presentCall: () => ({ card: 'generic', title: '列出外观预设', kind: 'other', rawInput: null }),
    }),
    defineTool({
      name: 'preset_apply',
      description: '应用一个外观预设（id 来自 preset_list）。与用户在界面点击"应用"等价：立即生效并持久化（重启后保持）。',
      parameters: {
        id: { type: 'string', required: true, description: '预设 id（preset_list 返回）' },
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ok: { type: 'boolean', required: true },
            id: { type: 'string', required: true },
          },
        },
        render: (_args, value) => [{
          type: 'text',
          text: value.ok ? `已应用预设 ${value.id}` : `应用失败：${value.id}`,
        }],
      },
      execute: (args: { id: string }) => {
        if (!safePresetId(args.id) || !resolvablePresetId(env, args.id)) {
          throw new Error(`preset_apply: 预设 ${args.id} 不存在（先 preset_list）`)
        }
        writeActiveState(env, args.id)
        return Promise.resolve({ ok: true, id: args.id })
      },
      presentCall: args => ({ card: 'generic', title: '应用预设', kind: 'other', rawInput: args }),
    }),
    defineTool({
      name: 'preset_inspect',
      description: '查看当前外观状态：活动预设（名称/令牌数）、对外档位、以及活动预设应用的令牌清单——支持"我现在是什么主题"类提问。',
      parameters: {},
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            // #68 P2 注记：activePresetId/activeName 可为 null，但 dsh-tools guard 的 DSL
            // 不支持联合类型（type: ['string','null'] 会使注册整体失败——已实测）——
            // 保持宽松声明（无 required），这是工具框架限制而非缺陷。
            activePresetId: { type: 'string' },
            activeName: { type: 'string' },
            revision: { type: 'integer', required: true },
            tier: { type: 'string', required: true },
            tokenCount: { type: 'integer', required: true },
            appliedTokenNames: {
              type: 'array',
              required: true,
              items: { type: 'string' },
            },
          },
        },
        render: (_args, value) => [{
          type: 'text',
          text: value.activeName != null
            ? `当前外观：${value.activeName}（${value.tokenCount} 个令牌覆盖，档位 ${value.tier}）`
            : `当前为默认外观（档位 ${value.tier}）`,
        }],
      },
      execute: () => Promise.resolve(inspectState(env)),
      presentCall: () => ({ card: 'generic', title: '查看当前外观', kind: 'other', rawInput: null }),
    }),
    defineTool({
      name: 'preset_create',
      description: '按自然语言需求创建外观预设（把用户描述映射为令牌双值）：写入预设库但不自动应用——用户确认后再应用/编辑。'
        + 'tokens 格式：令牌名（-- 开头）→ { light, dark } 双值字符串；明暗一致时重复同一值。'
        + '常用令牌示例：--dsw-alias-bg-base（界面底色）/ --dsw-alias-brand-primary（品牌主色）/ --dsw-alias-label-primary（主文字）'
        + '；品牌色束：--dsw-alias-button-info-fill 与 --dsw-alias-state-business-primary 与品牌主色同值。'
        + '设计流程：先 preset_catalog 查令牌语义与风格字典（styles），风格词可 preset_list 看出厂预设的 style 标签'
        + '或 preset_get <demo id> 读其令牌作风范例（如 default 海洋清爽——唯一出厂预设）；'
        + '创建前可 preset_check 预检。注意 safety 字段：caution 级令牌影响面大，谨慎调整（与界面提示一致）。',
      parameters: {
        name: { type: 'string', required: true, description: '预设名称（≤64 字符）' },
        tokens: {
          type: 'object',
          required: true,
          additionalProperties: true,
          description: '令牌 → { light, dark } 双值映射，如 {"--dsw-alias-bg-base": {"light": "#ffffff", "dark": "#0d121b"}}',
        },
        css: {
          type: 'array',
          description: '可选 CSS 补丁：{ selector（须 [data- 锚点开头）, rules（禁止花括号）} 数组',
        },
        assets: {
          type: 'array',
          description: '可选素材引用声明（id 来自 asset_list）：[{ id, name, mime }]——壁纸库文件引用，不含图片数据',
        },
        widgets: {
          type: 'array',
          description: '可选注入部件：'
            + '[{ id: "chat-background"|"settings-background"|"sidebar-poster", params: { assetId: <assets 声明中的 id>, opacity: "0~1 字符串" } }]'
            + '——assetId 必须同时出现在 assets 声明里；裁剪交互留给 UI，不要写裁剪参数',
        },
        theme: {
          type: 'object',
          additionalProperties: true,
          description: '可选主题注册（启用后用户可在界面「切换到此主题」）：{ id: 合法标识符（小写字母数字开头，允许中划线，惯例 <预设id>-theme）,'
            + ' colorScheme: "light"|"dark"（决定明暗基色板方向）, tokens?: 主题令牌双值（省略 = 自动使用本预设全部令牌）}',
        },
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ok: { type: 'boolean', required: true },
            id: { type: 'string', required: true },
          },
        },
        render: (_args, value) => [{
          type: 'text',
          text: value.ok ? `已创建预设 ${value.id}（未应用，用户确认后生效）` : '创建失败',
        }],
      },
      execute: (args: { name: string; tokens: unknown; css?: unknown; assets?: unknown; widgets?: unknown; theme?: unknown }) => {
        const id = createPresetFile(env, {
          name: args.name, tokens: args.tokens, css: args.css, assets: args.assets, widgets: args.widgets, theme: args.theme,
        })
        return Promise.resolve({ ok: true, id })
      },
      presentCall: args => ({ card: 'generic', title: '创建预设', kind: 'other', rawInput: args }),
    }),
    defineTool({
      name: 'preset_catalog',
      description: '查询令牌目录语义与设计参考（设计预设的字典）：按名称/分组过滤返回令牌（名称/分组/明暗默认值/安全等级/取值类型/影响面 scope），'
        + '返回旋钮束映射（旋钮 id/类别/控件类型/数值边界/覆盖的令牌）、CSS 补丁可用锚点（css_anchors）与风格术语字典（styles：'
        + '用户风格词 → 设计手法 + 可参考的出厂预设——如 "清爽" 可 preset_get default 读其令牌作风范例）。'
        + '命中超过 200 条只返回前 200，请用更精确的 query 过滤（提示：分组名可用 alias/specific/static 一次拿全对应组）。'
        + 'preset_create/update 前先查这里，令牌名必须 -- 开头；注意 safety 字段：caution 级令牌影响面大，谨慎调整（与界面提示一致）。',
      parameters: {
        query: { type: 'string', description: '名称子串或分组名过滤（如 "bg" 或 "bg-base"、"alias" 拿全 alias 组；省略 = 全部，最多 200 条）' },
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            matched: { type: 'integer', required: true },
            tokens: {
              type: 'array', required: true,
              items: { type: 'object', additionalProperties: true },
            },
            knobs: {
              type: 'array', required: true,
              items: { type: 'object', additionalProperties: true },
            },
            knob_categories: {
              type: 'array', required: true,
              items: { type: 'object', additionalProperties: true },
            },
            css_anchors: {
              type: 'array', required: true,
              items: { type: 'object', additionalProperties: false, properties: { selector: { type: 'string', required: true }, label: { type: 'string', required: true }, note: { type: 'string', required: true } } },
            },
            styles: {
              type: 'array', required: true,
              items: { type: 'object', additionalProperties: false, properties: { term: { type: 'string', required: true }, guidance: { type: 'string', required: true }, demos: { type: 'array', required: true, items: { type: 'string' } } } },
            },
          },
        },
        render: (_args, value) => [{
          type: 'text',
          text: `令牌目录命中 ${value.matched} 条；旋钮束 ${value.knobs.length} 个（如 ${value.knobs.map((k: { name: string }) => k.name).slice(0, 5).join('、')}…）；CSS 锚点 ${value.css_anchors.length} 个；风格字典 ${value.styles.length} 词`,
        }],
      },
      execute: (args: { query?: string }) => {
        const query = (args.query ?? '').trim().toLowerCase()
        // #68 P2：matched = 全部匹配数（截断前），tokens 只返回前 200——LLM 能感知还有更多
        const matchedEntries = catalog.entries.filter(entry => query === ''
          || entry.name.toLowerCase().includes(query)
          || entry.group.includes(query))
        const tokens = matchedEntries.slice(0, 200).map(entry => ({
          name: entry.name,
          group: entry.group,
          light: entry.light,
          dark: entry.dark,
          safety: entry.safety,
          valueType: entry.valueType,
          // #68 P2：补 scope（global/local 影响面）；#74：description 并入中文语义层（内置）
          scope: entry.scope,
          description: entry.description !== '' ? entry.description : (TOKEN_DESCRIPTIONS[entry.name] ?? ''),
        }))
        // #68 P2：knobs 补控件语义（category/control/数值边界/选项）——LLM 知道 select 的取值集合
        const knobs = KNOBS.map(knob => ({
          id: knob.id,
          name: knob.name,
          description: knob.description,
          tokens: knob.bundle,
          category: knob.category,
          control: knob.control,
          min: knob.min,
          max: knob.max,
          step: knob.step,
          unit: knob.unit,
          options: knob.options,
        }))
        const knobCategories = KNOB_CATEGORIES.map(cat => ({ id: cat.id, name: cat.name, description: cat.description }))
        return Promise.resolve({ matched: matchedEntries.length, tokens, knobs, knob_categories: knobCategories, css_anchors: CSS_ANCHORS, styles: STYLE_GUIDE })
      },
      presentCall: args => ({ card: 'generic', title: '查询令牌目录', kind: 'other', rawInput: args }),
    }),
    defineTool({
      name: 'preset_get',
      description: '读取指定预设的完整详情（id 来自 preset_list）：令牌双值/css 补丁/主题/部件参数/封面/风格标签/备份标记——'
        + 'preset_update 微调前先读现值，避免整体替换覆盖未知内容；内置示例也可读（含 style 风格标签——'
        + '可作为设计范例：如用户要"海洋清爽风格"先 preset_get default 参考其令牌取值手法）。'
        + '素材只返回元数据（id/name/mime/体积，不含图片数据）。',
      parameters: {
        id: { type: 'string', required: true, description: '预设 id（preset_list 返回）' },
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ok: { type: 'boolean', required: true },
            preset: { type: 'object', additionalProperties: true, required: true },
          },
        },
        render: (_args, value) => [{
          type: 'text',
          text: value.ok === true && value.preset !== undefined
            ? `预设「${value.preset.name}」详情已返回（${value.preset.tokenCount} 令牌${value.preset.hasBackup ? '，有备份' : ''}）`
            : '读取失败',
        }],
      },
      execute: (args: { id: string }) => {
        const detail = getPresetDetail(env, args.id)
        return Promise.resolve({ ok: true, preset: detail })
      },
      presentCall: args => ({ card: 'generic', title: '读取预设详情', kind: 'other', rawInput: args }),
    }),
    defineTool({
      name: 'preset_update',
      description: '更新一个已存在预设（id 来自 preset_list）：按需替换 name/tokens/css/assets/widgets（未提供的字段保持不变），'
        + '校验通过后写回并备份旧版。微调场景（如"把背景改深一点"）推荐用 merge_tokens 增量合并令牌（只更新提供的键，其余保持）——'
        + '避免整体替换覆盖其他令牌。若目标预设是当前生效的活动预设，更新后自动重新应用：界面即时生效（无需再 preset_apply）。'
        + '先 preset_get 读现值、preset_catalog 查语义；safety 为 caution 的令牌影响面大，谨慎调整（与界面提示一致）。'
        + '主题可用 theme（注册/替换）或 clear_theme（清除）。',
      parameters: {
        id: { type: 'string', required: true, description: '目标预设 id' },
        name: { type: 'string', description: '新名称（可选）' },
        tokens: {
          type: 'object',
          additionalProperties: true,
          description: '令牌 → { light, dark } 双值映射（可选；整体替换该字段——与 merge_tokens 二选一，同时提供时 merge_tokens 优先）',
        },
        merge_tokens: {
          type: 'object',
          additionalProperties: true,
          description: '增量合并令牌（可选；只更新提供的键，未提供的保持原值——微调推荐；与 tokens 二选一）',
        },
        css: { type: 'array', description: '可选 CSS 补丁（整体替换）' },
        assets: {
          type: 'array',
          description: '可选素材引用声明（整体替换；id 来自 asset_list）：[{ id, name, mime }]——壁纸库文件引用，不含图片数据',
        },
        widgets: {
          type: 'array',
          description: '可选注入部件（整体替换）：'
            + '[{ id: "chat-background"|"settings-background"|"sidebar-poster", params: { assetId: <assets 声明中的 id>, opacity: "0~1 字符串" } }]'
            + '——assetId 必须同时出现在 assets 声明里；裁剪交互留给 UI',
        },
        theme: {
          type: 'object',
          additionalProperties: true,
          description: '可选主题（整体替换；与 clear_theme 二选一）：{ id: 合法标识符（惯例 <预设id>-theme）, colorScheme: "light"|"dark",'
            + ' tokens?: 主题令牌双值（省略 = 自动使用当前预设令牌）}',
        },
        clear_theme: {
          type: 'boolean',
          description: '清除主题注册（可选；与 theme 二选一，同时提供时 clear_theme 优先）',
        },
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ok: { type: 'boolean', required: true },
            id: { type: 'string', required: true },
          },
        },
        render: (_args, value) => [{
          type: 'text',
          text: value.ok ? `已更新预设 ${value.id}（旧版已备份）` : '更新失败',
        }],
      },
      execute: (args: { id: string; name?: string; tokens?: unknown; css?: unknown; merge_tokens?: unknown; assets?: unknown; widgets?: unknown; theme?: unknown; clear_theme?: boolean }) => {
        const id = updatePresetFile(env, args.id, {
          name: args.name, tokens: args.tokens, css: args.css, mergeTokens: args.merge_tokens,
          assets: args.assets, widgets: args.widgets, theme: args.clear_theme === true ? null : args.theme,
        })
        // #63 P0-1：目标为当前活动预设 → 写 active.json（revision+1）驱动浏览器桥重应用——
        // 桥对"id 相同"也会重应用（applyPresetById 内部对已活动预设跳过重复持久化，防自激）。
        if (readActiveState(env).activePresetId === id) writeActiveState(env, id)
        return Promise.resolve({ ok: true, id })
      },
      presentCall: args => ({ card: 'generic', title: '更新预设', kind: 'other', rawInput: args }),
    }),
    defineTool({
      name: 'preset_delete',
      description: '删除一个用户预设（内置示例不可删）。若删除的是当前活动预设，外观自动还原为默认。',
      parameters: {
        id: { type: 'string', required: true, description: '目标预设 id' },
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ok: { type: 'boolean', required: true },
            id: { type: 'string', required: true },
          },
        },
        render: (_args, value) => [{
          type: 'text',
          text: value.ok ? `已删除预设 ${value.id}` : '删除失败',
        }],
      },
      execute: (args: { id: string }) => {
        if (!safePresetId(args.id)) throw new Error('preset_delete: 非法 id')
        if (isDemoPreset(args.id)) throw new Error('preset_delete: 内置示例不可删除')
        deletePresetFile(env, args.id)
        // 删除活动预设 → 外观还原默认
        if (readActiveState(env).activePresetId === args.id) writeActiveState(env, null)
        return Promise.resolve({ ok: true, id: args.id })
      },
      presentCall: args => ({ card: 'generic', title: '删除预设', kind: 'other', rawInput: args }),
    }),
    defineTool({
      name: 'preset_revert',
      description: '还原默认外观（清除活动预设）：撤销之前 preset_apply 的效果，回到 DSH 出厂配色。',
      parameters: {},
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ok: { type: 'boolean', required: true },
          },
        },
        render: (_args, value) => [{
          type: 'text',
          text: value.ok ? '已还原默认外观' : '操作失败',
        }],
      },
      execute: () => {
        writeActiveState(env, null)
        return Promise.resolve({ ok: true })
      },
      presentCall: () => ({ card: 'generic', title: '还原默认外观', kind: 'other', rawInput: null }),
    }),
    defineTool({
      name: 'asset_list',
      description: '列出壁纸库已有素材（聊天背景/设置卡背景/侧栏海报可用的图片）：id/名称/mime/体积——'
        + '设置部件（widgets）前先查这里，用返回的 id 引用素材（id 不能凭空编造）；素材上传仍由用户在界面完成。',
      parameters: {},
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            assets: {
              type: 'array',
              required: true,
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  id: { type: 'string', required: true },
                  name: { type: 'string', required: true },
                  mime: { type: 'string', required: true },
                  size: { type: 'integer', required: true },
                  // #96（审计）：分层合成壁纸（#90）的 layers 元数据随 listWallpaperAssets 输出——
                  // additionalProperties:false 下未声明键会让宿主输出校验抛错（测试 stub 掩盖）
                  layers: {
                    type: 'object',
                    additionalProperties: true,
                    properties: {
                      animAssetId: { type: 'string' },
                      x: { type: 'number' },
                      y: { type: 'number' },
                      w: { type: 'number' },
                      h: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
        render: (_args, value) => [{
          type: 'text',
          text: `壁纸库共 ${value.assets.length} 个素材：${value.assets.map((a: { name: string }) => a.name).join('、')}`,
        }],
      },
      execute: () => Promise.resolve({ assets: listWallpaperAssets(env) }),
      presentCall: () => ({ card: 'generic', title: '列出壁纸库素材', kind: 'other', rawInput: null }),
    }),
    defineTool({
      name: 'preset_restore_backup',
      description: '把预设还原到备份版本（backup.json——覆盖保存/更新时自动保留的旧版；与界面「还原备份」同语义）：'
        + '**交换式还原**——当前版本自动存入备份（单层备份，可再还原回去）。'
        + '用于纠错：preset_update 改坏了可还原；preset_delete 删错了无法恢复（删除会连备份销毁，谨慎）。'
        + '若目标是当前生效的活动预设，还原后自动重新应用：界面即时生效。无备份/备份损坏会报错。',
      parameters: {
        id: { type: 'string', required: true, description: '目标预设 id（preset_list 返回）' },
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ok: { type: 'boolean', required: true },
            id: { type: 'string', required: true },
            name: { type: 'string', required: true },
          },
        },
        render: (_args, value) => [{
          type: 'text',
          text: value.ok === true ? `已还原预设「${value.name}」（当前版本已存入备份）` : '还原失败',
        }],
      },
      execute: (args: { id: string }) => {
        const result = restoreBackupFile(env, args.id)
        // #63 同款：目标为活动预设 → revision+1 驱动桥重应用（界面即时生效）
        if (readActiveState(env).activePresetId === args.id) writeActiveState(env, args.id)
        return Promise.resolve({ ok: true, id: args.id, name: result.name })
      },
      presentCall: args => ({ card: 'generic', title: '还原预设备份', kind: 'other', rawInput: args }),
    }),
    defineTool({
      name: 'preset_check',
      description: '质量预检（创建/更新预设前调用）：校验候选完整载荷（tokens/css/assets/widgets/theme，与 preset_create 同构——'
        + '通过 = 提供的字段必能落盘），并评估文字与按钮对比度（label 家族 vs 各组件面 + 按钮文字 vs 按钮填充，明暗各算；'
        + 'FAIL/仅大文本达标会提示，低对比可保存但建议调整——与界面徽标同语义）、未知令牌、明暗反转。'
        + '输出 issues 逐条说明（error=阻断 / warn=建议）。',
      parameters: {
        tokens: {
          type: 'object',
          required: true,
          additionalProperties: true,
          description: '候选令牌 → { light, dark } 双值映射（与 preset_create 的 tokens 同格式）',
        },
        css: {
          type: 'array',
          description: '可选候选 CSS 补丁（与 preset_create 的 css 同格式；检查选择器白名单）',
        },
        assets: {
          type: 'array',
          description: '可选候选素材引用声明（与 preset_create 的 assets 同格式；校验结构）',
        },
        widgets: {
          type: 'array',
          description: '可选候选部件（与 preset_create 的 widgets 同格式；校验结构与引用）',
        },
        theme: {
          type: 'object',
          additionalProperties: true,
          description: '可选候选主题（与 preset_create 的 theme 同格式；校验结构）',
        },
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ok: { type: 'boolean', required: true },
            issues: {
              type: 'array',
              required: true,
              items: { type: 'object', additionalProperties: true },
            },
            summary: { type: 'object', additionalProperties: true, required: true },
          },
        },
        render: (_args, value) => [{
          type: 'text',
          text: value.ok === true
            ? `预检通过：${value.summary.tokenCount} 令牌${value.summary.contrastIssues > 0 ? `，${value.summary.contrastIssues} 条对比度提示` : ''}`
            : `预检未通过：${value.issues.filter((i: { severity: string }) => i.severity === 'error').length} 个阻断问题`,
        }],
      },
      execute: (args: { tokens: unknown; css?: unknown; assets?: unknown; widgets?: unknown; theme?: unknown }) => {
        const result = precheckPreset(
          (args.tokens ?? {}) as Record<string, unknown>,
          Array.isArray(args.css) ? args.css as Array<{ selector: unknown; rules?: unknown }> : undefined,
          { assets: args.assets, widgets: args.widgets, theme: args.theme },
        )
        return Promise.resolve(result)
      },
      presentCall: args => ({ card: 'generic', title: '质量预检', kind: 'other', rawInput: args }),
    }),
  ]
}

/** 工具注册（零抛错契约：任何失败只 warn，不冒泡）。 */
export async function registerPresetTools(
  tools: { register(definition: unknown): () => void },
  env: ToolsEnv,
): Promise<Array<() => void>> {
  const disposers: Array<() => void> = []
  try {
    const { defineTool } = await import('@deepseek-ai/dsh-tools')
    const defs = createPresetToolDefs(env, defineTool as (definition: unknown) => unknown)
    for (const definition of defs) {
      disposers.push(tools.register(definition))
    }
    registered = true
    // #68/#96：注册日志补全 12 个工具清单（preset_check 曾漏列）
    console.log('[wallpaper-plugin] AI 工具已注册（preset_list/apply/inspect/create/catalog/get/update/delete/revert/restore_backup/check + asset_list）')
    return disposers
  } catch (error) {
    console.warn('[wallpaper-plugin] dsh-tools 不可用，AI 工具未注册（零抛错降级）：', error instanceof Error ? error.message : String(error))
    return disposers
  }
}
