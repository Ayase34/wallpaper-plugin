// M1 端到端：工作室编辑闭环——打开编辑器 → 改令牌 → mock 预览更新 → 撤销 → 保存 → 全局应用。
// 输入一律用真实键盘事件（playwright fill 对 React 受控组件首次输入偶发不触发 onChange）。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
const TARGET_LIGHT = process.env.UIP_TARGET_LIGHT ?? '#123456' // 编辑后的 bg-base light 值

/** 真实键盘输入：点击 → 全选 → 打字。 */
async function typeInto(locator, text) {
  await locator.click()
  await locator.press('Control+A')
  await locator.pressSequentially(text)
}

// 前置清理：清残留活动预设
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

// 1. 打开设置 → 外观预设 → 工作室
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
// 预设列表异步加载（refreshPresets）——等卡片出现再断言
await studio.locator('[data-up-card]').first().waitFor({ timeout: 10000 })
check('工作室三栏出现（预设列表/编辑器/预览）', errors.length === 0)

// 2. 编辑 默认（唯一出厂预设）
const demoCard = studio.locator('[data-up-card]', { hasText: '默认' }).first()
await demoCard.getByRole('button', { name: '编辑' }).click()
await studio.getByLabel('预设名称').waitFor({ timeout: 10000 })
// M2-1：高级令牌默认折叠——展开后分组表单才可见
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(200)
check('编辑器打开（分组表单出现）', await studio.locator('[data-up-token-row]').count() > 10)

// 3. 修改 bg-base 的 light 值 → 草稿全局生效（body 变）+ 状态条"预览中"
// #75：预览面板已移除——草稿全局生效，真实界面（body）即预览
const bgLight = studio.getByLabel('--dsw-alias-bg-base light 值').first()
await bgLight.waitFor({ timeout: 10000 })
const beforeValue = await bgLight.inputValue()
await typeInto(bgLight, TARGET_LIGHT)
await studio.locator('[data-up-studio-status]').getByText('预览中（未保存）').waitFor({ timeout: 5000 })
check('状态条显示「预览中（未保存）」', errors.length === 0)
await page.waitForTimeout(400)
const draftBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`草稿全局生效（body=${draftBg}）`, draftBg === 'rgb(18, 52, 86)' || draftBg === 'rgb(6, 14, 30)')

// 4. 撤销：逐键输入产生多条历史，连续撤销直到按钮禁用 → 值恢复原值
for (let i = 0; i < 8; i += 1) {
  const undoBtn = studio.getByRole('button', { name: '撤销' })
  if (await undoBtn.isDisabled()) break
  await undoBtn.click()
  await page.waitForTimeout(120)
}
const undoneValue = await bgLight.inputValue()
check(`连续撤销恢复原值 (${beforeValue} → ${undoneValue})`, undoneValue === beforeValue)

// 5. 重新修改并保存 → 全局应用（body 背景变化）
// 注意：编辑的是内置预设 → 新语义强制另存为 default-custom
await typeInto(bgLight, TARGET_LIGHT)
await studio.getByRole('button', { name: '保存' }).click()
await page.waitForTimeout(2000)
const statusAfterSave = await studio.locator('[data-up-studio-status]').innerText()
console.log('status after save:', statusAfterSave)
const noticeEl = await studio.locator('[data-up-studio-status] span').nth(1).innerText().catch(() => '(none)')
console.log('notice span:', noticeEl)
const barAfter = await studio.locator('[data-up-studio-bar] [data-up-status]').innerText()
console.log('bar after save:', barAfter)
const activeAfter = await (await fetch(`${BASE}/ui-presets/active`)).json()
console.log('active.json:', JSON.stringify(activeAfter))
await studio.locator('[data-up-studio-status]').getByText(/已另存为「默认（自定义）」/).waitFor({ timeout: 15000 })
check('保存成功（内置预设另存为自定义，文案用 name）', errors.length === 0)
await page.waitForTimeout(400)
const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
// 方案无关：应用后 body = 新预设的活动方案 bg（light #123456 / dark = 默认 深色值）
check(`保存后全局应用（body 背景=${bodyBg}）`, bodyBg === 'rgb(18, 52, 86)' || bodyBg === 'rgb(6, 14, 30)')

