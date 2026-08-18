// #85 图层合成纯函数单测：normalizeLayers 归一化 + createLayer 默认几何 + #90 composeMode 判定。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeLayers, createLayer, composeMode } from '../src/core/layer-compose.ts'

test('非数组/空 → 空数组', () => {
  assert.deepEqual(normalizeLayers(undefined), [])
  assert.deepEqual(normalizeLayers(null), [])
  assert.deepEqual(normalizeLayers({}), [])
  assert.deepEqual(normalizeLayers('x'), [])
})

test('合法图层保留（含 rotation/opacity）', () => {
  const out = normalizeLayers([{ assetId: 'a1', x: 10, y: 20, w: 100, h: 50, rotation: 0.5, opacity: 0.7 }])
  assert.equal(out.length, 1)
  assert.deepEqual(out[0], { assetId: 'a1', x: 10, y: 20, w: 100, h: 50, rotation: 0.5, opacity: 0.7, flipH: false, flipV: false })
})

test('非法条目跳过：缺 assetId / 非对象 / 空 assetId', () => {
  assert.deepEqual(normalizeLayers([{ x: 1 }, null, { assetId: '' }, 'x', 7]), [])
})

test('#87 镜像字段：flipH/flipV 布尔解析（非 true 一律 false）', () => {
  const out = normalizeLayers([
    { assetId: 'a1', flipH: true, flipV: false },
    { assetId: 'a2', flipH: 'yes', flipV: true },
    { assetId: 'a3' },
  ])
  assert.equal(out[0].flipH, true)
  assert.equal(out[0].flipV, false)
  assert.equal(out[1].flipH, false)
  assert.equal(out[1].flipV, true)
  assert.equal(out[2].flipH, false)
  assert.equal(out[2].flipV, false)
})

test('数字字段非法回落（w/h 最小 1；opacity 钳制 0-1 且缺省 1）', () => {
  const out = normalizeLayers([{ assetId: 'a1', x: 'bad', w: 0, h: -5, opacity: 9 }])
  assert.equal(out[0].x, 0)
  assert.equal(out[0].w, 1)
  assert.equal(out[0].h, 1)
  assert.equal(out[0].opacity, 1)
  const clamped = normalizeLayers([{ assetId: 'a1', opacity: -0.2 }, { assetId: 'a2', opacity: 3 }])
  assert.equal(clamped[0].opacity, 0)
  assert.equal(clamped[1].opacity, 1)
})

test('未知键忽略', () => {
  const out = normalizeLayers([{ assetId: 'a1', foo: 'bar' }])
  assert.equal(out.length, 1)
  assert.deepEqual(Object.keys(out[0]).sort(), ['assetId', 'flipH', 'flipV', 'h', 'opacity', 'rotation', 'w', 'x', 'y'])
})

test('createLayer：居中 + 1/4 画布宽默认尺寸', () => {
  const layer = createLayer('a1', 1920, 1080)
  assert.equal(layer.assetId, 'a1')
  assert.equal(layer.w, 480)
  assert.equal(layer.x, 960 - 240)
  assert.equal(layer.y, 540 - 240)
  assert.equal(layer.rotation, 0)
  assert.equal(layer.opacity, 1)
  assert.equal(layer.flipH, false)
  assert.equal(layer.flipV, false)
})

// ---- #90 分层输出模式判定 ----

const isGif = id => id === 'gif1' || id === 'gif2'
const L = (assetId, extra = {}) => ({
  assetId, x: 0, y: 0, w: 100, h: 100, rotation: 0, opacity: 1, flipH: false, flipV: false, ...extra,
})

test('#90 composeMode：全静态 → static', () => {
  assert.deepEqual(composeMode([L('a1'), L('a2')], isGif), { kind: 'static' })
})

test('#90 composeMode：1 个干净 GIF 层 + 静态层 → layered（动图直引不烘焙）', () => {
  const mode = composeMode([L('a1'), L('gif1', { x: 10, y: 20, w: 200, h: 150 })], isGif)
  assert.deepEqual(mode, { kind: 'layered', anim: { assetId: 'gif1', x: 10, y: 20, w: 200, h: 150 } })
})

test('#90 composeMode：GIF 带旋转/镜像/半透明 → baked（CSS 背景层不支持这些变换）', () => {
  assert.equal(composeMode([L('a1'), L('gif1', { rotation: 0.5 })], isGif).kind, 'baked')
  assert.equal(composeMode([L('a1'), L('gif1', { flipH: true })], isGif).kind, 'baked')
  assert.equal(composeMode([L('a1'), L('gif1', { flipV: true })], isGif).kind, 'baked')
  assert.equal(composeMode([L('a1'), L('gif1', { opacity: 0.5 })], isGif).kind, 'baked')
})

test('#90 composeMode：多 GIF 层 → baked（CSS 多背景无法同步播放节奏）', () => {
  assert.equal(composeMode([L('a1'), L('gif1'), L('gif2')], isGif).kind, 'baked')
})

test('#90 composeMode：单 GIF 无静态层 → baked（无底图可分层）', () => {
  assert.equal(composeMode([L('gif1')], isGif).kind, 'baked')
})
