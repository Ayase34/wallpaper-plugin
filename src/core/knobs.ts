/**
 * 旋钮抽象层（M2-1 / #111 扩展）：用户语言 → 令牌束 → 原始令牌。
 * 纯数据 + 纯函数（core 层，双 half 可复用、可单测）：UI 只是渲染层；
 * 保存产物仍是令牌双值（schema/引擎零改动）。
 *
 * #111 两项结构性扩展：
 * 1) 束内派生（derives）：主值之外的同束令牌按「更亮/更暗/随明暗反转/透明度」派生，
 *    不再把同一个值平铺进全部令牌（layer-1/2 会变成两级阶梯，而不是一片同色）。
 * 2) 多令牌档位（options[].values）：select 档位可携带逐令牌取值表，
 *    用于圆角（xs..panel 六个值）、动效（三档时长）、阴影（lv1/2/3）这类
 *    「一个语义档位 = 一组具体值」的映射。
 */
import { catalog, findToken } from './catalog.ts'
import { resolveTokenValue } from './token-utils.ts'
import { deriveFromBase, type DeriveMode } from './color-derive.ts'
import type { TokenOverride } from './schema.ts'

export type KnobControl = 'color' | 'font' | 'number' | 'select'

export interface KnobCategory {
  id: string
  name: string
  description: string
}

/** 束内派生规则（#111）。 */
export interface KnobDerive {
  mode: DeriveMode
  amount: number
  amountDark?: number
}

export interface KnobOption {
  label: string
  value: string
  /** #111：该档位对应的逐令牌取值（如圆角档位 xs→4px…panel→28px）。 */
  values?: Record<string, string>
}

export interface KnobDef {
  id: string
  category: string
  /** 用户语言名。 */
  name: string
  description: string
  control: KnobControl
  /** 束：令牌名列表（首个为主令牌——回读来源）。 */
  bundle: string[]
  /** 非目录令牌的默认兜底（如 --dsh-chat-content-width）。 */
  fallback?: Record<string, { light: string; dark: string }>
  /** #111：束内派生（未列出的令牌与主值相同；主令牌永远等于输入值）。 */
  derives?: Record<string, KnobDerive>
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
  { id: 'layout', name: '布局与排版', description: '宽度、圆角、动效与阴影' },
]

const RADIUS_TOKENS = ['--dsw-radius-xs', '--dsw-radius-sm', '--dsw-radius-md', '--dsw-radius-lg', '--dsw-radius-xl', '--dsw-radius-panel']

/** 圆角档位：一个语义档 = 六个令牌的具体值（#111 多令牌档位）。 */
function radiusOption(label: string, xs: string, sm: string, md: string, lg: string, xl: string, panel: string): KnobOption {
  return {
    label,
    value: label,
    values: {
      '--dsw-radius-xs': xs,
      '--dsw-radius-sm': sm,
      '--dsw-radius-md': md,
      '--dsw-radius-lg': lg,
      '--dsw-radius-xl': xl,
      '--dsw-radius-panel': panel,
    },
  }
}

