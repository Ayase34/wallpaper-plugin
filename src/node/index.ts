/**
 * ui-presets Node half（host 侧）：预设库文件 API + 活动预设持久化。
 * 路由（spike/plugin-manager 实证范式）：
 * - GET    /ui-presets/presets        → { presets: [{id, meta, hasBackup}] }
 * - GET    /ui-presets/presets/:id    → { preset }
 * - GET    /ui-presets/presets/:id?backup=1 → { backup: Preset | null }（#62 备份还原入口；损坏 → 422）
 * - PUT    /ui-presets/presets/:id    → 校验后写入 <dshHome>/.ui-presets/<id>/preset.json（可携带 backup 旧版）
 * - DELETE /ui-presets/presets/:id    → 删除目录（三件套）
 * - GET    /ui-presets/active         → { activePresetId: string | null }
 * - PUT    /ui-presets/active         → 写 <dshHome>/data/ui-presets/active.json
 * 持久化架构说明：settings 文档对第三方插件不可用（host apiproxy 有硬编码 namespace
 * 暴露白名单，settings-not-exposed）——活动预设走插件自有文件，经 Node half 读写
 * （AI 工具（Node half）与浏览器（fetch）共用同一事实源）。
 * 安全（红线 §7，评审修复后）：
 * - apply 零抛错：inject 为空（webServer 缺失 → 静默降级，不 pending）；路由注册包
 *   registerSafe（重复路由 throw 不冒泡）；全部 handler try/catch 返回 JSON 错误
 * - CSRF：有 Origin 必须与 Host 一致，有 Origin 缺 Host 拒绝
 * - 路径穿越：safePresetId 白名单 + decode 后校验；坏 % 转义 → 400
 * - 原子写：tmp + rename（崩溃不损坏文件）
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import z from '@deepseek-ai/schemastery'
import { validatePreset } from '../core/schema.ts'
import type { Preset } from '../core/schema.ts'
import { coverSvgFor } from '../core/cover.ts'
import { zipStore, parseZip } from './zip-util.ts'
import { MAX_ASSETS, MAX_ASSET_FILE_SIZE } from '../core/widgets.ts'
import { registerPresetTools, isToolsRegistered, readActiveState, writeActiveState, resolvablePresetId, genId, safePresetId, writeFileAtomic } from './tools.ts'
import type { ToolsEnv } from './tools.ts'
import { resolveConfiguredDirs, type UiPresetsConfig } from './config.ts'
import { DEMO_PRESETS } from '../core/demo-data.ts'

// #95（正式收尾）：插件改名 wallpaper-plugin——注册名/日志前缀同步；路由前缀 /ui-presets
// 与数据目录（<dshHome>/.ui-presets、data/ui-presets）作为内部 API/存量数据保留不变。
export const name = 'wallpaper-plugin'

/**
 * M5-1 schemastery Config spike：宿主 cordis loader 对第三方插件 Config 的支持实证。
 * 机制（源码核实）：loader patch 行 config → `registry.plugin(plugin, config)` →
 * fiber `resolveConfig` 对 `plugin.Config`（schemastery schema）做 `~standard.validate`，
 * 失败抛 ValidationError → 该插件行 FAILED（**fail-loud 红线：应用无法启动**）。
 * 因此 schema 必须全可选 + 宽松（DSH fork 语义：字段默认可选，`.required()` 才必填）。
 * 配置项：presetsDir 预设库目录 / assetsDir 壁纸库目录（默认 <dshHome> 下，同决策 #14 架构）。
 */
export { type UiPresetsConfig }

export const Config: z<UiPresetsConfig> = z.object({
  presetsDir: z.string(),
  assetsDir: z.string(),
})

/** 不声明 inject：webServer 由 dsh-web-app 组合提供，装到 headless profile 时
 * 若声明 inject 会永久 pending → 整个启动失败（架构评审 P0-2）。
 * 改为 apply 内 ctx.get 条件降级：webServer 缺失 = 插件静默无操作面。 */
export const inject: string[] = []

const DSH_HOME = process.env.DSH_HOME ?? join(homedir(), '.dsh')
let PRESETS_DIR = join(DSH_HOME, '.ui-presets')
let DATA_DIR = join(DSH_HOME, 'data', 'ui-presets')
const ACTIVE_FILE = join(DATA_DIR, 'active.json')
/** 插件自有配置（对外档位等；settings 文档被 apiproxy 白名单封死 → 自有文件，与 active.json 同款）。 */
const CONFIG_FILE = join(DATA_DIR, 'config.json')
/** 请求体上限（M2-8/#51）：预设可含旧版内嵌素材（base64 最多 28M 字符）+ 元数据 → 30MB。 */
const BODY_LIMIT = 30 * 1024 * 1024
/** zip 导入上限（三件套 + 内嵌素材；20MB 素材文件在 store 模式下接近原大小 → 28MB）。 */
const ZIP_BODY_LIMIT = 28 * 1024 * 1024
/** 素材文件上传上限（20MB + 余量）。 */
const ASSET_BODY_LIMIT = MAX_ASSET_FILE_SIZE + 64 * 1024
/** 壁纸库目录（插件自有目录内：<dshHome>/.ui-presets/assets；M5-1 可经 Config 覆盖）。 */
let ASSETS_DIR = join(PRESETS_DIR, 'assets')

export { DSH_HOME, PRESETS_DIR, DATA_DIR, ACTIVE_FILE, CONFIG_FILE, ASSETS_DIR }

