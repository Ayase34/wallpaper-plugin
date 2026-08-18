// M2-3 AI bridge e2e：Node half 侧改写 active.json（模拟 preset_apply）→
// 浏览器无需任何交互，轮询桥在数秒内应用新预设（body 变色）。
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

// 0. 状态端点：AI 工具注册状态 + 档位
const status = await (await fetch(`${BASE}/ui-presets/status`)).json()
console.log('status:', JSON.stringify(status))
check('AI 工具已注册（toolsRegistered=true）', status.toolsRegistered === true)
check('档位缺省 standard', status.tier === 'standard')

// 1. 模拟 preset_apply（Node half 侧直接写 active.json，revision 自增）
const bodyBefore = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
console.log('body before:', bodyBefore)
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: 'default' }),
})

// 2. 无任何交互，等待轮询桥生效（≤5s）
let bodyApplied = ''
for (let i = 0; i < 25; i += 1) {
  bodyApplied = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  if (bodyApplied === 'rgb(240, 248, 255)' || bodyApplied === 'rgb(6, 14, 30)') break
  await page.waitForTimeout(200)
}
console.log('body after ai apply:', bodyApplied)
check(`AI 应用即时生效（body=${bodyApplied}）`, bodyApplied === 'rgb(240, 248, 255)' || bodyApplied === 'rgb(6, 14, 30)')

// 3. 重复应用同预设 → 无扰动（id 一致跳过）
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: 'default' }),
})
await page.waitForTimeout(2500)
const bodyAgain = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`重复应用无扰动（${bodyAgain}）`, bodyAgain === bodyApplied)

// 4. 引擎状态已同步（活动 id 与文件一致——单一事实源）
const active = await (await fetch(`${BASE}/ui-presets/active`)).json()
console.log('active.json:', JSON.stringify(active))
check('active.json 与引擎一致', active.activePresetId === 'default' && Number.isInteger(active.revision) && active.revision >= 1)

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
