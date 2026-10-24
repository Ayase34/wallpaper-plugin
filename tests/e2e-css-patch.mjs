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

// ---- 高级区 CSS 补丁 UI（恢复 #74 注释掉的人用入口）：编辑 → 实时预览 → 非法行报错 → 保存落盘 ----
// 种子：HTTP 直接写一个带 css 补丁的预设并应用（同时覆盖「AI/导入写入的已有 css 在 UI 里可编辑」）
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
const titleApplied = await studio.locator('[data-up-studio-title]').evaluate(el => getComputedStyle(el).color)
check(`已存 css 由引擎应用（标题=${titleApplied}）`, titleApplied === 'rgb(255, 0, 0)')

// 打开 CSS 面板（默认折叠）
check('CSS 补丁面板存在', await studio.locator('[data-up-css-panel]').count() === 1)
await studio.locator('[data-up-card]', { hasText: 'CSS 种子' }).first().getByRole('button', { name: '编辑' }).click()
await studio.getByLabel('预设名称').waitFor({ timeout: 10000 })
await studio.locator('[data-up-css-head]').click()
await page.waitForTimeout(200)

const selectorInput = studio.getByLabel('CSS 选择器 1').first()
const rulesInput = studio.getByLabel('CSS 声明 1').first()
check('已有 css 回填到面板', (await selectorInput.inputValue()) === SELECTOR && (await rulesInput.inputValue()) === RULES)

// 改声明 → 草稿即时生效（无需保存）
await typeInto(rulesInput, 'color: rgb(0, 128, 0)')
await page.waitForTimeout(400)
const liveColor = await studio.locator('[data-up-studio-title]').evaluate(el => getComputedStyle(el).color)
check(`改声明即时生效（标题=${liveColor}）`, liveColor === 'rgb(0, 128, 0)')

// 非法选择器：行内报错 + 保存被拒（不得静默写入共享样式表）
await studio.locator('[data-up-css-add]').click()
await page.waitForTimeout(150)
await typeInto(studio.getByLabel('CSS 选择器 2').first(), '.not-allowed')
await page.waitForTimeout(150)
check('非法选择器行内报错', (await studio.locator('[data-up-css-row]').nth(1).innerText()).includes('选择器须以'))
await studio.locator('[data-up-studio-bar]').getByRole('button', { name: '保存' }).click()
await page.waitForTimeout(600)
check('非法 css 保存被拒并报错', await studio.locator('[data-up-error]').count() >= 1)
check('非法规则未注入（标题颜色仍为绿）',
  (await studio.locator('[data-up-studio-title]').evaluate(el => getComputedStyle(el).color)) === 'rgb(0, 128, 0)')

// 删掉非法行 → 保存成功 → 落盘可读回
await studio.locator('[data-up-css-del]').nth(1).click()
await page.waitForTimeout(150)
await studio.locator('[data-up-studio-bar]').getByRole('button', { name: '保存' }).click()
await page.waitForTimeout(800)
const saved = await (await fetch(`${BASE}/ui-presets/presets/preset-css-seed`)).json()
check('保存后 css 落盘（新声明）', saved?.preset?.css?.[0]?.rules === 'color: rgb(0, 128, 0)')
check('保存后只剩一条规则', (saved?.preset?.css ?? []).length === 1)

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
