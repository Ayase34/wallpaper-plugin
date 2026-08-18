// 素材与部件 e2e（#49 更新）：素材上传 → 3 部件启用/选素材/不透明度滑杆 → 实时注入验证 → 保存落盘。
// #49（用户拍板）：全局背景图/顶部强调色条/品牌标 已移除——仅聊天背景图/设置卡背景图/侧栏海报，
// 各带「不透明度」滑杆（默认 100%）。
import { launchBrowser, dismissBetaNotice } from './e2e-util.mjs'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3180'
// 1×1 透明 PNG
const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
// #106：深色变体用不同字节的图——内容去重后同内容上传只会得到同一个 id，
// 测试要断言明暗 URL 切换，必须让两个素材内容不同（去重语义下相同图片复用同一素材是正确行为）
const PNG_BASE64_DARK = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

await fetch(`${BASE}/ui-presets/active`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ activePresetId: null }),
}).catch(() => {})
const existingList = await (await fetch(`${BASE}/ui-presets/presets`)).json()
for (const item of existingList.presets ?? []) {
  await fetch(`${BASE}/ui-presets/presets/${encodeURIComponent(item.id)}`, { method: 'DELETE' }).catch(() => {})
}
// #106：清空素材库——内容去重后跨脚本残留的同内容素材会让本脚本的上传去重到旧条目（旧名字/旧 id），
// 断言（指定名字上传、裁剪流）失去确定性。先清预设再清素材（避免删除素材时剥离引用）。
const libAssets = await (await fetch(`${BASE}/ui-presets/assets`)).json()
for (const asset of libAssets.assets ?? []) {
  await fetch(`${BASE}/ui-presets/assets/${encodeURIComponent(asset.id)}`, { method: 'DELETE' }).catch(() => {})
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

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
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
await studio.locator('[data-up-advanced-head]').click()
await page.waitForTimeout(200)

// 0. #49：已移除的三个部件入口不再出现
check('已移除入口：无「全局背景图」', await studio.getByLabel('启用部件 全局背景图').count() === 0)
check('已移除入口：无「顶部强调色条」', await studio.getByLabel('启用部件 顶部强调色条').count() === 0)
check('已移除入口：无「品牌标」', await studio.getByLabel('启用部件 品牌标').count() === 0)
check('保留入口：聊天背景图/设置卡背景图（新名）/侧栏海报 各一个',
  await studio.getByLabel('启用部件 聊天背景图').count() === 1
  && await studio.getByLabel('启用部件 设置卡背景图').count() === 1
  && await studio.getByLabel('启用部件 侧栏海报').count() === 1)

// 1. 素材上传（快照库 id：新 pic.png = 快照后出现的那个——按 value 选中，避免与库中同名素材混淆）
const assetsBefore = (await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? []
const assetInput = studio.locator('[data-up-widget-editor] input[type="file"]')
await assetInput.waitFor({ state: 'attached', timeout: 10000 })
await assetInput.setInputFiles({
  name: 'pic.png',
  mimeType: 'image/png',
  buffer: Buffer.from(PNG_BASE64, 'base64'),
})
await studio.locator('[data-up-asset]').waitFor({ timeout: 10000 })
check('素材上传出现芯片（pic.png）', (await studio.locator('[data-up-asset]').innerText()).includes('pic.png'))
const assetsAfter = (await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? []
const uploadedId = assetsAfter.find(a => !assetsBefore.some(b => b.id === a.id))?.id ?? ''

// 2. 启用聊天背景图/设置卡背景图/侧栏海报 + 选素材（触发固定比例裁剪）+ 拖不透明度滑杆
// 裁剪对话框辅助：断言标题（部件名 + 固定比例）→ 缩放滑杆拖到 150% → 确认
const confirmCrop = async (widgetName, ratioLabel) => {
  const crop = page.locator('[data-up-crop]')
  await crop.waitFor({ timeout: 10000 })
  const text = await crop.innerText()
  check(`裁剪对话框出现（${widgetName} ${ratioLabel}）`, text.includes(`图片裁剪：${widgetName}`) && text.includes(`固定比例 ${ratioLabel}`))
  check('裁剪说明含应用范围与透明提示', text.includes('实际应用范围') && text.includes('透明'))
  check('裁剪框外为黑底（应用范围外涂黑）', await page.evaluate(() => {
    const canvas = document.querySelector('[data-up-crop-canvas]')
    if (canvas === null) return false
    const wrap = canvas.parentElement
    return wrap !== null && getComputedStyle(wrap).backgroundColor === 'rgb(0, 0, 0)'
  }))
  const slider = crop.getByLabel('缩放')
  await slider.evaluate(el => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(el, '150')
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await page.waitForTimeout(300)
  check('缩放读数 150%', await crop.locator('[data-up-crop-zoom]').innerText() === '150%')
  await crop.getByRole('button', { name: '确认裁剪' }).click()
  await crop.waitFor({ state: 'detached', timeout: 15000 })
  await page.waitForTimeout(600) // 裁剪副本上传 + 状态更新
}

await studio.getByLabel('启用部件 聊天背景图').click()
const assetSelect = studio.getByLabel('chat-background assetId')
await assetSelect.waitFor({ timeout: 10000 })
await assetSelect.selectOption(uploadedId)
await confirmCrop('聊天背景图', '16:9')
await studio.getByLabel('启用部件 设置卡背景图').click()
const settingsAssetSelect = studio.getByLabel('settings-background assetId')
await settingsAssetSelect.waitFor({ timeout: 10000 })
await settingsAssetSelect.selectOption(uploadedId)
await confirmCrop('设置卡背景图', '1:1')
await studio.getByLabel('启用部件 侧栏海报').click()
const sidebarAssetSelect = studio.getByLabel('sidebar-poster assetId')
await sidebarAssetSelect.waitFor({ timeout: 10000 })
await sidebarAssetSelect.selectOption(uploadedId)
await confirmCrop('侧栏海报', '1:5')
// #53：裁剪不落库——本次会话不产生新素材（库中原有素材/旧版裁剪副本保持原样）
const cropsBeforeCount = assetsBefore.filter(a => a.name.startsWith('裁剪-')).length
const picBeforeCount = assetsBefore.filter(a => a.name === 'pic.png').length
const assetsMid = (await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? []
check(`#53 裁剪不产生新素材（裁剪副本数 ${cropsBeforeCount}→${assetsMid.filter(a => a.name.startsWith('裁剪-')).length}，pic.png ${picBeforeCount}→${assetsMid.filter(a => a.name === 'pic.png').length}）`,
  assetsMid.filter(a => a.name.startsWith('裁剪-')).length === cropsBeforeCount
  && assetsMid.filter(a => a.name === 'pic.png').length === picBeforeCount + 1)
check('裁剪芯片不出现（无 裁剪-pic.png）',
  (await studio.locator('[data-up-asset]').allTextContents()).every(t => !t.includes('裁剪-')))
// 不透明度滑杆：拖到指定值——必须用原生 value setter（直接 el.value= 会被 React 值跟踪器
// 还原为受控值，onChange 不触发）；随后冒泡 input + change 事件。
const setRange = async (label, value) => {
  const slider = studio.getByLabel(label)
  await slider.waitFor({ timeout: 10000 })
  await slider.evaluate((el, v) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(el, v)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}
await setRange('chat-background opacity', '0.4')
await setRange('settings-background opacity', '0.55')
await setRange('sidebar-poster opacity', '0.3')
await page.waitForTimeout(400)

// 3. 实时注入验证（草稿即生效；裁剪部件 = 静态 CSS 只含裁剪标记，样式由 controller 内联注入）
const patchStyle = await page.evaluate(() => document.querySelector('style[data-up-patch]')?.textContent ?? '')
check('裁剪标记已注入（聊天/设置/侧栏 3 个 up-crop 标记 + 壁纸库 url）',
  patchStyle.includes('/* up-crop:chat-background:0.4:150:-270:1620:1620:url("')
  && patchStyle.includes('up-crop:settings-background:0.55:')
  && patchStyle.includes('up-crop:sidebar-poster:0.3:')
  && patchStyle.includes('url("/ui-presets/assets/asset-'))
check('已移除部件无残留 CSS（无 body::after / 无 logo-badge 规则）', !patchStyle.includes('body::after')
  && !patchStyle.includes('[data-up-logo-badge]'))

// 3a. 真实渲染验证（#52b：controller 按元素实际尺寸内联注入）——计算值与纯函数一致：
// 聊天背景 150% 缩放：1×1 图 fit=1080 → 绘制矩形 1620×1620 @ (150, -270)；s = max(elW/1920, elH/1080)
const chatStyle = await page.evaluate(() => {
  const el = document.querySelector('[data-conversation-scroll]')
  if (el === null) return null
  const cs = getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  const s = Math.max(rect.width / 1920, rect.height / 1080)
  return {
    bgImage: cs.backgroundImage,
    bgSize: cs.backgroundSize,
    bgPos: cs.backgroundPosition,
    s,
  }
})
const near = (a, b) => Math.abs(a - b) < 0.5
const sizeLayer = (value) => {
  const parts = (value ?? '').split(', ')[1]?.split(' ') ?? []
  return { w: parseFloat(parts[0]), h: parseFloat(parts[1]) }
}
const posLayer = (value) => {
  const parts = (value ?? '').split(', ')[1]?.split(' ') ?? []
  return { x: parseFloat(parts[0]), y: parseFloat(parts[1]) }
}
check(`聊天背景真实生效（bgImage=${chatStyle?.bgImage.slice(0, 60)}…）`,
  chatStyle !== null && chatStyle.bgImage.includes('/ui-presets/assets/asset-'))
const chatSize = sizeLayer(chatStyle?.bgSize)
check(`聊天背景缩放定位精确（size=${chatStyle?.bgSize}）`,
  chatStyle !== null && near(chatSize.w, 1620 * chatStyle.s) && near(chatSize.h, 1620 * chatStyle.s))
const chatPos = posLayer(chatStyle?.bgPos)
check(`聊天背景平移精确（pos=${chatStyle?.bgPos}）`,
  chatStyle !== null && near(chatPos.x, 150 * chatStyle.s) && near(chatPos.y, -270 * chatStyle.s))
// #77（用户 bug：创建新会话后壁纸消失且切回不恢复——会话切换重挂载滚动容器）：
// 裁剪内联样式丢失后必须自愈恢复（DOM 观察 + rAF 去抖重同步）
const remounted = await page.evaluate(() => {
  const el = document.querySelector('[data-conversation-scroll]')
  if (el === null) return false
  const fresh = document.createElement(el.tagName)
  for (const a of Array.from(el.attributes)) fresh.setAttribute(a.name, a.value)
  while (el.firstChild) fresh.appendChild(el.firstChild)
  el.replaceWith(fresh)
  return true
})
check('已模拟会话切换重挂载（[data-conversation-scroll] 换新元素）', remounted)
await page.waitForTimeout(800)
const healed = await page.evaluate(() => {
  const el = document.querySelector('[data-conversation-scroll]')
  return el !== null ? getComputedStyle(el).backgroundImage : ''
})
check(`重挂载后裁剪壁纸自愈恢复（bgImage=${healed.slice(0, 50)}…）`,
  healed.includes('/ui-presets/assets/asset-'))
// 设置卡背景（1:1 帧；wash 层 45%）
const dialogStyle = await page.evaluate(() => {
  const el = document.querySelector('[role="dialog"]:not([data-up-crop])')
  if (el === null) return null
  const cs = getComputedStyle(el)
  return { bgImage: cs.backgroundImage, bgSize: cs.backgroundSize }
})
check(`设置卡背景真实生效（dialog bgSize=${dialogStyle?.bgSize}）`, dialogStyle !== null
  && dialogStyle.bgImage.includes('/ui-presets/assets/asset-') && dialogStyle.bgImage.includes('linear-gradient')
  && /px/.test(dialogStyle.bgSize))
// 侧栏海报（1:5 帧；wash 70%）——#92：contain 映射（实际侧栏元素 ≈280×900 宽于 1:5 帧，
// cover 会把帧底部裁出可视区）——断言图片整体在元素内（不铺满、位置可见）
const sidebarStyle = await page.evaluate(() => {
  const el = document.querySelector('[data-slot="sidebar"] > div:first-child')
  if (el === null) return null
  const cs = getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  const sizeW = parseFloat((cs.backgroundSize.split(', ')[1] ?? cs.backgroundSize).split(' ')[0])
  const posY = parseFloat((cs.backgroundPosition.split(', ')[1] ?? cs.backgroundPosition).split(' ')[1])
  return { bgImage: cs.backgroundImage, w: Math.round(rect.width), h: Math.round(rect.height), sizeW, posY }
})
check(`侧栏海报真实生效（w=${sidebarStyle?.w} bgImage=${sidebarStyle?.bgImage.slice(0, 60)}…）`,
  sidebarStyle !== null && sidebarStyle.w > 0 && sidebarStyle.bgImage.includes('/ui-presets/assets/asset-'))
check(`#92 侧栏海报 contain 可见（sizeW=${sidebarStyle?.sizeW} 不铺满、posY=${sidebarStyle?.posY} 在元素内）`,
  sidebarStyle !== null && Number.isFinite(sidebarStyle.sizeW) && sidebarStyle.sizeW < sidebarStyle.w
  && Number.isFinite(sidebarStyle.posY) && sidebarStyle.posY > 0 && sidebarStyle.posY < sidebarStyle.h)
// #99 回归（用户 bug：侧栏折叠后海报异常缩小）：折叠成窄栏（≈1:14 窄于 1:5 帧）时
// 自适应切 cover——按高度铺满、水平裁出竖条（"海报折叠"），不再 contain 缩成小图。
// 期望值按标记里的裁剪矩形 + 元素实测尺寸计算（cover: s=max(w/384,h/1920)；
// contain: s=min(w/384,h/1920) + 居中偏移 offX/offY——展开态 #92 行为不变）。
const freshPatch = await page.evaluate(() => document.querySelector('style[data-up-patch]')?.textContent ?? '')
const posterMarker = /up-crop:sidebar-poster:0\.3:(-?[\d.]+):(-?[\d.]+):(-?[\d.]+):(-?[\d.]+):/.exec(freshPatch)
check('#99 侧栏海报裁剪标记可取', posterMarker !== null)
const [cX, cY, cW, cH] = [posterMarker?.[1], posterMarker?.[2], posterMarker?.[3], posterMarker?.[4]].map(Number)
const sidebarState = () => page.evaluate(() => {
  const el = document.querySelector('[data-slot="sidebar"] > div:first-child')
  if (el === null) return null
  const cs = getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  const size = (cs.backgroundSize.split(', ')[1] ?? cs.backgroundSize).split(' ')
  const pos = (cs.backgroundPosition.split(', ')[1] ?? cs.backgroundPosition).split(' ')
  return {
    w: rect.width, h: rect.height,
    sizeW: parseFloat(size[0] ?? '0'), sizeH: parseFloat(size[1] ?? '0'),
    posX: parseFloat(pos[0] ?? '0'), posY: parseFloat(pos[1] ?? '0'),
  }
})
// 折叠：元素宽压到 64px → ResizeObserver 重算 → 自适应 cover
await page.evaluate(() => {
  const el = document.querySelector('[data-slot="sidebar"] > div:first-child')
  if (el !== null) el.style.width = '64px'
})
await page.waitForFunction(([cW, cH]) => {
  const el = document.querySelector('[data-slot="sidebar"] > div:first-child')
  if (el === null) return false
  const cs = getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  if (Math.abs(rect.width - 64) > 2) return false
  const s = Math.max(64 / 384, rect.height / 1920)
  const sizeH = parseFloat((cs.backgroundSize.split(', ')[1] ?? cs.backgroundSize).split(' ')[1] ?? '0')
  return Math.abs(sizeH - cH * s) < 2 // cover 缩放已应用
}, [cW, cH], { timeout: 15000 }).catch(() => {})
const collapsed = await sidebarState()
const sCover = Math.max(64 / 384, collapsed.h / 1920)
const sShrink = Math.min(64 / 384, collapsed.h / 1920)
check(`#99 折叠后海报按 cover 铺高（sizeH=${collapsed.sizeH} ≈ ${(cH * sCover).toFixed(1)}；旧 bug 缩小值=${(cH * sShrink).toFixed(1)}）`,
  collapsed !== null && near(collapsed.sizeH, cH * sCover) && collapsed.sizeH > cH * sShrink + 1)
// 展开还原 → contain 恢复（#92 行为：整幅可见、居中偏移）
await page.evaluate(() => {
  const el = document.querySelector('[data-slot="sidebar"] > div:first-child')
  if (el !== null) el.style.width = ''
})
await page.waitForFunction(([cX, cW, cH]) => {
  const el = document.querySelector('[data-slot="sidebar"] > div:first-child')
  if (el === null) return false
  const cs = getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  const s = Math.min(rect.width / 384, rect.height / 1920)
  const offX = (rect.width - 384 * s) / 2
  const posX = parseFloat((cs.backgroundPosition.split(', ')[1] ?? cs.backgroundPosition).split(' ')[0] ?? '0')
  return Math.abs(posX - (offX + cX * s)) < 2 // contain 居中偏移已恢复
}, [cX, cW, cH], { timeout: 15000 }).catch(() => {})
const restored = await sidebarState()
const sRestore = Math.min(restored.w / 384, restored.h / 1920)
check(`#99 展开还原 contain 恢复（sizeH=${restored.sizeH} ≈ ${(cH * sRestore).toFixed(1)}、posY=${restored.posY} 在元素内）`,
  restored !== null && near(restored.sizeH, cH * sRestore) && restored.posY > -0.5 && restored.posY < restored.h)
// #91 回归（用户实测：预览里摆好的小图应用后被 cover 铺满全屏——opacity=100% 无 wash 层时
// background-size 曾输出 `cover, px…` 双值而背景只有 1 层 → CSS 按层取第一个值，图片被 cover 吞掉；
// 只有 opacity<1 带 wash 层时双值才碰巧正确）：
await setRange('chat-background opacity', '1')
await page.waitForTimeout(400)
const chatNoWash = await page.evaluate(() => {
  const el = document.querySelector('[data-conversation-scroll]')
  if (el === null) return null
  const cs = getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  const s = Math.max(rect.width / 1920, rect.height / 1080)
  return { bgImage: cs.backgroundImage, bgSize: cs.backgroundSize, bgPos: cs.backgroundPosition, s }
})
const parseFirstPx = (value) => parseFloat((value ?? '').split(' ')[0])
check(`#91 opacity=1 裁剪仍精确（bgSize=${chatNoWash?.bgSize}——无 cover、无 wash）`,
  chatNoWash !== null
  && !chatNoWash.bgImage.includes('linear-gradient')
  && !chatNoWash.bgSize.includes('cover')
  && near(parseFirstPx(chatNoWash.bgSize), 1620 * chatNoWash.s)
  && near(parseFirstPx(chatNoWash.bgPos), 150 * chatNoWash.s))
await setRange('chat-background opacity', '0.4') // 还原（后续落盘断言依赖 0.4）
await page.waitForTimeout(300)
// 裁剪对话框自身不吃设置卡壁纸（#52b 排除选择器）
const cropDialogBg = await page.evaluate(() => {
  const el = document.querySelector('[data-up-crop]')
  if (el === null) return null
  return getComputedStyle(el).backgroundImage
})
check('裁剪对话框自身不挂壁纸', cropDialogBg === null || cropDialogBg === 'none')
const assetUrl = chatStyle?.bgImage.match(/url\("([^"]+)"\)/)?.[1] ?? ''
const fetchUrl = assetUrl.startsWith('http') ? assetUrl : `${BASE}${assetUrl}`
const assetRes = await fetch(fetchUrl)
check(`壁纸文件可加载（${assetUrl.slice(0, 60)}… → ${assetRes.status}）`, assetRes.ok && assetRes.headers.get('content-type')?.startsWith('image/'))

// 3b. #55 按明暗分别配置壁纸：开关 → 深色区块 → 深色裁剪 → 明暗切换即时生效
// 先上传第二个素材（深色专用，便于断言 URL 切换）
await assetInput.setInputFiles({
  name: 'pic-dark.png',
  mimeType: 'image/png',
  buffer: Buffer.from(PNG_BASE64_DARK, 'base64'),
})
await page.waitForTimeout(500)
const assetsAfterDark = (await (await fetch(`${BASE}/ui-presets/assets`)).json()).assets ?? []
const darkUploadedId = assetsAfterDark.find(a => !assetsAfter.some(b => b.id === a.id))?.id ?? ''
check('深色素材已上传（pic-dark.png）', darkUploadedId !== '')
await studio.getByLabel('按明暗分别配置壁纸').check()
await page.waitForTimeout(200)
check('深色风格区块出现（3 个部件各一块）', await studio.locator('[data-up-widget-dark]').count() === 3)
// 深色聊天背景：选素材 → 16:9 裁剪 → 确认（写 assetIdDark/cropXDark…）
const darkSelect = studio.getByLabel('chat-background assetIdDark')
await darkSelect.waitFor({ timeout: 10000 })
await darkSelect.selectOption(darkUploadedId)
await confirmCrop('聊天背景图', '16:9')
const patchStyle2 = await page.evaluate(() => document.querySelector('style[data-up-patch]')?.textContent ?? '')
check('深色裁剪标记已注入（up-crop-dark:chat-background）',
  patchStyle2.includes('up-crop-dark:chat-background:1:') && patchStyle2.includes(`url("/ui-presets/assets/${darkUploadedId}")`))
// 明暗切换：body[data-ds-dark-theme] 属性驱动（MutationObserver 即时重算内联样式）
const chatBgUrl = async () => {
  const bg = await page.evaluate(() => {
    const el = document.querySelector('[data-conversation-scroll]')
    return el === null ? '' : getComputedStyle(el).backgroundImage
  })
  return bg.match(/url\("([^"]+)"\)/)?.[1] ?? ''
}
const lightUrl = await chatBgUrl()
check('浅色风格 → 聊天背景用浅色素材', lightUrl.includes(uploadedId))
await page.evaluate(() => document.body.setAttribute('data-ds-dark-theme', ''))
await page.waitForTimeout(600)
const darkUrl = await chatBgUrl()
check('深色风格 → 聊天背景即时切换为深色素材', darkUrl.includes(darkUploadedId))
await page.evaluate(() => document.body.removeAttribute('data-ds-dark-theme'))
await page.waitForTimeout(600)
const lightUrlBack = await chatBgUrl()
check('切回浅色 → 恢复浅色素材', lightUrlBack.includes(uploadedId))
// 深色不透明度（独立于浅色）
await setRange('chat-background opacityDark', '0.6')

// 3b. 壁纸库路由：列表含上传的素材（库中可能有用户已有素材——按名查找）；超 20MB 拒绝
const assetList = await (await fetch(`${BASE}/ui-presets/assets`)).json()
check(`壁纸库列表含 pic.png（共 ${assetList.assets?.length ?? 0} 个）`, Array.isArray(assetList.assets)
  && assetList.assets.some(a => a.name === 'pic.png'))
const oversize = await fetch(`${BASE}/ui-presets/assets?name=big.png&mime=image/png`, {
  method: 'PUT',
  headers: { 'content-type': 'image/png' },
  body: Buffer.alloc(20 * 1024 * 1024 + 1, 1),
})
check('超 20MB 素材被拒（413）', oversize.status === 413)

// 4. 保存 → 落盘：assets 仅原图引用（#53 不落裁剪副本）+ widgets 带裁剪参数（含 #55 深色）
await studio.getByRole('button', { name: '保存' }).click()
await studio.locator('[data-up-studio-status]').getByText(/已另存为「默认（自定义）」/).waitFor({ timeout: 15000 })
const saved = await (await fetch(`${BASE}/ui-presets/presets/default-custom`)).json()
const preset = saved.preset ?? {}
check('落盘仅含原图引用（pic.png + pic-dark.png，无内嵌 dataUrl、无裁剪副本）',
  Array.isArray(preset.assets) && preset.assets.length === 2
  && preset.assets.every(a => /^asset-[a-z0-9]+$/.test(a.id) && a.dataUrl === undefined)
  && preset.assets.some(a => a.name === 'pic.png') && preset.assets.some(a => a.name === 'pic-dark.png'))
const w = (id) => (preset.widgets ?? []).find(x => x.id === id)
check('落盘含三个部件，浅色全部引用 pic.png',
  Array.isArray(preset.widgets) && preset.widgets.length === 3
  && w('chat-background')?.params.assetId === uploadedId
  && w('settings-background')?.params.assetId === uploadedId
  && w('sidebar-poster')?.params.assetId === uploadedId)
check('裁剪参数已落盘（cropX/cropY/cropW/cropH 四件套）',
  ['chat-background', 'settings-background', 'sidebar-poster'].every(id => {
    const params = w(id)?.params ?? {}
    return params.cropX !== undefined && params.cropY !== undefined
      && params.cropW !== undefined && params.cropH !== undefined
  }))
check('聊天背景裁剪参数正确（150% 缩放 → 1620×1620 @ (150, -270)）',
  w('chat-background')?.params.cropX === '150' && w('chat-background')?.params.cropY === '-270'
  && w('chat-background')?.params.cropW === '1620' && w('chat-background')?.params.cropH === '1620')
check('不透明度已落盘（0.4/0.55/0.3）', w('chat-background')?.params.opacity === '0.4'
  && w('settings-background')?.params.opacity === '0.55'
  && w('sidebar-poster')?.params.opacity === '0.3')
// #55：深色参数落盘（assetIdDark 引用深色素材 + 深色裁剪四件套 + 深色不透明度）
check('#55 深色参数已落盘（assetIdDark/cropXDark…/opacityDark=0.6）',
  w('chat-background')?.params.assetIdDark === darkUploadedId
  && w('chat-background')?.params.cropXDark !== undefined && w('chat-background')?.params.cropYDark !== undefined
  && w('chat-background')?.params.cropWDark !== undefined && w('chat-background')?.params.cropHDark !== undefined
  && w('chat-background')?.params.opacityDark === '0.6')

// 4b. zip 导出自动内嵌素材（分享自包含；裁剪参数随部件导出，导入后按参数重算渲染）
const zipRes = await fetch(`${BASE}/ui-presets/export-zip`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ preset }),
})
const { parseZip } = await import('../src/node/zip-util.ts')
const zipParsed = parseZip(new Uint8Array(await zipRes.arrayBuffer()))
const zipPreset = JSON.parse(new TextDecoder().decode(zipParsed.entries.find(e => e.name === 'preset.json').data))
check('zip 导出内嵌原图（dataUrl 前缀）', zipPreset.assets?.[0]?.dataUrl?.startsWith('data:image/png') === true)
check('zip 导出含裁剪参数（导入后重算渲染）',
  (zipPreset.widgets ?? []).every(wid => wid.params?.cropW !== undefined))
check('zip 导出含深色裁剪参数（assetIdDark）',
  (zipPreset.widgets ?? []).some(wid => wid.params?.assetIdDark !== undefined))

// 5. 重启恢复：重载页面 → 活动预设（另存为已应用）→ 部件 CSS 自动注入（含明暗标记）
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.getByRole('button', { name: '设置', exact: true }).waitFor({ timeout: 120000 })
  await dismissBetaNotice(page)
await page.waitForTimeout(800)
const patchAfterReload = await page.evaluate(() => document.querySelector('style[data-up-patch]')?.textContent ?? '')
check('重启后裁剪标记自动恢复（up-crop ×3 + up-crop-dark）',
  patchAfterReload.includes('up-crop:chat-background:0.4:')
  && patchAfterReload.includes('up-crop:settings-background:0.55:')
  && patchAfterReload.includes('up-crop:sidebar-poster:0.3:')
  && patchAfterReload.includes('up-crop-dark:chat-background:0.6:'))
const reloadedBg = await page.evaluate(() => {
  const el = document.querySelector('[data-conversation-scroll]')
  return el === null ? '' : getComputedStyle(el).backgroundImage
})
check(`重启后裁剪内联样式自动恢复（scroll=${reloadedBg.slice(0, 60)}…）`, reloadedBg.includes('/ui-presets/assets/asset-'))

console.log(`\n${pass} checks passed`)
if (errors.length > 0) console.log('browser-errors: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(process.exitCode ?? 0)
