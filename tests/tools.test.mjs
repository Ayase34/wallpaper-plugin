// M2-3 AI 工具纯 fs 助手单测：列表/创建/活动 revision/检查/安全 id。
// 用 os.tmpdir 隔离（不污染真实数据目录）；.mjs 纯 JS。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  safePresetId,
  readActiveState,
  writeActiveState,
  listLibraryPresets,
  readLibraryPreset,
  resolvablePresetId,
  createPresetFile,
  inspectState,
  updatePresetFile,
  deletePresetFile,
  getPresetDetail,
  listWallpaperAssets,
  restoreBackupFile,
  writeFileAtomic,
} from '../src/node/tools.ts'

function makeEnv() {
  const root = mkdtempSync(join(tmpdir(), 'up-tools-'))
  const env = {
    presetsDir: join(root, 'presets'),
    assetsDir: join(root, 'assets'),
    dataDir: join(root, 'data'),
    activeFile: join(root, 'data', 'active.json'),
    configFile: join(root, 'data', 'config.json'),
  }
  return { env, root }
}

test('safePresetId：白名单与拒绝', () => {
  assert.equal(safePresetId('demo-ocean'), true)
  assert.equal(safePresetId('preset-abc123'), true)
  assert.equal(safePresetId('../etc'), false)
  assert.equal(safePresetId('UPPER'), false)
  assert.equal(safePresetId(''), false)
})

