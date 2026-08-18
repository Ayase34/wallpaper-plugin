// M2-7 PresetSource 占位：注册表生命周期 / controller 加载与列表回退链（库→demo→源）。
// .mjs 纯 JS；stub 全局 fetch（与 controller.test 同款模式）。
import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { registerPresetSource, listPresetSources, findPresetSource } from '../src/core/preset-source.ts'
import { PresetsController } from '../src/client/controller.ts'

const REMOTE_PRESET = {
  schemaVersion: 1,
  id: 'remote-ocean',
  name: '远端海洋',
  edition: 'standard',
  tokens: { '--dsw-alias-bg-base': { light: '#eeeeff', dark: '#111122' } },
}

function fakeSource(overrides = {}) {
  return {
    id: 'fake-remote',
    name: '假远程源',
    list: async () => [{ id: 'remote-ocean', name: '远端海洋', edition: 'standard' }],
    get: async (id) => (id === 'remote-ocean' ? REMOTE_PRESET : null),
    ...overrides,
  }
}

function stubFetch(routes) {
  const realFetch = globalThis.fetch
  globalThis.fetch = async (url, options) => {
    const key = String(url)
    const handler = routes[key] ?? routes['*']
    if (handler === undefined) return { ok: false, status: 404, json: async () => ({}) }
    const result = await handler(options ?? {}, String(url))
    return { ok: result.status >= 200 && result.status < 300, status: result.status, json: async () => result.body }
  }
  return () => { globalThis.fetch = realFetch }
}

const createdControllers = []

function makeController(routes) {
  const restore = stubFetch(routes)
  const controller = new PresetsController({ get: (name) => (name === 'theme' ? { overrideTokens: () => () => {} } : undefined) })
  createdControllers.push(controller)
  return { controller, restore }
}

const unregisters = []
afterEach(() => {
  for (const unregister of unregisters.splice(0)) unregister()
  // M5-2：node 的 BroadcastChannel 实例保持事件循环活跃——统一关闭防挂起。
  for (const c of createdControllers.splice(0)) c.closeSyncChannel()
})

test('注册表：注册/查/列/注销', () => {
  assert.deepEqual(listPresetSources(), [])
  const unregister = registerPresetSource(fakeSource())
  assert.equal(findPresetSource('fake-remote')?.name, '假远程源')
  assert.equal(listPresetSources().length, 1)
  unregister()
  assert.equal(findPresetSource('fake-remote'), undefined)
})

test('加载回退链：库 404 + demo 无 → 源命中', async () => {
  registerPresetSource(fakeSource())
  const { controller, restore } = makeController({})
  try {
    const preset = await controller.loadPreset('remote-ocean')
    assert.ok(preset !== null)
    assert.equal(preset.id, 'remote-ocean')
    assert.equal(preset.name, '远端海洋')
  } finally { restore() }
})

test('加载回退链：demo 优先于源（同名 id）', async () => {
  registerPresetSource(fakeSource({ get: async () => REMOTE_PRESET }))
  const { controller, restore } = makeController({})
  try {
    const preset = await controller.loadPreset('default')
    assert.ok(preset !== null)
    assert.equal(preset.name, '默认') // demo 内置（源同名也不覆盖）
  } finally { restore() }
})

test('加载回退链：源返回非法数据 → 跳过不崩', async () => {
  registerPresetSource(fakeSource({ get: async () => ({ bad: true }) }))
  const { controller, restore } = makeController({})
  try {
    const preset = await controller.loadPreset('remote-ocean')
    assert.equal(preset, null)
  } finally { restore() }
})

test('列表合并：源条目出现在预设墙（不重复 demo）', async () => {
  registerPresetSource(fakeSource())
  const { controller, restore } = makeController({})
  try {
    const list = await controller.listPresets()
    assert.ok(list.some(p => p.id === 'remote-ocean' && p.builtin === false))
    assert.equal(list.filter(p => p.id === 'default').length, 1)
  } finally { restore() }
})

test('列表合并：源抛错被隔离', async () => {
  registerPresetSource(fakeSource({ list: async () => { throw new Error('boom') } }))
  const { controller, restore } = makeController({})
  try {
    const list = await controller.listPresets()
    assert.ok(list.some(p => p.id === 'default'))
  } finally { restore() }
})
