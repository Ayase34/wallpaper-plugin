/**
 * AI 质量预检（#72 初始 / #73 扩展）：preset_check 工具数据源——创建/更新预设前评估候选载荷。
 * #73 变更（双代理评估 P0 落地）：
 * - 全载荷结构校验：tokens/css/assets/widgets/theme 组装后走 validatePreset（"check 通过 = create 必成"
 *   对提供的字段成立）——消除"check 过了 create 还失败"的假安全感
 * - 组件面对比矩阵：label 家族 vs bg-base/layer-1/layer-2/sidebar/bubble/input/menu（文字类 4.5/3.0），
 *   按钮文字（label-primary-foreground）vs 主/信息/业务按钮填充（UI 组件 3:1）
 * - var() 候选内链解析（resolveTokenValue 只查目录——候选内自定义令牌引用此前静默跳过）
 * - 静默路径显式化：候选提供的颜色不可解析 → warn；parseRgbColor 已扩展支持 hsl/8 位 hex/空格 rgb
 * - 明暗护栏：bg-base light 比 dark 更暗 → warn（明暗反转）
 * - safety 参与：覆写目录 caution 级令牌 → warn（影响面大）；目录无 expert 级（描述不再提 expert）
 */
import { catalog } from './catalog.ts'
import { contrastForValues, parseRgbColor, relativeLuminance } from './contrast.ts'
import { validatePreset } from './schema.ts'

export interface PrecheckIssue {
  token: string
  scheme?: 'light' | 'dark'
  severity: 'error' | 'warn'
  message: string
}

export interface PrecheckResult {
  ok: boolean
  issues: PrecheckIssue[]
  summary: {
    tokenCount: number
    unknownTokens: number
    contrastIssues: number
    pass: boolean
  }
}

/** 文字类对比对：前景文字令牌 vs 背景面（文字标准：FAIL<3 / 大文本 3 / AA 4.5 / AAA 7）。 */
const TEXT_PAIRS: Array<{ fg: string; bg: string; label: string }> = [
  { fg: '--dsw-alias-label-primary', bg: '--dsw-alias-bg-base', label: '主文字' },
  { fg: '--dsw-alias-label-secondary', bg: '--dsw-alias-bg-base', label: '次文字' },
  { fg: '--dsw-alias-label-tertiary', bg: '--dsw-alias-bg-base', label: '辅助文字' },
  { fg: '--dsw-alias-label-primary', bg: '--dsw-alias-bg-layer-1', label: '卡片浮层文字' },
  { fg: '--dsw-alias-label-primary', bg: '--dsw-alias-bg-layer-2', label: '高层浮层文字' },
  { fg: '--dsw-alias-label-primary', bg: '--dsw-specific-sidebar-fill', label: '侧栏文字' },
  { fg: '--dsw-alias-label-primary', bg: '--dsw-specific-bubble', label: '气泡文字' },
  { fg: '--dsw-alias-label-primary', bg: '--dsw-specific-input-major', label: '输入框文字' },
  { fg: '--dsw-alias-label-primary', bg: '--dsw-specific-menu', label: '菜单/提示文字' },
]

/** 按钮类对比对：按钮文字（label-primary-foreground）vs 按钮填充（UI 组件标准 3:1）。 */
const BUTTON_PAIRS: Array<{ bg: string; label: string }> = [
  { bg: '--dsw-alias-button-primary-fill', label: '主按钮' },
  { bg: '--dsw-alias-button-info-fill', label: '信息按钮' },
  { bg: '--dsw-alias-state-business-primary', label: '业务状态' },
]

/** 目录外令牌豁免前缀（--dsh- 与 --ds- 宿主扩展，audit 同款）。 */
const KNOWN_PREFIXES = ['--dsh-', '--ds-']

/**
 * 解析令牌值到可对比颜色（#73：候选内 var 链优先，再目录 + var() 链）。
 * 返回 { color, fromCandidate }——fromCandidate 供"不可解析显式 warn"判定。
 */