/** 工具层环境（AI 工具与路由共用同一事实源）。
 * review P1-2（全量评审）修复：原为模块顶层 const 拷贝目录字符串——Config presetsDir
 * 覆盖后 TOOLS_ENV 仍持旧目录 → AI 工具与 HTTP 路由分叉（写默认目录、读配置目录）。
 * 改为惰性 getter：每次访问读当前模块变量。 */
function toolsEnv(): ToolsEnv {
  return {
    presetsDir: PRESETS_DIR,
    assetsDir: ASSETS_DIR,
    dataDir: DATA_DIR,
    activeFile: ACTIVE_FILE,
    configFile: CONFIG_FILE,
  }
}

/** M5-1：按宿主 Config（schemastery）覆盖数据目录——纯函数归一化（schema 宽松不校验内容，
 * 运行时防御式兜底，保证非法值不崩）。 */
function applyConfigOverrides(config: UiPresetsConfig): void {
  const resolved = resolveConfiguredDirs(config, { presetsDir: PRESETS_DIR, assetsDir: ASSETS_DIR })
  PRESETS_DIR = resolved.presetsDir
  ASSETS_DIR = resolved.assetsDir
}

/** 路由端点常量（client 构建时内联，单一来源）。 */
export const ROUTE_PREFIX = '/ui-presets'
export const PRESETS_PATH = `${ROUTE_PREFIX}/presets`

function json(res: ServerResponseLike, status: number, body: unknown, extra: Record<string, string> = {}): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...extra })
  res.end(JSON.stringify(body))
}

/** review P3（全量评审）：错误消息脱敏——error.message 可能含绝对路径（ENOENT 等），
 * 统一过滤盘符路径与用户目录（本地单用户应用影响低，仍防御）。
 * 修复（#62 实测发现）：原实现 `const raw = safeErrorMessage(error)` 自递归——
 * 任何错误路径 RangeError 后由宿主路由守卫兜底成 400 空体（历史 e2e 只断言非 2xx 未暴露）。 */
function safeErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error)
  return raw
    .replace(/[A-Za-z]:\\[^\s"']*/g, '<path>')
    .replace(/\/[A-Za-z0-9_\-./]*(?:\.[A-Za-z0-9]+)?(?=\s|$|")/g, match => {
      // 仅替换含盘符样式的绝对路径段（保留错误文案中的正常单词）
      return /^\/[A-Za-z]/.test(match) ? '<path>' : match
    })
    .slice(0, 500)
}

/** 跨源拒绝：有 Origin 时必须与 Host 一致；缺 Origin（同源导航/curl）放行；
 * 有 Origin 缺 Host 视为异常请求拒绝（评审 P2 修复：原实现放行，方向相反）。 */
function isCrossOrigin(req: IncomingMessageLike): boolean {
  const origin = req.headers.origin
  if (origin === undefined) return false
  const host = req.headers.host
  if (host === undefined) return true
  try {
    return new URL(origin).host !== host
  } catch {
    return true
  }
}

/** 安全注册路由（架构评审 P0-1 修复）：webServer 对重复 (kind,path) 直接 throw——
 * 在 ctx.effect 内裸调用会让插件 FAILED → 整应用无法启动。失败降级为该路由未注册。 */
function registerSafe(
  webServer: { register(options: unknown): () => void },
  options: unknown,
  label: string,
  disposers: Array<() => void>,
): void {
  try {
    disposers.push(webServer.register(options))
  } catch (error) {
    console.warn(`[ui-presets] 路由注册失败（${label}）：`, error)
  }
}

// #96（审计）：writeFileAtomic/safePresetId 与 tools.ts 重复实现——统一从 tools.ts 导入
// （同模块图内共享，避免两处静默分叉）。

async function readBody(req: IncomingMessageLike): Promise<string | null> {
  let data = ''
  for await (const chunk of req) {
    data += chunk
    if (data.length > BODY_LIMIT) return null
  }
  return data
}

/** 二进制请求体（zip/素材上传用；chunk 可能是 string 或 Uint8Array；上限参数化）。 */
async function readBodyBuffer(req: IncomingMessageLike, limit: number): Promise<Uint8Array | null> {
  const chunks: Uint8Array[] = []
  let total = 0
  for await (const chunk of req) {
    const bytes = typeof chunk === 'string' ? new TextEncoder().encode(chunk) : new Uint8Array(chunk as ArrayBuffer)
    chunks.push(bytes)
    total += bytes.length
    if (total > limit) return null
  }
  const out = new Uint8Array(total)
  let pos = 0
  for (const chunk of chunks) { out.set(chunk, pos); pos += chunk.length }
  return out
}

// #96（审计）：safePresetId 已从 tools.ts 导入（去重）。

function presetDir(id: string): string {
  return join(PRESETS_DIR, id)
}

/** 从请求路径剥离指定前缀（评审 P2 修复：原 replace 是"任意位置替换"）。 */
function stripPrefix(pathname: string, prefix: string): string | null {
  if (!pathname.startsWith(prefix)) return null
  const rest = pathname.slice(prefix.length)
  return rest.startsWith('/') ? rest.slice(1) : rest
}

/** 安全解码 URL 段：坏 % 转义返回 null（评审 P2 修复：原 decodeURIComponent 抛 URIError → 500）。 */
function decodeSegment(segment: string): string | null {
  try {
    return decodeURIComponent(segment)
  } catch {
    return null
  }
}

function metaOf(id: string, preset: unknown): { id: string; name: string; edition: string } {
  const record = (preset ?? {}) as { name?: unknown; edition?: unknown }
  return {
    id,
    name: typeof record.name === 'string' ? record.name : id,
    edition: typeof record.edition === 'string' ? record.edition : 'standard',
  }
}

/**
 * 应用入口：路由经 ctx.inject(['webServer']) 惰性注册（ui-theme 同款范式）——
 * webServer 由 dsh-web-app 提供，可能晚于本插件 apply 激活；ctx.inject 保证
 * 服务就绪才执行回调，服务缺失（headless profile）则回调永不执行：不 pending、不 fail、
 * 不抛错（评审 P0-2 修复：ctx.get 即时取值在 apply 早期拿不到 webServer，路由会静默不注册）。
 */
export function apply(ctx: ContextLike, config: UiPresetsConfig = {}): void {
  // M5-1：宿主 Config（schemastery）目录覆盖——先于一切路由/工具注册生效。
  applyConfigOverrides(config)
  // ---- AI 工具：tools 服务惰性接入（M2-3）----
  // 不声明 plugin inject（headless 无 tools 服务会永久 pending → 整应用启动失败，红线）；
  // ctx.inject 回调在服务就绪后执行，服务缺失则永不执行：不 pending、不 fail。
  // dsh-tools 包本身动态导入 + try/catch（静态导入在模块加载期失败会 FAILED 整插件）。
  ctx.inject?.(['tools'], (toolCtx: ContextLike) => {
    const tools = toolCtx.get('tools') as { register(definition: unknown): () => void } | undefined
    if (tools === undefined || typeof tools.register !== 'function') return
    toolCtx.effect(() => {
      const disposers: Array<() => void> = []
      void registerPresetTools(tools, toolsEnv()).then(registeredDisposers => {
        disposers.push(...registeredDisposers)
      })
      return () => {
        for (const dispose of disposers) {
          try { dispose() } catch { /* 注销失败不阻塞 */ }
        }
      }
    }, 'ui-presets: ai tools')
  })

  ctx.inject?.(['webServer'], (httpCtx: ContextLike) => {
    const webServer = httpCtx.get('webServer')
    if (webServer === undefined || typeof webServer.register !== 'function') return

    try {
      mkdirSync(PRESETS_DIR, { recursive: true })
      mkdirSync(DATA_DIR, { recursive: true })
      mkdirSync(ASSETS_DIR, { recursive: true })
    } catch { /* 目录创建失败：写端点会报 500，读端点空列表 */ }

    httpCtx.effect(() => {
    const disposers: Array<() => void> = []

    // ---- 列表：GET /ui-presets/presets ----
    registerSafe(webServer, {
      kind: 'exact',
      path: PRESETS_PATH,
      handler: async (req: IncomingMessageLike, res: ServerResponseLike) => {
        try {
          if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed; use GET' }, { allow: 'GET' })
          const presets: Array<{ id: string; name: string; edition: string; hasBackup: boolean }> = []
          let dirs: string[] = []
          try { dirs = readdirSync(PRESETS_DIR) } catch { /* 目录不存在 = 空库 */ }
          for (const id of dirs) {
            if (!safePresetId(id)) continue
            try {
              const raw = JSON.parse(readFileSync(join(presetDir(id), 'preset.json'), 'utf8'))
              // #62 备份还原入口：列表携带 hasBackup（工作室左栏按此显隐「还原备份」按钮）
              presets.push({ ...metaOf(id, raw), hasBackup: existsSync(join(presetDir(id), 'backup.json')) })
            } catch { /* 损坏条目跳过（不阻塞整个列表） */ }
          }
          presets.sort((a, b) => a.id.localeCompare(b.id))
          json(res, 200, { presets }, { 'cache-control': 'no-store' })
        } catch (error) {
          json(res, 500, { error: safeErrorMessage(error) })
        }
      },
    }, 'presets', disposers)

    // ---- 单条操作：GET/PUT/DELETE /ui-presets/presets/:id ----
    registerSafe(webServer, {
      kind: 'prefix',
      path: PRESETS_PATH,
      handler: async (req: IncomingMessageLike, res: ServerResponseLike) => {
        try {
          if (req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'DELETE') {
            return json(res, 405, { error: 'method not allowed' }, { allow: 'GET, PUT, DELETE' })
          }
          const pathname = new URL(req.url ?? '/', 'http://dsh.internal').pathname
          const rest = stripPrefix(pathname, PRESETS_PATH)
          const decoded = rest === null ? null : decodeSegment(rest)
          if (decoded === null || !safePresetId(decoded)) return json(res, 400, { error: 'invalid preset id' })
          const id = decoded

          if (req.method === 'GET') {
            // #62 备份还原入口：?backup=1 → 返回 backup.json 内容（无备份 → null；损坏 → 422）
            const requestUrl = new URL(req.url ?? '/', 'http://dsh.internal')
            if (requestUrl.searchParams.get('backup') !== null) {
              const backupFile = join(presetDir(id), 'backup.json')
              if (!existsSync(backupFile)) return json(res, 200, { backup: null }, { 'cache-control': 'no-store' })
              try {
                const raw = JSON.parse(readFileSync(backupFile, 'utf8'))
                const result = validatePreset(raw)
                if (!result.ok) {
                  return json(res, 422, { error: `备份损坏：${result.errors[0] ?? '校验失败'}` })
                }
                return json(res, 200, { backup: result.preset }, { 'cache-control': 'no-store' })
              } catch (error) {
                return json(res, 422, { error: `备份损坏：${safeErrorMessage(error)}` })
              }
            }
            const file = join(presetDir(id), 'preset.json')
            if (!existsSync(file)) return json(res, 404, { error: `preset ${id} 不存在` })
            let preset: unknown
            try { preset = JSON.parse(readFileSync(file, 'utf8')) } catch (error) {
              return json(res, 422, { error: `preset ${id} 损坏：${safeErrorMessage(error)}` })
            }
            return json(res, 200, { preset }, { 'cache-control': 'no-store' })
          }

          // 写/删需要 CSRF 校验
          if (isCrossOrigin(req)) return json(res, 403, { error: 'cross-origin request rejected' })

          if (req.method === 'DELETE') {
            try { rmSync(presetDir(id), { recursive: true, force: true }) } catch (error) {
              return json(res, 500, { error: `删除失败：${safeErrorMessage(error)}` })
            }
            // #96（审计）：删除活动预设 → 顺带清空活动指针（与工具层/客户端删除语义对齐；
            // 否则重启后 adoptPersisted 对幽灵 id 静默失败）
            if (readActiveState(toolsEnv()).activePresetId === id) writeActiveState(toolsEnv(), null)
            return json(res, 200, { ok: true, id }, { 'cache-control': 'no-store' })
          }

          // PUT：校验后原子写入（可携带 backup 旧版本 → backup.json，评审 M1 保存备份）
          const raw = await readBody(req)
          if (raw === null) return json(res, 413, { error: 'request body too large' })
          let parsed: unknown
          try { parsed = JSON.parse(raw) } catch { return json(res, 400, { error: 'invalid JSON body' }) }
          const payload = parsed as { preset?: unknown; backup?: unknown } | null
          const preset = payload?.preset
          const result = validatePreset(preset)
          if (!result.ok) return json(res, 422, { errors: result.errors })
          if (result.preset.id !== id) return json(res, 400, { error: 'preset.id 与路径不一致' })
          try {
            mkdirSync(presetDir(id), { recursive: true })
            writeFileAtomic(join(presetDir(id), 'preset.json'), JSON.stringify(result.preset, null, 2))
            if (payload?.backup !== undefined) {
              writeFileAtomic(join(presetDir(id), 'backup.json'), JSON.stringify(payload.backup, null, 2))
            }
          } catch (error) {
            return json(res, 500, { error: `写入失败：${safeErrorMessage(error)}` })
          }
          return json(res, 200, { ok: true, id }, { 'cache-control': 'no-store' })
        } catch (error) {
          json(res, 500, { error: safeErrorMessage(error) })
        }
      },
    }, 'presets/:id', disposers)

    // ---- 活动预设：GET/PUT /ui-presets/active ----
    registerSafe(webServer, {
      kind: 'exact',
      path: `${ROUTE_PREFIX}/active`,
      handler: async (req: IncomingMessageLike, res: ServerResponseLike) => {
        try {
          if (req.method !== 'GET' && req.method !== 'PUT') {
            return json(res, 405, { error: 'method not allowed' }, { allow: 'GET, PUT' })
          }
          if (req.method === 'GET') {
            const active = readActiveState(toolsEnv())
            return json(res, 200, { activePresetId: active.activePresetId, revision: active.revision }, { 'cache-control': 'no-store' })
          }
          if (isCrossOrigin(req)) return json(res, 403, { error: 'cross-origin request rejected' })
          const raw = await readBody(req)
          if (raw === null) return json(res, 413, { error: 'request body too large' })
          let body: unknown
          try { body = JSON.parse(raw) } catch { return json(res, 400, { error: 'invalid JSON body' }) }
          const id = (body as { activePresetId?: unknown } | null)?.activePresetId
          if (id !== null && (typeof id !== 'string' || !safePresetId(id))) {
            return json(res, 400, { error: 'activePresetId 必须是合法预设 id 或 null' })
          }
          // review P3（全量评审）：校验预设存在（库或内置 demo）——避免幽灵活动指针
          // （删除预设后残留指针，每次重启 adoptPersisted 静默失败）。
          if (id !== null && !resolvablePresetId(toolsEnv(), id)) {
            return json(res, 400, { error: `预设「${id}」不存在，无法设为活动` })
          }
          try {
            writeActiveState(toolsEnv(), id)
          } catch (error) {
            return json(res, 500, { error: `写入失败：${safeErrorMessage(error)}` })
          }
          return json(res, 200, { ok: true, activePresetId: id }, { 'cache-control': 'no-store' })
        } catch (error) {
          json(res, 500, { error: safeErrorMessage(error) })
        }
      },
    }, 'active', disposers)

    // ---- 插件配置：GET/PUT /ui-presets/config（对外档位；M2-2b；#80 回滚后仅 tier） ----
    registerSafe(webServer, {
      kind: 'exact',
      path: `${ROUTE_PREFIX}/config`,
      handler: async (req: IncomingMessageLike, res: ServerResponseLike) => {
        try {
          if (req.method !== 'GET' && req.method !== 'PUT') {
            return json(res, 405, { error: 'method not allowed' }, { allow: 'GET, PUT' })
          }
          if (req.method === 'GET') {
            let tier: string = 'standard'
            try {
              const raw = JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) as { tier?: unknown }
              if (raw.tier === 'simple' || raw.tier === 'standard') tier = raw.tier
            } catch { /* 文件缺失/损坏 = 标准版 */ }
            return json(res, 200, { tier }, { 'cache-control': 'no-store' })
          }
          if (isCrossOrigin(req)) return json(res, 403, { error: 'cross-origin request rejected' })
          const raw = await readBody(req)
          if (raw === null) return json(res, 413, { error: 'request body too large' })
          let body: unknown
          try { body = JSON.parse(raw) } catch { return json(res, 400, { error: 'invalid JSON body' }) }
          const tier = (body as { tier?: unknown } | null)?.tier
          if (tier !== 'simple' && tier !== 'standard') {
            return json(res, 400, { error: 'tier 必须是 simple | standard' })
          }
          try {
            mkdirSync(DATA_DIR, { recursive: true })
            writeFileAtomic(CONFIG_FILE, JSON.stringify({ tier }))
          } catch (error) {
            return json(res, 500, { error: `写入失败：${safeErrorMessage(error)}` })
          }
          return json(res, 200, { ok: true, tier }, { 'cache-control': 'no-store' })
        } catch (error) {
          json(res, 500, { error: safeErrorMessage(error) })
        }
      },
    }, 'config', disposers)

    // ---- 状态：GET /ui-presets/status（诊断 + e2e：档位 / AI 工具注册状态） ----
    // M4 简化（用户拍板）：对外统一标准版——status 固定 standard（config 路由保留兼容，
    // 不再作为 UI 档位事实源）。
    registerSafe(webServer, {
      kind: 'exact',
      path: `${ROUTE_PREFIX}/status`,
      handler: async (req: IncomingMessageLike, res: ServerResponseLike) => {
        try {
          if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed; use GET' }, { allow: 'GET' })
          return json(res, 200, { tier: 'standard', toolsRegistered: isToolsRegistered() }, { 'cache-control': 'no-store' })
        } catch (error) {
          json(res, 500, { error: safeErrorMessage(error) })
        }
      },
    }, 'status', disposers)

    // ---- zip 三件套导出：POST /ui-presets/export-zip（body {preset} → application/zip） ----
    registerSafe(webServer, {
      kind: 'exact',
      path: `${ROUTE_PREFIX}/export-zip`,
      handler: async (req: IncomingMessageLike, res: ServerResponseLike) => {
        try {
          if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed; use POST' }, { allow: 'POST' })
          // review P3（全量评审）：与其他写路由一致——CSRF 校验（原缺失为一致性缺口）。
          if (isCrossOrigin(req)) return json(res, 403, { error: 'cross-origin request rejected' })
          const raw = await readBody(req)
          if (raw === null) return json(res, 413, { error: 'request body too large' })
          let parsed: unknown
          try { parsed = JSON.parse(raw) } catch { return json(res, 400, { error: 'invalid JSON body' }) }
          const result = validatePreset((parsed as { preset?: unknown } | null)?.preset)
          if (!result.ok) return json(res, 422, { errors: result.errors })
          const preset = result.preset
          // M2-8：zip 导出自包含——壁纸库文件内嵌为 dataUrl
          const exportedPreset = embedAssetsToPreset(preset)
          const manifest = {
            id: preset.id,
            name: preset.name,
            edition: preset.edition,
            version: 1,
            dshVersion: preset.targetDshVersion ?? '',
            exportedAt: new Date().toISOString(),
          }
          const zip = zipStore([
            { name: 'preset.json', data: new TextEncoder().encode(JSON.stringify(exportedPreset, null, 2)) },
            { name: 'cover.svg', data: new TextEncoder().encode(coverSvgFor(preset)) },
            { name: 'manifest.json', data: new TextEncoder().encode(JSON.stringify(manifest, null, 2)) },
          ])
          res.writeHead(200, {
            'content-type': 'application/zip',
            'content-disposition': `attachment; filename="${preset.id}.zip"`,
            'content-length': String(zip.length),
            'cache-control': 'no-store',
          })
          res.end(zip)
        } catch (error) {
          json(res, 500, { error: safeErrorMessage(error) })
        }
      },
    }, 'export-zip', disposers)

    // ---- zip 三件套导入：POST /ui-presets/import-zip（原始 zip 体） ----
    registerSafe(webServer, {
      kind: 'exact',
      path: `${ROUTE_PREFIX}/import-zip`,
      handler: async (req: IncomingMessageLike, res: ServerResponseLike) => {
        try {
          if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed; use POST' }, { allow: 'POST' })
          if (isCrossOrigin(req)) return json(res, 403, { error: 'cross-origin request rejected' })
          const buffer = await readBodyBuffer(req, ZIP_BODY_LIMIT)
          if (buffer === null) return json(res, 413, { error: 'request body too large' })
          const { entries, errors: zipErrors } = parseZip(buffer)
          const presetEntry = entries.find(entry => entry.name === 'preset.json')
          if (presetEntry === undefined) {
            return json(res, 422, { error: `zip 中缺少 preset.json${zipErrors.length > 0 ? `（${zipErrors[0]}）` : ''}` })
          }
          let rawPreset: unknown
          try { rawPreset = JSON.parse(new TextDecoder().decode(presetEntry.data)) } catch {
            return json(res, 400, { error: 'zip 内 preset.json 不是合法 JSON' })
          }
          const result = validatePreset(rawPreset)
          if (!result.ok) return json(res, 422, { errors: result.errors })
          // 冲突后缀（与浏览器导入同语义：不覆盖已有）
          let id = result.preset.id
          const existing = new Set(listLibraryIds())
          let suffix = 1
          while (existing.has(id)) {
            id = suffix === 1 ? `${result.preset.id}-imported` : `${result.preset.id}-imported-${suffix}`
            suffix += 1
          }
          const imported = { ...result.preset, id }
          // M2-8：内嵌素材落盘到壁纸库，预设改为引用（dataUrl 剥离）
          const stored = storeEmbeddedAssets(imported)
          try {
            mkdirSync(presetDir(id), { recursive: true })
            writeFileAtomic(join(presetDir(id), 'preset.json'), JSON.stringify(stored, null, 2))
          } catch (error) {
            return json(res, 500, { error: `写入失败：${safeErrorMessage(error)}` })
          }
          return json(res, 200, { ok: true, id }, { 'cache-control': 'no-store' })
        } catch (error) {
          json(res, 500, { error: safeErrorMessage(error) })
        }
      },
    }, 'import-zip', disposers)

    // ---- 壁纸库（素材文件）：PUT/GET /ui-presets/assets；GET/DELETE /ui-presets/assets/:id ----
    registerSafe(webServer, {
      kind: 'exact',
      path: `${ROUTE_PREFIX}/assets`,
      handler: async (req: IncomingMessageLike, res: ServerResponseLike) => {
        try {
          if (req.method === 'GET') {
            return json(res, 200, { assets: listAssetMetas() }, { 'cache-control': 'no-store' })
          }
          if (req.method !== 'PUT') {
            return json(res, 405, { error: 'method not allowed' }, { allow: 'GET, PUT' })
          }
          if (isCrossOrigin(req)) return json(res, 403, { error: 'cross-origin request rejected' })
          const url = new URL(req.url ?? '/', 'http://dsh.internal')
          const name = (url.searchParams.get('name') ?? 'asset').slice(0, 64)
          const mime = url.searchParams.get('mime') ?? 'image/png'
          if (!mime.startsWith('image/')) return json(res, 400, { error: 'mime 必须是 image/*' })
          const bytes = await readBodyBuffer(req, ASSET_BODY_LIMIT)
          if (bytes === null) return json(res, 413, { error: '素材超过上限（≤20MB）' })
          if (bytes.length === 0) return json(res, 400, { error: '空文件' })
          // 严格上限：20MB（读入上限含 64KB 余量——防止误放行超限文件）
          if (bytes.length > MAX_ASSET_FILE_SIZE) {
            return json(res, 413, { error: '素材超过上限（≤20MB）' })
          }
          if (listAssetMetas().length >= MAX_ASSETS) {
            return json(res, 400, { error: `素材库已达上限 ${MAX_ASSETS} 个` })
          }
          // #90 分层合成规格（可选）：{animAssetId,x,y,w,h}——校验结构后随 meta 落盘
          const layersRaw = url.searchParams.get('layers')
          let layers: AssetLayers | undefined
          if (layersRaw !== null) {
            try {
              const parsed = JSON.parse(layersRaw) as Record<string, unknown>
              if (typeof parsed.animAssetId !== 'string' || !safePresetId(parsed.animAssetId)
                || typeof parsed.x !== 'number' || typeof parsed.y !== 'number'
                || typeof parsed.w !== 'number' || typeof parsed.h !== 'number'
                || !Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)
                || !Number.isFinite(parsed.w) || !Number.isFinite(parsed.h)
                || parsed.w <= 0 || parsed.h <= 0) {
                return json(res, 400, { error: 'layers 参数非法（需 {animAssetId,x,y,w,h} 数字矩形）' })
              }
              layers = { animAssetId: parsed.animAssetId, x: parsed.x, y: parsed.y, w: parsed.w, h: parsed.h }
            } catch {
              return json(res, 400, { error: 'layers 参数非法（JSON 解析失败）' })
            }
          }
          const id = genId('asset')
          try {
            mkdirSync(ASSETS_DIR, { recursive: true })
            writeAssetFile(id, name, mime, bytes, layers)
          } catch (error) {
            return json(res, 500, { error: `写入失败：${safeErrorMessage(error)}` })
          }
          return json(res, 200, { ok: true, id, name, mime, size: bytes.length }, { 'cache-control': 'no-store' })
        } catch (error) {
          json(res, 500, { error: safeErrorMessage(error) })
        }
      },
    }, 'assets', disposers)

    registerSafe(webServer, {
      kind: 'prefix',
      // 修复轮 #33：prefix 路径不能带尾斜杠——宿主路由器按 `${prefix}/` 拼接匹配，
      // 带尾斜杠会变双斜杠导致永不命中（请求落到 SPA 兜底返回 HTML）
      path: `${ROUTE_PREFIX}/assets`,
      handler: async (req: IncomingMessageLike, res: ServerResponseLike) => {
        try {
          if (req.method !== 'GET' && req.method !== 'DELETE') {
            return json(res, 405, { error: 'method not allowed' }, { allow: 'GET, DELETE' })
          }
          const pathname = new URL(req.url ?? '/', 'http://dsh.internal').pathname
          const rest = stripPrefix(pathname, `${ROUTE_PREFIX}/assets`)
          const decoded = rest === null ? null : decodeSegment(rest)
          if (decoded === null || !safePresetId(decoded)) return json(res, 400, { error: 'invalid asset id' })
          if (req.method === 'DELETE') {
            if (isCrossOrigin(req)) return json(res, 403, { error: 'cross-origin request rejected' })
            // review P1-3（全量评审）：删除前扫描库中引用并顺带清理（素材为库级共享——
            // 其他预设的引用随删除清空，不留死 URL；返回引用信息供 UI 提示）。
            // #90：分层合成壁纸的动图引用（其他资产 meta 的 layers.animAssetId）也顺带剥离——
            // 合成壁纸降级为纯静态底（graceful，不烂图）。
            const refs = findAssetRefPresets(decoded)
            const cleaned = stripAssetRefsFromPresets(decoded)
            const degraded = stripLayersRefsFromAssets(decoded)
            try { deleteAssetFile(decoded) } catch (error) {
              return json(res, 500, { error: `删除失败：${safeErrorMessage(error)}` })
            }
            return json(res, 200, {
              ok: true,
              id: decoded,
              refs: refs.map(r => r.name),
              refCount: refs.length,
              cleanedPresets: cleaned,
              degradedCompositions: degraded,
            }, { 'cache-control': 'no-store' })
          }
          try {
            const meta = readAssetMeta(decoded)
            const bytes = readFileSync(assetFilePath(decoded))
            res.writeHead(200, {
              'content-type': meta?.mime ?? 'application/octet-stream',
              'content-length': String(bytes.length),
              'cache-control': 'no-store',
            })
            res.end(bytes)
          } catch {
            return json(res, 404, { error: `素材 ${decoded} 不存在` })
          }
        } catch (error) {
          json(res, 500, { error: safeErrorMessage(error) })
        }
      },
    }, 'assets/:id', disposers)

    return () => { for (const dispose of disposers) dispose() }
    }, 'ui-presets: routes')
  })
}

