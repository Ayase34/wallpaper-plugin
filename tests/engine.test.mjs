// preset-core 应用引擎测试：应用/切换/停用/草稿/损坏回退（fake theme adapter）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PresetEngine, compilePreset, validatePreset } from '../lib/core.mjs'

/** fake theme：记录 overrideTokens 调用与 disposer。
 * disposer 模拟真实 ui-theme 语义：同 source 已被新层替换 → 旧 disposer no-op。 */
function createFakeTheme() {
  const layers = new Map() // source -> layer 对象
  const calls = []
  return {
    layers,
    calls,
    overrideTokens(source, tokens) {
      calls.push(['override', source, Object.keys(tokens).length])
      if (source === 'ui-presets:broken') throw new Error('boom: override rejected')
      const layer = { source, tokens }
      layers.set(source, layer)
      return () => {
        if (layers.get(source) !== layer) return // 已被替换 → no-op（真实语义）
        layers.delete(source)
        calls.push(['dispose', source])
      }
    },
  }
}

const presetOf = (id, extra = {}) => {
  const result = validatePreset({
    schemaVersion: 1,
    id,
    name: id,
    edition: 'standard',
    tokens: { '--dsw-alias-bg-base': { light: '#111', dark: '#222' } },
    ...extra,
  })
  assert.equal(result.ok, true)
  return result.ok ? result.preset : null
}

function makeEngine(theme, opts = {}) {
  return new PresetEngine({ theme, currentDshVersion: opts.currentDshVersion })
}

test('应用预设：挂载 overrideTokens 层并记录活动 id', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme)
  assert.equal(engine.applyPreset(presetOf('a')), true)
  assert.ok(theme.layers.has('ui-presets:a'))
  assert.equal(engine.getState().activePresetId, 'a')
})

test('切换预设：旧层 disposer 被调用，新层生效', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme)
  engine.applyPreset(presetOf('a'))
  engine.applyPreset(presetOf('b'))
  assert.ok(!theme.layers.has('ui-presets:a'))
  assert.ok(theme.layers.has('ui-presets:b'))
  assert.equal(engine.getState().activePresetId, 'b')
})

test('停用：dispose 清空全部层', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme)
  engine.applyPreset(presetOf('a'))
  engine.dispose()
  assert.equal(theme.layers.size, 0)
  assert.equal(engine.getState().activePresetId, null)
})

test('损坏回退：overrideTokens 抛错 → 返回 false、lastError 设置、旧层保留', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme)
  engine.applyPreset(presetOf('good'))
  const ok = engine.applyPreset(presetOf('broken'))
  assert.equal(ok, false)
  assert.ok(theme.layers.has('ui-presets:good'), '旧活动层必须保留')
  assert.ok(!theme.layers.has('ui-presets:broken'))
  assert.equal(engine.getState().activePresetId, 'good')
  assert.ok(engine.getState().lastError?.includes('boom'))
})

test('损坏回退：首次应用即失败 → 无活动预设', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme)
  assert.equal(engine.applyPreset(presetOf('broken')), false)
  assert.equal(engine.getState().activePresetId, null)
  assert.equal(theme.layers.size, 0)
})

test('版本契约：不兼容预设被拒绝且不污染状态', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme, { currentDshVersion: '0.1.0' })
  engine.applyPreset(presetOf('good'))
  const ok = engine.applyPreset(presetOf('future', { minDshVersion: '9.0.0' }))
  assert.equal(ok, false)
  assert.equal(engine.getState().activePresetId, 'good')
  assert.ok(engine.getState().lastError?.includes('要求 DSH'))
})

test('草稿生命周期：startDraft → updateDraft → discardDraft → saveDraftAsActive', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme)
  engine.applyPreset(presetOf('base'))
  assert.equal(engine.startDraft(presetOf('draft1')), true)
  assert.equal(engine.getState().hasDraft, true)
  assert.equal(engine.getState().draftPresetId, 'draft1')
  assert.ok(theme.layers.has('ui-presets:draft1'))
  assert.ok(theme.layers.has('ui-presets:base'), '活动层与草稿层并存')

  // updateDraft 替换草稿层
  assert.equal(engine.updateDraft(presetOf('draft2')), true)
  assert.ok(!theme.layers.has('ui-presets:draft1'))
  assert.ok(theme.layers.has('ui-presets:draft2'))
  assert.equal(engine.getState().draftPresetId, 'draft2')

  // 放弃草稿：草稿层移除，活动层可见
  engine.discardDraft()
  assert.equal(engine.getState().hasDraft, false)
  assert.ok(!theme.layers.has('ui-presets:draft2'))
  assert.ok(theme.layers.has('ui-presets:base'))

  // 重新起草稿并保存为活动
  engine.startDraft(presetOf('final'))
  assert.equal(engine.saveDraftAsActive(), true)
  assert.equal(engine.getState().activePresetId, 'final')
  assert.equal(engine.getState().hasDraft, false)
  assert.ok(theme.layers.has('ui-presets:final'))
  assert.ok(!theme.layers.has('ui-presets:base'))
})

