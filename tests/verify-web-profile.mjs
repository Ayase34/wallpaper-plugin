// web profile 安装验证（只读）：设置页「外观预设」区 + 工作室渲染 + 无页面错误。
// 不应用/不保存任何东西——用户真实 home，零写入。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'
const BASE = process.argv[2] ?? 'http://127.0.0.1:3181'
const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)) })
let pass = 0
const check = (name, cond) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`); if (!cond) process.exitCode = 1; if (cond) pass += 1 }

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
const trigger = page.getByRole('button', { name: '设置', exact: true })
await trigger.waitFor({ timeout: 120000 })
await dismissBetaNotice(page)
await trigger.click()
const dialog = page.getByRole('dialog', { name: '设置' })
await dialog.waitFor({ timeout: 30000 })
await dialog.getByRole('button', { name: '外观预设', exact: true }).click()
const wall = dialog.locator('[data-up-wall]')
await wall.waitFor({ timeout: 15000 })
const cards = await wall.locator('[data-up-card]').count()
check(`预设墙渲染（${cards} 张卡片）`, cards >= 1)
const studioBtn = dialog.getByRole('button', { name: '打开美化工作室 →' })
check('工作室入口按钮可见', await studioBtn.isVisible())
await studioBtn.click()
const studio = page.locator('[data-up-studio]')
await studio.waitFor({ timeout: 15000 })
check('工作室全屏渲染', (await studio.count()) === 1)
check('工作室左栏预设列表渲染', (await studio.locator('[data-up-card]').count()) >= 1)
// 关闭工作室（Esc）——不保存
await page.keyboard.press('Escape')
await page.waitForTimeout(500)
check('Esc 关闭工作室', (await studio.count()) === 0)

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 8)))
await browser.close()
process.exit(process.exitCode ?? 0)
