/**
 * #111 调色板生成器（C3）：给一个品牌色（seed）+ 情绪（mood）+ 对比度目标，
 * 生成一整套协调的令牌双值（背景/层次/文字/按钮/边框/状态/代码面/浮层…）。
 *
 * 目的：让 AI 不用逐条手算几十个令牌（塞壬那样 hover/active/border 全靠人肉推算），
 * 只需给 seed + mood，服务端按对比度护栏派生；产物仍可被显式 tokens 覆盖。
 *
 * 纯函数、零依赖（复用 contrast.ts 的解析/亮度）；所有输出都做对比度收敛，
 * 保证 label 家族在 bg-base / bg-layer-1 上达到目标等级。
 */
import { parseRgbColor, relativeLuminance, contrastRatio } from './contrast.ts'
import type { TokenOverride } from './schema.ts'

export type PaletteMood = 'fresh' | 'night' | 'retro' | 'mono'
export type PaletteContrast = 'AA' | 'AAA'

export const PALETTE_MOODS: Array<{ id: PaletteMood; name: string; description: string }> = [
  { id: 'fresh', name: '清爽', description: '高明度浅底 + 清透品牌色（默认）' },
  { id: 'night', name: '深夜', description: '深底 + 高饱和品牌色，暗色侧更深' },
  { id: 'retro', name: '复古', description: '暖调米白底 + 低饱和品牌色' },
  { id: 'mono', name: '极简', description: '近乎无彩的灰阶 + 单点品牌色' },
]

interface Hsl { h: number; s: number; l: number }
interface Rgb { r: number; g: number; b: number }

function rgbToHsl(rgb: Rgb): Hsl {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: l * 100 }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const sn = Math.min(100, Math.max(0, s)) / 100
  const ln = Math.min(100, Math.max(0, l)) / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const hp = (((h % 360) + 360) % 360) / 60
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

