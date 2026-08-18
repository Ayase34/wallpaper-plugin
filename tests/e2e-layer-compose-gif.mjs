// #86 多 GIF 拼接 e2e：上传动图 GIF 小块 + 静态小块 → 图层合成 →
// 输出必须是真动图（mime=image/gif + node 侧 decodeGif 验证多帧且帧间像素不同）→ 应用渲染。
// 回滚预案（决策 #85/#86）：删除本脚本 + layer-composer.tsx + layer-compose.ts +
// gif-codec.ts + widget-editor.tsx 接线 + 两个单测文件即回滚。
import { deflateSync } from 'node:zlib'
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'
import { decodeGif } from '../src/core/gif-codec.ts'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

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
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.concat(Array.from({ length: h }, () => row)))), chunk('IEND', Buffer.alloc(0)),
  ])
}
// 2 色 4×4 双帧动图（红 → 蓝，0.5s/帧）——#83 同款结构
function gifLzw2(pixels) {
  const clear = 4, eoi = 5
  let codeSize = 3
  const dict = new Map(); let next = 6
  let bitBuf = 0, bitPos = 0; const out = []
  const emit = (code) => { bitBuf |= code << bitPos; bitPos += codeSize; while (bitPos >= 8) { out.push(bitBuf & 0xff); bitBuf >>>= 8; bitPos -= 8 } }
  const codeOf = (str) => str.length === 1 ? str.charCodeAt(0) : dict.get(str)
  emit(clear); let cur = null
  for (const p of pixels) {
    const ch = String.fromCharCode(p)
    if (cur === null) { cur = ch; continue }
    const key = cur + ch
    if (dict.has(key)) { cur = key; continue }
    emit(codeOf(cur))
    if (next < 4096) { dict.set(key, next); next += 1; if (next === (1 << codeSize) && codeSize < 12) codeSize += 1 }
    cur = ch
  }
  if (cur !== null) emit(codeOf(cur))
  emit(eoi)
  if (bitPos > 0) out.push(bitBuf & 0xff)
  return out
}
function frameBlock(pixels) {
  const enc = gifLzw2(pixels); const blocks = []
  for (let i = 0; i < enc.length; i += 255) blocks.push(Buffer.from([Math.min(255, enc.length - i), ...enc.slice(i, i + 255)]))
  return Buffer.concat(blocks.concat([Buffer.from([0])]))
}
function makeGif() {
  const W = 4, H = 4
  const hdr = Buffer.from('GIF89a')
  const lsdt = Buffer.alloc(7)
  lsdt.writeUInt16LE(W, 0); lsdt.writeUInt16LE(H, 2); lsdt[4] = 0x80; lsdt[5] = 0; lsdt[6] = 0
  const gct = Buffer.from([255, 0, 0, 0, 0, 255])
  const frame = (idx) => {
    const gce = Buffer.from([0x21, 0xF9, 0x04, 0x04, 50, 0, 0x00, 0x00])
    const imgDesc = Buffer.alloc(10)
    imgDesc[0] = 0x2C
    imgDesc.writeUInt16LE(0, 1); imgDesc.writeUInt16LE(0, 3); imgDesc.writeUInt16LE(W, 5); imgDesc.writeUInt16LE(H, 7)
    imgDesc[9] = 0
    const minCode = Buffer.from([2])
    return Buffer.concat([gce, imgDesc, minCode, frameBlock(new Array(W * H).fill(idx))])
  }
  return Buffer.concat([hdr, lsdt, gct, frame(0), frame(1), Buffer.from([0x3B])])
}
const ANIM_GIF = makeGif()
const STATIC_PNG = solidPng(8, 8, [0, 180, 0]) // 绿色静态块

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

