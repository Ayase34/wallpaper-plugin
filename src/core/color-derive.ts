/**
 * #111 颜色派生（C1）：旋钮束内「同值」→「阶梯」的最小实现。
 *
 * 背景：knobValueForScheme 原先把同一个值写进束内所有令牌，导致抬升面/悬浮层全部同色
 * （layer-1 = layer-2、menu = tip = selector = overlay），层次被压平。
 * 这里给纯函数派生规则：以主值为基准，按 sRGB 混合算「更亮 / 更暗 / 随明暗反转 / 指定透明度」。
 *
 * 为什么用 sRGB 线性混合而不是 OKLCH：只做小幅度（≤0.2）阶差，两者观感差异可忽略，
 * 而 sRGB 混合在所有宿主上行为一致、零依赖、可单测（不引入色彩空间转换库）。
 */
import { parseRgbColor } from './contrast.ts'

/** 派生模式：lighter=向白靠、darker=向黑靠、shade=亮色向黑/暗色向白、alpha=改透明度。 */
export type DeriveMode = 'lighter' | 'darker' | 'shade' | 'alpha'

export interface Rgb { r: number; g: number; b: number }

/** 解析透明度（rgba/hsla 的第 4 分量；不可解析按 1）。 */
function alphaOf(value: string): number {
  const m = /^\s*(?:rgba?|hsla?)\([^)]*[,/]\s*([\d.]+)\s*\)\s*$/i.exec(value.trim())
  if (m === null) return 1
  const a = Number(m[1])
  return Number.isFinite(a) ? Math.min(1, Math.max(0, a)) : 1
}

/** 数值格式化（去尾零；最多 3 位小数）。 */
function fmt(n: number): string {
  return String(Math.round(n * 1000) / 1000)
}

/** 透明度 → 输出形式（1 = 纯 hex；否则 rgba）。 */
function toCss(rgb: Rgb, alpha: number): string {
  const hex = '#' + [rgb.r, rgb.g, rgb.b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
  return alpha >= 0.999 ? hex : `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${fmt(alpha)})`
}

/** 向目标色混合（amount 0..1；0=原色，1=目标色）。 */
function mixTo(rgb: Rgb, target: Rgb, amount: number): Rgb {
  const t = Math.min(1, Math.max(0, amount))
  return {
    r: rgb.r + (target.r - rgb.r) * t,
    g: rgb.g + (target.g - rgb.g) * t,
    b: rgb.b + (target.b - rgb.b) * t,
  }
}

/**
 * 颜色派生（不可解析的值原样返回——如 px 长度、字体族、关键字）。
 * @param base - 基色（hex/rgb/hsl；可带 alpha）
 * @param mode - 派生方向
 * @param amount - 幅度（lighter/darker/shade 为混合比例 0..1；alpha 为目标透明度 0..1）
 * @param scheme - 明暗（仅 shade 用：亮色向黑、暗色向白；其余模式与明暗无关）
 */
export function deriveColor(base: string, mode: DeriveMode, amount: number, scheme: 'light' | 'dark'): string {
  const parsed = parseRgbColor(base)
  if (parsed === null) return base
  const alpha = alphaOf(base)
  if (mode === 'alpha') return toCss(parsed, Math.min(1, Math.max(0, amount)))
  const target: Rgb = mode === 'lighter'
    ? { r: 255, g: 255, b: 255 }
    : mode === 'darker'
      ? { r: 0, g: 0, b: 0 }
      : scheme === 'light' ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
  return toCss(mixTo(parsed, target, amount), alpha)
}

/** 按派生规则表计算单令牌值（规则缺省 = 与主值相同）。 */
export function deriveFromBase(
  base: string,
  rule: { mode: DeriveMode; amount: number; amountDark?: number } | undefined,
  scheme: 'light' | 'dark',
): string {
  if (rule === undefined || base === '') return base
  const amount = scheme === 'dark' && rule.amountDark !== undefined ? rule.amountDark : rule.amount
  return deriveColor(base, rule.mode, amount, scheme)
}
