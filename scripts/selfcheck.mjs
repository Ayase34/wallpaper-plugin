#!/usr/bin/env node
/**
 * ui-presets 一键自检（阶段测试指南配套工具）
 *
 * 用法：node scripts/selfcheck.mjs    （任意工作目录，自动定位包根）
 * 或：  pnpm selfcheck
 *
 * 检查项：
 *   1. 构建一致性  node scripts/build.mjs --check   （产物与源码字节一致 + 层断言）
 *   2. 单元测试    node --test CLI 直通终端 + 退出码判定（schema / engine / core-ext / controller）
 *   3. 安装状态    desktop profile 的 bundle 声明（package.json bundles 或 cordis.patch.yml）且未禁用
 *   4. 数据完整性  <dshHome>/data/ui-presets 与 <dshHome>/.ui-presets 的 JSON 合法、
 *                  active.json 引用有效（demo-* 内置演示预设豁免——不落盘属正常）
 *
 * 实现注记：单元测试用 stdio:'inherit' 直通终端 + 退出码判定，不依赖子进程管道捕获。
 * 实测 pnpm run（DSH Desktop 运行时内嵌 Node 24.18.1）环境下 spawnSync 捕获 `node --test`
 * 输出为空（status=0 但 stdout/stderr 全空），且 node:test run() 隔离子进程瞬间失败；
 * 而直通终端 + 退出码在两种环境下均可靠（探针验证：fail→exit 1 / pass→exit 0）。
 * 优先用 PATH 上的 node（与 pnpm exec 行为一致），找不到再退回当前进程 node。
 *
 * 环境变量覆盖：
 *   UIP_HOME        DSH 主目录（默认 ~/.dsh，与插件 Node half 的 DSH_HOME 同源）
 *   UIP_PROFILE_DIR desktop profile 目录（默认 <UIP_HOME>/profiles/desktop）
 *   UIP_DATA_DIR    插件数据目录（默认 <UIP_HOME>/data/ui-presets）
 *
 * 退出码：0 = 全部通过；1 = 有失败项（可接入 CI）
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const HOME = process.env.UIP_HOME ?? process.env.DSH_HOME ?? join(homedir(), '.dsh')
const PROFILE_DIR = process.env.UIP_PROFILE_DIR ?? join(HOME, 'profiles', 'desktop')
const DATA_DIR = process.env.UIP_DATA_DIR ?? join(HOME, 'data', 'ui-presets')
const PRESETS_DIR = join(HOME, '.ui-presets')

const results = []

async function run(label, fn) {
  const t0 = Date.now()
  try {
    results.push({ label, ok: true, detail: String((await fn()) ?? ''), ms: Date.now() - t0 })
  } catch (err) {
    results.push({ label, ok: false, detail: String(err?.message ?? err), ms: Date.now() - t0 })
  }
}

function exec(args) {
  const r = spawnSync(process.execPath, args, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 180000,
    windowsHide: true,
  })
  if (r.error) throw r.error
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`
  if (r.status !== 0) throw new Error(`exit=${r.status}\n${out.slice(-1500)}`)
  return out
}

// ── 1. 构建一致性 ──────────────────────────────────────────────
await run('构建一致性 build --check', () => {
  exec(['scripts/build.mjs', '--check'])
  return '产物与源码字节一致，层断言通过'
})

// ── 2. 单元测试（CLI 直通终端 + 退出码判定） ───────────────────
await run('单元测试 node --test', () => {
  const files = readdirSync(join(ROOT, 'tests'))
    .filter((f) => f.endsWith('.test.mjs'))
    .map((f) => join(ROOT, 'tests', f))
  if (files.length === 0) throw new Error('tests/ 下未发现 *.test.mjs')
  const args = ['--test', ...files]
  let res = spawnSync('node', args, { cwd: ROOT, stdio: 'inherit', timeout: 180000, windowsHide: true })
  if (res.error && res.error.code === 'ENOENT') {
    res = spawnSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit', timeout: 180000, windowsHide: true })
  }
  if (res.error) throw res.error
  if (res.status !== 0) throw new Error(`测试失败（exit=${res.status}，详见上方输出）`)
  return `${files.length} 个测试文件全部通过（stdout 直通终端，以退出码判定）`
})

// ── 3. 安装状态 ────────────────────────────────────────────────
// #95：插件改名 wallpaper-plugin——安装声明按新名检查（数据目录 data/ui-presets/.ui-presets 不变）。
await run('安装状态 desktop profile', () => {
  const pkgFile = join(PROFILE_DIR, 'package.json')
  const patchFile = join(PROFILE_DIR, 'cordis.patch.yml')
  const notes = []
  // 机制 A：profile package.json（dsh.profile.bundles + dependencies，pnpm link 安装）
  if (existsSync(pkgFile)) {
    const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'))
    const bundles = pkg?.dsh?.profile?.bundles ?? []
    if (bundles.includes('wallpaper-plugin')) {
      const dep = pkg?.dependencies?.['wallpaper-plugin']
      if (!dep) notes.push('⚠ bundles 在列但 dependencies 缺声明')
      else if (typeof dep === 'string' && dep.startsWith('link:')) notes.push(`pnpm 链接: ${dep.slice(5)}`)
      if (!existsSync(join(PROFILE_DIR, 'node_modules', 'wallpaper-plugin'))) notes.push('⚠ node_modules/wallpaper-plugin 不存在（链接断裂）')
      return `profile package.json bundles 在列${notes.length ? '；' + notes.join('；') : ''}`
    }
  }
  // 机制 B：cordis.patch.yml 补丁行（dsh plugin add 安装方式）
  if (existsSync(patchFile)) {
    const lines = readFileSync(patchFile, 'utf8').split(/\r?\n/)
    const idx = lines.findIndex((l) => /^\s*- id:\s*wallpaper-plugin\s*$/.test(l))
    if (idx >= 0) {
      if (lines.some((l) => /^\s*disabled:\s*true/.test(l))) {
        throw new Error('补丁中存在 disabled: true（插件被禁用，可能是崩溃恢复残留，请检查后移除）')
      }
      return `cordis.patch.yml 第 ${idx + 1} 行在列且未禁用`
    }
  }
  throw new Error(`未找到安装声明（${pkgFile} 的 bundles / ${patchFile} 均无 wallpaper-plugin）`)
})

// ── 4. 数据完整性 ──────────────────────────────────────────────
await run('数据完整性 data/ui-presets + .ui-presets', () => {
  const problems = []
  let count = 0
  if (existsSync(DATA_DIR)) {
    for (const f of readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'))) {
      count += 1
      try {
        JSON.parse(readFileSync(join(DATA_DIR, f), 'utf8'))
      } catch (err) {
        problems.push(`${DATA_DIR}\\${f} JSON 损坏：${err.message}`)
      }
    }
  }
  const activeFile = join(DATA_DIR, 'active.json')
  let activeNote = ''
  if (existsSync(activeFile)) {
    try {
      const { activePresetId } = JSON.parse(readFileSync(activeFile, 'utf8'))
      if (activePresetId) {
        const target = join(PRESETS_DIR, activePresetId, 'preset.json')
        if (!existsSync(target)) {
          // #95/#96：内置演示预设 id 是 'default'（不再 demo-* 前缀）——按 demo-data 语义豁免
          if (activePresetId === 'default') {
            activeNote = `（活动=${activePresetId} 为内置出厂预设，不落盘属正常）`
          } else {
            problems.push(`active.json 指向 ${activePresetId}，但 ${target} 不存在（悬挂引用）`)
          }
        }
      }
    } catch (err) {
      problems.push(`active.json 损坏：${err.message}`)
    }
  }
  if (existsSync(PRESETS_DIR)) {
    for (const id of readdirSync(PRESETS_DIR)) {
      // M2-8：壁纸库目录（素材文件，非预设）——跳过
      if (id === 'assets') continue
      const f = join(PRESETS_DIR, id, 'preset.json')
      if (!existsSync(f)) {
        problems.push(`.ui-presets\\${id} 缺少 preset.json`)
        continue
      }
      try {
        const p = JSON.parse(readFileSync(f, 'utf8'))
        if (p.id !== id) problems.push(`.ui-presets\\${id}\\preset.json 内部 id 不一致：${p.id}`)
      } catch (err) {
        problems.push(`.ui-presets\\${id}\\preset.json 损坏：${err.message}`)
      }
    }
  }
  if (problems.length) throw new Error(problems.join('；'))
  return `${count} 个数据 JSON 合法，引用有效${activeNote}`
})

// ── 汇总 ───────────────────────────────────────────────────────
console.log('')
console.log('══ ui-presets 一键自检 ══')
console.log(`  包根目录 : ${ROOT}`)
console.log(`  DSH 主目录: ${HOME}`)
console.log('')
for (const r of results) {
  const mark = r.ok ? '✅ PASS' : '❌ FAIL'
  console.log(`  [${mark}] ${r.label}（${r.ms}ms）`)
  if (r.detail) console.log(`          ${r.detail}`)
}
const failed = results.filter((r) => !r.ok)
console.log('')
console.log(`  结果：${results.length - failed.length}/${results.length} 通过${failed.length ? `，失败 ${failed.length} 项 → 见上方 ❌` : ' 🎉'}`)
console.log('')
console.log('  提示：本自检不含「重启加载」与 UI 交互，请按《阶段测试指南》手动验证。')
process.exitCode = failed.length ? 1 : 0
