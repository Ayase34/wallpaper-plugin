// M3-3 标准版打磨 e2e + #52 裁剪流：素材缩略图 + 一键设为聊天背景（→ 16:9 裁剪框 → 裁剪副本赋值）。
// 验证：缩略图真实渲染 → 快捷按钮弹裁剪框（固定比例/缩放/透明提示）→ 确认后裁剪副本入库并选中
// → 实时注入生效 → 保存落盘引用裁剪副本 → 删除裁剪副本后引用清空。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
// 1×1 透明 PNG
const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

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
await dialog.getByRole('button', { name: '打开美化工作室 →' }).click()
const studio = page.locator('[data-up-studio]')
await studio.waitFor({ timeout: 10000 })
await studio.locator('[data-up-card]').first().waitFor({ timeout: 10000 })
await studio.locator('[data-up-card]', { hasText: '默认' }).first().getByRole('button', { name: '编辑' }).click()
await studio.getByLabel('预设名称').waitFor({ timeout: 10000 })

// 1. 上传素材 → 缩略图渲染
const assetInput = studio.locator('[data-up-widget-editor] input[type="file"]')
await assetInput.waitFor({ state: 'attached', timeout: 10000 })
await assetInput.setInputFiles({
  name: 'thumb.png',
  mimeType: 'image/png',
  buffer: Buffer.from(PNG_BASE64, 'base64'),
})
await studio.locator('[data-up-asset]').waitFor({ timeout: 10000 })
await page.waitForTimeout(400)
check('素材芯片出现（thumb.png）', (await studio.locator('[data-up-asset]').innerText()).includes('thumb.png'))
// #89：缩略图改为首帧 canvas（不再全量 <img> 解码动图）——等待首帧绘制完成
await page.waitForFunction(() => {
  const el = document.querySelector('[data-up-asset-thumb]')
  return el !== null && el.tagName === 'CANVAS' && el.width === 22
}, undefined, { timeout: 10000 }).catch(() => {})
const thumbInfo = await studio.locator('[data-up-asset-thumb]').evaluate(el => {
  return { tag: el.tagName, w: el.width, h: el.height }
})
check(`素材缩略图为首帧 canvas（${thumbInfo.tag} ${thumbInfo.w}×${thumbInfo.h}——不全量解码动图）`,
  thumbInfo.tag === 'CANVAS' && thumbInfo.w === 22 && thumbInfo.h === 22)
check('上传后未生效提示指向快捷按钮', (await studio.locator('[data-up-widget-editor] [data-up-status]').filter({ hasText: '尚未生效' }).innerText()).includes('设为聊天背景'))

// 2. 一键设为聊天背景 → 弹 16:9 裁剪框（#52）→ 缩放 → 确认 → 参数写入（#53 不落库）
// 新上传的芯片是列表最后一个（避免与库中遗留同名素材混淆）
await studio.locator('[data-up-asset]').last().getByRole('button', { name: '用 thumb.png 作聊天背景' }).click()
const crop = page.locator('[data-up-crop]')
await crop.waitFor({ timeout: 10000 })
const cropText = await crop.innerText()
check('裁剪框出现（聊天背景图 16:9 + 黑底应用范围提示）', cropText.includes('图片裁剪：聊天背景图')
  && cropText.includes('16:9') && cropText.includes('黑框内即实际应用范围'))
check('裁剪框外为黑底（应用范围外涂黑）', await page.evaluate(() => {
  const canvas = document.querySelector('[data-up-crop-canvas]')
  if (canvas === null) return false
  const wrap = canvas.parentElement
  return wrap !== null && getComputedStyle(wrap).backgroundColor === 'rgb(0, 0, 0)'
}))
await crop.getByLabel('缩放').evaluate(el => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(el, '120')
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
})
await page.waitForTimeout(300)
check('缩放读数 120%', await crop.locator('[data-up-crop-zoom]').innerText() === '120%')
await crop.getByRole('button', { name: '确认裁剪' }).click()
await crop.waitFor({ state: 'detached', timeout: 15000 })
await page.waitForTimeout(600)
// #53：不生成裁剪副本；部件直接引用原图 + 裁剪参数
const chipTexts = (await studio.locator('[data-up-asset]').allTextContents()).join('\n')
check('不产生裁剪副本芯片', !chipTexts.includes('裁剪-'))
const chatSelect = studio.getByLabel('chat-background assetId')
check('聊天背景部件已自动启用且选中原图', (await chatSelect.inputValue()).length > 0
  && (await chatSelect.locator('option:checked').innerText()) === 'thumb.png')
check('原图芯片标记「✓ 聊天背景」', chipTexts.includes('✓ 聊天背景'))
// 未生效提示消失（部件已配置）
const hintCount = await studio.locator('[data-up-widget-editor] [data-up-status]').filter({ hasText: '尚未生效' }).count()
check('提示语消失（部件已配置）', hintCount === 0)

// 3. 实时注入生效（草稿即生效：裁剪标记 + controller 内联样式挂载壁纸 URL）
await page.waitForTimeout(400)
const patchStyle = await page.evaluate(() => document.querySelector('style[data-up-patch]')?.textContent ?? '')
check('裁剪标记已注入（up-crop:chat-background + 壁纸库 url）', patchStyle.includes('up-crop:chat-background')
  && patchStyle.includes('url("/ui-presets/assets/asset-'))
const convBg = await page.evaluate(() => {
  const el = document.querySelector('[data-conversation-scroll]')
  if (el === null) return { exists: false }
  return { exists: true, bgImage: getComputedStyle(el).backgroundImage.slice(0, 80) }
})
check(`聊天区背景真实生效（exists=${convBg.exists} bgImage=${convBg.bgImage}…）`,
  convBg.exists === true && convBg.bgImage.includes('/ui-presets/assets/asset-'))

// 4. 保存 → 落盘：chat-background 引用原图 + 裁剪参数（#53 无裁剪副本）
await studio.getByRole('button', { name: '保存' }).click()
await studio.locator('[data-up-studio-status]').getByText(/已另存为「默认（自定义）」/).waitFor({ timeout: 15000 })
const saved = await (await fetch(`${BASE}/ui-presets/presets/default-custom`)).json()
const preset = saved.preset ?? {}
const chatWidget = (preset.widgets ?? []).find(w => w.id === 'chat-background')
const sourceAsset = (preset.assets ?? []).find(a => a.id === chatWidget?.params.assetId)
check('落盘 chat-background 引用原图 + 裁剪参数', sourceAsset !== undefined && sourceAsset.name === 'thumb.png'
  && chatWidget?.params.cropX !== undefined && chatWidget?.params.cropW !== undefined)

// 5. 删除原图（源） → 引用清空 + chip 消失（修复轮 #40 批量更新继续有效）
if (sourceAsset !== undefined) {
  await studio.getByRole('button', { name: `删除素材 thumb.png` }).click()
  await page.waitForTimeout(500)
  const chatSelect2 = studio.getByLabel('chat-background assetId')
  check('删除源图后部件引用自动清空', (await chatSelect2.inputValue()) === '')
  const chipTextsAfter = (await studio.locator('[data-up-asset]').allTextContents()).join('\n')
  check('源图 chip 消失（批量更新生效）', !chipTextsAfter.includes('thumb.png'))
}

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
