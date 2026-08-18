/**
 * 应用内确认对话框（#58）：替代原生 window.confirm。
 * 背景：桌面端（Electron）的原生 confirm 对话框关闭后不恢复 webContents 键盘焦点——
 * 导致工作室命名框与主界面聊天框全部无法输入（用户实测反馈）。
 * 本组件：fixed 覆盖层 + 取消/确认按钮 + Esc 取消（capture 拦截，不连带关工作室）。
 */
import * as React from 'react'

export interface ConfirmDialogProps {
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog(props: ConfirmDialogProps): React.ReactElement {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    rootRef.current?.focus()
  }, [])
  return (
    <div
      ref={rootRef}
      data-up-confirm
      role="dialog"
      aria-label="确认"
      tabIndex={-1}
      onKeyDownCapture={e => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          props.onCancel()
        }
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)', outline: 'none',
      }}
    >
      <div
        style={{
          width: 'min(420px, calc(100vw - 48px))',
          background: 'var(--dsw-alias-bg-layer-1, #fff)', color: 'var(--dsw-alias-label-primary, #111)',
          borderRadius: 12, padding: 16, border: '1px solid var(--dsw-alias-border-l2, #ddd)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        <span style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{props.message}</span>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" data-up-btn onClick={props.onCancel}>取消</button>
          <button type="button" data-up-btn data-up-btn-primary onClick={props.onConfirm}>
            {props.confirmLabel ?? '确定'}
          </button>
        </div>
      </div>
    </div>
  )
}
