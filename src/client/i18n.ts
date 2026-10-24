/**
 * 文案国际化（i18n 第一步，2026-10）。
 *
 * 为什么不用宿主 ctx.locale：那是 DSH 自己的文案命名空间（`settings.*` 键），第三方插件
 * 注册进去只能覆盖「自己的」键，还得跟宿主的键空间对齐；本插件需要的是**自带完整字典**，
 * 所以自己管：`zh` 为源语言（所有键先写 zh），`en` 必须逐键对齐（单测强制键集相等）。
 *
 * 切换范围：按「一屏一屏」推进——先覆盖设置入口 + 预设墙 + 分享面板（用户不进修图版就能
 * 走完的流程），工作室编辑器内部仍是中文（下一轮）。缺键回退顺序：当前语言 → zh → key，
 * 所以任何漏翻都不会出现空白，最差是中文。
 *
 * 纯逻辑、不依赖 React（React hook 在 use-i18n.ts）——node 单测可直接 import。
 */

export type Locale = 'zh' | 'en'
export const SUPPORTED_LOCALES: Locale[] = ['zh', 'en']
export const LOCALE_KEY = 'ui-presets-locale'

/** 源语言字典（键 = 语义 id，值 = 中文）。新增文案先加这里。 */
const ZH = {
  'section.title': '外观预设',
  'common.cancel': '取消',
  'common.confirm': '确定',
  'confirm.aria': '确认',
  'lang.switch': 'EN',
  'lang.switchLabel': 'Switch to English',

  'wall.openStudio': '打开美化工作室 →',
  'wall.reset': '还原默认',
  'wall.surprise': '换一个试试',
  'wall.favOnly': '只看收藏',
  'wall.favOnlyCount': '只看收藏（{count}）',
  'wall.importShare': '导入分享码',
  'wall.loading': '加载预设中…',
  'wall.builtin': '出厂预设',
  'wall.mine': '我的预设',
  'wall.apply': '应用',
  'wall.applied': '已应用',
  'wall.current': '✓ 当前应用',
  'wall.share': '分享',
  'wall.favorite': '收藏',
  'wall.unfavorite': '取消收藏',
  'wall.favEmpty': '还没有收藏——点卡片上的 ☆ 收藏任何预设。',
  'wall.emptyTitle': '还没有自己的预设',
  'wall.emptyBody': '打开工作室创建，或导入预设文件（ZIP）：',
  'wall.importFile': '导入预设文件',
  'wall.importing': '导入中…',
  'wall.imported': '已导入「{name}」',
  'wall.importedAssets': '——{count} 个素材需自行补图（引用与裁剪已保留）',
  'wall.noOther': '没有其他预设可换——先新建或导入一个',
  'wall.cannotRead': '无法读取预设「{id}」，未生成分享码',
  'wall.auditPrefix': '⚠ {warnings}',
  'wall.importFailed': '导入失败',

  'share.received': '收到分享预设「{name}」',
  'share.assetsOmitted': '（{count} 个素材未随链接携带）',
  'share.importToLibrary': '导入到预设库',
  'share.ignore': '忽略',
  'share.invalid': '分享链接无效：{error}',
  'share.gotIt': '知道了',

  'share.exportTitle': '分享「{name}」',
  'share.exportBody': '分享码带：令牌（明暗双值）、CSS 补丁、部件与裁剪参数、封面、原生主题注册。',
  'share.exportOmitted': ' 其中 {count} 个素材的图片本体不随分享走（引用名与裁剪保留，对方补图即可回填；完整交付请用 ZIP）。',
  'share.linkLabel': '链接（同一台机器打开即导入）',
  'share.codeLabel': '分享码（跨机器：对方在「外观预设 → 导入分享码」粘贴）',
  'share.copyLink': '复制链接',
  'share.copyCode': '复制分享码',
  'share.copiedLink': '已复制链接 ✓',
  'share.copiedCode': '已复制分享码 ✓',
  'share.codeChars': '分享码 {count} 字符',
  'share.copyFail': '复制失败：请手动全选复制（输入框已自动选中）',
  'share.close': '关闭',
  'share.importTitle': '导入分享码',
  'share.importBody': '粘贴对方给的链接或分享码。导入只写入预设库（不自动应用），校验不通过会明确报错。',
  'share.importPlaceholder': '#ui-presets-share=… 或直接粘贴分享码',
  'share.cancel': '取消',
  'share.importAction': '导入',

  'knob.title': '快捷调色',
  'knob.summary': ' · {knobs} 个旋钮 / {categories} 类',
  'knob.dual': '明暗分别设置',
  'knob.divergedCount': '{count} 个旋钮的束内有单独调整',
  'knob.intro': '旋钮 = 一次改一组令牌的快捷方式；写入的仍是普通令牌，可在下方「原始令牌」继续精调。',
  'knob.caution': '⚠ 影响面大',
  'knob.diverged': '束内已单独调整',
  'knob.colorAria': '取色',
  'knob.valueAria': '值',
  'knob.sliderAria': '滑块',
  'knob.numberAria': '数值',
  'knob.selectAria': '档位',
  'knob.varPlaceholder': 'var() 引用 → 高级区',

  'css.title': 'CSS 补丁',
  'css.count': ' · {count} 条',
  'css.invalid': '（{count} 条待修）',
  'css.hint': '选择器必须以 [data-*] 锚点开头（如 [data-up-card]），声明块写普通 CSS 但不要花括号。保存与导入都会按同一白名单校验。',
  'css.delete': '删除',
  'css.add': '+ 添加规则',
  'css.errEmpty': '选择器不能为空',
  'css.errSelector': '选择器须以 [data-* 开头，且不得含 { } ;',
  'css.errBraces': '声明块禁止花括号（防样式块逃逸）',
  'css.errLength': '声明块超过 {max} 字符',

  'theme.title': '注册为原生主题',
  'theme.on': ' · 已开启（{scheme}）',
  'theme.off': ' · 未开启',
  'theme.enable': '保存时注册为 DSH 主题',
  'theme.needTokens': '先改至少一个令牌——空主题与默认外观无异，注册没有意义。',
  'theme.scheme': '基色板',
  'theme.schemeDark': 'dark（暗色）',
  'theme.schemeLight': 'light（亮色）',
  'theme.hint': '主题 id：{id}；令牌 = 本预设令牌按所选基色板展平。注册后「设置 → 外观」可直接选到，工作室底部也会出现「切换到此主题」。',

  'rot.title': '轮换（仅本机）',
  'rot.on': '已启用 · {count} 条 · 每 {minutes} 分钟',
  'rot.off': '未启用',
  'rot.hint': '每行一条 http/https 图片链接（2–{max} 条）。配置只存在本机，不随预设/分享走；窗口隐藏时不切换，回到前台补上。',
  'rot.linksAria': '轮换链接',
  'rot.interval': '间隔',
  'rot.intervalAria': '轮换间隔',
  'rot.saveNew': '保存并启用',
  'rot.saveEdit': '保存修改',
  'rot.now': '立即换下一张',
  'rot.disable': '停用',
  'rot.rejected': '已忽略 {count} 行无效链接',
  'rot.needTwo': '至少需要 2 条有效 http/https 链接（当前 {count} 条{extra}）',
  'rot.rejectedExtra': '，丢弃 {count} 行',
  'rot.invalid': '配置无效，未保存',
  'rot.enabled': '已启用：{count} 条链接 / 每 {minutes} 分钟；下一次 tick（≤{seconds} 秒）生效',
  'rot.disabled': '已停用（预设里的当前图片保持不变）',
  'rot.notActive': '此预设当前未应用——先应用它，轮换才会作用到界面',
  'rot.rotated': '已换到下一张',
  'rot.fail': '换图失败：没有可用的活动预设或配置',
  'rot.minutes': '{count} 分钟',
  'rot.hours': '{count} 小时',
  'rot.days': '{count} 天',

  'token.undo': '撤销',
  'token.cover': '封面',
  'token.coverAuto': '自动生成（推荐）',
  'token.coverHint': '选素材按 3:1 裁剪 · 匹配设置页卡片',
  'token.coverAria': '预设封面素材',
  'token.coverPreviewAlt': '封面预览',
  'token.groups': '分组染色',
  'token.groupScheme': '明暗分别编辑（不勾 = 同色同时写亮/暗）',
  'token.groupColor': '组色',
  'token.light': '亮',
  'token.dark': '暗',
  'token.both': '（亮+暗同时）',
  'token.dissolve': '解散',
  'token.members': '成员：',
  'token.groupTokens': ' · {count} 个令牌',
  'token.advanced': '原始令牌',
  'token.advancedCount': ' · {count} 个（支持分组染色与中文描述）',
  'token.search': '搜索令牌…',
  'token.groupMode': '分组模式',
  'token.groupModeOn': '✓ 分组模式（点选令牌）',
  'token.groupNamePlaceholder': '组名（如：操作区）',
  'token.createGroup': '新建组（{count}）',
  'token.expandExpert': '展开全部高级令牌（风险令牌默认隐藏）',
  'token.colToken': '令牌',
  'token.colLight': '亮色',
  'token.colDark': '暗色',
  'token.saveNote': '存',
  'token.notePlaceholder': '输入中文描述（帮助自己识别）…',
  'token.selfNote': '（自填）',
  'token.nameAria': '预设名称',
  'token.groupNameAria': '新组名称',

  'ctrl.activePersistFailed': '活动预设已应用，但持久化失败（重启后可能恢复为之前的预设）',
  'ctrl.broken': '预设「{id}」已损坏：{error}',
  'ctrl.validationFailed': '校验失败',
  'ctrl.notSynced': '保存已落盘，但活动预设未同步（可重启后恢复）',
  'ctrl.exportHttp': '导出 ZIP 失败（HTTP {status}）',
  'ctrl.exportNet': '导出 ZIP 失败（网络错误）',
  'ctrl.missing': '预设「{id}」不存在或无法加载',
  'ctrl.uploadNet': '素材上传失败（网络错误）',
  'ctrl.themeSwitch': '切换主题失败：{error}',

  'share.badPreset': '预设校验失败：{errors}',
  'share.tooLarge': '预设过大（分享码 {chars} 字符，上限 {max}）——素材请改用 ZIP 导出',
  'share.longCode': '分享码较长（{chars} 字符）：聊天软件可能折行，优先用 ZIP 或只分享令牌',
  'share.notCode': '不是分享码：应为 ui-presets-share=… 链接、带该片段的 URL，或纯分享码',
  'share.badBase64': '分享码格式错误（base64url 解析失败，可能被截断）',
  'share.badJson': '分享码内容不是合法 JSON（可能被截断或改动过）',
  'share.badVersion': '分享码版本不支持（仅支持 v{version}）',
  'share.badPayload': '分享预设校验失败：{errors}',

  'studio.savedAs': '已保存「{name}」',
  'studio.savedBuiltinAs': '内置预设已另存为「{name}」',
  'studio.discarded': '已放弃未保存的改动',
  'studio.noSession': '没有正在编辑的预设',
  'studio.presetMissing': '预设「{id}」不存在',
  'studio.createdFromDefault': '已从默认外观创建（当前无活动预设，将使用系统默认样式）',
  'studio.unsavedConfirm': '当前有未保存的改动，放弃并继续？',
  'studio.continueDiscard': '放弃并继续',
  'studio.draftBlocksApply': '当前有未保存的编辑草稿（会遮蔽外观预览）。放弃草稿并应用所选预设？',
  'studio.discardAndApply': '放弃并应用',
  'studio.themeSwitched': '已切换到主题「{id}」',
  'studio.themeRegistered': '主题「{id}」已注册',
  'studio.switchTheme': '切换到此主题',
  'studio.copyOk': '已复制为「{name}」',
  'studio.copyFail': '复制失败',
  'studio.deleted': '已删除 {id}',
  'studio.deletedReverted': '已删除 {id}（外观已还原默认）',
  'studio.deleteFail': '删除失败',
  'studio.deleteConfirm': '删除预设「{id}」？此操作不可恢复。',
  'studio.deleteAction': '删除',
  'studio.backupOk': '已还原备份「{name}」（还原前版本已存入备份，未自动应用）',
  'studio.backupFail': '还原备份失败',
  'studio.backupConfirm': '用备份还原预设「{name}」？当前版本将存入备份（备份仅保留一层，可再还原回去），还原不自动应用。',
  'studio.backupAction': '还原',
  'studio.imported': '已导入 {id}',
  'studio.importFail': '导入失败',
  'studio.exported': '已导出 ZIP 三件套（含封面）',
  'studio.exportMissing': '活动预设不存在，无法导出',
  'studio.exportEmpty': '没有可导出的预设',
  'studio.applyFail': '应用「{id}」失败：{error}',
  'studio.saveFail': '保存失败',
  'studio.broken': '预设不存在或已损坏',
  'studio.builtinTag': ' · 内置',
  'studio.newPresetName': '新预设',
  'studio.fromDefaultName': '从默认外观新建',
  'studio.fromCurrentName': '从当前外观新建',

  'wg.uploadFailMime': '只支持图片素材（image/*）',
  'wg.uploadFailSize': '素材超过上限（≤20MB）',
  'wg.uploadFailCount': '素材数量已达上限 {max} 个',
  'wg.uploadDedup': '该图片素材已存在，已自动复用现有素材（未新增重复文件）',
  'wg.uploadFailed': '上传失败',
  'wg.none': '未选择',
  'wg.urlInvalid': '仅支持 http/https，且不能含引号/括号/空格',
  'wg.darkLook': '深色风格',
  'wg.asset': '素材',
  'wg.darkLink': '深色链接',
  'wg.darkLinkPlaceholder': '留空 = 沿用浅色链接',
  'wg.darkGradient': '深色渐变',
  'wg.opacity': '不透明度',
  'wg.darkClearConfirm': '关闭后将清除已设置的深色壁纸配置，确定？',
  'wg.assetsTitle': '素材与部件',
  'wg.addAsset': '添加素材',
  'wg.collageTitle': '多张小块图片叠加合成一张壁纸',
  'wg.collage': '图层合成壁纸',
  'wg.assetCount': '{count}/{max} 个素材',
  'wg.splitSchemesAria': '按明暗分别配置壁纸',
  'wg.splitSchemes': '按明暗分别配置壁纸（浅色/深色）',
  'wg.lightLook': '浅色风格',
  'wg.quickAria': '用 {name} 作聊天背景',
  'wg.quickTitleCurrent': '当前聊天背景',
  'wg.quickTitle': '一键设为聊天背景',
  'wg.quickDone': '✓ 聊天背景',
  'wg.quickDo': '设为聊天背景',
  'wg.deleteAria': '删除素材 {name}',
  'wg.notActiveHint': '素材已上传但尚未生效——点击素材上的「设为聊天背景」一键启用，或在下方面板勾选部件并选择素材。',
  'wg.enableAria': '启用部件 {name}',
  'wg.footer': '部件 CSS 由引擎生成（安全边界）；素材存于壁纸库（.ui-presets/assets，≤20MB/个），预设仅存引用——zip 导出自动内嵌素材。选素材给部件时按固定比例裁剪（未覆盖区域透明填充）。',
  'wg.clear': '清除',
  'wg.deleteAriaShort': '删除素材',
  'wg.deleteUsedIn': '素材正被 {count} 个其他预设使用（{names}）。删除方式？',
  'wg.cancel': '取消',
  'wg.removeFromPreset': '仅从本预设移除',
  'wg.deletePermanently': '彻底删除',

  'crop.loadFailed': '图片加载失败（素材可能已被删除）',
  'crop.title': '图片裁剪：{name}',
  'crop.aria': '图片裁剪：{name}（{ratio}）',
  'crop.ratioHint': '固定比例 {ratio}（{w}×{h}）· 黑框内即实际应用范围；未覆盖区域透明',
  'crop.loading': '加载图片中…',
  'crop.zoomOut': '缩小',
  'crop.zoom': '缩放',
  'crop.zoomIn': '放大',
  'crop.cancel': '取消',
  'crop.confirm': '确认裁剪',

  'lc.chat': '16:9（聊天背景）',
  'lc.settings': '1:1（设置卡）',
  'lc.sidebar': '1:5（侧栏海报）',
  'lc.title': '图层合成壁纸',
  'lc.ratioAria': '合成比例',
  'lc.canvas': '画布 {w}×{h} · 图层 {count}',
  'lc.canvasAria': '图层合成画布',
  'lc.undo': '撤销',
  'lc.close': '关闭',
  'lc.assetsHint': '素材（点击加入画布）',
  'lc.noAssets': '库中暂无素材——先在素材与部件区上传小块图片',
  'lc.rotate': '旋转 {deg}°',
  'lc.rotateAria': '图层旋转',
  'lc.opacity': '不透明度 {pct}%',
  'lc.opacityAria': '图层不透明度',
  'lc.up': '上移',
  'lc.down': '下移',
  'lc.top': '置顶',
  'lc.bottom': '置底',
  'lc.mirrorH': '水平镜像',
  'lc.mirrorV': '垂直镜像',
  'lc.delete': '删除',
  'lc.upAria': '图层上移',
  'lc.downAria': '图层下移',
  'lc.topAria': '图层置顶',
  'lc.bottomAria': '图层置底',
  'lc.mirrorHAria': '水平镜像',
  'lc.mirrorVAria': '垂直镜像',
  'lc.deleteAria': '删除图层',
  'lc.needLayer': '请先添加至少一个图层',
  'lc.uploadFailed': '合成上传失败',
  'lc.composing': '合成中（动画 {frames} 帧）…',
  'lc.generated': '已生成合成壁纸「{name}」',
  'lc.generatedLayered': '已生成分层合成壁纸「{name}」（静态底 + 原生动图）',
  'lc.downscaled': ' · 已自动降采样至 {w}×{h} 控制体积',
  'lc.failed': '合成失败：{error}',
  'lc.defaultName': '合成壁纸',
  'lc.transparentHint': '透明底——渲染时按部件不透明度向底色淡出',
  'lc.bake': '烘焙为单文件动画',
  'lc.bakeTitle': '把全部图层（含照片）烤进 GIF 每帧——体积大，仅多动图同步/旋转/单文件导出需要',
  'lc.compose': '合成并上传',
  'lc.composingShort': '合成中…',
  'lc.generatedAnim': '已生成合成壁纸「{name}」（动画 {frames} 帧 · {size}MB{extra}）',
  'lc.gifReadFailed': 'GIF 素材读取失败',
  'lc.tooManyFrames': '动图帧数过多（>150）——请使用帧率较低或时长较短的动图',
  'lc.emptyTimeline': '时间轴为空',
  'lc.encodeFailed': '编码失败',
  'lc.baseEncodeFailed': '底图编码失败',

  'studio.back': '‹ 返回',
  'studio.title': '外观预设工作室',
  'studio.active': '活动：{name}',
  'studio.noActive': '无活动预设',
  'studio.exportZip': '导出 ZIP',
  'studio.discard': '放弃',
  'studio.save': '保存',
  'studio.new': '新建',
  'studio.capture': '从当前外观新建',
  'studio.import': '导入',
  'studio.apply': '应用',
  'studio.edit': '编辑',
  'studio.duplicate': '复制',
  'studio.delete': '删除',
  'studio.restoreBackup': '还原备份',
  'studio.empty': '预设库为空——新建或导入一个预设开始。',
  'studio.pickOne': '从左侧选择一个预设「编辑」，或「新建」开始创作。',
  'studio.draft': '● 预览中（未保存）',
  'studio.saved': '已保存',
} as const

