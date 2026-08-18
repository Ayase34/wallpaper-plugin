// M5-2 跨窗口同步 e2e：两个页面（同源同浏览器上下文）——
// A 窗口应用预设 → B 窗口预设墙 ✓ 标记即时出现（BroadcastChannel，不等轮询）；
// A 窗口保存新建预设 → B 窗口预设墙自动刷新出现新卡片。
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
const context = await browser.newContext()
const pageA = await context.newPage()
const pageB = await context.newPage()
let pass = 0
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`)
  if (!cond) process.exitCode = 1
  if (cond) pass += 1
}
const errors = []
pageA.on('pageerror', e => errors.push('A: ' + e.message))
pageB.on('pageerror', e => errors.push('B: ' + e.message))

// 打开两个窗口到外观预设页
const openSection = async (page) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
  await page.getByRole('button', { name: '设置', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '设置' })
  await dialog.waitFor({ timeout: 30000 })
  await dialog.getByRole('button', { name: '外观预设', exact: true }).click()
  await dialog.locator('[data-up-section]').waitFor({ timeout: 30000 })
  return dialog
}
const dialogA = await openSection(pageA)
const dialogB = await openSection(pageB)
await pageA.waitForTimeout(500)
await pageB.waitForTimeout(500)

// 1. A 窗口应用出厂预设（默认）→ B 窗口 ✓ 标记即时出现（BroadcastChannel 秒级）
const neonA = dialogA.locator('[data-up-card]', { hasText: '默认' }).first()
await neonA.getByRole('button', { name: '应用' }).click({ force: true })
await neonA.getByText('✓ 当前应用').waitFor({ timeout: 10000 })
const neonB = dialogB.locator('[data-up-card]', { hasText: '默认' }).first()
await neonB.getByText('✓ 当前应用').waitFor({ timeout: 5000 })
check('B 窗口即时看到 A 应用出厂预设（✓ 标记 ≤5s）', await neonB.getByText('✓ 当前应用').count() === 1)
const bgB = await pageB.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`B 窗口 body 已变 默认 底色（${bgB}）`, bgB === 'rgb(240, 248, 255)' || bgB === 'rgb(6, 14, 30)')

// 2. A 窗口保存新建预设 → B 窗口预设墙自动刷新出现新卡片
const oceanCardA = dialogA.locator('[data-up-card]', { hasText: '默认' }).first()
await oceanCardA.getByRole('button', { name: '应用' }).click({ force: true })
await oceanCardA.getByText('✓ 当前应用').waitFor({ timeout: 10000 })
await dialogA.getByRole('button', { name: '打开美化工作室 →' }).click()
const studioA = pageA.locator('[data-up-studio]')
await studioA.waitFor({ timeout: 10000 })
await studioA.locator('[data-up-card]', { hasText: '默认' }).first().getByRole('button', { name: '编辑' }).click()
await studioA.getByLabel('预设名称').waitFor({ timeout: 10000 })
// 改名并保存（强制另存为 default-custom）
const nameInput = studioA.getByLabel('预设名称')
await nameInput.click()
await pageA.keyboard.press('Control+A')
await pageA.keyboard.type('跨窗口同步测试')
await studioA.getByRole('button', { name: '保存' }).click()
await studioA.locator('[data-up-studio-status]').getByText(/已另存为/).waitFor({ timeout: 15000 })
// B 窗口预设墙应自动出现新卡片（无需刷新）
const newCardB = dialogB.locator('[data-up-card]', { hasText: '跨窗口同步测试' })
await newCardB.waitFor({ timeout: 5000 })
check('B 窗口预设墙自动刷新出现新保存预设', await newCardB.count() === 1)

// 3. B 窗口删除该预设 → A 窗口卡片消失
await dialogB.locator('[data-up-card]', { hasText: '跨窗口同步测试' }).waitFor({ timeout: 5000 })
const lib = await (await fetch(`${BASE}/ui-presets/presets`)).json()
const savedId = (lib.presets ?? []).find(p => p.name.includes('跨窗口同步测试') || p.id === 'default-custom')?.id
if (savedId !== undefined) {
  // 通过 B 窗口工作室内删除（走 deletePreset → broadcastLibrary）
  await studioA.getByRole('button', { name: '‹ 返回' }).click()
  await studioA.waitFor({ state: 'detached', timeout: 10000 })
  await dialogB.getByRole('button', { name: '打开美化工作室 →' }).click()
  const studioB = pageB.locator('[data-up-studio]')
  await studioB.waitFor({ timeout: 10000 })
  // 保存强制另存为后名字带「（自定义）」后缀——用卡片文本定位（desc 含 id）
  const studioCard = studioB.locator('[data-up-card]', { hasText: 'default-custom' }).first()
  await studioCard.waitFor({ timeout: 10000 })
  await studioCard.getByRole('button', { name: '删除' }).click()
  // #58：删除确认是应用内模态——点「删除」执行
  const confirmBox = studioB.locator('[data-up-confirm]')
  await confirmBox.waitFor({ timeout: 10000 })
  await confirmBox.getByRole('button', { name: '删除' }).click()
  await confirmBox.waitFor({ state: 'detached', timeout: 10000 })
  await pageB.waitForTimeout(800)
  // A 窗口预设墙应移除该卡片（library 广播）
  await dialogA.locator('[data-up-card]', { hasText: '跨窗口同步测试' }).waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
  check('A 窗口预设墙自动移除已删除预设', (await dialogA.locator('[data-up-card]', { hasText: '跨窗口同步测试' }).count()) === 0)
} else {
  check('A 窗口预设墙自动移除已删除预设', false)
}

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