// 1. 打开工作室编辑 默认，UI 上传动图 + 静态小块
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
const assetInput = studio.locator('[data-up-widget-editor] input[type="file"]')
await assetInput.waitFor({ state: 'attached', timeout: 10000 })
await assetInput.setInputFiles({ name: 'anim.gif', mimeType: 'image/gif', buffer: ANIM_GIF })
await page.waitForTimeout(700)
await assetInput.setInputFiles({ name: 'piece-green.png', mimeType: 'image/png', buffer: STATIC_PNG })
await page.waitForTimeout(700)
const assetsBefore = (await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? []
const uploaded = assetsBefore.filter(a => a.mime === 'image/gif' || a.name === 'piece-green.png')
check('动图 + 静态小块上传 ×2', uploaded.length === 2)

// 2. 打开合成编辑器，加入两个图层
await studio.locator('[data-up-layer-open]').click()
const composer = page.locator('[data-up-layer-composer]')
await composer.waitFor({ timeout: 10000 })
const gifPiece = composer.locator('[data-up-layer-piece]', { hasText: '' }).first() // 有缩略图即可点击
const pieces = composer.locator('[data-up-layer-piece]')
check('素材面板含 2 小块', (await pieces.count()) === 2)
// #89：面板缩略图为 canvas 首帧绘制（不全量解码动图——内存累积根因修复）
const pieceTags = await pieces.evaluateAll(els => els.map(el => el.tagName))
check('素材面板缩略图为 canvas 首帧', pieceTags.every(t => t === 'CANVAS'))
await pieces.nth(0).click()
await page.waitForTimeout(300)
await pieces.nth(1).click()
await page.waitForTimeout(300)
check('图层 2（含 GIF）', (await composer.locator('[data-up-status]').first().innerText()).includes('图层 2'))

// 2.5 拖动：默认两小块都叠在画布中心且同尺寸——绿色会完全盖住动图，先把绿色拖到右侧
const canvas = composer.locator('[data-up-layer-canvas]')
const box = await canvas.boundingBox()
await canvas.click({ position: { x: 320, y: 180 } }) // 选中最上层（绿色）
await page.mouse.move(box.x + 320, box.y + 180)
await page.mouse.down()
await page.mouse.move(box.x + 640, box.y + 180, { steps: 10 })
await page.mouse.up()
await page.waitForTimeout(300)
check('拖动后画布内仍有两个图层', (await composer.locator('[data-up-status]').first().innerText()).includes('图层 2'))

// 2.6 #87 新控件：上移/下移/镜像存在且可操作（选中态 = 绿色小块，已在画布中心上方）
check('上移按钮存在', (await composer.getByRole('button', { name: '图层上移' }).count()) === 1)
check('下移按钮存在', (await composer.getByRole('button', { name: '图层下移' }).count()) === 1)
check('水平镜像按钮存在', (await composer.getByRole('button', { name: '水平镜像' }).count()) === 1)
check('垂直镜像按钮存在', (await composer.getByRole('button', { name: '垂直镜像' }).count()) === 1)
await composer.getByRole('button', { name: '图层下移' }).click()
await page.waitForTimeout(200)
await composer.getByRole('button', { name: '水平镜像' }).click()
await page.waitForTimeout(200)
await composer.getByRole('button', { name: '垂直镜像' }).click()
await page.waitForTimeout(200)
check('控件操作后画布仍正常（图层 2）', (await composer.locator('[data-up-status]').first().innerText()).includes('图层 2'))

// 3. 分层合成（#90：恰好 1 个干净 GIF 层 + 静态层 → 静态底图 + 原生动图直引，不烘焙）
const animGifId = uploaded.find(a => a.mime === 'image/gif')?.id ?? ''
await composer.locator('[data-up-layer-compose]').click()
await composer.locator('[data-up-status]').getByText(/已生成分层合成壁纸|合成失败/).waitFor({ timeout: 30000 })
const sLayered = await composer.locator('[data-up-status]').first().innerText()
console.log(`[分层合成] ${sLayered}`)
const assetsLayered = (await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? []
const layeredBase = assetsLayered.filter(a => a.name.startsWith('合成壁纸-')).find(a => a.mime !== 'image/gif')
check('分层合成壁纸入库（底图 png/jpg——照片不被烤进 GIF 每帧）', layeredBase !== undefined)
const layeredMeta = layeredBase !== undefined
  ? (await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets?.find(a => a.id === layeredBase.id)
  : undefined
check(`分层规格随 meta 落盘（layers.animAssetId=${layeredMeta?.layers?.animAssetId} 矩形=${layeredMeta?.layers?.w}x${layeredMeta?.layers?.h}）`,
  layeredMeta?.layers?.animAssetId === animGifId
  && layeredMeta?.layers?.w > 0 && layeredMeta?.layers?.h > 0)

// 4. 烘焙兜底（#90：「烘焙为单文件动画」按钮）→ 真动图单文件（多 GIF 同步/旋转/导出用）
await composer.locator('[data-up-layer-bake]').click()
await composer.locator('[data-up-status]').getByText(/已生成合成壁纸/).waitFor({ timeout: 60000 })
const assetsBaked = (await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? []
const baked = assetsBaked.filter(a => a.name.startsWith('合成壁纸-')).find(a => a.mime === 'image/gif')
check('烘焙输出 image/gif（单文件动画）', baked !== undefined && baked?.mime === 'image/gif')

// 4b. 确定性动画证明：node 侧 decodeGif 烘焙结果 → 多帧且帧间像素不同
const compBytes = new Uint8Array(await (await fetch(`${BASE}/ui-presets/assets/${baked?.id}`)).arrayBuffer())
const decoded = decodeGif(compBytes)
check(`烘焙结果含多帧（${decoded.frames.length} 帧）`, decoded.frames.length >= 2)
const f0 = decoded.frames[0].pixels
const f1 = decoded.frames[1].pixels
let diff = 0
for (let i = 0; i < f0.length; i += 4) {
  if (f0[i] !== f1[i] || f0[i + 1] !== f1[i + 1] || f0[i + 2] !== f1[i + 2]) diff += 1
}
check(`烘焙帧间像素不同（${diff} 像素变化——真动图）`, diff > 0)
check('烘焙帧延时有效', decoded.frames.every(f => f.delayCs > 0))

// 5. 分层底图应用为聊天背景（带裁剪参数 → 走 controller 分层渲染）→ 双背景（底图 + 原生动图）
const presetBody = {
  preset: {
    schemaVersion: 1, id: 'layer-gif-test', name: 'GIF 图层验证', edition: 'standard', targetDshVersion: '0.1.0-rc.5',
    tokens: { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#111111' } },
    assets: [
      { id: layeredBase?.id, name: layeredBase?.name, mime: layeredBase?.mime },
      { id: animGifId, name: 'anim.gif', mime: 'image/gif' },
    ],
    widgets: [{ id: 'chat-background', params: { assetId: layeredBase?.id ?? '', opacity: '1', cropX: '0', cropY: '0', cropW: '1920', cropH: '1080' } }],
  },
}
await fetch(`${BASE}/ui-presets/presets/layer-gif-test`, {
  method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(presetBody),
})
await fetch(`${BASE}/ui-presets/active`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ activePresetId: 'layer-gif-test' }) })
await page.reload({ waitUntil: 'domcontentloaded' })
await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 120000 })
await page.waitForTimeout(3000)
const bg = await page.evaluate(() => {
  const el = document.querySelector('[data-conversation-scroll]')
  return el !== null ? getComputedStyle(el).backgroundImage : ''
})
check(`分层壁纸双背景渲染（底图 + 原生动图：${bg.slice(0, 90)}…）`,
  bg.includes(`/ui-presets/assets/${layeredBase?.id}`) && bg.includes(`/ui-presets/assets/${animGifId}`))

// 6. 清理
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