export type MessageKey = keyof typeof ZH
export type MessageParams = Record<string, string | number>

/** 英文词典（必须与 ZH 键集完全一致——单测强制）。 */
const EN: Record<MessageKey, string> = {
  'section.title': 'Appearance presets',
  'common.cancel': 'Cancel',
  'common.confirm': 'OK',
  'confirm.aria': 'Confirm',
  'lang.switch': '中文',
  'lang.switchLabel': '切换到中文',

  'wall.openStudio': 'Open skin studio →',
  'wall.reset': 'Reset to default',
  'wall.surprise': 'Surprise me',
  'wall.favOnly': 'Favorites only',
  'wall.favOnlyCount': 'Favorites only ({count})',
  'wall.importShare': 'Import share code',
  'wall.loading': 'Loading presets…',
  'wall.builtin': 'Built-in',
  'wall.mine': 'My preset',
  'wall.apply': 'Apply',
  'wall.applied': 'Applied',
  'wall.current': '✓ Active',
  'wall.share': 'Share',
  'wall.favorite': 'Favorite',
  'wall.unfavorite': 'Unfavorite',
  'wall.favEmpty': 'No favorites yet — tap ☆ on any card.',
  'wall.emptyTitle': 'No presets of your own yet',
  'wall.emptyBody': 'Create one in the studio, or import a preset file (ZIP):',
  'wall.importFile': 'Import preset file',
  'wall.importing': 'Importing…',
  'wall.imported': 'Imported “{name}”',
  'wall.importedAssets': ' — {count} asset(s) need re-uploading (references and crops kept)',
  'wall.noOther': 'No other preset to switch to — create or import one first',
  'wall.cannotRead': 'Cannot read preset “{id}”, no share code generated',
  'wall.auditPrefix': '⚠ {warnings}',
  'wall.importFailed': 'Import failed',

  'share.received': 'Received shared preset “{name}”',
  'share.assetsOmitted': ' ({count} asset(s) not included in the link)',
  'share.importToLibrary': 'Import to library',
  'share.ignore': 'Ignore',
  'share.invalid': 'Invalid share link: {error}',
  'share.gotIt': 'Got it',

  'share.exportTitle': 'Share “{name}”',
  'share.exportBody': 'A share code carries: tokens (light & dark), CSS patches, widget & crop params, cover, and native theme registration.',
  'share.exportOmitted': ' Image data for {count} asset(s) is not included (references and crops are kept; use ZIP for full delivery).',
  'share.linkLabel': 'Link (opens and imports on this machine)',
  'share.codeLabel': 'Share code (cross-machine: paste it under “Appearance presets → Import share code”)',
  'share.copyLink': 'Copy link',
  'share.copyCode': 'Copy code',
  'share.copiedLink': 'Link copied ✓',
  'share.copiedCode': 'Code copied ✓',
  'share.codeChars': 'Share code: {count} chars',
  'share.copyFail': 'Copy failed: select and copy manually (the field is already selected)',
  'share.close': 'Close',
  'share.importTitle': 'Import share code',
  'share.importBody': 'Paste the link or code you received. Importing only adds it to your library (it is not applied automatically); invalid payloads are rejected with a reason.',
  'share.importPlaceholder': '#ui-presets-share=… or the raw code',
  'share.cancel': 'Cancel',
  'share.importAction': 'Import',

  'knob.title': 'Quick colors',
  'knob.summary': ' · {knobs} knobs / {categories} groups',
  'knob.dual': 'Edit light/dark separately',
  'knob.divergedCount': '{count} knob(s) have per-token overrides',
  'knob.intro': 'A knob writes a group of tokens at once — they stay plain tokens you can fine-tune under “Advanced tokens”.',
  'knob.caution': '⚠ wide impact',
  'knob.diverged': 'per-token override',
  'knob.colorAria': 'color',
  'knob.valueAria': 'value',
  'knob.sliderAria': 'slider',
  'knob.numberAria': 'number',
  'knob.selectAria': 'option',
  'knob.varPlaceholder': 'var() reference → advanced',

  'css.title': 'CSS patches',
  'css.count': ' · {count} rule(s)',
  'css.invalid': ' ({count} to fix)',
  'css.hint': 'Selectors must start with a [data-*] anchor (e.g. [data-up-card]); write plain declarations without braces. Save and import enforce the same whitelist.',
  'css.delete': 'Delete',
  'css.add': '+ Add rule',
  'css.errEmpty': 'Selector cannot be empty',
  'css.errSelector': 'Selector must start with [data-* and contain no { } ;',
  'css.errBraces': 'No braces allowed in declarations',
  'css.errLength': 'Declarations exceed {max} chars',

  'theme.title': 'Register as native theme',
  'theme.on': ' · on ({scheme})',
  'theme.off': ' · off',
  'theme.enable': 'Register as a DSH theme on save',
  'theme.needTokens': 'Change at least one token first — an empty theme is the default look.',
  'theme.scheme': 'Base scheme',
  'theme.schemeDark': 'dark',
  'theme.schemeLight': 'light',
  'theme.hint': 'Theme id: {id}; tokens are this preset flattened to the chosen scheme. Once registered it shows up under Settings → Appearance and the studio footer offers “Switch to this theme”.',

  'rot.title': 'Rotation (this device)',
  'rot.on': 'On · {count} links · every {minutes} min',
  'rot.off': 'Off',
  'rot.hint': 'One http/https image URL per line (2–{max}). Stored on this device only — never in the preset or share code. Pauses while the window is hidden and catches up when you return.',
  'rot.linksAria': 'rotation links',
  'rot.interval': 'Interval',
  'rot.intervalAria': 'rotation interval',
  'rot.saveNew': 'Save & enable',
  'rot.saveEdit': 'Save changes',
  'rot.now': 'Next now',
  'rot.disable': 'Disable',
  'rot.rejected': 'Ignored {count} invalid line(s)',
  'rot.needTwo': 'Need at least 2 valid http/https links (currently {count}{extra})',
  'rot.rejectedExtra': ', {count} dropped',
  'rot.invalid': 'Invalid config, not saved',
  'rot.enabled': 'Enabled: {count} links, every {minutes} min; applies on the next tick (≤{seconds}s)',
  'rot.disabled': 'Disabled (the preset keeps its current image)',
  'rot.notActive': 'This preset is not active — apply it first so rotation can affect the UI',
  'rot.rotated': 'Switched to the next image',
  'rot.fail': 'Failed: no active preset or config',
  'rot.minutes': '{count} min',
  'rot.hours': '{count} h',
  'rot.days': '{count} d',

  'token.undo': 'Undo',
  'token.cover': 'Cover',
  'token.coverAuto': 'Auto (recommended)',
  'token.coverHint': 'Crop an asset to 3:1 · matches the settings card',
  'token.coverAria': 'cover asset',
  'token.coverPreviewAlt': 'cover preview',
  'token.groups': 'Group tinting',
  'token.groupScheme': 'Edit light/dark separately (off = write both)',
  'token.groupColor': 'Group color',
  'token.light': 'Light',
  'token.dark': 'Dark',
  'token.both': '(both schemes)',
  'token.dissolve': 'Dissolve',
  'token.members': 'Members: ',
  'token.groupTokens': ' · {count} tokens',
  'token.advanced': 'Advanced tokens',
  'token.advancedCount': ' · {count} (group tinting & notes)',
  'token.search': 'Search tokens…',
  'token.groupMode': 'Group mode',
  'token.groupModeOn': '✓ Group mode (pick tokens)',
  'token.groupNamePlaceholder': 'Group name (e.g. actions)',
  'token.createGroup': 'Create group ({count})',
  'token.expandExpert': 'Show all advanced tokens (risky ones hidden)',
  'token.colToken': 'Token',
  'token.colLight': 'Light',
  'token.colDark': 'Dark',
  'token.saveNote': 'Save',
  'token.notePlaceholder': 'Add a note for your own reference…',
  'token.selfNote': '(yours)',
  'token.nameAria': 'preset name',
  'token.groupNameAria': 'group name',

  'ctrl.activePersistFailed': 'Preset applied, but persisting the active id failed (an older preset may return after restart)',
  'ctrl.broken': 'Preset “{id}” is broken: {error}',
  'ctrl.validationFailed': 'validation failed',
  'ctrl.notSynced': 'Saved to disk, but the active preset was not synced (restart may recover)',
  'ctrl.exportHttp': 'ZIP export failed (HTTP {status})',
  'ctrl.exportNet': 'ZIP export failed (network error)',
  'ctrl.missing': 'Preset “{id}” does not exist or cannot be loaded',
  'ctrl.uploadNet': 'Asset upload failed (network error)',
  'ctrl.themeSwitch': 'Theme switch failed: {error}',

  'share.badPreset': 'Preset validation failed: {errors}',
  'share.tooLarge': 'Preset too large (share code {chars} chars, limit {max}) — use ZIP export for assets',
  'share.longCode': 'Long share code ({chars} chars): chat apps may wrap it — prefer ZIP or share tokens only',
  'share.notCode': 'Not a share code: expected a ui-presets-share=… link, a URL containing it, or the raw code',
  'share.badBase64': 'Malformed share code (base64url decode failed — it may have been truncated)',
  'share.badJson': 'Share code payload is not valid JSON (truncated or edited)',
  'share.badVersion': 'Unsupported share code version (only v{version})',
  'share.badPayload': 'Shared preset validation failed: {errors}',

  'studio.savedAs': 'Saved “{name}”',
  'studio.savedBuiltinAs': 'Built-in saved as “{name}”',
  'studio.discarded': 'Unsaved changes discarded',
  'studio.noSession': 'No preset is being edited',
  'studio.presetMissing': 'Preset “{id}” does not exist',
  'studio.createdFromDefault': 'Created from the default look (no active preset, system styling will apply)',
  'studio.unsavedConfirm': 'You have unsaved changes. Discard and continue?',
  'studio.continueDiscard': 'Discard and continue',
  'studio.draftBlocksApply': 'You have an unsaved draft (it overrides the applied look). Discard it and apply the selected preset?',
  'studio.discardAndApply': 'Discard and apply',
  'studio.themeSwitched': 'Switched to theme “{id}”',
  'studio.themeRegistered': 'Theme “{id}” registered',
  'studio.switchTheme': 'Switch to this theme',
  'studio.copyOk': 'Duplicated as “{name}”',
  'studio.copyFail': 'Duplicate failed',
  'studio.deleted': 'Deleted {id}',
  'studio.deletedReverted': 'Deleted {id} (appearance reset to default)',
  'studio.deleteFail': 'Delete failed',
  'studio.deleteConfirm': 'Delete preset “{id}”? This cannot be undone.',
  'studio.deleteAction': 'Delete',
  'studio.backupOk': 'Restored backup “{name}” (the previous version was saved to backups; not applied automatically)',
  'studio.backupFail': 'Restore failed',
  'studio.backupConfirm': 'Restore preset “{name}” from backup? The current version is saved to backups (one slot, swappable) and the restore is not applied automatically.',
  'studio.backupAction': 'Restore',
  'studio.imported': 'Imported {id}',
  'studio.importFail': 'Import failed',
  'studio.exported': 'Exported ZIP (preset + cover + manifest)',
  'studio.exportMissing': 'No active preset to export',
  'studio.exportEmpty': 'Nothing to export',
  'studio.applyFail': 'Failed to apply “{id}”: {error}',
  'studio.saveFail': 'Save failed',
  'studio.broken': 'preset missing or broken',
  'studio.builtinTag': ' · Built-in',
  'studio.newPresetName': 'New preset',
  'studio.fromDefaultName': 'New from default look',
  'studio.fromCurrentName': 'New from current look',

  'wg.uploadFailMime': 'Only image assets are supported (image/*)',
  'wg.uploadFailSize': 'Asset exceeds the limit (≤20MB)',
  'wg.uploadFailCount': 'Asset limit reached ({max})',
  'wg.uploadDedup': 'This image already exists — reusing the existing asset (no duplicate file).',
  'wg.uploadFailed': 'Upload failed',
  'wg.none': 'None',
  'wg.urlInvalid': 'Only http/https, no quotes/brackets/spaces',
  'wg.darkLook': 'Dark look',
  'wg.asset': 'Asset',
  'wg.darkLink': 'Dark link',
  'wg.darkLinkPlaceholder': 'Empty = reuse the light link',
  'wg.darkGradient': 'Dark gradient',
  'wg.opacity': 'Opacity',
  'wg.darkClearConfirm': 'Turning this off clears the dark wallpaper settings. Continue?',
  'wg.assetsTitle': 'Assets & widgets',
  'wg.addAsset': 'Add asset',
  'wg.collageTitle': 'Collage several images into one wallpaper',
  'wg.collage': 'Layer collage',
  'wg.assetCount': '{count}/{max} assets',
  'wg.splitSchemesAria': 'Configure light and dark wallpapers separately',
  'wg.splitSchemes': 'Separate light/dark wallpapers',
  'wg.lightLook': 'Light look',
  'wg.quickAria': 'Use {name} as chat background',
  'wg.quickTitleCurrent': 'Current chat background',
  'wg.quickTitle': 'Set as chat background',
  'wg.quickDone': '✓ Chat background',
  'wg.quickDo': 'Set as chat background',
  'wg.deleteAria': 'Delete asset {name}',
  'wg.notActiveHint': 'Assets uploaded but not applied yet — use “Set as chat background” on a thumbnail, or enable a widget below and pick an asset.',
  'wg.enableAria': 'Enable widget {name}',
  'wg.footer': 'Widget CSS is generated by the engine (safety boundary); assets live in the wallpaper library (.ui-presets/assets, ≤20MB each) and presets only store references — ZIP export embeds them. Picking an asset crops it to the widget\'s fixed ratio (uncovered area stays transparent).',
  'wg.clear': 'Clear',
  'wg.deleteAriaShort': 'Delete asset',
  'wg.deleteUsedIn': 'This asset is used by {count} other preset(s) ({names}). How should it be deleted?',
  'wg.cancel': 'Cancel',
  'wg.removeFromPreset': 'Remove from this preset',
  'wg.deletePermanently': 'Delete permanently',

  'crop.loadFailed': 'Image failed to load (the asset may have been deleted)',
  'crop.title': 'Crop image: {name}',
  'crop.aria': 'Crop image: {name} ({ratio})',
  'crop.ratioHint': 'Fixed ratio {ratio} ({w}×{h}) — the dark frame is what gets applied; uncovered area stays transparent',
  'crop.loading': 'Loading image…',
  'crop.zoomOut': 'Zoom out',
  'crop.zoom': 'Zoom',
  'crop.zoomIn': 'Zoom in',
  'crop.cancel': 'Cancel',
  'crop.confirm': 'Crop',

  'lc.chat': '16:9 (chat)',
  'lc.settings': '1:1 (settings)',
  'lc.sidebar': '1:5 (sidebar)',
  'lc.title': 'Layer collage',
  'lc.ratioAria': 'canvas ratio',
  'lc.canvas': 'Canvas {w}×{h} · {count} layer(s)',
  'lc.canvasAria': 'layer canvas',
  'lc.undo': 'Undo',
  'lc.close': 'Close',
  'lc.assetsHint': 'Assets (click to add)',
  'lc.noAssets': 'No assets yet — upload images in the Assets & widgets section first',
  'lc.rotate': 'Rotate {deg}°',
  'lc.rotateAria': 'layer rotation',
  'lc.opacity': 'Opacity {pct}%',
  'lc.opacityAria': 'layer opacity',
  'lc.up': 'Up',
  'lc.down': 'Down',
  'lc.top': 'Top',
  'lc.bottom': 'Bottom',
  'lc.mirrorH': 'Mirror H',
  'lc.mirrorV': 'Mirror V',
  'lc.delete': 'Delete',
  'lc.upAria': 'move layer up',
  'lc.downAria': 'move layer down',
  'lc.topAria': 'move layer to top',
  'lc.bottomAria': 'move layer to bottom',
  'lc.mirrorHAria': 'mirror horizontally',
  'lc.mirrorVAria': 'mirror vertically',
  'lc.deleteAria': 'delete layer',
  'lc.needLayer': 'Add at least one layer first',
  'lc.uploadFailed': 'Collage upload failed',
  'lc.composing': 'Composing ({frames} frames)…',
  'lc.generated': 'Collage created: “{name}”',
  'lc.generatedLayered': 'Layered collage created: “{name}” (static base + native GIF)',
  'lc.downscaled': ' · downscaled to {w}×{h} to control size',
  'lc.failed': 'Collage failed: {error}',
  'lc.defaultName': 'Collage',
  'lc.transparentHint': 'Transparent background — fades toward the widget base color at render time',
  'lc.bake': 'Bake into one animation',
  'lc.bakeTitle': 'Bake every layer (including photos) into each GIF frame — large files; only for multi-GIF sync, rotation, or single-file export',
  'lc.compose': 'Compose & upload',
  'lc.composingShort': 'Composing…',
  'lc.generatedAnim': 'Collage created: “{name}” ({frames} frames · {size}MB{extra})',
  'lc.gifReadFailed': 'Failed to read the GIF asset',
  'lc.tooManyFrames': 'Too many frames (>150) — use a GIF with lower frame rate or shorter duration',
  'lc.emptyTimeline': 'Timeline is empty',
  'lc.encodeFailed': 'Encoding failed',
  'lc.baseEncodeFailed': 'Failed to encode the base image',

  'studio.back': '‹ Back',
  'studio.title': 'Preset studio',
  'studio.active': 'Active: {name}',
  'studio.noActive': 'No active preset',
  'studio.exportZip': 'Export ZIP',
  'studio.discard': 'Discard',
  'studio.save': 'Save',
  'studio.new': 'New',
  'studio.capture': 'New from current look',
  'studio.import': 'Import',
  'studio.apply': 'Apply',
  'studio.edit': 'Edit',
  'studio.duplicate': 'Duplicate',
  'studio.delete': 'Delete',
  'studio.restoreBackup': 'Restore backup',
  'studio.empty': 'Library is empty — create or import a preset to start.',
  'studio.pickOne': 'Pick a preset on the left to edit, or start with “New”.',
  'studio.draft': '● Previewing (unsaved)',
  'studio.saved': 'Saved',
}

