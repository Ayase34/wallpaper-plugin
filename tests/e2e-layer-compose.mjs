// #85 图层合成（实验）e2e：上传小块素材 → 打开合成编辑器 → 加入两图层 →
// 调不透明度 → 合成并上传 → 新素材入库 → 用作聊天背景渲染 → 清理。
// 回滚预案（决策 #85）：删除本脚本 + layer-composer.tsx + layer-compose.ts +
// widget-editor.tsx 接线 + layer-compose.test.mjs 即回滚。
import { deflateSync } from 'node:zlib'
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

// 手写 8×8 纯色 PNG（zlib + crc32）
function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) { c ^= b; for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)) }
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
function solidPng(w, h, rgb) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  const row = Buffer.alloc(1 + w * 3)
  for (let x = 0; x < w; x++) { row[1 + x * 3] = rgb[0]; row[2 + x * 3] = rgb[1]; row[3 + x * 3] = rgb[2] }
  const raw = Buffer.concat(Array.from({ length: h }, () => row))
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ])
}
const PIECE_RED = solidPng(8, 8, [255, 0, 0])
const PIECE_BLUE = solidPng(8, 8, [0, 0, 255])

// 前置清场
await fetch(`${BASE}/ui-presets/active`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ activePresetId: null }) }).catch(() => {})
for (const item of ((await (await fetch(`${BASE}/ui-presets/presets`)).json()).presets ?? [])) {
  await fetch(`${BASE}/ui-presets/presets/${encodeURIComponent(item.id)}`, { method: 'DELETE' }).catch(() => {})
}
for (const a of ((await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? [])) {
  await fetch(`${BASE}/ui-presets/assets/${encodeURIComponent(a.id)}`, { method: 'DELETE' }).catch(() => {})
}

const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
let pass = 0
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`)
  if (!cond) process.exitCode = 1
  if (cond) pass += 1
}

// 1. 打开工作室 → 编辑 默认 → 素材与部件区（素材面板用的是预设内素材引用）
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
await studio.locator('[data-up-card]', { hasText: '默认' }).first().getByRole('button', { name: '编辑' }).click()
await studio.getByLabel('预设名称').waitFor({ timeout: 10000 })

// 2. 通过 UI 上传两个小块素材（并入预设素材列表 + 壁纸库）
const assetsBefore = (await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? []
const assetInput = studio.locator('[data-up-widget-editor] input[type="file"]')
await assetInput.waitFor({ state: 'attached', timeout: 10000 })
// 单文件 input——分两次上传
await assetInput.setInputFiles({ name: 'piece-red.png', mimeType: 'image/png', buffer: PIECE_RED })
await page.waitForTimeout(700)
await assetInput.setInputFiles({ name: 'piece-blue.png', mimeType: 'image/png', buffer: PIECE_BLUE })
await page.waitForTimeout(700)
const assetsAfter = (await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? []
const uploaded = assetsAfter.filter(a => !assetsBefore.some(b => b.id === a.id))
check('小块素材经 UI 上传 ×2', uploaded.length === 2)
check('素材芯片出现在编辑器', (await studio.locator('[data-up-asset]').count()) >= 2)

// 3. 打开图层合成编辑器
const composerBtn = studio.locator('[data-up-layer-open]')
await composerBtn.waitFor({ timeout: 10000 })
check('「图层合成壁纸」入口可见', (await composerBtn.count()) === 1)
await composerBtn.click()
const composer = page.locator('[data-up-layer-composer]')
await composer.waitFor({ timeout: 10000 })
check('合成编辑器弹层出现', (await composer.count()) === 1)
check('素材面板含两个小块', (await composer.locator('[data-up-layer-piece]').count()) === 2)

// 4. 加入两图层 + 调透明度
await composer.locator(`[data-up-layer-piece="${uploaded[0].id}"]`).click()
await page.waitForTimeout(300)
await composer.locator(`[data-up-layer-piece="${uploaded[1].id}"]`).click()
await page.waitForTimeout(300)
check('画布图层数 = 2（状态行）', (await composer.locator('[data-up-status]').first().innerText()).includes('图层 2'))
// 选中第二层（画布中心——两图层初始都叠在中心，命中最上层）→ 不透明度 60%
const canvas = composer.locator('[data-up-layer-canvas]')
await canvas.click({ position: { x: 320, y: 180 } })
await page.waitForTimeout(500)
const opacitySlider = composer.getByLabel('图层不透明度')
await opacitySlider.waitFor({ timeout: 5000 })
await opacitySlider.evaluate(el => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(el, '60')
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
})
await page.waitForTimeout(300)
check('不透明度读数 60%', (await composer.getByText('不透明度 60%').count()) >= 1)

// 5. 合成并上传 → 新素材入库
await composer.locator('[data-up-layer-compose]').click()
await composer.locator('[data-up-status]').getByText(/已生成合成壁纸/).waitFor({ timeout: 20000 })
const assetsAfterCompose = (await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? []
const composed = assetsAfterCompose.find(a => a.name.startsWith('合成壁纸-'))
check('合成壁纸入库（合成壁纸-*.png）', composed !== undefined && composed.mime === 'image/png')
check('素材芯片并入编辑器列表', (await studio.locator('[data-up-asset]').count()) >= 3)

// 6. 合成壁纸用作聊天背景（HTTP 建预设应用——UI 裁剪流与普通素材一致，非本实验范围）
const presetBody = {
  preset: {
    schemaVersion: 1, id: 'layer-compose-test', name: '图层合成验证', edition: 'standard', targetDshVersion: '0.1.0-rc.5',
    tokens: { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#111111' } },
    assets: [{ id: composed.id, name: composed.name, mime: 'image/png' }],
    widgets: [{ id: 'chat-background', params: { assetId: composed.id, opacity: '1' } }],
  },
}
const createdRes = await fetch(`${BASE}/ui-presets/presets/layer-compose-test`, {
  method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(presetBody),
})
const created = await createdRes.json()
const activeRes = await fetch(`${BASE}/ui-presets/active`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ activePresetId: 'layer-compose-test' }) })
await fetch(`${BASE}/ui-presets/active`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ activePresetId: 'layer-compose-test' }) })
await page.reload({ waitUntil: 'domcontentloaded' })
await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 120000 })
await page.waitForTimeout(3000)
const bg = await page.evaluate(() => {
  const el = document.querySelector('[data-conversation-scroll]')
  return el !== null ? getComputedStyle(el).backgroundImage : ''
})
check(`合成壁纸渲染为聊天背景（${bg.slice(0, 60)}…）`, bg.includes(`/ui-presets/assets/${composed.id}`))

// 7. 清理
await fetch(`${BASE}/ui-presets/active`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ activePresetId: null }) }).catch(() => {})
for (const item of ((await (await fetch(`${BASE}/ui-presets/presets`)).json()).presets ?? [])) {
  await fetch(`${BASE}/ui-presets/presets/${encodeURIComponent(item.id)}`, { method: 'DELETE' }).catch(() => {})
}
for (const a of ((await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? [])) {
  await fetch(`${BASE}/ui-presets/assets/${encodeURIComponent(a.id)}`, { method: 'DELETE' }).catch(() => {})
}

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
