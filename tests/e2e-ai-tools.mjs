// M2 AI 功能端到端测试：模拟对话式换肤——agent 调 preset_create / preset_apply /
// preset_list / preset_inspect（真实 execute 代码，stub defineTool 仅跳过 schema 校验），
// 验证：落盘 → active.json → 浏览器 revision 桥 1 秒内无交互生效（body 变蒸汽波色）。
// 用例：蒸汽波风格主题（深紫底 + 霓虹粉）。
import { homedir } from 'node:os'
import { join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'
import { createPresetToolDefs } from '../src/node/tools.ts'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
// #54：DSH_HOME 感知——隔离测试环境（e2e-home）下读隔离目录，默认回退 ~/.dsh
const DSH = process.env.DSH_HOME ?? join(homedir(), '.dsh')
const env = {
  presetsDir: join(DSH, '.ui-presets'),
  assetsDir: join(DSH, '.ui-presets', 'assets'),
  dataDir: join(DSH, 'data', 'ui-presets'),
  activeFile: join(DSH, 'data', 'ui-presets', 'active.json'),
  configFile: join(DSH, 'data', 'ui-presets', 'config.json'),
}

// 蒸汽波令牌（深紫底 + 霓虹粉品牌）
const VAPORWAVE_TOKENS = {
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
}
const VAPORWAVE_BGS = ['rgb(246, 236, 255)', 'rgb(26, 11, 46)'] // light / dark

// 前置清理：active 置空 + 清库（保留 demo）
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
const page = await browser.newPage()
let pass = 0
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`)
  if (!cond) process.exitCode = 1
  if (cond) pass += 1
}
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))

// 0. 打开页面（桥轮询运行中）→ 工具注册状态
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
const status = await (await fetch(`${BASE}/ui-presets/status`)).json()
check(`AI 工具已注册（toolsRegistered=${status.toolsRegistered}）`, status.toolsRegistered === true)

// 1. 工具定义（stub defineTool = 恒等；execute 为真实代码）
const stubDefineTool = def => def
const [listTool, applyTool, inspectTool, createTool, catalogTool, getTool, updateTool, deleteTool, revertTool, assetListTool, restoreTool, checkTool] = createPresetToolDefs(env, stubDefineTool)

// 2. preset_list：包含内置示例
const listResult = await listTool.execute({}, {})
check('preset_list 返回内置示例', listResult.presets.some(p => p.id === 'default' && p.builtin === true))
// #73：风格标签（style:xxx）随列表输出（风格参考机制）
check('preset_list 含风格标签（default=海洋清爽）', listResult.presets.find(p => p.id === 'default')?.style === '海洋清爽')

// 3. preset_create：创建蒸汽波预设（对话式换肤的核心）
const createResult = await createTool.execute({ name: '蒸汽波（AI）', tokens: VAPORWAVE_TOKENS }, {})
check(`preset_create 成功（id=${createResult.id}）`, createResult.ok === true && /^preset-[a-z0-9]+$/.test(createResult.id))
const createdId = createResult.id
const library = await (await fetch(`${BASE}/ui-presets/presets`)).json()
check('预设已落盘到库', library.presets.some(p => p.id === createdId))

// 4. preset_apply：应用 → active.json（revision 自增）
const applyResult = await applyTool.execute({ id: createdId }, {})
check('preset_apply 成功', applyResult.ok === true && applyResult.id === createdId)
const active = await (await fetch(`${BASE}/ui-presets/active`)).json()
check(`active.json 指向新预设（revision=${active.revision}）`, active.activePresetId === createdId && active.revision >= 1)

// 5. 浏览器桥：无任何交互，≤5s 内 body 变蒸汽波底色（agent 应用即所见）
let bodyBg = ''
for (let i = 0; i < 25; i += 1) {
  bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  if (VAPORWAVE_BGS.includes(bodyBg)) break
  await page.waitForTimeout(200)
}
console.log(`body after ai apply: ${bodyBg}`)
check(`AI 应用经桥即时生效（body=${bodyBg}）`, VAPORWAVE_BGS.includes(bodyBg))

// 6. preset_inspect：当前外观状态一致
const inspectResult = await inspectTool.execute({}, {})
check(`preset_inspect 一致（${inspectResult.activeName}/${inspectResult.tokenCount} 令牌）`,
  inspectResult.activePresetId === createdId
  && inspectResult.activeName === '蒸汽波（AI）'
  && inspectResult.tokenCount === Object.keys(VAPORWAVE_TOKENS).length)

// 7. preset_list：新预设出现在目录（tokenCount 一致）
const listAgain = await listTool.execute({}, {})
const found = listAgain.presets.find(p => p.id === createdId)
check('preset_list 含新预设', found !== undefined && found.builtin === false && found.tokenCount === Object.keys(VAPORWAVE_TOKENS).length)

// 8. 非法应用守卫：不存在的 id 抛错
let threw = false
try { await applyTool.execute({ id: 'no-such-preset' }, {}) } catch { threw = true }
check('preset_apply 未知 id 抛错', threw)

// 9. preset_catalog：令牌语义查询（设计预设的字典）
const catalogResult = await catalogTool.execute({ query: 'bg-base' }, {})
check('preset_catalog 命中 bg-base 令牌', catalogResult.matched >= 1
  && catalogResult.tokens.some(t => t.name === '--dsw-alias-bg-base')
  && catalogResult.tokens[0].group !== undefined)
check('preset_catalog 返回旋钮束映射', Array.isArray(catalogResult.knobs) && catalogResult.knobs.length >= 1)
// #67：CSS 补丁锚点字典（LLM 写 css 补丁不再瞎猜）
check('preset_catalog 返回 CSS 锚点（含 4 个实测锚点）',
  Array.isArray(catalogResult.css_anchors) && catalogResult.css_anchors.length === 4
  && catalogResult.css_anchors.some(a => a.selector === '[data-chat-flow]' && a.note !== undefined))
// #68：catalog 输出补全（knobs 控件语义 / 类别 / scope / matched 总数）
check('preset_catalog knobs 含控件语义（category/control）与类别清单',
  catalogResult.knobs.every(k => k.category !== undefined && k.control !== undefined)
  && Array.isArray(catalogResult.knob_categories) && catalogResult.knob_categories.length >= 1)
check('preset_catalog tokens 含 scope 字段', catalogResult.tokens[0]?.scope !== undefined)
check('preset_catalog matched 为过滤后总数（截断提示）', typeof catalogResult.matched === 'number' && catalogResult.matched >= catalogResult.tokens.length)
// #73：风格术语字典（styles 段）
check('preset_catalog 返回风格字典（styles ≥5 词且结构完整）',
  Array.isArray(catalogResult.styles) && catalogResult.styles.length >= 5
  && catalogResult.styles.every(s => typeof s.term === 'string' && typeof s.guidance === 'string' && Array.isArray(s.demos)))

// 10. preset_update：微调蒸汽波（改主文字亮色）→ 落盘 + 备份
const updateResult = await updateTool.execute({ id: createdId, tokens: { ...VAPORWAVE_TOKENS, '--dsw-alias-label-primary': { light: 'rgb(60, 10, 90)', dark: 'rgb(250, 240, 255)' } } }, {})
check('preset_update 成功', updateResult.ok === true)
const updatedFile = await (await fetch(`${BASE}/ui-presets/presets/${createdId}`)).json()
check('preset_update 落盘新值', updatedFile.preset?.tokens?.['--dsw-alias-label-primary']?.light === 'rgb(60, 10, 90)')
// review P2-8（全量评审）：备份断言改为直接读 backup.json 文件（原 ?backup 查询被路由丢弃且变量无断言）
const backupRaw = await (await fetch(`${BASE}/ui-presets/presets/${createdId}?backup`)).json().catch(() => null)
const backupPath = join(DSH, '.ui-presets', createdId, 'backup.json')
const backupOnDisk = await readFile(backupPath, 'utf8').catch(() => null)
const backupJson = backupOnDisk !== null ? JSON.parse(backupOnDisk) : null
check(`backup.json 已写入且保留更新前旧值（${backupOnDisk !== null}）`,
  backupJson !== null && backupJson.tokens?.['--dsw-alias-label-primary']?.light === 'rgb(42, 15, 77)')
let threwUpdate = false
try { await updateTool.execute({ id: 'no-such-preset', name: 'x' }, {}) } catch { threwUpdate = true }
check('preset_update 未知 id 抛错', threwUpdate)

// 10a. #63 P0-1：merge_tokens 增量合并（微调场景——只更新提供的键，其余保持）
const mergeResult = await updateTool.execute({ id: createdId, merge_tokens: { '--dsw-alias-bg-base': { light: 'rgb(250, 240, 255)', dark: 'rgb(20, 8, 40)' } } }, {})
check('preset_update merge_tokens 成功', mergeResult.ok === true)
const mergedFile = await (await fetch(`${BASE}/ui-presets/presets/${createdId}`)).json()
const mergedTokens = mergedFile.preset?.tokens ?? {}
check('merge_tokens 增量合并（第 10 步改的键保留 + 目标键更新 + 键数不变）',
  mergedTokens['--dsw-alias-label-primary']?.light === 'rgb(60, 10, 90)'
  && mergedTokens['--dsw-alias-bg-base']?.light === 'rgb(250, 240, 255)'
  && Object.keys(mergedTokens).length === Object.keys(VAPORWAVE_TOKENS).length)

// 10b. #63 P0-1 核心回归：更新**当前生效**的活动预设 → 桥重应用 → 界面即时变化（无需重新 apply）
const bgBeforeContentUpdate = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
await updateTool.execute({ id: createdId, merge_tokens: { '--dsw-alias-bg-base': { light: 'rgb(238, 228, 255)', dark: 'rgb(30, 12, 50)' } } }, {})
let bgAfterContentUpdate = ''
for (let i = 0; i < 25; i += 1) {
  bgAfterContentUpdate = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  if (bgAfterContentUpdate !== bgBeforeContentUpdate) break
  await page.waitForTimeout(200)
}
console.log(`body after updating active preset: ${bgBeforeContentUpdate} → ${bgAfterContentUpdate}`)
check(`更新活动预设经桥即时生效（${bgAfterContentUpdate}）`,
  bgAfterContentUpdate === 'rgb(238, 228, 255)' || bgAfterContentUpdate === 'rgb(30, 12, 50)')

// 10c. 恢复原 bg-base（同为活动预设更新，桥再次即时生效）——保证 12 步 revert/重应用断言成立
await updateTool.execute({ id: createdId, merge_tokens: { '--dsw-alias-bg-base': VAPORWAVE_TOKENS['--dsw-alias-bg-base'] } }, {})
let bgRestored = ''
for (let i = 0; i < 25; i += 1) {
  bgRestored = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  if (VAPORWAVE_BGS.includes(bgRestored)) break
  await page.waitForTimeout(200)
}
check(`恢复 bg-base 经桥即时生效（body=${bgRestored}）`, VAPORWAVE_BGS.includes(bgRestored))

// 10d. #64 P0-2：preset_get 读指定预设详情（微调前提——读现值避免整体替换覆盖）
const getResult = await getTool.execute({ id: createdId }, {})
check('preset_get 成功', getResult.ok === true && getResult.preset.id === createdId)
check('preset_get 令牌双值与库一致',
  getResult.preset.tokenCount === Object.keys(VAPORWAVE_TOKENS).length
  && getResult.preset.tokens['--dsw-alias-label-primary']?.light === 'rgb(60, 10, 90)'
  && getResult.preset.tokens['--dsw-alias-bg-base']?.light === 'rgb(246, 236, 255)')
check('preset_get 备份标记正确（多次 update 后 hasBackup=true）', getResult.preset.hasBackup === true)
check('preset_get 素材只返回元数据（无 dataUrl 泄漏）',
  Array.isArray(getResult.preset.assets) && !getResult.preset.assets.some(a => 'dataUrl' in a))
// 内置示例可读
const demoDetail = await getTool.execute({ id: 'default' }, {})
check('preset_get 内置示例可读（builtin=true + 风格标签）', demoDetail.ok === true && demoDetail.preset.builtin === true && demoDetail.preset.style === '海洋清爽')
let threwGet = false
try { await getTool.execute({ id: 'no-such-preset' }, {}) } catch { threwGet = true }
check('preset_get 未知 id 抛错', threwGet)

// 10e. #65 P0-3：asset_list 列壁纸库素材 + widgets 引用素材写入（"给聊天背景换张图"链路）
// 先经 HTTP 上传一张 1x1 PNG 到壁纸库（素材上传本身仍是 UI/HTTP 操作，AI 只读列表）
const pngBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
const uploadRes = await fetch(`${BASE}/ui-presets/assets?name=ai-wallpaper.png&mime=image/png`, {
  method: 'PUT',
  headers: { 'content-type': 'image/png' },
  body: new Uint8Array(pngBytes),
})
const uploadBody = await uploadRes.json()
check('壁纸库上传素材成功', uploadRes.ok && uploadBody.ok === true && typeof uploadBody.id === 'string')
const assetId = uploadBody.id
const assetsBefore = await assetListTool.execute({}, {})
check('asset_list 返回已上传素材（含 id/name/mime/size）',
  assetsBefore.assets.some(a => a.id === assetId && a.name === 'ai-wallpaper.png' && a.mime === 'image/png' && typeof a.size === 'number'))
// update assets 引用声明 + widgets 引用素材 → 落盘 + preset_get 读回（"给聊天背景换张图"链路）
const assetRef = { id: assetId, name: 'ai-wallpaper.png', mime: 'image/png' }
const widgetUpdate = await updateTool.execute({
  id: createdId,
  assets: [assetRef],
  widgets: [{ id: 'chat-background', params: { assetId, opacity: '0.6' } }],
}, {})
check('preset_update assets+widgets 写入成功', widgetUpdate.ok === true)
const widgetsFile = await (await fetch(`${BASE}/ui-presets/presets/${createdId}`)).json()
const savedWidgets = widgetsFile.preset?.widgets ?? []
check('widgets 落盘（chat-background 引用素材）',
  savedWidgets.length === 1 && savedWidgets[0].id === 'chat-background' && savedWidgets[0].params.assetId === assetId && savedWidgets[0].params.opacity === '0.6')
const getWithWidgets = await getTool.execute({ id: createdId }, {})
check('preset_get 读回 assets 声明与 widgets 参数',
  getWithWidgets.preset.assets?.[0]?.id === assetId
  && getWithWidgets.preset.assets?.[0]?.size === pngBytes.length
  && getWithWidgets.preset.widgets?.[0]?.params?.assetId === assetId)
// 部件引用未声明素材 → 教学错误
let threwRef = false
try {
  await updateTool.execute({ id: createdId, widgets: [{ id: 'chat-background', params: { assetId: 'asset-nope' } }] }, {})
} catch { threwRef = true }
check('preset_update 未声明素材引用抛错', threwRef)
// 非法部件 id 抛教学错误
let threwWidget = false
try {
  await updateTool.execute({ id: createdId, assets: [assetRef], widgets: [{ id: 'no-such-widget', params: {} }] }, {})
} catch { threwWidget = true }
check('preset_update 非法部件 id 抛错', threwWidget)
// 清理：删除测试素材（引用随删除清空，无害）
await fetch(`${BASE}/ui-presets/assets/${encodeURIComponent(assetId)}`, { method: 'DELETE' }).catch(() => {})

// 10g. #70：theme 写入——create 带主题（tokens 省略自动填充）/ update 替换与清除 / 非法结构教学错误
const themedId = (await createTool.execute({
  name: '带主题预设',
  tokens: { '--dsw-alias-bg-base': { light: 'rgb(240, 240, 255)', dark: 'rgb(10, 10, 30)' } },
  theme: { id: 'themed-v1', colorScheme: 'dark' },
}, {})).id
const themedDetail = await getTool.execute({ id: themedId }, {})
check('preset_create theme 写入（tokens 自动填充预设令牌）',
  themedDetail.preset.theme?.id === 'themed-v1'
  && themedDetail.preset.theme?.colorScheme === 'dark'
  && themedDetail.preset.theme?.tokens?.['--dsw-alias-bg-base']?.light === 'rgb(240, 240, 255)')
await updateTool.execute({ id: themedId, theme: { id: 'themed-v2', colorScheme: 'light' } }, {})
const themedV2 = await getTool.execute({ id: themedId }, {})
check('preset_update theme 替换生效', themedV2.preset.theme?.id === 'themed-v2' && themedV2.preset.theme?.colorScheme === 'light')
await updateTool.execute({ id: themedId, clear_theme: true }, {})
const themedCleared = await getTool.execute({ id: themedId }, {})
check('preset_update clear_theme 清除主题', themedCleared.preset.theme === null)
let threwTheme = false
try {
  await updateTool.execute({ id: themedId, theme: { id: 'bad-theme', colorScheme: 'sepia' } }, {})
} catch { threwTheme = true }
check('preset_update 非法 theme 抛错', threwTheme)
await deleteTool.execute({ id: themedId }, {})

// 10h. #72 preset_check 质量预检：合法通过 / 低对比 FAIL 警告 / 未知令牌 / 结构错误
const goodCheck = await checkTool.execute({
  tokens: {
    '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' },
    '--dsw-alias-label-primary': { light: '#111111', dark: '#eeeeee' },
    '--dsw-alias-label-secondary': { light: '#333333', dark: '#cccccc' },
    '--dsw-alias-label-tertiary': { light: '#444444', dark: '#bbbbbb' },
  },
}, {})
check('preset_check 高对比通过（ok + 无对比度警告）', goodCheck.ok === true && goodCheck.issues.filter(i => i.message.includes('对比度')).length === 0)
const badCheck = await checkTool.execute({
  tokens: { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' }, '--dsw-alias-label-primary': { light: '#ffffff', dark: '#ffffff' } },
}, {})
check('preset_check 低对比 FAIL 警告（不阻断 ok）', badCheck.ok === true && badCheck.issues.some(i => i.message.includes('FAIL')) && badCheck.summary.contrastIssues >= 1)
const unknownCheck = await checkTool.execute({
  tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' }, '--made-up-token': { light: '#fff', dark: '#000' } },
}, {})
check('preset_check 未知令牌警告', unknownCheck.ok === true && unknownCheck.issues.some(i => i.message.includes('目录外令牌')))
const badStruct = await checkTool.execute({ tokens: { '--dsw-alias-bg-base': '#fff' } }, {})
check('preset_check 结构错误阻断（ok=false）', badStruct.ok === false)
// #73：明暗护栏（light 比 dark 更暗 → warn）
const invertedCheck = await checkTool.execute({
  tokens: { '--dsw-alias-bg-base': { light: '#000000', dark: '#ffffff' }, '--dsw-alias-label-primary': { light: '#ffffff', dark: '#111111' } },
}, {})
check('preset_check 明暗反转提示', invertedCheck.issues.some(i => i.message.includes('明暗反转')))
// 10f. #66 preset_restore_backup：活动预设改值（制造新备份 + body 变化）→ 还原 → 桥即时生效回旧值
const RESTORE_TARGET = { light: 'rgb(220, 210, 240)', dark: 'rgb(15, 5, 25)' }
await updateTool.execute({ id: createdId, merge_tokens: { '--dsw-alias-bg-base': RESTORE_TARGET } }, {})
let bgAfterTweak = ''
for (let i = 0; i < 25; i += 1) {
  bgAfterTweak = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  if (bgAfterTweak !== 'rgb(246, 236, 255)') break
  await page.waitForTimeout(200)
}
check(`改值即时生效（body=${bgAfterTweak}）`, bgAfterTweak === 'rgb(220, 210, 240)' || bgAfterTweak === 'rgb(15, 5, 25)')
const restoreResult = await restoreTool.execute({ id: createdId }, {})
check('preset_restore_backup 成功', restoreResult.ok === true && restoreResult.id === createdId)
let bgAfterRestore = ''
for (let i = 0; i < 25; i += 1) {
  bgAfterRestore = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  if (VAPORWAVE_BGS.includes(bgAfterRestore)) break
  await page.waitForTimeout(200)
}
check(`还原活动预设经桥即时生效（body=${bgAfterRestore}）`, VAPORWAVE_BGS.includes(bgAfterRestore))
// 交换语义：backup.json 现为 10f 版本（bg-base=RESTORE_TARGET）
const backupAfterRestore = JSON.parse(await readFile(join(DSH, '.ui-presets', createdId, 'backup.json'), 'utf8'))
check('交换语义：还原后 backup.json 为还原前版本',
  backupAfterRestore.tokens?.['--dsw-alias-bg-base']?.light === RESTORE_TARGET.light)
// 无备份 → 教学错误
const freshId = (await createTool.execute({ name: '无备份预设', tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } } }, {})).id
let threwNoBackup = false
try { await restoreTool.execute({ id: freshId }, {}) } catch { threwNoBackup = true }
check('preset_restore_backup 无备份抛错', threwNoBackup)
await deleteTool.execute({ id: freshId }, {})
// 损坏备份 → 教学错误（改坏 backup.json 后还原，再修复）
await writeFile(join(DSH, '.ui-presets', createdId, 'backup.json'), 'not json', 'utf8')
let threwCorrupt = false
try { await restoreTool.execute({ id: createdId }, {}) } catch { threwCorrupt = true }
check('preset_restore_backup 损坏备份抛错', threwCorrupt)
// 修复备份为合法结构（保持 e2e-home 状态一致）
await writeFile(join(DSH, '.ui-presets', createdId, 'backup.json'),
  JSON.stringify({ schemaVersion: 1, id: createdId, name: '蒸汽波（AI）', edition: 'standard', tokens: VAPORWAVE_TOKENS }, null, 2), 'utf8').catch(() => {})

// 11. preset_delete：临时预设删除；内置示例拒绝
const tempResult = await createTool.execute({ name: '待删除', tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } } }, {})
await deleteTool.execute({ id: tempResult.id }, {})
const afterDelete = await (await fetch(`${BASE}/ui-presets/presets`)).json()
check('preset_delete 后库中无该预设', !afterDelete.presets.some(p => p.id === tempResult.id))
let threwDelete = false
try { await deleteTool.execute({ id: 'default' }, {}) } catch { threwDelete = true }
check('preset_delete 内置示例拒绝', threwDelete)

// 12. preset_revert：还原默认 → 桥生效恢复出厂 → 重新应用蒸汽波（保留给用户）
await revertTool.execute({}, {})
let revertedBg = ''
for (let i = 0; i < 25; i += 1) {
  revertedBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  if (revertedBg === 'rgb(255, 255, 255)' || revertedBg === 'rgb(21, 21, 23)') break
  await page.waitForTimeout(200)
}
console.log(`body after revert: ${revertedBg}`)
check(`preset_revert 经桥还原默认（body=${revertedBg}）`, revertedBg === 'rgb(255, 255, 255)' || revertedBg === 'rgb(21, 21, 23)')
await applyTool.execute({ id: createdId }, {})
await page.waitForTimeout(1500)
const restoredBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
check(`重新应用蒸汽波恢复（body=${restoredBg}）`, VAPORWAVE_BGS.includes(restoredBg))

console.log(`\n${pass} checks passed`)
console.log(`\n注：蒸汽波预设「${createdId}」保留在库中且为活动预设（桌面端重启或桥生效后即为蒸汽波主题）`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
