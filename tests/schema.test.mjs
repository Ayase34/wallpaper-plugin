// preset-core schema 校验测试（node --test；import lib 产物 = 发布的代码）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  validatePreset, checkDshCompatibility, isAllowedCssSelector, normalizeDanglingCover,
  SCHEMA_VERSION, MAX_TOKENS,
} from '../lib/core.mjs'

const valid = {
  schemaVersion: SCHEMA_VERSION,
  id: 'demo-ocean',
  name: '深蓝海洋',
  edition: 'standard',
  minDshVersion: '0.1.0',
  targetDshVersion: '0.1.0-rc.5',
  tags: ['blue'],
  tokens: {
    '--dsw-alias-bg-base': { light: '#fff', dark: '#000' },
    '--dsw-specific-bubble': { light: 'rgb(1,2,3)', dark: 'rgb(4,5,6)' },
  },
}

test('合法预设通过并保留未知字段（低版本读高版本）', () => {
  const raw = { ...valid, cssPatches: [{ selector: '[data-slot="x"]', rules: 'color:red' }] }
  const result = validatePreset(raw)
  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.preset.id, 'demo-ocean')
    assert.equal(result.preset.extra?.cssPatches, raw.cssPatches)
    assert.equal(result.preset.tokens['--dsw-alias-bg-base'].light, '#fff')
  }
})

test('#56 cover 校验：引用预设内素材通过（含裁剪矩形），悬空引用/缺 assetId 拒绝', () => {
  // 文件引用素材（无 dataUrl 键——dataUrl 空串会被严格正则拒绝，属正确行为）
  const withAssets = { ...valid, assets: [{ id: 'a1', name: 'c.png', mime: 'image/png' }] }
  // 合法：assetId 引用存在 + 裁剪矩形
  const ok = validatePreset({ ...withAssets, cover: { assetId: 'a1', cropX: '0', cropY: '0', cropW: '900', cropH: '300' } })
  assert.equal(ok.ok, true)
  if (ok.ok) {
    assert.equal(ok.preset.cover?.assetId, 'a1')
    assert.equal(ok.preset.cover?.cropW, '900')
  }
  // 悬空引用 → 拒绝
  assert.equal(validatePreset({ ...withAssets, cover: { assetId: 'nope' } }).ok, false)
  // 缺 assetId / 非对象 → 拒绝
  assert.equal(validatePreset({ ...withAssets, cover: { cropX: '0' } }).ok, false)
  assert.equal(validatePreset({ ...withAssets, cover: 'a1' }).ok, false)
  // 裁剪字段非法（非数字字符串）→ 拒绝
  assert.equal(validatePreset({ ...withAssets, cover: { assetId: 'a1', cropX: 'abc' } }).ok, false)
  // 无 cover 完全正常
  assert.equal(validatePreset(withAssets).ok, true)
})

test('#104 normalizeDanglingCover：cover 悬空自动回退（UI 删素材后保存不卡死、不写悬空）', () => {
  const base = { ...valid, assets: [{ id: 'a1', name: 'c.png', mime: 'image/png' }] }
  // 引用有效 → 不动
  const keep = { ...base, cover: { assetId: 'a1' } }
  assert.deepEqual(normalizeDanglingCover(keep), { preset: keep, dropped: false })
  // assets 被清空/不含封面素材 → 移除 cover（回退自动生成），归一化后必须通过校验
  const dangling = { ...base, assets: [], cover: { assetId: 'a1', cropX: '0', cropY: '0', cropW: '900', cropH: '300' } }
  const n1 = normalizeDanglingCover(dangling)
  assert.equal(n1.dropped, true)
  assert.equal(n1.preset.cover, undefined)
  assert.equal(validatePreset(n1.preset).ok, true, '归一化后必须通过校验')
  // assets 里有其他素材但封面素材被删 → 同样回退
  const dangling2 = { ...base, assets: [{ id: 'b2', name: 'x.png', mime: 'image/png' }], cover: { assetId: 'a1' } }
  const n2 = normalizeDanglingCover(dangling2)
  assert.equal(n2.dropped, true)
  assert.equal(n2.preset.cover, undefined)
  assert.equal(validatePreset(n2.preset).ok, true)
  // 无 cover → 不动
  const noCover = { ...base, assets: [] }
  assert.deepEqual(normalizeDanglingCover(noCover), { preset: noCover, dropped: false })
})

