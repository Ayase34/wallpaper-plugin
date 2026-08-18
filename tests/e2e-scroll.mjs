// 修复轮 #30：编辑器中栏滚轮滚动——旋钮层 + 高级区超高时滚轮可下滑。
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
await dialog.getByRole('button', { name: '打开美化工作室 →' }).click()
const studio = page.locator('[data-up-studio]')
await studio.waitFor({ timeout: 10000 })
await studio.locator('[data-up-card]').first().waitFor({ timeout: 10000 })

// 编辑 demo → 展开高级令牌（内容超高：旋钮层 6 类 + 369 令牌分组）
await studio.locator('[data-up-card]', { hasText: '默认' }).first().getByRole('button', { name: '编辑' }).click()
await studio.getByLabel('预设名称').waitFor({ timeout: 10000 })
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(300)

const main = studio.locator('[data-up-editor-col]')
await main.waitFor({ timeout: 10000 })

// 1. 中栏可滚动（overflowY auto）
const overflowY = await main.evaluate(el => getComputedStyle(el).overflowY)
check(`中栏 overflowY=auto（${overflowY}）`, overflowY === 'auto')

// 2. 内容超高（scrollHeight > clientHeight）
const dims = await main.evaluate(el => ({ sh: el.scrollHeight, ch: el.clientHeight }))
check(`内容超高可滚动（${dims.sh} > ${dims.ch}）`, dims.sh > dims.ch)

// 3. 滚轮下滑 → scrollTop 增加（默认位置 0）
const before = await main.evaluate(el => el.scrollTop)
await main.hover()
await page.mouse.wheel(0, 600)
await page.waitForTimeout(300)
const after = await main.evaluate(el => el.scrollTop)
check(`滚轮下滑生效（${before} → ${after}）`, after > before)

// 4. 滚到接近底部 → 高级令牌分组可见（如 背景 组头）
await page.mouse.wheel(0, 3000)
await page.waitForTimeout(300)
const groupHeadVisible = await studio.locator('[data-up-group-head]').first().isVisible().catch(() => false)
check('滚动后分组内容可见', groupHeadVisible)

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
