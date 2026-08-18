// M2-2b diff 告警单测：版本契约 / 未知令牌（--dsh-* 豁免）/ 批处理去重。
// 注：.mjs 纯 JS（Node 24 类型剥离只作用于 .ts）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { auditPreset, auditPresets } from '../src/core/audit.ts'
import { catalog } from '../src/core/catalog.ts'
import { DEMO_PRESETS } from '../src/client/demo.ts'

const base = { schemaVersion: 1, id: 'x', name: '测试', edition: 'standard', tokens: {} }

test('版本契约：targetDshVersion 与目录一致 → 无告警', () => {
  assert.deepEqual(auditPreset({ ...base, targetDshVersion: catalog.dshVersion }), [])
})

test('版本契约：不一致 → 版本告警（含目标版本号）', () => {
  const warnings = auditPreset({ ...base, name: '旧版', targetDshVersion: '0.0.9' })
  assert.ok(warnings.some(w => w.includes('0.0.9')), JSON.stringify(warnings))
})

test('未知令牌：--dsh-* 已知豁免；其余告警（含采样名）', () => {
  assert.deepEqual(
    auditPreset({ ...base, tokens: { '--dsh-chat-content-width': { light: '748px', dark: '748px' } } }),
    [],
  )
  const warnings = auditPreset({ ...base, name: '怪', tokens: { '--custom-foo': { light: '#000', dark: '#fff' } } })
  assert.ok(warnings.some(w => w.includes('目录外令牌') && w.includes('--custom-foo')), JSON.stringify(warnings))
})

test('批处理去重（同预设重复审计只出一条）', () => {
  const p = { ...base, name: '旧', targetDshVersion: '0.0.9' }
  assert.equal(auditPresets([p, p]).length, 1)
})

test('demo 预设审计无告警（与目录同版本）', () => {
  assert.deepEqual(auditPresets(DEMO_PRESETS), [])
})

test('M3-1 出厂预设：全部通过 schema 校验（双值/令牌名/结构）', async () => {
  assert.ok(DEMO_PRESETS.length >= 1, `出厂预设 ≥1（当前 ${DEMO_PRESETS.length}）`)
  const { validatePreset } = await import('../src/core/schema.ts')
  for (const preset of DEMO_PRESETS) {
    const result = validatePreset(preset)
    assert.equal(result.ok, true, `${preset.id} 校验失败：${result.ok ? '' : result.errors.join('；')}`)
    // 每个预设至少覆盖核心观感令牌（bg/sidebar/brand）
    for (const name of ['--dsw-alias-bg-base', '--dsw-specific-sidebar-fill', '--dsw-alias-brand-primary']) {
      assert.ok(preset.tokens[name] !== undefined, `${preset.id} 缺少 ${name}`)
    }
  }
})