test('#94 素材引用 layers 分层规格校验（zip 往返载体）', () => {
  const base = { ...valid, assets: [{ id: 'a1', name: 'b.png', mime: 'image/png' }] }
  // 合法：完整数字矩形
  const ok = validatePreset({ ...base, assets: [{ ...base.assets[0], layers: { animAssetId: 'a2', x: 10, y: 20, w: 200, h: 150 } }] })
  assert.equal(ok.ok, true)
  if (ok.ok) {
    assert.equal(ok.preset.assets[0].layers?.animAssetId, 'a2')
    assert.equal(ok.preset.assets[0].layers?.w, 200)
  }
  // 非法：缺字段 / 非数字 / w≤0 / animAssetId 非法
  assert.equal(validatePreset({ ...base, assets: [{ ...base.assets[0], layers: { animAssetId: 'a2', x: 1, y: 2, w: 3 } }] }).ok, false)
  assert.equal(validatePreset({ ...base, assets: [{ ...base.assets[0], layers: { animAssetId: 'a2', x: '1', y: 2, w: 3, h: 4 } }] }).ok, false)
  assert.equal(validatePreset({ ...base, assets: [{ ...base.assets[0], layers: { animAssetId: 'a2', x: 1, y: 2, w: 0, h: 4 } }] }).ok, false)
  assert.equal(validatePreset({ ...base, assets: [{ ...base.assets[0], layers: { animAssetId: 'BAD ID!', x: 1, y: 2, w: 3, h: 4 } }] }).ok, false)
  // 无 layers 照常（引用形态不受影响）
  assert.equal(validatePreset(base).ok, true)
})

test('裸字符串令牌给出教学错误', () => {
  const result = validatePreset({ ...valid, tokens: { '--dsw-alias-bg-base': '#fff' } })
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.ok(result.errors.some(e => e.includes('裸字符串') && e.includes('{ light, dark }')))
  }
})

test('非双值令牌拒绝', () => {
  const result = validatePreset({ ...valid, tokens: { '--x': { light: '#fff' } } })
  assert.equal(result.ok, false)
  if (!result.ok) assert.ok(result.errors.some(e => e.includes('{ light, dark }')))
})

test('非 -- 开头的令牌名拒绝', () => {
  const result = validatePreset({ ...valid, tokens: { color: { light: '#fff', dark: '#000' } } })
  assert.equal(result.ok, false)
  if (!result.ok) assert.ok(result.errors.some(e => e.includes('必须以 -- 开头')))
})

test('id 规则：非法字符拒绝，合法通过', () => {
  for (const bad of ['Ocean', 'demo_ocean', '', 'a'.repeat(65), 'a/b']) {
    const result = validatePreset({ ...valid, id: bad })
    assert.equal(result.ok, false, `id=${bad} 应被拒绝`)
  }
  const ok = validatePreset({ ...valid, id: 'demo-ocean-2' })
  assert.equal(ok.ok, true)
})

test('edition / schemaVersion 非法拒绝', () => {
  assert.equal(validatePreset({ ...valid, edition: 'pro' }).ok, false)
  assert.equal(validatePreset({ ...valid, schemaVersion: 2 }).ok, false)
  assert.equal(validatePreset({ ...valid, schemaVersion: '1' }).ok, false)
})

test('版本字段格式校验', () => {
  assert.equal(validatePreset({ ...valid, minDshVersion: '0.1.0-rc.5' }).ok, true)
  assert.equal(validatePreset({ ...valid, minDshVersion: 'abc' }).ok, false)
  assert.equal(validatePreset({ ...valid, targetDshVersion: '1.2.3' }).ok, true)
})

test('tokens 数量上限', () => {
  const tokens = Object.fromEntries(
    Array.from({ length: MAX_TOKENS + 1 }, (_, i) => [`--t${i}`, { light: '#fff', dark: '#000' }]),
  )
  const result = validatePreset({ ...valid, tokens })
  assert.equal(result.ok, false)
  if (!result.ok) assert.ok(result.errors.some(e => e.includes('上限')))
})

