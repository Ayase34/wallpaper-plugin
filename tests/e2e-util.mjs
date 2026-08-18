// e2e 共享工具：解析 playwright 与 chromium 路径（环境变量必填——#96 GitHub 准备：
// 不内置个人机器路径；见 README「开发」节）。
import { createRequire } from 'node:module'

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} 未设置——e2e 需要 playwright 路径。示例：\n` +
      `  $env:UIP_PLAYWRIGHT_DIR = "C:/.../node_modules/playwright/"\n` +
      `  $env:UIP_CHROMIUM = "C:/.../ms-playwright/chromium-XXXX/chrome-win64/chrome.exe"`)
  }
  return value
}

/** 解析 playwright 包路径：UIP_PLAYWRIGHT_DIR（必填）。 */
export function playwrightRequire() {
  return createRequire(requireEnv('UIP_PLAYWRIGHT_DIR'))
}

/** 解析 chromium 可执行文件：UIP_CHROMIUM（必填）。 */
export function chromiumExecutable() {
  return requireEnv('UIP_CHROMIUM')
}

/** 启动浏览器（headless chromium）。 */
export async function launchBrowser() {
  const { chromium } = playwrightRequire()('playwright')
  return chromium.launch({ executablePath: chromiumExecutable() })
}

/**
 * 关闭 DSH 首次运行的引导弹窗（#54：隔离 e2e-home 是全新环境，必现；
 * 用户 ~/.dsh 环境早已点过）。调用时机：页面加载完成后、点击设置之前。
 * 两道弹窗按序处理：①「内测声明」→ 继续；②「添加一个 API Key 开始使用」→ 稍后配置。
 * 各等 8s（弹窗出现时机晚于设置按钮）；无弹窗则静默跳过。
 */
export async function dismissBetaNotice(page) {
  // ① 内测声明
  const notice = page.getByRole('dialog', { name: '内测声明' })
  try {
    await notice.waitFor({ state: 'visible', timeout: 8000 })
    await notice.getByRole('button', { name: /继续/ }).click({ timeout: 5000 })
    await notice.waitFor({ state: 'detached', timeout: 10000 })
  } catch { /* 无此弹窗或已关 */ }
  // ② API Key 引导（可能在内测声明之后才出现）
  const apiDialog = page.getByRole('dialog', { name: /API Key/ })
  try {
    await apiDialog.waitFor({ state: 'visible', timeout: 8000 })
    await apiDialog.getByRole('button', { name: /稍后配置/ }).click({ timeout: 5000 })
    await apiDialog.waitFor({ state: 'detached', timeout: 10000 })
    return true
  } catch { return false }
}
