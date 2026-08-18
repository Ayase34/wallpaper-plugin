// M3-4 AI 对话式换肤 agent 会话实机验证（闭合 M2-3 遗留）：
// 真实 agent（headless profile，deepseek-v4-flash + DEEPSEEK_API_KEY）以自然语言完成任务，
// 端到端验证：agent 调用 preset_create 落盘 → preset_apply 写 active.json → 浏览器加载生效。
// 前置：$DSH_HOME/profiles/headless 已安装（bundles: dsh-base + dsh-headless + ui-presets）。
// #54：DSH_HOME 感知——隔离测试环境下读隔离目录（默认回退 ~/.dsh）。
import { spawnSync } from 'node:child_process'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
const HOME = homedir()
const DSH_HOME = process.env.DSH_HOME ?? join(HOME, '.dsh')
const DSH = join(HOME, '.local', 'bin', 'dsh.cmd')
const HEADLESS_DIR = join(DSH_HOME, 'profiles', 'headless')
const ACTIVE_FILE = join(DSH_HOME, 'data', 'ui-presets', 'active.json')
const PRESETS_DIR = join(DSH_HOME, '.ui-presets')

let pass = 0
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`)
  if (!cond) process.exitCode = 1
  if (cond) pass += 1
}

// 0. 前置检查：headless profile 存在且工具已注册（spike 端 status 佐证同一 Node half）
// #95：插件改名 wallpaper-plugin（原 ui-presets）
check('headless profile 已安装', existsSync(join(HEADLESS_DIR, 'node_modules', 'wallpaper-plugin')))
check('模型凭据存在（DEEPSEEK_API_KEY）', (process.env.DEEPSEEK_API_KEY ?? readFileSync(join(DSH_HOME, '.credentials.yaml'), 'utf8')).includes('sk-'))

// 1. agent 会话：自然语言换肤任务（创建「赛博朋克测试」预设并应用）
const task = '帮我换一个赛博朋克风格的皮肤：用 preset_create 工具创建一个名为「赛博朋克测试」的预设' +
  '（深色背景 rgb(5,10,20) 配青色霓虹主色 rgb(0,255,200)；亮色背景 rgb(240,250,250)），' +
  '然后用 preset_apply 应用它，最后汇报你做了什么和当前活动预设'
const run = spawnSync(DSH, ['--profile', 'headless', task], {
  cwd: HEADLESS_DIR,
  encoding: 'utf8',
  timeout: 240000,
  shell: true,
})
const out = `${run.stdout ?? ''}${run.stderr ?? ''}`
check(`agent 会话完成（exit=${run.status}）`, run.status === 0)
const norm = s => (s ?? '').replace(/\s+/g, '')
check('agent 汇报包含创建与应用动作', (out.includes('preset_create') || out.includes('创建'))
  && (out.includes('preset_apply') || out.includes('应用')) && out.includes('赛博朋克测试'))

// 2. 落盘验证：新建预设文件 + active.json 指向它（revision 单调）
const presetId = /preset-[a-z0-9]{6,}/.exec(out)?.[0] ?? ''
check(`agent 创建预设 id 合法（${presetId}）`, /^preset-[a-z0-9]+$/.test(presetId))
let presetFile = ''
if (/^preset-[a-z0-9]+$/.test(presetId) && existsSync(join(PRESETS_DIR, presetId, 'preset.json'))) {
  presetFile = join(PRESETS_DIR, presetId, 'preset.json')
}
check(`预设已落盘（${presetId}）`, presetFile !== '')
if (presetFile !== '') {
  const preset = JSON.parse(readFileSync(presetFile, 'utf8'))
  const bg = preset.tokens?.['--dsw-alias-bg-base']
  // LLM 输出格式有变体（rgb(5,10,20) / rgb(5, 10, 20) / #050A14）——按语义等价比较；
  // dark 必须等于任务要求的深蓝黑，light 验证双值结构
  const toRgb = (s) => {
    const str = (s ?? '').trim()
    const m = /^#([0-9a-f]{6})$/i.exec(str)
    if (m) { const n = parseInt(m[1], 16); return `rgb(${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255})` }
    const r = /^rgb\(([\d\s.]+),([\d\s.]+),([\d\s.]+)\)$/i.exec(str)
    return r ? `rgb(${r[1].trim()}, ${r[2].trim()}, ${r[3].trim()})` : str
  }
  console.log(`  [debug] bg-base dark=${JSON.stringify(bg?.dark)} light=${JSON.stringify(bg?.light)}`)
  check(`预设令牌正确（bg-base dark 语义=rgb(5,10,20)，双值结构）`,
    toRgb(bg?.dark) === 'rgb(5, 10, 20)' && typeof bg?.light === 'string' && bg.light !== '')
}
const active = JSON.parse(readFileSync(ACTIVE_FILE, 'utf8'))
check(`active.json 指向新预设（${active.activePresetId} rev=${active.revision}）`,
  active.activePresetId === presetId && Number.isInteger(active.revision) && active.revision >= 1)

// 3. 浏览器端到端：spike 加载 → body 变赛博朋克底色（方案无关）
const browser = await launchBrowser()
const page = await browser.newPage()
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
let bg = ''
for (let i = 0; i < 25; i += 1) {
  bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  if (bg === 'rgb(5, 10, 20)' || bg === 'rgb(240, 250, 250)') break
  await page.waitForTimeout(200)
}
check(`浏览器加载即赛博朋克底色（body=${bg}）`, bg === 'rgb(5, 10, 20)' || bg === 'rgb(240, 250, 250)')
await browser.close()

// 4. 清理：删除测试预设，active 还原 null（不碰用户预设/壁纸库）
if (/^preset-[a-z0-9]+$/.test(presetId)) {
  rmSync(join(PRESETS_DIR, presetId), { recursive: true, force: true })
}
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})

console.log(`\n${pass} checks passed`)
console.log('注：M3-4 实测证据 = 真实 LLM agent 会话端到端调用 preset_create/preset_apply（非 stub）')
process.exit(process.exitCode ?? 0)
