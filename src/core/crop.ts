/**
 * 图片裁剪（#52/#53）：选素材给部件时按固定比例裁剪。
 * - 比例（用户拍板）：聊天背景图 16:9（横向，原 2:1 修正）/ 设置卡背景图 1:1 / 侧栏海报 1:5（竖向）
 * - 用户放大/缩小（相对"适配框内"的倍率）并拖动定位；图片未覆盖区域 = 透明（露出元素底色）
 * - #53：裁剪结果**不落库**——部件存绘制矩形参数（cropX/cropY/cropW/cropH 帧坐标），
 *   引用原图；浏览器 controller 按目标元素实际尺寸动态计算背景尺寸/位置（cropElementStyle）
 * - 纯逻辑模块：Node / 浏览器 / 测试三端共用，零外部依赖
 */

/** 裁剪固定比例（宽:高）。 */
export interface CropRatio {
  w: number
  h: number
}

/** 部件 → 裁剪固定比例（#52 用户拍板；仅三个背景类部件参与裁剪）。
 * 聊天背景图 16:9（用户后改：原 2:1 → 16:9）/ 设置卡背景图 1:1 / 侧栏海报 1:5（竖向窄长条）。 */
export const WIDGET_CROP_RATIOS: Record<string, CropRatio> = {
  'chat-background': { w: 16, h: 9 },
  'settings-background': { w: 1, h: 1 },
  'sidebar-poster': { w: 1, h: 5 },
}

export function cropRatioLabel(ratio: CropRatio): string {
  return `${ratio.w}:${ratio.h}`
}

/** 裁剪输出像素尺寸：长边 ≤ maxLong（默认 1920），按比例缩放取整。
 * #96（审计）：非法比例/上限兜底（ratio 零尺寸 → maxLong/0 = Infinity → NaN 帧）。 */
export function cropFrameSize(ratio: CropRatio, maxLong = 1920): { w: number; h: number } {
  const rw = ratio.w > 0 ? ratio.w : 1
  const rh = ratio.h > 0 ? ratio.h : 1
  const limit = maxLong > 0 ? maxLong : 1920
  const scale = limit / Math.max(rw, rh)
  return { w: Math.max(1, Math.round(rw * scale)), h: Math.max(1, Math.round(rh * scale)) }
}

/** 缩放滑杆边界（相对"适配框内"倍率）。 */
export const CROP_ZOOM_MIN = 0.5
export const CROP_ZOOM_MAX = 8

/**
 * 图片在裁剪框内的绘制矩形（缩放 + 平移；未覆盖区域 = 透明）。
 * @param imgW/imgH 原始图片像素
 * @param frameW/frameH 裁剪框像素（cropFrameSize 输出）
 * @param zoom 用户倍率（1 = 恰好适配框内；<1 图片小于框 → 四周透明，>1 放大裁切）
 * @param panX/panY 平移（框内像素，正方向右下）
 */
export function cropDrawRect(
  imgW: number,
  imgH: number,
  frameW: number,
  frameH: number,
  zoom: number,
  panX: number,
  panY: number,
): { x: number; y: number; w: number; h: number } {
  // #96（审计）：零尺寸图片/画布兜底（fit 除零 → NaN/Infinity 坐标）
  if (imgW <= 0 || imgH <= 0 || frameW <= 0 || frameH <= 0) return { x: 0, y: 0, w: 0, h: 0 }
  const fit = Math.min(frameW / imgW, frameH / imgH)
  const scale = fit * Math.max(0, zoom)
  const w = imgW * scale
  const h = imgH * scale
  return { x: (frameW - w) / 2 + panX, y: (frameH - h) / 2 + panY, w, h }
}

/** 平移软边界：图片中心最多偏离框中心半个框宽/高（防止图片完全拖出视野）。 */
export function clampPan(panX: number, panY: number, frameW: number, frameH: number): { x: number; y: number } {
  return {
    x: Math.min(frameW / 2, Math.max(-frameW / 2, panX)),
    y: Math.min(frameH / 2, Math.max(-frameH / 2, panY)),
  }
}

/**
 * 裁剪平移钳制（#57 用户反馈：放大后无法继续拖动——硬边界）——按图片**当前显示尺寸**
 * （帧坐标，缩放后）动态限制平移范围：
 * - 图片 ≥ 框：允许拖到图片边缘（平移范围 ±(img-frame)/2）——放大后可把任意局部拖进视野；
 *   旧实现固定 ±frame/2 在图片 > 2×框时提前卡死（到不了图片边缘）；
 * - 图片 < 框：与旧软边界一致（图片中心最多偏离框中心半个框——透明底留边）。
 */