/** 库中已有预设 id 集合（import-zip 冲突后缀用）。
 * review P1-4（全量评审）：合并 demo 内置 id——否则 zip 导入可用 demo id 遮蔽内置预设
 * （库优先于 demo 的查序下，遮蔽文件无法经 UI/AI 删除）。 */
function listLibraryIds(): string[] {
  const out: string[] = []
  let dirs: string[] = []
  try { dirs = readdirSync(PRESETS_DIR) } catch { /* 空库 */ }
  for (const id of dirs) if (safePresetId(id)) out.push(id)
  for (const demo of DEMO_PRESETS) if (!out.includes(demo.id)) out.push(demo.id)
  return out
}

// ---- 壁纸库（素材文件）辅助 ----

/** #90 分层合成规格（合成壁纸 meta 内嵌：静态底图 + 原生动图引用与帧坐标矩形）。
 * animAssetId 引用库中动图素材；渲染时 controller 按裁剪变换映射到元素。 */
interface AssetLayers {
  animAssetId: string
  x: number
  y: number
  w: number
  h: number
}

interface AssetMeta { id: string; name: string; mime: string; size: number; layers?: AssetLayers }

function assetFilePath(id: string): string {
  return join(ASSETS_DIR, id)
}

function assetMetaFile(id: string): string {
  return join(ASSETS_DIR, `${id}.json`)
}

