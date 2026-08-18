// M2-1 旋钮抽象层 e2e：旋钮层呈现 / 主色束一次全改（含预览联动）/ 明暗分别设置 /
// 高级令牌默认折叠 / 字体档 / 束粒度撤销 / 保存落盘束令牌。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
const BRAND = '#ff8800' // rgb(255, 136, 0)
const BG_DARK = '#224466' // rgb(34, 68, 102)

await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})
// 清库（保留内置；删历次测试残留）
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

// #74：旋钮层编辑入口已注释（AI 接管）——验证入口隐藏 + 原始令牌直编链路仍可用
const demoCard = studio.locator('[data-up-card]', { hasText: '默认' }).first()
await demoCard.getByRole('button', { name: '编辑' }).click()
await studio.getByLabel('预设名称').waitFor({ timeout: 10000 })
check('旋钮层已移除（无 [data-up-knob-category]）', await studio.locator('[data-up-knob-category]').count() === 0)
check('旋钮行已移除（无 [data-up-knob]）', await studio.locator('[data-up-knob]').count() === 0)
check('「空间定位」等旋钮类别不可见', await studio.getByText('空间定位').count() === 0)

// 原始令牌区可展开 → 直接编辑仍生效（预览联动）
check('原始令牌默认折叠（无令牌行）', (await studio.locator('[data-up-token-row]').count()) === 0)
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(300)
const bgLight = studio.getByLabel('--dsw-alias-bg-base light 值').first()
await bgLight.waitFor({ timeout: 10000 })
await typeInto(bgLight, '#123456')
await studio.locator('[data-up-studio-status]').getByText('预览中（未保存）').waitFor({ timeout: 5000 })
await page.waitForTimeout(400)
// #75：预览已移除——草稿全局生效（body 即预览）
const draftBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`原始令牌直编仍生效（body=${draftBg}）`, draftBg === 'rgb(18, 52, 86)' || draftBg === 'rgb(6, 14, 30)')

// 保存 → 落盘令牌
await studio.getByRole('button', { name: '保存' }).click()
await studio.locator('[data-up-studio-status]').getByText(/已另存为「默认（自定义）」/).waitFor({ timeout: 15000 })
const saved = await (await fetch(`${BASE}/ui-presets/presets/default-custom`)).json()
check('落盘含直编令牌', saved.preset?.tokens?.['--dsw-alias-bg-base']?.light === '#123456')

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
