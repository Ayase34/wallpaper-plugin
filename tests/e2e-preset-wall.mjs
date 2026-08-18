// M3-1 内容工程 e2e：预设墙封面缩略图 + 出厂预设可见可应用（方案无关）。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

// 前置：清活动 + 清库中 default（防上次运行中断残留的遮蔽预设污染断言）
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})
await fetch(`${BASE}/ui-presets/presets/default`, { method: 'DELETE' }).catch(() => {})

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

// 6. #97 回归：库预设遮蔽同 id 出厂预设（default，含手设封面）→ 墙卡片 = 库版本
//    （手设封面 + 「我的预设」徽标；原缺陷：demo 优先去重 + loadWall 跳过 → 显示自动 SVG）
const PNG_1PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const shadowPut = await fetch(`${BASE}/ui-presets/presets/default`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    preset: {
      schemaVersion: 1,
      edition: 'standard',
      id: 'default',
      name: '默认',
      tokens: {},
      assets: [{ id: 'asset-cov-97', name: 'cover.png', mime: 'image/png', dataUrl: PNG_1PX }],
      cover: { assetId: 'asset-cov-97' },
    },
  }),
})
check('#97 写入库遮蔽预设（default + 手设封面）', shadowPut.ok)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
await page.getByRole('button', { name: '设置', exact: true }).click()
const dialog2 = page.getByRole('dialog', { name: '设置' })
await dialog2.waitFor({ timeout: 30000 })
await dialog2.getByRole('button', { name: '外观预设', exact: true }).click()
await dialog2.locator('[data-up-section]').waitFor({ timeout: 30000 })
await page.waitForFunction(
  () => {
    const imgs = [...document.querySelectorAll('[data-up-cover]')]
    return imgs.length >= 1 && imgs.every(img => img.complete && img.naturalWidth > 0)
  },
  { timeout: 15000 },
).catch(() => {})
// 等异步封面覆盖完成（初始是 demo 自动 SVG，须等到库版本手设 PNG 上墙）
await page.waitForFunction(
  pngPrefix => {
    const card = [...document.querySelectorAll('[data-up-card]')].find(c => c.textContent?.includes('默认') === true)
    const img = card?.querySelector('[data-up-cover]')
    return img !== null && img.getAttribute('src')?.startsWith(pngPrefix) === true
  },
  'data:image/png',
  { timeout: 15000 },
).catch(() => {})
const shadowCard = dialog2.locator('[data-up-card]', { hasText: '默认' }).first()
const coverSrc = await shadowCard.locator('[data-up-cover]').evaluate(img => img.getAttribute('src'))
check('#97 库遮蔽卡片显示手设封面（非自动 SVG）', coverSrc !== null && coverSrc.startsWith('data:image/png'))
const shadowDesc = await shadowCard.locator('[data-up-card-desc]').innerText()
check(`#97 库遮蔽卡片徽标 = 我的预设（实际「${shadowDesc}」）`, shadowDesc.includes('我的预设'))
// 清理：删除库遮蔽预设（恢复 demo-only，避免污染后续脚本）
const shadowClean = await fetch(`${BASE}/ui-presets/presets/default`, { method: 'DELETE' })
check('#97 清理库遮蔽预设', shadowClean.ok)

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