export const KNOBS: KnobDef[] = [
  // —— 空间定位（界面分区底色） ——
  { id: 'spatial-bg', category: 'spatial', name: '背景', description: '整个界面的底色，最影响观感', control: 'color', bundle: ['--dsw-alias-bg-base'] },
  {
    id: 'spatial-layer', category: 'spatial', name: '抬升面', description: '卡片、输入框、弹层浮出的层次色（自动生成两级阶梯）', control: 'color',
    bundle: ['--dsw-alias-bg-layer-1', '--dsw-alias-bg-layer-2', '--dsw-alias-bg-layer-3'],
    derives: {
      '--dsw-alias-bg-layer-2': { mode: 'shade', amount: 0.1 },
      '--dsw-alias-bg-layer-3': { mode: 'shade', amount: 0.18 },
    },
  },
  { id: 'spatial-sidebar', category: 'spatial', name: '侧边栏', description: '左侧导航栏背景', control: 'color', bundle: ['--dsw-specific-sidebar-fill'] },
  { id: 'spatial-bubble', category: 'spatial', name: '对话气泡', description: '会话区消息气泡底色', control: 'color', bundle: ['--dsw-specific-bubble'] },
  { id: 'spatial-input', category: 'spatial', name: '输入框', description: '底部输入卡底色', control: 'color', bundle: ['--dsw-specific-input-major'] },
  {
    id: 'spatial-menu', category: 'spatial', name: '菜单与悬浮层', description: '菜单、提示、选择器、遮罩（自动分层）', control: 'color',
    bundle: ['--dsw-specific-menu', '--dsw-specific-tip', '--dsw-specific-selector', '--dsw-alias-bg-overlay'],
    derives: {
      '--dsw-specific-tip': { mode: 'shade', amount: 0.04 },
      '--dsw-specific-selector': { mode: 'shade', amount: 0.08 },
      '--dsw-alias-bg-overlay': { mode: 'alpha', amount: 0.6 },
    },
  },
  // —— 背景层次（边框与分隔） ——
  { id: 'border-level', category: 'layers', name: '边框深浅', description: '卡片与分区的一级边框（细分留高级令牌）', control: 'color', bundle: ['--dsw-alias-border-l2'] },
  // —— 强调色（品牌与主操作） ——
  { id: 'accent-brand', category: 'accent', name: '主色', description: '品牌主色、主按钮、业务状态一次全改', control: 'color', bundle: ['--dsw-alias-brand-primary', '--dsw-alias-button-info-fill', '--dsw-alias-state-business-primary'] },
  { id: 'accent-hover', category: 'accent', name: '悬停色', description: '主按钮悬停反馈', control: 'color', bundle: ['--dsw-alias-button-info-hover'] },
  {
    id: 'button-family', category: 'accent', name: '按钮家族', description: '主按钮/信息按钮/业务状态 + 悬停态（悬停自动加深或提亮）', control: 'color',
    bundle: [
      '--dsw-alias-button-primary-fill', '--dsw-alias-button-info-fill', '--dsw-alias-state-business-primary',
      '--dsw-alias-button-primary-hover', '--dsw-alias-button-info-hover',
    ],
    derives: {
      '--dsw-alias-button-primary-hover': { mode: 'shade', amount: 0.18 },
      '--dsw-alias-button-info-hover': { mode: 'shade', amount: 0.18 },
    },
  },
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
  // —— 布局与排版（#111 新增：圆角/形状/毛玻璃/动效/阴影/代码面） ——
  {
    id: 'radius-scale', category: 'layout', name: '圆角档', description: '全局圆角大小（按钮/菜单/弹层一起变）', control: 'select',
    bundle: RADIUS_TOKENS,
    options: [
      radiusOption('直角', '0px', '0px', '1px', '2px', '2px', '4px'),
      radiusOption('微圆', '2px', '4px', '6px', '8px', '10px', '12px'),
      radiusOption('标准', '4px', '8px', '12px', '16px', '20px', '28px'),
      radiusOption('大圆', '8px', '14px', '20px', '26px', '32px', '40px'),
      radiusOption('胶囊', '12px', '18px', '24px', '30px', '36px', '44px'),
    ],
  },
  {
    id: 'corner-shape', category: 'layout', name: '圆角形状', description: '干净圆角 vs 果冻方感（superellipse）', control: 'select',
    bundle: ['--dsw-corner-shape'],
    options: [
      { label: '标准圆角', value: 'round' },
      { label: '果冻方感', value: 'superellipse(1.5)' },
    ],
  },
  {
    id: 'mask-blur', category: 'layout', name: '毛玻璃强度', description: '弹层遮罩的模糊程度', control: 'select',
    bundle: ['--dsw-mask-blur'],
    options: [
      { label: '关闭', value: 'none' },
      { label: '轻', value: 'blur(2px)' },
      { label: '强', value: 'blur(8px)' },
      { label: '极强', value: 'blur(16px)' },
    ],
  },
  {
    id: 'motion-speed', category: 'layout', name: '动效档', description: '全局过渡速度（悬停/展开/弹层）', control: 'select',
    bundle: ['--ds-transition-duration', '--ds-transition-duration-fast', '--ds-transition-duration-slow'],
    options: [
      { label: '干脆', value: 'snappy', values: { '--ds-transition-duration': '0.12s', '--ds-transition-duration-fast': '0.06s', '--ds-transition-duration-slow': '0.2s' } },
      { label: '标准', value: 'normal', values: { '--ds-transition-duration': '0.2s', '--ds-transition-duration-fast': '0.1s', '--ds-transition-duration-slow': '0.3s' } },
      { label: '舒缓', value: 'slow', values: { '--ds-transition-duration': '0.32s', '--ds-transition-duration-fast': '0.16s', '--ds-transition-duration-slow': '0.48s' } },
    ],
  },
  {
    id: 'shadow-level', category: 'layout', name: '阴影档', description: '卡片浮起阴影强度（三档阴影一起缩放）', control: 'select',
    bundle: ['--dsw-shadow-lv2', '--dsw-shadow-lv1', '--dsw-shadow-lv3'],
    options: [
      { label: '无', value: 'none', values: { '--dsw-shadow-lv1': 'none', '--dsw-shadow-lv2': 'none', '--dsw-shadow-lv3': 'none' } },
      {
        label: '柔和', value: 'soft',
        // 与目录默认值逐字一致——回读（tokensToKnobValue）才能认出「当前就是柔和档」
        values: {
          '--dsw-shadow-lv1': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
          '--dsw-shadow-lv2': '0 4px 12px 0 rgba(0, 0, 0, 0.02), 0 2px 8px 0 rgba(0, 0, 0, 0.04)',
          '--dsw-shadow-lv3': '0 0 1px 0 rgba(0, 0, 0, 0.2), 0 0 4px 0 rgba(0, 0, 0, 0.02), 0 12px 32px 0 rgba(0, 0, 0, 0.08)',
        },
      },
      {
        label: '明显', value: 'strong',
        values: {
          '--dsw-shadow-lv1': '0 2px 6px 0 rgba(0, 0, 0, 0.08)',
          '--dsw-shadow-lv2': '0 8px 24px 0 rgba(0, 0, 0, 0.12), 0 4px 12px 0 rgba(0, 0, 0, 0.1)',
          '--dsw-shadow-lv3': '0 16px 40px 0 rgba(0, 0, 0, 0.18)',
        },
      },
    ],
  },
  {
    id: 'settings-card', category: 'spatial', name: '设置卡面', description: '设置面板卡片底色（描边留高级令牌）', control: 'color',
    // #113：描边不再进束——「边框」用 alpha(fill) 派生出来是半透明填充色而不是边框线，
    // 必然与手调描边冲突（旋钮行永远挂「束内已单独调整」）。描边交给高级令牌区。
    bundle: ['--dsw-alias-settings-card-fill'],
  },
  {
    id: 'markdown-surfaces', category: 'spatial', name: '代码与引用面', description: '代码块/行内代码/引用/标签底色（自动分层）', control: 'color',
    bundle: [
      '--dsw-alias-markdown-code-block', '--dsw-alias-markdown-code-block-banner',
      '--dsw-alias-markdown-inline-code', '--dsw-alias-markdown-citation', '--dsw-alias-markdown-tag',
    ],
    derives: {
      '--dsw-alias-markdown-code-block-banner': { mode: 'shade', amount: 0.04 },
      '--dsw-alias-markdown-inline-code': { mode: 'shade', amount: 0.08 },
      '--dsw-alias-markdown-citation': { mode: 'shade', amount: 0.03 },
      '--dsw-alias-markdown-tag': { mode: 'shade', amount: 0.06 },
    },
  },
  {
    id: 'overlay-surfaces', category: 'spatial', name: '提示与浮层', description: '轻提示（toast）与悬停提示（tooltip）底色', control: 'color',
    bundle: ['--dsw-alias-toast-bg', '--dsw-alias-tooltip-bg'],
    derives: { '--dsw-alias-tooltip-bg': { mode: 'shade', amount: 0.04 } },
  },
  {
    id: 'layout-width', category: 'layout', name: '内容宽度', description: '会话正文最大宽度', control: 'number',
    bundle: ['--dsh-chat-content-width'], fallback: { '--dsh-chat-content-width': { light: '748px', dark: '748px' } },
    min: 640, max: 1280, step: 20, unit: 'px',
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

/** 单令牌在某方案下的取值：主令牌=输入值；其余按 derives 派生（无规则=同值）。 */
function valueForToken(knob: KnobDef, token: string, base: string, scheme: 'light' | 'dark'): string {
  if (token === knob.bundle[0]) return base
  return deriveFromBase(base, knob.derives?.[token], scheme)
}

/**
 * 旋钮值 → 令牌局部覆盖（#111：支持派生与多令牌档位）。
 * @param scheme - null = 单值模式（亮暗各按自身规则写入）；'light'/'dark' = 分别设置模式（只写该方案）。
 */
export function knobValueForScheme(
  knobId: string,
  value: string,
  scheme: 'light' | 'dark' | null,
): Record<string, Partial<TokenOverride>> {
  const knob = findKnob(knobId)
  const out: Record<string, Partial<TokenOverride>> = {}
  if (knob === undefined) return out
  // 多令牌档位（圆角/动效/阴影）：档位携带逐令牌取值表（value 或 label 均可匹配）
  const option = knob.options?.find(o => o.values !== undefined && (o.value === value || o.label === value))
  if (option?.values !== undefined) {
    for (const [token, v] of Object.entries(option.values)) {
      out[token] = scheme === null ? { light: v, dark: v } : { [scheme]: v }
    }
    return out
  }
  for (const token of knob.bundle) {
    if (scheme === null) {
      out[token] = {
        light: valueForToken(knob, token, value, 'light'),
        dark: valueForToken(knob, token, value, 'dark'),
      }
    } else {
      out[token] = { [scheme]: valueForToken(knob, token, value, scheme) }
    }
  }
  return out
}

/**
 * #111：旋钮值支持「亮/暗分别给值」——color 旋钮可传 { light, dark }，
 * 派生规则按各自方案计算（shade 在亮色向黑、暗色向白）。
 */
export function knobValuesForSchemes(
  knobId: string,
  value: string | { light: string; dark: string },
): Record<string, TokenOverride> {
  if (typeof value === 'string') {
    const single = knobValueForScheme(knobId, value, null)
    const out: Record<string, TokenOverride> = {}
    for (const [token, partial] of Object.entries(single)) {
      out[token] = {
        light: partial.light ?? '',
        dark: partial.dark ?? '',
      }
    }
    return out
  }
  const lightPart = knobValueForScheme(knobId, value.light, 'light')
  const darkPart = knobValueForScheme(knobId, value.dark, 'dark')
  const out: Record<string, TokenOverride> = {}
  for (const token of new Set([...Object.keys(lightPart), ...Object.keys(darkPart)])) {
    out[token] = {
      light: lightPart[token]?.light ?? '',
      dark: darkPart[token]?.dark ?? '',
    }
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
    // #111：先按「档位逐令牌取值表」反查（圆角/动效/阴影），再按旧的单值档位匹配
    const byValues = knob.options.find(option => option.values !== undefined && option.values[primary] === raw)
    if (byValues !== undefined) return byValues.value
    const byValue = knob.options.find(option => option.value === raw || option.label === raw)
    if (byValue !== undefined) return byValue.value
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

/** 目录里存在、但没有任何旋钮覆盖的令牌（#111：给 preset_check/编辑器提示覆盖率）。 */
export function uncoveredCatalogTokens(): string[] {
  const covered = knobCoveredTokens()
  return catalog.entries.filter(entry => !covered.has(entry.name)).map(entry => entry.name)
}