test('css 选择器白名单：data-* 锚点开头通过，无锚点/逃逸拒绝', () => {
  assert.equal(isAllowedCssSelector('[data-slot="shell.overlay"] .brand'), true)
  assert.equal(isAllowedCssSelector('[data-plugin="ui-presets"] > div'), true)
  assert.equal(isAllowedCssSelector('.hashed-class'), false)
  assert.equal(isAllowedCssSelector('div .x'), false)
  assert.equal(isAllowedCssSelector('[data-x="1"]; color:red'), false)
  assert.equal(isAllowedCssSelector('[data-x="1"]}'), false)
})

test('css.rules 防逃逸：花括号注入拒绝（评审 P0-3）', () => {
  const attack = { ...valid, css: [{ selector: '[data-x]', rules: '} body { display: none } /*' }] }
  const result = validatePreset(attack)
  assert.equal(result.ok, false)
  if (!result.ok) assert.ok(result.errors.some(e => e.includes('花括号')))
  // 合法 rules（分号分隔多属性）通过
  const ok = validatePreset({ ...valid, css: [{ selector: '[data-x]', rules: 'color: red; background: blue' }] })
  assert.equal(ok.ok, true)
  // rules 缺失 / 超长拒绝
  assert.equal(validatePreset({ ...valid, css: [{ selector: '[data-x]' }] }).ok, false)
  assert.equal(validatePreset({ ...valid, css: [{ selector: '[data-x]', rules: 'x'.repeat(5000) }] }).ok, false)
})

test('author 形状校验（评审 P1-8）', () => {
  assert.equal(validatePreset({ ...valid, author: { name: 'me' } }).ok, true)
  assert.equal(validatePreset({ ...valid, author: { name: 'me', homepage: 'https://x' } }).ok, true)
  assert.equal(validatePreset({ ...valid, author: { name: 123 } }).ok, false)
  assert.equal(validatePreset({ ...valid, author: { homepage: 'https://x' } }).ok, false)
  assert.equal(validatePreset({ ...valid, author: { name: 'me', homepage: 123 } }).ok, false)
})

test('版本契约含预发布序（评审 P2-4）', () => {
  const preset = validatePreset({ ...valid, minDshVersion: '0.1.0-rc.6' })
  assert.equal(preset.ok, true)
  if (preset.ok) {
    // rc.6 要求 > 当前 rc.5 → 拒绝
    assert.ok(checkDshCompatibility(preset.preset, '0.1.0-rc.5')?.includes('要求 DSH'))
    // 当前 rc.6 满足
    assert.equal(checkDshCompatibility(preset.preset, '0.1.0-rc.6'), null)
  }
  // 正式版 > 任意预发布（0.1.0 要求 vs 0.1.0-rc.9 当前 → 拒绝）
  const stable = validatePreset({ ...valid, minDshVersion: '0.1.0' })
  if (stable.ok) assert.ok(checkDshCompatibility(stable.preset, '0.1.0-rc.9')?.includes('要求 DSH'))
})

test('extra 原型键保留（评审 P2-5）', () => {
  const raw = { ...valid, toString: 'custom', constructor: 'x', customField: 42 }
  const result = validatePreset(raw)
  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.preset.extra?.customField, 42)
    assert.equal(result.preset.extra?.toString, 'custom')
    assert.equal(result.preset.extra?.constructor, 'x')
  }
})

test('版本契约：minDshVersion 高于当前 → 拒绝应用', () => {
  const preset = validatePreset({ ...valid, minDshVersion: '9.9.9' })
  assert.equal(preset.ok, true)
  if (preset.ok) {
    assert.ok(checkDshCompatibility(preset.preset, '0.1.0-rc.5')?.includes('要求 DSH'))
    assert.equal(checkDshCompatibility(preset.preset, '10.0.0'), null)
  }
})

test('无 minDshVersion → 版本契约通过', () => {
  const { minDshVersion: _omit, ...noMin } = valid
  const preset = validatePreset(noMin)
  assert.equal(preset.ok, true)
  if (preset.ok) assert.equal(checkDshCompatibility(preset.preset, '0.0.1'), null)
})