function hex(rgb: Rgb): string {
  return '#' + [rgb.r, rgb.g, rgb.b].map(v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0')).join('')
}

function rgba(rgb: Rgb, alpha: number): string {
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${String(Math.round(alpha * 1000) / 1000)})`
}

function tone(saturation: number, lightness: number, hue: number): Rgb {
  return hslToRgb(hue, saturation, lightness)
}

/** 对比度收敛：沿明度轴把 fg 推离 bg，直到达到目标（最多 30 轮，每轮 2.5%）。 */
function ensureContrast(fg: Rgb, bg: Rgb, target: number, direction: 'darker' | 'lighter'): Rgb {
  let hsl = rgbToHsl(fg)
  let current = fg
  for (let i = 0; i < 30; i += 1) {
    if (contrastRatio(current, bg) >= target) return current
    hsl = { ...hsl, l: Math.min(100, Math.max(0, hsl.l + (direction === 'darker' ? -2.5 : 2.5))) }
    current = hslToRgb(hsl.h, hsl.s, hsl.l)
  }
  return current
}

/** 在 brand 填充上选可读的前景色（白 or 近黑）。 */
function foregroundOn(brand: Rgb, target: number): string {
  const white: Rgb = { r: 255, g: 255, b: 255 }
  const ink: Rgb = { r: 12, g: 8, b: 20 }
  const whiteRatio = contrastRatio(white, brand)
  const inkRatio = contrastRatio(ink, brand)
  if (whiteRatio >= target) return '#ffffff'
  if (inkRatio >= target) return hex(ink)
  return whiteRatio >= inkRatio ? '#ffffff' : hex(ink)
}

/**
 * 生成调色板（亮/暗双值）。
 * @param seed - 品牌色（hex/rgb；不可解析抛错）
 * @param mood - 情绪风格
 * @param contrast - 文字对比度目标（AA=4.5 / AAA=7）
 * @returns 令牌 → { light, dark }（可直接并入 preset.tokens）
 */
export function paletteTokens(
  seed: string,
  mood: PaletteMood = 'fresh',
  contrast: PaletteContrast = 'AA',
): Record<string, TokenOverride> {
  const seedRgb = parseRgbColor(seed)
  if (seedRgb === null) throw new Error(`preset_palette: seed 不是合法颜色（${seed}）`)
  const target = contrast === 'AAA' ? 7 : 4.5
  const base = rgbToHsl(seedRgb)

  // 情绪调制：色相/饱和度/明度基准
  const profile = mood === 'night'
    ? { hue: base.h, sat: Math.min(96, base.s + 12), lightL: 96.5, darkL: 6, tint: 8 }
    : mood === 'retro'
      ? { hue: (base.h + 10) % 360, sat: Math.min(72, Math.max(18, base.s * 0.72)), lightL: 96, darkL: 12, tint: 9 }
      : mood === 'mono'
        ? { hue: base.h, sat: Math.min(12, base.s), lightL: 97, darkL: 9, tint: 4 }
        : { hue: base.h, sat: Math.min(88, Math.max(24, base.s)), lightL: 97, darkL: 8, tint: 7 }

  const brandLightL = Math.min(58, Math.max(30, base.l))
  const brandDarkL = Math.min(78, Math.max(52, base.l + 8))
  const brandLight = tone(profile.sat, brandLightL, profile.hue)
  const brandDark = tone(Math.min(92, profile.sat + 6), brandDarkL, profile.hue)

  // 面：bg / layer 1..3 / sidebar / bubble / input / menu
  const lightBg = tone(profile.tint, profile.lightL, profile.hue)
  const darkBg = tone(profile.sat * 0.5, profile.darkL, profile.hue)
  const lightLayer1 = tone(profile.tint * 0.5, 100, profile.hue)
  const lightLayer2 = tone(profile.tint * 1.4, profile.lightL - 3, profile.hue)
  const lightLayer3 = tone(profile.tint * 1.8, profile.lightL - 6, profile.hue)
  const darkLayer1 = tone(profile.sat * 0.45, profile.darkL + 4, profile.hue)
  const darkLayer2 = tone(profile.sat * 0.5, profile.darkL + 7, profile.hue)
  const darkLayer3 = tone(profile.sat * 0.55, profile.darkL + 10, profile.hue)

  // 文字：从品牌色向极端收敛，再做对比度护栏
  const lightInkSeed = tone(profile.sat * 0.6, 18, profile.hue)
  const darkInkSeed = tone(Math.min(60, profile.sat * 0.4), 92, profile.hue)
  const lightPrimary = ensureContrast(lightInkSeed, lightBg, target, 'darker')
  const darkPrimary = ensureContrast(darkInkSeed, darkBg, target, 'lighter')
  const lightSecondary = ensureContrast(tone(profile.sat * 0.45, 36, profile.hue), lightBg, target, 'darker')
  const darkSecondary = ensureContrast(tone(Math.min(50, profile.sat * 0.35), 78, profile.hue), darkBg, target, 'lighter')
  const lightTertiary = ensureContrast(tone(profile.sat * 0.35, 48, profile.hue), lightBg, Math.max(4.5, target - 0.5), 'darker')
  const darkTertiary = ensureContrast(tone(Math.min(40, profile.sat * 0.3), 66, profile.hue), darkBg, Math.max(4.5, target - 0.5), 'lighter')

  const lightBorderInk = tone(profile.sat * 0.5, 30, profile.hue)
  const darkBorderInk = tone(Math.min(60, profile.sat * 0.5), 86, profile.hue)

  const tokens: Record<string, TokenOverride> = {
    '--dsw-alias-bg-base': { light: hex(lightBg), dark: hex(darkBg) },
    '--dsw-alias-bg-layer-1': { light: hex(lightLayer1), dark: hex(darkLayer1) },
    '--dsw-alias-bg-layer-2': { light: hex(lightLayer2), dark: hex(darkLayer2) },
    '--dsw-alias-bg-layer-3': { light: hex(lightLayer3), dark: hex(darkLayer3) },
    '--dsw-specific-sidebar-fill': { light: hex(tone(profile.tint * 1.6, profile.lightL - 2, profile.hue)), dark: hex(tone(profile.sat * 0.4, Math.max(4, profile.darkL - 2), profile.hue)) },
    '--dsw-specific-bubble': { light: hex(tone(profile.tint * 1.5, profile.lightL - 4, profile.hue)), dark: hex(tone(profile.sat * 0.5, profile.darkL + 6, profile.hue)) },
    '--dsw-specific-bubble-highlight': { light: hex(tone(profile.tint * 2, profile.lightL - 9, profile.hue)), dark: hex(tone(profile.sat * 0.55, profile.darkL + 10, profile.hue)) },
    '--dsw-specific-input-major': { light: hex(tone(profile.tint, 100, profile.hue)), dark: hex(tone(profile.sat * 0.45, profile.darkL + 3, profile.hue)) },
    '--dsw-specific-menu': { light: hex(lightLayer2), dark: hex(darkLayer2) },
    '--dsw-specific-tip': { light: hex(lightLayer2), dark: hex(darkLayer2) },
    '--dsw-specific-selector': { light: hex(lightLayer3), dark: hex(darkLayer3) },
    '--dsw-specific-sidebar-nav-item-active': { light: hex(tone(profile.tint * 2.4, profile.lightL - 6, profile.hue)), dark: hex(tone(profile.sat * 0.6, profile.darkL + 12, profile.hue)) },
    // #107/#109 教训：徽标底色要浅到让 button-info-fill 当文字可读（两套都 ≥4.5 基本做不到，
    // 这里取"接近白"与"接近夜底"两端，与出厂 default 同策略）
    '--dsw-specific-sidebar-nav-item-active-accent': { light: hex(tone(profile.tint, 99, profile.hue)), dark: hex(tone(profile.sat * 0.5, Math.max(10, profile.darkL + 4), profile.hue)) },
    '--dsw-alias-label-primary': { light: hex(lightPrimary), dark: hex(darkPrimary) },
    '--dsw-alias-label-secondary': { light: hex(lightSecondary), dark: hex(darkSecondary) },
    '--dsw-alias-label-tertiary': { light: hex(lightTertiary), dark: hex(darkTertiary) },
    '--dsw-alias-label-caption': { light: hex(lightTertiary), dark: hex(darkTertiary) },
    '--dsw-alias-brand-primary': { light: hex(brandLight), dark: hex(brandDark) },
    '--dsw-alias-button-primary-fill': { light: hex(brandLight), dark: hex(brandDark) },
    '--dsw-alias-button-info-fill': { light: hex(brandLight), dark: hex(brandDark) },
    '--dsw-alias-button-primary-hover': { light: hex(tone(profile.sat, Math.max(18, brandLightL - 8), profile.hue)), dark: hex(tone(Math.min(92, profile.sat + 8), Math.min(90, brandDarkL + 8), profile.hue)) },
    '--dsw-alias-state-business-primary': { light: hex(brandLight), dark: hex(brandDark) },
    '--dsw-alias-label-primary-foreground': { light: foregroundOn(brandLight, 4.5), dark: foregroundOn(brandDark, 4.5) },
    '--dsw-alias-border-l1': { light: rgba(lightBorderInk, 0.06), dark: rgba(darkBorderInk, 0.08) },
    '--dsw-alias-border-l2': { light: rgba(lightBorderInk, 0.12), dark: rgba(darkBorderInk, 0.14) },
    '--dsw-alias-border-l3': { light: rgba(lightBorderInk, 0.18), dark: rgba(darkBorderInk, 0.2) },
    '--dsw-alias-border-l4': { light: rgba(lightBorderInk, 0.24), dark: rgba(darkBorderInk, 0.26) },
    '--dsw-alias-interactive-bg-hover': { light: rgba(lightBorderInk, 0.07), dark: rgba(darkBorderInk, 0.09) },
    '--dsw-alias-interactive-bg-active': { light: rgba(lightBorderInk, 0.12), dark: rgba(darkBorderInk, 0.14) },
    '--dsw-alias-scrollbar-bg-l1': { light: rgba(lightBorderInk, 0.18), dark: rgba(darkBorderInk, 0.2) },
    '--dsw-alias-scrollbar-bg-l2': { light: rgba(lightBorderInk, 0.28), dark: rgba(darkBorderInk, 0.3) },
    '--dsw-alias-scrollbar-hover-l1': { light: rgba(lightBorderInk, 0.36), dark: rgba(darkBorderInk, 0.38) },
    '--dsw-alias-markdown-code-block': { light: hex(lightLayer2), dark: hex(darkLayer1) },
    '--dsw-alias-markdown-inline-code': { light: hex(lightLayer3), dark: hex(darkLayer2) },
    '--dsw-alias-markdown-code-block-banner': { light: hex(lightLayer2), dark: hex(darkLayer3) },
    '--dsw-alias-markdown-citation': { light: hex(lightLayer2), dark: hex(darkLayer2) },
    '--dsw-alias-markdown-tag': { light: hex(lightLayer3), dark: hex(darkLayer3) },
    '--dsw-alias-toast-bg': { light: hex(tone(Math.min(40, profile.sat * 0.4), 24, profile.hue)), dark: hex(tone(profile.sat * 0.5, 16, profile.hue)) },
    '--dsw-alias-tooltip-bg': { light: hex(tone(Math.min(40, profile.sat * 0.4), 22, profile.hue)), dark: hex(tone(profile.sat * 0.5, 14, profile.hue)) },
    '--dsw-alias-state-error-primary': { light: '#d94c4c', dark: '#f2777a' },
    '--dsw-alias-state-warn-primary': { light: '#b7791f', dark: '#e2b04a' },
    '--dsw-alias-state-success-primary': { light: '#2e9e5b', dark: '#5ec98d' },
    '--dsw-alias-settings-card-fill': { light: hex(lightLayer1), dark: hex(darkLayer2) },
    '--dsw-alias-settings-card-stroke': { light: rgba(lightBorderInk, 0.1), dark: rgba(darkBorderInk, 0.14) },
  }
  return tokens
}