// 5a. #58：未保存改动 → 新建 → **应用内确认框**（替代原生 confirm——桌面端原生对话框
//     关闭后丢键盘焦点，命名框/主界面聊天框全部无法输入）→ 确认后输入恢复
// 注：另存为后 TokenEditor 按新 id 重挂、高级区重新折叠——先展开
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(200)
await typeInto(bgLight, '#234567')
await studio.locator('[data-up-studio-status]').getByText('预览中（未保存）').waitFor({ timeout: 5000 })
await studio.getByRole('button', { name: '新建', exact: true }).click()
const confirmBox = studio.locator('[data-up-confirm]')
await confirmBox.waitFor({ timeout: 10000 })
const confirmText = await confirmBox.innerText()
check('应用内确认框出现（无原生 dialog 事件）', confirmText.includes('放弃并继续') && confirmText.includes('未保存的改动'))
await confirmBox.getByRole('button', { name: '放弃并继续' }).click()
await confirmBox.waitFor({ state: 'detached', timeout: 10000 })
await page.waitForTimeout(300)
// 确认后命名框可正常输入（回归：原生 confirm 焦点 bug）
const nameAfter = studio.getByLabel('预设名称')
await nameAfter.click()
await nameAfter.press('Control+A')
await nameAfter.pressSequentially('新预设改名')
check('确认后命名框可输入', (await nameAfter.inputValue()) === '新预设改名')

// 5b. #56：改名 + 手设封面 → 设置页墙即时反映（同窗口广播修复）
// 5b-1 改名保存
const nameInput = studio.getByLabel('预设名称')
await typeInto(nameInput, '深蓝海洋·手改')
await studio.getByRole('button', { name: '保存' }).click()
await studio.locator('[data-up-studio-status]').getByText(/已保存「深蓝海洋·手改」/).waitFor({ timeout: 15000 })
check('改名保存成功（库预设直接保存文案）', errors.length === 0)
// 5b-2 上传素材 → 设为封面（3:1 裁剪框）
const assetInput = studio.locator('[data-up-widget-editor] input[type="file"]')
await assetInput.setInputFiles({
  name: 'cover.png',
  mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
})
await studio.locator('[data-up-asset]').waitFor({ timeout: 10000 })
await studio.getByLabel('预设封面素材').selectOption({ label: 'cover.png' })
const coverCrop = page.locator('[data-up-crop]')
await coverCrop.waitFor({ timeout: 10000 })
const coverCropText = await coverCrop.innerText()
check('封面裁剪框出现（预设封面 3:1）', coverCropText.includes('预设封面') && coverCropText.includes('3:1'))
// #57：放大到 800% + 向右大幅拖动 → 无硬边界（旧实现 ±框/2=±960 卡死，拖不到图片边缘）
await coverCrop.getByLabel('缩放').evaluate(el => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(el, '800')
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
})
await page.waitForTimeout(300)
const canvasBox = await coverCrop.locator('[data-up-crop-canvas]').boundingBox()
if (canvasBox !== null) {
  await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(canvasBox.x + canvasBox.width / 2 + 500, canvasBox.y + canvasBox.height / 2, { steps: 10 })
  await page.mouse.up()
  await page.waitForTimeout(300)
}
await coverCrop.getByRole('button', { name: '确认裁剪' }).click()
await coverCrop.waitFor({ state: 'detached', timeout: 15000 })
await page.waitForTimeout(500)
await studio.getByRole('button', { name: '保存' }).click()
// 注：保存通知文案与上一步相同（已保存「深蓝海洋·手改」）——waitFor 可能命中旧提示，
// 且 5a 新建后会话是新预设 id（非 default-custom）——按名字定位落盘预设再轮询 cover
let coverC = {}
for (let i = 0; i < 25; i += 1) {
  const list = (await (await fetch(`${BASE}/ui-presets/presets`)).json()).presets ?? []
  const target = list.find(p => p.name === '深蓝海洋·手改')
  if (target !== undefined) {
    const sp = (await (await fetch(`${BASE}/ui-presets/presets/${encodeURIComponent(target.id)}`)).json()).preset ?? {}
    coverC = sp.cover ?? {}
    if (coverC.cropX !== undefined) break
  }
  await page.waitForTimeout(200)
}
check('封面设置并保存成功', errors.length === 0 && coverC.cropX !== undefined)
// #57：落盘 cover 参数验证——放大后拖动超过旧边界（旧：pan 卡 ±960 → cropX=-640；新：拖到 -288.5 附近）
console.log(`cover params: cropX=${coverC.cropX} cropY=${coverC.cropY}`)
check(`放大后可拖到图片边缘（cropX=${coverC.cropX} > -600，旧边界 -640 卡死）`,
  Number(coverC.cropX) > -600 && Number(coverC.cropX) < 0 && Number(coverC.cropY) < -2000)

