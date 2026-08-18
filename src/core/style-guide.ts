/**
 * 风格术语字典（#73 P0-2 风格参考机制）：preset_catalog 输出的 styles 段数据源。
 * 目的：给 LLM 提供"用户风格词 → 设计手法 + 可参考的出厂预设"的映射——
 * 工具面此前零美学引导（双代理评估：审美产出 C），这是审美杠杆最大的一步。
 * 每个风格词：term（用户常见说法）/ guidance（设计手法提示）/ demos（参考预设 id，可 preset_get 读令牌做范例）。
 */
export interface StyleGuideEntry {
  term: string
  guidance: string
  demos: string[]
}

export const STYLE_GUIDE: StyleGuideEntry[] = [
  // #82/#95：出厂预设收敛为唯一「默认」（id=default，海蓝海洋风）——风格词保留
  // 全字典（LLM 引导），demos 仅指向仍存在的预设，其余留空。
  { term: '清爽', guidance: '浅色底 + 蓝色系点缀 + 大量留白，层次靠白色浮层', demos: ['default'] },
  { term: '护眼', guidance: '低亮度低饱和：暖纸底或蓝黑底，避免高饱和大面积色，文字对比优先', demos: [] },
  { term: '深夜', guidance: '深蓝黑底 + 冷灰层次，沉稳专注，亮色模式保持浅色', demos: ['default'] },
  { term: '极简', guidance: '黑白灰去彩色，靠明度层次与留白，最多一个强调色', demos: [] },
  { term: '高对比', guidance: '纯黑纯白底 + 高饱和品牌色，文字对比度优先（无障碍）', demos: [] },
  { term: '霓虹', guidance: '暗色底 + 高饱和霓虹点缀（青绿/粉紫），气泡可带荧光感', demos: [] },
  { term: '赛博', guidance: '同霓虹：暗底 + 电光色点缀，可配合 CSS 补丁做渐变', demos: [] },
  { term: '蒸汽波', guidance: '深紫底 + 霓虹粉品牌 + 浅紫气泡，复古未来感（可配 CSS 渐变）', demos: [] },
  { term: '撞色', guidance: '米白纸张底 + 高饱和双色撞色（钴蓝×珊瑚 / 青绿×粉），杂志拼贴感', demos: [] },
  { term: '粉彩', guidance: '低饱和粉白底 + 玫粉/淡蓝点缀，甜系柔和', demos: [] },
  { term: '暖色', guidance: '米黄/暖纸底 + 棕褐文字 + 琥珀强调，护眼暖调', demos: [] },
  { term: '暗色', guidance: '整体深色底（bg-base dark 为主），亮色模式可保留浅色', demos: ['default'] },
]
