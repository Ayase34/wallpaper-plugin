// M5-1 schemastery Config 解析单测：目录覆盖逻辑（纯函数）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveConfiguredDirs } from '../src/node/config.ts'

const DEFAULTS = { presetsDir: '/home/u/.dsh/.ui-presets', assetsDir: '/home/u/.dsh/.ui-presets/assets' }

test('无配置：返回默认目录', () => {
  assert.deepEqual(resolveConfiguredDirs({}, DEFAULTS), DEFAULTS)
})

test('presetsDir 覆盖：assetsDir 跟随 presetsDir', () => {
  const out = resolveConfiguredDirs({ presetsDir: '/custom/presets' }, DEFAULTS)
  assert.equal(out.presetsDir, '/custom/presets')
  assert.equal(out.assetsDir, '/custom/presets/assets')
})

test('presetsDir + assetsDir 分别覆盖', () => {
  const out = resolveConfiguredDirs({ presetsDir: '/p', assetsDir: '/a' }, DEFAULTS)
  assert.equal(out.presetsDir, '/p')
  assert.equal(out.assetsDir, '/a')
})

test('仅 assetsDir 覆盖：presetsDir 保持默认', () => {
  const out = resolveConfiguredDirs({ assetsDir: '/a' }, DEFAULTS)
  assert.equal(out.presetsDir, DEFAULTS.presetsDir)
  assert.equal(out.assetsDir, '/a')
})

test('空串/空白：视为未配置', () => {
  assert.deepEqual(resolveConfiguredDirs({ presetsDir: '', assetsDir: '   ' }, DEFAULTS), DEFAULTS)
  const out = resolveConfiguredDirs({ presetsDir: '  /p  ', assetsDir: '' }, DEFAULTS)
  assert.equal(out.presetsDir, '/p')
  assert.equal(out.assetsDir, '/p/assets')
})
