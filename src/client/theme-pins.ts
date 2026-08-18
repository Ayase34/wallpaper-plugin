/**
 * 工作室 chrome 钉定（修复轮 #20）：草稿令牌全局生效（所见即所得设计），
 * 若工作室自身 UI（背景/按钮/文字）跟随草稿令牌，编辑时会整体变脸——
 * 用户观感是"预览窗口很小，但整个侧栏都变色"。
 *
 * 方案：打开工作室时把 chrome 用到的令牌按「原貌」（活动层覆盖 + 目录默认）
 * 解析为字面值，注入工作室根元素（同名 CSS 变量遮蔽全局草稿值）；
 * 预览面板内的局部变量（草稿值）优先级更高 → 只有模拟窗口实时变色。
 */
import { catalog } from '../core/catalog.ts'
import type { TokenOverride } from '../core/schema.ts'

/** 工作室 chrome 使用的令牌（随 UI 增长维护；预览面板内部不受此限制）。 */
export const CHROME_TOKENS: readonly string[] = [
  '--dsw-alias-bg-base',
  '--dsw-alias-bg-layer-1',
  '--dsw-alias-bg-layer-2',
  '--dsw-alias-border-l2',
  '--dsw-alias-label-primary',
  '--dsw-alias-label-secondary',
  '--dsw-alias-label-tertiary',
  '--dsw-alias-button-info-fill',
  '--dsw-alias-state-error-primary',
  '--dsw-alias-state-warn-primary',
]

export type ChromeScheme = 'light' | 'dark'

/** var() 引用链解析上限（与 core/token-utils 一致）。 */
const MAX_RESOLVE_DEPTH = 8

interface SchemePair { light: string; dark: string }

/** 引用链解析（lookup 表内；无法解析时原样返回）。 */
function resolveChain(value: string, table: Map<string, SchemePair>, scheme: ChromeScheme): string {
  let current = value.trim()
  for (let depth = 0; depth < MAX_RESOLVE_DEPTH; depth += 1) {
    const m = /^var\(\s*(--[\w-]+)/.exec(current)
    if (m === null) return current
    const entry = table.get(m[1])
    if (entry === undefined) return current
    const next = (scheme === 'dark' ? entry.dark : entry.light).trim()
    if (next === current) return current
    current = next
  }
  return current
}

/**
 * 计算 chrome 钉定：目录默认 + 活动预设覆盖 → 各 chrome 令牌解析到字面值。
 * 纯函数（单测覆盖）；解析失败的令牌不钉定（保持跟随全局）。
 * @param activeTokens - 活动层令牌（引擎 getActiveCompiled().tokens；null = 无活动预设）。
 * @param scheme - 应用当前明暗。
 * @returns 令牌名 → 字面值映射（可直接注入元素 style）。
 */
export function computeChromePins(
  activeTokens: Record<string, TokenOverride> | null | undefined,
  scheme: ChromeScheme,
): Record<string, string> {
  const table = new Map<string, SchemePair>()
  for (const entry of catalog.entries) table.set(entry.name, { light: entry.light, dark: entry.dark })
  if (activeTokens !== null && activeTokens !== undefined) {
    for (const [name, value] of Object.entries(activeTokens)) {
      table.set(name, { light: value.light, dark: value.dark })
    }
  }
  const pins: Record<string, string> = {}
  for (const name of CHROME_TOKENS) {
    const entry = table.get(name)
    if (entry === undefined) continue
    pins[name] = resolveChain(scheme === 'dark' ? entry.dark : entry.light, table, scheme)
  }
  return pins
}

/**
 * 应用当前明暗：body[data-ds-dark-theme] 是调色板权威信号
 * （DSH ThemePresenter 源码实证：dark 时 body 挂该属性，html 同时写 color-scheme）。
 */
export function detectAppScheme(): ChromeScheme {
  try {
    if (typeof document !== 'undefined') {
      if (document.body !== null && document.body.hasAttribute('data-ds-dark-theme')) return 'dark'
      const cs = document.documentElement?.style.colorScheme
      if (cs === 'dark' || String(cs).includes('dark')) return 'dark'
    }
  } catch { /* 探测失败走 light 兜底 */ }
  return 'light'
}
