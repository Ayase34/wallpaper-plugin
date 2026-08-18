/**
 * 预设 schema v1：类型、校验、兼容契约。
 * 规则（设计文档 §6 / 盘点 §6.4）：
 * - tokens 必须 { light, dark } 双值（裸字符串抛教学错误）
 * - 版本契约：minDshVersion / targetDshVersion（P0-3 已采纳）
 * - 未知字段保留不破坏（低版本读高版本预设）
 * - css 选择器白名单（M2 高级区启用，接口预留）
 * 纯逻辑模块：Node / 浏览器 / 测试三端共用，零外部依赖（core 内部引用 widgets 目录）。
 */

import { WIDGETS, findWidget, MAX_ASSETS, MAX_ASSET_DATAURL_LENGTH } from './widgets.ts'

/** 令牌双值对：明暗两套都必须提供。 */
export interface TokenOverride {
  light: string
  dark: string
}

/** CSS 补丁规则（M2-2 高级区）：选择器白名单 + 声明块内容（禁花括号防块逃逸）。 */
export interface CssRule {
  /** 选择器：必须以 [data-*] 属性锚点开头（禁类名/逃逸）。 */
  selector: string
  /** 声明块内容（如 "color: red; background: #fff"；禁花括号/超长）。 */
  rules: string
}

/** 主题注册定义（M2-4 高级区）：id + 基色板 + 令牌覆盖（存双值，编译时按色板展平）。 */
export interface ThemeDef {
  /** 主题 id（DSH 主题注册表用；重复注册会抛错——引擎有幂等守卫）。 */
  id: string
  /** 基色板：亮/暗（决定 body[data-ds-dark-theme] 的切换方向）。 */
  colorScheme: 'light' | 'dark'
  /** 别名层令牌覆盖（双值对——编译时按 colorScheme 展平为单值）。 */
  tokens: Record<string, TokenOverride>
}

/** 素材资产（M2-6）：预设内嵌图片（base64 dataUrl；上限见 core/widgets）。
 * #94：layers 可选——分层合成规格（zip 导出/导入载体，导入时还原素材 meta）。 */
export interface PresetAsset {
  id: string
  name: string
  mime: string
  dataUrl: string
  layers?: { animAssetId: string; x: number; y: number; w: number; h: number }
}

/** 注入部件条目（M2-6）：固定目录 id + 参数（校验按部件定义）。 */
export interface PresetWidget {
  id: string
  params: Record<string, string>
}

/** 版本档位（内部三掩码；对外两档由 UI 掩码收敛）。 */
export type PresetEdition = 'simple' | 'standard' | 'developer'

/** 预设元数据。 */
export interface PresetMeta {
  schemaVersion: 1
  /** 稳定 id：小写字母数字开头，允许中划线。 */
  id: string
  name: string
  author?: { name: string; homepage?: string }
  /** 最低要求版本（向上兼容）。 */
  edition: PresetEdition
  /** 兼容契约：低于当前 DSH 版本时拒绝应用。 */
  minDshVersion?: string
  /** 创作时的 DSH 版本（用于 diff 告警）。 */
  targetDshVersion?: string
  tags?: string[]
}

/** 预设封面（#56 用户手设）：引用预设内素材 + 3:1 裁剪矩形（帧坐标，同部件裁剪参数）。
 * 无 cover / 无裁剪 → 自动生成 SVG 封面（coverSvgFor）。 */
export interface PresetCover {
  assetId: string
  cropX?: string
  cropY?: string
  cropW?: string
  cropH?: string
}

/** 预设 v1 主体：元数据 + 令牌覆盖层（css 补丁 M2-2 / 主题注册 M2-4 / 部件素材 M2-6 启用；后续版本扩展，未知字段保留）。 */
export interface Preset extends PresetMeta {
  tokens: Record<string, TokenOverride>
  /** CSS 补丁规则（M2-2 高级区编辑；校验后的一等公民字段，不再经 extra 透传）。 */
  css?: CssRule[]
  /** 主题注册（M2-4 高级区编辑；应用时注册为可选主题）。 */
  theme?: ThemeDef
  /** 素材资产（M2-6 高级区；部件引用）。 */
  assets?: PresetAsset[]
  /** 注入部件（M2-6 高级区；CSS 由引擎生成，安全）。 */
  widgets?: PresetWidget[]
  /** 用户手设封面（#56）：引用预设内素材（zip 自动内嵌），3:1 裁剪矩形。 */
  cover?: PresetCover
  /** 校验通过后保留的未知字段（低版本读高版本）。 */
  extra?: Record<string, unknown>
}

