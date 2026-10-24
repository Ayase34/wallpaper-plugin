/**
 * 内置示例/出厂预设（core 共享数据：浏览器 half 的 demo.ts 再导出；Node half 的
 * AI 工具同源使用——单一事实源）。
 * #82（用户拍板）：删光全部旧出厂预设，仅保留唯一预设 **DeepSeek**（海蓝色印象）。
 * #95（用户拍板，正式收尾）：出厂预设更名 **默认**（id=default）——与用户库预设同名
 * 同 id，列表去重只显示一张「默认」卡片；用户环境由库预设提供（含壁纸三件套），
 * 全新安装由本出厂预设兜底（令牌同款海洋风格）。
 * #113/#114（2026-10）：令牌从 15 扩到 36，补齐语义层（菜单/浮层/边框/按钮悬停/状态三色/
 * 交互/代码面/toast），使 27 个旋钮中的 20 个「颜色旋钮」在出厂状态即可回读、且整束自洽；
 * 剩余 7 个非颜色旋钮（字体/圆角/形状/毛玻璃/动效/阴影/宽度）故意不设——它们不属于配色主题。
 * 浅色 tertiary 压深到 4.5:1 以上、品牌蓝统一为 rgb(0,96,236)（白字 5.41 / 对画布 5.04）。
 * #108：令牌集独立导出（DEMO_DEFAULT_TOKENS），node half 播种「带壁纸的默认」时复用
 * 同一套色调（避免两处各写一份漂移）；出厂兜底仍是不含素材的纯令牌版本（浏览器包零图像负载）。
 */
import type { Preset } from './schema.ts'

