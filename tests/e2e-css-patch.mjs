// M2-2 CSS 补丁 e2e：添加规则 → 实时生效 → 非法选择器行内校验 → 保存落盘 → 重启恢复。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
const SELECTOR = '[data-up-studio-title]'
const RULES = 'color: rgb(255, 0, 0)'

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

const typeInto = async (locator, text) => {
  await locator.click()
  await locator.press('Control+A')
  await locator.pressSequentially(text)
}

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

// ---- #74：CSS 补丁编辑入口已注释（AI 接管）——验证入口隐藏 + 已存 css 仍由引擎应用 ----
// 种子：HTTP 直接写一个带 css 补丁的预设并应用（模拟 AI 工具 preset_update 写入的场景）
const seedPreset = {
  schemaVersion: 1, id: 'preset-css-seed', name: 'CSS 种子', edition: 'standard',
  tokens: { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' } },
  css: [{ selector: SELECTOR, rules: RULES }],
}
await fetch(`${BASE}/ui-presets/presets/preset-css-seed`, {
  method: 'PUT', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ preset: seedPreset }),
})
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: 'preset-css-seed' }),
})

const studio = await openStudio()
await studio.locator('[data-up-studio-title]').waitFor({ timeout: 10000 })
await page.waitForTimeout(400)
// 引擎仍应用已保存的 css（入口移除不影响应用链路）
const titleApplied = await studio.locator('[data-up-studio-title]').evaluate(el => getComputedStyle(el).color)
check(`已存 css 仍由引擎应用（标题=${titleApplied}）`, titleApplied === 'rgb(255, 0, 0)')

// CSS 编辑器入口已移除
await studio.locator('[data-up-card]', { hasText: 'CSS 种子' }).first().getByRole('button', { name: '编辑' }).click()
await studio.getByLabel('预设名称').waitFor({ timeout: 10000 })
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(300)
check('CSS 编辑器入口已移除（无 [data-up-css-editor]）', await studio.locator('[data-up-css-editor]').count() === 0)
check('「添加规则」按钮不可见', await studio.getByRole('button', { name: '添加规则' }).count() === 0)
// 原始令牌直编仍可用
const bgLight = studio.getByLabel('--dsw-alias-bg-base light 值').first()
await bgLight.waitFor({ timeout: 10000 })
await typeInto(bgLight, '#123456')
await page.waitForTimeout(300)
check('原始令牌直编可用（css 入口移除后）', (await bgLight.inputValue()) === '#123456')

// 清理
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})
await fetch(`${BASE}/ui-presets/presets/preset-css-seed`, { method: 'DELETE' }).catch(() => {})

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
