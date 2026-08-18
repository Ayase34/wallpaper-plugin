// M3-2 简洁版打磨 e2e：卡片化预设墙（网格 + 库预设并入 + 封面）、整卡一键切换、
// 空态引导（库为空出现；标准版含导入入口）、还原默认全局按钮、简洁版档位下墙仍可用。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

// 前置：清活动 + 清库（保留 demo）——本用例自己重建一个库预设验证并入
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})
const existingList = await (await fetch(`${BASE}/ui-presets/presets`)).json()
for (const item of existingList.presets ?? []) {
  await fetch(`${BASE}/ui-presets/presets/${encodeURIComponent(item.id)}`, { method: 'DELETE' }).catch(() => {})
}

// 建一个库预设（暖纸变体，浅色）——验证库预设并入预设墙 + 异步封面
const LIB_PRESET = {
  schemaVersion: 1,
  edition: 'standard',
  id: 'wall-lib-test',
  name: '库测试·暖纸',
  description: 'M3-2 库预设并入测试',
  targetDshVersion: '0.1.0-rc.5',
  tokens: {
    '--dsw-alias-bg-base': { light: 'rgb(252, 246, 234)', dark: 'rgb(38, 32, 22)' },
    '--dsw-alias-label-primary': { light: 'rgb(70, 58, 40)', dark: 'rgb(240, 228, 205)' },
  },
}
await fetch(`${BASE}/ui-presets/presets/wall-lib-test`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ preset: LIB_PRESET }),
})

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
await page.getByRole('button', { name: '设置', exact: true }).click()
const dialog = page.getByRole('dialog', { name: '设置' })
await dialog.waitFor({ timeout: 30000 })
await dialog.getByRole('button', { name: '外观预设', exact: true }).click()
await dialog.locator('[data-up-section]').waitFor({ timeout: 30000 })
// 等封面加载（demo 同步 + 库预设异步）
await page.waitForFunction(
  () => {
    const imgs = [...document.querySelectorAll('[data-up-cover]')]
    return imgs.length >= 2 && imgs.every(img => img.complete && img.naturalWidth > 0)
  },
  { timeout: 15000 },
).catch(() => {})
await page.waitForTimeout(300)

// 1. 卡片化：demo 1（#82 唯一出厂 默认）+ 库 1 = 2 卡；每卡带封面；库预设可见
const cardCount = await dialog.locator('[data-up-card]').count()
check(`预设墙卡片 = demo1+库1（实际 ${cardCount}）`, cardCount === 2)
check('库预设「库测试·暖纸」并入预设墙', await dialog.getByText('库测试·暖纸', { exact: false }).count() >= 1)
check('库预设封面已生成（naturalWidth>0）', await dialog.locator('[data-up-card]', { hasText: '库测试·暖纸' }).locator('[data-up-cover]').evaluate(img => img.naturalWidth > 0))
const wallDisplay = await dialog.locator('[data-up-wall]').evaluate(el => getComputedStyle(el).display)
check(`预设墙为网格布局（display=${wallDisplay}）`, wallDisplay === 'grid')

// 2. 整卡一键切换：点击库预设卡片 → 应用（body 变暖纸浅色）
await dialog.locator('[data-up-card]', { hasText: '库测试·暖纸' }).click({ force: true })
await dialog.locator('[data-up-card]', { hasText: '库测试·暖纸' }).getByText('✓ 当前应用').waitFor({ timeout: 10000 })
await page.waitForTimeout(400)
const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`整卡点击应用生效（body=${bodyBg}）`, bodyBg === 'rgb(252, 246, 234)' || bodyBg === 'rgb(38, 32, 22)')
check('库预设卡片标记当前应用', await dialog.locator('[data-up-card]', { hasText: '库测试·暖纸' }).getByText('✓ 当前应用').count() === 1)

// 3. 已应用卡片按钮文本切换（已应用）
check('应用按钮变「已应用」', await dialog.locator('[data-up-card]', { hasText: '库测试·暖纸' }).getByRole('button', { name: '已应用' }).count() === 1)

// 4. 还原默认（全局按钮）→ 恢复出厂外观
await dialog.locator('[data-up-btn]', { hasText: '还原默认' }).first().click({ force: true })
await page.waitForTimeout(600)
const bgReverted = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`还原默认恢复（body=${bgReverted}）`, bgReverted === 'rgb(255, 255, 255)' || bgReverted === 'rgb(21, 21, 23)')

// 5. 删除库预设 → 刷新页面（外部删除后重进设置页重新拉取列表）→ 空态引导出现
await fetch(`${BASE}/ui-presets/presets/wall-lib-test`, { method: 'DELETE' })
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
await page.getByRole('button', { name: '设置', exact: true }).click()
const dialog2 = page.getByRole('dialog', { name: '设置' })
await dialog2.waitFor({ timeout: 30000 })
await dialog2.getByRole('button', { name: '外观预设', exact: true }).click()
await dialog2.locator('[data-up-section]').waitFor({ timeout: 30000 })
await page.waitForTimeout(600)
check('库为空时出现空态引导', await dialog2.locator('[data-up-empty]').count() === 1)
check('空态引导含导入入口（标准版）', await dialog2.locator('[data-up-empty]').getByRole('button', { name: /导入预设文件/ }).count() === 1)

// 6. 统一标准版：工作室入口常驻 + 整卡切换仍可用（M4 简化——档位切换行已移除）
check('无「对外档位」切换行', await dialog2.locator('[data-up-tier]').count() === 0)
check('工作室入口常驻（标准版统一）', await dialog2.getByRole('button', { name: '打开美化工作室 →' }).count() === 1)
const deepseek = dialog2.locator('[data-up-card]', { hasText: '默认' }).first()
await deepseek.click({ force: true })
await deepseek.getByText('✓ 当前应用').waitFor({ timeout: 10000 })
await page.waitForTimeout(400)
const bgDeepseek = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`整卡切换生效（body=${bgDeepseek}）`, bgDeepseek === 'rgb(240, 248, 255)' || bgDeepseek === 'rgb(6, 14, 30)')

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