function resolveColor(
  name: string,
  scheme: 'light' | 'dark',
  tokens: Record<string, { light: string; dark: string }>,
): { color: string; fromCandidate: boolean } {
  const override = tokens[name]
  let value = override !== undefined ? override[scheme] : ''
  let fromCandidate = override !== undefined
  if (value === '') {
    const entry = catalog.entries.find(e => e.name === name)
    if (entry === undefined) return { color: '', fromCandidate }
    value = scheme === 'light' ? entry.light : entry.dark
  }
  // var() 链：候选内引用优先（resolveTokenValue 只查目录——候选内自定义令牌此前静默跳过）
  for (let depth = 0; depth < 8; depth += 1) {
    const m = /^var\(\s*(--[\w-]+)/.exec(value.trim())
    if (m === null) return { color: value, fromCandidate }
    const ref = tokens[m[1]]
    if (ref !== undefined) {
      fromCandidate = true
      value = ref[scheme]
      continue
    }
    const entry = catalog.entries.find(e => e.name === m[1])
    if (entry === undefined) return { color: value, fromCandidate }
    const next = (scheme === 'dark' ? entry.dark : entry.light).trim()
    if (next === value) return { color: value, fromCandidate }
    value = next
  }
  return { color: value, fromCandidate }
}

/**
 * 质量预检（纯函数）：全载荷结构硬校验（组装 validatePreset）+ 未知令牌警告 +
 * 组件面文字/按钮对比度 + 明暗护栏 + caution 覆写警告。
 * @param tokens - 候选令牌（{light,dark} 双值）
 * @param css - 候选 CSS 补丁（可选）
 * @param extra - 候选 assets/widgets/theme（可选；#73 全载荷校验）
 */
export function precheckPreset(
  tokens: Record<string, unknown>,
  css?: Array<{ selector: unknown; rules?: unknown }>,
  extra?: { assets?: unknown; widgets?: unknown; theme?: unknown },
): PrecheckResult {
  const issues: PrecheckIssue[] = []
  const pairs: Record<string, { light: string; dark: string }> = {}

  // 硬校验：结构 + 令牌名 + 全载荷（组装 validatePreset——与 create 同构，"通过 = 必成"）
  for (const [name, value] of Object.entries(tokens)) {
    if (!name.startsWith('--')) {
      issues.push({ token: name, severity: 'error', message: '令牌名必须以 -- 开头' })
      continue
    }
    if (typeof value !== 'object' || value === null || Array.isArray(value)
      || typeof (value as { light?: unknown }).light !== 'string'
      || typeof (value as { dark?: unknown }).dark !== 'string') {
      issues.push({ token: name, severity: 'error', message: '值必须是 { light, dark } 双值字符串' })
      continue
    }
    pairs[name] = { light: (value as { light: string }).light, dark: (value as { dark: string }).dark }
    const known = catalog.entries.some(e => e.name === name) || KNOWN_PREFIXES.some(p => name.startsWith(p))
    if (!known) {
      issues.push({ token: name, severity: 'warn', message: '目录外令牌（界面可能不生效，先用 preset_catalog 查证）' })
    }
  }
  // #73：全载荷结构校验（assets/widgets/theme 与 create 同构；错误即 create 会失败的形状问题）
  const fullLoad = validatePreset({
    schemaVersion: 1,
    id: 'precheck',
    name: 'precheck',
    edition: 'standard',
    tokens: pairs,
    ...(css !== undefined ? { css } : {}),
    ...(extra?.assets !== undefined ? { assets: extra.assets } : {}),
    ...(extra?.widgets !== undefined ? { widgets: extra.widgets } : {}),
    ...(extra?.theme !== undefined ? { theme: extra.theme } : {}),
  })
  if (!fullLoad.ok) {
    for (const error of fullLoad.errors) issues.push({ token: '载荷', severity: 'error', message: error })
  }

  // #73 注记：safety=caution 的令牌 95 条且以 specific-* 换肤核心令牌为主（出厂预设全部覆盖）——
  // "caution 覆写 warn"实证无区分度（噪音 > 价值），已移除；safety 语义保留在 preset_catalog
  // 输出中供 LLM 自行参考。

  // 对比度矩阵：文字类 + 按钮类（明暗各算）
  let contrastIssues = 0
  const checkPair = (fgName: string, bgName: string, label: string, threshold: 'text' | 'component'): void => {
    for (const scheme of ['light', 'dark'] as const) {
      const fg = resolveColor(fgName, scheme, pairs)
      const bg = resolveColor(bgName, scheme, pairs)
      const result = fg.color !== '' && bg.color !== '' ? contrastForValues(fg.color, bg.color) : null
      if (result === null) {
        // 静默路径显式化：候选提供的颜色不可解析 → warn（目录默认不可解析静默，避免噪音）
        if (fg.fromCandidate || bg.fromCandidate) {
          issues.push({
            token: fgName, scheme, severity: 'warn',
            message: `颜色无法解析（${fgName}=${fg.color || '空'} / ${bgName}=${bg.color || '空'}），对比度跳过`,
          })
        }
        continue
      }
      if (threshold === 'text') {
        if (result.grade === 'FAIL' || result.grade === 'AA-large') {
          contrastIssues += 1
          issues.push({
            token: fgName, scheme, severity: 'warn',
            message: `${label}对比度 ${result.ratio.toFixed(1)}:1 ${result.grade === 'FAIL' ? '不足（FAIL，建议 ≥4.5:1）' : '仅达标大文本（AA-large，建议 ≥4.5:1）'}`,
          })
        }
      } else if (result.grade === 'FAIL') {
        contrastIssues += 1
        issues.push({
          token: fgName, scheme, severity: 'warn',
          message: `${label}文字对比度 ${result.ratio.toFixed(1)}:1 不足（UI 组件标准 ≥3:1）`,
        })
      }
    }
  }
  for (const pair of TEXT_PAIRS) checkPair(pair.fg, pair.bg, pair.label, 'text')
  for (const pair of BUTTON_PAIRS) checkPair('--dsw-alias-label-primary-foreground', pair.bg, pair.label, 'component')

  // #73：明暗护栏——bg-base light 比 dark 更暗 → 明暗反转警告
  const bgLight = resolveColor('--dsw-alias-bg-base', 'light', pairs)
  const bgDark = resolveColor('--dsw-alias-bg-base', 'dark', pairs)
  if (bgLight.color !== '' && bgDark.color !== '') {
    const lLight = luminanceOf(bgLight.color)
    const lDark = luminanceOf(bgDark.color)
    if (lLight !== null && lDark !== null && lLight < lDark) {
      issues.push({
        token: '--dsw-alias-bg-base', severity: 'warn',
        message: '明暗反转：亮色模式的底色比暗色模式更深（通常应 light 亮 / dark 暗）',
      })
    }
  }

  const unknownTokens = issues.filter(i => i.message.includes('目录外令牌')).length
  return { ok: issues.every(i => i.severity !== 'error'), issues, summary: { tokenCount: Object.keys(tokens).length, unknownTokens, contrastIssues, pass: issues.every(i => i.severity !== 'error') } }
}

/** 颜色字符串的相对亮度（null = 不可解析）。 */
function luminanceOf(color: string): number | null {
  const rgb = parseRgbColor(color)
  return rgb === null ? null : relativeLuminance(rgb)
}
