/**
 * 注入部件目录（M2-6/修复轮 #33）：固定清单，CSS 由引擎生成（非用户自由文本——安全边界）。
 * - 素材资产：壁纸库文件引用（新版）或旧版内嵌 base64（兼容），部件按 assetId 引用
 * - 渲染策略（#33 实测缺陷修复）：**图像类部件一律用真实元素自身背景**（background-image
 *   画在元素底色之上、内容之下）——伪元素/负 z-index 有堆叠陷阱：body::before z-index:-1
 *   画在 body 背景之下直接隐形；::before 覆盖层被不透明内容盖住
 * - widgetCss 纯函数：部件 + 参数 + 素材 → 安全 CSS 文本
 * - 生成文本并入 compiled.css 注入（短路径 cssText 比较天然覆盖部件/素材变更）
 * 本模块零依赖（不 import schema——避免循环）。
 */

/** 素材资产引用（预设内引用；dataUrl 仅兼容旧版内嵌预设——新版素材为文件库引用）。
 * #94：layers 可选——分层合成规格（zip 导出/导入载体）。 */
export interface WidgetAssetRef {
  id: string
  name: string
  mime: string
  /** 旧版内嵌 base64（可选；新版素材为壁纸库文件引用，经 /ui-presets/assets/:id 提供）。 */
  dataUrl?: string
  /** 分层合成规格（静态底 + 原生动图引用与帧坐标矩形）。 */
  layers?: { animAssetId: string; x: number; y: number; w: number; h: number }
}

/** 素材上限：库中最多 100 个文件（#89：30 个对图层合成过紧——每次合成都会新增一张成品，
 * 用户 20+ 素材库合成几次即触顶；本地壁纸库 100 × 20MB 上限可接受），单个文件 ≤ 20MB；
 * 旧版内嵌 dataUrl ≤ 28M 字符（≈20MB，base64 膨胀 4/3）。 */
export const MAX_ASSETS = 100
export const MAX_ASSET_FILE_SIZE = 20 * 1024 * 1024
export const MAX_ASSET_DATAURL_LENGTH = 28_000_000

/** 图片链接上限（字符）——超长链接多为带签名的 CDN，截断反而更糟，直接拒绝并提示用素材库。 */
export const MAX_IMAGE_URL_LENGTH = 2048

/**
 * 内置渐变档位（2026-10，壁纸 2.0）：**档位是 id、字面量在代码里**——用户只能选，不能填 CSS，
 * 注入面为零（与「图片链接」同属「无素材也能出一张氛围底」的能力）。
 */
