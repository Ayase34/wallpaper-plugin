// 壁纸 2.0（图片链接 / 内置渐变）单测：链接白名单、schema 校验、CSS 产出与裁剪语义。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validatePreset } from '../src/core/schema.ts'
import {
  GRADIENT_PRESETS,
  MAX_IMAGE_URL_LENGTH,
  gradientCss,
  isSafeImageUrl,
  widgetCss,
} from '../src/core/widgets.ts'

const preset = (widgets) => ({
  schemaVersion: 1, id: 'wall-source', name: '壁纸来源', edition: 'standard',
  tokens: { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' } },
  widgets,
})

const chat = (params) => [{ id: 'chat-background', params }]

test('isSafeImageUrl：仅 http/https，禁引号/括号/空白/反斜杠/超长', () => {
  assert.equal(isSafeImageUrl('https://example.com/a.jpg'), true)
  assert.equal(isSafeImageUrl('http://example.com/a.jpg?x=1&y=2'), true)
  assert.equal(isSafeImageUrl(''), false)
  assert.equal(isSafeImageUrl('javascript:alert(1)'), false)
  assert.equal(isSafeImageUrl('data:image/png;base64,AAAA'), false)
  assert.equal(isSafeImageUrl('https://example.com/a b.jpg'), false)
  assert.equal(isSafeImageUrl('https://example.com/a"b.jpg'), false)
  assert.equal(isSafeImageUrl('https://example.com/a(b).jpg'), false)
  assert.equal(isSafeImageUrl('https://example.com/a\\b.jpg'), false)
  assert.equal(isSafeImageUrl(`https://example.com/${'a'.repeat(MAX_IMAGE_URL_LENGTH)}`), false)
})

test('schema：链接来源合法值通过；javascript/data/含引号被拒', () => {
  const ok = validatePreset(preset(chat({ source: 'url', imageUrl: 'https://example.com/w.jpg', opacity: '1' })))
  assert.equal(ok.ok, true)

  for (const bad of ['javascript:alert(1)', 'data:image/png;base64,AAAA', 'https://example.com/a b.jpg', 'https://example.com/a"b.jpg']) {
    const result = validatePreset(preset(chat({ source: 'url', imageUrl: bad, opacity: '1' })))
    assert.equal(result.ok, false, `应拒绝：${bad}`)
    assert.match(result.errors.join('；'), /http\/https 图片链接/)
  }
})

test('schema：渐变档位必须是目录内 id', () => {
  const ok = validatePreset(preset(chat({ source: 'gradient', gradient: GRADIENT_PRESETS[0].id, opacity: '1' })))
  assert.equal(ok.ok, true)
  const bad = validatePreset(preset(chat({ source: 'gradient', gradient: 'not-a-gradient', opacity: '1' })))
  assert.equal(bad.ok, false)
  assert.match(bad.errors.join('；'), /不在选项内/)
})

test('schema：旧预设（无 source）仍然合法——默认按素材来源', () => {
  const result = validatePreset(preset(chat({ assetId: '', opacity: '1' })))
  assert.equal(result.ok, true)
})

test('widgetCss：链接来源产出 url("…")，并在深色给 [data-ds-dark-theme] 规则', () => {
  const assets = []
  const css = widgetCss('chat-background', {
    source: 'url',
    imageUrl: 'https://example.com/light.jpg',
    imageUrlDark: 'https://example.com/dark.jpg',
    opacity: '1',
    opacityDark: '0.8',
  }, assets)
  assert.match(css, /background-image: url\("https:\/\/example\.com\/light\.jpg"\)/)
  assert.match(css, /\[data-ds-dark-theme\][^}]*url\("https:\/\/example\.com\/dark\.jpg"\)/)
})

test('widgetCss：渐变来源产出字面量（代码内目录，非用户 CSS）', () => {
  const id = GRADIENT_PRESETS[1].id
  const css = widgetCss('sidebar-poster', { source: 'gradient', gradient: id, opacity: '1' }, [])
  assert.ok(css.includes(gradientCss(id)), '应包含渐变字面量')
  assert.match(css, /\[data-slot="sidebar"\]/)
})

test('widgetCss：链接/渐变来源忽略裁剪参数（无 up-crop 标记）', () => {
  const urlCss = widgetCss('chat-background', {
    source: 'url', imageUrl: 'https://example.com/w.jpg', opacity: '1',
    cropX: '0', cropY: '0', cropW: '1600', cropH: '900',
  }, [])
  assert.ok(!urlCss.includes('up-crop:'), '链接来源不得产出裁剪标记')
  assert.match(urlCss, /background-image: url\(/)

  const gradCss = widgetCss('chat-background', {
    source: 'gradient', gradient: GRADIENT_PRESETS[0].id, opacity: '1',
    cropX: '0', cropY: '0', cropW: '1600', cropH: '900',
  }, [])
  assert.ok(!gradCss.includes('up-crop:'))
})

test('widgetCss：素材来源行为不变（裁剪仍产 up-crop 标记）', () => {
  const assets = [{ id: 'a1', name: 'a', mime: 'image/png' }]
  const css = widgetCss('chat-background', {
    assetId: 'a1', opacity: '1', cropX: '0', cropY: '0', cropW: '1600', cropH: '900',
  }, assets)
  assert.match(css, /up-crop:chat-background:/)
})

test('widgetCss：非法链接 / 未知渐变 → 不产出样式（不静默落回素材）', () => {
  assert.equal(widgetCss('chat-background', { source: 'url', imageUrl: 'javascript:1', opacity: '1' }, []), '')
  assert.equal(widgetCss('chat-background', { source: 'gradient', gradient: 'nope', opacity: '1' }, []), '')
})
