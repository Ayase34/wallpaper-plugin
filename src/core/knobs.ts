/**
 * 旋钮抽象层（M2-1）：用户语言 → 令牌束 → 原始令牌。
 * 纯数据 + 纯函数（core 层，双 half 可复用、可单测）：UI 只是渲染层；
 * 保存产物仍是令牌双值（schema/引擎零改动）。
 * 设计基准：`M2设计方案-旋钮抽象层.md`（评审点 A/B/C 通过；
 * D = 颜色旋钮默认单值同时写入亮暗 +「明暗分别设置」开关；E = 旋钮优先 + 高级令牌折叠）。
 */
import { catalog, findToken } from './catalog.ts'
import { resolveTokenValue } from './token-utils.ts'
import type { TokenOverride } from './schema.ts'

export type KnobControl = 'color' | 'font' | 'number' | 'select'

export interface KnobCategory {
  id: string
  name: string
  description: string
}

export interface KnobOption {
  label: string
  value: string
}

export interface KnobDef {
  id: string
  category: string
  /** 用户语言名（评审点 A：先按设计实现，实际体验后再调）。 */
  name: string
  description: string
  control: KnobControl
  /** 束：令牌名列表（首个为主令牌——回读来源）。 */
  bundle: string[]
  /** 非目录令牌的默认兜底（如 --dsh-chat-content-width）。 */
  fallback?: Record<string, { light: string; dark: string }>
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: KnobOption[]
}

export const KNOB_CATEGORIES: KnobCategory[] = [
  { id: 'spatial', name: '空间定位', description: '界面各区域的底色与浮层' },
  { id: 'layers', name: '背景层次', description: '边框与分隔' },
  { id: 'accent', name: '强调色', description: '品牌与主操作' },
  { id: 'text', name: '文字可读性', description: '文字颜色与字体' },
  { id: 'feedback', name: '交互反馈', description: '状态与悬停' },
  { id: 'layout', name: '布局与排版', description: '宽度与阴影' },
]

export const KNOBS: KnobDef[] = [
  // —— 空间定位（界面分区底色） ——
  { id: 'spatial-bg', category: 'spatial', name: '背景', description: '整个界面的底色，最影响观感', control: 'color', bundle: ['--dsw-alias-bg-base'] },
  { id: 'spatial-layer', category: 'spatial', name: '抬升面', description: '卡片、输入框、弹层浮出的层次色', control: 'color', bundle: ['--dsw-alias-bg-layer-1', '--dsw-alias-bg-layer-2'] },
  { id: 'spatial-sidebar', category: 'spatial', name: '侧边栏', description: '左侧导航栏背景', control: 'color', bundle: ['--dsw-specific-sidebar-fill'] },
  { id: 'spatial-bubble', category: 'spatial', name: '对话气泡', description: '会话区消息气泡底色', control: 'color', bundle: ['--dsw-specific-bubble'] },
  { id: 'spatial-input', category: 'spatial', name: '输入框', description: '底部输入卡底色', control: 'color', bundle: ['--dsw-specific-input-major'] },
  { id: 'spatial-menu', category: 'spatial', name: '菜单与悬浮层', description: '菜单、提示、选择器、遮罩', control: 'color', bundle: ['--dsw-specific-menu', '--dsw-specific-tip', '--dsw-specific-selector', '--dsw-alias-bg-overlay'] },
  // —— 背景层次（边框与分隔） ——
  { id: 'border-level', category: 'layers', name: '边框深浅', description: '卡片与分区的一级边框（细分留高级令牌）', control: 'color', bundle: ['--dsw-alias-border-l2'] },
  // —— 强调色（品牌与主操作） ——
  { id: 'accent-brand', category: 'accent', name: '主色', description: '品牌主色、主按钮、业务状态一次全改', control: 'color', bundle: ['--dsw-alias-brand-primary', '--dsw-alias-button-info-fill', '--dsw-alias-state-business-primary'] },
  { id: 'accent-hover', category: 'accent', name: '悬停色', description: '主按钮悬停反馈', control: 'color', bundle: ['--dsw-alias-button-info-hover'] },
  // —— 文字可读性 ——
  { id: 'text-primary', category: 'text', name: '主文字', description: '正文与标题色', control: 'color', bundle: ['--dsw-alias-label-primary'] },
  { id: 'text-secondary', category: 'text', name: '次要文字', description: '描述与说明文字色', control: 'color', bundle: ['--dsw-alias-label-secondary'] },
  { id: 'text-tertiary', category: 'text', name: '辅助文字', description: '弱化与占位文字色', control: 'color', bundle: ['--dsw-alias-label-tertiary'] },
  {
    id: 'font-family', category: 'text', name: '字体档', description: '全局字体风格', control: 'font', bundle: ['--dsw-font-family'],
    options: [
      { label: '系统默认', value: '' },
      { label: '衬线', value: 'Georgia, "Songti SC", "SimSun", serif' },
      { label: '圆体', value: '"Arial Rounded MT Bold", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif' },
      { label: '等宽', value: '"JetBrains Mono", "SF Mono", Consolas, monospace' },
    ],
  },
  // —— 交互反馈 ——
  { id: 'state-error', category: 'feedback', name: '错误色', description: '报错与失败提示', control: 'color', bundle: ['--dsw-alias-state-error-primary'] },
  { id: 'state-warn', category: 'feedback', name: '警告色', description: '警示与未保存提示', control: 'color', bundle: ['--dsw-alias-state-warn-primary'] },
  { id: 'state-success', category: 'feedback', name: '成功色', description: '成功提示', control: 'color', bundle: ['--dsw-alias-state-success-primary'] },
  { id: 'interactive-hover', category: 'feedback', name: '悬停反馈', description: '可交互元素悬停底色', control: 'color', bundle: ['--dsw-alias-interactive-bg-hover'] },
  // —— 布局与排版 ——
  {
    id: 'layout-width', category: 'layout', name: '内容宽度', description: '会话正文最大宽度', control: 'number',
    bundle: ['--dsh-chat-content-width'], fallback: { '--dsh-chat-content-width': { light: '748px', dark: '748px' } },
    min: 640, max: 1280, step: 20, unit: 'px',
  },
  {
    id: 'shadow-level', category: 'layout', name: '阴影档', description: '卡片浮起阴影强度', control: 'select', bundle: ['--dsw-shadow-lv2'],
    options: [
      { label: '无', value: '' },
      { label: '柔和', value: '0 4px 12px 0 rgba(0, 0, 0, 0.02), 0 2px 8px 0 rgba(0, 0, 0, 0.04)' },
      { label: '明显', value: '0 8px 24px 0 rgba(0, 0, 0, 0.08), 0 4px 12px 0 rgba(0, 0, 0, 0.12)' },
    ],
  },
]