test('createPresetFile：校验失败抛教学错误；成功落盘可回读', () => {
  const { env, root } = makeEnv()
  try {
    assert.throws(() => createPresetFile(env, { name: '坏', tokens: { '--dsw-alias-bg-base': '#fff' } }), /双值/)
    const id = createPresetFile(env, { name: 'AI 创建', tokens: { '--dsw-alias-bg-base': { light: '#ffffff', dark: '#000000' } } })
    assert.ok(safePresetId(id))
    const preset = readLibraryPreset(env, id)
    assert.ok(preset !== null)
    assert.equal(preset.name, 'AI 创建')
    assert.equal(preset.tokens['--dsw-alias-bg-base'].dark, '#000000')
    const list = listLibraryPresets(env)
    assert.equal(list.length, 1)
    assert.equal(list[0].id, id)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('active revision：单调 +1，损坏文件降级', () => {
  const { env, root } = makeEnv()
  try {
    assert.deepEqual(readActiveState(env), { activePresetId: null, revision: 0 })
    writeActiveState(env, 'default')
    assert.deepEqual(readActiveState(env), { activePresetId: 'default', revision: 1 })
    writeActiveState(env, null)
    assert.deepEqual(readActiveState(env), { activePresetId: null, revision: 2 })
    // 损坏文件 → 降级（不抛）
    writeFileSync(env.activeFile, '{oops', 'utf8')
    assert.deepEqual(readActiveState(env), { activePresetId: null, revision: 0 })
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('resolvablePresetId：demo 与库内可解析，其余拒绝', () => {
  const { env, root } = makeEnv()
  try {
    assert.equal(resolvablePresetId(env, 'default'), true)
    assert.equal(resolvablePresetId(env, 'nope'), false)
    createPresetFile(env, { name: 'X', tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } } })
    const list = listLibraryPresets(env)
    assert.equal(resolvablePresetId(env, list[0].id), true)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('inspectState：活动/档位/令牌清单', () => {
  const { env, root } = makeEnv()
  try {
    writeActiveState(env, 'default')
    const state = inspectState(env)
    assert.equal(state.activePresetId, 'default')
    assert.equal(state.activeName, '默认')
    assert.equal(state.tokenCount, 15)
    assert.ok(state.appliedTokenNames.includes('--dsw-alias-bg-base'))
    assert.equal(state.tier, 'standard')
    assert.equal(state.revision, 1)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('demo 与库合并列表（preset_list 数据源）', () => {
  const { env, root } = makeEnv()
  try {
    createPresetFile(env, { name: '库预设', tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } } })
    const library = listLibraryPresets(env)
    assert.equal(library.length, 1)
    assert.equal(library[0].name, '库预设')
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('updatePresetFile：合并令牌/名称 + 备份旧版；未知 id 抛错', () => {
  const { env, root } = makeEnv()
  try {
    const id = createPresetFile(env, { name: '原始', tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } } })
    updatePresetFile(env, id, {
      name: '改名',
      tokens: { '--dsw-alias-bg-base': { light: '#eee', dark: '#111' }, '--dsw-alias-brand-primary': { light: '#f00', dark: '#0f0' } },
    })
    const updated = readLibraryPreset(env, id)
    assert.equal(updated.name, '改名')
    assert.equal(updated.tokens['--dsw-alias-bg-base'].dark, '#111')
    assert.equal(updated.tokens['--dsw-alias-brand-primary'].light, '#f00')
    // 备份存在且为旧版
    const backup = JSON.parse(readFileSync(join(env.presetsDir, id, 'backup.json'), 'utf8'))
    assert.equal(backup.name, '原始')
    // 非法更新（裸字符串令牌）→ 抛教学错误
    assert.throws(() => updatePresetFile(env, id, { tokens: { '--x': '#fff' } }), /双值/)
    assert.throws(() => updatePresetFile(env, 'nope', { name: 'x' }), /不存在/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('#63 updatePresetFile mergeTokens：增量合并只更新提供的键，其余保持 + 备份旧版', () => {
  const { env, root } = makeEnv()
  try {
    const id = createPresetFile(env, {
      name: '微调目标',
      tokens: {
        '--dsw-alias-bg-base': { light: '#fff', dark: '#000' },
        '--dsw-alias-label-primary': { light: '#111', dark: '#eee' },
      },
    })
    updatePresetFile(env, id, { mergeTokens: { '--dsw-alias-bg-base': { light: '#abc', dark: '#123' } } })
    const updated = readLibraryPreset(env, id)
    // 提供的键更新、未提供的键原样保留（整体替换语义不会保留——增量合并的判别点）
    assert.equal(updated.tokens['--dsw-alias-bg-base'].light, '#abc')
    assert.equal(updated.tokens['--dsw-alias-bg-base'].dark, '#123')
    assert.equal(updated.tokens['--dsw-alias-label-primary'].light, '#111')
    assert.equal(updated.tokens['--dsw-alias-label-primary'].dark, '#eee')
    assert.equal(Object.keys(updated.tokens).length, 2)
    // 空对象 = no-op（不删不改）
    updatePresetFile(env, id, { mergeTokens: {} })
    assert.equal(Object.keys(readLibraryPreset(env, id).tokens).length, 2)
    // 备份旧版（merge 前版本）
    const backup = JSON.parse(readFileSync(join(env.presetsDir, id, 'backup.json'), 'utf8'))
    assert.equal(backup.tokens['--dsw-alias-bg-base'].light, '#abc')
    // 非法 mergeTokens（非对象）→ 教学错误
    assert.throws(() => updatePresetFile(env, id, { mergeTokens: 'not-an-object' }), /merge_tokens/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('deletePresetFile：移除目录；内置示例拒绝', () => {
  const { env, root } = makeEnv()
  try {
    const id = createPresetFile(env, { name: '待删', tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } } })
    deletePresetFile(env, id)
    assert.equal(readLibraryPreset(env, id), null)
    assert.throws(() => deletePresetFile(env, 'default'), /内置示例/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('#64 getPresetDetail：库预设详情（tokens/css/edition/备份标记）；demo 可读；未知/非法 id 抛错', () => {
  const { env, root } = makeEnv()
  try {
    const id = createPresetFile(env, {
      name: '详情目标',
      tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' }, '--dsw-alias-brand-primary': { light: '#f00', dark: '#0f0' } },
      css: [{ selector: '[data-chat-flow]', rules: 'background: red' }],
    })
    const detail = getPresetDetail(env, id)
    assert.equal(detail.name, '详情目标')
    assert.equal(detail.builtin, false)
    assert.equal(detail.tokenCount, 2)
    assert.equal(detail.tokens['--dsw-alias-bg-base'].light, '#fff')
    assert.equal(detail.tokens['--dsw-alias-brand-primary'].dark, '#0f0')
    assert.equal(detail.css.length, 1)
    assert.equal(detail.css[0].selector, '[data-chat-flow]')
    assert.equal(detail.theme, null)
    assert.deepEqual(detail.assets, [])
    assert.deepEqual(detail.widgets, [])
    assert.equal(detail.cover, null)
    assert.equal(detail.hasBackup, false)
    // 更新后备份标记翻转（preset_update 写 backup.json）
    updatePresetFile(env, id, { mergeTokens: { '--dsw-alias-bg-base': { light: '#eee', dark: '#111' } } })
    assert.equal(getPresetDetail(env, id).hasBackup, true)
    // demo 可读
    const demo = getPresetDetail(env, 'default')
    assert.equal(demo.builtin, true)
    assert.equal(demo.tokenCount, 15)
    assert.equal(demo.hasBackup, false)
    // 未知 / 非法 id
    assert.throws(() => getPresetDetail(env, 'no-such'), /不存在/)
    assert.throws(() => getPresetDetail(env, '../etc'), /非法 id/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('#64 getPresetDetail：素材只返回元数据（dataUrl 不泄漏）；theme/widgets/cover 完整', () => {
  const { env, root } = makeEnv()
  try {
    const id = 'preset-full'
    const bigDataUrl = 'data:image/png;base64,' + 'A'.repeat(5000)
    mkdirSync(join(env.presetsDir, id), { recursive: true })
    writeFileAtomic(join(env.presetsDir, id, 'preset.json'), JSON.stringify({
      schemaVersion: 1,
      id,
      name: '完整预设',
      edition: 'standard',
      tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } },
      theme: { id: `${id}-theme`, colorScheme: 'dark', tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } } },
      assets: [{ id: 'asset-1', name: '壁纸.png', mime: 'image/png', dataUrl: bigDataUrl }],
      widgets: [{ id: 'chat-background', params: { assetId: 'asset-1', opacity: '0.5', cropX: '100', cropY: '-50', cropW: '800', cropH: '450' } }],
      cover: { assetId: 'asset-1', cropX: '10', cropY: '20', cropW: '900', cropH: '300' },
    }, null, 2))
    const detail = getPresetDetail(env, id)
    // 素材元数据裁剪：只有 id/name/mime/size，绝无 dataUrl
    assert.equal(detail.assets.length, 1)
    assert.equal(detail.assets[0].id, 'asset-1')
    assert.equal(detail.assets[0].mime, 'image/png')
    assert.equal(detail.assets[0].size, bigDataUrl.length)
    assert.equal('dataUrl' in detail.assets[0], false, 'dataUrl 不得泄漏给 LLM')
    assert.equal('size' in detail.assets[0], true)
    // widgets/theme/cover 完整
    assert.equal(detail.widgets[0].id, 'chat-background')
    assert.equal(detail.widgets[0].params.assetId, 'asset-1')
    assert.equal(detail.widgets[0].params.cropW, '800')
    assert.equal(detail.theme.id, `${id}-theme`)
    assert.equal(detail.theme.colorScheme, 'dark')
    // #70：theme.tokens 随详情返回（AI 微调主题的前提）
    assert.equal(detail.theme.tokens['--dsw-alias-bg-base'].light, '#fff')
    assert.equal(detail.cover.assetId, 'asset-1')
    assert.equal(detail.cover.cropW, '900')
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('#65 listWallpaperAssets：读 meta sidecar；损坏跳过；空目录空列表', () => {
  const { env, root } = makeEnv()
  try {
    // 空目录
    assert.deepEqual(listWallpaperAssets(env), [])
    // 正常素材 + 损坏 meta + 无 meta 的裸文件 + 非 safePresetId 文件名
    mkdirSync(env.assetsDir, { recursive: true })
    writeFileSync(join(env.assetsDir, 'asset-abc.json'), JSON.stringify({ id: 'asset-abc', name: '壁纸A.png', mime: 'image/png', size: 1234 }))
    writeFileSync(join(env.assetsDir, 'asset-bad.json'), 'not json')
    writeFileSync(join(env.assetsDir, 'asset-orphan'), 'raw bytes')
    writeFileSync(join(env.assetsDir, 'UPPER.json'), JSON.stringify({ id: 'UPPER', name: 'x', mime: 'image/png', size: 1 }))
    const assets = listWallpaperAssets(env)
    assert.equal(assets.length, 1)
    assert.equal(assets[0].id, 'asset-abc')
    assert.equal(assets[0].name, '壁纸A.png')
    assert.equal(assets[0].size, 1234)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('#65 create/update 支持 assets 声明 + widgets：合法写入可读回；非法部件 id 抛教学错误', () => {
  const { env, root } = makeEnv()
  try {
    const assetRef = { id: 'asset-abc', name: '壁纸A.png', mime: 'image/png' }
    const widgets = [{ id: 'chat-background', params: { assetId: 'asset-abc', opacity: '0.5' } }]
    const id = createPresetFile(env, {
      name: '带部件',
      tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } },
      assets: [assetRef],
      widgets,
    })
    const created = readLibraryPreset(env, id)
    assert.equal(created.assets.length, 1)
    assert.equal(created.assets[0].id, 'asset-abc')
    assert.equal(created.widgets.length, 1)
    assert.equal(created.widgets[0].id, 'chat-background')
    assert.equal(created.widgets[0].params.assetId, 'asset-abc')
    // update 整体替换 assets + widgets
    updatePresetFile(env, id, {
      assets: [{ id: 'asset-xyz', name: '壁纸B.png', mime: 'image/png' }],
      widgets: [{ id: 'sidebar-poster', params: { assetId: 'asset-xyz', opacity: '1' } }],
    })
    const updated = readLibraryPreset(env, id)
    assert.equal(updated.assets[0].id, 'asset-xyz')
    assert.equal(updated.widgets[0].id, 'sidebar-poster')
    assert.equal(updated.widgets[0].params.assetId, 'asset-xyz')
    // 部件引用未声明的素材 → 教学错误（assets 声明缺失）
    assert.throws(() => createPresetFile(env, {
      name: '坏引用', tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } },
      widgets: [{ id: 'chat-background', params: { assetId: 'asset-nope' } }],
    }), /引用/)
    // 非法部件 id → 教学错误
    assert.throws(() => createPresetFile(env, {
      name: '坏部件', tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } },
      assets: [assetRef],
      widgets: [{ id: 'no-such-widget', params: {} }],
    }), /widgets/)
    assert.throws(() => updatePresetFile(env, id, { widgets: [{ id: 'no-such-widget', params: {} }] }), /widgets/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('#66 restoreBackupFile：交换式还原可来回；无备份/损坏备份/非法 id 抛错', () => {
  const { env, root } = makeEnv()
  try {
    const id = createPresetFile(env, { name: '版本一', tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } } })
    // 无备份 → 抛错
    assert.throws(() => restoreBackupFile(env, id), /没有可用备份/)
    // update 产生备份（backup = 版本一）
    updatePresetFile(env, id, { name: '版本二', tokens: { '--dsw-alias-bg-base': { light: '#eee', dark: '#111' } } })
    // 还原：preset.json 回版本一，backup.json 变版本二（交换）
    const restored = restoreBackupFile(env, id)
    assert.equal(restored.name, '版本一')
    const preset = readLibraryPreset(env, id)
    assert.equal(preset.name, '版本一')
    assert.equal(preset.tokens['--dsw-alias-bg-base'].light, '#fff')
    const backup = JSON.parse(readFileSync(join(env.presetsDir, id, 'backup.json'), 'utf8'))
    assert.equal(backup.name, '版本二', '还原后当前版本成为新备份（交换语义）')
    // 再还原 → 回版本二（可来回切换）
    const restoredAgain = restoreBackupFile(env, id)
    assert.equal(restoredAgain.name, '版本二')
    assert.equal(readLibraryPreset(env, id).name, '版本二')
    // 备份损坏（坏 JSON）→ 教学错误
    writeFileSync(join(env.presetsDir, id, 'backup.json'), 'not json')
    assert.throws(() => restoreBackupFile(env, id), /备份损坏/)
    // 备份校验失败（裸字符串令牌）→ 教学错误
    writeFileSync(join(env.presetsDir, id, 'backup.json'), JSON.stringify({
      schemaVersion: 1, id, name: '坏备份', edition: 'standard', tokens: { '--x': '#fff' },
    }))
    assert.throws(() => restoreBackupFile(env, id), /备份损坏/)
    // 非法 id
    assert.throws(() => restoreBackupFile(env, '../etc'), /非法 id/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('#68 updatePresetFile：extra 平铺不嵌套（修复 extra.extra 逐次加深）', () => {
  const { env, root } = makeEnv()
  try {
    const id = createPresetFile(env, { name: 'X', tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#000' } } })
    // 手工加入未知字段（低版本读高版本场景——第一次校验收集进 extra）
    const file = join(env.presetsDir, id, 'preset.json')
    const raw = JSON.parse(readFileSync(file, 'utf8'))
    raw.futureField = { hello: 1 }
    writeFileSync(file, JSON.stringify(raw, null, 2))
    // 连续三次 update：每次都应平铺重建 extra，不得嵌套加深
    for (let i = 0; i < 3; i += 1) updatePresetFile(env, id, { name: `v${i}` })
    const updated = readLibraryPreset(env, id)
    assert.equal(updated.name, 'v2')
    assert.equal(updated.extra?.futureField?.hello, 1, '未知字段保留在 extra 层')
    assert.equal('extra' in (updated.extra ?? {}), false, 'extra 内不得再嵌套 extra（旧实现会逐次加深）')
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('#70 create/update theme：tokens 省略自动填充预设令牌；替换/清除；非法结构教学错误', () => {
  const { env, root } = makeEnv()
  try {
    const tokens = {
      '--dsw-alias-bg-base': { light: '#fff', dark: '#000' },
      '--dsw-alias-brand-primary': { light: '#f00', dark: '#0f0' },
    }
    // create：tokens 省略 → 自动取预设全部令牌
    const id = createPresetFile(env, { name: '带主题', tokens, theme: { id: 'theme-1', colorScheme: 'dark' } })
    const created = readLibraryPreset(env, id)
    assert.equal(created.theme.id, 'theme-1')
    assert.equal(created.theme.colorScheme, 'dark')
    assert.deepEqual(created.theme.tokens, tokens, 'tokens 省略时自动填充预设全部令牌')
    // create：显式 tokens 优先
    const id2 = createPresetFile(env, {
      name: '显式主题令牌', tokens,
      theme: { id: 'explicit-theme', colorScheme: 'light', tokens: { '--dsw-alias-bg-base': { light: '#111', dark: '#222' } } },
    })
    assert.equal(readLibraryPreset(env, id2).theme.tokens['--dsw-alias-bg-base'].light, '#111')
    // update：替换 theme（tokens 省略 → 当前预设令牌）
    updatePresetFile(env, id, { theme: { id: 'theme-v2', colorScheme: 'light' } })
    const replaced = readLibraryPreset(env, id)
    assert.equal(replaced.theme.id, 'theme-v2')
    assert.equal(replaced.theme.colorScheme, 'light')
    assert.deepEqual(replaced.theme.tokens, tokens)
    // update：清除 theme（null）
    updatePresetFile(env, id, { theme: null })
    assert.equal(readLibraryPreset(env, id).theme, undefined)
    // 非法结构 → 教学错误（缺 id / colorScheme 枚举外 / 非法 theme 令牌）
    assert.throws(() => createPresetFile(env, { name: '坏主题', tokens, theme: { colorScheme: 'dark' } }), /theme/)
    assert.throws(() => createPresetFile(env, { name: '坏主题2', tokens, theme: { id: 'x-theme', colorScheme: 'sepia' } }), /theme/)
    assert.throws(() => updatePresetFile(env, id, { theme: { id: 'x-theme', colorScheme: 'dark', tokens: { '--x': '#fff' } } }), /theme/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
