// 生成 src/node/builtin-assets.ts：出厂预设「默认」携带的壁纸素材（JPEG q88 内嵌 base64）。
// 只被 node half 导入——避免把图像数据打进浏览器包（client.js）。
//
// #108 修复：聊天背景原图是**透明底 PNG**（34.6% 全透明 / 4.6% 半透明，且透明区 RGB 为纯黑）。
// JPEG 无 alpha，直接转码会把透明区压成黑色块（用户实测：壁纸上一大块黑）。这里按主题把
// 透明部分压到对应底色上，产出浅/深两版：
//   - 浅色：压到 #ffffff（贴浅色界面 ≈ 原透明观感）
//   - 深色：压到 #060e1e（出厂预设 default 的暗色 bg-base）
// 另两张源图本身是不透明白底，直接转码（不做 JPEG 叠 JPEG 的二次损失）。
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SRC_DIR = join(ROOT, 'src', 'builtin-src')
const OUT = join(ROOT, 'src', 'node', 'builtin-assets.ts')
const WORK = join(SRC_DIR, '.work')

/** 扁平化底色（透明区压到该颜色上）。 */
const FLATTEN = { light: '#ffffff', dark: '#060e1e' }

const SPECS = [
  { src: 'chat-background.png', id: 'asset-dsnm-chat', name: 'DeepSeek娘_聊天背景.jpg', flatten: FLATTEN.light, desc: '聊天背景图 16:9（浅色底）' },
  { src: 'chat-background.png', id: 'asset-dsnm-chat-dark', name: 'DeepSeek娘_聊天背景_深色.jpg', flatten: FLATTEN.dark, desc: '聊天背景图 16:9（深色底）' },
  { src: 'sidebar-poster.png', id: 'asset-dsnm-sidebar', name: 'DeepSeek娘_侧栏海报.jpg', desc: '侧栏海报 1:5' },
  { src: 'settings-background.png', id: 'asset-dsnm-settings', name: 'DeepSeek娘_设置卡背景图.jpg', desc: '设置卡背景图 1:1' },
]

const PY_SCRIPT = `
import sys
from PIL import Image
src, dst, flat, q = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
im = Image.open(src)
if im.mode in ("RGBA", "LA", "P"):
    im = im.convert("RGBA")
    rgb = tuple(int(flat.lstrip("#")[i:i+2], 16) for i in (0, 2, 4))
    bg = Image.new("RGB", im.size, rgb)
    bg.paste(im, (0, 0), im)
    out = bg
else:
    out = im.convert("RGB")
out.save(dst, "JPEG", quality=q, optimize=True, progressive=True)
print("  " + dst.split("\\\\")[-1] + " " + str(out.size[0]) + "x" + str(out.size[1]))
`

/** 用 Python + Pillow 渲染（透明区压底色）；源图不透明时原样转码。 */
function renderJpeg(spec) {
  const srcPath = join(SRC_DIR, spec.src)
  if (!existsSync(srcPath)) throw new Error(`缺少源图：${srcPath}（见 src/builtin-src/README 说明）`)
  const outPath = join(WORK, `${spec.id}.jpg`)
  const py = process.env.DSH_PYTHON ?? 'python'
  execFileSync(py, ['-c', PY_SCRIPT, srcPath, outPath, spec.flatten ?? FLATTEN.light, '88'], { stdio: ['ignore', 'inherit', 'inherit'] })
  return readFileSync(outPath)
}

mkdirSync(WORK, { recursive: true })

const lines = []
lines.push('/**')
lines.push(' * 出厂预设「默认」的内置壁纸素材（#108）：JPEG（q88）以 base64 内嵌，')
lines.push(' * 首次启动由 seedBuiltinPreset() 播种进用户壁纸库（素材 id 固定，重复播种幂等）。')
lines.push(' *')
lines.push(' * 构建期产物——由 scripts/gen-builtin-assets.mjs 从 src/builtin-src/*.png 生成（禁止手改）：')
lines.push(' * - 透明底源图（聊天背景）按主题分别压到底色上，避免 JPEG 把透明区压成黑块（#108 修复）；')
lines.push(' * - 只进 node half：浏览器包（client.js）不含任何图像数据。')
lines.push(' */')
lines.push('')
lines.push('/** 单张内置素材（id/文件名/mime/base64 负载）。 */')
lines.push('export interface BuiltinAsset {')
lines.push('  id: string')
lines.push('  name: string')
lines.push('  mime: string')
lines.push('  /** 原始字节的 base64（不含 data: 前缀）。 */')
lines.push('  base64: string')
lines.push('}')
lines.push('')
lines.push('/** 出厂预设携带的壁纸（聊天背景含浅/深两版；id 与 seed.ts 的引用一一对应）。 */')
lines.push('export const BUILTIN_ASSETS: BuiltinAsset[] = [')

let total = 0
for (const spec of SPECS) {
  const bytes = renderJpeg(spec)
  total += bytes.length
  const srcHash = createHash('sha256').update(readFileSync(join(SRC_DIR, spec.src))).digest('hex').slice(0, 12)
  lines.push('  {')
  lines.push(`    // ${spec.desc}　${bytes.length.toLocaleString('en-US')} 字节（源图 sha256:${srcHash}…）`)
  lines.push(`    id: '${spec.id}',`)
  lines.push(`    name: '${spec.name}',`)
  lines.push(`    mime: 'image/jpeg',`)
  lines.push(`    base64: '${bytes.toString('base64')}',`)
  lines.push('  },')
}
lines.push(']')
lines.push('')

writeFileSync(OUT, lines.join('\n'), 'utf8')
console.log(`写入 ${OUT}（${SPECS.length} 张，合计 ${total.toLocaleString('en-US')} 字节 → ${(readFileSync(OUT).length / 1024).toFixed(0)}KB TS）`)
