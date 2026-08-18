// M4-1 对比度工具单测：颜色解析 / 相对亮度 / 对比度比 / WCAG 等级。
// 已知参考值：白(#fff) vs 黑(#000) = 21:1；标准 #767676 vs #fff ≈ 4.54:1（AA 边缘）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  parseRgbColor,
  relativeLuminance,
  contrastRatio,
  contrastGrade,
  contrastForValues,
} from '../src/core/contrast.ts'

test('parseRgbColor：hex 6 位 / 3 位 / rgb() / rgba() / 非法', () => {
  assert.deepEqual(parseRgbColor('#ff0000'), { r: 255, g: 0, b: 0 })
  assert.deepEqual(parseRgbColor('#f00'), { r: 255, g: 0, b: 0 })
  assert.deepEqual(parseRgbColor('rgb(0, 128, 255)'), { r: 0, g: 128, b: 255 })
  assert.deepEqual(parseRgbColor('rgba(0, 128, 255, 0.5)'), { r: 0, g: 128, b: 255 })
  assert.equal(parseRgbColor('rgb(0, 128)'), null)
  assert.equal(parseRgbColor('transparent'), null)
  assert.equal(parseRgbColor(''), null)
  assert.equal(parseRgbColor('var(--x)'), null)
  assert.equal(parseRgbColor('rgb(300, 0, 0)'), null)
})

test('#73 parseRgbColor：hsl/hsla / 8 位与 4 位 hex / 空格分隔 rgb', () => {
  // hsl：红 = hsl(0, 100%, 50%)；绿 = hsl(120, 100%, 50%)；灰 = hsl(0, 0%, 50%)
  assert.deepEqual(parseRgbColor('hsl(0, 100%, 50%)'), { r: 255, g: 0, b: 0 })
  assert.deepEqual(parseRgbColor('hsl(120, 100%, 50%)'), { r: 0, g: 255, b: 0 })
  assert.deepEqual(parseRgbColor('hsl(0, 0%, 50%)'), { r: 128, g: 128, b: 128 })
  assert.deepEqual(parseRgbColor('hsla(0, 100%, 50%, 0.5)'), { r: 255, g: 0, b: 0 })
  // 8 位 hex（忽略 alpha 通道取 RGB）
  assert.deepEqual(parseRgbColor('#ff000080'), { r: 255, g: 0, b: 0 })
  assert.deepEqual(parseRgbColor('#f008'), { r: 255, g: 0, b: 0 })
  // 空格分隔 rgb
  assert.deepEqual(parseRgbColor('rgb(0 128 255)'), { r: 0, g: 128, b: 255 })
  assert.deepEqual(parseRgbColor('rgb(0 128 255 / 0.5)'), { r: 0, g: 128, b: 255 })
  // hsl 饱和/亮度越界钳制（200° 全饱和蓝绿：hp=3.33 → [0,x,c]，x=0.667 → g≈170, b=255）
  const clamped = parseRgbColor('hsl(200, 150%, 50%)')
  assert.ok(clamped !== null && clamped.r === 0 && Math.abs(clamped.g - 170) <= 1 && clamped.b === 255)
})

test('relativeLuminance：白=1 黑=0 纯红基准', () => {
  assert.ok(Math.abs(relativeLuminance({ r: 255, g: 255, b: 255 }) - 1) < 1e-9)
  assert.equal(relativeLuminance({ r: 0, g: 0, b: 0 }), 0)
  // 纯红 sRGB 线性化：0.2126 * (0.2126) ≈ 0.0452（WCAG 已知值）
  const red = relativeLuminance({ r: 255, g: 0, b: 0 })
  assert.ok(Math.abs(red - 0.2126) < 0.01)
})

test('contrastRatio：黑白=21，同色=1', () => {
  assert.ok(Math.abs(contrastRatio({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }) - 21) < 0.01)
  assert.ok(Math.abs(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }) - 21) < 0.01)
  assert.ok(Math.abs(contrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 }) - 1) < 1e-9)
})

test('contrastGrade：AAA/AA/AA-large/FAIL 阈值', () => {
  assert.equal(contrastGrade(7.0), 'AAA')
  assert.equal(contrastGrade(6.9), 'AA')
  assert.equal(contrastGrade(4.5), 'AA')
  assert.equal(contrastGrade(4.4), 'AA-large')
  assert.equal(contrastGrade(3.0), 'AA-large')
  assert.equal(contrastGrade(2.9), 'FAIL')
})

test('contrastForValues：白底黑字 AAA；灰字 AA 边缘；不可解析 null', () => {
  const aaa = contrastForValues('#000000', '#ffffff')
  assert.ok(aaa !== null && aaa.ratio > 19 && aaa.grade === 'AAA')
  // WCAG 参考：4.54:1 ≈ AA
  const gray = contrastForValues('#767676', '#ffffff')
  assert.ok(gray !== null && gray.ratio > 4.5 && gray.ratio < 4.6 && gray.grade === 'AA')
  assert.equal(contrastForValues('transparent', '#fff'), null)
  assert.equal(contrastForValues('#fff', 'oops'), null)
})

test('contrastForValues：3 位 hex 与 rgb 混算一致', () => {
  const a = contrastForValues('#0f0', 'rgb(255, 255, 255)')
  const b = contrastForValues('rgb(0, 255, 0)', '#ffffff')
  assert.ok(a !== null && b !== null && Math.abs(a.ratio - b.ratio) < 1e-9)
})
