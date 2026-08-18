// controller 层单测（评审测试缺口：接线层零覆盖）。
// 通过 node 24 type stripping 直接 import src TS；stub 全局 fetch 与 theme。
import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { PresetsController } from '../src/client/controller.ts'

/** 可注入的 fake theme（与 engine.test 语义一致）。 */
function createFakeTheme() {
  const layers = new Map()
  return {
    layers,
    overrideTokens(source, tokens) {
      const layer = { source, tokens }
      layers.set(source, layer)
      return () => {
        if (layers.get(source) !== layer) return
        layers.delete(source)
      }
    },
  }
}

/** stub 全局 fetch：按 URL 精确匹配路由（未匹配 → 404）；handler 收到 (options, url)。 */
function stubFetch(routes) {
  const realFetch = globalThis.fetch
  globalThis.fetch = async (url, options) => {
    const key = String(url)
    const handler = routes[key] ?? routes['*']
    if (handler === undefined) return { ok: false, status: 404, json: async () => ({}) }
    const result = await handler(options ?? {}, String(url))
    return {
      ok: result.status >= 200 && result.status < 300,
      status: result.status,
      json: async () => result.body,
    }
  }
  return () => { globalThis.fetch = realFetch }
}

const createdControllers = []

function makeController(theme, routes) {
  const restore = stubFetch(routes)
  const controller = new PresetsController({ get: (name) => (name === 'theme' ? theme : undefined) })
  createdControllers.push(controller)
  return { controller, restore }
}

const demoPreset = (id) => ({
  schemaVersion: 1,
  id,
  name: id,
  edition: 'standard',
  tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } },
})

beforeEach(() => { })
afterEach(() => {
  // M5-2：node 的 BroadcastChannel 实例保持事件循环活跃——统一关闭防挂起。
  for (const c of createdControllers.splice(0)) c.closeSyncChannel()
})

test('savePreset 新建：草稿临时 id 同步为落盘 id（评审 P1-1 回归）', async () => {
  const theme = createFakeTheme()
  const writes = []
  const { controller, restore } = makeController(theme, {
    '*': async (options) => {
      if (options.method === 'PUT') {
        writes.push({ url: String(options.body ? JSON.parse(options.body).preset?.id : undefined) })
        return { status: 200, body: { ok: true } }
      }
      return { status: 200, body: {} }
    },
  })
  try {
    // 模拟"新建"流程：引擎草稿用临时 id 'draft-new'，保存时落盘 id = 'preset-abc'
    const draft = { schemaVersion: 1, id: 'draft-new', name: '新预设', edition: 'standard', tokens: {} }
    controller.engine.startDraft(draft)
    const saved = demoPreset('preset-abc')
    const ok = await controller.savePreset(saved, { activate: false })
    assert.equal(ok, true)
    // P1-1：引擎活动 id 必须等于落盘 id（不再是 draft-new）
    assert.equal(controller.engine.getState().activePresetId, 'preset-abc')
    assert.equal(theme.layers.has('ui-presets:preset-abc'), true)
  } finally { restore() }
})

test('savePreset 落盘失败：返回 false 且 lastError 设置', async () => {
  const theme = createFakeTheme()
  const { controller, restore } = makeController(theme, {
    '*': async () => ({ status: 500, body: { error: 'boom' } }),
  })
  try {
    const ok = await controller.savePreset(demoPreset('preset-x'))
    assert.equal(ok, false)
    assert.ok(controller.engine.getState().lastError?.includes('500'))
  } finally { restore() }
})

test('savePreset 无草稿（库副本保存）→ applyPreset 提升且持久化', async () => {
  const theme = createFakeTheme()
  let activePut = null
  const { controller, restore } = makeController(theme, {
    '*': async (options, url) => {
      if (options.method === 'PUT' && url.endsWith('/active')) {
        activePut = options.body
        return { status: 200, body: { ok: true } }
      }
      return { status: 200, body: { ok: true } }
    },
  })
  try {
    const ok = await controller.savePreset(demoPreset('preset-y'), { isNew: false, activate: true })
    assert.equal(ok, true)
    assert.equal(controller.engine.getState().activePresetId, 'preset-y')
    assert.ok(activePut?.includes('preset-y'))
  } finally { restore() }
})

