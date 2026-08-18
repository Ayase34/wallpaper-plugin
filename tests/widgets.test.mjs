// 部件单测：目录（#49 后 3 个）/ CSS 生成（不透明度 wash）/ schema 素材与部件校验 / 一等公民清洗。
// #49（用户拍板）：全局背景图/顶部强调色条/品牌标 已移除——目录 6→3；剩余 3 个加「不透明度」滑杆。
// .mjs 纯 JS。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  widgetCss,
  widgetsToCss,
  WIDGETS,
  MAX_ASSETS,
  MAX_ASSET_DATAURL_LENGTH,
  assetCssUrl,
} from '../src/core/widgets.ts'
import { validatePreset } from '../src/core/schema.ts'

const ASSETS = [{ id: 'a1', name: 'pic.png', mime: 'image/png', dataUrl: 'data:image/png;base64,AAAA' }]
const base = { schemaVersion: 1, id: 'w-test', name: '部件测试', edition: 'standard', tokens: {} }

test('部件目录固定清单 3 个（#49：全局背景/强调色条/品牌标已移除）', () => {
  assert.equal(WIDGETS.length, 3)
  assert.deepEqual(WIDGETS.map(w => w.id), ['chat-background', 'settings-background', 'sidebar-poster'])
  // 三个保留下来的部件都带不透明度 range 参数（默认 1）
  for (const def of WIDGETS) {
    const opacity = def.params.find(p => p.key === 'opacity')
    assert.ok(opacity !== undefined && opacity.type === 'range' && opacity.default === '1'
      && opacity.min === 0 && opacity.max === 1, `${def.id} 缺不透明度参数`)
  }
})

test('chat-background：缺素材不产出；opacity=1 无 wash；opacity<1 生成底色 wash（不透明内容不受影响）', () => {
  assert.equal(widgetCss('chat-background', { assetId: '' }, ASSETS), '')
  const full = widgetCss('chat-background', { assetId: 'a1' }, ASSETS)
  assert.ok(full.includes('[data-conversation-scroll] { background-image:'))
  assert.ok(full.includes('data:image/png;base64,AAAA'))
  assert.ok(!full.includes('::before'), '不用伪元素')
  assert.ok(!full.includes('color-mix'), '默认不透明度 1 不产生 wash（与旧版输出一致）')
  assert.ok(!full.includes('opacity:'), '不用 opacity 属性（避免内容一起变透明）')
  const faded = widgetCss('chat-background', { assetId: 'a1', opacity: '0.4' }, ASSETS)
  assert.ok(faded.includes('color-mix(in srgb, var(--dsw-alias-bg-base, #fff) 60%, transparent)'), faded)
  assert.ok(faded.includes('url("data:image/png;base64,AAAA")'), 'wash 层之后仍有图')
  // 越界值被钳制
  const over = widgetCss('chat-background', { assetId: 'a1', opacity: '3' }, ASSETS)
  assert.ok(!over.includes('color-mix'), 'opacity>1 钳制为 1 → 无 wash')
})

test('设置卡背景图/侧栏海报：元素背景 + 不透明度 wash（侧栏向 sidebar-fill 淡出）', () => {
  const settings = widgetCss('settings-background', { assetId: 'a1', opacity: '0.7' }, ASSETS)
  // #52b/#96：设置卡目标排除裁剪对话框与确认框（role=dialog 但 data-up-crop / data-up-confirm）
  assert.ok(settings.includes('[role="dialog"]:not([data-up-crop]):not([data-up-confirm]) { background-image:'), settings)
  assert.ok(settings.includes('color-mix(in srgb, var(--dsw-alias-bg-base, #fff) 30%, transparent)'))
  const sidebar = widgetCss('sidebar-poster', { assetId: 'a1', opacity: '0.25' }, ASSETS)
  assert.ok(sidebar.includes('[data-slot="sidebar"] > div:first-child { background-image:'), sidebar)
  assert.ok(sidebar.includes('var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-base, #fff)) 75%, transparent'), sidebar)
  assert.equal(widgetCss('settings-background', { assetId: '' }, ASSETS), '')
  assert.equal(widgetCss('sidebar-poster', { assetId: '' }, ASSETS), '')
})

