/**
 * 壁纸轮换的纯逻辑 + 本地存储（壁纸 2.0 第二步）。
 *
 * 为什么是「本地偏好」而不是预设字段：轮换是**运行时行为**。写进预设会让「应用预设」变成
 * 「启动一个会变化的东西」——分享语义立刻变浑（别人拿到的是某一帧，还是一份会转的配置？），
 * 而且预设 JSON 会从「一份静态外观」变成「一个需要调度器的程序」。所以配置按
 * 「预设 id + 部件 id」存在 localStorage，不随预设/分享走；预设本身始终只描述当前这一帧。
 *
 * 失败隔离：坏链接只影响它自己（写入时逐行校验并丢弃），轮换失败不阻断其它部件。
 */
import { MAX_IMAGE_URL_LENGTH, isSafeImageUrl } from '../core/widgets.ts'

export const ROTATION_KEY = 'ui-presets-rotation'
export const ROTATION_TICK_MS = 30_000
export const ROTATION_MIN_INTERVAL_MS = 5 * 60_000
export const ROTATION_MAX_INTERVAL_MS = 7 * 24 * 60 * 60_000
export const ROTATION_MAX_URLS = 20
/** 间隔选项（UI 与校验共用；值为毫秒）。 */
export const ROTATION_INTERVALS: Array<{ label: string; value: number }> = [
  { label: '5 分钟', value: 5 * 60_000 },
  { label: '15 分钟', value: 15 * 60_000 },
  { label: '30 分钟', value: 30 * 60_000 },
  { label: '1 小时', value: 60 * 60_000 },
  { label: '6 小时', value: 6 * 60 * 60_000 },
  { label: '1 天', value: 24 * 60 * 60_000 },
]

export interface RotationConfig {
  /** 已校验的 http/https 链接（≥2 条才有轮换意义）。 */
  urls: string[]
  intervalMs: number
  /** 当前展示的链接下标。 */
  index: number
  /** 下次切换时间戳（epoch ms）；0 = 立即到期。 */
  nextAt: number
}

export type RotationStore = Record<string, RotationConfig>

/** 存储键：一个预设的一个部件一份配置。 */
export function rotationKey(presetId: string, widgetId: string): string {
  return `${presetId}::${widgetId}`
}

/** 从 key 反解（轮换调度用；格式不符返回 null）。 */
export function parseRotationKey(key: string): { presetId: string; widgetId: string } | null {
  const at = key.indexOf('::')
  if (at <= 0) return null
  return { presetId: key.slice(0, at), widgetId: key.slice(at + 2) }
}

function clampInterval(value: number): number {
  if (!Number.isFinite(value)) return ROTATION_MIN_INTERVAL_MS
  return Math.min(ROTATION_MAX_INTERVAL_MS, Math.max(ROTATION_MIN_INTERVAL_MS, Math.round(value)))
}

/** 规范化一条配置（脏数据返回 null，不抛错）。 */
export function normalizeRotation(raw: unknown): RotationConfig | null {
  if (typeof raw !== 'object' || raw === null) return null
  const source = raw as Partial<RotationConfig>
  if (!Array.isArray(source.urls)) return null
  const urls: string[] = []
  for (const item of source.urls) {
    if (typeof item !== 'string') continue
    if (!isSafeImageUrl(item) || urls.includes(item)) continue
    urls.push(item)
    if (urls.length >= ROTATION_MAX_URLS) break
  }
  if (urls.length < 2) return null
  const index = Number.isInteger(source.index) ? (source.index as number) : -1
  const nextAt = typeof source.nextAt === 'number' && Number.isFinite(source.nextAt) ? source.nextAt : 0
  return {
    urls,
    intervalMs: clampInterval(typeof source.intervalMs === 'number' ? source.intervalMs : ROTATION_MIN_INTERVAL_MS),
    // -1 = 尚未展示过任何一条（刚启用）→ 第一次 advance 落到 0
    index: Math.min(urls.length - 1, Math.max(-1, index)),
    nextAt,
  }
}

/** 解析整份存储（逐条容错；坏条目丢弃）。 */
export function parseRotationStore(raw: string | null): RotationStore {
  if (raw === null || raw === '') return {}
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return {}
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return {}
  const out: RotationStore = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const cfg = normalizeRotation(value)
    if (cfg !== null && parseRotationKey(key) !== null) out[key] = cfg
  }
  return out
}

export function loadRotationStore(): RotationStore {
  try {
    return parseRotationStore(localStorage.getItem(ROTATION_KEY))
  } catch {
    return {}
  }
}

export function saveRotationStore(store: RotationStore): void {
  try {
    localStorage.setItem(ROTATION_KEY, JSON.stringify(store))
  } catch {
    /* 存储不可用：本次会话内轮换仍生效（配置由调用方持有） */
  }
}

/** 多行文本 → 合法链接列表（去重、去空行、逐行校验、上限 20；返回被丢弃行数）。 */
export function splitUrlLines(text: string): { urls: string[]; rejected: number } {
  const urls: string[] = []
  let rejected = 0
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (trimmed === '') continue
    if (!isSafeImageUrl(trimmed) || trimmed.length > MAX_IMAGE_URL_LENGTH || urls.includes(trimmed)) {
      rejected += 1
      continue
    }
    if (urls.length >= ROTATION_MAX_URLS) { rejected += 1; continue }
    urls.push(trimmed)
  }
  return { urls, rejected }
}

/** 到期判定（nextAt=0 = 立即到期，用于「刚启用」场景）。 */
export function isDue(cfg: RotationConfig, now: number): boolean {
  return cfg.nextAt <= now
}

/** 前进一张：下标 +1（取模），并把下次到期时间推到 now + 间隔。 */
export function advance(cfg: RotationConfig, now: number): RotationConfig {
  const index = cfg.urls.length === 0 ? 0 : (cfg.index + 1) % cfg.urls.length
  return { ...cfg, index, nextAt: now + cfg.intervalMs }
}

/** 当前应展示的链接（空配置返回 null）。 */
export function currentUrl(cfg: RotationConfig): string | null {
  if (cfg.urls.length === 0) return null
  return cfg.urls[Math.min(cfg.urls.length - 1, Math.max(0, cfg.index))] ?? null
}

/** 新建配置：立刻到期（下一次 tick 就换上第一条），避免「启用后等一个间隔才生效」。
 * index=-1 表示尚未展示过——第一次 advance 进到 0。 */
export function createRotation(urls: string[], intervalMs: number, now: number): RotationConfig | null {
  const cfg = normalizeRotation({ urls, intervalMs, index: -1, nextAt: now })
  return cfg
}
