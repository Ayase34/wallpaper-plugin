/**
 * 轮换面板（壁纸 2.0 第二步）：每个图像部件一份本地配置，挂在部件行下面。
 *
 * 刻意与预设解耦：这里的东西**不进预设 JSON、不随分享走**（理由见 rotation.ts 头注释）。
 * 交互约定：
 * - 至少 2 条合法链接才能启用（1 条没有轮换意义，直接当静态链接更省心）；
 * - 保存即「立即到期」——下一次 30s tick 就换上第一条，不让用户等一个完整间隔；
 * - 「立即换下一张」只在当前活动预设 == 本预设时可用（否则改的是别的预设的活动层，容易误解）。
 */
import * as React from 'react'
import { getController } from './controller.ts'
import { useI18n } from './use-i18n.ts'
import { t as tr } from './i18n.ts'
import {
  ROTATION_INTERVALS,
  ROTATION_MAX_URLS,
  ROTATION_TICK_MS,
  createRotation,
  currentUrl,
  loadRotationStore,
  rotationKey,
  saveRotationStore,
  splitUrlLines,
  type RotationConfig,
} from './rotation.ts'

export interface RotationPanelProps {
  presetId: string
  widgetId: string
  /** 当前活动预设是否就是本预设（决定「立即换下一张」是否可用）。 */
  isActive: boolean
}

const labelStyle: React.CSSProperties = { fontSize: 11, color: 'var(--dsw-alias-label-tertiary, #999)' }
const inputStyle: React.CSSProperties = {
  fontSize: 11, padding: '3px 6px', borderRadius: 6,
  border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)',
  color: 'var(--dsw-alias-label-primary)',
}

/** 间隔 → 本地化文案（5 分钟 / 15 分钟 … / 1 天）。 */
function formatInterval(ms: number): string {
  if (ms < 3_600_000) return tr('rot.minutes', { count: Math.round(ms / 60_000) })
  if (ms < 86_400_000) return tr('rot.hours', { count: Math.round(ms / 3_600_000) })
  return tr('rot.days', { count: Math.round(ms / 86_400_000) })
}

export function RotationPanel(props: RotationPanelProps): React.ReactElement {
  const key = rotationKey(props.presetId, props.widgetId)
  const { t } = useI18n()
  const [open, setOpen] = React.useState(false)
  const [config, setConfig] = React.useState<RotationConfig | null>(() => loadRotationStore()[key] ?? null)
  const [text, setText] = React.useState<string>(() => (loadRotationStore()[key]?.urls ?? []).join('\n'))
  const [intervalMs, setIntervalMs] = React.useState<number>(() => loadRotationStore()[key]?.intervalMs ?? ROTATION_INTERVALS[2].value)
  const [message, setMessage] = React.useState<string | null>(null)
  const [rejected, setRejected] = React.useState(0)

  const save = (): void => {
    const parsed = splitUrlLines(text)
    setRejected(parsed.rejected)
    if (parsed.urls.length < 2) {
      const extra = parsed.rejected > 0 ? t('rot.rejectedExtra', { count: parsed.rejected }) : ''
      setMessage(t('rot.needTwo', { count: parsed.urls.length, extra }))
      return
    }
    const next = createRotation(parsed.urls, intervalMs, Date.now())
    if (next === null) {
      setMessage(t('rot.invalid'))
      return
    }
    const store = loadRotationStore()
    store[key] = next
    saveRotationStore(store)
    setConfig(next)
    setMessage(t('rot.enabled', {
      count: next.urls.length,
      minutes: Math.round(next.intervalMs / 60000),
      seconds: Math.round(ROTATION_TICK_MS / 1000),
    }))
  }

  const disable = (): void => {
    const store = loadRotationStore()
    delete store[key]
    saveRotationStore(store)
    setConfig(null)
    setMessage(t('rot.disabled'))
  }

  const rotateNow = async (): Promise<void> => {
    if (!props.isActive) {
      setMessage(t('rot.notActive'))
      return
    }
    const controller = getController()
    if (controller === null) return
    const ok = await controller.rotateWidgetNow(props.widgetId)
    if (ok) {
      const latest = loadRotationStore()[key]
      setConfig(latest ?? null)
      setMessage(t('rot.rotated'))
    } else {
      setMessage(t('rot.fail'))
    }
  }

  return (
    <div data-up-rotation style={{ marginTop: 2 }}>
      <button
        type="button"
        data-up-rotation-head
        onClick={() => { setOpen(prev => !prev) }}
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontSize: 11, color: 'var(--dsw-alias-label-secondary)' }}
      >
        {open ? '▾' : '▸'} {t('rot.title')}
        <span style={{ color: config !== null ? 'var(--dsw-alias-brand-primary, #4a7dff)' : 'var(--dsw-alias-label-tertiary, #999)', marginLeft: 6 }}>
          {config !== null ? t('rot.on', { count: config.urls.length, minutes: Math.round(config.intervalMs / 60000) }) : t('rot.off')}
        </span>
      </button>
      {open && (
        <div data-up-rotation-body style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4, paddingLeft: 8, borderLeft: '2px dashed var(--dsw-alias-border-l2)' }}>
          <div style={{ ...labelStyle, lineHeight: 1.5 }}>
            {t('rot.hint', { max: ROTATION_MAX_URLS })}
          </div>
          <textarea
            aria-label={`${props.widgetId} ${t('rot.linksAria')}`}
            rows={3}
            value={text}
            spellCheck={false}
            placeholder={'https://example.com/a.jpg\nhttps://example.com/b.jpg'}
            onChange={e => { setText(e.target.value); setMessage(null) }}
            style={{ ...inputStyle, width: 'min(520px, 100%)', resize: 'vertical', fontFamily: 'var(--ds-font-family-code)' }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, ...labelStyle }}>
              {t('rot.interval')}
              <select
                aria-label={`${props.widgetId} ${t('rot.intervalAria')}`}
                value={intervalMs}
                onChange={e => { setIntervalMs(Number(e.target.value)) }}
                style={inputStyle}
              >
                {ROTATION_INTERVALS.map(option => <option key={option.value} value={option.value}>{formatInterval(option.value)}</option>)}
              </select>
            </label>
            <button type="button" data-up-rotation-save onClick={save} style={{ ...inputStyle, cursor: 'pointer' }}>
              {config === null ? t('rot.saveNew') : t('rot.saveEdit')}
            </button>
            {config !== null && (
              <>
                <button type="button" data-up-rotation-now onClick={() => { void rotateNow() }} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {t('rot.now')}
                </button>
                <button type="button" data-up-rotation-off onClick={disable} style={{ ...inputStyle, cursor: 'pointer', color: 'var(--dsw-alias-state-error-primary, #d94c4c)' }}>
                  {t('rot.disable')}
                </button>
              </>
            )}
            {rejected > 0 && <span style={{ ...labelStyle, color: 'var(--dsw-alias-state-warn-primary, #b7791f)' }}>{t('rot.rejected', { count: rejected })}</span>}
          </div>
          {message !== null && <div data-up-rotation-msg style={{ ...labelStyle, lineHeight: 1.5 }}>{message}</div>}
        </div>
      )}
    </div>
  )
}