test('deletePreset：删除活动预设清理活动引用与草稿', async () => {
  const theme = createFakeTheme()
  const { controller, restore } = makeController(theme, {
    '*': async (options) => {
      if (options.method === 'DELETE') return { status: 200, body: { ok: true } }
      return { status: 200, body: {} }
    },
  })
  try {
    controller.engine.applyPreset(demoPreset('preset-z'))
    assert.equal(controller.engine.getState().activePresetId, 'preset-z')
    const ok = await controller.deletePreset('preset-z')
    assert.equal(ok, true)
    assert.equal(controller.engine.getState().activePresetId, null, '删除活动预设必须清除活动引用')
  } finally { restore() }
})

test('importPresetFile：#93 仅支持 ZIP——JSON/文本文件明确拒绝', async () => {
  const theme = createFakeTheme()
  const { controller, restore } = makeController(theme, {
    '*': async () => ({ status: 200, body: {} }),
  })
  try {
    // 非 zip 魔数 → 拒绝（JSON 格式已移除，用户拍板只留 zip）
    const jsonFile = { size: 100, slice: () => ({ arrayBuffer: async () => new Uint8Array([0x7b, 0x22, 0x69, 0x64]) }) }
    const r1 = await controller.importPresetFile(jsonFile)
    assert.equal(r1.ok, false)
    assert.ok((r1.error ?? '').includes('ZIP'), `错误应指向 ZIP：${r1.error}`)
    // 太小 → 拒绝
    const tiny = await controller.importPresetFile({ size: 2, slice: async () => new Uint8Array(2) })
    assert.equal(tiny.ok, false)
  } finally { restore() }
})

test('applyPresetById：库中不存在 → 返回 false（失败可反馈）', async () => {
  const theme = createFakeTheme()
  const { controller, restore } = makeController(theme, {
    '*': async () => ({ status: 404, body: {} }),
  })
  try {
    const ok = await controller.applyPresetById('no-such-preset')
    assert.equal(ok, false)
  } finally { restore() }
})

// ---- #62 备份还原入口 ----

test('restoreBackup 成功：交换式还原（备份写回 + 当前版本入备份 + 不写 active）', async () => {
  const theme = createFakeTheme()
  const urls = []
  let putBody = null
  const { controller, restore } = makeController(theme, {
    '/ui-presets/presets/preset-x?backup=1': async () => ({
      status: 200,
      body: { backup: { ...demoPreset('preset-x'), name: '旧版' } },
    }),
    // 同一 URL 按方法分派（stubFetch 只按 URL 匹配）：PUT = 还原写回，GET = 取当前版本
    '/ui-presets/presets/preset-x': async (options) => {
      if (options.method === 'PUT') {
        putBody = JSON.parse(options.body)
        return { status: 200, body: { ok: true } }
      }
      return { status: 200, body: { preset: { ...demoPreset('preset-x'), name: '新版' } } }
    },
    '*': async (_options, url) => {
      urls.push(url)
      return { status: 200, body: {} }
    },
  })
  try {
    const result = await controller.restoreBackup('preset-x')
    assert.equal(result.ok, true)
    // 交换语义：preset.json 写回备份旧版；backup.json 存当前新版
    assert.equal(putBody.preset.name, '旧版')
    assert.equal(putBody.backup.name, '新版')
    // 纯库操作：不写 active、不激活引擎
    assert.equal(urls.some(u => u.includes('/active')), false)
    assert.equal(controller.engine.getState().activePresetId, null)
  } finally { restore() }
})

test('restoreBackup 无备份：返回错误且不发起 PUT', async () => {
  const theme = createFakeTheme()
  let putCount = 0
  const { controller, restore } = makeController(theme, {
    '/ui-presets/presets/preset-x?backup=1': async () => ({ status: 200, body: { backup: null } }),
    '*': async (options) => {
      if (options.method === 'PUT') putCount += 1
      return { status: 200, body: {} }
    },
  })
  try {
    const result = await controller.restoreBackup('preset-x')
    assert.equal(result.ok, false)
    assert.equal(result.error, '没有可用备份')
    assert.equal(putCount, 0)
  } finally { restore() }
})

test('restoreBackup 备份损坏（路由 422）：返回错误文案', async () => {
  const theme = createFakeTheme()
  const { controller, restore } = makeController(theme, {
    '/ui-presets/presets/preset-x?backup=1': async () => ({ status: 422, body: { error: '备份损坏：非法 JSON' } }),
    '*': async () => ({ status: 200, body: {} }),
  })
  try {
    const result = await controller.restoreBackup('preset-x')
    assert.equal(result.ok, false)
    assert.ok(result.error.includes('备份损坏'))
  } finally { restore() }
})

