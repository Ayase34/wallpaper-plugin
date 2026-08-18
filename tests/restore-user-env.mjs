// 用户环境修复工具（#54 起为**非破坏性**）：只在需要时补位，绝不覆盖已有数据。
// 用法：node tests/restore-user-env.mjs http://127.0.0.1:3180
// 背景：e2e 已完全隔离（DSH_HOME=e2e-home，测试不碰 ~/.dsh）——本脚本仅用于
// 历史遗留污染的修复（如旧版测试曾改动过 ~/.dsh 的 active 指针/预设）。
// 规则：① 蒸汽波预设已存在 → 跳过（不覆盖用户可能的新配置）；
//       ② active 指向 null / demo 预设 / 不存在的预设 → 恢复蒸汽波；
//       ③ active 指向库中真实存在的预设（可能是用户自建）→ 保持不动。
// Node 原生 UTF-8 避免 PowerShell 中文乱码。
const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

const VAPORWAVE = {
  schemaVersion: 1,
  edition: 'standard',
  id: 'preset-msw932cz',
  name: '蒸汽波（AI）',
  description: '蒸汽波风格：深紫底 + 霓虹粉强调（AI 创建）',
  targetDshVersion: '0.1.0-rc.5',
  tokens: {
    '--dsw-alias-bg-base': { light: 'rgb(246, 236, 255)', dark: 'rgb(26, 11, 46)' },
    '--dsw-alias-bg-layer-1': { light: 'rgb(240, 226, 255)', dark: 'rgb(37, 16, 64)' },
    '--dsw-alias-bg-layer-2': { light: 'rgb(233, 216, 255)', dark: 'rgb(46, 21, 80)' },
    '--dsw-specific-sidebar-fill': { light: 'rgb(230, 211, 255)', dark: 'rgb(20, 8, 38)' },
    '--dsw-specific-bubble': { light: 'rgb(229, 204, 255)', dark: 'rgb(58, 29, 99)' },
    '--dsw-specific-input-major': { light: 'rgb(249, 242, 255)', dark: 'rgb(42, 18, 72)' },
    '--dsw-alias-brand-primary': { light: 'rgb(255, 46, 151)', dark: 'rgb(255, 113, 206)' },
    '--dsw-alias-button-info-fill': { light: 'rgb(255, 46, 151)', dark: 'rgb(255, 113, 206)' },
    '--dsw-alias-state-business-primary': { light: 'rgb(255, 46, 151)', dark: 'rgb(255, 113, 206)' },
    '--dsw-alias-label-primary': { light: 'rgb(42, 15, 77)', dark: 'rgb(245, 230, 255)' },
    '--dsw-alias-label-secondary': { light: 'rgb(107, 74, 158)', dark: 'rgb(201, 168, 242)' },
    '--dsw-alias-label-tertiary': { light: 'rgb(154, 127, 196)', dark: 'rgb(154, 127, 196)' },
  },
  // 注意：schema 中 theme 是单个对象（非数组）、css 是数组——留空字段一律省略
}

const get = async (p) => {
  const res = await fetch(`${BASE}${p}`)
  if (!res.ok) throw new Error(`GET ${p} → ${res.status}`)
  return res.json()
}
const put = async (p, body) => {
  const res = await fetch(`${BASE}${p}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PUT ${p} → ${res.status}: ${await res.text()}`)
  return res.json()
}

const list = await get('/ui-presets/presets')
const exists = (list.presets ?? []).some(p => p.id === 'preset-msw932cz')
if (exists) {
  console.log('蒸汽波预设已存在 → 跳过（不覆盖，可能含用户新配置）')
} else {
  await put('/ui-presets/presets/preset-msw932cz', { preset: VAPORWAVE })
  console.log('蒸汽波预设缺失 → 已重建（12 tokens，无壁纸配置）')
}

const active = await get('/ui-presets/active')
const id = active.activePresetId
const activeExists = id !== null && id !== undefined && (list.presets ?? []).some(p => p.id === id)
// #95/#96：内置出厂预设 id 是 'default'（不再 demo-* 前缀）——库中缺失时仍属合法活动态
if (id === null || (!activeExists && String(id) !== 'default')) {
  const saved = await put('/ui-presets/active', { activePresetId: 'preset-msw932cz' })
  console.log(`active 无效（${JSON.stringify(id)}）→ 已恢复蒸汽波（rev=${saved.revision}）`)
} else {
  console.log(`active 有效（${id}）→ 保持不动（用户数据优先）`)
}
