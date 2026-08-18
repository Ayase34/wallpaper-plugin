// core 新增模块测试：能力掩码 + var() 引用解析。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CAPABILITY_MASKS, externalTierOf, DEFAULT_CAPABILITIES,
  isResolvableColor, resolveTokenValue, isColorValue,
} from '../lib/core.mjs'

test('掩码：simple 是删减集（预设墙在，编辑器不在）', () => {
  const simple = CAPABILITY_MASKS.simple
  assert.equal(simple['preset-wall'], true)
  assert.equal(simple['quick-row'], true)
  assert.equal(simple.knobs, false)
  assert.equal(simple['full-token-editor'], false)
  assert.equal(simple['draft-undo'], false)
  assert.equal(simple['import-export'], false)
})

test('掩码：standard 含基础编辑 + 高级区（对外标准版）', () => {
  const standard = CAPABILITY_MASKS.standard
  assert.equal(standard['full-token-editor'], true)
  assert.equal(standard['assets'], true)
  assert.equal(standard['draft-undo'], true)
  assert.equal(standard['css-patches'], true, '高级区对外并入标准版')
  assert.equal(standard['theme-register'], true)
})

test('掩码：developer 全量；对外档位收敛两档', () => {
  assert.equal(Object.values(CAPABILITY_MASKS.developer).every(Boolean), true)
  assert.equal(externalTierOf('simple'), 'simple')
  assert.equal(externalTierOf('standard'), 'standard')
  assert.equal(externalTierOf('developer'), 'standard')
  assert.equal(DEFAULT_CAPABILITIES, 'standard')
})

test('var() 引用解析：alias → static 链解析为颜色（M1 取色器判定）', () => {
  // catalog-data 中 --dsw-alias-bg-base: var(--dsw-static-neutral-bluish-00)（light）
  assert.equal(isColorValue('#fff'), true)
  assert.equal(isColorValue('rgba(1, 2, 3, 0.5)'), true)
  assert.equal(isColorValue('linear-gradient(0deg, #fff, #000)'), false)
  const resolved = resolveTokenValue('var(--dsw-alias-bg-base)', 'light')
  assert.ok(isColorValue(resolved), `解析结果应为颜色，实际: ${resolved}`)
  // dark 值也应可解析
  assert.equal(isResolvableColor('var(--dsw-alias-bg-base)', 'dark'), true)
  // 无法解析的引用原样返回
  assert.equal(resolveTokenValue('var(--no-such-token)'), 'var(--no-such-token)')
  // 字面值原样返回
  assert.equal(resolveTokenValue('#123456'), '#123456')
})