test('无草稿时 saveDraftAsActive 为 no-op', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme)
  engine.applyPreset(presetOf('a'))
  assert.equal(engine.saveDraftAsActive(), false)
  assert.equal(engine.getState().activePresetId, 'a')
})

test('revertToLastActive：失败后还原到上一个好预设', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme)
  engine.applyPreset(presetOf('good'))
  engine.applyPreset(presetOf('broken'))
  // 损坏回退已把状态还原到 good；revert 无需动作
  assert.equal(engine.revertToLastActive(), false)
  assert.equal(engine.getState().activePresetId, 'good')
})

test('onStateChange 回调触发且带单调 revision', () => {
  const theme = createFakeTheme()
  const states = []
  const engine = new PresetEngine({ theme, onStateChange: s => states.push(s) })
  engine.applyPreset(presetOf('a'))
  engine.discardDraft()
  assert.equal(states.length, 1)
  assert.equal(states[0].activePresetId, 'a')
  assert.equal(states[0].revision, 1)
})

test('onStateChange 监听器抛错被隔离，applyPreset 零抛错契约成立（评审 P0-2）', () => {
  const theme = createFakeTheme()
  const engine = new PresetEngine({
    theme,
    onStateChange: () => { throw new Error('listener boom') },
  })
  // 成功路径不得抛
  assert.equal(engine.applyPreset(presetOf('good')), true)
  assert.equal(engine.getState().activePresetId, 'good')
  // 失败路径（损坏回退）也不得抛；lastError 记录的是挂载错误而非监听器错误
  assert.equal(engine.applyPreset(presetOf('broken')), false)
  assert.equal(engine.getState().activePresetId, 'good')
  assert.ok(engine.getState().lastError?.includes('boom: override rejected'))
})

test('clearActive（dispose）后 revertToLastActive 不得谎报成功（评审 P1-3）', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme)
  engine.applyPreset(presetOf('a'))
  engine.dispose() // 还原默认
  assert.equal(engine.revertToLastActive(), false)
  assert.equal(engine.getState().activePresetId, null)
  assert.equal(theme.layers.size, 0)
})

test('startDraft 失败保留旧草稿（评审 P1-4）', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme)
  engine.applyPreset(presetOf('base'))
  assert.equal(engine.startDraft(presetOf('draft1')), true)
  // draft2 挂载失败（fake theme 对 ui-presets:broken 抛错）→ 旧草稿 draft1 保留
  assert.equal(engine.startDraft(presetOf('broken')), false)
  assert.ok(theme.layers.has('ui-presets:draft1'), '旧草稿层必须保留')
  assert.equal(engine.getState().hasDraft, true)
  assert.equal(engine.getState().draftPresetId, 'draft1')
})

test('compilePreset 过滤花括号逃逸的 css 补丁（评审 P0-3 双保险）', () => {
  const result = validatePreset({
    schemaVersion: 1,
    id: 'css-demo',
    name: 'css',
    edition: 'standard',
    tokens: {},
    css: [{ selector: '[data-x]', rules: 'color: red' }],
  })
  assert.equal(result.ok, true)
  if (result.ok) {
    const compiled = compilePreset(result.preset)
    assert.ok(compiled.css?.text.includes('[data-x] { color: red }'))
  }
  // 绕过 validate 直接构造（防御路径）：花括号 rules 被 compile 过滤
  const raw = {
    schemaVersion: 1,
    id: 'css-attack',
    name: 'css',
    edition: 'standard',
    tokens: {},
    extra: { css: [{ selector: '[data-x]', rules: '} body { display: none }' }] },
  }
  const compiled = compilePreset(raw)
  assert.equal(compiled.css, undefined, '花括号逃逸的 rules 不得进入注入面')
})

// ---- M1 引擎扩展测试 ----