const DICTS: Record<Locale, Record<MessageKey, string>> = { zh: ZH, en: EN }

/** 纯函数：存储值 + 浏览器语言 → 语言（供单测与启动检测共用）。 */
export function resolveLocale(stored: string | null, navigatorLanguage: string | null): Locale {
  if (stored === 'zh' || stored === 'en') return stored
  const lang = (navigatorLanguage ?? '').toLowerCase()
  if (lang.startsWith('zh')) return 'zh'
  // 明确非中文才切英文；检测不到（隐私模式/无 navigator）按中文优先
  if (lang === '') return 'zh'
  return 'en'
}

let cached: Locale | null = null
const listeners = new Set<() => void>()

function detectLocale(): Locale {
  let stored: string | null = null
  try {
    stored = localStorage.getItem(LOCALE_KEY)
  } catch { /* 存储不可用 → 按语言检测 */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language : null
  return resolveLocale(stored, nav)
}

export function getLocale(): Locale {
  if (cached === null) cached = detectLocale()
  return cached
}

export function setLocale(locale: Locale): void {
  cached = locale
  try {
    localStorage.setItem(LOCALE_KEY, locale)
  } catch { /* 存储不可用：本次会话内生效 */ }
  for (const listener of listeners) listener()
}

export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/** 模板插值：`{name}` → 参数；缺失参数保留原样（便于发现漏传）。 */
export function formatMessage(template: string, params?: MessageParams): string {
  if (params === undefined) return template
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => {
    const value = params[key]
    return value === undefined ? whole : String(value)
  })
}

