// 图片裁剪纯函数单测（#52/#53）：比例表 / 输出帧尺寸 / 绘制矩形（缩放+平移）/ 平移边界 /
// 裁剪标记解析 / 元素动态样式（按实际尺寸计算背景尺寸与位置）。
// .mjs 纯 JS。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  WIDGET_CROP_RATIOS,
  cropRatioLabel,
  cropFrameSize,
  cropDrawRect,
  clampPan,
  clampPanForCrop,
  parseCropMarkers,
  cropElementStyle,
  layeredElementStyle,
  sidebarPosterFitFor,
  CROP_ZOOM_MIN,
  CROP_ZOOM_MAX,
} from '../src/core/crop.ts'

test('部件 → 固定比例（用户拍板：聊天 16:9 横向 / 设置卡 1:1 / 侧栏 1:5 竖向）', () => {
  assert.deepEqual(WIDGET_CROP_RATIOS['chat-background'], { w: 16, h: 9 })
  assert.deepEqual(WIDGET_CROP_RATIOS['settings-background'], { w: 1, h: 1 })
  assert.deepEqual(WIDGET_CROP_RATIOS['sidebar-poster'], { w: 1, h: 5 })
  assert.equal(cropRatioLabel({ w: 16, h: 9 }), '16:9')
  assert.equal(cropRatioLabel({ w: 1, h: 5 }), '1:5')
})

test('输出帧尺寸：长边 ≤1920 且保持比例', () => {
  assert.deepEqual(cropFrameSize({ w: 16, h: 9 }), { w: 1920, h: 1080 })
  assert.deepEqual(cropFrameSize({ w: 1, h: 1 }), { w: 1920, h: 1920 })
  assert.deepEqual(cropFrameSize({ w: 1, h: 5 }), { w: 384, h: 1920 })
  // 自定义长边
  assert.deepEqual(cropFrameSize({ w: 16, h: 9 }, 800), { w: 800, h: 450 })
})

test('cropDrawRect：zoom=1 恰好适配框内并居中', () => {
  // 图片 1000×500 → 框 200×100（比例一致）：zoom=1 铺满
  const r1 = cropDrawRect(1000, 500, 200, 100, 1, 0, 0)
  assert.deepEqual(r1, { x: 0, y: 0, w: 200, h: 100 })
  // 图片比例与框不同：fit = 短边适配 → 长边留透明边
  const r2 = cropDrawRect(400, 400, 200, 100, 1, 0, 0)
  assert.deepEqual(r2, { x: 50, y: 0, w: 100, h: 100 }) // 宽边两侧各 50 透明
})

test('cropDrawRect：zoom 放大裁切 / 缩小留透明边 / 平移偏移', () => {
  // zoom=2 → 图放大 2 倍铺出框（四周被裁）
  const r3 = cropDrawRect(1000, 500, 200, 100, 2, 0, 0)
  assert.deepEqual(r3, { x: -100, y: -50, w: 400, h: 200 })
  // zoom=0.5 → 图小于框（未覆盖区域透明填充——用户需求）
  const r4 = cropDrawRect(1000, 500, 200, 100, 0.5, 0, 0)
  assert.deepEqual(r4, { x: 50, y: 25, w: 100, h: 50 })
  // 平移
  const r5 = cropDrawRect(1000, 500, 200, 100, 1, 30, -10)
  assert.deepEqual(r5, { x: 30, y: -10, w: 200, h: 100 })
  // zoom=0 钳制为不绘制（0×0）
  const r6 = cropDrawRect(1000, 500, 200, 100, -1, 0, 0)
  assert.deepEqual(r6, { x: 100, y: 50, w: 0, h: 0 })
})

test('缩放边界常量与平移软边界', () => {
  assert.equal(CROP_ZOOM_MIN, 0.5)
  assert.equal(CROP_ZOOM_MAX, 8)
  assert.deepEqual(clampPan(1000, -1000, 200, 100), { x: 100, y: -50 })
  assert.deepEqual(clampPan(30, -10, 200, 100), { x: 30, y: -10 })
})

