/**
 * 分享链接 / 分享码（借鉴 dsh-dream-skin 的「URL 即包」传播方式，但补齐它丢掉的东西）。
 *
 * 与 dream-skin 主题包的差异（刻意「取其精华，去其糟粕」）：
 * - 载荷带**全量语义**：tokens + css 补丁 + theme 注册 + widgets 部件参数 + cover 裁剪 +
 *   分组；dream-skin 的主题包白名单只回放 token（连皮肤自带的 glow 与滑杆默认值都不带），
 *   导入后「只剩配色」。这里材质、裁剪、主题注册都跟着走。
 * - 双值令牌原样携带（light/dark 成对），不存在「一包只能一套 colorScheme」的降级。
 * - 素材二进制不随链接走（体积不可控、URL 长度不可控）：assets 保留 id/name/mime 壳，
 *   部件/封面引用仍然成立；导入时把「缺失素材数」显式告知，用户补图即可回填，不用整包重发。
 * - 除链接外还给「纯分享码」：dream-skin 的分享链接是 127.0.0.1，发给别人打不开；
 *   分享码可以贴到任意机器，粘贴即导入。
 * - 编解码只做搬运：合法性一律回到 core 的 validatePreset，新入口不绕过任何校验。
 * - 纯 location.hash：不联网、不注册协议、无隐私外泄。
 */
import type { Preset } from '../core/schema.ts'
import { validatePreset } from '../core/schema.ts'
import { t as tr } from './i18n.ts'

/** hash 前缀（与 DSH 自身 hash 路由 `#studio=` 不冲突）。 */
export const SHARE_HASH_PREFIX = '#ui-presets-share='
/** 载荷版本（未来加字段时递增，旧版本给出可读错误而不是半解析）。 */
export const SHARE_PAYLOAD_VERSION = 1
/** 硬上限：超过即拒绝（提示改用 ZIP）——浏览器地址栏/聊天软件都不可靠地承载超长 URL。 */
export const MAX_SHARE_CHARS = 200_000
/** 软警戒：超过只提示（预设令牌多时属正常）。 */
export const SHARE_WARN_CHARS = 20_000

/** 编码结果。 */
export type EncodeShareResult =
  | { ok: true; code: string; chars: number; omitted: number; warn?: string }
  | { ok: false; error: string }

/** 解码结果。 */
export type DecodeShareResult =
  | { ok: true; preset: Preset; omitted: number }
  | { ok: false; error: string }

/** 启动时从 hash 捕获到的待导入分享。 */
export type PendingShare =
  | { ok: true; preset: Preset; omitted: number; source: 'link' | 'paste' }
  | { ok: false; error: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  // 分块避免 String.fromCharCode 参数上限（大预设可能十几万字节）。
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array | null {
  if (text === '' || !/^[A-Za-z0-9_-]+$/.test(text)) return null
  const padded = text.replace(/-/g, '+').replace(/_/g, '/')
    + '='.repeat((4 - (text.length % 4)) % 4)
  try {
    const binary = atob(padded)
    const out = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i)
    return out
  } catch {
    return null
  }
}

/** 剔除素材二进制（保留 id/name/mime 壳，引用与裁剪坐标不动）。 */
export function stripAssetPayload(preset: Preset): { preset: Preset; omitted: number } {
  // 深拷贝：调用方传进来的可能是引擎草稿引用，编码不得回写。
  const clone = JSON.parse(JSON.stringify(preset)) as Preset
  let omitted = 0
  if (Array.isArray(clone.assets)) {
    for (const asset of clone.assets) {
      if (asset.dataUrl !== undefined) {
        delete asset.dataUrl
        omitted += 1
      }
    }
  }
  return { preset: clone, omitted }
}

/** 预设 → 分享码。编码前先自校验，避免把非法草稿变成坏链接。 */
export function encodeShare(preset: Preset): EncodeShareResult {
  const { preset: lean, omitted } = stripAssetPayload(preset)
  const validated = validatePreset(lean)
  if (!validated.ok) {
    return { ok: false, error: tr('share.badPreset', { errors: validated.errors.join('; ') }) }
  }
  const json = JSON.stringify({ v: SHARE_PAYLOAD_VERSION, p: validated.preset })
  const code = toBase64Url(new TextEncoder().encode(json))
  if (code.length > MAX_SHARE_CHARS) {
    return {
      ok: false,
      error: tr('share.tooLarge', { chars: code.length, max: MAX_SHARE_CHARS }),
    }
  }
  const result: EncodeShareResult = { ok: true, code, chars: code.length, omitted }
  if (code.length > SHARE_WARN_CHARS) {
    result.warn = tr('share.longCode', { chars: code.length })
  }
  return result
}

/** 从链接 / hash / 纯分享码里取出载荷（顺序：带 marker 的片段 → 纯码）。 */
export function extractShareCode(text: string): string | null {
  const trimmed = text.trim()
  if (trimmed === '') return null
  const marker = 'ui-presets-share='
  const at = trimmed.indexOf(marker)
  if (at >= 0) {
    const rest = trimmed.slice(at + marker.length)
    const cut = rest.search(/[&#\s]/)
    return cut >= 0 ? rest.slice(0, cut) : rest
  }
  if (/^[A-Za-z0-9_-]+$/.test(trimmed)) return trimmed
  return null
}

/** 分享码 / 链接 → 预设（含 validatePreset 全量校验）。 */
export function decodeShare(text: string): DecodeShareResult {
  const code = extractShareCode(text)
  if (code === null) {
    return { ok: false, error: tr('share.notCode') }
  }
  const bytes = fromBase64Url(code)
  if (bytes === null) return { ok: false, error: tr('share.badBase64') }
  let payload: unknown
  try {
    payload = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return { ok: false, error: tr('share.badJson') }
  }
  if (!isRecord(payload) || payload.v !== SHARE_PAYLOAD_VERSION || !isRecord(payload.p)) {
    return { ok: false, error: tr('share.badVersion', { version: SHARE_PAYLOAD_VERSION }) }
  }
  const validated = validatePreset(payload.p)
  if (!validated.ok) {
    return { ok: false, error: tr('share.badPayload', { errors: validated.errors.join('; ') }) }
  }
  const preset = validated.preset
  const omitted = Array.isArray(preset.assets)
    ? preset.assets.filter(asset => asset.dataUrl === undefined).length
    : 0
  return { ok: true, preset, omitted }
}

/** 分享码 → 完整链接（去掉 base 已有的 hash；路径/查询保留）。 */
export function buildShareLink(baseUrl: string, code: string): string {
  const base = baseUrl.split('#')[0]
  return `${base}${SHARE_HASH_PREFIX}${code}`
}

// ---- 启动时待导入分享（模块级单例；页面渲染前由 apply() 捕获） ----

let pendingShare: PendingShare | null = null

/** 解析 location.hash；命中前缀则记录待导入（无论成败都记录，便于 UI 展示错误）。 */
export function capturePendingShare(hash: string): PendingShare | null {
  if (!hash.startsWith(SHARE_HASH_PREFIX)) return null
  const decoded = decodeShare(hash)
  pendingShare = decoded.ok
    ? { ok: true, preset: decoded.preset, omitted: decoded.omitted, source: 'link' }
    : { ok: false, error: decoded.error }
  return pendingShare
}

export function getPendingShare(): PendingShare | null {
  return pendingShare
}

export function setPendingShare(next: PendingShare | null): void {
  pendingShare = next
}

export function clearPendingShare(): void {
  pendingShare = null
}
