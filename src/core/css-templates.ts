/**
 * CSS 补丁模板库与可用选择器锚点（#67 P1）：单一事实源——
 * UI（css-editor.tsx 模板下拉）与 AI 工具（preset_catalog 的 css_anchors）共用。
 * 锚点均为 DSH 实测稳定元素（web-react scoped-slots 可寻址缝 / ui-conversation 组件，
 * 决策 #23 实测），选择器符合 schema 白名单（[data- 开头），rules 无花括号。
 * 注意：schema 白名单允许任意 [data- 开头选择器，但只有本清单是宿主实测存在且稳定的
 * 元素——LLM 凭此写 CSS 补丁可避免瞎猜（分析报告 P1：工具侧此前零锚点知识）。
 */
import type { CssRule } from './schema.ts'

export interface CssTemplate {
  label: string
  rule: CssRule
}

/** 模板库（UI 模板下拉数据源）。 */
export const CSS_TEMPLATES: CssTemplate[] = [
  { label: '会话区背景', rule: { selector: '[data-chat-flow]', rules: 'background: var(--dsw-alias-bg-base)' } },
  { label: '输入区卡片', rule: { selector: '[data-composer-seat]', rules: 'background: var(--dsw-alias-bg-layer-1); border-top: 1px solid var(--dsw-alias-border-l2)' } },
  { label: '深色模式微调', rule: { selector: '[data-ds-dark-theme]', rules: '--dsw-alias-bg-base: rgb(13, 18, 27)' } },
  { label: '消息滚动区', rule: { selector: '[data-conversation-scroll]', rules: 'scrollbar-width: thin' } },
]

/** 可用选择器锚点清单（preset_catalog 输出，供 LLM 直接选用）。 */
export const CSS_ANCHORS: Array<{ selector: string; label: string; note: string }> = [
  { selector: '[data-chat-flow]', label: '会话区背景', note: '会话消息流整体背景（最常用）' },
  { selector: '[data-composer-seat]', label: '输入区卡片', note: '底部输入框区域' },
  { selector: '[data-ds-dark-theme]', label: '深色模式微调', note: '深色模式下整页（html 级属性选择器）' },
  { selector: '[data-conversation-scroll]', label: '消息滚动区', note: '会话滚动容器（scrollbar 等）' },
]
