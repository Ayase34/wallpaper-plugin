/**
 * 高级区两块「人可用的 DIY」面板（#74 曾以「AI 接管」为由删掉 UI，这里按需恢复，
 * 但只恢复**校验过、引擎原生支持**的部分——不引入第二套数据模型）。
 *
 * 1) CSS 补丁：schema 早就有 `css[]`（data-* 锚点白名单 + 禁花括号），引擎编译即注入；
 *    此前只有 AI 的 preset_create 能写，人想加一条 hover 描边必须开对话框求 AI。
 * 2) 主题注册：schema 有 `theme`，引擎有 theme.register 路径，StudioShell 也已渲染
 *    「切换到此主题」——缺的只是让用户打开开关的那一格。
 *
 * 两块面板都只改 EditorSession，走 onSessionChange → patchDraft，因此**即时预览**；
 * CSS 变更进撤销历史（与令牌编辑同粒度），主题开关不进（ThemeEditState 不在历史快照里，
 * 与旧实现一致，避免为一次开关改动 HistoryEntry 契约）。
 */
import * as React from 'react'
import type { CssRule } from '../core/schema.ts'
import { MAX_CSS_RULES_LENGTH, isAllowedCssSelector } from '../core/schema.ts'
import type { ThemeEditState } from './theme-editor.tsx'
import { t as tr } from './i18n.ts'
import { useI18n } from './use-i18n.ts'

const sectionStyle: React.CSSProperties = {
  borderTop: '1px solid var(--dsw-alias-border-l2)',
  paddingTop: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
}

const headStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--dsw-alias-label-secondary)',
  cursor: 'pointer',
  userSelect: 'none',
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--ds-font-family-code)',
  fontSize: 11,
  padding: '4px 6px',
  borderRadius: 6,
  border: '1px solid var(--dsw-alias-border-l2)',
  background: 'var(--dsw-alias-bg-layer-1)',
  color: 'var(--dsw-alias-label-primary)',
}

const hintStyle: React.CSSProperties = {
  fontSize: 10,
  color: 'var(--dsw-alias-label-tertiary, #999)',
  lineHeight: 1.5,
}

const errorStyle: React.CSSProperties = {
  fontSize: 10,
  color: 'var(--dsw-alias-state-error-primary, #d94c4c)',
}

/** 单条规则的错误（空 = 合法或尚未填写）。 */
function ruleError(rule: CssRule): string | null {
  if (rule.selector === '' && rule.rules === '') return null
  if (rule.selector === '') return tr('css.errEmpty')
  if (!isAllowedCssSelector(rule.selector)) return tr('css.errSelector')
  if (/[{}]/.test(rule.rules)) return tr('css.errBraces')
  if (rule.rules.length > MAX_CSS_RULES_LENGTH) return tr('css.errLength', { max: MAX_CSS_RULES_LENGTH })
  return null
}

export interface CssPatchPanelProps {
  css: CssRule[]
  onChange: (css: CssRule[]) => void
}

export function CssPatchPanel(props: CssPatchPanelProps): React.ReactElement {
  const { t } = useI18n()
  const [open, setOpen] = React.useState(false)
  const invalid = props.css.filter(rule => ruleError(rule) !== null).length

  const replace = (index: number, patch: Partial<CssRule>): void => {
    props.onChange(props.css.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)))
  }

  return (
    <div data-up-css-panel style={sectionStyle}>
      <div data-up-css-head style={headStyle} onClick={() => { setOpen(prev => !prev) }} role="button" tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(prev => !prev) } }}>
        <span>{open ? '▾' : '▸'}</span> {t('css.title')}
        <span style={{ fontWeight: 400, color: 'var(--dsw-alias-label-tertiary, #999)' }}>
          {t('css.count', { count: props.css.length })}{invalid > 0 ? t('css.invalid', { count: invalid }) : ''}
        </span>
      </div>
      {open && (
        <>
          <div style={hintStyle}>
            {t('css.hint')}
          </div>
          {props.css.map((rule, index) => {
            const error = ruleError(rule)
            return (
              <div key={index} data-up-css-row style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 6, borderRadius: 8, border: '1px solid var(--dsw-alias-border-l2)' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    aria-label={`CSS 选择器 ${index + 1}`}
                    placeholder="[data-up-card]"
                    value={rule.selector}
                    spellCheck={false}
                    onChange={e => { replace(index, { selector: e.target.value }) }}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    data-up-css-del
                    onClick={() => { props.onChange(props.css.filter((_, i) => i !== index)) }}
                    style={{ border: 'none', background: 'transparent', color: 'var(--dsw-alias-state-error-primary, #d94c4c)', fontSize: 11, cursor: 'pointer' }}
                  >
                    {t('css.delete')}
                  </button>
                </div>
                <textarea
                  aria-label={`CSS 声明 ${index + 1}`}
                  placeholder="border-color: var(--dsw-alias-brand-primary)"
                  value={rule.rules}
                  spellCheck={false}
                  rows={2}
                  onChange={e => { replace(index, { rules: e.target.value }) }}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                {error !== null && <div style={errorStyle}>{error}</div>}
              </div>
            )
          })}
          <button
            type="button"
            data-up-css-add
            onClick={() => { props.onChange([...props.css, { selector: '', rules: '' }]) }}
            style={{ alignSelf: 'flex-start', fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-primary)', cursor: 'pointer' }}
          >
            {t('css.add')}
          </button>
        </>
      )}
    </div>
  )
}

export interface ThemeRegisterPanelProps {
  theme: ThemeEditState
  presetId: string | null
  tokenCount: number
  onChange: (theme: ThemeEditState) => void
}

/** 原生主题注册：让预设出现在「设置 → 外观」的主题列表里（dream-skin 的结构性优势）。 */
export function ThemeRegisterPanel(props: ThemeRegisterPanelProps): React.ReactElement {
  const { t } = useI18n()
  const [open, setOpen] = React.useState(false)
  const themeId = `${props.presetId ?? 'preset'}-theme`
  const canEnable = props.tokenCount > 0

  return (
    <div data-up-theme-panel style={sectionStyle}>
      <div data-up-theme-head style={headStyle} onClick={() => { setOpen(prev => !prev) }} role="button" tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(prev => !prev) } }}>
        <span>{open ? '▾' : '▸'}</span> {t('theme.title')}
        <span style={{ fontWeight: 400, color: 'var(--dsw-alias-label-tertiary, #999)' }}>
          {props.theme.enabled ? t('theme.on', { scheme: props.theme.colorScheme }) : t('theme.off')}
        </span>
      </div>
      {open && (
        <>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input
              type="checkbox"
              data-up-theme-enable
              checked={props.theme.enabled}
              disabled={!canEnable}
              onChange={e => { props.onChange({ ...props.theme, enabled: e.target.checked }) }}
            />
            {t('theme.enable')}
          </label>
          {!canEnable && <div style={hintStyle}>{t('theme.needTokens')}</div>}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            {t('theme.scheme')}
            <select
              data-up-theme-scheme
              value={props.theme.colorScheme}
              onChange={e => { props.onChange({ ...props.theme, colorScheme: e.target.value === 'light' ? 'light' : 'dark' }) }}
              style={{ ...inputStyle, fontFamily: 'inherit' }}
            >
              <option value="dark">{t('theme.schemeDark')}</option>
              <option value="light">{t('theme.schemeLight')}</option>
            </select>
          </label>
          <div style={hintStyle}>
            {t('theme.hint', { id: themeId })}
          </div>
        </>
      )}
    </div>
  )
}
