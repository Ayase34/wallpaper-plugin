// M2-4 主题注册 e2e：高级区启用主题 → 保存（另存为）→ 状态条已注册 → 切换到此主题
// → 应用整体切为深色主题（body attr + 背景）→ 清除活动后主题行消失（注销）。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})
const existingList = await (await fetch(`${BASE}/ui-presets/presets`)).json()
for (const item of existingList.presets ?? []) {
  await fetch(`${BASE}/ui-presets/presets/${encodeURIComponent(item.id)}`, { method: 'DELETE' }).catch(() => {})
}

const browser = await launchBrowser()
const page = await browser.newPage()
let pass = 0
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`)
  if (!cond) process.exitCode = 1
  if (cond) pass += 1
}
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))

const openStudio = async () => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
  const trigger = page.getByRole('button', { name: '设置', exact: true })
  await trigger.waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: '设置' })
  await dialog.waitFor({ timeout: 30000 })
  await dialog.getByRole('button', { name: '外观预设', exact: true }).click()
  await dialog.getByRole('button', { name: '打开美化工作室 →' }).click()
  const studio = page.locator('[data-up-studio]')
  await studio.waitFor({ timeout: 10000 })
  await studio.locator('[data-up-card]').first().waitFor({ timeout: 10000 })
  return studio
}

// ---- #74：主题注册编辑入口已注释（AI 接管）——验证入口隐藏 + 引擎主题链路仍工作 ----
// 种子：HTTP 直接写一个带 theme 的预设并应用（模拟 AI 工具 preset_create/update 写入场景）
const seedPreset = {
  schemaVersion: 1, id: 'preset-theme-seed', name: '主题种子', edition: 'standard',
  tokens: { '--dsw-alias-bg-base': { light: 'rgb(255, 255, 255)', dark: 'rgb(13, 18, 27)' } },
  theme: {
    id: 'preset-theme-seed-theme', colorScheme: 'dark',
    tokens: { '--dsw-alias-bg-base': { light: 'rgb(255, 255, 255)', dark: 'rgb(13, 18, 27)' } },
  },
}
await fetch(`${BASE}/ui-presets/presets/preset-theme-seed`, {
  method: 'PUT', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ preset: seedPreset }),
})
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: 'preset-theme-seed' }),
})

// 1. 主题编辑入口已移除（无「注册为可选主题」开关）
const studio = await openStudio()
await studio.locator('[data-up-studio-title]').waitFor({ timeout: 10000 })
await page.waitForTimeout(400)
const themeToggle = studio.getByLabel('注册为可选主题')
check('主题注册编辑入口已移除（无开关）', (await themeToggle.count()) === 0)

// 2. 引擎链路仍工作：活动预设带 theme → 状态条主题行 + 切换 → 深色
await studio.locator('[data-up-theme-row]').waitFor({ timeout: 10000 })
const rowText = await studio.locator('[data-up-theme-row]').innerText()
check(`状态条显示主题已注册（${rowText.slice(0, 40)}）`, rowText.includes('preset-theme-seed-theme'))
await studio.locator('[data-up-theme-row]').getByRole('button', { name: '切换到此主题' }).click()
await page.waitForTimeout(700)
const after = await page.evaluate(() => ({
  attr: document.body.hasAttribute('data-ds-dark-theme'),
  bg: getComputedStyle(document.body).backgroundColor,
}))
check(`切换后应用为深色主题（attr=${after.attr} bg=${after.bg}）`, after.attr === true && after.bg === 'rgb(13, 18, 27)')

// 3. 落盘种子含 theme（AI 工具写入面不受影响）
const saved = await (await fetch(`${BASE}/ui-presets/presets/preset-theme-seed`)).json()
check('种子落盘含 theme 字段（AI 写入面保留）', saved.preset?.theme?.id === 'preset-theme-seed-theme'
  && saved.preset?.theme?.colorScheme === 'dark')

// 清理
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})
await fetch(`${BASE}/ui-presets/presets/preset-theme-seed`, { method: 'DELETE' }).catch(() => {})

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
