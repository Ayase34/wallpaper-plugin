// #75 预览窗口已移除（决策 #75：草稿全局生效——真实界面即预览，mock 预览冗余）。
// 本脚本从「预览明暗切换」退役为「预览已移除 + 草稿全局生效」验证。
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

// 1. 预览面板与明暗切换按钮已移除
check('预览面板已移除（无 [data-up-preview-panel]）', await studio.locator('[data-up-preview-panel]').count() === 0)
check('明暗切换按钮已移除（无 浅色/深色）', await studio.locator('[data-up-preview]').count() === 0)

// 2. 编辑 bg-base → 草稿全局生效（body 即预览），无需任何预览组件
await studio.locator('[data-up-card]', { hasText: '默认' }).first().getByRole('button', { name: '编辑' }).click()
await studio.getByLabel('预设名称').waitFor({ timeout: 10000 })
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(300)
const bgLight = studio.getByLabel('--dsw-alias-bg-base light 值').first()
await bgLight.waitFor({ timeout: 10000 })
await bgLight.click()
await bgLight.press('Control+A')
await bgLight.pressSequentially('#123456')
await studio.locator('[data-up-studio-status]').getByText('预览中（未保存）').waitFor({ timeout: 5000 })
await page.waitForTimeout(400)
const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`草稿全局生效（body=${bodyBg}）`, bodyBg === 'rgb(18, 52, 86)' || bodyBg === 'rgb(6, 14, 30)')

console.log(`\n${pass} checks passed`)
await browser.close()
process.exit(process.exitCode ?? 0)