/** 取文案（当前语言 → zh → key），带插值。 */
export function t(key: MessageKey, params?: MessageParams): string {
  const locale = getLocale()
  const dict = DICTS[locale]
  const text = dict[key] ?? ZH[key] ?? key
  return formatMessage(text, params)
}

/** 测试/诊断用：导出字典快照（浅拷贝，避免外部改写模块常量）。 */
export function dictionaries(): Record<Locale, Record<string, string>> {
  return { zh: { ...ZH }, en: { ...EN } }
}

// ---- 旋钮 / 类别文案（core/knobs.ts 的 name/description 是中文源，这里给英文映射） ----
// 单独成表而不是塞进主字典：旋钮名是「数据」不是「界面句子」，主字典保持短小可审。

const KNOB_EN: Record<string, { name: string; description: string }> = {
  'spatial-bg': { name: 'Background', description: 'The overall canvas — the single most visible surface' },
  'spatial-layer': { name: 'Raised surfaces', description: 'Cards, inputs and popovers (two-step ramp derived automatically)' },
  'spatial-sidebar': { name: 'Sidebar', description: 'Left navigation background' },
  'spatial-bubble': { name: 'Chat bubbles', description: 'Message bubble fill in the transcript' },
  'spatial-input': { name: 'Composer', description: 'Bottom input card fill' },
  'spatial-menu': { name: 'Menus & overlays', description: 'Menus, tooltips, selectors and masks (auto-layered)' },
  'border-level': { name: 'Border strength', description: 'Primary card/section border (fine variants stay in advanced tokens)' },
  'accent-brand': { name: 'Brand color', description: 'Brand, primary button and business state in one go' },
  'accent-hover': { name: 'Hover color', description: 'Primary button hover feedback' },
  'button-family': { name: 'Button family', description: 'Primary / info / business buttons plus hover (auto shaded)' },
  'text-primary': { name: 'Primary text', description: 'Body and headings' },
  'text-secondary': { name: 'Secondary text', description: 'Descriptions and hints' },
  'text-tertiary': { name: 'Tertiary text', description: 'Muted and placeholder text' },
  'font-family': { name: 'Font family', description: 'Global typeface' },
  'state-error': { name: 'Error', description: 'Errors and failure hints' },
  'state-warn': { name: 'Warning', description: 'Warnings and unsaved hints' },
  'state-success': { name: 'Success', description: 'Success messages' },
  'interactive-hover': { name: 'Hover feedback', description: 'Hover fill for interactive elements' },
  'radius-scale': { name: 'Corner radius', description: 'Global radius — buttons, menus and popovers move together' },
  'corner-shape': { name: 'Corner shape', description: 'Clean round versus squircle (superellipse)' },
  'mask-blur': { name: 'Mask blur', description: 'Backdrop blur on modal masks' },
  'motion-speed': { name: 'Motion speed', description: 'Global transition speed (hover / expand / popover)' },
  'shadow-level': { name: 'Shadow level', description: 'Card elevation shadows (all three levels scale)' },
  'settings-card': { name: 'Settings card', description: 'Settings panel card fill and stroke' },
  'markdown-surfaces': { name: 'Code & quote surfaces', description: 'Code block, inline code, quote and tag fills (auto-layered)' },
  'overlay-surfaces': { name: 'Toast & tooltip', description: 'Toast and tooltip fills' },
  'layout-width': { name: 'Content width', description: 'Max width of the transcript' },
}

