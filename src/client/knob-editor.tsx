/**
 * 旋钮层 UI（M2-1 恢复；#74「AI 接管」时连同组件一起删掉，能力却一直留着）。
 *
 * 交互按 2026-08 用户拍板的决策 D / E：
 * - **D**：颜色旋钮默认**单值同时写亮/暗**（用户心智是「选一个颜色」）；勾上「明暗分别设置」
 *   才并排亮/暗两块，各写各的方案。
 * - **E**：旋钮层在编辑器顶部（旋钮优先），原始令牌仍在下方「高级令牌」折叠区精调。
 *
 * 不夺权：旋钮写入的就是 token 覆盖，任何值都能在高级区继续改；若用户绕过旋钮手改了束内
 * 某个令牌，该旋钮标「束内已单独调整」，不做任何自动纠正。
 */
import * as React from 'react'
import type { TokenOverride } from '../core/schema.ts'
import { KNOBS, KNOB_CATEGORIES, knobCaution, knobValueForScheme, tokensToKnobValue, type KnobDef } from '../core/knobs.ts'
import { normalizeHex, extractAlpha, rgbaFromHex } from './color-utils.ts'
import { knobBundleDiverged, knobColorValue } from './knob-state.ts'
import { categoryLabel, knobLabel } from './i18n.ts'
import { useI18n } from './use-i18n.ts'

export interface KnobEditorProps {
  tokens: Record<string, TokenOverride>
  /** 旋钮写入（局部覆盖——分别设置模式只带一个方案键）。 */
  onKnobChange: (patch: Record<string, Partial<TokenOverride>>) => void
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  padding: '6px 8px',
  borderRadius: 8,
  border: '1px solid var(--dsw-alias-border-l2)',
  background: 'var(--dsw-alias-bg-layer-1)',
  minWidth: 0,
}

const nameStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-primary)' }
const descStyle: React.CSSProperties = { fontSize: 10, lineHeight: 1.4, color: 'var(--dsw-alias-label-tertiary, #999)' }
const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--ds-font-family-code)', fontSize: 11, padding: '3px 6px', borderRadius: 6,
  border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-base)',
  color: 'var(--dsw-alias-label-primary)', minWidth: 0,
}

