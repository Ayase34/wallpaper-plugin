/**
 * 预设审计（M2-2b diff 告警）：版本契约 + 未知令牌。
 * 纯函数（core 层可单测）；UI（预设墙/工作室）按返回值渲染轻量横幅——所有版本可见。
 */
import { catalog } from './catalog.ts'
import type { Preset } from './schema.ts'

/** DSH 应用令牌（--dsh-* 前缀）不在插件目录内（369 条 --dsw-*），属已知非目录令牌。 */
function isKnownOutsideCatalog(name: string): boolean {
  return name.startsWith('--dsh-')
}

/** 审计一个预设，返回警告清单（空数组 = 无告警）。 */
export function auditPreset(preset: Preset): string[] {
  const warnings: string[] = []
  if (preset.targetDshVersion !== undefined && preset.targetDshVersion !== catalog.dshVersion) {
    warnings.push(
      `「${preset.name}」基于 DSH ${preset.targetDshVersion}（当前令牌目录 ${catalog.dshVersion}）——令牌集可能已变化`,
    )
  }
  const unknown = Object.keys(preset.tokens).filter(name => {
    if (isKnownOutsideCatalog(name)) return false
    return !catalog.entries.some(entry => entry.name === name)
  })
  if (unknown.length > 0) {
    const sample = unknown.slice(0, 3).join('、')
    warnings.push(`「${preset.name}」含目录外令牌 ${unknown.length} 项（${sample}${unknown.length > 3 ? '…' : ''}）`)
  }
  return warnings
}

/** 审计一批预设（去重合并；demo 与库预设共用）。 */
export function auditPresets(presets: Preset[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const preset of presets) {
    for (const warning of auditPreset(preset)) {
      if (!seen.has(warning)) {
        seen.add(warning)
        out.push(warning)
      }
    }
  }
  return out
}
