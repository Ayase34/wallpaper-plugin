// M2-5 zip 工具单测：往返一致 / 空 zip / 非 zip 报错 / CRC32 已知值。
// .mjs 纯 JS。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { zipStore, parseZip, crc32 } from '../src/node/zip-util.ts'

const enc = new TextEncoder()
const dec = new TextDecoder()

test('zip 往返：写入 → 解析 → 内容一致（含子目录条目）', () => {
  const entries = [
    { name: 'preset.json', data: enc.encode('{"id":"x"}') },
    { name: 'cover.svg', data: enc.encode('<svg/>') },
    { name: 'dir/file.txt', data: enc.encode('hello zip') },
  ]
  const zip = zipStore(entries)
  assert.equal(zip[0], 0x50)
  assert.equal(zip[1], 0x4b)
  const { entries: parsed, errors } = parseZip(zip)
  assert.deepEqual(errors, [])
  assert.equal(parsed.length, 3)
  const byName = Object.fromEntries(parsed.map(e => [e.name, dec.decode(e.data)]))
  assert.equal(byName['preset.json'], '{"id":"x"}')
  assert.equal(byName['cover.svg'], '<svg/>')
  assert.equal(byName['dir/file.txt'], 'hello zip')
})

test('空 zip（零条目）往返', () => {
  const { entries, errors } = parseZip(zipStore([]))
  assert.deepEqual(entries, [])
  assert.deepEqual(errors, [])
})

test('非 zip 输入 → 报错不崩溃', () => {
  const { entries, errors } = parseZip(enc.encode('hello world, this is not a zip file at all'))
  assert.deepEqual(entries, [])
  assert.ok(errors.length > 0)
})

test('CRC32 标准已知值（"123456789" → 0xCBF43926）', () => {
  assert.equal(crc32(enc.encode('123456789')), 0xcbf43926)
})
