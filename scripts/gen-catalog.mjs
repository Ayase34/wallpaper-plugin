/**
 * 令牌目录生成器：解析 DSH ui-theme 的 5 张样式表 → src/core/catalog-data.ts。
 * 用法：node scripts/gen-catalog.mjs [--dsh <checkout路径>]
 * 规则：
 * - 亮色默认值取顶层/:root 声明；暗色取 [data-ds-dark-theme] 块内覆盖
 * - 分组按变量名前缀推断（--dsw-static-* / --dsw-alias-* / --dsw-specific-* / 其余）
 * - 安全等级初值：static/specific → caution；其余 alias → safe；shiki → caution
 * - 产物带 dshVersion 标记（从 checkout 的 lerna/package 版本读取，读不到用 'unknown'）
 * 提交产物后 DSH 升级时重跑并 diff（P0-3 维护流程）。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
// #96（GitHub 准备）：--dsh 参数或 DSH_CHECKOUT 环境变量必须显式提供（不内置个人机器路径）
const CHECKOUT = (() => {
  const flag = process.argv.includes('--dsh')
    ? process.argv[process.argv.indexOf('--dsh') + 1]
    : process.env.DSH_CHECKOUT
  if (!flag) throw new Error('gen-catalog 需要 --dsh <checkout> 参数或 DSH_CHECKOUT 环境变量（指向 deepseek-harness 的 packages/client/ui-theme/src/styles）')
  return flag
})()
const STYLES = join(CHECKOUT, 'packages/client/ui-theme/src/styles')
const OUT = join(ROOT, 'src/core/catalog-data.ts')

const FILES = ['design-platform.css', 'base.css', 'gradient-shadow-text.css', 'scrollbar.css', 'shiki.css']

/** 提取 css 文本中的变量定义：块选择器 → { name: value }。 */
function parseVars(cssText) {
  const blocks = new Map() // selector -> Map(name -> value)
  let current = ':root'
  blocks.set(current, new Map())
  // 逐块解析：选择器 { ... }
  const blockRe = /([^{}]+)\{([^{}]*)\}/g
  let m
  while ((m = blockRe.exec(cssText)) !== null) {
    const selector = m[1].trim()
    const body = m[2]
    const map = new Map()
    const varRe = /(--[\w-]+)\s*:\s*([^;]+);/g
    let v
    while ((v = varRe.exec(body)) !== null) {
      map.set(v[1], v[2].trim())
    }
    if (map.size > 0) blocks.set(selector, map)
  }
  return blocks
}

function groupOf(name) {
  if (name.startsWith('--dsw-static-')) return 'static'
  if (name.startsWith('--dsw-specific-')) return 'specific'
  if (name.startsWith('--dsw-alias-')) {
    // 评审 P1-6 修复：更具体的前缀必须先判（interactive-bg / scrollbar-bg 不能被 bg- 抢走）。
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
  if (name.startsWith('--dsh-')) return 'scrollbar'
  if (name.startsWith('--shiki-')) return 'shiki'
  if (name.startsWith('--dsw-shadow')) return 'shadow'
  if (name.startsWith('--dsw-linear-gradient') || name.startsWith('--dsw-mask')) return 'gradient'
  if (name.includes('font') || name.startsWith('--ds-font')) return 'font'
  return 'other'
}

function safetyOf(group) {
  if (group === 'static' || group === 'shiki') return 'caution'
  if (group === 'specific') return 'caution'
  return 'safe'
}

function scopeOf(group) {
  if (group === 'specific') return 'regional'
  if (group === 'alias-bg' || group === 'alias-label' || group === 'alias-border') return 'global'
  return 'local'
}

function valueTypeOf(name, value, group) {
  // 评审 P1-6 修复：先按组特判（shadow/gradient/ease 不能因值含逗号被误判 font-family）。
  if (group === 'shadow' || group === 'gradient') return 'string'
  if (name.includes('ease') || value.includes('cubic-bezier')) return 'easing'
  if (/^#[0-9a-fA-F]{3,8}$/.test(value) || /^rgba?\(/.test(value) || /^(transparent|currentColor|inherit)$/.test(value)) return 'color'
  // var() 引用：值本身不是颜色，但可能是任何类型——标记 string（M1 编辑器按"可解析颜色则给取色器"降级）。
  if (/^var\(/.test(value)) return 'string'
  if (/^-?[\d.]+(px|rem|em|%|s|ms)$/.test(value)) return 'length'
  if (/^-?[\d.]+$/.test(value)) return 'number'
  // font-family 判定收紧：名字须含 font 且值为逗号分隔的多个字体族。
  if ((name.includes('font') || name.startsWith('--ds-font')) && value.includes(',')) return 'font-family'
  return 'string'
}

function dshVersionOf() {
  try {
    const pkg = JSON.parse(readFileSync(join(CHECKOUT, 'package.json'), 'utf8'))
    return typeof pkg.version === 'string' ? pkg.version : 'unknown'
  } catch {
    return 'unknown'
  }
}

function main() {
  if (!existsSync(STYLES)) {
    console.error(`[gen-catalog] 样式目录不存在：${STYLES}\n用法：node scripts/gen-catalog.mjs --dsh <checkout路径>`)
    process.exit(1)
  }
  const all = new Map() // name -> { light, dark }
  for (const file of FILES) {
    const path = join(STYLES, file)
    if (!existsSync(path)) continue
    const blocks = parseVars(readFileSync(path, 'utf8'))
    for (const [selector, map] of blocks) {
      const isDark = selector.includes('data-ds-dark-theme') || selector.includes(':root[data-ds-dark-theme]')
      for (const [name, value] of map) {
        if (value === 'initial' || value === 'unset' || value === 'var(') continue
        const entry = all.get(name) ?? { light: '', dark: '' }
        if (isDark) entry.dark = value
        else if (entry.light === '') entry.light = value
        all.set(name, entry)
      }
    }
  }
  const entries = [...all.entries()]
    .filter(([, v]) => v.light !== '' || v.dark !== '')
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, v]) => {
      const group = groupOf(name)
      const light = v.light !== '' ? v.light : v.dark
      const dark = v.dark !== '' ? v.dark : v.light
      return {
        name,
        group,
        light,
        dark,
        valueType: valueTypeOf(name, light, group),
        safety: safetyOf(group),
        scope: scopeOf(group),
        description: '',
      }
    })
  const version = dshVersionOf()
  const lines = [
    '// 生成产物：scripts/gen-catalog.mjs 解析 DSH ui-theme 样式表生成。',
    '// 禁止手改；DSH 升级后重跑 `node scripts/gen-catalog.mjs --dsh <checkout>` 并提交 diff。',
    `export const CATALOG_DSH_VERSION = ${JSON.stringify(version)}`,
    '',
    'export const CATALOG = [',
    ...entries.map(e => `  { name: ${JSON.stringify(e.name)}, group: ${JSON.stringify(e.group)}, light: ${JSON.stringify(e.light)}, dark: ${JSON.stringify(e.dark)}, valueType: ${JSON.stringify(e.valueType)}, safety: ${JSON.stringify(e.safety)}, scope: ${JSON.stringify(e.scope)}, description: ${JSON.stringify(e.description)} },`),
    ']',
    '',
  ]
  writeFileSync(OUT, lines.join('\n'))
  console.log(`[gen-catalog] 已生成 ${entries.length} 条令牌（dshVersion=${version}）→ ${OUT}`)
}

main()
