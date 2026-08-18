// M4 简化 e2e（原 e2e-tier 改造）：对外档位切换行已移除（用户拍板——入口统一标准版）。
// 验证：无「对外档位」行 / 工作室入口常驻 / 重启后仍标准版（不再受 config 档位影响）/
// diff 告警横幅保留。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

// 前置：清活动 + 清库 + 故意把 config 档位写成 simple（验证 UI 不再受其影响）
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})
await fetch(`${BASE}/ui-presets/config`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ tier: 'simple' }),
}).catch(() => {})
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

const openSection = async () => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
  const trigger = page.getByRole('button', { name: '设置', exact: true })
  await trigger.waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: '设置' })
  await dialog.waitFor({ timeout: 30000 })
  await dialog.getByRole('button', { name: '外观预设', exact: true }).click()
  await dialog.locator('[data-up-section]').waitFor({ timeout: 30000 })
  return dialog
}

// 1. 无档位切换行（data-up-tier 已移除）
let dialog = await openSection()
await page.waitForTimeout(400)
check('无「对外档位」切换行', await dialog.locator('[data-up-tier]').count() === 0)
check('无档位切换按钮（简洁版/标准版）', await dialog.getByRole('button', { name: /简洁版（一键换肤）|标准版（深度编辑）/ }).count() === 0)

// 2. 标准版入口常驻：工作室入口 + 还原默认
check('工作室入口常驻', await dialog.getByRole('button', { name: '打开美化工作室 →' }).count() === 1)
check('还原默认按钮可见', await dialog.getByRole('button', { name: '还原默认' }).count() === 1)

// 3. 即使 config 档位是 simple，UI 仍是标准版（不再读档位）
check('config=simple 不影响 UI（仍标准版入口）', await dialog.getByRole('button', { name: '打开美化工作室 →' }).count() === 1)

// 3b. 空态引导（库为空时）统一含导入入口
check('空态引导含导入入口（统一标准版）', await dialog.locator('[data-up-empty]').getByRole('button', { name: /导入预设文件/ }).count() === 1)

// 4. diff 告警横幅保留：构造旧版本预设并应用 → 横幅出现
const oldPreset = {
  schemaVersion: 1,
  id: 'old-version-preset',
  name: '旧版本预设',
  edition: 'standard',
  targetDshVersion: '0.0.9',
  tokens: { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' } },
}
await fetch(`${BASE}/ui-presets/presets/old-version-preset`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ preset: oldPreset }),
})
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: 'old-version-preset' }),
})
dialog = await openSection()
await page.waitForTimeout(800)
const banner = dialog.locator('[data-up-banner]')
check('diff 告警横幅出现', await banner.count() === 1)
const bannerText = await banner.innerText().catch(() => '')
check(`横幅含旧版本号（${bannerText.slice(0, 40)}）`, bannerText.includes('0.0.9'))

// 5. 重载（重启模拟）→ 仍标准版（无档位持久化逻辑）
dialog = await openSection()
await page.waitForTimeout(400)
check('重启后仍标准版（工作室入口在）', await dialog.getByRole('button', { name: '打开美化工作室 →' }).count() === 1)
check('重启后仍无档位切换行', await dialog.locator('[data-up-tier]').count() === 0)

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
