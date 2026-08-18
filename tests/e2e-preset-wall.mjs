// M3-1 内容工程 e2e：预设墙封面缩略图 + 出厂预设可见可应用（方案无关）。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})

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
await dialog.locator('[data-up-section]').waitFor({ timeout: 30000 })
// 等封面全部加载完成（避免异步图片导致的布局位移让后续 click 点空）
await page.waitForFunction(
  () => {
    const imgs = [...document.querySelectorAll('[data-up-cover]')]
    return imgs.length >= 1 && imgs.every(img => img.complete && img.naturalWidth > 0)
  },
  { timeout: 15000 },
).catch(() => {})
await page.waitForTimeout(300)

// 1. 出厂预设渲染（#82 收敛为唯一 默认；含库中用户预设 → ≥1）
const cardCount = await dialog.locator('[data-up-card]').count()
check(`预设墙卡片 ≥1（实际 ${cardCount}）`, cardCount >= 1)

// 2. 每个出厂卡片带封面缩略图（data URL SVG，可加载 naturalWidth>0）
const coverCount = await dialog.locator('[data-up-cover]').count()
check(`封面缩略图数量与卡片一致（${coverCount}）`, coverCount === cardCount)
const coverLoaded = await dialog.locator('[data-up-cover]').first().evaluate(img => img.naturalWidth > 0)
check('封面 SVG 可加载（naturalWidth>0）', coverLoaded)

// 3. 出厂预设「默认」可见
check('「默认」可见', await dialog.getByText('默认', { exact: false }).count() >= 1)

// 4. 应用「默认」→ body 变海蓝底色（light rgb(240,248,255) / dark rgb(6,14,30)）
const deepseekCard = dialog.locator('[data-up-card]', { hasText: '默认' }).first()
await deepseekCard.getByRole('button', { name: '应用' }).click({ force: true })
await deepseekCard.getByText('✓ 当前应用').waitFor({ timeout: 10000 })
await page.waitForTimeout(400)
const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`应用 默认 生效（body=${bodyBg}）`, bodyBg === 'rgb(240, 248, 255)' || bodyBg === 'rgb(6, 14, 30)')
check('默认 卡片标记当前应用', await deepseekCard.getByText('✓ 当前应用').count() === 1)

// 5. 还原默认
await dialog.locator('[data-up-btn]', { hasText: '还原默认' }).first().click({ force: true })
await page.waitForTimeout(600)

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
