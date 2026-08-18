// M2-2 CSS 补丁：schema 一等公民清洗 / 编译注入文本 / 引擎挂载与草稿 css 差分。
// 注：本文件是 .mjs（纯 JS）——类型剥离只作用于 .ts 文件，禁止 TS 注解。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validatePreset, cssRulesToText, isAllowedCssSelector } from '../src/core/schema.ts'
import { compilePreset, PresetEngine } from '../src/core/engine.ts'

function makePreset(overrides = {}) {
  return { schemaVersion: 1, id: 'css-test', name: 'CSS 测试', edition: 'standard', tokens: {}, ...overrides }
}

/** fake 主题 + 样式记录器（注入文本可断言；disposer 移除可断言）。 */
function makeFakes() {
  const injected = []
  const theme = {
    overrideTokens: () => () => {},
  }
  const style = {
    injected,
    injectCss(_source, text) {
      injected.push(text)
      return () => {
        const idx = injected.lastIndexOf(text)
        if (idx >= 0) injected.splice(idx, 1)
      }
    },
  }
  const engine = new PresetEngine({ theme, style })
  return { engine, injected }
}

test('validatePreset 把 css 清洗为一等公民字段（不再进 extra）', () => {
  const result = validatePreset({
    schemaVersion: 1,
    id: 'css-test',
    name: 'CSS 测试',
    edition: 'standard',
    tokens: {},
    css: [{ selector: '[data-chat-flow]', rules: 'color: red' }],
  })
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.deepEqual(result.preset.css, [{ selector: '[data-chat-flow]', rules: 'color: red' }])
  assert.equal(result.preset.extra?.css, undefined)
})

test('cssRulesToText：白名单过滤 + 花括号过滤 + 拼接', () => {
  const text = cssRulesToText([
    { selector: '[data-chat-flow]', rules: 'color: red' },
    { selector: 'body', rules: 'color: red' }, // 非法选择器 → 过滤
    { selector: '[data-up-x]', rules: 'a { b }' }, // 花括号 → 过滤
  ])
  assert.equal(text, '[data-chat-flow] { color: red }')
  assert.equal(isAllowedCssSelector('[data-chat-flow]'), true)
  assert.equal(isAllowedCssSelector('body'), false)
})

test('compilePreset：新字段与旧 extra.css 形态都产出注入文本', () => {
  const viaField = compilePreset(makePreset({ css: [{ selector: '[data-chat-flow]', rules: 'color: red' }] }))
  assert.equal(viaField.css?.text, '[data-chat-flow] { color: red }')
  const viaExtra = compilePreset(makePreset({ extra: { css: [{ selector: '[data-up-x]', rules: 'margin: 0' }] } }))
  assert.equal(viaExtra.css?.text, '[data-up-x] { margin: 0 }')
})

test('applyPreset 注入 css；dispose 移除', () => {
  const { engine, injected } = makeFakes()
  const ok = engine.applyPreset(makePreset({ css: [{ selector: '[data-chat-flow]', rules: 'color: red' }] }))
  assert.equal(ok, true)
  assert.deepEqual(injected, ['[data-chat-flow] { color: red }'])
  engine.dispose()
  assert.deepEqual(injected, [])
})

test('patchDraft：仅 css 变更也必须重挂（令牌相同不短路）', () => {
  const { engine, injected } = makeFakes()
  const base = makePreset({ css: [{ selector: '[data-up-a]', rules: 'color: red' }] })
  assert.equal(engine.startDraft(base), true)
  assert.deepEqual(injected, ['[data-up-a] { color: red }'])
  // 令牌不变、css 文本变化 → 必须重挂（旧层移除，新层注入）
  const changed = makePreset({ css: [{ selector: '[data-up-a]', rules: 'color: blue' }] })
  assert.equal(engine.patchDraft(changed), true)
  assert.deepEqual(injected, ['[data-up-a] { color: blue }'])
})

test('patchDraft：tokens 与 css 均无差异 → 短路不重挂', () => {
  const { engine, injected } = makeFakes()
  const preset = makePreset({ css: [{ selector: '[data-up-a]', rules: 'color: red' }] })
  engine.startDraft(preset)
  engine.patchDraft(preset)
  assert.deepEqual(injected, ['[data-up-a] { color: red }'])
})

test('discardDraft 移除草稿 css 层', () => {
  const { engine, injected } = makeFakes()
  engine.startDraft(makePreset({ css: [{ selector: '[data-up-a]', rules: 'color: red' }] }))
  assert.equal(injected.length, 1)
  engine.discardDraft()
  assert.deepEqual(injected, [])
})

test('旧行为回归：无 css 预设编译无 css 产物', () => {
  const compiled = compilePreset(makePreset())
  assert.equal(compiled.css, undefined)
})
