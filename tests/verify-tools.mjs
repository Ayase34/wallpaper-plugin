// #69 工具验证矩阵：11 个 preset_*/asset_* 工具的有效性与可靠性系统化验证。
// 有效性：工具定义齐全/结构完整/正常路径输出**无损 JSON**（#101：JSON.stringify 会静默
// 丢弃 undefined/NaN——宿主输出校验要求无损，旧"可序列化"检查抓不到该缺陷）且含关键字段。
// 可靠性：非法参数教学错误不崩溃/幂等（apply×2、revert×2）/顺序一致性链路/
// 删活动预设还原/空库与全量截断/损坏文件健壮性/连发 id 唯一。
// 直调 execute（与 agent 实际执行同源代码，stub defineTool 仅跳过 schema 校验）；
// 环境：#54 隔离——测试进程需继承 DSH_HOME。
import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createPresetToolDefs } from '../src/node/tools.ts'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
const DSH = process.env.DSH_HOME ?? join(homedir(), '.dsh')
const env = {
  presetsDir: join(DSH, '.ui-presets'),
  assetsDir: join(DSH, '.ui-presets', 'assets'),
  dataDir: join(DSH, 'data', 'ui-presets'),
  activeFile: join(DSH, 'data', 'ui-presets', 'active.json'),
  configFile: join(DSH, 'data', 'ui-presets', 'config.json'),
}

let pass = 0
let fail = 0
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`)
  if (cond) pass += 1
  else { fail += 1; process.exitCode = 1 }
}

// ---- 前置：active 置空 + 清库（保留 demo）+ 清测试素材 ----
await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})
const existingList = await (await fetch(`${BASE}/ui-presets/presets`)).json()
for (const item of existingList.presets ?? []) {
  await fetch(`${BASE}/ui-presets/presets/${encodeURIComponent(item.id)}`, { method: 'DELETE' }).catch(() => {})
}

/** #101：无损 JSON 校验——递归查找 undefined/非有限数/循环引用（宿主输出校验同语义；
 * JSON.stringify 会静默丢弃 undefined，必须显式遍历）。返回违规路径数组。 */
function losslessViolations(value, path = 'value', seen = new Set()) {
  if (value === undefined) return [`${path} = undefined`]
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return []
  if (typeof value === 'number') return Number.isFinite(value) ? [] : [`${path} = ${value}`]
  if (seen.has(value)) return [`${path} = cyclic`]
  seen.add(value)
  if (Array.isArray(value)) {
    const out = []
    for (let i = 0; i < value.length; i += 1) out.push(...losslessViolations(value[i], `${path}[${i}]`, seen))
    return out
  }
  const out = []
  for (const key of Object.keys(value)) out.push(...losslessViolations(value[key], `${path}.${key}`, seen))
  return out
}
const assertLossless = (name, value) => {
  const violations = losslessViolations(value)
  check(`无损 JSON：${name}${violations.length > 0 ? `（${violations.slice(0, 3).join('；')}…）` : ''}`,
    violations.length === 0)
}

const stubDefineTool = def => def
const defs = createPresetToolDefs(env, stubDefineTool)
const byName = Object.fromEntries(defs.map(d => [d.name, d]))
const NAMES = ['preset_list', 'preset_apply', 'preset_inspect', 'preset_create', 'preset_catalog', 'preset_get',
  'preset_update', 'preset_delete', 'preset_revert', 'preset_restore_backup', 'asset_list', 'preset_check']
const T = (name) => byName[name]

const BG = { light: '#ffffff', dark: '#000000' }
const hex = (i) => `#30${String(i % 10)}45${i % 10}`

// ============ 有效性 ============

// 1. 工具定义齐全且 name 唯一
check(`工具定义 12 个齐全（${defs.length}）`, defs.length === 12)
check('工具 name 全部匹配且唯一', NAMES.length === defs.length
  && NAMES.every(n => byName[n] !== undefined) && new Set(NAMES).size === NAMES.length)

