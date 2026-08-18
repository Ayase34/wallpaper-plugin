/**
 * 远程源接口（M2-7，决策 #4：v1 不开发远程市场，只留 PresetSource 接口 + 注册表）。
 * 加载链（controller）：本地库 → 内置 demo → 已注册源（按注册序回退）。
 * 纯类型 + 注册表（core 层，双 half 可复用、可单测）；默认零源注册——行为与现状一致。
 */

/** 源内预设元数据（列表用）。 */
export interface SourcePresetMeta {
  id: string
  name: string
  edition: string
}

/** 预设源：一个可列出/取回预设的外部数据面（未来：远程市场/预设广场）。 */
export interface PresetSource {
  /** 源标识（注册表键）。 */
  readonly id: string
  /** 展示名（未来 UI 用）。 */
  readonly name: string
  /** 列出该源可用预设元数据（异常由调用方隔离）。 */
  list(): Promise<SourcePresetMeta[]>
  /** 按 id 取预设原始数据（无 → null；调用方负责 validatePreset）。 */
  get(id: string): Promise<unknown | null>
}

const sources = new Map<string, PresetSource>()

/** 注册预设源（返回注销函数；重复 id 覆盖）。
 * #96（审计）：注销按身份校验（同 id 后注册者覆盖先注册者时，先注册者的注销
 * 不得误删后注册者）。 */
export function registerPresetSource(source: PresetSource): () => void {
  sources.set(source.id, source)
  return () => { if (sources.get(source.id) === source) sources.delete(source.id) }
}

/** 已注册源清单（注册序）。 */
export function listPresetSources(): PresetSource[] {
  return [...sources.values()]
}

/** 按 id 查源。 */
export function findPresetSource(id: string): PresetSource | undefined {
  return sources.get(id)
}
