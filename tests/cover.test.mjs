// M2-5/#56 封面生成单测：SVG 结构（3:1，900×300）/ 亮暗背景 / 品牌色 / 令牌清单 / XML 转义 / 封面图源解析。
// .mjs 纯 JS。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { coverSvgFor, coverDataUrlFor, coverImageSourceFor, COVER_RATIO } from '../src/core/cover.ts'

const preset = {
  schemaVersion: 1,
  id: 'demo-ocean',
  name: '示例·深蓝海洋',
  edition: 'standard',
  tokens: {
    '--dsw-alias-bg-base': { light: 'rgb(247, 250, 253)', dark: 'rgb(13, 18, 27)' },
    '--dsw-alias-brand-primary': { light: 'rgb(30, 92, 208)', dark: 'rgb(120, 168, 255)' },
  },
}

test('#56 封面比例 = 宽:高 3:1（匹配设置墙卡片显示比例，用户目测 1:3）', () => {
  assert.deepEqual(COVER_RATIO, { w: 3, h: 1 })
  const svg = coverSvgFor(preset)
  assert.ok(svg.includes('width="900" height="300" viewBox="0 0 900 300"'), svg.slice(0, 120))
})

test('cover svg：含名称 / 亮暗背景 / 品牌色 / 令牌清单', () => {
  const svg = coverSvgFor(preset)
  assert.ok(svg.startsWith('<svg'), '以 <svg 开头')
  assert.ok(svg.includes('示例·深蓝海洋'))
  assert.ok(svg.includes('rgb(247, 250, 253)'), '亮背景')
  assert.ok(svg.includes('rgb(13, 18, 27)'), '暗背景')
  assert.ok(svg.includes('rgb(30, 92, 208)'), '品牌色')
  assert.ok(svg.includes('--dsw-alias-bg-base'), '令牌清单')
})

test('cover svg：XML 转义（& 与 < 不破坏结构）', () => {
  const svg = coverSvgFor({ ...preset, name: 'A&B <C>' })
  assert.ok(!svg.includes('A&B'))
  assert.ok(svg.includes('A&amp;B'))
  assert.ok(svg.includes('&lt;C&gt;'))
})

test('cover svg：无令牌预设兜底色（不抛）', () => {
  const svg = coverSvgFor({ schemaVersion: 1, id: 'x', name: '空', edition: 'standard', tokens: {} })
  assert.ok(svg.includes('空'))
})

test('#56 coverImageSourceFor：手设封面（内嵌 dataUrl / 文件路由）优先，无则自动 SVG', () => {
  const embedded = { ...preset, cover: { assetId: 'a1' }, assets: [{ id: 'a1', name: 'c.png', mime: 'image/png', dataUrl: 'data:image/png;base64,AAAA' }] }
  assert.equal(coverImageSourceFor(embedded), 'data:image/png;base64,AAAA')
  const fileRef = { ...preset, cover: { assetId: 'a1' }, assets: [{ id: 'a1', name: 'c.png', mime: 'image/png' }] }
  assert.equal(coverImageSourceFor(fileRef), '/ui-presets/assets/a1')
  // 引用不存在 → 回退自动生成
  assert.equal(coverImageSourceFor({ ...preset, cover: { assetId: 'nope' }, assets: [] }), coverDataUrlFor(preset))
  // 无 cover → 自动生成
  assert.equal(coverImageSourceFor(preset), coverDataUrlFor(preset))
})