test('#57 clampPanForCrop：放大后按图片尺寸动态放宽边界（可拖到图片边缘），小图保持软边界', () => {
  const frame = { w: 1920, h: 1080 }
  // 放大后图片 5120×5120（1×1 图 zoom 8）：X 限 ±(5120-1920)/2=1600，Y 限 ±(5120-1080)/2=2020
  const zoomed = clampPanForCrop(2000, -3000, frame.w, frame.h, 5120, 5120)
  assert.equal(zoomed.x, 1600, '远超旧 ±960 边界——放大后可拖到图片边缘')
  assert.equal(zoomed.y, -2020)
  // 范围内直通
  assert.deepEqual(clampPanForCrop(300, -400, frame.w, frame.h, 5120, 5120), { x: 300, y: -400 })
  // 图片 == 框 → 不可平移（整图铺满）
  assert.deepEqual(clampPanForCrop(50, 0, frame.w, frame.h, 1920, 1080), { x: 0, y: 0 })
  // 小图（< 框）：与旧软边界一致（±框/2）
  assert.deepEqual(clampPanForCrop(1000, -1000, frame.w, frame.h, 100, 50), { x: 960, y: -540 })
  assert.deepEqual(clampPanForCrop(30, -10, frame.w, frame.h, 100, 50), { x: 30, y: -10 })
})

test('#53/#55 parseCropMarkers：解析裁剪标记（浅/深前缀、负值、url 片段）', () => {
  const cssText = [
    '/* up-crop:chat-background:0.4:150:-270:1620:1620:url("/ui-presets/assets/asset-abc123") */',
    '.other { color: red }',
    '/* up-crop-dark:chat-background:0.8:0:0:1920:1080:url("/ui-presets/assets/asset-dark1") */',
    '/* up-crop:sidebar-poster:1:0:0:100:500:url("data:image/png;base64,AAAA") */',
  ].join('\n')
  const markers = parseCropMarkers(cssText)
  assert.equal(markers.length, 3)
  assert.deepEqual(markers[0], {
    widgetId: 'chat-background', opacity: 0.4, x: 150, y: -270, w: 1620, h: 1620,
    url: 'url("/ui-presets/assets/asset-abc123")', dark: false,
  })
  // #55：up-crop-dark 前缀 → dark: true
  assert.deepEqual(markers[1], {
    widgetId: 'chat-background', opacity: 0.8, x: 0, y: 0, w: 1920, h: 1080,
    url: 'url("/ui-presets/assets/asset-dark1")', dark: true,
  })
  assert.equal(markers[2].widgetId, 'sidebar-poster')
  assert.equal(markers[2].url, 'url("data:image/png;base64,AAAA")')
  // 空文本 / 无标记 → 空数组
  assert.deepEqual(parseCropMarkers(''), [])
  assert.deepEqual(parseCropMarkers('/* no markers */'), [])
  // 非法数值被过滤（NaN/负数尺寸）
  const bad = parseCropMarkers('/* up-crop:chat-background:1:0:0:abc:10:url("x") */')
  assert.equal(bad.length, 0)
})

