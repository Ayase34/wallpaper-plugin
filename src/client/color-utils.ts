/**
 * 颜色工具（M2-1 从 token-editor 抽出）：旋钮层与令牌行共用。
 * - normalizeHex：任意颜色值规范为 hex（供 type=color）；失败返回默认。
 * - extractAlpha / rgbaFromHex：取色器不丢透明度（评审 UX）。
 */

/** 把任意颜色值规范为 hex（供 type=color）；失败返回默认。 */
export function normalizeHex(value: string): string {
  const m = /^#([0-9a-fA-F]{6})$/.exec(value.trim())
  if (m !== null) return value.trim()
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(value.trim())
  if (rgb !== null) {
    const toHex = (n: string): string => Number(n).toString(16).padStart(2, '0')
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`
  }
  return '#000000'
}

/** 提取 rgba 的 alpha 分量（无 alpha 返回 null）。 */
export function extractAlpha(value: string): string | null {
  const m = /rgba?\([^)]*,\s*([\d.]+)\s*\)/.exec(value.trim())
  return m !== null ? m[1] : null
}

/** hex → rgba（保留给定 alpha）。 */
export function rgbaFromHex(hex: string, alpha: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
