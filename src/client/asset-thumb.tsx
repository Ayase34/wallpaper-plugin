/**
 * #89 素材缩略图（首帧 canvas 绘制）——替代全量 <img>：
 * 浏览器对 <img src=动图> 会解码整段动画并驻留（93 帧 × 1280×720 ≈ 343MB/张）——
 * 素材面板/素材芯片把库里全部素材渲染为全量 <img>，多次合成后标签页内存爆炸、
 * 界面卡死（用户"GIF+静态合成不出来"排查链实证：30 素材重负载会话 heap 370MB+，
 * 合成成品逐张入面板后可达数 GB）。
 * 本组件只把首帧画进小 canvas，原图不挂 DOM、解码后可被 GC——动图只占首帧内存。
 */
import * as React from 'react'

export function AssetThumb(props: {
  assetId: string
  /** 显示尺寸（正方形像素）。 */
  size: number
  title?: string
  /** 透传 data-* 属性（e2e 定位锚点）。 */
  dataAttrs?: Record<string, string>
  onClick?: () => void
}): React.ReactElement {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  React.useEffect(() => {
    let alive = true
    const img = new Image()
    img.onload = () => {
      if (!alive) return
      const canvas = canvasRef.current
      if (canvas === null) return
      const nw = img.naturalWidth
      const nh = img.naturalHeight
      if (nw === 0 || nh === 0) return
      const ctx = canvas.getContext('2d')
      if (ctx === null) return
      const S = props.size
      const s = Math.max(S / nw, S / nh) // cover 铺满
      const dw = nw * s
      const dh = nh * s
      canvas.width = S
      canvas.height = S
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, (S - dw) / 2, (S - dh) / 2, dw, dh)
    }
    img.src = `/ui-presets/assets/${encodeURIComponent(props.assetId)}`
    return () => { alive = false }
  }, [props.assetId, props.size])
  return (
    <canvas
      ref={canvasRef}
      title={props.title}
      onClick={props.onClick}
      {...(props.dataAttrs ?? {})}
      style={{
        width: props.size,
        height: props.size,
        borderRadius: 4,
        border: '1px solid var(--dsw-alias-border-l2)',
        background: '#f2f2f2',
        cursor: props.onClick !== undefined ? 'pointer' : 'default',
        flex: 'none',
      }}
    />
  )
}
