/**
 * 对比度工具（M4-1）：WCAG 2.x 相对亮度与对比度计算（纯函数，双 half 可复用、可单测）。
 * - parseRgbColor：rgb()/hex → {r,g,b}（不支持的格式返回 null——不打扰）
 * - relativeLuminance：sRGB → 线性化 → 相对亮度
 * - contrastRatio：对比度比（1..21）
 * - contrastGrade：AAA(≥7) / AA(≥4.5) / 大文本AA(≥3) / FAIL(<3)
 * - colorContrastFor：令牌值（含 var() 链）→ 对比度结果
 */

/** 解析 rgb()/hex/hsl() 颜色为 RGB 分量；失败返回 null。
 * #73：扩展支持 hsl()/hsla()、8 位 hex（含 alpha）、逗号或空格分隔 rgb。 */
export function parseRgbColor(value: string): { r: number; g: number; b: number } | null {
  const str = value.trim()
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(str)
  if (hex !== null) {
    const h = hex[1]
    if (h.length === 3 || h.length === 4) {
      const r = parseInt(h[0] + h[0], 16)
      const g = parseInt(h[1] + h[1], 16)
      const b = parseInt(h[2] + h[2], 16)
      return { r, g, b }
    }
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    }
  }
  const rgb = /^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})(?:\s*[,/]\s*[\d.]+)?\s*\)$/i.exec(str)
  if (rgb !== null) {
    const r = Number(rgb[1])
    const g = Number(rgb[2])
    const b = Number(rgb[3])
    if (r > 255 || g > 255 || b > 255) return null
    return { r, g, b }
  }
  const hsl = /^hsla?\(\s*([\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%(?:\s*[,/]\s*[\d.]+)?\s*\)$/i.exec(str)
  if (hsl !== null) {
    return hslToRgb(Number(hsl[1]) % 360, Number(hsl[2]), Number(hsl[3]))
  }
  return null
}

/** hsl → rgb（标准转换；h ∈ [0,360)，s/l ∈ [0,100]）。 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sn = Math.min(100, Math.max(0, s)) / 100
  const ln = Math.min(100, Math.max(0, l)) / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let rgb: [number, number, number]
  if (hp < 1) rgb = [c, x, 0]
  else if (hp < 2) rgb = [x, c, 0]
  else if (hp < 3) rgb = [0, c, x]
  else if (hp < 4) rgb = [0, x, c]
  else if (hp < 5) rgb = [x, 0, c]
  else rgb = [c, 0, x]
  const m = ln - c / 2
  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
  }
}

/** sRGB 单通道线性化（WCAG 公式）。 */
function channelLinear(c: number): number {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

/** 相对亮度（0..1）。 */
export function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  return 0.2126 * channelLinear(rgb.r) + 0.7152 * channelLinear(rgb.g) + 0.0722 * channelLinear(rgb.b)
}

/** 对比度比（1..21；WCAG：(L1+0.05)/(L2+0.05)）。 */
export function contrastRatio(fg: { r: number; g: number; b: number }, bg: { r: number; g: number; b: number }): number {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

/** WCAG 等级：'AAA' | 'AA' | 'AA-large' | 'FAIL'（large = 大文本 ≥3:1）。 */
export type ContrastGrade = 'AAA' | 'AA' | 'AA-large' | 'FAIL'

export function contrastGrade(ratio: number): ContrastGrade {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA-large'
  return 'FAIL'
}

/** 对两个颜色值（rgb/hex 字符串）计算对比度；任一不可解析 → null。 */
export function contrastForValues(fg: string, bg: string): { ratio: number; grade: ContrastGrade } | null {
  const f = parseRgbColor(fg)
  const b = parseRgbColor(bg)
  if (f === null || b === null) return null
  const ratio = contrastRatio(f, b)
  return { ratio, grade: contrastGrade(ratio) }
}

/** 对比度徽标文案与颜色（UI 复用；null = 不可计算，不打扰）。 */
export function contrastBadge(fg: string, bg: string): { text: string; color: string } | null {
  const result = contrastForValues(fg, bg)
  if (result === null) return null
  const ratioText = `${result.ratio.toFixed(1)}:1`
  if (result.grade === 'AAA') return { text: `${ratioText} AAA`, color: '#2e9e5b' }
  if (result.grade === 'AA') return { text: `${ratioText} AA`, color: '#2e9e5b' }
  if (result.grade === 'AA-large') return { text: `${ratioText} AA(大文本)`, color: '#b7791f' }
  return { text: `${ratioText} 对比不足`, color: '#d94c4c' }
}
