/**
 * 工作室 hash 路由（设计 §3.3）：命中则全屏工作室层渲染。
 * #96（审计）：RUNTIME_ENV/detect 探测无消费者已删（环境差异不再影响 UI 行为）。
 */

/** 工作室 hash 路由（设计 §3.3）：命中则全屏工作室层渲染。 */
export const STUDIO_HASH = '#studio=presets'

export function isStudioHashActive(): boolean {
  return window.location.hash === STUDIO_HASH
}

export function openStudio(): void {
  // 环境自适应（M0：统一应用内全屏层 + hash 路由；Web 独立标签页为后续高级选项）。
  if (window.location.hash !== STUDIO_HASH) {
    // 写 hash 触发 hashchange → Studio 层挂载（双端一致路径）。
    window.location.hash = STUDIO_HASH
  }
}

export function closeStudio(): void {
  if (window.location.hash === STUDIO_HASH) {
    history.replaceState(null, '', window.location.pathname + window.location.search)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }
}