test('#53 已裁剪（cropX/cropW 存在）：静态 CSS 只产出裁剪标记（动态渲染归 controller），不再输出 background-image', () => {
  const marker = widgetCss('chat-background', { assetId: 'a1', opacity: '0.4', cropX: '150', cropY: '-270', cropW: '1620', cropH: '1620' }, ASSETS)
  assert.ok(marker.startsWith('/* up-crop:chat-background:0.4:150:-270:1620:1620:url('), marker)
  assert.ok(marker.includes('data:image/png;base64,AAAA'))
  assert.ok(!marker.includes('background-image'), '裁剪路径不产出静态 background-image')
  const sidebarMarker = widgetCss('sidebar-poster', { assetId: 'a1', cropX: '0', cropY: '0', cropW: '384', cropH: '1920' }, ASSETS)
  assert.ok(sidebarMarker.includes('up-crop:sidebar-poster:1:0:0:384:1920:url('), sidebarMarker)
  // 有裁剪参数但素材缺失 → 不产出（controller 同步会清除旧样式）
  assert.equal(widgetCss('chat-background', { assetId: '', cropX: '0', cropY: '0', cropW: '1', cropH: '1' }, ASSETS), '')
})

test('#55 按明暗分别配置（静态路径）：深色规则带 [data-ds-dark-theme] 前缀，wash 随 var 自动切换', () => {
  const css = widgetCss('chat-background', { assetId: 'a1', assetIdDark: 'a1', opacityDark: '0.5' }, ASSETS)
  assert.ok(css.includes('[data-conversation-scroll] { background-image:'), '浅色规则照常')
  assert.ok(css.includes('body[data-ds-dark-theme] [data-conversation-scroll] { background-image:'), css)
  assert.ok(css.includes('color-mix(in srgb, var(--dsw-alias-bg-base, #fff) 50%, transparent)'), '深色 wash 用深色不透明度')
  // 未配深色 → 无深色规则
  const only = widgetCss('chat-background', { assetId: 'a1' }, ASSETS)
  assert.ok(!only.includes('data-ds-dark-theme'))
  // 深色素材缺失 → 深色规则不产出
  const missing = widgetCss('chat-background', { assetId: 'a1', assetIdDark: 'nope' }, ASSETS)
  assert.ok(missing.includes('[data-conversation-scroll] {') && !missing.includes('data-ds-dark-theme'))
})

test('#55 按明暗分别配置（裁剪路径）：产出 up-crop 与 up-crop-dark 双标记', () => {
  const css = widgetCss('chat-background', {
    assetId: 'a1', opacity: '0.4', cropX: '150', cropY: '-270', cropW: '1620', cropH: '1620',
    assetIdDark: 'a1', opacityDark: '0.8', cropXDark: '0', cropYDark: '0', cropWDark: '1920', cropHDark: '1080',
  }, ASSETS)
  assert.ok(css.includes('/* up-crop:chat-background:0.4:150:-270:1620:1620:url('), css)
  assert.ok(css.includes('/* up-crop-dark:chat-background:0.8:0:0:1920:1080:url('), css)
  assert.ok(!css.includes('background-image'))
  // 仅深色裁剪（浅色静态）→ 浅色静态规则 + 深色标记
  const darkOnly = widgetCss('chat-background', {
    assetId: 'a1', assetIdDark: 'a1', cropXDark: '0', cropYDark: '0', cropWDark: '1920', cropHDark: '1080',
  }, ASSETS)
  assert.ok(darkOnly.includes('[data-conversation-scroll] { background-image:'), darkOnly)
  assert.ok(darkOnly.includes('up-crop-dark:chat-background:1:0:0:1920:1080:url('), darkOnly)
})

test('#49 已移除部件（全局背景/强调色条/品牌标）：不产出 CSS，schema 拒绝', () => {
  assert.equal(widgetCss('app-background', { assetId: 'a1' }, ASSETS), '')
  assert.equal(widgetCss('accent-bar', { height: '5' }, ASSETS), '')
  assert.equal(widgetCss('logo-badge', { assetId: 'a1', size: '40' }, ASSETS), '')
  assert.equal(validatePreset({ ...base, widgets: [{ id: 'app-background', params: {} }] }).ok, false)
  assert.equal(validatePreset({ ...base, widgets: [{ id: 'accent-bar', params: {} }] }).ok, false)
  assert.equal(validatePreset({ ...base, widgets: [{ id: 'logo-badge', params: {} }] }).ok, false)
})

