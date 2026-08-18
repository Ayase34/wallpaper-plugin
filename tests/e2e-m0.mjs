// M0 端到端验证：设置入口 → 预设墙 → 应用/还原（实时主题变化）→ 全屏工作室开合。
// 环境变量：UIP_PLAYWRIGHT_DIR / UIP_CHROMIUM 覆盖默认浏览器路径（评审 P1-5 修复）。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

// 前置清理：清掉残留活动预设（避免上次测试/手动操作污染初始状态）。
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})

const browser = await launchBrowser()
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

let pass = 0
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`)
  if (!cond) process.exitCode = 1
  if (cond) pass += 1
}

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })

// 1. boot settle + 打开设置
const trigger = page.getByRole('button', { name: '设置', exact: true })
await trigger.waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
await trigger.click()
const dialog = page.getByRole('dialog', { name: '设置' })
await dialog.waitFor({ timeout: 30000 })

// 2. 设置导航出现「外观预设」并点击
const nav = dialog.getByRole('button', { name: '外观预设', exact: true })
await nav.waitFor({ timeout: 30000 })
await nav.click()
// M3-2 适配：预设墙含 demo + 库预设——用卡片定位避免 strict mode 多匹配
const oceanCard = dialog.locator('[data-up-card]', { hasText: '默认' }).first()
await oceanCard.waitFor({ timeout: 30000 })
check('设置导航出现「外观预设」且预设墙渲染', errors.length === 0)

// 3. 应用示例预设 → body 背景色变化（overrideTokens 实时生效）
const bgBefore = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
// #50 适配：顶部「打开美化工作室」已是首个主色按钮——卡片应用按钮改用卡片内定位
const applyBtn = oceanCard.getByRole('button', { name: '应用' }).first()
await applyBtn.click()
await dialog.getByText('✓ 当前应用').waitFor({ timeout: 10000 })
await page.waitForTimeout(300)
const bgApplied = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`应用后 body 背景变化 (${bgBefore} → ${bgApplied})`, bgBefore !== bgApplied)

// 4. 还原默认 → 背景恢复
const revertBtn = dialog.locator('[data-up-btn]', { hasText: '还原默认' }).first()
await revertBtn.click()
await page.waitForTimeout(300)
const bgReverted = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`还原后背景恢复 (${bgApplied} → ${bgReverted})`, bgReverted === bgBefore)

// 5. 打开全屏工作室（hash 路由）
const openStudio = dialog.getByRole('button', { name: '打开美化工作室 →' })
await openStudio.click()
const studio = page.locator('[data-up-studio]')
await studio.waitFor({ timeout: 10000 })
const hash = await page.evaluate(() => window.location.hash)
check(`全屏工作室出现且 hash=${hash}`, hash === '#studio=presets')

// 6. 工作室内应用仍生效（M1 布局：应用按钮在左栏预设卡片内）
await studio.locator('[data-up-card]', { hasText: '默认' }).first()
  .getByRole('button', { name: '应用' }).click()
await page.waitForTimeout(300)
const bgStudio = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`工作室应用生效 (${bgBefore} → ${bgStudio})`, bgStudio !== bgBefore)

// 7. 返回 → 全屏层消失
await studio.getByRole('button', { name: '‹ 返回' }).click()
await studio.waitFor({ state: 'detached', timeout: 10000 })
const hashAfter = await page.evaluate(() => window.location.hash)
check(`返回后工作室关闭且 hash 清除 (${hashAfter})`, hashAfter === '')

if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
console.log(`\n${pass} checks passed`)
await browser.close()
process.exit(process.exitCode ?? 0)