// 2. 每个定义结构完整（description/parameters/execute/presentCall）
check('工具定义结构完整', defs.every(d =>
  typeof d.name === 'string' && typeof d.description === 'string'
  && typeof d.execute === 'function' && typeof d.presentCall === 'function'))

// 3. 正常路径输出无损 JSON 且含关键字段（全 11 工具）
const listResult = await T('preset_list').execute({}, {})
check('preset_list 输出含 presets 与 default', Array.isArray(listResult.presets) && listResult.presets.some(p => p.id === 'default'))
assertLossless('preset_list', listResult)
const emptyCatalog = await T('preset_catalog').execute({}, {})
check('preset_catalog 输出含六段结构（#73 含 styles）', Array.isArray(emptyCatalog.tokens) && Array.isArray(emptyCatalog.knobs)
  && Array.isArray(emptyCatalog.knob_categories) && Array.isArray(emptyCatalog.css_anchors)
  && Array.isArray(emptyCatalog.styles) && emptyCatalog.styles.length >= 5 && typeof emptyCatalog.matched === 'number')
assertLossless('preset_catalog', emptyCatalog)
// #101：可选字段只在定义时输出——color 类旋钮无 min/max/unit/options，number 类有 min/unit
check('preset_catalog knobs 可选字段按定义输出',
  emptyCatalog.knobs.every(k => (k.min === undefined || typeof k.min === 'number')
    && (k.max === undefined || typeof k.max === 'number')
    && (k.step === undefined || typeof k.step === 'number')
    && (k.unit === undefined || typeof k.unit === 'string')
    && (k.options === undefined || Array.isArray(k.options)))
  && emptyCatalog.knobs.some(k => k.control === 'color' && k.min === undefined && k.options === undefined)
  && emptyCatalog.knobs.some(k => k.control === 'number' && typeof k.min === 'number' && typeof k.unit === 'string'))
const inspectResult = await T('preset_inspect').execute({}, {})
// #96：无活动预设时省略 activePresetId 键（schema 无法声明 nullable）——断言必含字段与无损
check('preset_inspect 输出含活动态字段',
  typeof inspectResult.revision === 'number' && typeof inspectResult.tokenCount === 'number')
assertLossless('preset_inspect', inspectResult)
const assetList = await T('asset_list').execute({}, {})
check('asset_list 返回数组且条目结构完整（id/name/mime/size）',
  Array.isArray(assetList.assets) && assetList.assets.every(a => typeof a.id === 'string' && typeof a.name === 'string' && typeof a.mime === 'string' && typeof a.size === 'number'))
assertLossless('asset_list', assetList)
// #102：render 是 LLM 实际看到的内容（结构化输出不直达模型）——必须携带 id/令牌双值等关键字段
const listRender = T('preset_list').output.render({}, listResult).map(c => c.text).join('\n')
check('preset_list render 含预设 id（default（默认））', listRender.includes('default（'))
const assetRender = T('asset_list').output.render({}, {
  assets: [{ id: 'asset-render-1', name: '图.png', mime: 'image/png', size: 2621440 }],
}).map(c => c.text).join('\n')
check('asset_list render 含素材 id 与体积', assetRender.includes('asset-render-1') && assetRender.includes('2.5MB'))
const getRender = T('preset_get').output.render({}, {
  ok: true,
  preset: {
    name: '渲染测试', id: 'preset-render', edition: 'standard', builtin: false, hasBackup: true, tokenCount: 2,
    tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } },
    css: [], theme: { id: 'preset-render-theme', colorScheme: 'light', tokens: {} },
    assets: [], widgets: [{ id: 'chat-background', params: { assetId: 'asset-render-1', opacity: '0.5' } }],
    cover: null,
  },
}).map(c => c.text).join('\n')
check('preset_get render 含令牌双值与 widgets 参数',
  getRender.includes('--dsw-alias-bg-base') && getRender.includes('light=#fff') && getRender.includes('assetId=asset-render-1'))

