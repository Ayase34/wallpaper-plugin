// 重启持久化验证：页面加载后不点击任何操作，body 背景应已是出厂预设色。
// 方案无关：#82 唯一出厂预设 默认 bg-base light=rgb(240,248,255) / dark=rgb(6,14,30)。
// UIP_TARGET_BG 可覆盖目标背景色（精确断言用）。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
const TARGET_BG = process.env.UIP_TARGET_BG ?? null
const DEMO_BGS = ['rgb(240, 248, 255)', 'rgb(6, 14, 30)']

const browser = await launchBrowser()
const page = await browser.newPage()
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
// 等 boot settle（设置按钮出现 = UI 已渲染）
await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
// 等引擎 adoptPersisted 完成（最长 5s）
const expected = TARGET_BG !== null ? [TARGET_BG] : DEMO_BGS
let bg = ''
for (let i = 0; i < 25; i += 1) {
  bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  if (expected.includes(bg)) break
  await page.waitForTimeout(200)
}
console.log(`body background after load: ${bg}`)
console.log(expected.includes(bg) ? 'PASS 重启后自动恢复活动预设（加载页即带美化）' : 'FAIL 未恢复')
await browser.close()
process.exit(expected.includes(bg) ? 0 : 1)