/** 写素材文件 + 元数据（meta 供列表/服务 mime 用；#90 分层规格随 meta 存）。 */
function writeAssetFile(id: string, name: string, mime: string, bytes: Uint8Array, layers?: AssetLayers): void {
  writeFileSync(assetFilePath(id), bytes)
  writeFileAtomic(assetMetaFile(id), JSON.stringify(layers === undefined ? { id, name, mime, size: bytes.length } : { id, name, mime, size: bytes.length, layers }))
}

function readAssetMeta(id: string): AssetMeta | null {
  try {
    const meta = JSON.parse(readFileSync(assetMetaFile(id), 'utf8')) as AssetMeta
    if (typeof meta.id !== 'string' || typeof meta.name !== 'string' || typeof meta.mime !== 'string') return null
    return meta
  } catch { return null }
}

function listAssetMetas(): AssetMeta[] {
  const out: AssetMeta[] = []
  let files: string[] = []
  try { files = readdirSync(ASSETS_DIR) } catch { return out }
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    const meta = readAssetMeta(file.slice(0, -5))
    if (meta !== null) out.push(meta)
  }
  out.sort((a, b) => a.id.localeCompare(b.id))
  return out
}

function deleteAssetFile(id: string): void {
  rmSync(assetFilePath(id), { force: true })
  rmSync(assetMetaFile(id), { force: true })
}

