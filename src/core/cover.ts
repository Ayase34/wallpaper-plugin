/**
 * 封面生成（M2-5/#56）：预设 → cover.svg（纯文本生成，无需图像库）。
 * 布局：上下两半 = 亮/暗背景色板；品牌色方块 + 预设名；令牌名清单。
 * #56（用户拍板）：设置墙卡片封面显示比例 ≈ 宽:高 3:1（用户目测"快有 1:3"，
 * 实测卡片 ~240px 宽 × 84px 高）——SVG 改 900×300、手设封面也按 3:1 裁剪。
 * 纯函数（core 层可单测）；zip 三件套的 cover 条目来源。
 */
import { resolveTokenValue } from './token-utils.ts'
import type { Preset } from './schema.ts'

/** 封面固定比例（宽:高 = 3:1，#56 用户拍板——匹配设置墙卡片实际显示比例）。 */
export const COVER_RATIO = { w: 3, h: 1 }

function tokenOf(preset: Preset, name: string, scheme: 'light' | 'dark'): string {
  const value = preset.tokens[name]
  if (value !== undefined) return value[scheme]
  return ''
}

/** 解析颜色（var() 链 → 字面；失败回退给定默认）。 */
function colorOf(raw: string, fallback: string): string {
  const resolved = resolveTokenValue(raw)
  return resolved.trim() !== '' && !resolved.startsWith('var(') ? resolved : fallback
}

/** 转义 XML 文本。 */
function xmlEscape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 生成封面 SVG（900×300，3:1；亮/暗分屏 + 品牌色 + 名称 + 令牌清单）。 */
export function coverSvgFor(preset: Preset): string {
  const bgLight = xmlEscape(colorOf(tokenOf(preset, '--dsw-alias-bg-base', 'light'), '#f5f7fa'))
  const bgDark = xmlEscape(colorOf(tokenOf(preset, '--dsw-alias-bg-base', 'dark'), '#14161a'))
  const brand = xmlEscape(colorOf(tokenOf(preset, '--dsw-alias-brand-primary', 'light'), '#416fe6'))
  const labelLight = xmlEscape(colorOf(tokenOf(preset, '--dsw-alias-label-primary', 'light'), '#1a1d21'))
  const labelDark = xmlEscape(colorOf(tokenOf(preset, '--dsw-alias-label-primary', 'dark'), '#e8eaed'))
  const tertiary = xmlEscape(colorOf(tokenOf(preset, '--dsw-alias-label-tertiary', 'light'), '#8a919c'))
  const name = xmlEscape(preset.name)
  const tokenNames = Object.keys(preset.tokens).slice(0, 5).map(xmlEscape).join(' · ')
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300">',
    `<rect width="900" height="150" fill="${bgLight}"/>`,
    `<rect y="150" width="900" height="150" fill="${bgDark}"/>`,
    `<rect x="30" y="30" width="90" height="90" rx="14" fill="${brand}"/>`,
    `<text x="150" y="86" font-family="system-ui, sans-serif" font-size="30" font-weight="700" fill="${labelLight}">${name}</text>`,
    `<text x="150" y="116" font-family="system-ui, sans-serif" font-size="14" fill="${tertiary}">${tokenNames}</text>`,
    `<text x="30" y="140" font-family="system-ui, sans-serif" font-size="14" fill="${labelLight}">浅色模式</text>`,
    `<text x="30" y="280" font-family="system-ui, sans-serif" font-size="14" fill="${labelDark}">深色模式</text>`,
    '</svg>',
    '',
  ].join('\n')
}

/** 封面 → data URL（预设墙缩略图用；M3-1 内容工程）。 */
export function coverDataUrlFor(preset: Preset): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(coverSvgFor(preset))}`
}

/** #56 封面图源解析：手设封面（引用预设内素材）→ dataUrl（旧版内嵌）或壁纸库文件路由；
 * 无手设封面 → 自动生成 SVG data URL。 */
export function coverImageSourceFor(preset: Preset): string {
  const cover = preset.cover
  if (cover !== undefined && cover.assetId !== '') {
    const asset = (preset.assets ?? []).find(item => item.id === cover.assetId)
    if (asset !== undefined) return asset.dataUrl ?? `/ui-presets/assets/${encodeURIComponent(asset.id)}`
  }
  return coverDataUrlFor(preset)
}
