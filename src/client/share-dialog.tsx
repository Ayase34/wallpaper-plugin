/**
 * 分享面板（导出 / 导入）。
 *
 * 为什么是「链接 + 分享码」两条腿：DSH 跑在本机（多为 127.0.0.1），直接把地址栏链接发给
 * 别人，对方打开只会到**自己的** DSH 或打不开；分享码是纯文本载荷，贴到任何一台机器都能导入。
 * 这是 dream-skin「分享链接」的可用性补丁，不是另起一套格式。
 */
import * as React from 'react'
import { decodeShare } from './share.ts'
import { useI18n } from './use-i18n.ts'

/** 复制到剪贴板（Electron/无权限环境回退 execCommand）。 */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch { /* 回退 */ }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.append(el)
    el.select()
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  } catch {
    return false
  }
}

function DialogShell(props: {
  label: string
  title: string
  children: React.ReactNode
  onClose: () => void
}): React.ReactElement {
  return (
    <div
      data-up-share-dialog
      role="dialog"
      aria-label={props.label}
      tabIndex={-1}
      onKeyDownCapture={e => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          props.onClose()
        }
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)', outline: 'none',
      }}
    >
      <div
        data-up-share-card
        style={{
          width: 'min(620px, calc(100vw - 48px))', maxHeight: 'calc(100vh - 48px)', overflow: 'auto',
          background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'var(--dsw-alias-label-primary, #111)',
          borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
          border: '1px solid var(--dsw-alias-border-l2, #ddd)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600 }}>{props.title}</div>
        {props.children}
      </div>
    </div>
  )
}

const fieldStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', fontSize: 11, fontFamily: 'var(--ds-font-family-code)',
  padding: '6px 8px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l2, #ddd)',
  background: 'var(--dsw-alias-bg-layer-2, #fff)', color: 'var(--dsw-alias-label-primary, #111)',
  wordBreak: 'break-all',
}

export interface ShareExportDialogProps {
  presetName: string
  link: string
  code: string
  chars: number
  omitted: number
  warn?: string
  onClose: () => void
}

/** 导出：链接（同机可用）+ 分享码（跨机器）+ 缺失素材提示。 */
export function ShareExportDialog(props: ShareExportDialogProps): React.ReactElement {
  const { t } = useI18n()
  const [copied, setCopied] = React.useState<'link' | 'code' | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const doCopy = async (kind: 'link' | 'code'): Promise<void> => {
    const ok = await copyText(kind === 'link' ? props.link : props.code)
    if (ok) {
      setCopied(kind)
      setError(null)
    } else {
      setError(t('share.copyFail'))
    }
  }

  return (
    <DialogShell label={t('wall.share')} title={t('share.exportTitle', { name: props.presetName })} onClose={props.onClose}>
      <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--dsw-alias-label-secondary, #666)' }}>
        {t('share.exportBody')}
        {props.omitted > 0 && (
          <span data-up-share-omitted style={{ color: 'var(--dsw-alias-state-warn-primary, #b7791f)' }}>
            {t('share.exportOmitted', { count: props.omitted })}
          </span>
        )}
        {props.warn !== undefined && <div style={{ marginTop: 4, color: 'var(--dsw-alias-state-warn-primary, #b7791f)' }}>{props.warn}</div>}
      </div>
      <label style={{ fontSize: 12, fontWeight: 600 }}>
        {t('share.linkLabel')}
        <input
          readOnly
          data-up-share-link
          value={props.link}
          onFocus={e => { e.currentTarget.select() }}
          style={fieldStyle}
        />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" data-up-btn onClick={() => { void doCopy('link') }}>{t('share.copyLink')}</button>
        <button type="button" data-up-btn onClick={() => { void doCopy('code') }}>{t('share.copyCode')}</button>
        <span data-up-status style={{ fontSize: 11 }}>
          {copied === 'link' ? t('share.copiedLink') : copied === 'code' ? t('share.copiedCode') : t('share.codeChars', { count: props.chars })}
        </span>
      </div>
      <label style={{ fontSize: 12, fontWeight: 600 }}>
        {t('share.codeLabel')}
        <textarea
          readOnly
          data-up-share-code
          rows={4}
          value={props.code}
          onFocus={e => { e.currentTarget.select() }}
          style={{ ...fieldStyle, resize: 'vertical' }}
        />
      </label>
      {error !== null && (
        <div data-up-status style={{ fontSize: 12, color: 'var(--dsw-alias-state-error-primary, #d94c4c)' }}>{error}</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" data-up-btn data-up-btn-primary onClick={props.onClose}>{t('share.close')}</button>
      </div>
    </DialogShell>
  )
}

export interface ShareImportDialogProps {
  onImport: (text: string) => void
  onClose: () => void
}

/** 导入：粘贴链接/分享码，就地校验并给出可读错误（不静默失败）。 */
export function ShareImportDialog(props: ShareImportDialogProps): React.ReactElement {
  const { t } = useI18n()
  const [text, setText] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const submit = (): void => {
    const decoded = decodeShare(text)
    if (!decoded.ok) {
      setError(decoded.error)
      return
    }
    setError(null)
    props.onImport(text)
  }

  return (
    <DialogShell label={t('share.importTitle')} title={t('share.importTitle')} onClose={props.onClose}>
      <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--dsw-alias-label-secondary, #666)' }}>
        {t('share.importBody')}
      </div>
      <textarea
        data-up-share-input
        rows={5}
        autoFocus
        placeholder={t('share.importPlaceholder')}
        value={text}
        onChange={e => { setText(e.target.value); setError(null) }}
        onKeyDown={e => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            submit()
          }
        }}
        style={{ ...fieldStyle, fontWeight: 400, resize: 'vertical' }}
      />
      {error !== null && (
        <div data-up-status style={{ fontSize: 12, color: 'var(--dsw-alias-state-error-primary, #d94c4c)' }}>{error}</div>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" data-up-btn onClick={props.onClose}>{t('share.cancel')}</button>
        <button type="button" data-up-btn data-up-btn-primary disabled={text.trim() === ''} onClick={submit}>{t('share.importAction')}</button>
      </div>
    </DialogShell>
  )
}
