// 分享链接 / 分享码 codec 单测（新入口必须自己把好校验关）。
// 通过 node 24 type stripping 直接 import src TS。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_SHARE_CHARS,
  SHARE_HASH_PREFIX,
  buildShareLink,
  decodeShare,
  encodeShare,
  extractShareCode,
  stripAssetPayload,
} from '../src/client/share.ts'

/** 最小合法预设（双值令牌 + 双色板语义）。 */
function makePreset(overrides = {}) {
  return {
    schemaVersion: 1,
    id: 'aurora-test',
    name: '极光测试',
    edition: 'standard',
    tokens: {
      '--dsw-alias-bg-base': { light: '#f4f6fb', dark: '#06121a' },
      '--dsw-alias-brand-primary': { light: '#2f6fed', dark: '#5b8dff' },
    },
    ...overrides,
  }
}

test('encode → decode 往返保留令牌与中文名', () => {
  const preset = makePreset()
  const encoded = encodeShare(preset)
  assert.equal(encoded.ok, true)
  assert.equal(encoded.omitted, 0)
  const decoded = decodeShare(encoded.code)
  assert.equal(decoded.ok, true)
  assert.equal(decoded.preset.name, '极光测试')
  assert.deepEqual(decoded.preset.tokens, preset.tokens)
  assert.equal(decoded.omitted, 0)
})

test('CSS 补丁 / 部件 / 主题注册 / 封面 / 分组都随分享走（不是只有 token）', () => {
  const preset = makePreset({
    css: [{ selector: '[data-up-card]', rules: 'border-color: var(--dsw-alias-brand-primary)' }],
    assets: [{ id: 'wall1', name: 'wall', mime: 'image/png', dataUrl: 'data:image/png;base64,AAAA' }],
    widgets: [{ id: 'chat-background', params: { assetId: 'wall1', opacity: '0.8', cropX: '0', cropY: '0', cropW: '1600', cropH: '900' } }],
    cover: { assetId: 'wall1', cropX: '0', cropY: '0', cropW: '1920', cropH: '640' },
    theme: { id: 'aurora-test-theme', colorScheme: 'dark', tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } } },
    extra: { groups: [{ id: 'g1', name: '操作区', tokenNames: ['--dsw-alias-brand-primary'] }] },
  })
  const encoded = encodeShare(preset)
  assert.equal(encoded.ok, true)
  // 素材二进制被剔除并计数
  assert.equal(encoded.omitted, 1)
  const decoded = decodeShare(encoded.code)
  assert.equal(decoded.ok, true)
  assert.deepEqual(decoded.preset.css, preset.css)
  assert.deepEqual(decoded.preset.widgets, preset.widgets)
  assert.deepEqual(decoded.preset.cover, preset.cover)
  assert.deepEqual(decoded.preset.theme, preset.theme)
  assert.deepEqual(decoded.preset.extra, preset.extra)
  // 素材壳保留（引用仍成立），但图片本体不在
  assert.equal(decoded.preset.assets.length, 1)
  assert.equal(decoded.preset.assets[0].dataUrl, undefined)
  assert.equal(decoded.omitted, 1)
})

test('非法预设拒绝编码（不把坏草稿变成坏链接）', () => {
  const preset = makePreset({ tokens: { '--dsw-alias-bg-base': '#fff' } })
  const encoded = encodeShare(preset)
  assert.equal(encoded.ok, false)
  assert.match(encoded.error, /校验失败/)
})

test('被截断 / 被篡改的分享码给出可读错误', () => {
  const code = encodeShare(makePreset()).code
  const truncated = decodeShare(code.slice(0, code.length - 12))
  assert.equal(truncated.ok, false)
  assert.match(truncated.error, /JSON|base64|校验/)

  const garbage = decodeShare('not-a-real-code!!!')
  assert.equal(garbage.ok, false)
  assert.match(garbage.error, /分享码/)
})

test('版本不匹配拒绝（未来格式不得半解析）', () => {
  const payload = Buffer.from(JSON.stringify({ v: 99, p: makePreset() }), 'utf8').toString('base64url')
  const decoded = decodeShare(payload)
  assert.equal(decoded.ok, false)
  assert.match(decoded.error, /版本/)
})

test('extractShareCode 兼容链接、hash、纯码、脏文本', () => {
  const code = encodeShare(makePreset()).code
  assert.equal(extractShareCode(`${SHARE_HASH_PREFIX}${code}`), code)
  assert.equal(extractShareCode(`http://127.0.0.1:55785/?x=1#ui-presets-share=${code}`), code)
  assert.equal(extractShareCode(`  ${code}  `), code)
  assert.equal(extractShareCode('https://example.com/no-marker'), null)
  assert.equal(extractShareCode(''), null)
})

test('buildShareLink 去掉 base 旧 hash，保留路径与查询', () => {
  const link = buildShareLink('http://127.0.0.1:55785/settings?tab=appearance#studio=presets', 'abc')
  assert.equal(link, `http://127.0.0.1:55785/settings?tab=appearance${SHARE_HASH_PREFIX}abc`)
})

test('stripAssetPayload 不修改入参（编码不回写草稿）', () => {
  const preset = makePreset({
    assets: [{ id: 'a', name: 'a', mime: 'image/png', dataUrl: 'data:image/png;base64,AAAA' }],
  })
  const { preset: lean, omitted } = stripAssetPayload(preset)
  assert.equal(omitted, 1)
  assert.equal(preset.assets[0].dataUrl !== undefined, true)
  assert.equal(lean.assets[0].dataUrl, undefined)
})

test('超过字符上限拒绝并提示改用 ZIP', () => {
  // 20 万字符的「合法值」——无分号/花括号/换行，能过 schema，但 base64 后必超上限
  const huge = 'a'.repeat(MAX_SHARE_CHARS)
  const encoded = encodeShare(makePreset({ tokens: { '--dsw-alias-bg-base': { light: huge, dark: huge } } }))
  assert.equal(encoded.ok, false)
  assert.match(encoded.error, /ZIP/)
})