/** 单个旋钮的控件（颜色 / 数字 / 下拉）。 */
function KnobControl(props: {
  knob: KnobDef
  tokens: Record<string, TokenOverride>
  dual: boolean
  onChange: (patch: Record<string, Partial<TokenOverride>>) => void
}): React.ReactElement {
  const { knob, tokens, dual, onChange } = props
  const { t } = useI18n()
  /** 本地化旋钮名（en 无映射时回退 core 中文名）。 */
  const knobName = knobLabel(knob.id, 'name') ?? knob.name

  if (knob.control === 'color') {
    const write = (scheme: 'light' | 'dark' | null, value: string): void => {
      onChange(knobValueForScheme(knob.id, value, scheme))
    }
    /** 取色器只给 #rrggbb：若当前值是 rgba()，保留其 alpha（详情同令牌行的既有语义）。 */
    const writePicked = (scheme: 'light' | 'dark', hex: string): void => {
      const current = knobColorValue(knob.id, tokens, scheme)
      const alpha = current !== null ? extractAlpha(current) : null
      write(dual ? scheme : null, alpha !== null ? rgbaFromHex(hex, alpha) : hex)
    }
    const cell = (scheme: 'light' | 'dark', label?: string): React.ReactElement => {
      const value = knobColorValue(knob.id, tokens, scheme)
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
          {label !== undefined && <span style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #999)' }}>{label}</span>}
          <input
            type="color"
            aria-label={`${knobName}${label !== undefined ? ` ${label}` : ''} ${t('knob.colorAria')}`}
            value={normalizeHex(value ?? '#000000')}
            onChange={e => { writePicked(scheme, e.target.value) }}
            style={{ width: 26, height: 22, padding: 0, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 5, background: 'transparent', cursor: 'pointer' }}
          />
          <input
            type="text"
            aria-label={`${knobName}${label !== undefined ? ` ${label}` : ''} ${t('knob.valueAria')}`}
            value={value ?? ''}
            placeholder={t('knob.varPlaceholder')}
            spellCheck={false}
            onChange={e => { write(dual ? scheme : null, e.target.value) }}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      )
    }
    return dual
      ? <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{cell('light', t('token.light'))}{cell('dark', t('token.dark'))}</div>
      : cell('light')
  }

  if (knob.control === 'number') {
    // 数字旋钮的读回走 core（会解析 var() 链并处理 fallback），再剥单位
    const raw = tokensToKnobValue(knob.id, tokens, 'light')
    const m = /-?\d+(?:\.\d+)?/.exec(String(raw))
    const parsed = m !== null ? Number(m[0]) : Number.NaN
    const read = Number.isFinite(parsed) ? parsed : (knob.min ?? 0)
    const commit = (n: number): void => {
      const clamped = Math.min(knob.max ?? n, Math.max(knob.min ?? n, n))
      onChange(knobValueForScheme(knob.id, `${clamped}${knob.unit ?? ''}`, null))
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="range"
          aria-label={`${knobName} ${t('knob.sliderAria')}`}
          min={knob.min ?? 0}
          max={knob.max ?? 100}
          step={knob.step ?? 1}
          value={read}
          onChange={e => { commit(Number(e.target.value)) }}
          style={{ flex: 1, minWidth: 80 }}
        />
        <input
          type="number"
          aria-label={`${knobName} ${t('knob.numberAria')}`}
          min={knob.min}
          max={knob.max}
          step={knob.step ?? 1}
          value={read}
          onChange={e => {
            const n = Number(e.target.value)
            if (Number.isFinite(n)) commit(n)
          }}
          style={{ ...inputStyle, width: 68 }}
        />
        {knob.unit !== undefined && <span style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #999)' }}>{knob.unit}</span>}
      </div>
    )
  }

  // select / font：档位读回（无匹配回退首档——与 core 的 tokensToKnobValue 语义一致）
  const current = tokensToKnobValue(knob.id, tokens, 'light')
  return (
    <select
      aria-label={`${knobName} ${t('knob.selectAria')}`}
      value={current}
      onChange={e => { onChange(knobValueForScheme(knob.id, e.target.value, null)) }}
      style={{ ...inputStyle, fontFamily: 'inherit', fontSize: 12 }}
    >
      {(knob.options ?? []).map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  )
}

/** 档位回读已由 core/tokensToKnobValue 覆盖（含 values 表反查与首档回退）。 */

export function KnobEditor(props: KnobEditorProps): React.ReactElement {
  const { tokens, onKnobChange } = props
  const { t } = useI18n()
  /** 决策 D：默认单值双写；勾选后颜色旋钮并排亮/暗。 */
  const [dual, setDual] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set())

  const toggleCategory = (id: string): void => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const divergedCount = KNOBS.filter(knob => knobBundleDiverged(knob.id, tokens)).length

  return (
    <div data-up-knobs style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)' }}>
          {t('knob.title')}<span style={{ fontWeight: 400, color: 'var(--dsw-alias-label-tertiary, #999)' }}>{t('knob.summary', { knobs: KNOBS.length, categories: KNOB_CATEGORIES.length })}</span>
        </span>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer' }}>
          <input
            type="checkbox"
            data-up-knob-dual
            checked={dual}
            onChange={e => { setDual(e.target.checked) }}
          />
          {t('knob.dual')}
        </label>
        {divergedCount > 0 && (
          <span data-up-knob-diverged-count style={{ fontSize: 10, color: 'var(--dsw-alias-state-warn-primary, #b7791f)' }}>
            {t('knob.divergedCount', { count: divergedCount })}
          </span>
        )}
      </div>
      <div style={descStyle}>
        {t('knob.intro')}
      </div>
      {KNOB_CATEGORIES.map(category => {
        const knobs = KNOBS.filter(knob => knob.category === category.id)
        if (knobs.length === 0) return null
        const isCollapsed = collapsed.has(category.id)
        return (
          <section key={category.id} data-up-knob-category={category.id}>
            <button
              type="button"
              data-up-knob-cat-head
              onClick={() => { toggleCategory(category.id) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '4px 0', border: 'none',
                borderBottom: '1px solid var(--dsw-alias-border-l2)', background: 'transparent', cursor: 'pointer',
                color: 'var(--dsw-alias-label-secondary)', fontSize: 12, fontWeight: 600,
              }}
            >
              <span>{isCollapsed ? '▸' : '▾'}</span>
              {categoryLabel(category.id, 'name') ?? category.name}
              <span style={{ fontWeight: 400, color: 'var(--dsw-alias-label-tertiary, #999)', fontSize: 10 }}>
                {categoryLabel(category.id, 'description') ?? category.description} · {knobs.length}
              </span>
            </button>
            {!isCollapsed && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 6, paddingTop: 6 }}>
                {knobs.map(knob => {
                  const diverged = knobBundleDiverged(knob.id, tokens)
                  return (
                    <div key={knob.id} data-up-knob={knob.id} style={{ ...rowStyle, borderColor: diverged ? 'var(--dsw-alias-state-warn-primary, #b7791f)' : 'var(--dsw-alias-border-l2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={nameStyle}>{knobLabel(knob.id, 'name') ?? knob.name}</span>
                        {knobCaution(knob.id) && (
                          <span data-up-knob-caution title={t('knob.caution')} style={{ fontSize: 10, color: 'var(--dsw-alias-state-warn-primary, #b7791f)' }}>{t('knob.caution')}</span>
                        )}
                        {diverged && (
                          <span data-up-knob-diverged title={t('knob.diverged')} style={{ fontSize: 10, color: 'var(--dsw-alias-state-warn-primary, #b7791f)' }}>{t('knob.diverged')}</span>
                        )}
                      </div>
                      <div style={descStyle}>{knobLabel(knob.id, 'description') ?? knob.description}</div>
                      <KnobControl knob={knob} tokens={tokens} dual={dual} onChange={onKnobChange} />
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
