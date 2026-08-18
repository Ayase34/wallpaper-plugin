// M0 重启持久化验证辅助：应用示例预设后退出（active.json 写入）。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

const browser = await launchBrowser()
const page = await browser.newPage()
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
const trigger = page.getByRole('button', { name: '设置', exact: true })
await trigger.waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
await trigger.click()
const dialog = page.getByRole('dialog', { name: '设置' })
await dialog.waitFor({ timeout: 30000 })
await dialog.getByRole('button', { name: '外观预设', exact: true }).click()
// M3-2 适配：预设墙含 demo + 库预设——用卡片定位避免 strict mode 多匹配
// #50 适配：顶部「打开美化工作室」已是首个主色按钮——卡片应用按钮改用卡片内定位
await dialog.locator('[data-up-card]', { hasText: '默认' }).first().waitFor({ timeout: 30000 })
await dialog.locator('[data-up-card]', { hasText: '默认' }).first().getByRole('button', { name: '应用' }).click()
await dialog.getByText('✓ 当前应用').waitFor({ timeout: 10000 })
await page.waitForTimeout(800) // 等 settings 写盘
console.log('applied; waiting for persistence write')
await browser.close()