/** 出厂预设「默认」的令牌集（#108：出厂兜底与库内播种版共用，单一事实源）。 */
export const DEMO_DEFAULT_TOKENS: Record<string, { light: string; dark: string }> = {
  // 背景与结构面
  '--dsw-alias-bg-base': { light: 'rgb(240, 248, 255)', dark: 'rgb(6, 14, 30)' },
  '--dsw-alias-bg-layer-1': { light: 'rgb(255, 255, 255)', dark: 'rgb(12, 22, 42)' },
  '--dsw-alias-bg-layer-2': { light: 'rgb(226, 241, 255)', dark: 'rgb(18, 32, 58)' },
  '--dsw-specific-sidebar-fill': { light: 'rgb(230, 243, 255)', dark: 'rgb(4, 10, 24)' },
  '--dsw-specific-sidebar-nav-item-active': { light: 'rgb(214, 232, 255)', dark: 'rgb(18, 36, 70)' },
  '--dsw-specific-sidebar-nav-item-active-accent': { light: 'rgb(250, 252, 255)', dark: 'rgb(18, 34, 64)' },
  '--dsw-specific-bubble': { light: 'rgb(214, 235, 255)', dark: 'rgb(14, 30, 56)' },
  '--dsw-specific-bubble-highlight': { light: 'rgb(178, 216, 255)', dark: 'rgb(24, 48, 88)' },
  '--dsw-specific-input-major': { light: 'rgb(255, 255, 255)', dark: 'rgb(10, 20, 40)' },
  // 菜单 / 悬浮层（旋钮「菜单与悬浮层」整束派生）
  '--dsw-specific-menu': { light: 'rgb(236, 245, 255)', dark: 'rgb(22, 38, 66)' },
  '--dsw-specific-tip': { light: '#e3ebf5', dark: '#1f2f4a' },
  '--dsw-specific-selector': { light: '#d9e1eb', dark: '#293751' },
  '--dsw-alias-bg-overlay': { light: 'rgba(236, 245, 255, 0.6)', dark: 'rgba(22, 38, 66, 0.6)' },
  // 边框（冷调半透明，保留宿主「半透明描边」用法）
  '--dsw-alias-border-l2': { light: 'rgba(0, 72, 160, 0.12)', dark: 'rgba(150, 196, 255, 0.16)' },
  // 设置卡（宿主默认从 layer-2/border 派生；显式写一份让旋钮回读与实际一致）
  '--dsw-alias-settings-card-fill': { light: 'rgb(226, 241, 255)', dark: 'rgb(18, 32, 58)' },
  '--dsw-alias-settings-card-stroke': { light: 'rgba(0, 72, 160, 0.14)', dark: 'rgba(150, 196, 255, 0.18)' },
  // 品牌与按钮（悬停由旋钮派生，回读一致）
  '--dsw-alias-brand-primary': { light: 'rgb(0, 96, 236)', dark: 'rgb(96, 160, 255)' },
  '--dsw-alias-button-primary-fill': { light: 'rgb(0, 96, 236)', dark: 'rgb(96, 160, 255)' },
  '--dsw-alias-button-info-fill': { light: 'rgb(0, 96, 236)', dark: 'rgb(96, 160, 255)' },
  '--dsw-alias-state-business-primary': { light: 'rgb(0, 96, 236)', dark: 'rgb(96, 160, 255)' },
  '--dsw-alias-button-primary-hover': { light: '#004fc2', dark: '#7db1ff' },
  '--dsw-alias-button-info-hover': { light: '#004fc2', dark: '#7db1ff' },
  // 状态与交互
  '--dsw-alias-state-error-primary': { light: 'rgb(191, 45, 52)', dark: 'rgb(255, 138, 128)' },
  '--dsw-alias-state-warn-primary': { light: 'rgb(144, 94, 0)', dark: 'rgb(255, 191, 92)' },
  '--dsw-alias-state-success-primary': { light: 'rgb(20, 118, 84)', dark: 'rgb(96, 214, 164)' },
  '--dsw-alias-interactive-bg-hover': { light: 'rgba(0, 72, 160, 0.06)', dark: 'rgba(150, 196, 255, 0.08)' },
  // 文字三级
  '--dsw-alias-label-primary': { light: 'rgb(10, 32, 62)', dark: 'rgb(232, 242, 255)' },
  '--dsw-alias-label-secondary': { light: 'rgb(66, 98, 140)', dark: 'rgb(164, 186, 216)' },
  '--dsw-alias-label-tertiary': { light: 'rgb(80, 106, 144)', dark: 'rgb(128, 152, 186)' },
  // 代码 / 引用面（旋钮整束派生）
  '--dsw-alias-markdown-code-block': { light: 'rgb(230, 241, 254)', dark: 'rgb(14, 26, 46)' },
  '--dsw-alias-markdown-code-block-banner': { light: '#dde7f4', dark: '#182336' },
  '--dsw-alias-markdown-inline-code': { light: '#d4deea', dark: '#212c3f' },
  '--dsw-alias-markdown-citation': { light: '#dfeaf6', dark: '#152134' },
  '--dsw-alias-markdown-tag': { light: '#d8e3ef', dark: '#1c283b' },
  // 浮层（toast / tooltip，旋钮整束派生）
  '--dsw-alias-toast-bg': { light: 'rgb(26, 41, 64)', dark: 'rgb(34, 51, 78)' },
  '--dsw-alias-tooltip-bg': { light: '#19273d', dark: '#2b3b55' },
}

function preset(id: string, name: string, tokens: Record<string, { light: string; dark: string }>, style?: string): Preset {
  return {
    schemaVersion: 1,
    id,
    name,
    author: { name: 'wallpaper-plugin' },
    edition: 'standard',
    targetDshVersion: '0.1.0-rc.5',
    // #73 风格参考机制：style:xxx 标签供 preset_list/preset_get 输出，AI 可用作风范例引导
    tags: style !== undefined ? ['builtin', `style:${style}`] : ['builtin'],
    tokens,
  }
}

export const DEMO_PRESETS: Preset[] = [
  // 默认出厂预设：海蓝色印象（亮 = 海面浅蓝/海雾白，暗 = 深海夜蓝），唯一出厂预设（#82/#95）
  preset('default', '默认', DEMO_DEFAULT_TOKENS, '海洋清爽'),
]

/** 出厂预设 id 集合（apply/audit 用）。 */
export function isDemoPreset(id: string): boolean {
  return DEMO_PRESETS.some(preset => preset.id === id)
}