test('#53 cropElementStyle：按元素实际尺寸计算背景尺寸/位置（帧内容铺满元素）', () => {
  const frame = { w: 1920, h: 1080 }
  // 元素与帧同比例（16:9 元素 960×540）：s = 0.5；opacity=1 无 wash → 单层值列表
  // （#91：必须层数对应——否则图片被 cover 铺满、裁剪矩形被无视）
  const s1 = cropElementStyle(960, 540, frame, { x: 0, y: 0, w: 1920, h: 1080 }, 1,
    'url("/ui-presets/assets/a1")', 'var(--dsw-alias-bg-base, #fff)')
  assert.equal(s1.backgroundSize, '960px 540px')
  assert.equal(s1.backgroundPosition, '0px 0px')
  assert.equal(s1.backgroundImage, 'url("/ui-presets/assets/a1")') // opacity=1 无 wash
  assert.equal(s1.backgroundRepeat, 'no-repeat')
  // 元素比例不同（宽 1200×高 540，比 16:9 更宽）：s = max(1200/1920, 540/1080) = 0.625
  const s2 = cropElementStyle(1200, 540, frame, { x: 0, y: 0, w: 1920, h: 1080 }, 1,
    'url("/x")', 'var(--dsw-alias-bg-base, #fff)')
  assert.equal(s2.backgroundSize, '1200px 675px')
  assert.equal(s2.backgroundPosition, '0px 0px')
  // 裁剪矩形（放大 + 平移）同步缩放定位：绘制矩形 1620×1620 位于 (150, -270)
  const s3 = cropElementStyle(960, 540, frame, { x: 150, y: -270, w: 1620, h: 1620 }, 1,
    'url("/x")', 'var(--dsw-alias-bg-base, #fff)')
  assert.equal(s3.backgroundSize, '810px 810px')
  assert.equal(s3.backgroundPosition, '75px -135px')
  // #91 用户场景：小裁剪矩形（帧左下角）必须精确映射——不得被 cover 吞掉
  const small = cropElementStyle(384, 1920, { w: 384, h: 1920 }, { x: 0, y: 1500, w: 100, h: 60 }, 1,
    'url("/x")', 'var(--dsw-alias-bg-base, #fff)')
  assert.equal(small.backgroundSize, '100px 60px')
  assert.equal(small.backgroundPosition, '0px 1500px')
  // opacity < 1 → wash 层（color-mix 叠图上方）→ 双/三层值列表
  const s4 = cropElementStyle(960, 540, frame, { x: 0, y: 0, w: 1920, h: 1080 }, 0.4,
    'url("/x")', 'var(--dsw-alias-bg-base, #fff)')
  assert.ok(s4.backgroundImage.includes('color-mix(in srgb, var(--dsw-alias-bg-base, #fff) 60%, transparent)'))
  assert.ok(s4.backgroundImage.includes('url("/x")'))
  assert.equal(s4.backgroundSize, 'cover, 960px 540px') // wash 层 cover + 图片层 px
  assert.equal(s4.backgroundPosition, 'center, 0px 0px')
  assert.equal(s4.backgroundRepeat, 'no-repeat, no-repeat')
  // 尺寸未知 → 空样式（调用方清除）
  assert.deepEqual(cropElementStyle(0, 0, frame, { x: 0, y: 0, w: 1, h: 1 }, 1, 'url("/x")', 'w'), {})
})

