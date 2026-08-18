// M4-3 窄屏响应式 e2e：<900px 视口下工作室三栏纵向堆叠（中栏优先、左右栏限高内滚），
// 编辑器与预设列表仍可访问。窄屏宿主侧边栏收起——先展开侧边栏再进设置。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'

await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})
const existingList = await (await fetch(`${BASE}/ui-presets/presets`)).json()
for (const item of existingList.presets ?? []) {
  await fetch(`${BASE}/ui-presets/presets/${encodeURIComponent(item.id)}`, { method: 'DELETE' }).catch(() => {})
}

const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: 880, height: 900 } })
let pass = 0
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`)
  if (!cond) process.exitCode = 1
  if (cond) pass += 1
}
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
// 先关首启引导弹窗（#54 隔离的 e2e-home 必现「内测声明」+「添加 API Key」；
// 引导模态带全屏 mask，会拦截后续点击——必须最先处理）
await dismissBetaNotice(page)
// 窄屏宿主侧边栏收起——展开后再找设置入口（等 boot settle）
await page.waitForTimeout(3000)
const sidebarBtn = page.getByRole('button', { name: '打开侧边栏' })
if (await sidebarBtn.count() > 0) {
  await sidebarBtn.click()
  // 等待侧边栏展开动画完成后设置按钮可见
  await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 30000 })
} else {
  await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 120000 })
}
await page.getByRole('button', { name: '设置', exact: true }).click()
const dialog = page.getByRole('dialog', { name: '设置' })
await dialog.waitFor({ timeout: 30000 })
await dialog.getByRole('button', { name: '外观预设', exact: true }).click()
await dialog.getByRole('button', { name: '打开美化工作室 →' }).click()
const studio = page.locator('[data-up-studio]')
await studio.waitFor({ timeout: 10000 })
await studio.locator('[data-up-card]').first().waitFor({ timeout: 10000 })
await studio.locator('[data-up-card]', { hasText: '默认' }).first().getByRole('button', { name: '编辑' }).click()
await studio.getByLabel('预设名称').waitFor({ timeout: 10000 })
await page.waitForTimeout(400)

// 1. 窄屏三栏纵向堆叠（flex-direction: column）
const bodyDir = await studio.locator('[data-up-studio-body]').evaluate(el => getComputedStyle(el).flexDirection)
check(`窄屏工作室纵向堆叠（flexDirection=${bodyDir}）`, bodyDir === 'column')

// 2. 中栏（编辑器）仍可见可用（宽度 = 视口宽）
const editorW = await studio.locator('[data-up-editor-col]').evaluate(el => Math.round(el.getBoundingClientRect().width))
check(`中栏编辑器可见（w=${editorW}）`, editorW > 0)

// 3. 左栏（预设列表）仍可见（限高内滚）
const aside = await studio.locator('[data-up-studio-body] > aside').first().evaluate(el => {
  const r = el.getBoundingClientRect()
  return { w: Math.round(r.width), overflowY: getComputedStyle(el).overflowY }
})
check(`左栏预设列表可见（w=${aside.w} overflow=${aside.overflowY}）`, aside.w > 0)

// 4. 宽屏恢复正常三栏（横向）——媒体查询不残留
await page.setViewportSize({ width: 1280, height: 900 })
await page.waitForTimeout(300)
const wideDir = await studio.locator('[data-up-studio-body]').evaluate(el => getComputedStyle(el).flexDirection)
check(`宽屏恢复横向三栏（flexDirection=${wideDir}）`, wideDir === 'row')

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
