/**
 * 令牌目录：编辑器表单的 schema 与默认值来源（设计 §2.1）。
 * 数据由 scripts/gen-catalog.mjs 从 DSH 样式表生成 → catalog-data.ts（提交产物，带 dshVersion 标记）。
 * 本文件只定义类型与访问函数；目录维护流程（P0-3）：
 * DSH 升级 → 重跑 gen-catalog.mjs → diff 报告 → 提交新快照。
 */

import { CATALOG, CATALOG_DSH_VERSION } from './catalog-data.ts'

/** 令牌分组（与盘点 §2 对齐）。 */
export type TokenGroup =
  | 'static'      // --dsw-static-* 静态色板（覆盖双向生效，caution）
  | 'alias-bg'    // 背景
  | 'alias-border'
  | 'alias-brand'
  | 'alias-label'
  | 'alias-button'
  | 'alias-interactive'
  | 'alias-state'
  | 'alias-markdown'
  | 'alias-scrollbar'
  | 'alias-overlay'
  | 'specific'    // --dsw-specific-* 组件专属
  | 'font'
  | 'shadow'
  | 'gradient'
  | 'shiki'
  | 'scrollbar'
  | 'other'

/** 安全等级：safe=常规可编辑；caution=影响面大/派生关系复杂，需注意；expert=默认锁定，显式解锁。 */
export type TokenSafety = 'safe' | 'caution' | 'expert'

/** 目录条目。 */
export interface TokenCatalogEntry {
  /** 令牌名（-- 开头）。 */
  name: string
  group: TokenGroup
  /** 亮色默认值（生成脚本从 :root 提取）。 */
  light: string
  /** 暗色默认值（生成脚本从 [data-ds-dark-theme] 提取；缺省回退 light）。 */
  dark: string
  valueType: 'color' | 'length' | 'number' | 'string' | 'font-family' | 'easing' | 'other'
  safety: TokenSafety
  /** 影响面（生成脚本按组推断，人工策展可覆盖）。 */
  scope: 'global' | 'regional' | 'local'
  description: string
}

/** 目录快照。 */
export interface TokenCatalog {
  dshVersion: string
  entries: TokenCatalogEntry[]
}

/** 生成脚本产出的目录快照（带 DSH 版本标记）。 */
export const catalog: TokenCatalog = {
  dshVersion: CATALOG_DSH_VERSION,
  entries: CATALOG,
}

/** 按令牌名查条目。 */
export function findToken(name: string): TokenCatalogEntry | undefined {
  return catalog.entries.find(entry => entry.name === name)
}

/** 全部分组（有序，编辑器渲染顺序）。 */
export const GROUP_ORDER: TokenGroup[] = [
  'alias-bg', 'alias-border', 'alias-brand', 'alias-label', 'alias-button',
  'alias-interactive', 'alias-state', 'alias-markdown', 'alias-scrollbar',
  'alias-overlay', 'specific', 'static', 'font', 'shadow', 'gradient', 'shiki', 'scrollbar', 'other',
]
