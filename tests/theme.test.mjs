// M2-4 主题注册单测：schema 一等公民 / 编译展平 / 应用注册与注销 / 草稿重挂引用计数。
// 注：.mjs 纯 JS。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validatePreset } from '../src/core/schema.ts'
import { compilePreset, PresetEngine } from '../src/core/engine.ts'

function makePreset(overrides = {}) {
  return { schemaVersion: 1, id: 'theme-test', name: '主题测试', edition: 'standard', tokens: {}, ...overrides }
}

function makeFakes() {
  const registered = []
  const theme = {
    overrideTokens: () => () => {},
    register(def) {
      registered.push(def.id)
      let removed = false
      return () => {
        if (!removed) {
          removed = true
          const idx = registered.indexOf(def.id)
          if (idx >= 0) registered.splice(idx, 1)
        }
      }
    },
  }
  const engine = new PresetEngine({ theme })
  return { engine, registered }
}

const THEME = {
  id: 'demo-ocean-theme',
  colorScheme: 'dark',
  tokens: { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' } },
}

test('validatePreset：theme 一等公民清洗（不进 extra）；非法 id 拒绝', () => {
  const ok = validatePreset(makePreset({ theme: THEME }))
  assert.equal(ok.ok, true)
  if (!ok.ok) return
  assert.equal(ok.preset.theme?.id, 'demo-ocean-theme')
  assert.equal(ok.preset.theme?.colorScheme, 'dark')
  assert.equal(ok.preset.extra?.theme, undefined)
  const bad = validatePreset(makePreset({ theme: { id: 'Bad Id!', colorScheme: 'dark', tokens: {} } }))
  assert.equal(bad.ok, false)
  const badTokens = validatePreset(makePreset({ theme: { id: 't1', colorScheme: 'dark', tokens: { '--x': '#fff' } } }))
  assert.equal(badTokens.ok, false)
})

test('compilePreset：theme 按色板展平（字段 + 旧 extra 形态）', () => {
  const compiled = compilePreset(makePreset({ theme: THEME }))
  assert.deepEqual(compiled.theme, { id: 'demo-ocean-theme', colorScheme: 'dark', tokens: { '--dsw-alias-bg-base': '#000000' } })
  const legacy = compilePreset(makePreset({ extra: { theme: { id: 't2', colorScheme: 'light', tokens: { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' } } } } }))
  assert.deepEqual(legacy.theme?.tokens, { '--dsw-alias-bg-base': '#ffffff' })
})

test('应用注册主题；dispose 注销', () => {
  const { engine, registered } = makeFakes()
  assert.equal(engine.applyPreset(makePreset({ theme: THEME })), true)
  assert.deepEqual(registered, ['demo-ocean-theme'])
  engine.dispose()
  assert.deepEqual(registered, [])
})

test('草稿重挂引用计数：patchDraft 后主题仍注册；discard 后注销', () => {
  const { engine, registered } = makeFakes()
  assert.equal(engine.startDraft(makePreset({ theme: THEME })), true)
  assert.deepEqual(registered, ['demo-ocean-theme'])
  // 令牌编辑 → 重挂（引用计数 +1，旧链 -1——不得注销）
  const edited = makePreset({
    tokens: { '--dsw-alias-bg-base': { light: '#eeeeee', dark: '#111111' } },
    theme: THEME,
  })
  assert.equal(engine.patchDraft(edited), true)
  assert.deepEqual(registered, ['demo-ocean-theme'])
  engine.discardDraft()
  assert.deepEqual(registered, [])
})

test('仅主题开关变更（tokens/css 相同）→ 必须重挂并注册（短路径不吞主题变更）', () => {
  const { engine, registered } = makeFakes()
  const base = makePreset({ tokens: { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' } } })
  assert.equal(engine.startDraft(base), true)
  assert.deepEqual(registered, [])
  const withTheme = makePreset({ tokens: base.tokens, theme: THEME })
  assert.equal(engine.patchDraft(withTheme), true)
  assert.deepEqual(registered, ['demo-ocean-theme'])
})

test('无 register 适配器：主题静默跳过（不抛）', () => {
  const engine = new PresetEngine({ theme: { overrideTokens: () => () => {} } })
  assert.equal(engine.applyPreset(makePreset({ theme: THEME })), true)
})
