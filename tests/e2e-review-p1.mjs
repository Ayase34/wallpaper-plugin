// review P1-3/P1-4 修复 e2e：
// ① 删除库级素材 → 库中其他预设的引用被自动清空（stripAssetRefsFromPresets）；
// ② zip 导入 demo id 冲突 → 生成 -imported 后缀，不遮蔽内置预设（listLibraryIds 合并 demo）。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
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
const assetList = await (await fetch(`${BASE}/ui-presets/assets`)).json()
for (const a of assetList.assets ?? []) {
  await fetch(`${BASE}/ui-presets/assets/${encodeURIComponent(a.id)}`, { method: 'DELETE' }).catch(() => {})
}

let pass = 0
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`)
  if (!cond) process.exitCode = 1
  if (cond) pass += 1
}

// ---- ① 素材删除清引用 ----
// 上传素材（作为共享壁纸库文件）
const upload = await fetch(`${BASE}/ui-presets/assets?name=shared.png&mime=image/png`, {
  method: 'PUT',
  headers: { 'content-type': 'image/png' },
  body: Buffer.from(PNG_BASE64, 'base64'),
})
const uploaded = await upload.json()
const assetId = uploaded.id
check('测试素材已上传', upload.ok && typeof assetId === 'string')

// 建两个引用该素材的预设（库级）
const refPreset = (id, name) => ({
  schemaVersion: 1,
  edition: 'standard',
  id,
  name,
  targetDshVersion: '0.1.0-rc.5',
  tokens: { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' } },
  assets: [{ id: assetId, name: 'shared.png', mime: 'image/png' }],
  widgets: [{ id: 'chat-background', params: { assetId } }],
})
await fetch(`${BASE}/ui-presets/presets/ref-a`, {
  method: 'PUT', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ preset: refPreset('ref-a', '引用预设 A') }),
})
await fetch(`${BASE}/ui-presets/presets/ref-b`, {
  method: 'PUT', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ preset: refPreset('ref-b', '引用预设 B') }),
})

// 删除素材 → 服务端应返回 refCount=2 且两预设引用被清空
const del = await fetch(`${BASE}/ui-presets/assets/${encodeURIComponent(assetId)}`, { method: 'DELETE' })
const delBody = await del.json()
check(`删除素材返回引用信息（refCount=${delBody.refCount} cleaned=${delBody.cleanedPresets}）`,
  del.ok && delBody.refCount === 2 && delBody.cleanedPresets === 2)
const refA = (await (await fetch(`${BASE}/ui-presets/presets/ref-a`)).json()).preset
const refB = (await (await fetch(`${BASE}/ui-presets/presets/ref-b`)).json()).preset
check('预设 A 的 assets 引用已清空', !(refA.assets ?? []).some(a => a.id === assetId))
check('预设 A 的部件引用已清空', (refA.widgets ?? []).every(w => Object.values(w.params ?? {}).every(v => v !== assetId)))
check('预设 B 的引用同样清空', !(refB.assets ?? []).some(a => a.id === assetId)
  && (refB.widgets ?? []).every(w => Object.values(w.params ?? {}).every(v => v !== assetId)))

// ---- ② zip 导入 demo id 冲突 ----
// 构造 default id 的 zip（三件套：preset.json + cover.svg + manifest.json）——
// #82 唯一出厂预设 id，导入必须生成冲突后缀
const { zipStore } = await import('../src/node/zip-util.ts')
const demoZip = zipStore([
  { name: 'preset.json', data: new TextEncoder().encode(JSON.stringify({
    schemaVersion: 1,
    id: 'default',
    name: '遮蔽测试',
    edition: 'standard',
    targetDshVersion: '0.1.0-rc.5',
    tokens: { '--dsw-alias-bg-base': { light: '#123456', dark: '#654321' } },
  })) },
  { name: 'cover.svg', data: new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>') },
  { name: 'manifest.json', data: new TextEncoder().encode(JSON.stringify({ id: 'default', name: '遮蔽测试' })) },
])
const zipRes = await fetch(`${BASE}/ui-presets/import-zip`, {
  method: 'POST',
  headers: { 'content-type': 'application/zip' },
  body: Buffer.from(demoZip),
})
const zipBody = await zipRes.json()
check(`demo id zip 导入生成冲突后缀（id=${zipBody.id}）`, zipRes.ok && zipBody.id === 'default-imported')
const libAfter = await (await fetch(`${BASE}/ui-presets/presets`)).json()
check('库中存在 default-imported 且无 default 遮蔽', libAfter.presets.some(p => p.id === 'default-imported')
  && !libAfter.presets.some(p => p.id === 'default'))

// ---- ③ 素材 id 冲突保留引用（#93：zip 与库同 id 必为同一文件——重写 refs 而 widgets 未跟改
// 导致"导入自己导出的 zip 报已损坏"；修复为保留引用 + 不覆盖既有库文件） ----
// 先建一个库素材 id，再 zip 导入同 id 内嵌素材 → 引用保留原 id（不重写、不覆盖）
await fetch(`${BASE}/ui-presets/assets?name=keep.png&mime=image/png`, {
  method: 'PUT',
  headers: { 'content-type': 'image/png' },
  body: Buffer.from(PNG_BASE64, 'base64'),
})
const keepList = await (await fetch(`${BASE}/ui-presets/assets`)).json()
const keepId = keepList.assets.find(a => a.name === 'keep.png')?.id
check('库中存在 keep.png（冲突源）', typeof keepId === 'string')
const clashZip = zipStore([
  { name: 'preset.json', data: new TextEncoder().encode(JSON.stringify({
    schemaVersion: 1,
    id: 'clash-test',
    name: '冲突测试',
    edition: 'standard',
    targetDshVersion: '0.1.0-rc.5',
    tokens: {},
    assets: [{ id: keepId, name: 'keep.png', mime: 'image/png', dataUrl: `data:image/png;base64,${PNG_BASE64}` }],
    widgets: [{ id: 'chat-background', params: { assetId: keepId, opacity: '1' } }],
  })) },
  { name: 'cover.svg', data: new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>') },
  { name: 'manifest.json', data: new TextEncoder().encode(JSON.stringify({})) },
])
const clashRes = await fetch(`${BASE}/ui-presets/import-zip`, {
  method: 'POST',
  headers: { 'content-type': 'application/zip' },
  body: Buffer.from(clashZip),
})
const clashBody = await clashRes.json()
check('冲突 zip 导入成功', clashRes.ok && clashBody.id === 'clash-test')
const clashPreset = (await (await fetch(`${BASE}/ui-presets/presets/clash-test`)).json()).preset
const storedId = clashPreset.assets?.[0]?.id
check(`同 id 素材保留引用（${storedId} === ${keepId}——不重写，widgets 引用不断裂）`,
  typeof storedId === 'string' && storedId === keepId)
check('导入预设 widgets 引用有效（assetId === keepId）',
  clashPreset.widgets?.[0]?.params?.assetId === keepId)
const keepMeta = await (await fetch(`${BASE}/ui-presets/assets`)).json()
check('既有库文件未被覆盖（keep.png 仍在且唯一）',
  keepMeta.assets.filter(a => a.id === keepId).length === 1)

console.log(`\n${pass} checks passed`)
process.exit(process.exitCode ?? 0)
