// M2-5 zip 三件套 e2e：路由级导出（三件套解析）/ UI 导出按钮下载 / UI zip 导入（冲突后缀）/
// #94 分层规格随包往返（导出携带 layers → 导入还原素材 meta）。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'
import { zipStore, parseZip } from '../src/node/zip-util.ts'
import { DEMO_PRESETS } from '../src/client/demo.ts'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
const dec = new TextDecoder()

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

// ---- 1. 路由级导出：三件套 ----
const demo = DEMO_PRESETS[0]
const exportRes = await fetch(`${BASE}/ui-presets/export-zip`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ preset: demo }),
})
check('export-zip 返回 200 + application/zip', exportRes.ok && exportRes.headers.get('content-type')?.includes('application/zip'))
const zipBytes = new Uint8Array(await exportRes.arrayBuffer())
check('zip 魔数 PK', zipBytes[0] === 0x50 && zipBytes[1] === 0x4b)
const { entries, errors: zipErrors } = parseZip(zipBytes)
check(`zip 解析无错误（${zipErrors.join(';')}）`, zipErrors.length === 0)
const byName = Object.fromEntries(entries.map(e => [e.name, dec.decode(e.data)]))
check('三件套齐全（preset.json/cover.svg/manifest.json）', byName['preset.json'] !== undefined && byName['cover.svg'] !== undefined && byName['manifest.json'] !== undefined)
const exported = JSON.parse(byName['preset.json'])
check('preset.json 内容一致', exported.id === demo.id && exported.name === demo.name)
check('cover.svg 含预设名', byName['cover.svg'].includes(demo.name))
const manifest = JSON.parse(byName['manifest.json'])
check('manifest 含 id/版本', manifest.id === demo.id && manifest.version === 1)

// ---- 2. UI：打开工作室 → 编辑 → 导出 ZIP 按钮下载 ----
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
check('导出 ZIP 按钮存在', await studio.getByRole('button', { name: '导出 ZIP' }).count() === 1)
const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 20000 }),
  studio.getByRole('button', { name: '导出 ZIP' }).click(),
])
const dlPath = await download.path()
const dlBytes = new Uint8Array(await (await import('node:fs/promises')).readFile(dlPath))
const { entries: dlEntries, errors: dlErrors } = parseZip(dlBytes)
check(`UI 下载的 zip 可解析（${dlErrors.join(';')}）`, dlErrors.length === 0 && dlEntries.length === 3)

// ---- 3. UI zip 导入（含冲突后缀） ----
const importPreset = {
  schemaVersion: 1,
  id: 'zip-imported-preset',
  name: 'ZIP 导入预设',
  edition: 'standard',
  tokens: { '--dsw-alias-bg-base': { light: '#f0f0f0', dark: '#101010' } },
}
const importZip = zipStore([
  { name: 'preset.json', data: new TextEncoder().encode(JSON.stringify(importPreset, null, 2)) },
  { name: 'cover.svg', data: new TextEncoder().encode('<svg/>') },
])
const fileInput = studio.locator('input[type="file"][accept*=".zip"]')
await fileInput.setInputFiles({ name: 'preset.zip', mimeType: 'application/zip', buffer: Buffer.from(importZip) })
await studio.locator('[data-up-studio-status]').getByText('已导入 zip-imported-preset').waitFor({ timeout: 15000 })
check('zip 导入成功提示', errors.length === 0)
// 冲突导入 → 后缀
await fileInput.setInputFiles({ name: 'preset.zip', mimeType: 'application/zip', buffer: Buffer.from(importZip) })
await studio.locator('[data-up-studio-status]').getByText('已导入 zip-imported-preset-imported').waitFor({ timeout: 15000 })
check('冲突导入生成后缀不覆盖', errors.length === 0)
const list = await (await fetch(`${BASE}/ui-presets/presets`)).json()
const ids = (list.presets ?? []).map(p => p.id)
check(`库中两条导入（${ids.join(',')}）`, ids.includes('zip-imported-preset') && ids.includes('zip-imported-preset-imported'))

// ---- 4. #94 分层规格随 zip 往返（导出携带 layers → 导入还原素材 meta） ----
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
const layersParam = encodeURIComponent(JSON.stringify({ animAssetId: 'asset-aaa111', x: 10, y: 20, w: 200, h: 150 }))
const upBase = await fetch(`${BASE}/ui-presets/assets?name=layered-base.png&mime=image/png&layers=${layersParam}`, {
  method: 'PUT', headers: { 'content-type': 'image/png' }, body: TINY_PNG,
})
const baseBody = await upBase.json()
check('分层底图上传成功（layers 随 meta）', upBase.ok && typeof baseBody.id === 'string')
const layeredPreset = {
  schemaVersion: 1,
  id: 'layered-roundtrip',
  name: '分层往返',
  edition: 'standard',
  tokens: { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#111111' } },
  assets: [{ id: baseBody.id, name: 'layered-base.png', mime: 'image/png' }],
}
const expRes = await fetch(`${BASE}/ui-presets/export-zip`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ preset: layeredPreset }),
})
const expBytes = new Uint8Array(await expRes.arrayBuffer())
const { entries: expEntries } = parseZip(expBytes)
const exportedLayers = JSON.parse(dec.decode(expEntries.find(e => e.name === 'preset.json').data))
check(`zip 导出携带 layers 规格（animAssetId=${exportedLayers.assets?.[0]?.layers?.animAssetId}）`,
  exportedLayers.assets?.[0]?.layers?.animAssetId === 'asset-aaa111'
  && exportedLayers.assets?.[0]?.layers?.w === 200
  && exportedLayers.assets?.[0]?.dataUrl?.startsWith('data:image/png'))
// 清空库 → 导入 zip → 素材 meta 还原（分层渲染数据随包走）
for (const a of ((await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? [])) {
  await fetch(`${BASE}/ui-presets/assets/${encodeURIComponent(a.id)}`, { method: 'DELETE' }).catch(() => {})
}
const impRes = await fetch(`${BASE}/ui-presets/import-zip`, {
  method: 'POST', headers: { 'content-type': 'application/zip' }, body: expBytes,
})
const impBody = await impRes.json()
check('分层 zip 导入成功', impRes.ok && impBody.ok === true)
const metasAfter = (await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? []
const restoredMeta = metasAfter.find(a => a.id === baseBody.id)
check(`导入后分层 meta 还原（layers.animAssetId=${restoredMeta?.layers?.animAssetId} w=${restoredMeta?.layers?.w}）`,
  restoredMeta?.layers?.animAssetId === 'asset-aaa111' && restoredMeta?.layers?.w === 200)

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
