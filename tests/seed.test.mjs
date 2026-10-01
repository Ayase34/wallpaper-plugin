// #108 出厂预设播种单测：内存端口（不碰真实文件系统）+ 假内容哈希。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { seedBuiltinPreset, buildBuiltinPreset, BUILTIN_PRESET_ID } from '../src/core/seed.ts'
import { validatePreset } from '../src/core/schema.ts'

/** 假素材：字节 = 名称长度填充（内容哈希用长度近似即可）。 */
function fakeAssets() {
  return [
    { id: 'asset-dsnm-chat', name: 'DeepSeek娘_聊天背景.jpg', mime: 'image/jpeg', bytes: new Uint8Array([1, 1, 1, 1]) },
    { id: 'asset-dsnm-sidebar', name: 'DeepSeek娘_侧栏海报.jpg', mime: 'image/jpeg', bytes: new Uint8Array([2, 2, 2]) },
    { id: 'asset-dsnm-settings', name: 'DeepSeek娘_设置卡背景图.jpg', mime: 'image/jpeg', bytes: new Uint8Array([3, 3]) },
  ]
}
const fakeHash = (bytes) => `len-${bytes.length}`

/** 内存端口（记录所有写入，便于断言幂等与「不抢用户数据」）。 */
function memoryPort(initial) {
  const state = {
    presets: new Map(Object.entries(initial?.presets ?? {})),
    assets: new Map(Object.entries(initial?.assets ?? {})),
    activePresetId: initial?.activePresetId ?? null,
    assetWrites: [],
    activeWrites: [],
  }
  return {
    state,
    port: {
      hasPreset: (id) => state.presets.has(id),
      writePreset: (id, preset) => { state.presets.set(id, preset) },
      readAssetMeta: (id) => state.assets.get(id) ?? null,
      writeAsset: (asset, sha256) => {
        state.assetWrites.push(asset.id)
        state.assets.set(asset.id, { id: asset.id, name: asset.name, mime: asset.mime, size: asset.bytes.length, sha256 })
      },
      activePresetId: () => state.activePresetId,
      writeActivePreset: (id) => { state.activePresetId = id; state.activeWrites.push(id) },
    },
  }
}

test('#108 全新环境：三张壁纸落库 + 写入 default 预设 + 自动应用', () => {
  const { state, port } = memoryPort({ activePresetId: null })
  const result = seedBuiltinPreset(port, fakeAssets(), fakeHash)
  assert.equal(result.seeded, true)
  assert.deepEqual(result.assetsWritten.sort(), ['asset-dsnm-chat', 'asset-dsnm-settings', 'asset-dsnm-sidebar'])
  assert.equal(result.assetsKept.length, 0)
  assert.equal(result.activated, true, '无活动预设时应自动应用出厂预设')
  assert.equal(state.activePresetId, BUILTIN_PRESET_ID)
  const preset = state.presets.get(BUILTIN_PRESET_ID)
  assert.equal(preset.name, '默认')
  assert.equal(preset.assets.length, 3)
  assert.equal(preset.widgets.length, 3)
  assert.ok(preset.cover !== undefined)
  // 部件引用必须全部指向内置素材（悬空引用会被 schema 拒）
  const ids = new Set(preset.assets.map(a => a.id))
  for (const widget of preset.widgets) assert.ok(ids.has(widget.params.assetId), `${widget.id} 引用应存在`)
  assert.equal(validatePreset(preset).ok, true)
})

test('#108 库中已有同名「默认」→ 不写预设（保留用户版本），但素材仍会修补', () => {
  const existing = { schemaVersion: 1, id: 'default', name: '我改过的默认', edition: 'standard', tokens: {} }
  const { state, port } = memoryPort({ presets: { default: existing }, activePresetId: 'default' })
  const result = seedBuiltinPreset(port, fakeAssets(), fakeHash)
  assert.equal(result.seeded, false)
  assert.ok((result.skippedReason ?? '').includes('保留用户版本'))
  assert.equal(state.presets.get('default'), existing, '原预设对象必须原样保留')
  assert.equal(state.activeWrites.length, 0, '不抢用户的活动预设')
  // #109：素材与预设解耦——缺失的内置素材要补齐，否则老用户永远拿不到修好的图
  assert.deepEqual(result.assetsWritten.sort(), ['asset-dsnm-chat', 'asset-dsnm-settings', 'asset-dsnm-sidebar'])
})

