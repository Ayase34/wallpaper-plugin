/**
 * 令牌值工具（M1 取色器降级基础）：var() 引用解析。
 * 目录中大量 alias 令牌的默认值是 var(--dsw-static-*) 引用；解析引用链
 * 才能判定"值是否可解析为颜色"→ 编辑器据此决定给取色器还是文本输入。
 */
import { catalog } from './catalog.ts'
import type { TokenCatalogEntry } from './catalog.ts'

/** 解析深度上限（防引用环）。 */
const MAX_RESOLVE_DEPTH = 8

const COLOR_PATTERNS = [
  /^#[0-9a-fA-F]{3,8}$/,
  /^rgba?\(/,
  /^hsla?\(/,
  /^(transparent|currentColor|inherit)$/,
]

export function isColorValue(value: string): boolean {
  return COLOR_PATTERNS.some(pattern => pattern.test(value.trim()))
}

/**
 * 解析 var() 引用链到最终字面值（catalog 目录内解析）。
 * @param value - 原始值（可能是 var(--x) 或字面值）。
 * @param scheme - 取哪套默认值（light/dark）；缺省 light。
 * @returns 解析后的字面值（仍可能是 var()——无法解析时原样返回）。
 */
export function resolveTokenValue(value: string, scheme: 'light' | 'dark' = 'light'): string {
  let current = value.trim()
  for (let depth = 0; depth < MAX_RESOLVE_DEPTH; depth += 1) {
    const m = /^var\(\s*(--[\w-]+)/.exec(current)
    if (m === null) return current
    const entry = findCatalogEntry(m[1])
    if (entry === undefined) return current
    const next = (scheme === 'dark' ? entry.dark : entry.light).trim()
    if (next === current) return current
    current = next
  }
  return current
}

/** 值是否可解析为颜色（含 var() 引用链解析）。 */
export function isResolvableColor(value: string, scheme: 'light' | 'dark' = 'light'): boolean {
  return isColorValue(resolveTokenValue(value, scheme))
}

/** 从目录查找条目（模块级 catalog 访问统一入口，测试可注入性靠数据快照）。 */
function findCatalogEntry(name: string): TokenCatalogEntry | undefined {
  return catalog.entries.find(entry => entry.name === name)
}