// 6. 返回 → 设置墙即时反映（#56：同窗口保存后墙刷新；改名 + 手设封面）
await studio.getByRole('button', { name: '‹ 返回' }).click()
await studio.waitFor({ state: 'detached', timeout: 10000 })
const renamedCard = dialog.locator('[data-up-card]', { hasText: '深蓝海洋·手改' }).first()
await renamedCard.waitFor({ timeout: 15000 })
check('改名即时反映到设置页墙（无需重进设置）', await renamedCard.count() > 0)
await page.waitForFunction(() => {
  const imgs = [...document.querySelectorAll('[data-up-cover]')]
  return imgs.length >= 2 && imgs.every(img => img.complete)
}, { timeout: 15000 }).catch(() => {})
const coverInfo = await renamedCard.locator('[data-up-cover]').evaluate(img => ({
  src: (img.getAttribute('src') ?? '').slice(0, 40),
  w: img.naturalWidth,
  h: img.naturalHeight,
}))
check(`手设封面已生效（${coverInfo.w}×${coverInfo.h}，src=${coverInfo.src}…）`,
  coverInfo.w === 900 && coverInfo.h === 300 && coverInfo.src.startsWith('data:image/png'))
// #58：确认框流程后主界面聊天输入也可正常输入（原生 confirm 焦点 bug 回归）
const hostChat = page.locator('textarea').last()
if (await hostChat.count() > 0) {
  try {
    await hostChat.click()
    await page.keyboard.type('输入回归')
    await page.waitForTimeout(200)
    const chatVal = await hostChat.inputValue()
    check(`确认后主界面聊天框可输入（${chatVal.slice(0, 8)}…）`, chatVal.includes('输入回归'))
  } catch { /* 宿主输入框不可交互时不阻塞主流程 */ }
}
const markerBefore = await dialog.getByText('✓ 当前应用').count()
console.log('active marker before revert:', markerBefore)
await dialog.getByRole('button', { name: '还原默认' }).first().click()
await page.waitForTimeout(800)
const markerAfter = await dialog.getByText('✓ 当前应用').count()
console.log('active marker after revert:', markerAfter)
const bodyReverted = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
// 方案无关：还原后 body = 系统默认 bg（light rgb(255,255,255) / dark rgb(21,21,23)）
check(`还原默认恢复 (${bodyReverted})`, bodyReverted === 'rgb(255, 255, 255)' || bodyReverted === 'rgb(21, 21, 23)')

if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
console.log(`\n${pass} checks passed`)
await browser.close()
process.exit(process.exitCode ?? 0)
