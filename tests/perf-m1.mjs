// M1 性能红线验收：草稿编辑 1 令牌 → mock 预览刷新延迟（P95 < 200ms）。
// #69 测量方法学改进：
// - 纯页面内打点（无 playwright evaluate 往返、无轮询量化误差）：
//   input 事件记录 t0（每字符更新，最后一个字符即最终起点）→ MutationObserver
//   观察预览面板 style 属性变化 → 页面内读内联变量值，等于目标值即记录 t1。
//   延迟 = t1 - t0（React 提交 → 属性写入 → observer 微任务，误差 <1ms）。
// - 历史记录：追加写入 tests/.perf-history.json（时间戳/分位数/环境注记），
//   输出时打印与最近一次基线的对比——机器重负载时超标可结合注记判断（决策 #64）。
// - 环境注记：UIP_PERF_NOTE 环境变量（如 "负载:游戏运行中"）随结果写入历史。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
const LIMIT_MS = Number(process.env.UIP_PERF_LIMIT ?? 200)
const ROUNDS = Number(process.env.UIP_PERF_ROUNDS ?? 12)
const NOTE = process.env.UIP_PERF_NOTE ?? ''
const HISTORY_FILE = join(process.cwd(), 'tests', '.perf-history.json')

const browser = await launchBrowser()
const page = await browser.newPage()
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
const trigger = page.getByRole('button', { name: '设置', exact: true })
await trigger.waitFor({ timeout: 120000 })
await dismissBetaNotice(page)
await trigger.click()
const dialog = page.getByRole('dialog', { name: '设置' })
await dialog.waitFor({ timeout: 30000 })
await dialog.getByRole('button', { name: '外观预设', exact: true }).click()
await dialog.getByRole('button', { name: '打开美化工作室 →' }).click()
const studio = page.locator('[data-up-studio]')
await studio.waitFor({ timeout: 10000 })
await studio.locator('[data-up-card]', { hasText: '默认' }).first().getByRole('button', { name: '编辑' }).click()
// M2-1：高级令牌默认折叠——展开后才可用令牌输入
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(200)
const input = studio.getByLabel('--dsw-alias-bg-base light 值').first()
await input.waitFor({ timeout: 10000 })
// #75：预览已移除——观测引擎注入文本（含目标值即生效），无需切明暗
await input.click()
await input.press('Control+A')

// #69：页面内精确打点（input 事件 → MutationObserver → 注入值比对）
// #75：令牌经宿主 theme 服务注入到 body 内联 style（原样值）——观察 body style 属性变化，
// 比对 --dsw-alias-bg-base 等于目标值即"编辑已生效"。
await page.evaluate(() => {
  const perf = { t0: null, t1: null, resolve: null }
  ;(window).__upPerf = perf
  // t0：任一 INPUT 的 input 事件（每字符更新，最后一个字符即最终起点）
  document.addEventListener('input', (e) => {
    if (e.target instanceof HTMLInputElement) perf.t0 = performance.now()
  })
  const hasTarget = () => document.body.style.getPropertyValue('--dsw-alias-bg-base') === (window).__upPerfTarget
  const observer = new MutationObserver(() => {
    if (perf.t1 !== null || perf.t0 === null) return
    if (hasTarget()) {
      perf.t1 = performance.now()
      if (perf.resolve !== null) { perf.resolve(perf.t1 - perf.t0); perf.resolve = null }
    }
  })
  observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })
  ;(window).__upPerfObserver = observer
})

const latencies = []
let seq = 0
for (let i = 0; i < ROUNDS; i += 1) {
  const target = `#30${String(seq % 10)}45${i % 10}`
  seq += 1
  await page.evaluate(t => { (window).__upPerfTarget = t }, target)
  // 准备页面内 promise（observer 在样式值正确时 resolve(延迟)）；evaluate 在页面 promise 落定时返回
  const ready = page.evaluate(() => {
    const perf = (window).__upPerf
    perf.t0 = null
    perf.t1 = null
    return new Promise(resolve => { perf.resolve = resolve })
  })
  // 发起输入（每字符触发 input 事件 → t0 更新；最后一个字符即最终起点）
  await input.press('Control+A')
  await input.pressSequentially(target)
  // 等待页面 promise（React 提交 → 面板 style 写入 → observer 微任务比对目标值）
  const timer = new Promise(resolve => setTimeout(() => resolve(-1), 2000))
  const latency = await Promise.race([ready, timer])
  if (latency < 0) {
    console.log(`ROUND ${i} FAILED: preview not updated to ${target}`)
    process.exitCode = 1
    break
  }
  latencies.push(latency)
}

const sorted = [...latencies].sort((a, b) => a - b)
const p95 = Math.round(sorted[Math.floor(sorted.length * 0.95)] ?? 0)
const p50 = Math.round(sorted[Math.floor(sorted.length * 0.5)] ?? 0)

// #69：历史记录 + 环境注记
const history = { entries: [] }
if (existsSync(HISTORY_FILE)) {
  try { history.entries = JSON.parse(readFileSync(HISTORY_FILE, 'utf8')).entries ?? [] } catch { /* 损坏历史重建 */ }
}
history.entries.push({ ts: new Date().toISOString(), p50, p95, limit: LIMIT_MS, note: NOTE, rounds: latencies.length })
writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2))
const prev = history.entries.length >= 2 ? history.entries[history.entries.length - 2] : null

console.log(`rounds=${latencies.length} p50=${p50}ms p95=${p95}ms limit=${LIMIT_MS}ms${NOTE !== '' ? ` note=${NOTE}` : ''}`)
if (prev !== null) {
  console.log(`history: prev p95=${prev.p95}ms (${prev.ts.slice(0, 16)}${prev.note !== '' ? `, ${prev.note}` : ''}) → Δ=${p95 - prev.p95}ms`)
}
console.log(p95 <= LIMIT_MS ? 'PASS 性能红线（P95 ≤ 200ms）' : 'FAIL 性能红线超标')
await browser.close()
process.exit(process.exitCode ?? (p95 <= LIMIT_MS ? 0 : 1))
