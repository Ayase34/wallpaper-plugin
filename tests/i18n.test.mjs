// i18n 单测：字典键集对齐 / 插值 / 语言解析 / 回退。
import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  dictionaries,
  formatMessage,
  getLocale,
  resolveLocale,
  setLocale,
  subscribeLocale,
  t,
} from '../src/client/i18n.ts'

afterEach(() => { setLocale('zh') })

test('zh / en 键集完全一致，且没有空文案', () => {
  const { zh, en } = dictionaries()
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort(), 'en 必须逐键对齐 zh')
  for (const [key, value] of Object.entries(zh)) assert.ok(value.trim() !== '', `zh 空文案：${key}`)
  for (const [key, value] of Object.entries(en)) assert.ok(value.trim() !== '', `en 空文案：${key}`)
})

test('formatMessage：插值、缺参数保留占位、无参原样返回', () => {
  assert.equal(formatMessage('已导入「{name}」', { name: '极光' }), '已导入「极光」')
  assert.equal(formatMessage('{a}-{b}', { a: 1 }), '1-{b}')
  assert.equal(formatMessage('无占位'), '无占位')
})

test('resolveLocale：存储值优先；中文前缀 → zh；空检测 → zh；其余 → en', () => {
  assert.equal(resolveLocale('en', 'zh-CN'), 'en')
  assert.equal(resolveLocale('zh', 'en-US'), 'zh')
  assert.equal(resolveLocale(null, 'zh-CN'), 'zh')
  assert.equal(resolveLocale(null, 'zh-Hant-TW'), 'zh')
  assert.equal(resolveLocale(null, 'en-US'), 'en')
  assert.equal(resolveLocale(null, 'ja-JP'), 'en')
  assert.equal(resolveLocale(null, null), 'zh')
  assert.equal(resolveLocale('fr', 'en-US'), 'en', '非法存储值不得生效')
})

test('t()：按当前语言取文案，切换后立即生效', () => {
  setLocale('zh')
  assert.equal(t('wall.apply'), '应用')
  assert.equal(t('share.exportTitle', { name: '极光' }), '分享「极光」')
  setLocale('en')
  assert.equal(t('wall.apply'), 'Apply')
  assert.equal(t('share.exportTitle', { name: 'Aurora' }), 'Share “Aurora”')
})

test('setLocale 通知订阅者；退订后不再收到', () => {
  let hits = 0
  const off = subscribeLocale(() => { hits += 1 })
  setLocale('en')
  setLocale('zh')
  assert.equal(hits, 2)
  off()
  setLocale('en')
  assert.equal(hits, 2)
  assert.equal(getLocale(), 'en')
})