// ============ 可靠性 ============

// 4. 教学错误不崩溃（每个写工具至少一个非法参数）
const expectThrow = async (label, fn) => {
  let threw = false
  try { await fn() } catch { threw = true }
  check(label, threw)
}
await expectThrow('preset_create 缺 name 抛错', () => T('preset_create').execute({ tokens: { '--dsw-alias-bg-base': BG } }, {}))
await expectThrow('preset_create 裸字符串令牌抛错', () => T('preset_create').execute({ name: '坏', tokens: { '--dsw-alias-bg-base': '#fff' } }, {}))
await expectThrow('preset_apply 未知 id 抛错', () => T('preset_apply').execute({ id: 'no-such' }, {}))
await expectThrow('preset_update 未知 id 抛错', () => T('preset_update').execute({ id: 'no-such', name: 'x' }, {}))
await expectThrow('preset_update merge_tokens 非对象抛错', () => T('preset_update').execute({ id: 'default', merge_tokens: 'x' }, {}))
await expectThrow('preset_get 未知 id 抛错', () => T('preset_get').execute({ id: 'no-such' }, {}))
await expectThrow('preset_delete demo 拒绝', () => T('preset_delete').execute({ id: 'default' }, {}))
await expectThrow('preset_delete 非法 id 抛错', () => T('preset_delete').execute({ id: '../etc' }, {}))
await expectThrow('preset_restore_backup 无备份抛错', () => T('preset_restore_backup').execute({ id: 'default' }, {}))
await expectThrow('preset_restore_backup 非法 id 抛错', () => T('preset_restore_backup').execute({ id: '../etc' }, {}))

// 5. 教学错误后系统状态不变（create 失败后库数量不变）
// 注：execute 为同步 throw（非 rejected promise）——必须 try/catch 而非 .catch
const countBefore = (await T('preset_list').execute({}, {})).presets.length
try { await T('preset_create').execute({ name: '坏', tokens: { '--dsw-alias-bg-base': '#fff' } }, {}) } catch { /* 预期教学错误 */ }
const countAfter = (await T('preset_list').execute({}, {})).presets.length
check('教学错误后库状态不变', countBefore === countAfter)

// 6. 顺序一致性链路：create → list 含 → get 一致 → update → get 新值 → restore → get 旧值
const created = await T('preset_create').execute({ name: '链路预设', tokens: { '--dsw-alias-bg-base': { light: hex(1), dark: hex(2) } } }, {})
check('链路 create 成功', created.ok === true)
const afterCreate = await T('preset_get').execute({ id: created.id }, {})
check('链路 get 与 create 一致', afterCreate.preset.tokens['--dsw-alias-bg-base'].light === hex(1))
await T('preset_update').execute({ id: created.id, merge_tokens: { '--dsw-alias-bg-base': { light: hex(3), dark: hex(4) } } }, {})
const afterUpdate = await T('preset_get').execute({ id: created.id }, {})
check('链路 update 生效（merge_tokens 新值）', afterUpdate.preset.tokens['--dsw-alias-bg-base'].light === hex(3))
await T('preset_restore_backup').execute({ id: created.id }, {})
const afterRestore = await T('preset_get').execute({ id: created.id }, {})
check('链路 restore 回旧值（交换语义）', afterRestore.preset.tokens['--dsw-alias-bg-base'].light === hex(1))

// 7. 幂等：apply ×2 与 revert ×2 不报错且状态一致
const a1 = await T('preset_apply').execute({ id: created.id }, {})
const a2 = await T('preset_apply').execute({ id: created.id }, {})
check('apply 幂等（两次均成功）', a1.ok === true && a2.ok === true)
const activeAfterApply = await (await fetch(`${BASE}/ui-presets/active`)).json()
check('apply 后 active 指向预设', activeAfterApply.activePresetId === created.id)
const r1 = await T('preset_revert').execute({}, {})
const r2 = await T('preset_revert').execute({}, {})
check('revert 幂等（两次均成功）', r1.ok === true && r2.ok === true)
const activeAfterRevert = await (await fetch(`${BASE}/ui-presets/active`)).json()
check('revert 后 active 为 null', activeAfterRevert.activePresetId === null)

