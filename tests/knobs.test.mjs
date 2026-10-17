// M2-1 旋钮抽象层单测：目录完整性 / 单值模式 / 分别设置模式 / 回读 / 安全角标。
// 链实证（catalog-data）：bg-base dark 默认 = rgb(21, 21, 23)；shadow-lv2 默认 = 柔和档值。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  KNOBS,
  knobValuesForSchemes,
  KNOB_CATEGORIES,
  findKnob,
  knobValueForScheme,
  tokensToKnobValue,
  knobCaution,
  knobCoveredTokens,
} from '../src/core/knobs.ts'
import { findToken } from '../src/core/catalog.ts'

test('旋钮目录完整：19 个旋钮、6 个类别、束令牌均在目录或有兜底', () => {
  assert.equal(KNOBS.length, 27)
  assert.equal(KNOB_CATEGORIES.length, 6)
  const covered = knobCoveredTokens()
  for (const knob of KNOBS) {
    assert.ok(KNOB_CATEGORIES.some(c => c.id === knob.category), `${knob.id} 类别合法`)
    assert.ok(knob.bundle.length >= 1, `${knob.id} 束非空`)
    for (const name of knob.bundle) {
      const entry = findToken(name)
      assert.ok(entry !== undefined || knob.fallback?.[name] !== undefined, `${knob.id} 束令牌 ${name} 在目录或有兜底`)
      assert.ok(covered.has(name))
    }
    const primary = knob.bundle[0]
    if (findToken(primary) === undefined) {
      assert.ok(knob.fallback?.[primary] !== undefined, `${knob.id} 主令牌有兜底`)
    }
  }
})

test('单值模式：亮暗同写整个束（主色三令牌）', () => {
  const out = knobValueForScheme('accent-brand', '#123456', null)
  assert.deepEqual(out['--dsw-alias-brand-primary'], { light: '#123456', dark: '#123456' })
  assert.deepEqual(out['--dsw-alias-button-info-fill'], { light: '#123456', dark: '#123456' })
  assert.deepEqual(out['--dsw-alias-state-business-primary'], { light: '#123456', dark: '#123456' })
  assert.equal(Object.keys(out).length, 3)
})

test('分别设置模式：只写指定方案（保留另一方案）', () => {
  const out = knobValueForScheme('spatial-bg', '#111111', 'light')
  assert.deepEqual(out['--dsw-alias-bg-base'], { light: '#111111' })
  assert.equal('dark' in out['--dsw-alias-bg-base'], false)
})

test('回读：覆盖优先，无覆盖取目录默认；非目录令牌兜底', () => {
  assert.equal(tokensToKnobValue('spatial-bg', {}, 'dark'), 'rgb(21, 21, 23)')
  assert.equal(
    tokensToKnobValue('spatial-bg', { '--dsw-alias-bg-base': { light: '#aabbcc', dark: '#ddeeff' } }, 'light'),
    '#aabbcc',
  )
  assert.equal(tokensToKnobValue('layout-width', {}, 'light'), '748px')
})

test('select/font 档位：无匹配回退首档', () => {
  // shadow-lv2 目录默认 = 柔和档值 → 精确匹配
  assert.equal(
    tokensToKnobValue('shadow-level', {}, 'light'), 'soft',
  )
  // 字体无覆盖 → 目录默认（系统字体栈）不在档位 → 回退首档「系统默认」
  assert.equal(tokensToKnobValue('font-family', {}, 'light'), '')
})

test('安全角标：含 caution 束的旋钮标记（侧边栏/菜单），基础色不标', () => {
  assert.equal(knobCaution('spatial-sidebar'), true)
  assert.equal(knobCaution('spatial-menu'), true)
  assert.equal(knobCaution('spatial-bg'), false)
  assert.equal(knobCaution('accent-brand'), false)
})

test('未知旋钮 id 容错', () => {
  assert.equal(findKnob('nope'), undefined)
  assert.deepEqual(knobValueForScheme('nope', '#000', null), {})
  assert.equal(tokensToKnobValue('nope', {}, 'light'), '')
  assert.equal(knobCaution('nope'), false)
})

// ===== #111 扩展：束内派生 / 多令牌档位 / 明暗分别给值 =====
test('#111 束内派生：抬升面按方案生成阶梯（亮更深 / 暗更亮），不再是同值', () => {
  const light = knobValueForScheme('spatial-layer', '#7A5CFF', 'light')
  const dark = knobValueForScheme('spatial-layer', '#7A5CFF', 'dark')
  assert.equal(light['--dsw-alias-bg-layer-1'].light, '#7A5CFF', '主令牌 = 输入值')
  assert.notEqual(light['--dsw-alias-bg-layer-2'].light, '#7A5CFF', 'layer-2 应派生')
  assert.notEqual(light['--dsw-alias-bg-layer-3'].light, light['--dsw-alias-bg-layer-2'].light, 'layer-3 与 layer-2 不同档')
  // shade：亮色向黑（更暗），暗色向白（更亮）
  const lum = (hex) => {
    const h = hex.replace('#', '')
    const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  assert.ok(lum(light['--dsw-alias-bg-layer-2'].light) < lum('#7A5CFF'), '亮色侧派生应更暗')
  assert.ok(lum(dark['--dsw-alias-bg-layer-2'].dark) > lum('#7A5CFF'), '暗色侧派生应更亮')
})

test('#111 多令牌档位：圆角档一次写六个令牌且逐项不同', () => {
  const out = knobValueForScheme('radius-scale', '胶囊', null)
  assert.equal(Object.keys(out).length, 6)
  assert.equal(out['--dsw-radius-xs'].light, '12px')
  assert.equal(out['--dsw-radius-panel'].light, '44px')
  assert.notEqual(out['--dsw-radius-xs'].light, out['--dsw-radius-md'].light)
  // 回读：目录默认（xs=4px）应识别为标准档
  assert.equal(tokensToKnobValue('radius-scale', {}, 'light'), '标准')
})

test('#111 明暗分别给值：knobValuesForSchemes 两侧各算各的派生', () => {
  const out = knobValuesForSchemes('spatial-layer', { light: '#FFFFFF', dark: '#101010' })
  assert.equal(out['--dsw-alias-bg-layer-1'].light, '#FFFFFF')
  assert.equal(out['--dsw-alias-bg-layer-1'].dark, '#101010')
  assert.notEqual(out['--dsw-alias-bg-layer-2'].light, '#FFFFFF')
  assert.notEqual(out['--dsw-alias-bg-layer-2'].dark, '#101010')
})

test('#111 新旋钮覆盖了此前不可达的风格维度', () => {
  const covered = knobCoveredTokens()
  for (const name of ['--dsw-radius-panel', '--dsw-corner-shape', '--ds-transition-duration', '--dsw-mask-blur', '--dsw-alias-markdown-code-block', '--dsw-alias-settings-card-fill']) {
    assert.ok(covered.has(name), `${name} 应被旋钮覆盖`)
  }
  assert.equal(knobCaution('radius-scale'), true, '圆角是全局影响面 → caution')
})