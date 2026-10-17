/**
 * #111 令牌目录补录生成器（C2）：从宿主 `dsh-client-ui-theme/lib/client.js` 内嵌的
 * 样式串里提取 gen-catalog 未覆盖的令牌（radius / corner-shape / motion / settings-card 等），
 * 产出 `src/core/catalog-extra.ts`（提交产物；与 catalog-data.ts 合并使用）。
 *
 * 为什么需要它：gen-catalog.mjs 只解析 ui-theme/src/styles 的 5 个 CSS 文件，而宿主
 * 根系令牌（--dsw-radius-* 6 个、--dsw-corner-shape、--ds-transition-duration*、
 * --dsw-alias-settings-card-* 等）定义在 theme 包的 JS 注入样式里 → 目录漏收 53 条，
 * UI 与 AI 都看不见这些"风格维度"。
 *
 * 用法：node scripts/gen-catalog-extra.mjs --theme-client <client.js 路径>
 *       （client.js 可从安装包 app.asar 中 dsh/node_modules/@deepseek-ai/dsh-client-ui-theme/lib/client.js 取出）
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const OUT = join(ROOT, 'src/core/catalog-extra.ts')
const BASE = join(ROOT, 'src/core/catalog-data.ts')

const argPath = process.argv.includes('--theme-client')
  ? process.argv[process.argv.indexOf('--theme-client') + 1]
  : process.env.DSH_THEME_CLIENT
if (!argPath || !existsSync(argPath)) {
  console.error('[gen-catalog-extra] 需要 --theme-client <dsh-client-ui-theme/lib/client.js>')
  process.exit(1)
}

/** 还原 JS 字符串里的转义（\" 与 \n），再按 CSS 块提取变量。 */
const text = readFileSync(argPath, 'utf8').replace(/\\"/g, '"').replace(/\\n/g, '\n')

const all = new Map() // name -> { light, dark }
const blockRe = /([^{}]+)\{([^{}]*)\}/g
let m
while ((m = blockRe.exec(text)) !== null) {
  const selector = m[1]
  const isDark = /data-ds-dark-theme/.test(selector)
  // 声明可能以 ; 结尾，也可能是块内最后一条（后面直接是块尾）——三种结尾都要收
  const varRe = /(--(?:dsw|ds)-[\w-]+)\s*:\s*([^;}]+)(?:[;}]|$)/g
  let v
  while ((v = varRe.exec(m[2])) !== null) {
    const name = v[1]
    const value = v[2].trim()
    if (value === '' || value === 'initial' || value === 'unset') continue
    const entry = all.get(name) ?? { light: '', dark: '' }
    if (isDark) entry.dark = value
    else if (entry.light === '') entry.light = value
    all.set(name, entry)
  }
}

/** 目录里已有（catalog-data.ts）的名字。 */
const known = new Set()
for (const mm of readFileSync(BASE, 'utf8').matchAll(/\{\s*name:\s*"([^"]+)"/g)) known.add(mm[1])

function groupOf(name) {
  if (name.includes('radius') || name.includes('corner-shape')) return 'radius'
  if (name.includes('transition') || name.includes('ease')) return 'motion'
  if (name.startsWith('--dsw-alias-settings')) return 'alias-settings'
  if (name.startsWith('--dsw-static-')) return 'static'
  if (name.startsWith('--dsw-specific-')) return 'specific'
  if (name.startsWith('--dsw-alias-')) {
    if (name.includes('interactive')) return 'alias-interactive'
    if (name.includes('scrollbar')) return 'alias-scrollbar'
    if (name.includes('bg-')) return 'alias-bg'
    if (name.includes('border')) return 'alias-border'
    if (name.includes('brand')) return 'alias-brand'
    if (name.includes('label')) return 'alias-label'
    if (name.includes('button')) return 'alias-button'
    if (name.includes('state-')) return 'alias-state'
    if (name.includes('markdown')) return 'alias-markdown'
    if (name.includes('toast') || name.includes('tooltip') || name.includes('overlay')) return 'alias-overlay'
    return 'other'
  }
  if (name.startsWith('--shiki-')) return 'shiki'
  if (name.startsWith('--dsw-shadow')) return 'shadow'
  if (name.startsWith('--dsw-linear-gradient') || name.startsWith('--dsw-mask')) return 'gradient'
  if (name.includes('font') || name.startsWith('--ds-font')) return 'font'
  return 'other'
}

function safetyOf(group) {
  if (group === 'radius' || group === 'motion') return 'caution'
  if (group === 'static' || group === 'specific' || group === 'shiki') return 'caution'
  return 'safe'
}

function scopeOf(group) {
  if (group === 'radius' || group === 'motion') return 'global'
  if (group === 'specific') return 'regional'
  if (group === 'alias-bg' || group === 'alias-label' || group === 'alias-border') return 'global'
  return 'local'
}

function valueTypeOf(name, value, group) {
  if (name.includes('ease') || value.includes('cubic-bezier')) return 'easing'
  if (/^#[0-9a-fA-F]{3,8}$/.test(value) || /^rgba?\(/.test(value)) return 'color'
  if (/^-?[\d.]+(px|rem|em|%|s|ms)$/.test(value)) return 'length'
  if (/^-?[\d.]+$/.test(value)) return 'number'
  return 'string'
}

const entries = [...all.entries()]
  .filter(([name]) => !known.has(name))
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([name, v]) => {
    const group = groupOf(name)
    const light = v.light !== '' ? v.light : v.dark
    const dark = v.dark !== '' ? v.dark : v.light
    return { name, group, light, dark, valueType: valueTypeOf(name, light, group), safety: safetyOf(group), scope: scopeOf(group) }
  })

const lines = [
  '// 生成产物：scripts/gen-catalog-extra.mjs 从宿主 dsh-client-ui-theme/lib/client.js',
  '// 内嵌样式串提取「gen-catalog 未覆盖」的令牌（radius / corner-shape / motion / settings-card …）。',
  '// 禁止手改；宿主升级后重跑：node scripts/gen-catalog-extra.mjs --theme-client <client.js>',
  'export const CATALOG_EXTRA = [',
  ...entries.map(e => `  { name: ${JSON.stringify(e.name)}, group: ${JSON.stringify(e.group)}, light: ${JSON.stringify(e.light)}, dark: ${JSON.stringify(e.dark)}, valueType: ${JSON.stringify(e.valueType)}, safety: ${JSON.stringify(e.safety)}, scope: ${JSON.stringify(e.scope)}, description: "" },`),
  ']',
  '',
]
writeFileSync(OUT, lines.join('\n'))
console.log(`[gen-catalog-extra] 提取 ${all.size} 条定义，其中新增 ${entries.length} 条 → ${OUT}`)
