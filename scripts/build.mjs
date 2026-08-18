// 构建器：src/core + src/node → .dsh-plugin/index.mjs；src/client → .dsh-plugin/client.js。
// 契约（spike 实证）：client bundle 为 window.__ModuleLoader__.load({id, factory}) 包装，
// factory 返回 { name, inject, apply }；react 保持 external 经运行时模块表解析。
// esbuild bin 解析候选：项目 node_modules/.bin → DSH_CHECKOUT → 兄弟插件（gal-view 等自带）→ npm 全局。
// --check 模式：与已提交产物逐字节比对，不一致非零退出（手改生成物禁止）。
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, statSync, existsSync, readdirSync } from 'node:fs'
import { tmpdir, homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = resolve(import.meta.dirname, '..')
const CORE_ENTRY = 'src/core/index.ts'
const CORE_OUTPUT = join(ROOT, 'lib', 'core.mjs')
const NODE_ENTRY = 'src/node/index.ts'
const NODE_OUTPUT = join(ROOT, '.dsh-plugin', 'index.mjs')
const CLIENT_ENTRY = 'src/client/index.tsx'
const CLIENT_OUTPUT = join(ROOT, '.dsh-plugin', 'client.js')

function resolveEsbuildBin() {
  const candidates = [
    join(ROOT, 'node_modules/.bin/esbuild'),
    ...(process.env.DSH_CHECKOUT ? [join(process.env.DSH_CHECKOUT, 'node_modules/.bin/esbuild')] : []),
    ...scanSiblingPlugins(),
    join(homedir(), 'AppData/Roaming/npm/esbuild.cmd'),
  ]
  for (const p of candidates) {
    try {
      // 必须真实可运行：本地安装可能因平台二进制缺失/被杀软隔离而坏掉，
      // 若只做存在性检查，坏 shim 会遮蔽后面可用的候选（如兄弟插件的 esbuild）。
      if (p !== null && statSync(p).isFile() && esbuildBinWorks(p)) return p
    } catch { /* 下一个候选 */ }
  }
  return null
}

/** 候选必须能跑通 `esbuild --version`（非零退出或空输出视为坏候选）。 */
function esbuildBinWorks(bin) {
  const res = spawnSync(bin, ['--version'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    timeout: 15000,
    windowsHide: true,
  })
  if (res.error) return false
  if (res.status !== 0) return false
  return String(res.stdout ?? '').trim().length > 0
}

/** 扫描 ~/.dsh/profiles 下各 profile 插件自带的 esbuild（gal-view 等自带 devDeps）。 */
function scanSiblingPlugins() {
  const out = []
  const home = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  const profiles = join(home, 'profiles')
  try {
    for (const profile of readdirSafe(profiles)) {
      const modules = join(profiles, profile, 'node_modules')
      for (const pkg of readdirSafe(modules)) {
        const cand = join(modules, pkg, 'node_modules', '.bin', 'esbuild')
        if (existsSync(cand)) out.push(cand)
      }
    }
  } catch { /* 扫描失败不影响其余候选 */ }
  return out
}

function readdirSafe(dir) {
  try { return readdirSync(dir) } catch { return [] }
}

function runEsbuild(args, cwd) {
  const bin = resolveEsbuildBin()
  if (bin === null) throw new Error('esbuild 不可用：项目内 pnpm install 安装 devDependencies，或设置 DSH_CHECKOUT')
  const res = spawnSync(bin, args, { cwd, encoding: 'utf8', shell: process.platform === 'win32' })
  if (res.status !== 0) {
    throw new Error(`esbuild 失败（exit ${res.status}）：${String(res.stderr ?? res.error ?? '')}`.trim())
  }
}

function buildCore() {
  const tmpDir = mkdtempSync(join(tmpdir(), 'wallpaper-plugin-core-'))
  const tmpOut = join(tmpDir, 'core.mjs')
  runEsbuild([
    CORE_ENTRY, '--bundle', '--format=esm', '--platform=node', '--target=node20',
    `--outfile=${tmpOut}`,
  ], ROOT)
  return readFileSync(tmpOut, 'utf8')
}

function buildNode() {
  const tmpDir = mkdtempSync(join(tmpdir(), 'wallpaper-plugin-node-'))
  const tmpOut = join(tmpDir, 'index.mjs')
  // #96（GitHub 准备）：DSH_CHECKOUT 必须显式提供（构建依赖宿主的 vendor/schemastery 源码，
  // 不再内置个人机器路径兜底）
  const dshCheckout = process.env.DSH_CHECKOUT
  if (!dshCheckout) {
    throw new Error('构建需要 DSH_CHECKOUT 环境变量（指向 deepseek-harness checkout，vendor/schemastery + vendor/cosmokit 打包自包含）')
  }
  runEsbuild([
    NODE_ENTRY, '--bundle', '--format=esm', '--platform=node', '--target=node20',
    // M2-3：dsh-tools 经宿主 in-box 解析（打包会引入 schemastery/zod 且 npm 拉不到私有包）。
    // 运行时动态 import + try/catch 降级——解析失败只 warn 不 FAILED。
    '--external:@deepseek-ai/dsh-tools',
    // M5-1 修复（桌面端无法启动，决策 #45 后续）：schemastery Config 必须**打包进 bundle**——
    // 静态 import 在插件工作区解析不到 @deepseek-ai/schemastery（MODULE_NOT_FOUND → 插件
    // FAILED → fail-loud 整应用无法启动；CLI 因 dev checkout vendor 解析碰巧能跑）。
    // alias 到 checkout 的 vendor 源码：schemastery 只依赖 cosmokit（纯 TS），打包自包含；
    // cordis fiber 只调用 Config['~standard'].validate()（鸭子类型），不要求与宿主同实例。
    `--alias:@deepseek-ai/schemastery=${join(dshCheckout, 'vendor', 'schemastery', 'src', 'index.ts')}`,
    `--alias:@deepseek-ai/cosmokit=${join(dshCheckout, 'vendor', 'cosmokit', 'src', 'index.ts')}`,
    `--outfile=${tmpOut}`,
  ], ROOT)
  return readFileSync(tmpOut, 'utf8')
}

function buildClient() {
  const tmpDir = mkdtempSync(join(tmpdir(), 'wallpaper-plugin-client-'))
  const tmpOut = join(tmpDir, 'client.js')
  runEsbuild([
    CLIENT_ENTRY, '--bundle', '--format=cjs', '--platform=browser', '--target=es2020',
    '--external:react', '--jsx=transform', '--jsx-factory=React.createElement', '--jsx-fragment=React.Fragment',
    `--outfile=${tmpOut}`,
  ], ROOT)
  const body = readFileSync(tmpOut, 'utf8')
  return Buffer.from(
    `window.__ModuleLoader__.load({\n`
    + `\tid: "wallpaper-plugin",\n`
    + `\tfactory: (require) => {\n`
    + `\t\tvar module = { exports: {} };\n`
    + `\t\tvar exports = module.exports;\n`
    + body.replace(/\n$/, '')
    + `\n\t\treturn module.exports;\n`
    + `\t}\n`
    + `});\n`,
  )
}

function writeChecked(output, content, check) {
  if (!check) {
    writeFileSync(output, content)
    console.log(`[build] 已生成 ${output}`)
    return
  }
  let committed = null
  try { committed = readFileSync(output, 'utf8') } catch { /* 不存在 */ }
  // 统一为 utf8 字符串比较（P0 修复：readFileSync 默认返回 Buffer，与 string content 比较会 TypeError）。
  const committedText = committed
  const contentText = Buffer.isBuffer(content) ? content.toString('utf8') : content
  if (committedText === null || committedText !== contentText) {
    console.error(`[build] ${output} 与生成器输出不一致：运行 node scripts/build.mjs 重新生成（手改生成物禁止）`)
    process.exit(1)
  }
  console.log(`[build] ${output} 新鲜（--check OK）`)
}

const check = process.argv.includes('--check')
mkdirSync(join(ROOT, 'lib'), { recursive: true })
mkdirSync(join(ROOT, '.dsh-plugin'), { recursive: true })
const coreText = buildCore()
const nodeText = buildNode()
const clientText = buildClient()
// 评审 P2 修复：产物分层断言——core/node 产物不得含浏览器全局，client 产物不得含 Node 全局。
assertNoBrowserGlobals(nodeText, '.dsh-plugin/index.mjs')
assertNoBrowserGlobals(coreText, 'lib/core.mjs')
assertNoNodeGlobals(clientText.toString('utf8'), '.dsh-plugin/client.js')
writeChecked(CORE_OUTPUT, coreText, check)
writeChecked(NODE_OUTPUT, nodeText, check)
writeChecked(CLIENT_OUTPUT, clientText, check)

/** 产物不得含浏览器全局（window/document/localStorage 等）——防 core 被污染后 node 构建立即炸。 */
function assertNoBrowserGlobals(text, label) {
  for (const token of ['window.', 'document.', 'localStorage', 'navigator.']) {
    if (text.includes(token)) {
      console.error(`[build] ${label} 含浏览器全局引用 "${token}"——core/node 必须保持纯净（评审 P2）`)
      process.exit(1)
    }
  }
}

/** client 产物不得含 Node 全局（process/node: 内置模块）——防 Node API 漏进浏览器。 */
function assertNoNodeGlobals(text, label) {
  for (const token of ['process.env', "node:", "require('node:"]) {
    if (text.includes(token)) {
      console.error(`[build] ${label} 含 Node 全局引用 "${token}"——client 必须保持浏览器纯净（评审 P2）`)
      process.exit(1)
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) process.exit(0)
