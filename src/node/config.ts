/**
 * M5-1 schemastery Config 解析（纯函数，可单测）：
 * 宿主 cordis loader 对 `plugin.Config`（schemastery schema）做 ~standard.validate——
 * 非法值会抛 ValidationError 导致插件行 FAILED（fail-loud 红线，与官方插件一致），
 * 因此 schema 全可选 + 宽松；本模块在 apply 内再防御式归一化（trim/空值忽略）。
 */

export interface UiPresetsConfig {
  presetsDir?: string
  assetsDir?: string
}

export interface ResolvedDirs {
  presetsDir: string
  assetsDir: string
}

/**
 * 按宿主 Config 解析最终目录（默认 <presetsDir>/assets 跟随 presetsDir）。
 * review P3（全量评审）：typeof 防御——schema 前置校验属设计内（非法值 fail-loud），
 * 但绕过校验直调 apply（如单测）时非字符串配置不得抛错（与"运行时防御兜底"注释对齐）。
 * @param config - 宿主校验后的配置（可能含空串/undefined）。
 * @param defaults - 未配置时的默认目录。
 */
export function resolveConfiguredDirs(config: UiPresetsConfig, defaults: ResolvedDirs): ResolvedDirs {
  const out: ResolvedDirs = { ...defaults }
  const trimIfString = (value: unknown): string | undefined => (typeof value === 'string' ? value.trim() : undefined)
  const presets = trimIfString(config.presetsDir)
  if (presets !== undefined && presets !== '') {
    out.presetsDir = presets
    // assetsDir 未显式给出时跟随 presetsDir
    const assets = trimIfString(config.assetsDir)
    out.assetsDir = assets !== undefined && assets !== '' ? assets : `${presets}/assets`
  } else {
    const assets = trimIfString(config.assetsDir)
    if (assets !== undefined && assets !== '') out.assetsDir = assets
  }
  return out
}
