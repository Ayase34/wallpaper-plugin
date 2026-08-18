/**
 * 能力掩码（M1 立项：评审 §5 决策已定死）。
 * 原则（评审确认）：
 * - 掩码只做 UI 收敛与导出范围，不做引擎能力裁剪（引擎挂载能力只由 adapter 是否存在天然降级）
 * - preset.edition（数据契约：创作所需最低档位）与 Capabilities（运行时档位：UI 显隐）分开命名
 * - 对外两档（简洁=simple / 标准=standard+developer），内部三掩码保留（代码可维护性 + 发行物拆分）
 * 纯数据模块：core 层，双 half 可复用、可单测、可构建期拆分。
 */

/** 运行时档位（UI 显隐由它驱动）。 */
export type Capabilities = 'simple' | 'standard' | 'developer'

/** 能力项清单（掩码的白名单键，由全量能力"删减"导出）。 */
export type CapabilityKey =
  | 'preset-wall'          // 预设墙（简洁版唯一主面）
  | 'quick-row'            // 设置快捷切换行
  | 'knobs'                // 风格旋钮（令牌束快速区）
  | 'common-tokens'        // 常用令牌组
  | 'full-token-editor'    // 全量分组令牌编辑器
  | 'draft-undo'           // 草稿 + undo/redo + 保存确认备份
  | 'preset-manage'        // 预设管理（新建/复制/重命名/删除/另存为/从当前外观新建）
  | 'import-export'        // JSON/YAML 导入导出
  | 'assets'               // 素材/壁纸导入 + 注入部件（M2 高级区）
  | 'css-patches'          // CSS 补丁编辑（M2 高级区）
  | 'theme-register'       // 主题注册（M2 高级区）
  | 'zip-pack'             // zip 三件套打包（M2 高级区）
  | 'catalog-inspect'      // 令牌目录 diff 告警（所有版本都有轻量横幅）
  | 'ai-tools'             // AI 协同工具（对话式，不分档位）

/** 掩码：档位 → 能力白名单（由全量能力删减导出）。 */
export type CapabilityMask = Readonly<Record<CapabilityKey, boolean>>

/** 全量能力（删减的母集）。 */
const ALL: CapabilityMask = Object.freeze({
  'preset-wall': true,
  'quick-row': true,
  knobs: true,
  'common-tokens': true,
  'full-token-editor': true,
  'draft-undo': true,
  'preset-manage': true,
  'import-export': true,
  assets: true,
  'css-patches': true,
  'theme-register': true,
  'zip-pack': true,
  'catalog-inspect': true,
  'ai-tools': true,
})

/** simple：预设墙 + 快捷行 + 消费带高级能力的预设（消费 ≠ 编辑）。 */
const SIMPLE: CapabilityMask = Object.freeze({
  ...ALL,
  knobs: false,
  'common-tokens': false,
  'full-token-editor': false,
  'draft-undo': false,
  'preset-manage': false,
  'import-export': false,
  assets: false,
  'css-patches': false,
  'theme-register': false,
  'zip-pack': false,
})

/** standard：全部基础编辑能力（对外"标准版"）。 */
const STANDARD: CapabilityMask = Object.freeze({
  ...ALL,
  // 高级区（developer 掩码门控）对外并入标准版，UI 渐进披露。
  assets: true,
  'css-patches': true,
  'theme-register': true,
  'zip-pack': true,
})

/** developer：高级区门控（内部掩码；对外与 standard 合并展示）。 */
const DEVELOPER: CapabilityMask = ALL

/** 三档掩码表。 */
export const CAPABILITY_MASKS: Readonly<Record<Capabilities, CapabilityMask>> = Object.freeze({
  simple: SIMPLE,
  standard: STANDARD,
  developer: DEVELOPER,
})

/** 对外档位（两档：简洁 / 标准——标准 = standard+developer 合并）。
 * #96（审计）：EXTERNAL_TIERS 常量无消费者已删，ExternalTier 类型保留（externalTierOf 用）。 */
export type ExternalTier = 'simple' | 'standard'

/** 内部档位 → 对外档位。 */
export function externalTierOf(capabilities: Capabilities): ExternalTier {
  return capabilities === 'simple' ? 'simple' : 'standard'
}

/** 当前档位（M1 起由插件配置/设置决定；M0 默认 standard 全量）。 */
export const DEFAULT_CAPABILITIES: Capabilities = 'standard'

/** 取掩码：档位 → 能力白名单。 */
export function maskOf(capabilities: Capabilities): CapabilityMask {
  return CAPABILITY_MASKS[capabilities]
}