// 8. 删活动预设 → active 自动还原 + inspect 反映
await T('preset_apply').execute({ id: created.id }, {})
await T('preset_delete').execute({ id: created.id }, {})
const afterDeleteActive = await (await fetch(`${BASE}/ui-presets/active`)).json()
check('删除活动预设后 active 自动还原 null', afterDeleteActive.activePresetId === null)
const inspectAfterDelete = await T('preset_inspect').execute({}, {})
// #96：无活动预设时 inspect 省略 activePresetId 键（schema 无法声明 nullable）
check('inspect 反映删除后无活动预设', inspectAfterDelete.activePresetId === undefined)

// 9. catalog 空匹配与全量截断
const emptyMatch = await T('preset_catalog').execute({ query: 'zzz-no-such' }, {})
check('catalog 空匹配返回 0 条', emptyMatch.matched === 0 && emptyMatch.tokens.length === 0)
// #96：不硬编码 369（目录随 DSH 升级再生成）——断言语义关系：matched=全量命中、tokens 按 200 截断
check('catalog 全量 matched 完整且 tokens ≤200 截断',
  emptyCatalog.matched >= 1 && emptyCatalog.tokens.length <= 200 && emptyCatalog.matched >= emptyCatalog.tokens.length)

// 10. 连发 create ×3 → id 唯一（genId 防同毫秒碰撞）
const ids = []
for (let i = 0; i < 3; i += 1) {
  ids.push((await T('preset_create').execute({ name: `连发${i}`, tokens: { '--dsw-alias-bg-base': BG } }, {})).id)
}
check('连发 create 3 个 id 唯一', new Set(ids).size === 3)
const listAfterBurst = await T('preset_list').execute({}, {})
check('连发后 list 含 3 个新预设', ids.every(id => listAfterBurst.presets.some(p => p.id === id)))

// 11. 损坏预设健壮性：写坏一个预设文件 → list 跳过不崩、其余工具正常
mkdirSync(join(env.presetsDir, ids[0]), { recursive: true })
writeFileSync(join(env.presetsDir, ids[0], 'preset.json'), 'not json', 'utf8')
const listAfterCorrupt = await T('preset_list').execute({}, {})
check('损坏预设被 list 跳过（不崩溃）', !listAfterCorrupt.presets.some(p => p.id === ids[0]) && listAfterCorrupt.presets.length >= 2)
let corruptGet = null
try { corruptGet = await T('preset_get').execute({ id: ids[0] }, {}) } catch { corruptGet = null }
check('损坏预设 get 不崩溃（null/抛错均可）', corruptGet === null || corruptGet.ok === false)
// 剩余工具仍可用（update 正常预设）
await T('preset_update').execute({ id: ids[1], merge_tokens: { '--dsw-alias-bg-base': { light: hex(5), dark: hex(6) } } }, {})
const ids1Get = await T('preset_get').execute({ id: ids[1] }, {})
check('损坏场景下其余工具正常', ids1Get.preset.tokens['--dsw-alias-bg-base'].light === hex(5))

// 12. 清理：删除残留预设
for (const id of ids) {
  await fetch(`${BASE}/ui-presets/presets/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {})
}
// 损坏预设 HTTP 删除会失败（preset.json 读不到合法 JSON）→ 直接删目录，
// 保证不留垃圾（否则后续 selfcheck 数据完整性误报）
try { rmSync(join(env.presetsDir, ids[0]), { recursive: true, force: true }) } catch { /* 忽略 */ }

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(process.exitCode ?? 0)
