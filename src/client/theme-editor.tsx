/**
 * 主题注册编辑态类型（M2-4 高级区）。#96（审计）：ThemeEditor 组件及其 props 已随
 * #74 收缩删除（AI 工具接管主题注册）；本文件仅保留被 token-editor 消费的编辑态类型。
 */
export interface ThemeEditState {
  enabled: boolean
  colorScheme: 'light' | 'dark'
}
