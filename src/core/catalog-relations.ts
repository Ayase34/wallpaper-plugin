/**
 * #111 令牌 → 界面影响面（C4）：目录只描述「这个令牌是什么」，AI 还需要知道
 * 「改了它会动到哪」。这里做人工策展的常用令牌映射（不追求全覆盖）：
 * - preset_catalog 的 render 在令牌行尾附「影响：…」，AI 改色前能判断波及范围；
 * - preset_check 对「改了高风险面」的候选追加提醒（可选）。
 * 名称与 DSH 实际消费点对齐（见 项目文档/DH前端元素盘点）。
 */

export interface TokenRelation {
  /** 会跟着变的界面区域（人工描述，简短）。 */
  affects: string
  /** 与哪些令牌通常需要成组调整（供 AI 参考）。 */
  pairs?: string[]
}

export const TOKEN_RELATIONS: Record<string, TokenRelation> = {
  '--dsw-alias-bg-base': { affects: '整个界面底色（含滚动区）', pairs: ['--dsw-alias-label-primary', '--dsw-alias-bg-layer-1'] },
  '--dsw-alias-bg-layer-1': { affects: '卡片/输入卡/浮层浅层', pairs: ['--dsw-alias-bg-layer-2'] },
  '--dsw-alias-bg-layer-2': { affects: '弹层/菜单/设置面板', pairs: ['--dsw-alias-bg-layer-1'] },
  '--dsw-alias-bg-layer-3': { affects: '嵌套卡片与高层浮层', pairs: ['--dsw-alias-bg-layer-2'] },
  '--dsw-specific-sidebar-fill': { affects: '左侧导航栏整条背景', pairs: ['--dsw-specific-sidebar-nav-item-active'] },
  '--dsw-specific-sidebar-nav-item-active': { affects: '侧栏当前选中项底色' },
  '--dsw-specific-sidebar-nav-item-active-accent': { affects: '侧栏激活强调 + 提问卡「推荐」徽标底色', pairs: ['--dsw-alias-button-info-fill'] },
  '--dsw-specific-bubble': { affects: '会话消息气泡底色' },
  '--dsw-specific-input-major': { affects: '底部输入框区域底色' },
  '--dsw-alias-label-primary': { affects: '正文/标题/按钮文字（大面积文字）', pairs: ['--dsw-alias-bg-base'] },
  '--dsw-alias-label-secondary': { affects: '描述、次级信息' },
  '--dsw-alias-label-tertiary': { affects: '占位、辅助说明（小字，注意对比度）' },
  '--dsw-alias-label-primary-foreground': { affects: '深色按钮/Tag 上的文字', pairs: ['--dsw-alias-button-primary-fill', '--dsw-alias-button-info-fill'] },
  '--dsw-alias-brand-primary': { affects: '品牌色：链接、图标强调、主按钮', pairs: ['--dsw-alias-button-info-fill', '--dsw-alias-state-business-primary'] },
  '--dsw-alias-button-info-fill': { affects: '主要按钮填充 + 推荐徽标文字色' },
  '--dsw-alias-button-primary-fill': { affects: '深色实心按钮填充' },
  '--dsw-alias-border-l2': { affects: '卡片/分隔线一级边框（最常用）' },
  '--dsw-alias-state-error-primary': { affects: '报错/失败提示' },
  '--dsw-alias-state-warn-primary': { affects: '警告/未保存提示' },
  '--dsw-alias-state-success-primary': { affects: '成功提示' },
  '--dsw-alias-markdown-code-block': { affects: '对话里的代码块底色', pairs: ['--dsw-alias-markdown-inline-code'] },
  '--dsw-alias-markdown-inline-code': { affects: '行内代码底色' },
  '--dsw-alias-toast-bg': { affects: '右上角轻提示底色', pairs: ['--dsw-alias-toast-label'] },
  '--dsw-alias-tooltip-bg': { affects: '悬停提示（tooltip）底色' },
  '--dsw-alias-settings-card-fill': { affects: '设置面板卡片底色', pairs: ['--dsw-alias-settings-card-stroke'] },
  '--dsw-alias-settings-card-stroke': { affects: '设置面板卡片描边' },
  '--dsw-radius-md': { affects: '按钮/菜单圆角（全局观感）', pairs: ['--dsw-radius-lg', '--dsw-radius-panel'] },
  '--dsw-radius-panel': { affects: '弹层面板圆角（最显眼的大圆角）' },
  '--dsw-corner-shape': { affects: '整体「圆角形状」：干净圆角 vs 果冻方感' },
  '--ds-transition-duration': { affects: '全局过渡速度（悬停/展开/弹层）' },
  '--dsw-mask-blur': { affects: '弹层遮罩的毛玻璃强度' },
  '--dsw-font-family': { affects: '全局字体族（正文与界面）' },
  '--dsh-chat-content-width': { affects: '会话正文最大宽度（阅读密度）' },
}

/** 查影响面（无策展条目 → undefined）。 */
export function tokenRelation(name: string): TokenRelation | undefined {
  return TOKEN_RELATIONS[name]
}