export const GRADIENT_PRESETS: Array<{ id: string; name: string; css: string }> = [
  { id: 'aurora', name: '极光', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'ocean', name: '深海', css: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { id: 'dusk', name: '暮色', css: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { id: 'sunset', name: '落日', css: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)' },
  { id: 'forest', name: '森林', css: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { id: 'rose', name: '玫瑰', css: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { id: 'ember', name: '余烬', css: 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)' },
  { id: 'paper', name: '纸白', css: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' },
]

/** 渐变 id → CSS 字面量（未知 id 返回空串＝不产出样式）。 */
export function gradientCss(id: string): string {
  const preset = GRADIENT_PRESETS.find(item => item.id === id)
  return preset !== undefined ? preset.css : ''
}

/** 渐变下拉选项（含「不使用」空档；空值 = 不产出）。 */
export function gradientOptions(): Array<{ label: string; value: string }> {
  return [{ label: '（不使用）', value: '' }, ...GRADIENT_PRESETS.map(item => ({ label: item.name, value: item.id }))]
}

/**
 * 图片链接白名单：仅 http/https，且不得含空白 / 引号 / 圆括号 / 尖括号 / 反斜杠。
 * 理由：该值最终插进 `url("…")` 与 CSS 注释标记——上述字符能闭合 url() 或注释。
 * data: URL 不走这里（走素材库的严格 base64 校验）。
 */
export function isSafeImageUrl(value: string): boolean {
  if (value === '' || value.length > MAX_IMAGE_URL_LENGTH) return false
  if (!/^https?:\/\//i.test(value)) return false
  return /^[\x21-\x7e]+$/.test(value) && !/["'()<>\\`\s]/.test(value)
}

/** 图片链接 → CSS url()（非法或空 → 空串，调用方据此不产出样式）。 */
export function imageUrlCss(value: string | undefined): string {
  if (value === undefined || !isSafeImageUrl(value)) return ''
  return `url("${value}")`
}

/** 素材的 CSS url：内嵌 dataUrl 优先，否则走壁纸库文件路由（同源）。
 * review P1-1（全量评审）纵深防御：dataUrl 非严格 base64 形态（含引号/分号等）→ 拒绝产出
 * （schema 已收紧校验；此处兜底防绕过——CSS 注入面）。 */
export function assetCssUrl(asset: WidgetAssetRef | undefined): string {
  if (asset === undefined) return ''
  if (asset.dataUrl !== undefined && asset.dataUrl !== '') {
    if (!/^data:image\/(png|jpe?g|webp|gif|bmp|avif);base64,[A-Za-z0-9+/=\s]+$/.test(asset.dataUrl)) return ''
    return `url("${asset.dataUrl}")`
  }
  return `url("/ui-presets/assets/${asset.id}")`
}

/** 部件参数定义（UI 渲染 + 校验共用）。 */
export interface WidgetParamDef {
  key: string
  label: string
  type: 'asset' | 'number' | 'select' | 'range' | 'url'
  default?: string
  min?: number
  max?: number
  step?: number
  options?: Array<{ label: string; value: string }>
  /** 按另一个参数的值决定是否显示（如「素材」只在 source=asset 时显示）。 */
  visibleWhen?: { key: string; equals: string }
}

export interface WidgetDef {
  id: string
  name: string
  description: string
  params: WidgetParamDef[]
}

/** 图像类部件共用参数（壁纸 2.0）：来源三选一 + 对应字段 + 不透明度。
 * `assetId` 保留原键名与语义（旧预设无 source → 走默认 asset，行为不变）。 */
function imageParams(): WidgetParamDef[] {
  return [
    {
      key: 'source', label: '图片', type: 'select', default: 'asset',
      options: [
        { label: '本地素材', value: 'asset' },
        { label: '图片链接', value: 'url' },
        { label: '内置渐变', value: 'gradient' },
      ],
    },
    { key: 'assetId', label: '素材', type: 'asset', default: '', visibleWhen: { key: 'source', equals: 'asset' } },
    { key: 'imageUrl', label: '链接', type: 'url', default: '', visibleWhen: { key: 'source', equals: 'url' } },
    { key: 'gradient', label: '渐变', type: 'select', default: '', options: gradientOptions(), visibleWhen: { key: 'source', equals: 'gradient' } },
    { key: 'opacity', label: '不透明度', type: 'range', default: '1', min: 0, max: 1, step: 0.01 },
  ]
}

/** 固定部件目录（用户拍板 #49：全局背景图/顶部强调色条/品牌标已移除——仅保留 3 个背景类部件；
 * 图像类部件带「不透明度」滑杆，CSS 由引擎生成（安全边界）。 */
export const WIDGETS: WidgetDef[] = [
  {
    id: 'chat-background',
    name: '聊天背景图',
    description: '会话区背景壁纸',
    params: imageParams(),
  },
  {
    id: 'settings-background',
    name: '设置卡背景图',
    description: '设置窗口背景壁纸',
    params: imageParams(),
  },
  {
    id: 'sidebar-poster',
    name: '侧栏海报',
    description: '左侧导航栏海报背景',
    params: imageParams(),
  },
]

export function findWidget(id: string): WidgetDef | undefined {
  return WIDGETS.find(widget => widget.id === id)
}

/** 部件 → 目标元素选择器（静态 widgetCss 与 controller 动态裁剪渲染共用——见 core/crop.ts）。 */
import { WIDGET_TARGET_SELECTOR } from './crop.ts'
export { WIDGET_TARGET_SELECTOR }

/** 部件 → wash 底色 token（不透明度淡出方向；controller 动态裁剪渲染共用）。
 * 聊天/设置卡向 bg-base 淡出；侧栏向 sidebar-fill 淡出（未定义回退 bg-base）。 */
export const WIDGET_WASH_TOKEN: Record<string, string> = {
  'chat-background': 'var(--dsw-alias-bg-base, #fff)',
  'settings-background': 'var(--dsw-alias-bg-base, #fff)',
  'sidebar-poster': 'var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-base, #fff))',
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** 部件 + 参数 + 素材 → 安全 CSS 文本（空串 = 该部件不产出样式——缺素材/未知 id）。 */
export function widgetCss(
  widgetId: string,
  params: Record<string, string> | undefined,
  assets: WidgetAssetRef[],
): string {
  const p = params ?? {}
  const assetUrl = (key: string): string => {
    const id = p[key]
    if (typeof id !== 'string' || id === '') return ''
    const asset = assets.find(item => item.id === id)
    return asset !== undefined ? assetCssUrl(asset) : ''
  }
  const num = (key: string, fallback: number, min: number, max: number): number => {
    // #96（审计）：空串回退默认（Number('')=0 会把 opacity:'' 变成 100% wash 遮罩）
    const rawStr = p[key]
    if (typeof rawStr !== 'string' || rawStr.trim() === '') return fallback
    const raw = Number(rawStr)
    return Number.isFinite(raw) ? clamp(raw, min, max) : fallback
  }
  /** #96（审计）：裁剪参数插值白名单——cropX/Y/W/H 未声明于 WidgetParamDef，
   * 任意字符串（含注释结束符、换行、花括号）能经 validatePreset 直插进 CSS 标记 → 任意 CSS 注入。
   * 这里强制十进制数字串（与 parseCropMarkers 解析格式对齐），非数字串一律视为无裁剪。 */
  const cropNumStr = (key: string): string => {
    const v = p[key]
    if (typeof v !== 'string') return ''
    const t = v.trim()
    return /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(t) ? t : ''
  }
  /** 图像类部件：真实元素自身背景（background-image 在元素底色之上、内容之下——无堆叠陷阱）。
   * 不透明度（#49）：以目标底色为 wash 覆盖层叠在图上（color-mix 把图向底色"淡出"）——
   * 不用 opacity 属性（会把元素内容一起变透明）。opacity=1 → 无 wash（与旧版输出一致）。 */
  const elementBg = (selector: string, url: string, opacity: number, washToken: string): string => {
    if (url === '') return ''
    const wash = Math.round((1 - clamp(opacity, 0, 1)) * 100)
    if (wash <= 0) {
      return `${selector} { background-image: ${url}; background-size: cover; `
        + `background-position: center; background-repeat: no-repeat; }`
    }
    const fade = `linear-gradient(color-mix(in srgb, ${washToken} ${wash}%, transparent), `
      + `color-mix(in srgb, ${washToken} ${wash}%, transparent))`
    return `${selector} { background-image: ${fade}, ${url}; background-size: cover, cover; `
      + `background-position: center, center; background-repeat: no-repeat, no-repeat; }`
  }
  switch (widgetId) {
    case 'chat-background':
    case 'settings-background':
    case 'sidebar-poster': {
      const selector = WIDGET_TARGET_SELECTOR[widgetId]
      const washToken = WIDGET_WASH_TOKEN[widgetId]
      // 壁纸 2.0：来源三选一——本地素材 / 图片链接 / 内置渐变（旧预设无 source → 素材，行为不变）
      const source = p.source === 'url' || p.source === 'gradient' ? p.source : 'asset'
      const imageFor = (urlKey: string, gradientKey: string, assetKey: string): string => {
        if (source === 'url') return imageUrlCss(p[urlKey])
        if (source === 'gradient') return gradientCss(p[gradientKey] ?? '')
        return assetUrl(assetKey)
      }
      const url = imageFor('imageUrl', 'gradient', 'assetId')
      const urlDark = imageFor('imageUrlDark', 'gradientDark', 'assetIdDark')
      // 裁剪只对本地素材生效：链接/渐变没有「原始像素坐标」语义，且链接里的 ':' 会破坏裁剪标记解析
      const canCrop = source === 'asset'
      // #52b（用户反馈 #53）：已裁剪 → 静态 CSS 不产出（渲染由浏览器 controller 按元素
      // 实际尺寸动态计算）——只产出裁剪标记（嵌入 cssText：驱动 patchDraft 差分 →
      // controller 解析并设置目标元素内联样式）；标记值变化即触发重同步。
      // #55 按明暗分别配置：浅色用默认参数（assetId/opacity/cropX…），深色用 *Dark 参数。
      const cropX = cropNumStr('cropX')
      const cropY = cropNumStr('cropY')
      const cropW = cropNumStr('cropW')
      const cropH = cropNumStr('cropH')
      const cropXD = cropNumStr('cropXDark')
      const cropYD = cropNumStr('cropYDark')
      const cropWD = cropNumStr('cropWDark')
      const cropHD = cropNumStr('cropHDark')
      const hasCrop = canCrop && cropX !== '' && cropW !== ''
      const hasCropDark = canCrop && cropXD !== '' && cropWD !== ''
      const parts: string[] = []
      // 浅色/默认
      if (hasCrop) {
        if (url !== '') parts.push(`/* up-crop:${widgetId}:${num('opacity', 1, 0, 1)}:${cropX}:${cropY}:${cropW}:${cropH}:${url} */`)
      } else {
        parts.push(elementBg(selector, url, num('opacity', 1, 0, 1), washToken))
      }
      // 深色（#55）：静态路径用 [data-ds-dark-theme] 前缀规则（wash token 是 var，自动随明暗解析）；
      // 裁剪路径产 up-crop-dark 标记（controller 按当前明暗选一组内联样式）。
      if (urlDark !== '') {
        if (hasCropDark) {
          parts.push(`/* up-crop-dark:${widgetId}:${num('opacityDark', 1, 0, 1)}:${cropXD}:${cropYD}:${cropWD}:${cropHD}:${urlDark} */`)
        } else {
          parts.push(elementBg(`body[data-ds-dark-theme] ${selector}`, urlDark, num('opacityDark', 1, 0, 1), washToken))
        }
      }
      return parts.join('\n')
    }
    default:
      // #49 已移除部件（app-background/accent-bar/logo-badge）→ 一律不产出（旧数据静默无效）。
      return ''
  }
}

/** 一批部件 → 合并 CSS 文本（空串合并跳过）。 */
export function widgetsToCss(
  widgets: Array<{ id: string; params: Record<string, string> }> | undefined,
  assets: WidgetAssetRef[],
): string {
  if (widgets === undefined || widgets.length === 0) return ''
  return widgets
    .map(widget => widgetCss(widget.id, widget.params, assets))
    .filter(text => text !== '')
    .join('\n')
}
