/**
 * 旋钮层的纯逻辑（可单测）：旋钮只是「批量写令牌」的界面层，产物仍是 TokenOverride 双值，
 * schema / 引擎 / 保存链路零改动（设计依据：项目管理/M2设计方案-旋钮抽象层.md）。
 *
 * 这里只放三件 UI 需要但 core 没有的小事：
 * 1) 局部合并（分别设置模式下只写一个方案键，不能把另一套值抹掉）；
 * 2) 颜色值回读（非颜色值——如 var() 引用——要能识别出来，交给高级区处理）；
 * 3) 「束内已单独调整」判定（用户绕过旋钮手改过束内某个令牌时给出提示，不静默覆盖心智）。
 */
import { findKnob, knobValuesForSchemes, tokensToKnobValue } from '../core/knobs.ts'
import type { TokenOverride } from '../core/schema.ts'

/** 把旋钮写入的局部覆盖合并进令牌表（只覆盖提供的方案键，其余保持现值）。 */
export function mergeKnobPatch(
  tokens: Record<string, TokenOverride>,
  patch: Record<string, Partial<TokenOverride>>,
): Record<string, TokenOverride> {
  const next: Record<string, TokenOverride> = { ...tokens }
  for (const [name, partial] of Object.entries(patch)) {
    const prev = next[name]
    next[name] = {
      light: partial.light ?? prev?.light ?? '',
      dark: partial.dark ?? prev?.dark ?? '',
    }
  }
  return next
}

/** 颜色输入可用的值（#rgb/#rrggbb/rgb()/hsl()）；引用值或空值返回 null。 */
export function knobColorValue(
  knobId: string,
  tokens: Record<string, TokenOverride>,
  scheme: 'light' | 'dark',
): string | null {
  const value = tokensToKnobValue(knobId, tokens, scheme).trim()
  if (value === '') return null
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return value
  if (/^(rgba?|hsla?)\(/i.test(value)) return value
  return null
}

/**
 * 束内是否已有人工改动：该旋钮当前「主值」推导出的束内期望值，与实际令牌值不一致。
 * 只对「颜色 + 束内多令牌」有意义——单令牌旋钮没有束内概念，select 档位的束是取值表。
 */
export function knobBundleDiverged(knobId: string, tokens: Record<string, TokenOverride>): boolean {
  const knob = findKnob(knobId)
  if (knob === undefined || knob.control !== 'color' || knob.bundle.length < 2) return false
  const light = knobColorValue(knobId, tokens, 'light')
  const dark = knobColorValue(knobId, tokens, 'dark')
  if (light === null || dark === null) return false
  // 主值本身可能来自 var() 链；只有能解析成颜色的才谈得上「推导期望值」
  const expected = knobValuesForSchemes(knobId, { light, dark })
  for (const name of knob.bundle) {
    const actual = tokens[name]
    const want = expected[name]
    // 未覆盖 = 跟随默认/派生，不算冲突（避免老预设一打开就满屏「已调整」）
    if (actual === undefined || want === undefined) continue
    if (actual.light !== want.light || actual.dark !== want.dark) return true
  }
  return false
}
