/**
 * #108 出厂预设播种：把「带壁纸的默认预设」（DeepSeek娘三件套）写进用户壁纸库与预设库。
 *
 * 背景（用户反馈）：出厂预设原先只有 15 个颜色令牌，新装用户「只有基本色调、没有壁纸」。
 * 现在把图片随插件分发（node half 内嵌 base64，见 node/builtin-assets.ts），
 * 首次启动播种成库内素材 + 库内预设 `default`，并（仅在没有任何活动预设时）自动应用。
 *
 * 幂等与「不抢用户编辑」原则：
 * - 库内已存在同名预设 id → 整个播种跳过（用户改过的「默认」永远优先，绝不被覆盖）；
 * - 素材按固定 id 落盘，内容哈希一致则跳过重写；被用户删掉会自动补回；
 * - active.json 已有非空活动预设 → 不抢焦点；仅在「无活动预设」时播种为活动预设。
 *
 * 纯逻辑 + 存储端口（port）：便于单测（不碰真实文件系统），Node half 提供真实实现。
 */
import { DEMO_DEFAULT_TOKENS } from './demo-data.ts'
import { validatePreset } from './schema.ts'
import type { Preset } from './schema.ts'

/** 播种所用的固定素材 id（内容寻址：id 稳定 → 预设引用稳定）。 */
export const BUILTIN_PRESET_ID = 'default'

/** 播种素材（id/文件名/mime/字节 + 可选图片原始尺寸，供裁剪帧换算与封面渲染）。 */
export interface SeedAsset {
  id: string
  name: string
  mime: string
  bytes: Uint8Array
}

/** 素材元数据（与 node half 的 AssetMeta 同形；此处最小面避免循环依赖）。 */
export interface SeedAssetMeta {
  id: string
  name: string
  mime: string
  size: number
  sha256?: string
}

/** 播种存储端口（Node half 实现；单测用内存实现）。 */
export interface SeedPort {
  /** 预设库中是否已有该 id（用户改过的同名预设 → 跳过播种）。 */
  hasPreset(id: string): boolean
  /** 写入预设（父目录自动创建）。 */
  writePreset(id: string, preset: Preset): void
  /** 读出素材元数据（不存在 → null）。 */
  readAssetMeta(id: string): SeedAssetMeta | null
  /** 写入素材文件 + 元数据。 */
  writeAsset(asset: SeedAsset, sha256: string): void
  /** 当前活动预设 id（无 → null）。 */
  activePresetId(): string | null
  /** 写入活动预设（node half 负责 revision 单调 +1）。 */
  writeActivePreset(id: string): void
}

export interface SeedResult {
  /** 是否写入了预设（false = 库中已有同名预设，跳过）。 */
  seeded: boolean
  /** 本次新写入的素材 id。 */
  assetsWritten: string[]
  /** 素材已存在且内容一致（未重写）的 id。 */
  assetsKept: string[]
  /** 是否顺带把活动预设设为出厂预设。 */
  activated: boolean
  /** 跳过原因（seeded=false 时非空）。 */
  skippedReason?: string
}

/**
 * 内置预设的部件与封面（#108：取自用户导出的「默认（自定义）」包，素材 id 换成本插件的内置 id，
 * 裁剪矩形与不透明度原样沿用——裁剪帧按 fit 缩放与图片实际像素无关，故 JPEG 派生版同样适用）。
 */
const WIDGETS: Array<{ id: string; params: Record<string, string> }> = [
  {
    id: 'chat-background',
    // #109：聊天背景源图是透明底——浅/深各压一版底图，避免透明区在 JPEG 里被压成黑块
    params: {
      assetId: 'asset-dsnm-chat',
      opacity: '0.4',
      cropX: '-47.5', cropY: '-27', cropW: '2014.9', cropH: '1134',
      assetIdDark: 'asset-dsnm-chat-dark',
      opacityDark: '0.4',
      cropXDark: '-47.5', cropYDark: '-27', cropWDark: '2014.9', cropHDark: '1134',
    },
  },
  {
    id: 'settings-background',
    params: { assetId: 'asset-dsnm-settings', opacity: '0.35', cropX: '-48', cropY: '-48', cropW: '2016', cropH: '2016' },
  },
  {
    id: 'sidebar-poster',
    params: { assetId: 'asset-dsnm-sidebar', opacity: '0.35', cropX: '-211.2', cropY: '-48.3', cropW: '806.4', cropH: '2016.5' },
  },
]

const COVER = { assetId: 'asset-dsnm-chat', cropX: '0', cropY: '-116.5', cropW: '2501.8', cropH: '1408' }

/** 组装出厂预设（令牌来自 DEMO_DEFAULT_TOKENS；素材走库引用而非内嵌 dataUrl）。 */
export function buildBuiltinPreset(assets: SeedAsset[]): Preset {
  return {
    schemaVersion: 1,
    id: BUILTIN_PRESET_ID,
    name: '默认',
    author: { name: 'wallpaper-plugin' },
    edition: 'standard',
    targetDshVersion: '0.1.0-rc.5',
    tags: ['builtin', 'style:海洋清爽'],
    tokens: JSON.parse(JSON.stringify(DEMO_DEFAULT_TOKENS)) as Preset['tokens'],
    assets: assets.map(asset => ({ id: asset.id, name: asset.name, mime: asset.mime })),
    widgets: JSON.parse(JSON.stringify(WIDGETS)) as Preset['widgets'],
    cover: { ...COVER },
  }
}

/**
 * 播种出厂预设（幂等）。
 * @param port - 存储端口（真实实现见 node/index.ts；单测传内存实现）
 * @param assets - 内置素材（node/builtin-assets.ts 解码而来）
 * @param sha256 - 内容哈希函数（注入以便单测）
 */
export function seedBuiltinPreset(
  port: SeedPort,
  assets: SeedAsset[],
  sha256: (bytes: Uint8Array) => string,
): SeedResult {
  const result: SeedResult = { seeded: false, assetsWritten: [], assetsKept: [], activated: false }
  // 素材：按内容哈希逐张核对——内容变了（本插件修图/换图）会更新，一致则跳过重写，被删则补回。
  // 注意：素材刷新与「预设是否已存在」无关——否则老用户永远拿不到修好的图（#109 实测踩到）。
  for (const asset of assets) {
    const hash = sha256(asset.bytes)
    const existing = port.readAssetMeta(asset.id)
    if (existing !== null && existing.sha256 === hash && existing.size === asset.bytes.length) {
      result.assetsKept.push(asset.id)
      continue
    }
    port.writeAsset(asset, hash)
    result.assetsWritten.push(asset.id)
  }
  // 预设：库中已有同名 id（用户改过的「默认」）→ 不写、不覆盖，仅完成素材修补
  if (port.hasPreset(BUILTIN_PRESET_ID)) {
    result.skippedReason = `库中已有同名预设「${BUILTIN_PRESET_ID}」，保留用户版本`
    return result
  }
  const preset = buildBuiltinPreset(assets)
  const validated = validatePreset(preset)
  if (!validated.ok) {
    // 构建期数据问题：宁可不播种也不写坏预设（读端会跳过损坏条目）
    result.skippedReason = `内置预设未通过校验：${validated.errors[0] ?? '未知错误'}`
    return result
  }
  port.writePreset(BUILTIN_PRESET_ID, validated.preset)
  result.seeded = true
  // 仅在「没有任何活动预设」时接管——不抢用户已选的外观
  if (port.activePresetId() === null) {
    port.writeActivePreset(BUILTIN_PRESET_ID)
    result.activated = true
  }
  return result
}
