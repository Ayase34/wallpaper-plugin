// M4-1 对比度提示 e2e：旋钮层文字/背景旋钮显示 WCAG 对比度徽标（取明暗较差者），
// 修改文字颜色后徽标实时更新（对比不足警示出现）。
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

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
await page.getByRole('button', { name: '设置', exact: true }).click()
const dialog = page.getByRole('dialog', { name: '设置' })
await dialog.waitFor({ timeout: 30000 })
await dialog.getByRole('button', { name: '外观预设', exact: true }).click()
await dialog.getByRole('button', { name: '打开美化工作室 →' }).click()
const studio = page.locator('[data-up-studio]')
await studio.waitFor({ timeout: 10000 })
await studio.locator('[data-up-card]').first().waitFor({ timeout: 10000 })
await studio.locator('[data-up-card]', { hasText: '默认' }).first().getByRole('button', { name: '编辑' }).click()
await studio.getByLabel('预设名称').waitFor({ timeout: 10000 })
await page.waitForTimeout(500)

// #74：旋钮层对比度徽标随入口注释移除——验证无徽标 + 质量检查由 preset_check（AI 工具）承担
check('旋钮层对比度徽标已移除（无 [data-up-contrast]）', (await studio.locator('[data-up-contrast]').count()) === 0)
check('旋钮层已移除（无 [data-up-knob]）', (await studio.locator('[data-up-knob]').count()) === 0)

// 原始令牌直编仍可用（对比度提示由 AI preset_check 侧负责——e2e-ai-tools/单测已覆盖）
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(300)
const bgLight = studio.getByLabel('--dsw-alias-bg-base light 值').first()
await bgLight.waitFor({ timeout: 10000 })
await bgLight.click()
await page.keyboard.press('Control+A')
await page.keyboard.type('#123456')
await page.waitForTimeout(400)
check('原始令牌直编可用（徽标移除后）', (await bgLight.inputValue()) === '#123456')

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