export function findKnob(id: string): KnobDef | undefined {
  return KNOBS.find(knob => knob.id === id)
}

/** 旋钮束令牌 → 默认值（目录优先，fallback 兜底——回读与 UI 初始显示用）。 */
export function knobDefaultFor(knobId: string, tokenName: string, scheme: 'light' | 'dark'): string {
  const knob = findKnob(knobId)
  if (knob === undefined) return ''
  const entry = findToken(tokenName)
  if (entry !== undefined) return scheme === 'dark' ? entry.dark : entry.light
  const fb = knob.fallback?.[tokenName]
  if (fb !== undefined) return scheme === 'dark' ? fb.dark : fb.light
  return ''
}

/**
 * 旋钮值 → 令牌局部覆盖。
 * @param scheme - null = 单值模式（亮暗同写，用户决策 D 默认）；'light'/'dark' = 分别设置模式（只写该方案）。
 */
export function knobValueForScheme(
  knobId: string,
  value: string,
  scheme: 'light' | 'dark' | null,
): Record<string, Partial<TokenOverride>> {
  const knob = findKnob(knobId)
  const out: Record<string, Partial<TokenOverride>> = {}
  if (knob === undefined) return out
  for (const name of knob.bundle) {
    out[name] = scheme === null ? { light: value, dark: value } : { [scheme]: value }
  }
  return out
}

/** 令牌 → 旋钮当前值（主令牌；无覆盖取目录默认并解析 var() 链；select/font 无匹配回退首档）。 */
export function tokensToKnobValue(
  knobId: string,
  tokens: Record<string, TokenOverride>,
  scheme: 'light' | 'dark' = 'light',
): string {
  const knob = findKnob(knobId)
  if (knob === undefined) return ''
  const primary = knob.bundle[0]
  const existing = tokens[primary]
  const raw = existing !== undefined
    ? existing[scheme]
    : resolveTokenValue(knobDefaultFor(knobId, primary, scheme), scheme)
  if ((knob.control === 'select' || knob.control === 'font') && knob.options !== undefined) {
    if (!knob.options.some(option => option.value === raw)) return knob.options[0]?.value ?? ''
  }
  return raw
}

/** 束内是否含 caution/expert 令牌（UI 安全角标）。 */
export function knobCaution(knobId: string): boolean {
  const knob = findKnob(knobId)
  if (knob === undefined) return false
  return knob.bundle.some(name => {
    const entry = findToken(name)
    return entry !== undefined && (entry.safety === 'caution' || entry.safety === 'expert')
  })
}

/** 旋钮束覆盖到的令牌全集（高级区角标提示用）。 */
export function knobCoveredTokens(): Set<string> {
  const out = new Set<string>()
  for (const knob of KNOBS) for (const name of knob.bundle) out.add(name)
  return out
}