test('restoreBackup PUT 失败：返回 false 与错误信息', async () => {
  const theme = createFakeTheme()
  const { controller, restore } = makeController(theme, {
    '/ui-presets/presets/preset-x?backup=1': async () => ({
      status: 200,
      body: { backup: demoPreset('preset-x') },
    }),
    '/ui-presets/presets/preset-x': async (options) => {
      if (options.method === 'PUT') return { status: 500, body: { error: '写入失败' } }
      return { status: 200, body: { preset: demoPreset('preset-x') } }
    },
    '*': async () => ({ status: 200, body: {} }),
  })
  try {
    const result = await controller.restoreBackup('preset-x')
    assert.equal(result.ok, false)
    assert.ok(result.error.includes('写入失败'))
  } finally { restore() }
})

test('listPresets：透传 hasBackup（内置恒 false，库条目按列表值）', async () => {
  const theme = createFakeTheme()
  const { controller, restore } = makeController(theme, {
    '/ui-presets/presets': async () => ({
      status: 200,
      body: {
        presets: [
          { id: 'lib-a', name: 'A', edition: 'standard', hasBackup: true },
          { id: 'lib-b', name: 'B', edition: 'standard', hasBackup: false },
        ],
      },
    }),
    '*': async () => ({ status: 200, body: {} }),
  })
  try {
    const list = await controller.listPresets()
    const libA = list.find(p => p.id === 'lib-a')
    const libB = list.find(p => p.id === 'lib-b')
    assert.equal(libA?.hasBackup, true)
    assert.equal(libB?.hasBackup, false)
    for (const demo of list.filter(p => p.builtin)) assert.equal(demo.hasBackup, false)
  } finally { restore() }
})

test('#97 listPresets：库预设遮蔽同 id 内置示例（保位替换——生效预设上墙）', async () => {
  const theme = createFakeTheme()
  const { controller, restore } = makeController(theme, {
    '/ui-presets/presets': async () => ({
      status: 200,
      body: {
        presets: [
          // 库中 default = 用户改过的出厂预设（含手设封面/壁纸）——遮蔽 demo default
          { id: 'default', name: '默认（库版）', edition: 'standard', hasBackup: true },
          { id: 'lib-x', name: 'X', edition: 'standard' },
        ],
      },
    }),
    '*': async () => ({ status: 200, body: {} }),
  })
  try {
    const list = await controller.listPresets()
    const entry = list.find(p => p.id === 'default')
    assert.ok(entry !== undefined, '同 id 只保留一个条目')
    assert.equal(entry?.builtin, false, '遮蔽后是库条目（非内置）')
    assert.equal(entry?.name, '默认（库版）', '名称来自库版本')
    assert.equal(entry?.hasBackup, true, 'hasBackup 来自库版本')
    const demoCount = list.filter(p => p.id === 'default' && p.builtin).length
    assert.equal(demoCount, 0, 'demo 条目必须被替换而非并存')
    assert.equal(list[0]?.id, 'default', '保位替换：遮蔽条目仍在 demo 原位置（墙首卡）')
    assert.equal(list.find(p => p.id === 'lib-x')?.builtin, false)
  } finally { restore() }
})

// ---- #63 P0-1：活动预设内容更新即时生效（桥 id 相同重应用 + 防自激） ----

test('applyPresetById 已活动预设重应用：引擎重挂但不再写 active（防 revision 自激）', async () => {
  const theme = createFakeTheme()
  let activePuts = 0
  const preset = { ...demoPreset('preset-x'), name: '版本一' }
  const { controller, restore } = makeController(theme, {
    '/ui-presets/presets/preset-x': async () => ({ status: 200, body: { preset } }),
    '/ui-presets/active': async (options) => {
      if (options.method === 'PUT') activePuts += 1
      return { status: 200, body: { activePresetId: null, revision: 0 } }
    },
    '*': async () => ({ status: 200, body: {} }),
  })
  try {
    // 首次应用：切换 → 写 active（revision+1）
    const first = await controller.applyPresetById('preset-x')
    assert.equal(first, true)
    assert.equal(activePuts, 1)
    // 内容更新后重应用（外部 preset_update 更新活动预设 → 桥发现 revision 变化、id 相同 → 重应用）：
    // 引擎重挂新内容，但 active 指针未变 → 不得再写 active（否则 revision 再 +1 → 桥再触发 → 自激）
    const second = await controller.applyPresetById('preset-x')
    assert.equal(second, true)
    assert.equal(activePuts, 1, '重应用不得重复写 active.json')
    assert.equal(controller.engine.getState().activePresetId, 'preset-x')
  } finally { restore() }
})
