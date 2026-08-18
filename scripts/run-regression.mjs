// 全量 e2e 回归运行器：按名序跑所有 e2e-*.mjs + verify-tools.mjs（浏览器脚本连 spike）。
// 用法：node scripts/run-regression.mjs [base]
// ⚠️ #88 流程铁律：必须带隔离 DSH_HOME 启动（e2e 的磁盘断言与工具执行走
//    `process.env.DSH_HOME ?? ~/.dsh` 感知路径）——例如：
//    PowerShell: $env:DSH_HOME = "C:\...\前端美化插件\e2e-home"; node scripts/run-regression.mjs
//    忘设 DSH_HOME → 测试工具直接读写用户真实 ~/.dsh（实测污染 active.json + 建测试预设，
//    决策 #88 记录）；另注意 DSH_HOME 要用工作区根绝对路径（e2e-home 在仓库根，不在 ui-presets/ 内）。
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
const ROOT = resolve(import.meta.dirname, '..')
const TESTS = join(ROOT, 'tests')
const files = [
  // #96：排除共享助手 e2e-util.mjs（无断言，跑它只造成回归统计虚高）
  ...readdirSync(TESTS).filter(f => f.startsWith('e2e-') && f.endsWith('.mjs') && f !== 'e2e-util.mjs').sort(),
  'verify-tools.mjs',
]
// 环境可选脚本：agent-session 需 API key + headless profile（隔离 e2e-home 未装 → 跳过并注明）
const optionalWhenNoEnv = ['e2e-agent-session.mjs']
const results = []
let failed = 0
for (const f of files) {
  if (optionalWhenNoEnv.includes(f) && !existsSync(join(TESTS, '..', 'e2e-home', 'profiles', 'headless', 'node_modules', 'wallpaper-plugin'))) {
    console.log(`SKIP ${f} (无 headless profile / API key——环境可选脚本)`)
    results.push(`SKIP ${f} (无 headless profile / API key)`)
    continue
  }
  const started = Date.now()
  const res = spawnSync(process.execPath, [join(TESTS, f), BASE], {
    encoding: 'utf8', timeout: 900000, windowsHide: true,
  })
  const out = `${res.stdout ?? ''}${res.stderr ?? ''}`
  // 行首锚定计数（PASS/FAIL 前缀行；PASS 行正文里的"FAIL"字样不算失败）
  const pass = (out.match(/^PASS /gm) ?? []).length
  const fail = (out.match(/^FAIL /gm) ?? []).length
  const secs = Math.round((Date.now() - started) / 1000)
  const status = res.status === 0 && fail === 0 ? 'OK' : 'FAILED'
  if (status === 'FAILED') failed += 1
  const line = `${status} ${f} (${secs}s, pass=${pass}, fail=${fail})`
  console.log(line)
  results.push(line)
  if (status === 'FAILED') {
    // 失败时输出尾部日志（前 40 行 + 后 40 行）
    const lines = out.split('\n')
    const tail = lines.length > 80 ? [...lines.slice(0, 40), '...', ...lines.slice(-40)] : lines
    console.log(tail.join('\n'))
  }
}
const summary = `\n==== ${files.length} scripts, ${failed} failed ====\n` + results.join('\n')
console.log(summary)
writeFileSync(join(ROOT, 'tests', '.regression-last.txt'), summary, 'utf8')
process.exit(failed === 0 ? 0 : 1)
