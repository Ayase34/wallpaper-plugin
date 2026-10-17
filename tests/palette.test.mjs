// #111 调色板生成器单测：确定性 / 双值完整 / 文字对比度达标 / 非法输入教学错误。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { paletteTokens, PALETTE_MOODS } from '../src/core/palette.ts'
import { contrastForValues } from '../src/core/contrast.ts'

const BG_TOKENS = ['--dsw-alias-bg-base', '--dsw-alias-bg-layer-1']

test('#111 调色板：确定性（同输入同输出）且全部令牌双值非空', () => {
  const a = paletteTokens('#8A3A70', 'fresh', 'AA')
  const b = paletteTokens('#8A3A70', 'fresh', 'AA')
  assert.deepEqual(a, b)
  const entries = Object.entries(a)
  assert.ok(entries.length >= 35, `令牌数应足够多（实际 ${entries.length}）`)
  for (const [name, v] of entries) {
    assert.ok(name.startsWith('--'), `${name} 应为自定义属性`)
    assert.equal(typeof v.light, 'string')
    assert.equal(typeof v.dark, 'string')
    assert.notEqual(v.light, '', `${name}.light 不应为空`)
    assert.notEqual(v.dark, '', `${name}.dark 不应为空`)
  }
})

test('#111 调色板：label 家族在两种方案下达到对比度目标（AA）', () => {
  for (const mood of PALETTE_MOODS.map(m => m.id)) {
    const tokens = paletteTokens('#8A3A70', mood, 'AA')
    for (const bgName of BG_TOKENS) {
      for (const scheme of ['light', 'dark']) {
        for (const labelName of ['--dsw-alias-label-primary', '--dsw-alias-label-secondary']) {
          const result = contrastForValues(tokens[labelName][scheme], tokens[bgName][scheme])
          assert.ok(result !== null, `${mood}/${scheme}/${labelName} 应可解析`)
          assert.ok(result.ratio >= 4.5, `${mood}/${scheme} ${labelName} vs ${bgName} = ${result.ratio.toFixed(2)} 应 ≥ 4.5`)
        }
      }
    }
  }
})

test('#111 调色板：AAA 目标下主文字至少 7:1', () => {
  const tokens = paletteTokens('#2E6F5E', 'night', 'AAA')
  for (const scheme of ['light', 'dark']) {
    const result = contrastForValues(tokens['--dsw-alias-label-primary'][scheme], tokens['--dsw-alias-bg-base'][scheme])
    assert.ok(result !== null && result.ratio >= 7, `${scheme} 主文字 ${result?.ratio.toFixed(2)} 应 ≥ 7`)
  }
})

test('#111 调色板：非法 seed 抛教学错误', () => {
  assert.throws(() => paletteTokens('not-a-color'), /seed 不是合法颜色/)
})

test('#111 调色板：不同 mood 产出不同背景（风格确实生效）', () => {
  const fresh = paletteTokens('#8A3A70', 'fresh', 'AA')['--dsw-alias-bg-base'].light
  const retro = paletteTokens('#8A3A70', 'retro', 'AA')['--dsw-alias-bg-base'].light
  const night = paletteTokens('#8A3A70', 'night', 'AA')['--dsw-alias-bg-base'].dark
  assert.notEqual(fresh, retro, 'fresh 与 retro 的亮色底应不同')
  assert.notEqual(night, paletteTokens('#8A3A70', 'fresh', 'AA')['--dsw-alias-bg-base'].dark, 'night 的暗底应更深')
})