/** #90：删除素材时剥离其他资产 meta 的 layers 引用（被删素材是某合成壁纸的动图层 →
 * 合成壁纸降级为纯静态底；返回受影响数量）。 */
function stripLayersRefsFromAssets(assetId: string): number {
  let n = 0
  for (const meta of listAssetMetas()) {
    if (meta.layers?.animAssetId !== assetId) continue
    const { layers: _drop, ...rest } = meta
    try { writeFileAtomic(assetMetaFile(meta.id), JSON.stringify(rest)) } catch { continue }
    n += 1
  }
  return n
}

/** zip 导出：壁纸库文件内嵌为 dataUrl（分享自包含）；缺失文件保留引用。
 * #94：分层合成规格（meta.layers）随引用写入 zip——导入方据此还原素材 meta，
 * 分层壁纸分享后仍保持"静态底 + 原生动图"组合。 */
function embedAssetsToPreset(preset: Preset): Preset {
  if (preset.assets === undefined) return preset
  const assets = preset.assets.map(asset => {
    const entry = { ...asset }
    if (entry.dataUrl === undefined) {
      try {
        const bytes = readFileSync(assetFilePath(asset.id))
        entry.dataUrl = `data:${asset.mime};base64,${Buffer.from(bytes).toString('base64')}`
      } catch { /* 缺失文件保留引用 */ }
    }
    if (entry.layers === undefined) {
      const meta = readAssetMeta(asset.id)
      if (meta?.layers !== undefined) entry.layers = meta.layers
    }
    return entry
  })
  return { ...preset, assets }
}