test('widgetsToCss：合并有效、跳过缺素材', () => {
  const text = widgetsToCss([
    { id: 'chat-background', params: { assetId: 'missing' } },
    { id: 'sidebar-poster', params: {} },
  ], ASSETS)
  assert.equal(text, '')
  const text2 = widgetsToCss([
    { id: 'chat-background', params: { assetId: 'a1', opacity: '0.5' } },
    { id: 'sidebar-poster', params: { assetId: 'a1' } },
  ], ASSETS)
  assert.ok(text2.includes('data-conversation-scroll') && text2.includes('data-slot="sidebar"'))
})

test('review P1-1：dataUrl CSS 注入防御（schema 拒绝 + assetCssUrl 兜底）', () => {
  // 引号/分号/花括号可闭合 url() 注入任意 CSS——schema 必须拒绝
  const evil = 'data:image/png";} body { background: url(https://evil/x.png); } /*'
  assert.equal(validatePreset({ ...base, assets: [{ ...ASSETS[0], dataUrl: evil }] }).ok, false)
  // 合法 base64 通过；非白名单图片类型拒绝
  assert.equal(validatePreset({ ...base, assets: [{ ...ASSETS[0], dataUrl: 'data:image/png;base64,AAAA' }] }).ok, true)
  assert.equal(validatePreset({ ...base, assets: [{ ...ASSETS[0], dataUrl: 'data:image/svg+xml;base64,AAAA' }] }).ok, false)
  // assetCssUrl 纵深防御：即便绕过校验直接调用，注入 dataUrl 也不产出 url()
  assert.equal(assetCssUrl({ id: 'x', name: 'x', mime: 'image/png', dataUrl: evil }), '')
  assert.equal(assetCssUrl({ id: 'x', name: 'x', mime: 'image/png', dataUrl: 'data:image/png;base64,AAAA' }), 'url("data:image/png;base64,AAAA")')
})

test('schema：素材校验（mime/数量/体积）', () => {
  assert.equal(validatePreset({ ...base, assets: ASSETS }).ok, true)
  assert.equal(validatePreset({ ...base, assets: [{ ...ASSETS[0], mime: 'text/html' }] }).ok, false)
  const tooMany = validatePreset({
    ...base,
    assets: Array.from({ length: MAX_ASSETS + 1 }, (_, i) => ({ ...ASSETS[0], id: `a${i}` })),
  })
  assert.equal(tooMany.ok, false)
  const tooBig = validatePreset({
    ...base,
    assets: [{ ...ASSETS[0], dataUrl: `data:image/png;base64,${'A'.repeat(MAX_ASSET_DATAURL_LENGTH)}` }],
  })
  assert.equal(tooBig.ok, false)
})

test('schema：部件校验（未知 id / 非法素材引用 / opacity 范围）', () => {
  assert.equal(
    validatePreset({ ...base, widgets: [{ id: 'chat-background', params: { assetId: '', opacity: '0.5' } }] }).ok,
    true,
  )
  assert.equal(validatePreset({ ...base, widgets: [{ id: 'evil-widget', params: {} }] }).ok, false)
  assert.equal(
    validatePreset({ ...base, assets: ASSETS, widgets: [{ id: 'chat-background', params: { assetId: 'nope' } }] }).ok,
    false,
  )
  assert.equal(
    validatePreset({ ...base, widgets: [{ id: 'chat-background', params: { opacity: '2' } }] }).ok,
    false,
  )
  assert.equal(
    validatePreset({ ...base, widgets: [{ id: 'chat-background', params: { opacity: '-0.1' } }] }).ok,
    false,
  )
  // 省略 opacity（旧数据）→ 默认 1，合法
  assert.equal(
    validatePreset({ ...base, widgets: [{ id: 'sidebar-poster', params: { assetId: '' } }] }).ok,
    true,
  )
})

test('schema：assets/widgets 一等公民（不进 extra）', () => {
  const result = validatePreset({
    ...base,
    assets: ASSETS,
    widgets: [{ id: 'chat-background', params: { assetId: 'a1', opacity: '0.6' } }],
  })
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.preset.assets?.length, 1)
  assert.equal(result.preset.widgets?.length, 1)
  assert.equal(result.preset.widgets?.[0]?.params.opacity, '0.6')
  assert.equal(result.preset.extra?.assets, undefined)
  assert.equal(result.preset.extra?.widgets, undefined)
})