export function clampPanForCrop(
  panX: number,
  panY: number,
  frameW: number,
  frameH: number,
  imgW: number,
  imgH: number,
): { x: number; y: number } {
  const axis = (pan: number, frame: number, img: number): number => {
    const limit = img >= frame ? (img - frame) / 2 : frame / 2
    return Math.min(limit, Math.max(-limit, pan))
  }
  return { x: axis(panX, frameW, imgW), y: axis(panY, frameH, imgH) }
}

// ---- #52b 参数化裁剪渲染（裁剪结果不落库——部件存参数引用原图，浏览器按元素实际尺寸渲染） ----

/** 裁剪部件 → 目标元素选择器（widgetCss 静态规则与 controller 动态渲染共用；
 * 裁剪对话框自身 role=dialog，设置卡背景图须排除——否则裁剪框会吃到壁纸内联样式。
 * #96（审计）：应用内确认框（ConfirmDialog 也是 role=dialog）一并排除——否则
 * 设置卡壁纸内联样式会压过确认框的 rgba 暗化背景。 */
export const WIDGET_TARGET_SELECTOR: Record<string, string> = {
  'chat-background': '[data-conversation-scroll]',
  'settings-background': '[role="dialog"]:not([data-up-crop]):not([data-up-confirm])',
  'sidebar-poster': '[data-slot="sidebar"] > div:first-child',
}

/** 裁剪标记（嵌入 compiled cssText——驱动 patchDraft 差分 + controller 解析）。
 * 格式：`/* up-crop:<widgetId>:<opacity>:<x>:<y>:<w>:<h>:<url> *\/`（浅色）
 *      `/* up-crop-dark:<widgetId>:<opacity>:<x>:<y>:<w>:<h>:<url> *\/`（深色，#55）
 * url 为 assetCssUrl 输出（url("…") 片段），base64 数据不含 `*`，可安全截取。 */
export interface CropMarkerInfo {
  widgetId: string
  opacity: number
  x: number
  y: number
  w: number
  h: number
  url: string
  /** #55：true = 深色风格专用标记（up-crop-dark），false = 浅色/默认。 */
  dark: boolean
}

export function parseCropMarkers(cssText: string): CropMarkerInfo[] {
  const out: CropMarkerInfo[] = []
  const re = /\/\* up-crop(-dark)?:([a-z0-9-]+):([\d.]+):(-?[\d.]+):(-?[\d.]+):(-?[\d.]+):(-?[\d.]+):([^*]+?) \*\//g
  let match: RegExpExecArray | null
  while ((match = re.exec(cssText)) !== null) {
    const info: CropMarkerInfo = {
      widgetId: match[2],
      opacity: Number(match[3]),
      x: Number(match[4]),
      y: Number(match[5]),
      w: Number(match[6]),
      h: Number(match[7]),
      url: match[8].trim(),
      dark: match[1] === '-dark',
    }
    // #96（审计）：widgetId 白名单（未知 id 会让 controller 取 undefined 比例 → 抛错中断
    // 整次裁剪同步）+ 拒绝 0 尺寸裁剪矩形
    if (Number.isFinite(info.opacity) && Number.isFinite(info.x) && Number.isFinite(info.y)
      && Number.isFinite(info.w) && Number.isFinite(info.h) && info.w > 0 && info.h > 0
      && WIDGET_CROP_RATIOS[info.widgetId] !== undefined) {
      out.push(info)
    }
  }
  return out
}

/**
 * 裁剪元素的动态内联样式（纯函数可单测）——按目标元素**实际尺寸**计算：
 * 元素显示"裁剪帧内容"整体（帧按 s 缩放铺进元素），图片在帧内的绘制矩形同步缩放定位；
 * 帧内未覆盖区域露出元素底色（≈透明）。
 * @param elementW/elementH 目标元素当前尺寸
 * @param frame 裁剪帧尺寸（cropFrameSize 输出）
 * @param crop 绘制矩形（帧坐标，cropDrawRect 输出）
 * @param opacity 不透明度（0–1；wash 层叠图上方，同静态路径）
 * @param url assetCssUrl 输出（url("…") 片段）
 * @param washToken 底色 token（向它淡出）
 * @param fit #92：cover（默认）= max 缩放铺满元素（帧被裁剪——聊天/设置卡壁纸满铺）；
 *   contain = min 缩放 + 居中偏移（**整个帧完整可见**——侧栏海报专用：实际侧栏元素
 *   280×900 ≈ 1:3.2 远宽于 1:5 帧，cover 按宽度缩放把帧底部（海报常放的位置）映射出
 *   元素可视区外——用户实测"海报歪到不知道哪去了、折叠后露出一条"的根因；
 *   contain 下任意窗口高度都所见即所得，比例不符时两侧留边）。
 */
