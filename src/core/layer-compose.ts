/**
 * #84/#85 壁纸图层合成（#95 正式内化）：
 * 层配置的纯数据部分（node/client 可共享；canvas 渲染在 client/layer-composer.tsx）。
 * - LayerSpec：帧坐标（复用 #52/#53 惯例——画布 = 目标部件固定比例帧）
 * - normalizeLayers：非法字段逐个回落
 */

export interface LayerSpec {
  /** 素材库引用（小块图片）。 */
  assetId: string
  /** 帧坐标：绘制矩形左上角（画布坐标）。 */
  x: number
  y: number
  /** 绘制尺寸（帧坐标；保持素材纵横比由 UI 计算）。 */
  w: number
  h: number
  /** 旋转角（弧度，绕中心）。 */
  rotation: number
  /** 不透明度 0–1。 */
  opacity: number
  /** #87：水平镜像（绕中心翻转）。 */
  flipH: boolean
  /** #87：垂直镜像（绕中心翻转）。 */
  flipV: boolean
}

export function createLayer(assetId: string, frameW: number, frameH: number): LayerSpec {
  // 默认放在画布中心，初始尺寸 = 画布 1/4 宽（UI 端按素材纵横比再校正）
  return {
    assetId,
    x: frameW / 2 - frameW / 8,
    y: frameH / 2 - frameW / 8,
    w: frameW / 4,
    h: frameW / 4,
    rotation: 0,
    opacity: 1,
    flipH: false,
    flipV: false,
  }
}

/** 归一化（读盘/入参防御）：非法字段回落默认，未知键忽略；非对象 → 空数组。 */
export function normalizeLayers(raw: unknown): LayerSpec[] {
  if (!Array.isArray(raw)) return []
  const out: LayerSpec[] = []
  for (const item of raw) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) continue
    const r = item as Record<string, unknown>
    // #96（审计）：仅接受 number 或十进制数字串（Number('5x')=NaN、true→1 等宽松强转拒绝），
    // 几何绝对值上限 ±65535（防恶意数据携带 1e30 级矩形进画布渲染）
    const num = (key: string): number => {
      const v = r[key]
      if (typeof v === 'number' && Number.isFinite(v)) return Math.max(-65535, Math.min(65535, v))
      if (typeof v === 'string' && /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(v.trim())) {
        return Math.max(-65535, Math.min(65535, Number(v)))
      }
      return 0
    }
    if (typeof r.assetId !== 'string' || r.assetId === '') continue
    const rawOp = typeof r.opacity === 'number' ? r.opacity : Number(r.opacity)
    out.push({
      assetId: r.assetId,
      x: num('x'),
      y: num('y'),
      w: Math.max(1, Math.min(65535, num('w'))),
      h: Math.max(1, Math.min(65535, num('h'))),
      rotation: num('rotation'),
      opacity: Number.isFinite(rawOp) ? Math.min(1, Math.max(0, rawOp)) : 1,
      flipH: r.flipH === true,
      flipV: r.flipV === true,
    })
  }
  return out
}

// ---- #90 分层输出模式判定 ----

export type ComposeMode =
  | { kind: 'static' }
  | { kind: 'layered'; anim: { assetId: string; x: number; y: number; w: number; h: number } }
  | { kind: 'baked' }

/**
 * #90 合成模式判定（纯函数，可单测）：
 * - 全静态 → 'static'：单张 PNG（现状）
 * - **恰好 1 个 GIF 层**（无旋转/镜像/半透明——CSS 背景层硬限制）+ 至少 1 个静态层
 *   → 'layered'：静态层烘焙成一张底图，动图零复制（meta 记录引用与帧坐标矩形），
 *   渲染时 CSS 多背景叠放原生动图——避免照片被烤进 GIF 每帧（"超大 gif"根治）
 * - 其余（多 GIF 时间轴同步 / GIF 带变换 / 单 GIF 无静态层）→ 'baked'：现状烘焙动图
 */
export function composeMode(layers: LayerSpec[], isGif: (assetId: string) => boolean): ComposeMode {
  const gifs = layers.filter(layer => isGif(layer.assetId))
  const statics = layers.length - gifs.length
  if (gifs.length === 0) return { kind: 'static' }
  if (gifs.length === 1 && statics >= 1) {
    const gif = gifs[0]
    const clean = Math.abs(gif.rotation) < 1e-6 && gif.opacity >= 0.999 && !gif.flipH && !gif.flipV
    if (clean) {
      return { kind: 'layered', anim: { assetId: gif.assetId, x: gif.x, y: gif.y, w: gif.w, h: gif.h } }
    }
  }
  return { kind: 'baked' }
}
