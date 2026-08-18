// M1 修复验证：① 侧栏「外观预设」选项卡 → 打开工作室（#59：通用设置快捷行已移除）；② 无活动预设时「从当前外观新建」不报错。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})

const browser = await launchBrowser()
const page = await browser.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))

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

// ① #59：通用设置里已无「外观预设」快捷行（只保留侧栏选项卡入口）
check('通用设置无「外观预设」快捷行', await dialog.locator('[data-up-row]').count() === 0)
await dialog.getByRole('button', { name: '外观预设', exact: true }).click()
await dialog.getByRole('button', { name: '打开美化工作室 →' }).click()
const studio = page.locator('[data-up-studio]')
await studio.waitFor({ timeout: 10000 })
check('侧栏选项卡 → 打开全屏工作室', errors.length === 0)
const hash = await page.evaluate(() => window.location.hash)
check(`hash 已写入 (${hash})`, hash === '#studio=presets')

// ② 无活动预设时「从当前外观新建」
await studio.getByRole('button', { name: '从当前外观新建' }).click()
await studio.getByLabel('预设名称').waitFor({ timeout: 10000 })
const nameValue = await studio.getByLabel('预设名称').inputValue()
check(`「从当前外观新建」创建默认外观草稿（名称=${nameValue}）`, nameValue === '从默认外观新建')
const statusText = await studio.locator('[data-up-studio-status]').innerText()
check(`提示语说明默认外观 (${statusText.includes('默认外观')})`, statusText.includes('默认外观'))

// 清理：关闭工作室
await studio.getByRole('button', { name: '‹ 返回' }).click()
await studio.waitFor({ state: 'detached', timeout: 10000 })

if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
console.log(`\n${pass} checks passed`)
await browser.close()
process.exit(process.exitCode ?? 0)
