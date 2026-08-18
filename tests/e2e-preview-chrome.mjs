// 修复轮 #20：工作室 chrome 钉定——编辑草稿时仅预览窗口（模拟器）变色，
// 工作室自身 UI（背景/标题文字）保持原貌；关闭工作室后草稿仍全局生效（所见即所得保留）。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
const NEW_BG_LIGHT = '#123456'
const NEW_BG_DARK = '#654321'

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

/** 真实键盘输入（playwright fill 偶发不触发 React onChange）。 */
async function typeInto(locator, text) {
  await locator.click()
  await locator.press('Control+A')
  await locator.pressSequentially(text)
}

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
await page.getByRole('button', { name: '设置', exact: true }).click()
await page.getByRole('dialog', { name: '设置' }).waitFor({ timeout: 30000 })
await page.getByRole('button', { name: '外观预设', exact: true }).click()
await page.getByRole('button', { name: '打开美化工作室 →' }).click()
const studio = page.locator('[data-up-studio]')
await studio.waitFor({ timeout: 10000 })
await studio.locator('[data-up-card]').first().waitFor({ timeout: 10000 })

const readStudioBg = () => studio.evaluate(el => getComputedStyle(el).backgroundColor)
const readTitleColor = () => studio.locator('[data-up-studio-title]').evaluate(el => getComputedStyle(el).color)
const readBodyBg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor)

const chromeBg0 = await readStudioBg()
const title0 = await readTitleColor()
check('工作室背景已着色（初始）', chromeBg0 !== 'rgba(0, 0, 0, 0)')

// 编辑 默认（唯一出厂预设）→ 同时修改 bg-base 与 label-primary 的 light/dark 双值（对活动方案无关）
const demoCard = studio.locator('[data-up-card]', { hasText: '默认' }).first()
await demoCard.getByRole('button', { name: '编辑' }).click()
// M2-1：高级令牌默认折叠——展开后才可用令牌输入
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(200)
const bgLight = studio.getByLabel('--dsw-alias-bg-base light 值').first()
const bgDark = studio.getByLabel('--dsw-alias-bg-base dark 值').first()
await bgLight.waitFor({ timeout: 10000 })
await typeInto(bgLight, NEW_BG_LIGHT)
await typeInto(bgDark, NEW_BG_DARK)
const lpLight = studio.getByLabel('--dsw-alias-label-primary light 值').first()
const lpDark = studio.getByLabel('--dsw-alias-label-primary dark 值').first()
await lpLight.waitFor({ timeout: 10000 })
await typeInto(lpLight, '#ff0000')
await typeInto(lpDark, '#00ff00')
await studio.locator('[data-up-studio-status]').getByText('预览中（未保存）').waitFor({ timeout: 5000 })
await page.waitForTimeout(500)

// #75：预览窗口已移除——草稿全局生效（body = 真实界面即预览）；chrome 钉定保持原貌
const bodyBgDraft = await readBodyBg()
check(`草稿全局生效（body=${bodyBgDraft}）`, bodyBgDraft === 'rgb(18, 52, 86)' || bodyBgDraft === 'rgb(101, 67, 33)')
const chromeBg1 = await readStudioBg()
check(`工作室背景保持原貌（${chromeBg0} → ${chromeBg1}）`, chromeBg1 === chromeBg0)
const title1 = await readTitleColor()
check(`标题文字色保持原貌（${title0} → ${title1}）`, title1 === title0)

// 关闭工作室（不保存）→ 草稿仍全局生效（所见即所得保留）：body 背景 = 新 dark 值
await studio.getByRole('button', { name: '‹ 返回' }).click()
await studio.waitFor({ state: 'detached', timeout: 10000 })
await page.waitForTimeout(400)
const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
// 活动方案无关：body 背景应等于两个新值之一（spike 应用为浅色 → 通常 rgb(18, 52, 86)）
const draftApplied = bodyBg === 'rgb(18, 52, 86)' || bodyBg === 'rgb(101, 67, 33)'
check(`关闭后草稿仍全局生效（body=${bodyBg}）`, draftApplied)

if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
console.log(`\n${pass} checks passed`)
await browser.close()
process.exit(process.exitCode ?? 0)
