// 壁纸轮换纯逻辑单测：链接清洗、配置规范化、到期/推进、存储解析容错。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ROTATION_MAX_URLS,
  ROTATION_MIN_INTERVAL_MS,
  advance,
  createRotation,
  currentUrl,
  isDue,
  normalizeRotation,
  parseRotationKey,
  parseRotationStore,
  rotationKey,
  splitUrlLines,
} from '../src/client/rotation.ts'

const A = 'https://example.com/a.jpg'
const B = 'https://example.com/b.jpg'
const C = 'https://example.com/c.jpg'

test('rotationKey / parseRotationKey 往返（preset id 含 - 也不歧义）', () => {
  const key = rotationKey('preset-abc', 'chat-background')
  assert.equal(key, 'preset-abc::chat-background')
  assert.deepEqual(parseRotationKey(key), { presetId: 'preset-abc', widgetId: 'chat-background' })
  assert.equal(parseRotationKey('no-separator'), null)
  assert.equal(parseRotationKey('::only-widget'), null)
})

test('splitUrlLines：去空行/去重/逐行校验/上限 20', () => {
  const ok = splitUrlLines(`${A}\n\n${B}\n${A}\n`)
  assert.deepEqual(ok.urls, [A, B])
  assert.equal(ok.rejected, 1, '重复行计为丢弃')

  const bad = splitUrlLines(`${A}\njavascript:alert(1)\nftp://x/y.jpg\n${B}`)
  assert.deepEqual(bad.urls, [A, B])
  assert.equal(bad.rejected, 2)

  const many = Array.from({ length: 30 }, (_, i) => `https://example.com/${i}.jpg`).join('\n')
  const capped = splitUrlLines(many)
  assert.equal(capped.urls.length, ROTATION_MAX_URLS)
  assert.equal(capped.rejected, 10)
})

test('normalizeRotation：少于 2 条 / 全非法 → null；间隔被夹到允许区间', () => {
  assert.equal(normalizeRotation(null), null)
  assert.equal(normalizeRotation({ urls: [A] }), null)
  assert.equal(normalizeRotation({ urls: ['javascript:1', 'data:x'] }), null)

  const cfg = normalizeRotation({ urls: [A, B], intervalMs: 1, index: 99 })
  assert.equal(cfg.intervalMs, ROTATION_MIN_INTERVAL_MS)
  assert.equal(cfg.index, 1, 'index 越界夹到末位')
  const cfg2 = normalizeRotation({ urls: [A, B], intervalMs: 9e12 })
  assert.ok(cfg2.intervalMs <= 7 * 24 * 60 * 60 * 1000)
})

test('createRotation：立即到期且 index=-1（第一次推进落到第一条）', () => {
  const now = 1_000_000
  const cfg = createRotation([A, B, C], ROTATION_MIN_INTERVAL_MS, now)
  assert.equal(cfg.nextAt, now)
  assert.equal(cfg.index, -1)
  assert.equal(isDue(cfg, now), true)
  const first = advance(cfg, now)
  assert.equal(first.index, 0)
  assert.equal(currentUrl(first), A)
  assert.equal(first.nextAt, now + ROTATION_MIN_INTERVAL_MS)
})

test('advance：顺序前进并回绕，不越界', () => {
  const now = 5000
  const cfg = { urls: [A, B], intervalMs: ROTATION_MIN_INTERVAL_MS, index: 0, nextAt: now }
  assert.equal(advance(cfg, now).index, 1)
  assert.equal(advance(advance(cfg, now), now).index, 0)
  assert.equal(currentUrl(cfg), A)
})

test('parseRotationStore：坏 JSON / 坏条目 / 缺分隔符 → 丢弃，不抛错', () => {
  assert.deepEqual(parseRotationStore(null), {})
  assert.deepEqual(parseRotationStore('not json'), {})
  assert.deepEqual(parseRotationStore('[]'), {})
  const raw = JSON.stringify({
    'preset-a::chat-background': { urls: [A, B], intervalMs: ROTATION_MIN_INTERVAL_MS, index: 0, nextAt: 0 },
    'preset-b::sidebar-poster': { urls: [A] }, // 少于 2 条 → 丢
    'no-separator': { urls: [A, B], intervalMs: ROTATION_MIN_INTERVAL_MS, index: 0, nextAt: 0 },
  })
  const store = parseRotationStore(raw)
  assert.deepEqual(Object.keys(store), ['preset-a::chat-background'])
})
