/**
 * i18n 的 React 桥：语言切换后触发重渲染。
 * 单独成文件是为了让 i18n.ts 保持「零 React 依赖」——node 单测直接 import 它。
 */
import * as React from 'react'
import { getLocale, setLocale, subscribeLocale, t, type Locale, type MessageKey, type MessageParams } from './i18n.ts'

export interface I18n {
  locale: Locale
  t: (key: MessageKey, params?: MessageParams) => string
  setLocale: (locale: Locale) => void
  toggle: () => void
}

export function useI18n(): I18n {
  const [locale, setLocaleState] = React.useState<Locale>(() => getLocale())
  React.useEffect(() => {
    // 订阅后重新读一次：effect 执行前可能已被别处切换（避免旧值卡死）
    setLocaleState(getLocale())
    return subscribeLocale(() => { setLocaleState(getLocale()) })
  }, [])
  const toggle = React.useCallback(() => {
    setLocale(getLocale() === 'zh' ? 'en' : 'zh')
  }, [])
  return { locale, t, setLocale, toggle }
}