const CATEGORY_EN: Record<string, { name: string; description: string }> = {
  spatial: { name: 'Layout surfaces', description: 'Region fills and overlays' },
  layers: { name: 'Background layers', description: 'Borders and dividers' },
  accent: { name: 'Accent', description: 'Brand and primary actions' },
  text: { name: 'Typography', description: 'Text colors and typeface' },
  feedback: { name: 'Feedback', description: 'States and hover' },
  layout: { name: 'Layout', description: 'Width, radius, motion and shadows' },
}

/** 旋钮名 / 说明：en 命中返回英文，否则返回 null 让调用方回退到 core 的中文源。 */
export function knobLabel(id: string, field: 'name' | 'description'): string | null {
  if (getLocale() !== 'en') return null
  const entry = KNOB_EN[id]
  return entry !== undefined ? entry[field] : null
}

/** 类别名 / 说明：同上。 */
export function categoryLabel(id: string, field: 'name' | 'description'): string | null {
  if (getLocale() !== 'en') return null
  const entry = CATEGORY_EN[id]
  return entry !== undefined ? entry[field] : null
}

// ---- 部件（widget）与参数名（core/widgets.ts 的中文数据） ----

const WIDGET_EN: Record<string, { name: string; description: string }> = {
  'chat-background': { name: 'Chat background', description: 'Wallpaper behind the transcript' },
  'settings-background': { name: 'Settings background', description: 'Wallpaper inside the settings dialog' },
  'sidebar-poster': { name: 'Sidebar poster', description: 'Poster background of the left sidebar' },
}

const WIDGET_PARAM_EN: Record<string, string> = {
  source: 'Image',
  assetId: 'Asset',
  imageUrl: 'Link',
  gradient: 'Gradient',
  opacity: 'Opacity',
}

export function widgetLabel(id: string, field: 'name' | 'description'): string | null {
  if (getLocale() !== 'en') return null
  const entry = WIDGET_EN[id]
  return entry !== undefined ? entry[field] : null
}

export function widgetParamLabel(key: string): string | null {
  if (getLocale() !== 'en') return null
  return WIDGET_PARAM_EN[key] ?? null
}

/** 测试用：英文部件/参数名映射（覆盖度检查）。 */
export function englishWidgetLabels(): { widgets: Record<string, { name: string; description: string }>; params: Record<string, string> } {
  return { widgets: { ...WIDGET_EN }, params: { ...WIDGET_PARAM_EN } }
}

/** 测试用：英文旋钮/类别映射（检查覆盖度）。 */
export function englishKnobLabels(): { knobs: Record<string, { name: string; description: string }>; categories: Record<string, { name: string; description: string }> } {
  return { knobs: { ...KNOB_EN }, categories: { ...CATEGORY_EN } }
}
