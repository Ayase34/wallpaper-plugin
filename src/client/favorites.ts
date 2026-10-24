/**
 * 收藏 + 「换一个试试」（借鉴 dsh-dream-skin 的低摩擦玩法）。
 *
 * 与 dream-skin 的差异：收藏是**纯前端便捷层**（localStorage），不落 node 数据目录，
 * 也不进预设文件——换机器/分享时不污染预设本身；预设库仍是唯一事实来源。
 * 解析/写回全部容错：localStorage 不可用（隐私模式）时退化为「本次会话有效」。
 */

export const FAVORITES_KEY = 'ui-presets-favorites'

/** 解析收藏列表（容忍脏数据：非数组、非字符串项、重复项一律清洗）。 */
export function parseFavorites(raw: string | null): string[] {
  if (raw === null || raw === '') return []
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(data)) return []
  const out: string[] = []
  for (const item of data) {
    if (typeof item !== 'string' || item === '') continue
    if (out.includes(item)) continue
    out.push(item)
  }
  return out
}

export function loadFavorites(): string[] {
  try {
    return parseFavorites(localStorage.getItem(FAVORITES_KEY))
  } catch {
    return []
  }
}

export function saveFavorites(ids: string[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
  } catch {
    /* 存储不可用（隐私模式/配额满）：本次会话内仍生效 */
  }
}

/** 收藏/取消收藏（返回新列表，不改入参）。 */
export function toggleInList(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]
}

export function isFavorite(ids: string[], id: string): boolean {
  return ids.includes(id)
}

/**
 * 随机挑一个「不是当前」的 id；候选为空或只剩当前项时返回 null。
 * random 可注入便于单测（默认 Math.random）。
 */
export function pickRandomId(ids: string[], exclude: string | null, random: () => number = Math.random): string | null {
  const pool = exclude === null ? ids : ids.filter(id => id !== exclude)
  if (pool.length === 0) return null
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))
  return pool[index] ?? null
}