/** zip 导入：内嵌素材落盘到壁纸库（dataUrl → 文件 + meta），预设改为引用。
 * review P1-4（全量评审）修复：① 素材 id 与库中已有文件冲突 → 重写为新 id（不覆盖既有壁纸）；
 * ② 库数量达 MAX_ASSETS 上限 → 跳过落盘（保留引用，文件缺失时部件不产出样式）；
 * ③ 解码后体积超 MAX_ASSET_FILE_SIZE → 跳过（防超限文件绕过上传路由校验）。
 * #93（用户实测 bug：导入自己导出的 zip 报"已损坏：widgets 引用了不存在的素材"）：
 * ① 的"冲突重写"是错的——素材 id 每次上传唯一（genId），zip 与库中同 id 必为同一文件，
 * 重写 refs 为 -1 后缀而 **widgets 引用没跟着改** → 引用断裂、导入即损坏。
 * 修复：库中已有同 id → **直接保留引用**（文件已存在，zip 内嵌副本冗余无害）；
 * 仅当库中缺失 → 按原 id 落盘恢复；本预设内重复 id → 保留引用不重复落盘。 */
function storeEmbeddedAssets(preset: Preset): Preset {
  if (preset.assets === undefined) return preset
  const existing = new Set(listAssetMetas().map(meta => meta.id))
  const used = new Set<string>()
  const assets = preset.assets.map(asset => {
    if (asset.dataUrl === undefined) return asset
    const comma = asset.dataUrl.indexOf(',')
    if (comma < 0) return { id: asset.id, name: asset.name, mime: asset.mime }
    try {
      const bytes = Uint8Array.from(Buffer.from(asset.dataUrl.slice(comma + 1), 'base64'))
      if (bytes.length > MAX_ASSET_FILE_SIZE) return { id: asset.id, name: asset.name, mime: asset.mime }
      if (!existing.has(asset.id) && !used.has(asset.id)) {
        if (listAssetMetas().length >= MAX_ASSETS) return { id: asset.id, name: asset.name, mime: asset.mime }
        used.add(asset.id)
        mkdirSync(ASSETS_DIR, { recursive: true })
        // #94：引用带 layers 规格 → 随 meta 还原（分层壁纸导入后仍双背景渲染）
        writeAssetFile(asset.id, asset.name, asset.mime, bytes, asset.layers)
        existing.add(asset.id)
      }
      return { id: asset.id, name: asset.name, mime: asset.mime }
    } catch { /* 解码失败：保留引用（文件缺失时部件不产出样式） */ }
    return { id: asset.id, name: asset.name, mime: asset.mime }
  })
  return { ...preset, assets }
}

