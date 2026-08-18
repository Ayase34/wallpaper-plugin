// #72 AI 质量预检纯函数单测：结构硬校验 / 未知令牌 / 对比度（明暗分别）/ css 白名单。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { precheckPreset } from '../src/core/precheck.ts'

test('合法高对比预设：ok=true 无对比度警告', () => {
  const result = precheckPreset({
    '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' },
    '--dsw-alias-label-primary': { light: '#111111', dark: '#eeeeee' },
    '--dsw-alias-label-secondary': { light: '#333333', dark: '#cccccc' },
    '--dsw-alias-label-tertiary': { light: '#444444', dark: '#bbbbbb' },
  })
  assert.equal(result.ok, true)
  assert.equal(result.issues.filter(i => i.message.includes('对比度')).length, 0)
  assert.equal(result.summary.tokenCount, 4)
  assert.equal(result.summary.contrastIssues, 0)
})

test('低对比：白字白底 → FAIL 警告（不阻断）', () => {
  const result = precheckPreset({
    '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' },
    '--dsw-alias-label-primary': { light: '#ffffff', dark: '#ffffff' },
    '--dsw-alias-label-secondary': { light: '#111111', dark: '#eeeeee' },
    '--dsw-alias-label-tertiary': { light: '#444444', dark: '#bbbbbb' },
  })
  assert.equal(result.ok, true, '对比度是建议不是阻断（与 UI 徽标同语义）')
  const fail = result.issues.find(i => i.message.includes('FAIL'))
  assert.ok(fail !== undefined, '应有 FAIL 对比度警告')
  assert.equal(fail.scheme, 'light')
  // #73 矩阵扩展：白字对 bg-base/layer/sidebar/bubble/input/menu 等多个浅色面均 FAIL
  assert.ok(result.summary.contrastIssues >= 7, `矩阵扩展后应为多面 FAIL（实际 ${result.summary.contrastIssues}）`)
})

test('仅大文本达标：AA-large 提示', () => {
  const result = precheckPreset({
    '--dsw-alias-bg-base': { light: '#ffffff', dark: '#ffffff' },
    '--dsw-alias-label-primary': { light: '#888888', dark: '#888888' },
    '--dsw-alias-label-secondary': { light: '#111111', dark: '#eeeeee' },
    '--dsw-alias-label-tertiary': { light: '#444444', dark: '#bbbbbb' },
  })
  const large = result.issues.find(i => i.message.includes('AA-large'))
  assert.ok(large !== undefined, '#888 on #fff ≈3.5:1 应提示仅大文本达标')
})

test('明暗分别：light 通过 dark 不足 → 只报 dark', () => {
  const result = precheckPreset({
    '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' },
    '--dsw-alias-label-primary': { light: '#111111', dark: '#111111' },
    '--dsw-alias-label-secondary': { light: '#333333', dark: '#cccccc' },
    '--dsw-alias-label-tertiary': { light: '#444444', dark: '#bbbbbb' },
  })
  const dark = result.issues.find(i => i.scheme === 'dark')
  assert.ok(dark !== undefined, '深色下深字对黑底应 FAIL')
  assert.equal(result.issues.some(i => i.scheme === 'light'), false)
})

test('背景缺失：目录默认兜底（不报 FAIL；默认白底深字可读）', () => {
  const result = precheckPreset({
    '--dsw-alias-label-primary': { light: '#000000', dark: '#ffffff' },
    '--dsw-alias-label-secondary': { light: '#000000', dark: '#ffffff' },
    '--dsw-alias-label-tertiary': { light: '#000000', dark: '#ffffff' },
  })
  assert.equal(result.ok, true)
  assert.equal(result.issues.filter(i => i.message.includes('FAIL')).length, 0)
})

test('未知令牌警告 + 豁免前缀不报', () => {
  const result = precheckPreset({
    '--dsw-alias-bg-base': { light: '#fff', dark: '#000' },
    '--totally-unknown-token': { light: '#fff', dark: '#000' },
    '--dsh-custom-thing': { light: '#fff', dark: '#000' },
  })
  assert.equal(result.ok, true)
  const unknown = result.issues.filter(i => i.message.includes('目录外令牌'))
  assert.equal(unknown.length, 1, '未知令牌 1 条警告')
  assert.equal(unknown[0].token, '--totally-unknown-token')
  assert.equal(result.summary.unknownTokens, 1)
})

test('结构硬错误：裸字符串 / 非 -- 前缀 → ok=false', () => {
  const result = precheckPreset({
    '--dsw-alias-bg-base': '#fff', // 裸字符串
    'not-a-token': { light: '#fff', dark: '#000' },
  })
  assert.equal(result.ok, false)
  assert.equal(result.issues.filter(i => i.severity === 'error').length, 2)
  assert.equal(result.summary.pass, false)
})

test('css 补丁：非法选择器 / 空选择器 → 阻断', () => {
  const result = precheckPreset(
    { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } },
    [{ selector: '.class-name', rules: 'x' }, { selector: '', rules: '' }],
  )
  assert.equal(result.ok, false)
  assert.equal(result.issues.filter(i => i.severity === 'error').length, 2)
})