/** 校验结果：成功携带清洗后的预设；失败携带错误清单。 */
export type ValidationResult =
  | { ok: true; preset: Preset }
  | { ok: false; errors: string[] }

/** 常量与上限（防恶意/损坏预设）。 */
export const SCHEMA_VERSION = 1 as const
export const MAX_TOKENS = 500
export const MAX_ID_LENGTH = 64
export const MAX_NAME_LENGTH = 64
export const MAX_CSS_RULES_LENGTH = 4096
export const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/
/** 宽松 semver：数字点分（可带 rc/alpha 后缀）。 */
const VERSION_PATTERN = /^\d+\.\d+\.\d+(-[0-9A-Za-z.]+)?$/

/** css 补丁选择器白名单（M2 启用）：必须以 [data-*] 属性锚点开头（盘点 §4.3 锚点约定），
 * 拒绝逃逸字符；允许后续后代/类选择器（插件自注入元素的稳定类名合法）。
 * #96（审计）：`{` 同步拒绝（与 rules 的花括号检查对齐——缺 `}` 虽当前不可利用，属纵深防御）。 */
export function isAllowedCssSelector(selector: string): boolean {
  if (!/^\[data-/.test(selector)) return false
  if (selector.includes('}') || selector.includes(';') || selector.includes('{')) return false
  return selector.length <= 256
}

/** css 规则清单 → 注入文本（M2-2：编辑器/引擎共用；compile 侧另有选择器/花括号双过滤）。 */
export function cssRulesToText(rules: CssRule[]): string {
  return rules
    .filter(rule => isAllowedCssSelector(rule.selector) && !/[{}]/.test(rule.rules))
    .map(rule => `${rule.selector} { ${rule.rules} }`)
    .join('\n')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTokenOverride(value: unknown): value is TokenOverride {
  return isRecord(value)
    && typeof value.light === 'string'
    && typeof value.dark === 'string'
}

/** 令牌名合法性（-- 开头）。 */
function tokenNameValid(name: string): boolean {
  return name.startsWith('--')
}

/** 版本号校验：宽松 semver 或空。 */
function isValidVersion(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== '' && VERSION_PATTERN.test(value.trim())
}

/**
 * 校验并清洗一个预设对象。
 * - 必填缺失/类型错误/规则违反 → 错误清单（可多条）
 * - tokens 逐项校验，裸字符串给出教学错误（照 ui-theme validateOverrides 的语义）
 * - 未知字段保留进 extra（低版本读高版本不破坏）
 * @param raw - 任意输入（文件/网络/用户编辑都可能是不合格数据）。
 * @returns 校验结果。
 */
export function validatePreset(raw: unknown): ValidationResult {
  const errors: string[] = []
  if (!isRecord(raw)) return { ok: false, errors: ['预设必须是对象'] }

  const id = raw.id
  if (typeof id !== 'string' || id.trim() === '') {
    errors.push('id 必填且为非空字符串')
  } else if (!ID_PATTERN.test(id) || id.length > MAX_ID_LENGTH) {
    errors.push(`id 须匹配 ${ID_PATTERN.source} 且长度 ≤ ${MAX_ID_LENGTH}`)
  }

  const name = raw.name
  if (typeof name !== 'string' || name.trim() === '') {
    errors.push('name 必填且为非空字符串')
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.push(`name 长度 ≤ ${MAX_NAME_LENGTH}`)
  }

  if (raw.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`schemaVersion 必须为 ${SCHEMA_VERSION}`)
  }

  const edition = raw.edition
  if (edition !== 'simple' && edition !== 'standard' && edition !== 'developer') {
    errors.push('edition 必须是 simple | standard | developer')
  }

  // 版本契约：宽松格式校验（严格比较在应用期按当前 DSH 版本做）。
  if (raw.minDshVersion !== undefined && !isValidVersion(raw.minDshVersion)) {
    errors.push('minDshVersion 须为 semver 格式（如 0.1.0-rc.5）')
  }
  if (raw.targetDshVersion !== undefined && !isValidVersion(raw.targetDshVersion)) {
    errors.push('targetDshVersion 须为 semver 格式（如 0.1.0-rc.5）')
  }

  if (raw.tags !== undefined && (!Array.isArray(raw.tags) || raw.tags.some(t => typeof t !== 'string'))) {
    errors.push('tags 必须是字符串数组')
  }
  if (raw.author !== undefined) {
    // P1 修复：author 形状必须 { name: string, homepage?: string }。
    if (!isRecord(raw.author) || typeof raw.author.name !== 'string' || raw.author.name.trim() === '') {
      errors.push('author 必须是 { name: string, homepage?: string }')
    } else if (raw.author.homepage !== undefined && typeof raw.author.homepage !== 'string') {
      errors.push('author.homepage 必须是字符串')
    }
  }

  // tokens：必须对象；逐项双值校验。
  if (!isRecord(raw.tokens)) {
    errors.push('tokens 必须是对象')
  } else {
    const names = Object.keys(raw.tokens)
    if (names.length > MAX_TOKENS) {
      errors.push(`tokens 数量超过上限 ${MAX_TOKENS}`)
    }
    for (const tokenName of names) {
      if (!tokenName.startsWith('--')) {
        errors.push(`令牌名 "${tokenName}" 必须以 -- 开头`)
        continue
      }
      const value = raw.tokens[tokenName]
      if (typeof value === 'string') {
        errors.push(
          `令牌 "${tokenName}" 是裸字符串 — 必须给 { light, dark } 双值 `
          + `(明暗一致时重复同一值)；单值在切换配色时会不可读`,
        )
      } else if (!isTokenOverride(value)) {
        errors.push(`令牌 "${tokenName}" 必须是 { light, dark } 字符串对`)
      } else {
        // #96（审计）：令牌值字符护栏——值将原样交给宿主拼入共享样式表，
        // 禁止能闭合/注入 CSS 结构的字符（分号/花括号/换行/反引号）
        for (const scheme of ['light', 'dark'] as const) {
          if (/[;{}`\r\n]/.test(value[scheme])) {
            errors.push(`令牌 "${tokenName}" ${scheme} 值包含非法字符（; { } 换行 反引号）`)
          }
        }
      }
    }
  }

  // css 补丁（M2 高级区）：存在则校验白名单 + rules 防逃逸（P0 修复）。
  if (raw.css !== undefined) {
    if (!Array.isArray(raw.css)) {
      errors.push('css 必须是数组')
    } else {
      for (let i = 0; i < raw.css.length; i += 1) {
        const entry = raw.css[i]
        if (!isRecord(entry) || typeof entry.selector !== 'string') {
          errors.push(`css[${i}] 必须含 selector 字符串`)
        } else if (!isAllowedCssSelector(entry.selector)) {
          errors.push(`css[${i}] 选择器 "${entry.selector}" 不在白名单（须 data-* 属性锚点，禁止类名）`)
        }
        // rules 是自由 CSS 注入共享 <style> 的唯一内容面：禁止花括号（块逃逸 = 任意 CSS 注入）。
        if (typeof entry.rules !== 'string') {
          errors.push(`css[${i}] 必须含 rules 字符串`)
        } else if (/[{}]/.test(entry.rules)) {
          errors.push(`css[${i}] rules 禁止包含花括号（防样式块逃逸注入）`)
        } else if (entry.rules.length > MAX_CSS_RULES_LENGTH) {
          errors.push(`css[${i}] rules 长度超过上限 ${MAX_CSS_RULES_LENGTH}`)
        }
      }
    }
  }

  // theme 注册（M2-4 高级区）：存在则校验 id/色板/令牌双值。
  if (raw.theme !== undefined) {
    const theme = raw.theme as { id?: unknown; colorScheme?: unknown; tokens?: unknown }
    const themeId = typeof theme.id === 'string' ? theme.id.trim() : ''
    if (themeId === '' || themeId.length > MAX_ID_LENGTH || !ID_PATTERN.test(themeId)) {
      errors.push('theme.id 必须是合法标识符（小写字母数字开头，允许中划线）')
    }
    if (theme.colorScheme !== 'light' && theme.colorScheme !== 'dark') {
      errors.push('theme.colorScheme 必须是 light | dark')
    }
    if (!isRecord(theme.tokens)) {
      errors.push('theme.tokens 必须是令牌对象')
    } else {
      for (const [name, value] of Object.entries(theme.tokens)) {
        if (!tokenNameValid(name)) {
          errors.push(`theme 令牌名 "${name}" 必须以 -- 开头`)
        } else if (!isTokenOverride(value)) {
          errors.push(`theme 令牌 "${name}" 必须是 { light, dark } 字符串对`)
        }
      }
    }
  }

  // 素材资产（M2-6）：数量/形状/大小上限。
  const assetIds = new Set<string>()
  if (raw.assets !== undefined) {
    if (!Array.isArray(raw.assets)) {
      errors.push('assets 必须是数组')
    } else if (raw.assets.length > MAX_ASSETS) {
      errors.push(`assets 数量超过上限 ${MAX_ASSETS}`)
    } else {
      for (let i = 0; i < raw.assets.length; i += 1) {
        const asset = raw.assets[i]
        if (!isRecord(asset) || typeof asset.id !== 'string' || !ID_PATTERN.test(asset.id)) {
          errors.push(`assets[${i}] id 必须是合法标识符`)
          continue
        }
        if (assetIds.has(asset.id)) errors.push(`assets[${i}] id 重复：${asset.id}`)
        assetIds.add(asset.id)
        if (typeof asset.name !== 'string' || asset.name.length > 64) {
          errors.push(`assets[${i}] name 必须是 ≤64 字符串`)
        }
        if (typeof asset.mime !== 'string' || !asset.mime.startsWith('image/')) {
          errors.push(`assets[${i}] mime 必须是 image/*`)
        }
        // M2-8：dataUrl 可选（新版为壁纸库文件引用）；旧版内嵌保留兼容与上限。
        // review P1-1（全量评审）：dataUrl 经 assetCssUrl 拼入 url("...") 进共享 <style>——
        // 引号/分号/花括号可闭合 url() 注入任意 CSS，绕过「CSS 由引擎生成」安全边界。
        // 收紧为严格 data:image/<type>;base64,<base64 字符集>（base64 不含引号/分号/花括号）。
        if (asset.dataUrl !== undefined) {
          if (typeof asset.dataUrl !== 'string') {
            errors.push(`assets[${i}] dataUrl 必须是字符串`)
          } else if (!/^data:image\/(png|jpe?g|webp|gif|bmp|avif);base64,[A-Za-z0-9+/=\s]+$/.test(asset.dataUrl)) {
            errors.push(`assets[${i}] dataUrl 必须是 data:image/<png|jpeg|webp|gif|bmp|avif>;base64,<数据>`)
          } else if (asset.dataUrl.length > MAX_ASSET_DATAURL_LENGTH) {
            errors.push(`assets[${i}] 内嵌体积超过上限（dataUrl ≤ ${MAX_ASSET_DATAURL_LENGTH} 字符）`)
          }
        }
        // #94：分层合成规格随引用走（zip 导出/导入的载体——导入时据此还原素材 meta）。
        if (asset.layers !== undefined) {
          const L = asset.layers
          if (!isRecord(L) || typeof L.animAssetId !== 'string' || !ID_PATTERN.test(L.animAssetId)
            || typeof L.x !== 'number' || typeof L.y !== 'number'
            || typeof L.w !== 'number' || typeof L.h !== 'number'
            || !Number.isFinite(L.x) || !Number.isFinite(L.y) || !Number.isFinite(L.w) || !Number.isFinite(L.h)
            || L.w <= 0 || L.h <= 0) {
            errors.push(`assets[${i}] layers 必须是 {animAssetId,x,y,w,h}（数字矩形）`)
          }
        }
      }
    }
  }

  // 注入部件（M2-6）：固定目录 id + 参数类型/范围/素材引用。
  if (raw.widgets !== undefined) {
    if (!Array.isArray(raw.widgets)) {
      errors.push('widgets 必须是数组')
    } else {
      for (let i = 0; i < raw.widgets.length; i += 1) {
        const widget = raw.widgets[i]
        if (!isRecord(widget) || typeof widget.id !== 'string') {
          errors.push(`widgets[${i}] 必须含 id 字符串`)
          continue
        }
        const def = findWidget(widget.id)
        if (def === undefined) {
          errors.push(`widgets[${i}] id "${widget.id}" 不在部件目录（${WIDGETS.map(w => w.id).join('/')}）`)
          continue
        }
        if (!isRecord(widget.params)) {
          errors.push(`widgets[${i}] params 必须是对象`)
          continue
        }
        for (const param of def.params) {
          const value = widget.params[param.key]
          // #49 兼容：参数缺失视为默认值（旧数据无 opacity 参数 → 默认 1；assetId 缺省 = 未选素材）。
          // 只在参数存在时校验类型/范围——教学错误只提示"写错"不提示"没写"。
          if (value === undefined) {
            if (param.default !== undefined) continue
            errors.push(`widgets[${i}] 参数 ${param.key} 必须是字符串`)
            continue
          }
          if (typeof value !== 'string') {
            errors.push(`widgets[${i}] 参数 ${param.key} 必须是字符串`)
            continue
          }
          if (param.type === 'asset') {
            if (value !== '' && !assetIds.has(value)) {
              errors.push(`widgets[${i}] 参数 ${param.key} 引用了不存在的素材 ${value}`)
            }
          } else if (param.type === 'number' || param.type === 'range') {
            // #96（审计）：空串拒绝（Number('')=0 会把 opacity:'' 当 0 处理 → 100% wash 遮罩）
            if (value.trim() === '') {
              errors.push(`widgets[${i}] 参数 ${param.key} 不能为空串`)
            } else {
              const num = Number(value)
              if (!Number.isFinite(num)) {
                errors.push(`widgets[${i}] 参数 ${param.key} 必须是数字`)
              } else if (param.min !== undefined && num < param.min) {
                errors.push(`widgets[${i}] 参数 ${param.key} 不能小于 ${param.min}`)
              } else if (param.max !== undefined && num > param.max) {
                errors.push(`widgets[${i}] 参数 ${param.key} 不能大于 ${param.max}`)
              }
            }
          } else if (param.type === 'select' && param.options !== undefined && !param.options.some(o => o.value === value)) {
            errors.push(`widgets[${i}] 参数 ${param.key} 不在选项内`)
          }
        }
        // #96（审计）：裁剪参数（cropX/Y/W/H 及 *Dark）未声明于部件参数目录，但会被
        // widgetCss 插值进 CSS 注释标记——必须十进制数字串白名单（防任意 CSS 注入）
        for (const key of ['cropX', 'cropY', 'cropW', 'cropH', 'cropXDark', 'cropYDark', 'cropWDark', 'cropHDark'] as const) {
          const value = widget.params[key]
          if (value === undefined) continue
          if (typeof value !== 'string' || !/^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(value.trim())) {
            errors.push(`widgets[${i}] 参数 ${key} 必须是十进制数字字符串`)
          }
        }
      }
    }
  }

  // 封面（#56）：引用预设内素材（zip 内嵌自包含）；裁剪矩形随部件裁剪参数同款宽松校验。
  if (raw.cover !== undefined) {
    const cover = raw.cover as { assetId?: unknown; cropX?: unknown; cropY?: unknown; cropW?: unknown; cropH?: unknown }
    if (!isRecord(raw.cover) || typeof cover.assetId !== 'string' || cover.assetId === '') {
      errors.push('cover 必须是 { assetId } 对象（引用预设内素材）')
    } else if (!assetIds.has(cover.assetId)) {
      errors.push(`cover.assetId 引用了不存在的素材 ${cover.assetId}`)
    } else {
      for (const key of ['cropX', 'cropY', 'cropW', 'cropH'] as const) {
        const value = cover[key]
        if (value === undefined) continue
        // #96（审计）：十进制数字串白名单（Number('')=0、0x10、1e5、空白均拒绝）
        if (typeof value !== 'string' || !/^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(value.trim())) {
          errors.push(`cover.${key} 必须是十进制数字字符串`)
        } else if ((key === 'cropW' || key === 'cropH') && Number(value) <= 0) {
          errors.push(`cover.${key} 必须 > 0`)
        }
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors }

  // 清洗输出：保留未知字段（低版本读高版本不破坏）。
  const preset: Preset = {
    schemaVersion: SCHEMA_VERSION,
    id: (id as string).trim(),
    name: (name as string).trim(),
    edition: edition as PresetEdition,
    tokens: Object.fromEntries(
      Object.entries(raw.tokens as Record<string, unknown>)
        .map(([k, v]) => [k, { light: (v as TokenOverride).light, dark: (v as TokenOverride).dark }]),
    ),
  }
  if (typeof raw.minDshVersion === 'string') preset.minDshVersion = raw.minDshVersion.trim()
  if (typeof raw.targetDshVersion === 'string') preset.targetDshVersion = raw.targetDshVersion.trim()
  if (Array.isArray(raw.tags)) preset.tags = [...raw.tags]
  if (isRecord(raw.author)) preset.author = { ...raw.author } as PresetMeta['author']
  if (Array.isArray(raw.css)) {
    // M2-2：css 升级一等公民（此前经 extra 透传）——清洗为 { selector, rules } 副本。
    preset.css = raw.css.map(entry => ({
      selector: String((entry as { selector?: unknown }).selector ?? ''),
      rules: String((entry as { rules?: unknown }).rules ?? ''),
    }))
  }
  // M2-4：theme 一等公民（校验已在早退前完成——走到此处必合法）。
  if (raw.theme !== undefined) {
    const theme = raw.theme as { id: string; colorScheme: 'light' | 'dark'; tokens: Record<string, TokenOverride> }
    preset.theme = {
      id: theme.id.trim(),
      colorScheme: theme.colorScheme,
      tokens: Object.fromEntries(
        Object.entries(theme.tokens).map(([k, v]) => [k, { light: v.light, dark: v.dark }]),
      ),
    }
  }
  // M2-6/8：assets/widgets 一等公民（校验已在早退前完成；assets 为引用——dataUrl/layers 可选）。
  if (Array.isArray(raw.assets)) {
    preset.assets = raw.assets.map(asset => {
      const entry: { id: string; name: string; mime: string; dataUrl?: string; layers?: unknown } = {
        id: (asset as { id: string }).id,
        name: (asset as { name: string }).name,
        mime: (asset as { mime: string }).mime,
      }
      const dataUrl = (asset as { dataUrl?: unknown }).dataUrl
      if (typeof dataUrl === 'string') entry.dataUrl = dataUrl
      // #94：分层规格透传（zip 导入还原素材 meta 用）
      const layers = (asset as { layers?: unknown }).layers
      if (layers !== undefined) entry.layers = layers
      return entry
    })
  }
  if (Array.isArray(raw.widgets)) {
    preset.widgets = raw.widgets.map(widget => ({
      id: (widget as { id: string }).id,
      params: { ...(widget as { params: Record<string, string> }).params },
    }))
  }
  // #56：cover 一等公民（校验已在早退前完成——走到此处必合法）。
  if (raw.cover !== undefined) {
    const cover = raw.cover as { assetId: string; cropX?: string; cropY?: string; cropW?: string; cropH?: string }
    const cleaned: Preset['cover'] = { assetId: cover.assetId.trim() }
    for (const key of ['cropX', 'cropY', 'cropW', 'cropH'] as const) {
      if (typeof cover[key] === 'string') cleaned[key] = cover[key]
    }
    preset.cover = cleaned
  }

  const extra: Record<string, unknown> = {}
  // #68 P2 修复：已有 extra 字段先展开合并——否则二次校验（读盘/AI update 每次 validate）
  // 把 raw.extra 当作未知字段再次收集进 extra，逐次嵌套加深（extra.extra.extra…）。
  if (isRecord(raw.extra)) {
    for (const [k, v] of Object.entries(raw.extra)) {
      if (Object.hasOwn(preset, k)) continue
      Object.defineProperty(extra, k, { value: v, enumerable: true, writable: true, configurable: true })
    }
  }
  for (const [k, v] of Object.entries(raw)) {
    // 评审 P2 修复：Object.hasOwn（原 `k in preset` 会把 constructor/toString/__proto__ 等原型键静默丢弃）；
    // defineProperty 防 __proto__ 键触发原型 setter。
    if (Object.hasOwn(preset, k) || k === 'schemaVersion' || k === 'extra') continue
    Object.defineProperty(extra, k, { value: v, enumerable: true, writable: true, configurable: true })
  }
  if (Object.keys(extra).length > 0) preset.extra = extra

  return { ok: true, preset }
}

/**
 * #104：保存/更新前归一化——cover 引用不在 assets 声明里（悬空，如 UI 草稿删除素材后
 * 草稿未联动清封面）→ 移除 cover（回退自动生成，与 #56「删除素材顺带清封面」同语义）。
 * 返回 { preset, dropped }。schema 校验仍拒绝悬空 cover（zip 导入等外部载荷 fail-loud），
 * 写入口（savePreset/updatePresetFile）先归一化保证 UI/AI 流程不因悬空封面卡死。
 */
export function normalizeDanglingCover(preset: Preset): { preset: Preset; dropped: boolean } {
  const cover = preset.cover
  if (cover === undefined) return { preset, dropped: false }
  const assets = preset.assets ?? []
  if (assets.some(asset => asset.id === cover.assetId)) return { preset, dropped: false }
  const { cover: _dropped, ...rest } = preset
  return { preset: rest as Preset, dropped: true }
}

/**
 * 版本契约检查：minDshVersion > 当前 DSH 版本 → 拒绝应用。
 * @param preset - 已校验预设。
 * @param currentDshVersion - 当前 DSH 版本（如 '0.1.0-rc.5'）。
 * @returns 错误信息；null 表示通过。
 */
export function checkDshCompatibility(preset: Preset, currentDshVersion: string): string | null {
  if (preset.minDshVersion === undefined) return null
  const required = parseVersion(preset.minDshVersion)
  const current = parseVersion(currentDshVersion)
  if (required === null || current === null) return null
  if (compareVersion(current, required) < 0) {
    return `此预设要求 DSH ≥ ${preset.minDshVersion}，当前为 ${currentDshVersion}`
  }
  return null
}

function parseVersion(v: string): Array<number | string> | null {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.]+))?/.exec(v)
  if (m === null) return null
  const prerelease = m[4] === undefined ? [] : m[4].split('.').map(part => {
    const numeric = Number(part)
    return Number.isNaN(numeric) ? part : numeric
  })
  return [Number(m[1]), Number(m[2]), Number(m[3]), ...prerelease]
}

/** semver 比较（评审 P2-4 修复：含预发布序——无预发布 > 有预发布；同段按点分逐项比较）。 */
function compareVersion(a: Array<number | string>, b: Array<number | string>): number {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const av = a[i]
    const bv = b[i]
    // 预发布段在末尾：一方先耗尽 = 该方无预发布 = 版本更大。
    if (av === undefined) return 1
    if (bv === undefined) return -1
    if (typeof av === 'number' && typeof bv === 'number') {
      if (av !== bv) return av - bv
    } else {
      const as = String(av)
      const bs = String(bv)
      if (as !== bs) return as < bs ? -1 : 1
    }
  }
  return 0
}