test('#109 老用户升级：素材内容变了 → 预设已存在也会更新素材', () => {
  const existing = { schemaVersion: 1, id: 'default', name: '默认', edition: 'standard', tokens: {} }
  const { state, port } = memoryPort({
    presets: { default: existing },
    assets: {
      // 旧版聊天背景（透明区被压成黑块）的尺寸/哈希
      'asset-dsnm-chat': { id: 'asset-dsnm-chat', name: '旧', mime: 'image/jpeg', size: 333616, sha256: 'len-333616' },
    },
    activePresetId: 'default',
  })
  const result = seedBuiltinPreset(port, fakeAssets(), fakeHash)
  assert.ok(result.assetsWritten.includes('asset-dsnm-chat'), '内容变了应更新')
  assert.equal(state.assets.get('asset-dsnm-chat').size, 4, 'meta 应刷新为新尺寸')
  assert.equal(result.seeded, false, '预设仍保留用户版本')
})

test('#108 幂等：素材已存在且内容一致 → 不重写；预设仍会补齐', () => {
  const assets = fakeAssets()
  const { state, port } = memoryPort({
    assets: {
      'asset-dsnm-chat': { id: 'asset-dsnm-chat', name: 'x', mime: 'image/jpeg', size: 4, sha256: 'len-4' },
      'asset-dsnm-sidebar': { id: 'asset-dsnm-sidebar', name: 'x', mime: 'image/jpeg', size: 3, sha256: 'len-3' },
      'asset-dsnm-settings': { id: 'asset-dsnm-settings', name: 'x', mime: 'image/jpeg', size: 2, sha256: 'len-2' },
    },
    activePresetId: null,
  })
  const result = seedBuiltinPreset(port, assets, fakeHash)
  assert.equal(result.seeded, true)
  assert.equal(result.assetsWritten.length, 0, '内容一致不应重写素材文件')
  assert.equal(result.assetsKept.length, 3)
  assert.equal(state.assetWrites.length, 0)
})

test('#108 素材被删：重新补回（内容不一致或缺失都算）', () => {
  const { state, port } = memoryPort({
    assets: {
      // 尺寸变了 → 视为被替换，需重写
      'asset-dsnm-chat': { id: 'asset-dsnm-chat', name: 'x', mime: 'image/jpeg', size: 999, sha256: 'len-999' },
    },
    activePresetId: null,
  })
  const result = seedBuiltinPreset(port, fakeAssets(), fakeHash)
  assert.ok(result.assetsWritten.includes('asset-dsnm-chat'), '内容不一致应重写')
  assert.ok(result.assetsWritten.includes('asset-dsnm-sidebar'), '缺失应补写')
  assert.equal(state.assets.get('asset-dsnm-chat').size, 4)
})

test('#108 已有其他活动预设 → 只播种不抢焦点', () => {
  const { state, port } = memoryPort({ activePresetId: 'preset-user-1' })
  const result = seedBuiltinPreset(port, fakeAssets(), fakeHash)
  assert.equal(result.seeded, true)
  assert.equal(result.activated, false)
  assert.equal(state.activePresetId, 'preset-user-1', '用户已选外观不得被改写')
  assert.equal(state.activeWrites.length, 0)
})

test('#108 buildBuiltinPreset 不依赖外部素材内容（纯结构）', () => {
  const preset = buildBuiltinPreset(fakeAssets())
  assert.equal(preset.id, 'default')
  assert.deepEqual(preset.tags, ['builtin', 'style:海洋清爽'])
  assert.equal(Object.keys(preset.tokens).length, 15, '令牌集应为出厂 15 项')
  // 令牌来源是 DEMO_DEFAULT_TOKENS——与出厂兜底一致（#107 的徽标修复值）
  assert.deepEqual(preset.tokens['--dsw-specific-sidebar-nav-item-active-accent'], { light: 'rgb(250, 252, 255)', dark: 'rgb(18, 34, 64)' })
})