test('#90 layeredElementStyle：底图 + 原生动图双背景（同帧坐标变换）', () => {
  const frame = { w: 1920, h: 1080 }
  // 元素同比例 960×540：s = 0.5；全帧裁剪 + 动图矩形 (100,50,200,150) → 元素 (50,25,100,75)
  const s1 = layeredElementStyle(960, 540, frame, { x: 0, y: 0, w: 1920, h: 1080 }, 1,
    'url("/base")', 'url("/anim")', { x: 100, y: 50, w: 200, h: 150 }, 'var(--dsw-alias-bg-base, #fff)')
  assert.equal(s1.backgroundImage, 'url("/base"), url("/anim")')
  assert.equal(s1.backgroundSize, '960px 540px, 100px 75px')
  assert.equal(s1.backgroundPosition, '0px 0px, 50px 25px')
  assert.equal(s1.backgroundRepeat, 'no-repeat, no-repeat')
  // 裁剪放大（zoom 裁切）：crop rect (150,-270,1620,1620) → m = 1620·0.5/1920 = 0.421875
  const s2 = layeredElementStyle(960, 540, frame, { x: 150, y: -270, w: 1620, h: 1620 }, 1,
    'url("/base")', 'url("/anim")', { x: 100, y: 50, w: 200, h: 150 }, 'var(--dsw-alias-bg-base, #fff)')
  assert.equal(s2.backgroundSize, '810px 810px, 84.375px 63.28125px')
  assert.equal(s2.backgroundPosition, '75px -135px, 117.1875px -113.90625px')
  // 带 wash（opacity<1）→ 三层值列表（wash cover + 底图 px + 动图 px）
  const s3 = layeredElementStyle(960, 540, frame, { x: 0, y: 0, w: 1920, h: 1080 }, 0.4,
    'url("/base")', 'url("/anim")', { x: 0, y: 0, w: 100, h: 50 }, 'w')
  assert.equal((s3.backgroundImage.match(/url\(/g) ?? []).length, 2) // wash + 底图 + 动图
  assert.equal(s3.backgroundImage.startsWith('linear-gradient('), true)
  assert.equal(s3.backgroundSize, 'cover, 960px 540px, 50px 25px')
  assert.equal(s3.backgroundPosition, 'center, 0px 0px, 0px 0px')
  assert.equal(s3.backgroundRepeat, 'no-repeat, no-repeat, no-repeat')
  // 尺寸未知 → 空样式
  assert.deepEqual(layeredElementStyle(0, 0, frame, { x: 0, y: 0, w: 1, h: 1 }, 1,
    'url("/b")', 'url("/a")', { x: 0, y: 0, w: 1, h: 1 }, 'w'), {})
})

test('#92 侧栏海报 contain 映射：整个帧完整可见（元素 280×900 ≈1:3.2 vs 帧 1:5）', () => {
  const frame = { w: 384, h: 1920 }
  // 用户实测场景：海报放帧底部 (0, 1439.9, 384, 960.2)——cover 时 s=max(280/384,900/1920)
  // = 35/48 → y=1439.9·35/48≈1049.9 整个在 900 高元素外（不可见）；contain 时 s=min=0.46875
  // → 居中偏移 0，图片顶部 674.95（展开可见）
  const contain = cropElementStyle(280, 900, frame, { x: 0, y: 1439.9, w: 384, h: 960.2 }, 1,
    'url("/poster")', 'w', 'contain')
  assert.equal(contain.backgroundSize, '180px 450.09375px')
  assert.equal(contain.backgroundPosition, '50px 674.953125px') // X 居中偏移 50 + Y 偏移 674.95
  // 可见性：Y 坐标在元素内（0 < 674.95 < 900）
  const posY = parseFloat(contain.backgroundPosition.split(' ')[1])
  assert.ok(posY < 900 && posY > 0, '展开可见（Y 在元素内）')
  // 对照：cover 时图片顶部超出元素（不可见——bug 场景）
  const cover = cropElementStyle(280, 900, frame, { x: 0, y: 1439.9, w: 384, h: 960.2 }, 1,
    'url("/poster")', 'w', 'cover')
  assert.ok(parseFloat(cover.backgroundPosition.split(' ')[1]) > 900, 'cover 下图片顶部超出元素（原 bug 现象）')
  // 默认 fit=cover 行为不变（向后兼容）
  const dflt = cropElementStyle(280, 900, frame, { x: 0, y: 1439.9, w: 384, h: 960.2 }, 1,
    'url("/poster")', 'w')
  assert.deepEqual(dflt, cover)
  // 分层路径 contain：动图矩形经同变换映射（含居中偏移）——两层位置（底图, 动图）
  const layered = layeredElementStyle(280, 900, frame, { x: 0, y: 1439.9, w: 384, h: 960.2 }, 1,
    'url("/base")', 'url("/anim")', { x: 10, y: 50, w: 100, h: 80 }, 'w', 'contain')
  assert.equal(layered.backgroundPosition, '50px 674.953125px, 54.6875px 698.390625px')
})

test('#99 sidebarPosterFitFor：侧栏折叠自适应——宽于帧比例 contain（整幅），窄于帧比例 cover（竖条）', () => {
  const frame = { w: 384, h: 1920 } // 1:5
  // 展开侧栏 280×900 ≈ 1:3.2 ≥ 1:5 → contain（#92 行为不变）
  assert.equal(sidebarPosterFitFor(280, 900, frame), 'contain')
  // 折叠窄栏 64×900 ≈ 1:14 < 1:5 → cover（海报"折叠"成竖条，不再缩小）
  assert.equal(sidebarPosterFitFor(64, 900, frame), 'cover')
  assert.equal(sidebarPosterFitFor(80, 900, frame), 'cover')
  // 比例相等 → contain（等价，取 contain）
  assert.equal(sidebarPosterFitFor(384, 1920, frame), 'contain')
  // 兜底：尺寸未知 → contain（cropElementStyle 空样式由调用方清除）
  assert.equal(sidebarPosterFitFor(0, 900, frame), 'contain')
  assert.equal(sidebarPosterFitFor(280, 900, { w: 0, h: 0 }), 'contain')
})
