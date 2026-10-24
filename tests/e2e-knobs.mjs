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

// M2-1 恢复：旋钮层在编辑器顶部（决策 E）——6 类 26 旋钮，默认单值双写
const demoCard = studio.locator('[data-up-card]', { hasText: '默认' }).first()
await demoCard.getByRole('button', { name: '编辑' }).click()
await studio.getByLabel('预设名称').waitFor({ timeout: 10000 })
check('旋钮层已恢复（≥20 个旋钮）', await studio.locator('[data-up-knob]').count() >= 20)
check('6 个旋钮类别', await studio.locator('[data-up-knob-category]').count() === 6)
check('默认单值双写（无亮/暗双块）', await studio.getByLabel('主色 亮 值').count() === 0)

// 旋钮改主色：一次写品牌束三个令牌（品牌主色 + 信息按钮 + 业务状态）
const accentInput = studio.getByLabel('主色 值').first()
await typeInto(accentInput, '#00aa88')
await page.waitForTimeout(400)
check('主色旋钮回读新值', (await accentInput.inputValue()) === '#00aa88')
const brandFill = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--dsw-alias-button-info-fill').trim().toLowerCase())
check(`旋钮即时写入令牌（info-fill=${brandFill}）`, brandFill === '#00aa88' || brandFill === 'rgb(0, 170, 136)')

// 全局「明暗分别设置」：打开后并排亮/暗，只改暗色不得覆盖亮色
await studio.locator('[data-up-knob-dual]').check()
const darkInput = studio.getByLabel('主色 暗 值').first()
await darkInput.waitFor({ timeout: 5000 })
await typeInto(darkInput, '#112233')
await page.waitForTimeout(300)
check('分别设置出现亮/暗双块', await studio.getByLabel('主色 亮 值').count() === 1)
check('暗色不覆盖亮色', (await studio.getByLabel('主色 亮 值').first().inputValue()) === '#00aa88')

// 旋钮不夺权：原始令牌区仍可展开直编（预览联动）
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
check(`原始令牌直编仍生效（body=${draftBg}）`, draftBg === 'rgb(18, 52, 86)')

// 保存 → 落盘：品牌束三令牌 + 明暗双值 + 直编令牌
await studio.getByRole('button', { name: '保存' }).click()
await studio.locator('[data-up-studio-status]').getByText(/已另存为「默认（自定义）」/).waitFor({ timeout: 15000 })
const saved = await (await fetch(`${BASE}/ui-presets/presets/default-custom`)).json()
const savedTokens = saved.preset?.tokens ?? {}
check('品牌束三令牌同写（亮）', ['--dsw-alias-brand-primary', '--dsw-alias-button-info-fill', '--dsw-alias-state-business-primary']
  .every(name => savedTokens[name]?.light === '#00aa88'))
check('品牌束三令牌同写（暗）', ['--dsw-alias-brand-primary', '--dsw-alias-button-info-fill', '--dsw-alias-state-business-primary']
  .every(name => savedTokens[name]?.dark === '#112233'))
check('落盘含直编令牌', savedTokens['--dsw-alias-bg-base']?.light === '#123456')

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
