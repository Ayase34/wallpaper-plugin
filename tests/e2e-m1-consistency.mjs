// M1 一致性 e2e（评审 P1 修复验证）：
// ① 新建→编辑→保存：活动 id 与落盘 id 一致（无 draft-new 残留）
// ② 跨会话撤销历史隔离（编辑 A → 新建 → 撤销按钮应为 disabled）
// ③ 幽灵草稿：编辑后关闭设置 → 重开恢复会话 → 放弃 → 外观恢复
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

// 前置清理：清活动预设 + 清空预设库（保留内置；删除历次测试残留）
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
page.on('dialog', d => { d.accept().catch(() => {}) }) // 所有 confirm 自动接受
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))

let pass = 0
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`)
  if (!cond) process.exitCode = 1
  if (cond) pass += 1
}

const typeInto = async (locator, text) => {
  await locator.click()
  await locator.press('Control+A')
  await locator.pressSequentially(text)
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

// ---- ① 新建 → 编辑 → 保存 ----
await studio.getByRole('button', { name: '新建', exact: true }).click()
const nameInput = studio.getByLabel('预设名称')
await nameInput.waitFor({ timeout: 10000 })
await typeInto(nameInput, '一致性测试')
// M2-1：高级令牌默认折叠——展开后才可用令牌输入
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(200)
const bgLight = studio.getByLabel('--dsw-alias-bg-base light 值').first()
await bgLight.waitFor({ timeout: 10000 })
await typeInto(bgLight, '#123456')
await studio.getByRole('button', { name: '保存' }).click()
await studio.locator('[data-up-studio-status]').getByText(/已保存「一致性测试」/).waitFor({ timeout: 15000 })
check('新建预设保存成功（文案用 name）', errors.length === 0)

// 断言：标题栏活动标签为 name（非 draft-new 之类临时 id；等待列表刷新）
await page.waitForTimeout(1500)
const barHtml = await studio.locator('[data-up-studio-bar]').evaluate(el => el.outerHTML)
console.log('bar html:', barHtml.slice(0, 400))
const statusText = await studio.locator('[data-up-studio-bar] [data-up-status]').innerText().catch(() => '(none)')
console.log('bar status text:', statusText)
check(`标题栏活动标签用 name（${statusText}）`, statusText.includes('一致性测试') && !statusText.includes('draft-new'))
// 断言：active.json 的 id 与库文件 id 一致且非 draft-new
const active = await (await fetch(`${BASE}/ui-presets/active`)).json()
check(`active.json id 非临时 id（${active.activePresetId}）`, typeof active.activePresetId === 'string' && !active.activePresetId.includes('draft-new'))
const list = await (await fetch(`${BASE}/ui-presets/presets`)).json()
check(`库中存在落盘预设（${list.presets?.map(p => p.id).join(',')}）`, list.presets?.some(p => p.id === active.activePresetId))

// ---- ② 跨会话撤销历史隔离 ----
// 先编辑 默认 产生历史
await studio.locator('[data-up-card]', { hasText: '默认' }).first().getByRole('button', { name: '编辑' }).click()
// M2-1：切换目标后高级区重新折叠——展开
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(200)
await studio.getByLabel('--dsw-alias-bg-base light 值').first().waitFor({ timeout: 10000 })
await typeInto(studio.getByLabel('--dsw-alias-bg-base light 值').first(), '#abcdef')
const undoBtn = studio.getByRole('button', { name: '撤销' })
check('编辑 demo 后撤销可用', !(await undoBtn.isDisabled()))
// 新建（#58：确认是应用内模态——点「放弃并继续」）→ 新会话撤销历史必须为空；编辑器重挂载 → 高级区重新折叠
await studio.getByRole('button', { name: '新建', exact: true }).click()
const confirmBox = studio.locator('[data-up-confirm]')
await confirmBox.waitFor({ timeout: 10000 })
await confirmBox.getByRole('button', { name: '放弃并继续' }).click()
await confirmBox.waitFor({ state: 'detached', timeout: 10000 })
await page.waitForTimeout(300)
check('切换目标后撤销历史隔离（按钮 disabled）', await undoBtn.isDisabled())
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(200)

// ---- ③ 幽灵草稿恢复 ----
await typeInto(studio.getByLabel('--dsw-alias-bg-base light 值').first(), '#654321')
await studio.locator('[data-up-studio-status]').getByText('预览中（未保存）').waitFor({ timeout: 5000 })
// 关闭设置（Escape）→ 重开
await page.keyboard.press('Escape')
await studio.waitFor({ state: 'detached', timeout: 10000 })
await trigger.click()
const dialog2 = page.getByRole('dialog', { name: '设置' })
await dialog2.waitFor({ timeout: 30000 })
await dialog2.getByRole('button', { name: '外观预设', exact: true }).click()
await dialog2.getByRole('button', { name: '打开美化工作室 →' }).click()
const studio2 = page.locator('[data-up-studio]')
await studio2.waitFor({ timeout: 10000 })
await studio2.locator('[data-up-studio-status]').getByText('预览中（未保存）').waitFor({ timeout: 5000 })
check('重开工作室恢复未保存草稿（幽灵草稿有处置入口）', errors.length === 0)
// 放弃（#58：应用内模态——点「放弃并继续」）→ 外观恢复默认
await studio2.getByRole('button', { name: '放弃' }).click()
const confirmBox2 = studio2.locator('[data-up-confirm]')
await confirmBox2.waitFor({ timeout: 10000 })
await confirmBox2.getByRole('button', { name: '放弃并继续' }).click()
await confirmBox2.waitFor({ state: 'detached', timeout: 10000 })
await page.waitForTimeout(500)
const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
// 放弃只丢草稿，活动预设（一致性测试，bg-base light=#123456）仍在：
// light 方案 → rgb(18, 52, 86)；dark 方案 → 活动预设无 dark 覆盖 → 系统默认 rgb(21, 21, 23)
check(`放弃后回到活动预设外观（${bodyBg}）`, bodyBg === 'rgb(18, 52, 86)' || bodyBg === 'rgb(21, 21, 23)')

console.log(`\n${pass} checks passed`)
await browser.close()
process.exit(process.exitCode ?? 0)
