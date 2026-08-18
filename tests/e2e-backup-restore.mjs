// #62 端到端：备份还原入口——覆盖保存产生备份 → 工作室左栏「还原备份」按钮 → 交换式还原
// （备份写回 preset.json + 当前版本入 backup.json）→ 可来回还原 → 无备份隐藏 →
// 损坏备份明确报错不崩 → 还原不自动应用 → 全程应用内确认框（无原生 dialog）。
// 环境：#54 隔离——测试进程需继承 DSH_HOME（读写 e2e-home，用户 ~/.dsh 零接触）。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
const DSH = process.env.DSH_HOME ?? join(homedir(), '.dsh')
const PRESETS_DIR = join(DSH, '.ui-presets')
const ID = 'preset-backup-e2e'
const ID2 = 'preset-backup-e2e-2'

const presetFile = (id) => join(PRESETS_DIR, id, 'preset.json')
const backupFile = (id) => join(PRESETS_DIR, id, 'backup.json')
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'))

// ---- 前置：清活动 + 清残留 + 种数据（v1 → 带 backup=v1 的 v2，模拟控制器保存流程） ----
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})
for (const id of [ID, ID2]) {
  await fetch(`${BASE}/ui-presets/presets/${id}`, { method: 'DELETE' }).catch(() => {})
}
const v1 = { schemaVersion: 1, id: ID, name: '备份测试一版', edition: 'standard', tokens: { '--dsw-alias-bg-base': { light: '#111111', dark: '#000000' } } }
const v2 = { ...v1, name: '备份测试二版', tokens: { '--dsw-alias-bg-base': { light: '#222222', dark: '#000000' } } }
await fetch(`${BASE}/ui-presets/presets/${ID}`, {
  method: 'PUT', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ preset: v1 }),
})
await fetch(`${BASE}/ui-presets/presets/${ID}`, {
  method: 'PUT', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ preset: v2, backup: v1 }),
})
const noBackup = { schemaVersion: 1, id: ID2, name: '无备份预设', edition: 'standard', tokens: {} }
await fetch(`${BASE}/ui-presets/presets/${ID2}`, {
  method: 'PUT', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ preset: noBackup }),
})

const browser = await launchBrowser()
const page = await browser.newPage()
const errors = []
const dialogs = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
page.on('dialog', d => { dialogs.push(d.type()); void d.dismiss().catch(() => {}) })

