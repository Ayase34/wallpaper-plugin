// M4-2 键盘可操作 + reduced-motion e2e：
// Esc 关闭工作室（hash 清除 + 层卸载）→ 预设墙卡片可聚焦 + Enter 应用 → reduced-motion 样式注入。
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
await page.waitForTimeout(300)

// 1. Esc 关闭工作室（hash 清除 + 层卸载）
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
check('Esc 关闭工作室（hash 清空）', (await page.evaluate(() => window.location.hash)) === '')
check('Esc 关闭工作室（层卸载）', (await studio.count()) === 0)

// 2. 预设墙卡片键盘可达：focus + Enter 应用（body 变 默认 底色）
await page.getByRole('button', { name: '设置', exact: true }).click()
await page.getByRole('button', { name: '外观预设', exact: true }).click()
const card = page.locator('[data-up-card]').first()
await card.waitFor({ timeout: 30000 })
await card.focus()
check('预设墙卡片可聚焦（Tab 可达）', await card.evaluate(el => document.activeElement === el))
await page.keyboard.press('Enter')
await page.waitForTimeout(400)
const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`Enter 应用预设生效（body=${bg}）`, bg === 'rgb(240, 248, 255)' || bg === 'rgb(6, 14, 30)')

// 3. reduced-motion 样式已注入（@media prefers-reduced-motion 覆盖过渡）
const reducedMotionCss = await page.evaluate(() =>
  [...document.querySelectorAll('style[data-ui-presets-style]')]
    .map(s => s.textContent ?? '')
    .join(''))
check('reduced-motion 样式注入', reducedMotionCss.includes('prefers-reduced-motion') && reducedMotionCss.includes('transition: none'))

// 4. 模拟 prefers-reduced-motion → 卡片过渡被禁用
await page.emulateMedia({ reducedMotion: 'reduce' })
const cardTransition = await card.evaluate(el => getComputedStyle(el).transitionDuration)
check(`reduced-motion 下过渡禁用（transitionDuration=${cardTransition}）`, cardTransition === '0s')

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
