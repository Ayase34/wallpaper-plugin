// 生成 src/node/builtin-assets.ts：出厂预设「默认」携带的壁纸素材（JPEG q88 内嵌 base64）。
// 只被 node half 导入——避免把 ~700KB 图像数据打进浏览器包（client.js）。
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const srcDir = process.argv[2]
const out = process.argv[3]

const SPECS = [
  { file: 'DeepSeek娘_聊天背景.jpg', id: 'asset-dsnm-chat', name: 'DeepSeek娘_聊天背景.jpg', desc: '聊天背景图 16:9' },
  { file: 'DeepSeek娘_侧栏海报.jpg', id: 'asset-dsnm-sidebar', name: 'DeepSeek娘_侧栏海报.jpg', desc: '侧栏海报 1:5' },
  { file: 'DeepSeek娘_设置卡背景图.jpg', id: 'asset-dsnm-settings', name: 'DeepSeek娘_设置卡背景图.jpg', desc: '设置卡背景图 1:1' },
]

const present = new Set(readdirSync(srcDir))
const lines = []
lines.push('/**')
lines.push(' * 出厂预设「默认」的内置壁纸素材（#108）：三张 JPEG（q88）以 base64 内嵌，')
lines.push(' * 首次启动由 seedBuiltinPreset() 播种进用户壁纸库（素材 id 固定，可重复播种幂等）。')
lines.push(' *')
lines.push(' * 为什么内嵌而不是仓库里放二进制：')
lines.push(' * - 插件运行时不保证存在「按包内路径读文件」的能力（素材服务只认壁纸库目录）；')
lines.push(' * - 只进 node half（浏览器包不引它），因此不会让 client.js 膨胀；')
lines.push(' * - base64 是构建期产物，由 scripts/gen-builtin-assets.mjs 从源图生成（禁止手改）。')
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
lines.push('/** 出厂预设携带的三张壁纸（顺序：聊天背景 / 侧栏海报 / 设置卡背景图）。 */')
lines.push('export const BUILTIN_ASSETS: BuiltinAsset[] = [')

let total = 0
for (const spec of SPECS) {
  if (!present.has(spec.file)) throw new Error(`缺少源图：${spec.file}`)
  const bytes = readFileSync(join(srcDir, spec.file))
  total += bytes.length
  const b64 = bytes.toString('base64')
  lines.push('  {')
  lines.push(`    // ${spec.desc}　${bytes.length.toLocaleString('en-US')} 字节`)
  lines.push(`    id: '${spec.id}',`)
  lines.push(`    name: '${spec.name}',`)
  lines.push(`    mime: 'image/jpeg',`)
  lines.push(`    base64: '${b64}',`)
  lines.push('  },')
}
lines.push(']')
lines.push('')

writeFileSync(out, lines.join('\n'), 'utf8')
console.log(`写入 ${out}（合计 ${total.toLocaleString('en-US')} 字节图像 → ${(readFileSync(out).length / 1024).toFixed(0)}KB TS 文件）`)