let pass = 0
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`)
  if (!cond) process.exitCode = 1
  if (cond) pass += 1
}

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })

// 打开设置 → 外观预设 → 工作室
const trigger = page.getByRole('button', { name: '设置', exact: true })
await trigger.waitFor({ timeout: 120000 })
await dismissBetaNotice(page)
await trigger.click()
const dialog = page.getByRole('dialog', { name: '设置' })
await dialog.waitFor({ timeout: 30000 })
await dialog.getByRole('button', { name: '外观预设', exact: true }).click()
await dialog.getByRole('button', { name: '打开美化工作室 →' }).waitFor({ timeout: 30000 })
await dialog.getByRole('button', { name: '打开美化工作室 →' }).click()
const studio = page.locator('[data-up-studio]')
await studio.waitFor({ timeout: 10000 })
await studio.locator('[data-up-card]').first().waitFor({ timeout: 10000 })

// 1. 磁盘断言：覆盖保存后 backup.json 保留旧版
const backupOnDisk = await readJson(backupFile(ID))
check(`覆盖保存后 backup.json 保留旧版（name=${backupOnDisk.name}）`, backupOnDisk.name === '备份测试一版')

// 2. 列表携带 hasBackup（Node half meta）
const list = (await (await fetch(`${BASE}/ui-presets/presets`)).json()).presets ?? []
const meta = list.find(p => p.id === ID)
const meta2 = list.find(p => p.id === ID2)
check(`列表 hasBackup=true（${meta?.hasBackup}）`, meta?.hasBackup === true)
check(`无备份预设 hasBackup=false（${meta2?.hasBackup}）`, meta2?.hasBackup === false)

// 3. UI：左栏卡片按钮显隐
const card = studio.locator('[data-up-card]', { hasText: '备份测试二版' }).first()
await card.waitFor({ timeout: 10000 })
check('有备份卡片显示「还原备份」按钮', await card.locator('[data-up-restore-btn]').count() === 1)
const card2 = studio.locator('[data-up-card]', { hasText: '无备份预设' }).first()
check('无备份卡片不显示「还原备份」按钮', await card2.locator('[data-up-restore-btn]').count() === 0)

// 4. 还原：应用内确认框（无原生 dialog）→ 确认 → notice
await card.locator('[data-up-restore-btn]').click()
const confirmBox = studio.locator('[data-up-confirm]')
await confirmBox.waitFor({ timeout: 10000 })
const confirmText = await confirmBox.innerText()
check('确认框出现且说明交换语义', confirmText.includes('备份仅保留一层') && confirmText.includes('不自动应用'))
await confirmBox.getByRole('button', { name: '还原备份' }).click()
await confirmBox.waitFor({ state: 'detached', timeout: 10000 })
await studio.locator('[data-up-studio-status]').getByText(/已还原备份/).waitFor({ timeout: 15000 })
check('还原全程无原生 dialog 事件', dialogs.length === 0)

// 5. 交换断言：preset.json = 旧版，backup.json = 还原前版本
await page.waitForTimeout(500)
const presetAfter = await readJson(presetFile(ID))
const backupAfter = await readJson(backupFile(ID))
check(`preset.json 已还原为旧版（name=${presetAfter.name}）`, presetAfter.name === '备份测试一版')
check(`backup.json 现为还原前版本（name=${backupAfter.name}）`, backupAfter.name === '备份测试二版')

// 6. 还原不自动应用：active.json 仍 null（纯库操作，用户拍板）
const active = await (await fetch(`${BASE}/ui-presets/active`)).json()
check('还原不自动应用（active 仍 null）', active.activePresetId === null)

// 7. 再还原 → 回到二版（单层备份交换可来回切换）
const cardReverted = studio.locator('[data-up-card]', { hasText: '备份测试一版' }).first()
await cardReverted.locator('[data-up-restore-btn]').click()
await studio.locator('[data-up-confirm]').getByRole('button', { name: '还原备份' }).click()
await studio.locator('[data-up-studio-status]').getByText(/已还原备份/).waitFor({ timeout: 15000 })
await page.waitForTimeout(500)
const presetRound = await readJson(presetFile(ID))
check(`再次还原回二版（name=${presetRound.name}）`, presetRound.name === '备份测试二版')

// 8. 损坏备份：改坏 backup.json → 点还原 → 明确报错不崩、preset.json 不被改写
await writeFile(backupFile(ID), 'not json {', 'utf8')
const cardCorrupt = studio.locator('[data-up-card]', { hasText: '备份测试二版' }).first()
await cardCorrupt.locator('[data-up-restore-btn]').click()
await studio.locator('[data-up-confirm]').getByRole('button', { name: '还原备份' }).click()
await studio.locator('[data-up-studio-status]').getByText(/备份损坏/).waitFor({ timeout: 15000 })
await page.waitForTimeout(300)
const presetCorrupt = await readJson(presetFile(ID))
check('损坏备份：明确报错不崩且 preset.json 未被改写', errors.length === 0 && presetCorrupt.name === '备份测试二版')

// 9. 修复备份（保持 e2e-home 状态一致）+ 清理种数据
await writeFile(backupFile(ID), JSON.stringify(v1, null, 2), 'utf8')
for (const id of [ID, ID2]) {
  await fetch(`${BASE}/ui-presets/presets/${id}`, { method: 'DELETE' }).catch(() => {})
}

if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
console.log(`\n${pass} checks passed`)
await browser.close()
process.exit(process.exitCode ?? 0)