test('css 补丁：合法 [data- 锚点通过', () => {
  const result = precheckPreset(
    { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } },
    [{ selector: '[data-chat-flow]', rules: 'background: red' }],
  )
  assert.equal(result.ok, true)
})

// ---- #73 矩阵扩展 ----

test('#73 按钮对比：亮青绿按钮白字 FAIL（UI 组件 3:1），深字通过', () => {
  const bad = precheckPreset({
    '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' },
    '--dsw-alias-button-primary-fill': { light: 'rgb(0, 255, 200)', dark: 'rgb(0, 255, 200)' },
    '--dsw-alias-label-primary-foreground': { light: '#ffffff', dark: '#ffffff' },
  })
  const btnFail = bad.issues.find(i => i.message.includes('主按钮文字对比度') && i.message.includes('不足'))
  assert.ok(btnFail !== undefined, '亮青绿按钮 + 白字应 FAIL（1.3:1）')
  const good = precheckPreset({
    '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' },
    '--dsw-alias-button-primary-fill': { light: 'rgb(0, 51, 204)', dark: 'rgb(0, 51, 204)' },
  })
  // light：目录默认白字对深蓝 ≥3:1 通过；dark：目录默认黑字对深蓝 <3:1（真实语义——暗色按钮需亮填充）
  const btnPassLight = good.issues.filter(i => i.message.includes('按钮文字对比度') && i.scheme === 'light')
  assert.equal(btnPassLight.length, 0, 'light 深蓝按钮 + 白字应 ≥3:1 通过')
  assert.ok(good.issues.some(i => i.message.includes('按钮文字对比度') && i.scheme === 'dark'), 'dark 黑字对深蓝按钮应提示（暗色按钮宜用亮填充）')
})

test('#73 明暗护栏：light 比 dark 更暗 → warn', () => {
  const result = precheckPreset({
    '--dsw-alias-bg-base': { light: '#000000', dark: '#ffffff' },
    '--dsw-alias-label-primary': { light: '#ffffff', dark: '#111111' },
  })
  const inverted = result.issues.find(i => i.message.includes('明暗反转'))
  assert.ok(inverted !== undefined, '明暗反转应提示')
  assert.equal(inverted.severity, 'warn')
})

test('#73 var 候选内链解析：bg-base 引用候选内自定义令牌可对比', () => {
  const result = precheckPreset({
    '--my-custom-base': { light: '#ffffff', dark: '#000000' },
    '--dsw-alias-bg-base': { light: 'var(--my-custom-base)', dark: 'var(--my-custom-base)' },
    '--dsw-alias-label-primary': { light: '#111111', dark: '#eeeeee' },
  })
  assert.equal(result.ok, true)
  assert.equal(result.issues.filter(i => i.message.includes('无法解析')).length, 0, 'var 指向候选内令牌应解析成功')
})

test('#73 hsl 颜色可解析（近白 vs 白底 → FAIL 提示而非静默）', () => {
  const result = precheckPreset({
    '--dsw-alias-bg-base': { light: 'hsl(0, 0%, 100%)', dark: '#000000' },
    '--dsw-alias-label-primary': { light: 'hsl(0, 0%, 97%)', dark: '#eeeeee' },
  })
  assert.equal(result.issues.filter(i => i.message.includes('无法解析')).length, 0)
  assert.ok(result.issues.some(i => i.message.includes('FAIL')), 'hsl 近白字对白底应报 FAIL 而非静默跳过')
})

test('#73 不可解析显式 warn（候选提供的颜色非法）', () => {
  const result = precheckPreset({
    '--dsw-alias-bg-base': { light: 'not-a-color', dark: '#000000' },
    '--dsw-alias-label-primary': { light: '#111111', dark: '#eeeeee' },
  })
  assert.equal(result.ok, true)
  assert.ok(result.issues.some(i => i.message.includes('无法解析')), '候选提供的非法颜色应显式 warn')
})

test('#73 全载荷校验：widgets 引用未声明素材 → error 阻断', () => {
  const result = precheckPreset(
    { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } },
    undefined,
    { widgets: [{ id: 'chat-background', params: { assetId: 'asset-nope' } }] },
  )
  assert.equal(result.ok, false, 'widgets 悬空引用应阻断（check 通过 = create 必成）')
  assert.ok(result.issues.some(i => i.severity === 'error' && i.message.includes('素材')))
})

test('#73/#82 出厂预设矩阵全净：全部 demo 对比度警告归零（#82 收敛为唯一 默认）', async () => {
  const { DEMO_PRESETS } = await import('../src/core/demo-data.ts')
  for (const demo of DEMO_PRESETS) {
    const result = precheckPreset(demo.tokens)
    const contrast = result.issues.filter(i => i.message.includes('对比度') || i.message.includes('明暗反转'))
    assert.equal(contrast.length, 0, `${demo.id} 不应有对比度/明暗警告：${contrast.map(i => i.message).join('; ')}`)
    assert.equal(result.ok, true, `${demo.id} 结构应通过`)
  }
})
