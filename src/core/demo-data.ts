/**
 * 内置示例/出厂预设（core 共享数据：浏览器 half 的 demo.ts 再导出；Node half 的
 * AI 工具同源使用——单一事实源）。
 * #82（用户拍板）：删光全部旧出厂预设，仅保留唯一预设 **DeepSeek**（海蓝色印象）。
 * #95（用户拍板，正式收尾）：出厂预设更名 **默认**（id=default）——与用户库预设同名
 * 同 id，列表去重只显示一张「默认」卡片；用户环境由库预设提供（含壁纸三件套），
 * 全新安装由本出厂预设兜底（令牌同款海洋风格）。预检矩阵全净
 * （preset_check：15 令牌 0 提示，label 家族 AA + 按钮 3:1 明暗各算）。
 */
import type { Preset } from './schema.ts'

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
  preset('default', '默认', {
    '--dsw-alias-bg-base': { light: 'rgb(240, 248, 255)', dark: 'rgb(6, 14, 30)' },
    '--dsw-alias-bg-layer-1': { light: 'rgb(255, 255, 255)', dark: 'rgb(12, 22, 42)' },
    '--dsw-alias-bg-layer-2': { light: 'rgb(226, 241, 255)', dark: 'rgb(18, 32, 58)' },
    '--dsw-specific-sidebar-fill': { light: 'rgb(230, 243, 255)', dark: 'rgb(4, 10, 24)' },
    '--dsw-specific-bubble': { light: 'rgb(214, 235, 255)', dark: 'rgb(14, 30, 56)' },
    '--dsw-specific-bubble-highlight': { light: 'rgb(178, 216, 255)', dark: 'rgb(24, 48, 88)' },
    '--dsw-specific-input-major': { light: 'rgb(255, 255, 255)', dark: 'rgb(10, 20, 40)' },
    '--dsw-alias-brand-primary': { light: 'rgb(0, 105, 255)', dark: 'rgb(96, 160, 255)' },
    '--dsw-alias-button-info-fill': { light: 'rgb(0, 105, 255)', dark: 'rgb(84, 150, 255)' },
    '--dsw-alias-state-business-primary': { light: 'rgb(0, 105, 255)', dark: 'rgb(84, 150, 255)' },
    '--dsw-specific-sidebar-nav-item-active': { light: 'rgb(214, 232, 255)', dark: 'rgb(18, 36, 70)' },
    '--dsw-specific-sidebar-nav-item-active-accent': { light: 'rgb(0, 105, 255)', dark: 'rgb(96, 160, 255)' },
    '--dsw-alias-label-primary': { light: 'rgb(10, 32, 62)', dark: 'rgb(232, 242, 255)' },
    '--dsw-alias-label-secondary': { light: 'rgb(66, 98, 140)', dark: 'rgb(164, 186, 216)' },
    '--dsw-alias-label-tertiary': { light: 'rgb(86, 112, 150)', dark: 'rgb(128, 152, 186)' },
  }, '海洋清爽'),
]

/** 出厂预设 id 集合（apply/audit 用）。 */
export function isDemoPreset(id: string): boolean {
  return DEMO_PRESETS.some(preset => preset.id === id)
}
