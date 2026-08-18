// #74 精简工作室 e2e：原始令牌中文描述 + 用户「添加描述」（localStorage）+
// 分组染色（勾选多令牌 → 新建组 → 一次改色批量写入，明暗分别开关）+ 保存落盘 extra.groups。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})
const existingList = await (await fetch(`${BASE}/ui-presets/presets`)).json()
for (const item of existingList.presets ?? []) {
  await fetch(`${BASE}/ui-presets/presets/${encodeURIComponent(item.id)}`, { method: 'DELETE' }).catch(() => {})
}

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
await dialog.getByRole('button', { name: '外观预设', exact: true }).click()
await dialog.getByRole('button', { name: '打开美化工作室 →' }).click()
const studio = page.locator('[data-up-studio]')
await studio.waitFor({ timeout: 10000 })
await studio.locator('[data-up-card]').first().waitFor({ timeout: 10000 })

// 0. 精简面：旋钮层/CSS/主题入口已注释（#74），原始令牌区在
check('旋钮层入口已移除（无 [data-up-knob]）', await studio.locator('[data-up-knob]').count() === 0)
check('CSS 编辑器入口已移除（无 [data-up-css-editor]）', await studio.locator('[data-up-css-editor]').count() === 0)

// 1. 编辑 默认（唯一出厂预设）→ 展开原始令牌区
await studio.locator('[data-up-card]', { hasText: '默认' }).first().getByRole('button', { name: '编辑' }).click()
await studio.getByLabel('预设名称').waitFor({ timeout: 10000 })
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(300)
// 内置中文描述显示（bg-base 行有描述）
const bgRow = studio.locator('[data-up-token-row]', { hasText: '--dsw-alias-bg-base' }).first()
await bgRow.waitFor({ timeout: 10000 })
check('内置中文描述显示（bg-base = 整个界面的底色）',
  (await bgRow.locator('[data-up-token-desc]').innerText()).includes('整个界面的底色'))

// 2. 用户「添加描述」→ localStorage 持久
await bgRow.locator('[data-up-note-btn]').click()
const noteInput = bgRow.locator('[data-up-note-input]')
await noteInput.waitFor({ timeout: 5000 })
await noteInput.click()
await noteInput.pressSequentially('我自己记的：全局底色')
await bgRow.locator('[data-up-btn]', { hasText: '存' }).click()
await page.waitForTimeout(300)
const descAfter = await bgRow.locator('[data-up-token-desc]').innerText()
check('用户描述覆盖内置并标注（自填）', descAfter.includes('我自己记的：全局底色') && descAfter.includes('自填'))
const notes = await page.evaluate(() => JSON.parse(localStorage.getItem('ui-presets-token-notes') ?? '{}'))
check('描述已存 localStorage', notes['--dsw-alias-bg-base'] === '我自己记的：全局底色')

// 3. 分组染色：勾选 bg-base + label-primary → 新建组
await studio.locator('[data-up-group-mode]').click()
const bgCheck = studio.locator('[data-up-group-check][aria-label="加入分组：--dsw-alias-bg-base"]')
await bgCheck.check()
const labelCheck = studio.locator('[data-up-group-check][aria-label="加入分组：--dsw-alias-label-primary"]')
await labelCheck.check()
await studio.getByLabel('新组名称').pressSequentially('核心色')
await studio.locator('[data-up-group-create]').click()
await page.waitForTimeout(400)
const groupPanel = studio.locator('[data-up-groups]')
await groupPanel.waitFor({ timeout: 5000 })
check('分组面板出现且含新组', await groupPanel.getByText('核心色').count() >= 1)

// 4. 改组色（明暗分别不勾 = 双写）：组色输入 #ff00aa → 两个令牌 light/dark 同时变
const groupColorInput = groupPanel.getByLabel('组色：核心色')
await groupColorInput.click()
await groupColorInput.press('Control+A')
await groupColorInput.pressSequentially('#ff00aa')
await page.waitForTimeout(400)
const bgLightAfter = await studio.getByLabel('--dsw-alias-bg-base light 值').first().inputValue()
const bgDarkAfter = await studio.getByLabel('--dsw-alias-bg-base dark 值').first().inputValue()
const lpLightAfter = await studio.getByLabel('--dsw-alias-label-primary light 值').first().inputValue()
const lpDarkAfter = await studio.getByLabel('--dsw-alias-label-primary dark 值').first().inputValue()
check('组色双写生效（bg-base 亮暗同色）', bgLightAfter === '#ff00aa' && bgDarkAfter === '#ff00aa')
check('组内第二个令牌同步变（label-primary 亮暗同色）', lpLightAfter === '#ff00aa' && lpDarkAfter === '#ff00aa')

// 5. 明暗分别：勾选 → 只改暗色 → 亮色保持
await groupPanel.getByLabel('明暗分别编辑（不勾 = 同色同时写亮/暗）').check()
const groupDarkInput = groupPanel.getByLabel('组暗色：核心色')
await groupDarkInput.click()
await groupDarkInput.press('Control+A')
await groupDarkInput.pressSequentially('#000033')
await page.waitForTimeout(400)
const bgLightKeep = await studio.getByLabel('--dsw-alias-bg-base light 值').first().inputValue()
const bgDarkNow = await studio.getByLabel('--dsw-alias-bg-base dark 值').first().inputValue()
check('明暗分别：只写暗色（亮保持 #ff00aa / 暗 #000033）', bgLightKeep === '#ff00aa' && bgDarkNow === '#000033')

// 6. 撤销回退（组改色 = 一条历史）：明暗分别那条先回退 → 再回编辑前默认
await studio.getByRole('button', { name: '撤销' }).click()
await page.waitForTimeout(400)
const bgDarkUndone1 = await studio.getByLabel('--dsw-alias-bg-base dark 值').first().inputValue()
check('撤销回退明暗分别修改（dark 回 #ff00aa）', bgDarkUndone1 === '#ff00aa')
await studio.getByRole('button', { name: '撤销' }).click()
await page.waitForTimeout(400)
const bgLightUndone = await studio.getByLabel('--dsw-alias-bg-base light 值').first().inputValue()
check('再撤销回退组色双写（light 离开 #ff00aa）', bgLightUndone !== '#ff00aa')

// 7. 保存 → extra.groups 落盘
await studio.getByRole('button', { name: '保存' }).click()
await studio.locator('[data-up-studio-status]').getByText(/已另存为/).waitFor({ timeout: 15000 })
const lib = await (await fetch(`${BASE}/ui-presets/presets`)).json()
const saved = lib.presets.find(p => p.name.includes('默认'))
check('保存成功（另存为）', saved !== undefined)
if (saved !== undefined) {
  const sp = (await (await fetch(`${BASE}/ui-presets/presets/${encodeURIComponent(saved.id)}`)).json()).preset ?? {}
  const groups = sp.extra?.groups ?? []
  check(`extra.groups 落盘（核心色，${groups.length} 组）`, groups.length === 1 && groups[0].name === '核心色' && groups[0].tokenNames.length === 2)
}

// 8. 解散组（组消失、令牌值保留）
await studio.locator('[data-up-group-del]').click()
await page.waitForTimeout(300)
check('解散组后分组面板消失', await studio.locator('[data-up-groups]').count() === 0)

// 清理
for (const item of (await (await fetch(`${BASE}/ui-presets/presets`)).json()).presets ?? []) {
  await fetch(`${BASE}/ui-presets/presets/${encodeURIComponent(item.id)}`, { method: 'DELETE' }).catch(() => {})
}

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