test('patchDraft：差分更新仅变更令牌，基线完整（M1 性能红线保障）', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme)
  const base = presetOf('edit', {
    tokens: {
      '--a': { light: '#111', dark: '#222' },
      '--b': { light: '#333', dark: '#444' },
    },
  })
  assert.equal(engine.startDraft(base), true)
  // 第一次调用 overrideTokens 应携带完整基线
  const firstCall = theme.calls.filter(c => c[0] === 'override').at(-1)
  assert.equal(firstCall[2], 2)
  // 差分：只改 --a
  const patched = { ...base, tokens: { '--a': { light: '#aaa', dark: '#bbb' }, '--b': { light: '#333', dark: '#444' } } }
  assert.equal(engine.patchDraft(patched, ['--a']), true)
  const lastCall = theme.calls.filter(c => c[0] === 'override').at(-1)
  assert.equal(lastCall[2], 2, '同 source 重写必须携带完整令牌（防旧键残留）')
  // 快照（双值）反映变更
  const snapshot = engine.getDraftCompiled()
  assert.equal(snapshot?.tokens['--a'].light, '#aaa')
  assert.equal(snapshot?.tokens['--b'].light, '#333')
  // 无草稿时 patchDraft 等价 startDraft
  engine.discardDraft()
  assert.equal(engine.patchDraft(base, ['--a']), true)
  assert.equal(engine.getState().hasDraft, true)
})

test('patchDraft 后 discard/dispose 必须移除全部层（M1 泄漏修复）', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme)
  const base = presetOf('edit', {
    tokens: { '--a': { light: '#111', dark: '#222' } },
  })
  engine.startDraft(base)
  // 多次差分更新（每次 overrideTokens 同 source 重写）
  engine.patchDraft({ ...base, tokens: { '--a': { light: '#333', dark: '#444' } } }, ['--a'])
  engine.patchDraft({ ...base, tokens: { '--a': { light: '#555', dark: '#666' } } }, ['--a'])
  assert.equal(theme.layers.size, 1, '同 source 只有一层')
  // 放弃草稿 → 层必须全部移除（旧实现泄漏最新层）
  engine.discardDraft()
  assert.equal(theme.layers.size, 0, 'discardDraft 必须移除全部草稿层')

  // 保存路径同样不得泄漏
  engine.startDraft(base)
  engine.patchDraft({ ...base, tokens: { '--a': { light: '#777', dark: '#888' } } }, ['--a'])
  engine.saveDraftAsActive()
  engine.dispose()
  assert.equal(theme.layers.size, 0, 'dispose 必须移除经 patchDraft 更新过的活动层')
})

test('patchDraft 令牌移除语义（评审 P1-2）：撤销到空令牌必须清空层与快照', () => {
  const theme = createFakeTheme()
  const engine = makeEngine(theme)
  const base = presetOf('edit', { tokens: {} })
  assert.equal(engine.startDraft(base), true)
  // 编辑添加一个令牌
  const withToken = { ...base, tokens: { '--x': { light: '#111', dark: '#222' } } }
  assert.equal(engine.patchDraft(withToken, ['--x']), true)
  assert.ok(theme.layers.has('ui-presets:edit'))
  assert.equal(engine.getDraftCompiled()?.tokens['--x'].light, '#111')
  // 撤销：令牌被移除（空 tokens）——层与快照必须清空（旧实现提前 return 残留）
  assert.equal(engine.patchDraft(base, ['--x']), true)
  assert.equal(engine.getDraftCompiled()?.tokens['--x'], undefined, '快照不得残留已撤销令牌')
  const layer = theme.layers.get('ui-presets:edit')
  assert.equal(layer?.tokens['--x'], undefined, '主题层不得残留已撤销令牌')
  // 无差异时短路（不重挂、不发状态）
  const beforeRevision = engine.getState().revision
  assert.equal(engine.patchDraft(base), true)
  assert.equal(engine.getState().revision, beforeRevision, '无差异 patchDraft 不得触发状态变化')
})

test('getActiveCompiled/getDraftCompiled：预览改前/改后取数（双值）', () => {
  const theme = createFakeTheme()
  theme.getScheme = () => 'dark'
  const engine = makeEngine(theme)
  engine.applyPreset(presetOf('base', {
    tokens: { '--a': { light: '#111', dark: '#222' } },
  }))
  const active = engine.getActiveCompiled()
  assert.equal(active.tokens['--a'].light, '#111')
  assert.equal(active.tokens['--a'].dark, '#222', '双值完整（预览明暗切换无需重新取数）')
  engine.startDraft(presetOf('draft', {
    tokens: { '--a': { light: '#999', dark: '#888' } },
  }))
  const draft = engine.getDraftCompiled()
  assert.equal(draft?.tokens['--a'].light, '#999')
  engine.discardDraft()
  assert.equal(engine.getDraftCompiled(), null)
  // 保存后草稿快照提升为活动快照
  engine.startDraft(presetOf('final', {
    tokens: { '--a': { light: '#777', dark: '#666' } },
  }))
  engine.saveDraftAsActive()
  assert.equal(engine.getActiveCompiled().tokens['--a'].dark, '#666')
  assert.equal(engine.getDraftCompiled(), null)
})
