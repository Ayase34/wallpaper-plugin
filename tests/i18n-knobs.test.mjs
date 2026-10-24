// i18n 旋钮/类别英文映射覆盖度：core 里新增旋钮而漏翻时测试变红。
import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { KNOBS, KNOB_CATEGORIES } from '../src/core/knobs.ts'
import { WIDGETS } from '../src/core/widgets.ts'
import { categoryLabel, englishKnobLabels, englishWidgetLabels, knobLabel, setLocale, widgetLabel, widgetParamLabel } from '../src/client/i18n.ts'

afterEach(() => { setLocale('zh') })

test('英文旋钮映射覆盖全部旋钮（名称与说明都非空）', () => {
  const { knobs } = englishKnobLabels()
  for (const knob of KNOBS) {
    const entry = knobs[knob.id]
    assert.ok(entry !== undefined, `缺英文映射：${knob.id}`)
    assert.ok(entry.name.trim() !== '', `空英文名：${knob.id}`)
    assert.ok(entry.description.trim() !== '', `空英文说明：${knob.id}`)
  }
})

test('英文类别映射覆盖全部类别', () => {
  const { categories } = englishKnobLabels()
  for (const category of KNOB_CATEGORIES) {
    const entry = categories[category.id]
    assert.ok(entry !== undefined, `缺类别英文映射：${category.id}`)
    assert.ok(entry.name.trim() !== '' && entry.description.trim() !== '')
  }
})

test('英文部件/参数映射覆盖全部部件与参数', () => {
  const { widgets, params } = englishWidgetLabels()
  for (const widget of WIDGETS) {
    const entry = widgets[widget.id]
    assert.ok(entry !== undefined, `缺部件英文映射：${widget.id}`)
    assert.ok(entry.name.trim() !== '' && entry.description.trim() !== '')
    for (const param of widget.params) {
      assert.ok((params[param.key] ?? '').trim() !== '', `缺参数英文映射：${widget.id}.${param.key}`)
    }
  }
})

test('widgetLabel / widgetParamLabel：中文回退 null，英文命中映射', () => {
  setLocale('zh')
  assert.equal(widgetLabel('chat-background', 'name'), null)
  assert.equal(widgetParamLabel('opacity'), null)
  setLocale('en')
  assert.equal(widgetLabel('chat-background', 'name'), 'Chat background')
  assert.equal(widgetParamLabel('source'), 'Image')
  assert.equal(widgetLabel('nope', 'name'), null)
  assert.equal(widgetParamLabel('nope'), null)
})

test('knobLabel / categoryLabel：中文返回 null（回退 core 中文源），英文返回映射', () => {
  setLocale('zh')
  assert.equal(knobLabel('spatial-bg', 'name'), null)
  assert.equal(categoryLabel('spatial', 'name'), null)

  setLocale('en')
  assert.equal(knobLabel('spatial-bg', 'name'), 'Background')
  assert.equal(knobLabel('spatial-bg', 'description'), 'The overall canvas — the single most visible surface')
  assert.equal(categoryLabel('spatial', 'name'), 'Layout surfaces')
  // 未知 id 不得抛错
  assert.equal(knobLabel('nope', 'name'), null)
  assert.equal(categoryLabel('nope', 'name'), null)
})
