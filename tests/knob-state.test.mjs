// 旋钮层纯逻辑单测：局部合并（分别设置不抹另一套）、颜色回读识别、束内人工改动判定。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { knobBundleDiverged, knobColorValue, mergeKnobPatch } from '../src/client/knob-state.ts'
import { knobValueForScheme, knobValuesForSchemes } from '../src/core/knobs.ts'

test('mergeKnobPatch：只写方案键时保留另一套值', () => {
  const tokens = { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' } }
  const merged = mergeKnobPatch(tokens, { '--dsw-alias-bg-base': { dark: '#111111' } })
  assert.deepEqual(merged['--dsw-alias-bg-base'], { light: '#ffffff', dark: '#111111' })
  // 入参不被修改
  assert.deepEqual(tokens['--dsw-alias-bg-base'], { light: '#ffffff', dark: '#000000' })
})

test('mergeKnobPatch：新令牌（无现值）补空串占位，避免 undefined 下游', () => {
  const merged = mergeKnobPatch({}, { '--dsw-alias-brand-primary': { light: '#123456' } })
  assert.deepEqual(merged['--dsw-alias-brand-primary'], { light: '#123456', dark: '' })
})

test('mergeKnobPatch：单值双写覆盖两套', () => {
  const merged = mergeKnobPatch(
    { '--dsw-alias-label-primary': { light: '#111111', dark: '#eeeeee' } },
    { '--dsw-alias-label-primary': { light: '#ff0000', dark: '#ff0000' } },
  )
  assert.deepEqual(merged['--dsw-alias-label-primary'], { light: '#ff0000', dark: '#ff0000' })
})

test('knobColorValue：颜色可读、引用值/空值返回 null', () => {
  assert.equal(knobColorValue('spatial-bg', { '--dsw-alias-bg-base': { light: '#0b1220', dark: '#000000' } }, 'light'), '#0b1220')
  assert.equal(knobColorValue('spatial-bg', { '--dsw-alias-bg-base': { light: 'var(--x)', dark: '#000' } }, 'light'), null)
  // 无覆盖 → 目录默认（可读颜色）
  assert.match(String(knobColorValue('spatial-bg', {}, 'dark')), /^(#|rgb)/)
})

test('knobValueForScheme：单值模式亮暗各按派生规则写；指定方案只写该方案', () => {
  const both = knobValueForScheme('spatial-layer', '#808080', null)
  assert.equal(both['--dsw-alias-bg-layer-1'].light, '#808080')
  assert.equal(both['--dsw-alias-bg-layer-1'].dark, '#808080')
  // 派生：layer-2/3 与主值不同（不是一片同色）
  assert.notEqual(both['--dsw-alias-bg-layer-2'].light, both['--dsw-alias-bg-layer-1'].light)
  assert.notEqual(both['--dsw-alias-bg-layer-3'].light, both['--dsw-alias-bg-layer-2'].light)

  const lightOnly = knobValueForScheme('spatial-layer', '#808080', 'light')
  assert.equal(lightOnly['--dsw-alias-bg-layer-1'].light, '#808080')
  assert.equal(lightOnly['--dsw-alias-bg-layer-1'].dark, undefined)
})

test('knobBundleDiverged：只认束内多令牌的颜色旋钮，未覆盖不算冲突', () => {
  // 主令牌覆盖、束内其余未覆盖 → 跟随派生，不算「单独调整」
  const clean = { '--dsw-alias-bg-layer-1': { light: '#808080', dark: '#808080' } }
  assert.equal(knobBundleDiverged('spatial-layer', clean), false)

  // 束内某个令牌被手改成与派生不同的值 → 标记
  const expected = knobValuesForSchemes('spatial-layer', { light: '#808080', dark: '#808080' })
  const dirty = {
    ...clean,
    '--dsw-alias-bg-layer-2': { light: '#123456', dark: '#123456' },
  }
  assert.notEqual(expected['--dsw-alias-bg-layer-2'].light, '#123456')
  assert.equal(knobBundleDiverged('spatial-layer', dirty), true)

  // 单令牌旋钮永远不标记；引用值也不算
  assert.equal(knobBundleDiverged('spatial-bg', { '--dsw-alias-bg-base': { light: 'var(--x)', dark: 'var(--x)' } }), false)
  assert.equal(knobBundleDiverged('corner-shape', {}), false)
})