export function cropElementStyle(
  elementW: number,
  elementH: number,
  frame: { w: number; h: number },
  crop: { x: number; y: number; w: number; h: number },
  opacity: number,
  url: string,
  washToken: string,
  fit: 'cover' | 'contain' = 'cover',
): Record<string, string> {
  if (elementW <= 0 || elementH <= 0 || frame.w <= 0 || frame.h <= 0) return {}
  const s = fit === 'contain'
    ? Math.min(elementW / frame.w, elementH / frame.h)
    : Math.max(elementW / frame.w, elementH / frame.h)
  const offX = fit === 'contain' ? (elementW - frame.w * s) / 2 : 0
  const offY = fit === 'contain' ? (elementH - frame.h * s) / 2 : 0
  const wash = Math.round((1 - Math.min(1, Math.max(0, opacity))) * 100)
  // #91：层数与值列表必须一一对应！opacity=1 时背景只有 1 层（图片）——若仍输出
  // `cover, 384px…` 双值，CSS 按层取第一个值 → 图片被 cover 铺满、裁剪矩形被完全无视
  // （用户实测：预览里摆好的小图应用后铺满全屏——自 #52b 存活至今的隐性 bug，
  // 全画布裁剪 cover 视觉相同所以从未暴露）。
  const backgroundImage = wash > 0
    ? `linear-gradient(color-mix(in srgb, ${washToken} ${wash}%, transparent), `
      + `color-mix(in srgb, ${washToken} ${wash}%, transparent)), ${url}`
    : url
  return {
    backgroundImage,
    backgroundSize: wash > 0 ? `cover, ${crop.w * s}px ${crop.h * s}px` : `${crop.w * s}px ${crop.h * s}px`,
    backgroundPosition: wash > 0
      ? `center, ${offX + crop.x * s}px ${offY + crop.y * s}px`
      : `${offX + crop.x * s}px ${offY + crop.y * s}px`,
    backgroundRepeat: wash > 0 ? 'no-repeat, no-repeat' : 'no-repeat',
  }
}

/** #90 分层合成壁纸的动态内联样式（纯函数可单测）：静态底图 + 原生动图两层背景叠放。
 * 帧坐标 → 元素坐标与 cropElementStyle 同变换（#92：fit=contain 时 min 缩放 + 居中偏移，
 * 否则 max 缩放；裁剪矩形缩放 m = crop.w·s/frame.w——裁剪矩形保持帧比例，横竖缩放一致）：
 * - 底图：整帧图绘制在裁剪矩形（与单图路径一致——裁剪/缩放作用于整体合成）
 * - 动图：帧内矩形 (spec.x,spec.y,spec.w,spec.h) 经同变换映射到元素空间
 *   元素位置 = 帧居中偏移 + 裁剪矩形原点 + 动图矩形 × m（底图与动图同帧坐标系，缩放严格一致）
 * @param spec 分层规格（帧坐标矩形；animAssetId 由 meta 提供，渲染只需矩形）
 */
export function layeredElementStyle(
  elementW: number,
  elementH: number,
  frame: { w: number; h: number },
  crop: { x: number; y: number; w: number; h: number },
  opacity: number,
  baseUrl: string,
  animUrl: string,
  spec: { x: number; y: number; w: number; h: number },
  washToken: string,
  fit: 'cover' | 'contain' = 'cover',
): Record<string, string> {
  if (elementW <= 0 || elementH <= 0 || frame.w <= 0 || frame.h <= 0) return {}
  const s = fit === 'contain'
    ? Math.min(elementW / frame.w, elementH / frame.h)
    : Math.max(elementW / frame.w, elementH / frame.h)
  const offX = fit === 'contain' ? (elementW - frame.w * s) / 2 : 0
  const offY = fit === 'contain' ? (elementH - frame.h * s) / 2 : 0
  const m = crop.w > 0 ? (crop.w * s) / frame.w : s
  const wash = Math.round((1 - Math.min(1, Math.max(0, opacity))) * 100)
  const washLayer = wash > 0
    ? `linear-gradient(color-mix(in srgb, ${washToken} ${wash}%, transparent), `
      + `color-mix(in srgb, ${washToken} ${wash}%, transparent))`
    : null
  const baseSize = `${crop.w * s}px ${crop.h * s}px`
  const basePos = `${offX + crop.x * s}px ${offY + crop.y * s}px`
  const animSize = `${spec.w * m}px ${spec.h * m}px`
  const animPos = `${offX + crop.x * s + spec.x * m}px ${offY + crop.y * s + spec.y * m}px`
  return {
    backgroundImage: washLayer === null ? `${baseUrl}, ${animUrl}` : `${washLayer}, ${baseUrl}, ${animUrl}`,
    backgroundSize: washLayer === null ? `${baseSize}, ${animSize}` : `cover, ${baseSize}, ${animSize}`,
    backgroundPosition: washLayer === null ? `${basePos}, ${animPos}` : `center, ${basePos}, ${animPos}`,
    backgroundRepeat: washLayer === null ? 'no-repeat, no-repeat' : 'no-repeat, no-repeat, no-repeat',
  }
}
