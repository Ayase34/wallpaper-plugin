/**
 * 封面栅格化（浏览器专用）：把预设的手设封面按「摆放矩形」渲染成 900×300 的 3:1 图。
 *
 * 从 index.tsx 抽出来是为了**墙上与工作室看到同一张图**——#56 的手设封面只有墙在用 canvas 渲染，
 * 工作室预览一直显示未裁剪原图，两处对不上（#113 顺手统一）。
 * 无手设封面 / 图源加载失败 → 回退自动生成的 SVG data URL。
 */
import { coverDataUrlFor, coverDestRect } from '../core/cover.ts'
import type { Preset } from '../core/schema.ts'

/** 预设 → 封面图源（dataUrl 或壁纸库路由）；无手设封面 → 自动 SVG。 */
function coverSource(preset: Preset): string {
  const cover = preset.cover
  if (cover === undefined || cover.assetId === '') return coverDataUrlFor(preset)
  const asset = (preset.assets ?? []).find(item => item.id === cover.assetId)
  if (asset === undefined) return coverDataUrlFor(preset)
  return asset.dataUrl ?? `/ui-presets/assets/${encodeURIComponent(cover.assetId)}`
}

/** 渲染封面（异步；失败一律回退，不抛错）。 */
export function renderCoverFor(preset: Preset): Promise<string> {
  const cover = preset.cover
  if (cover === undefined || cover.assetId === '') return Promise.resolve(coverDataUrlFor(preset))
  const hasCrop = typeof cover.cropX === 'string' && cover.cropX !== ''
    && typeof cover.cropW === 'string' && cover.cropW !== ''
  if (!hasCrop) return Promise.resolve(coverSource(preset))
  const src = coverSource(preset)
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      try {
        const W = 900
        const H = 300
        const rect = coverDestRect(
          { x: Number(cover.cropX), y: Number(cover.cropY), w: Number(cover.cropW), h: Number(cover.cropH) },
          { w: W, h: H },
        )
        if (rect === null || img.naturalWidth <= 0 || img.naturalHeight <= 0) { resolve(src); return }
        const canvas = document.createElement('canvas')
        canvas.width = W
        canvas.height = H
        const ctx = canvas.getContext('2d')
        if (ctx === null) { resolve(src); return }
        ctx.clearRect(0, 0, W, H)
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, rect.x, rect.y, rect.w, rect.h)
        resolve(canvas.toDataURL('image/png'))
      } catch { resolve(src) }
    }
    img.onerror = () => { resolve(coverDataUrlFor(preset)) }
    img.src = src
  })
}