/** review P1-3（全量评审）：扫描库中所有预设，找出引用指定素材 id 的预设清单
 * （assets[].id 或 widgets 参数引用）。 */
function findAssetRefPresets(assetId: string): Array<{ id: string; name: string }> {
  const out: Array<{ id: string; name: string }> = []
  let dirs: string[] = []
  try { dirs = readdirSync(PRESETS_DIR) } catch { return out }
  for (const dir of dirs) {
    if (!safePresetId(dir)) continue
    try {
      const preset = JSON.parse(readFileSync(join(PRESETS_DIR, dir, 'preset.json'), 'utf8')) as Preset
      const refsAssets = (preset.assets ?? []).some(a => a.id === assetId)
      const refsWidgets = (preset.widgets ?? []).some(w => Object.values(w.params ?? {}).includes(assetId))
      if (refsAssets || refsWidgets) out.push({ id: preset.id, name: preset.name })
    } catch { /* 损坏预设跳过 */ }
  }
  return out
}

/** review P1-3（全量评审）：删除素材时顺带清理库中预设对该素材的引用并写回
 * （素材为库级共享——不清理则其他预设留下死 URL 引用，壁纸静默失效）。 */
function stripAssetRefsFromPresets(assetId: string): number {
  let cleaned = 0
  let dirs: string[] = []
  try { dirs = readdirSync(PRESETS_DIR) } catch { return cleaned }
  for (const dir of dirs) {
    if (!safePresetId(dir)) continue
    const file = join(PRESETS_DIR, dir, 'preset.json')
    try {
      const preset = JSON.parse(readFileSync(file, 'utf8')) as Preset
      const assets = preset.assets ?? []
      const widgets = preset.widgets ?? []
      const assetsRef = assets.some(a => a.id === assetId)
      const nextAssets = assets.filter(a => a.id !== assetId)
      let changed = assetsRef
      const nextWidgets = widgets.map(w => {
        const params = { ...(w.params ?? {}) }
        for (const [key, value] of Object.entries(params)) {
          if (value === assetId) { params[key] = ''; changed = true }
        }
        return { ...w, params }
      })
      // #56：封面引用该素材 → 移除手设封面（回退自动生成）
      let nextCover = preset.cover
      if (preset.cover?.assetId === assetId) {
        nextCover = undefined
        changed = true
      }
      if (!changed) continue
      const next: Preset = {
        ...preset,
        ...(nextAssets.length > 0 || assets.length > 0 ? { assets: nextAssets } : {}),
        widgets: nextWidgets,
        ...(nextCover !== undefined ? { cover: nextCover } : {}),
      }
      writeFileAtomic(file, JSON.stringify(next, null, 2))
      cleaned += 1
    } catch { /* 损坏预设跳过 */ }
  }
  return cleaned
}

// ---- 最小类型面（避免引入 node:http 类型依赖，保持零依赖构建） ----
interface IncomingMessageLike extends AsyncIterable<unknown> {
  method?: string
  url?: string
  headers: Record<string, string | undefined>
}
interface ServerResponseLike {
  writeHead(status: number, headers: Record<string, string>): void
  end(body: string | Uint8Array): void
}
interface ContextLike {
  get?(name: string): unknown
  inject?(services: string[], fn: (ctx: ContextLike) => void): unknown
  effect(fn: () => (() => void) | void, label?: string): void
}
