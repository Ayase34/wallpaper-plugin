/**
 * 全屏工作室（M1 / #75 精简）：预设管理 + 编辑器 + 壁纸素材的两栏布局。
 * - 左栏：预设列表（应用/编辑/复制/删除/还原备份）+ 新建/从当前外观新建/导入
 * - 中栏：TokenEditor（原始令牌 + 分组染色 + 素材部件，#74 精简面）
 * - #75：右栏 mock 预览已移除（草稿本就全局生效——真实界面即预览；mock-preview 组件已删除）
 * hash 路由：命中 #studio=presets 渲染；卸载时清 hash（评审 P2-3 残留修复）。
 */
import * as React from 'react'
import type { Preset } from '../core/schema.ts'
import { getController } from './controller.ts'
import { closeStudio, isStudioHashActive } from './env.ts'
import { TokenEditor, type EditorSession } from './token-editor.tsx'
import { ConfirmDialog } from './confirm-dialog.tsx'
import { hasCapability } from './capabilities.ts'
import { DEMO_PRESETS } from './demo.ts'
import { computeChromePins, detectAppScheme } from './theme-pins.ts'

interface PresetMetaItem {
  id: string
  name: string
  edition: string
  builtin: boolean
  /** #62：backup.json 是否存在（决定「还原备份」按钮显隐）。 */
  hasBackup: boolean
}

/** 从编辑会话构建完整预设（新建时生成稳定 id；M2-2 携带 css；M2-4 携带主题注册）。 */
function buildPreset(session: EditorSession): Preset {
  const id = session.presetId ?? `preset-${Date.now().toString(36)}`
  const preset: Preset = {
    schemaVersion: 1,
    id,
    name: session.presetName.trim() !== '' ? session.presetName.trim() : id,
    edition: 'standard',
    tokens: session.tokens,
  }
  if (session.css.length > 0) preset.css = session.css
  // M2-4：注册为主题需有令牌（空主题与默认外观无异）
  if (session.theme.enabled && Object.keys(session.tokens).length > 0) {
    preset.theme = { id: `${id}-theme`, colorScheme: session.theme.colorScheme, tokens: session.tokens }
  }
  // M2-6：素材与注入部件
  if (session.assets.length > 0) preset.assets = session.assets
  if (session.widgets.length > 0) preset.widgets = session.widgets
  // #56：手设封面（引用预设内素材 + 3:1 裁剪矩形）
  if (session.cover !== undefined && session.cover !== null) preset.cover = session.cover
  // #74：用户分组（纯前端便捷层——extra 保留字段，zip 导出/导入天然携带）
  if (session.groups.length > 0) preset.extra = { ...(preset.extra ?? {}), groups: session.groups }
  return preset
}

/** 全局单例守卫（M1 修复：快捷行"管理"入口）。
 * StudioShell 可能被多个宿主同时挂载（设置快捷行 / 外观预设页）——只有第一个
 * 挂载的实例（primary）监听 hash 并渲染全屏层，其余实例 no-op；primary 卸载时
 * 清 hash 残留。零新依赖（react-dom portal 未在第三方插件运行时验证，不冒险）。 */
let mountCount = 0

/** 未保存会话暂存（评审 P1-5：关闭设置面板不丢草稿——重开工作室恢复继续编辑）。 */
let stashedSession: EditorSession | null = null

/** 全屏工作室主体。 */
export function StudioShell(): React.ReactElement | null {
  const [open, setOpen] = React.useState(isStudioHashActive())
  const isPrimary = React.useRef(false)
  const controller = getController()
  const [, force] = React.useState(0)

  React.useEffect(() => {
    mountCount += 1
    isPrimary.current = mountCount === 1
    if (!isPrimary.current) return () => { mountCount -= 1 }
    const onHash = (): void => { setOpen(isStudioHashActive()) }
    window.addEventListener('hashchange', onHash)
    // M4-2 键盘可操作：Esc 关闭工作室（仅 primary；对焦工作室时生效）
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return
      if (!isStudioHashActive()) return
      // review P3（全量评审）：输入焦点（文本框/文本域/搜索）下 Esc 先取消编辑（blur），
      // 不整层关闭工作室（原实现任意焦点下都关，编辑中误触即丢失上下文）。
      const target = e.target as HTMLElement | null
      if (target !== null && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        target.blur()
        return
      }
      closeStudio()
      // 焦点还给触发入口（设置按钮）——找不到则落到 body
      const trigger = document.querySelector('[data-up-section] button, [data-up-row] button') as HTMLElement | null
      trigger?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('keydown', onKeyDown)
      mountCount -= 1
      // 评审 P2-3：宿主卸载时清 hash 残留，避免重开设置自动弹工作室。
      if (isStudioHashActive()) closeStudio()
    }
  }, [])

  // 引擎状态订阅（草稿/活动变化 → 重渲染；仅 primary）
  React.useEffect(() => {
    if (!isPrimary.current) return
    return controller?.subscribeState(() => force(n => n + 1)) ?? (() => {})
  }, [controller])

  // ---- 编辑会话与预设列表 ----
  // 评审 P1-5：初始化时恢复暂存会话（重开工作室继续编辑未保存的草稿）。
  // review P3（全量评审）：暂存会话但引擎已无草稿（还原默认/清除活动 dispose 过）→ 丢弃
  // 过期暂存——否则重开工作室显示无草稿的旧会话，直接保存会把过期内容重新落盘。
  const [session, setSession] = React.useState<EditorSession | null>(() => {
    if (stashedSession !== null && controller?.engine.getState().hasDraft !== true) {
      stashedSession = null
      return null
    }
    return stashedSession
  })
  const [presets, setPresets] = React.useState<PresetMetaItem[]>([])
  // review P3：左栏加载完成标记——初始 [] 不显示"预设库为空"（原实现闪烁误导）。
  const [presetsLoaded, setPresetsLoaded] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [notice, setNotice] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  // 最新会话引用（卸载时暂存用）
  const sessionRef = React.useRef<EditorSession | null>(null)
  sessionRef.current = session
  // #58：应用内确认框状态（必须声明在早退 return 之前——否则关闭/打开切换时
  // 钩子数量变化 → React #310 崩溃，工作室整层渲染失败）。
  const [confirmBox, setConfirmBox] = React.useState<{ message: string; label?: string; action: () => void } | null>(null)

  // 修复轮 #20：chrome 钉定——工作室自身 UI 固定为「原貌」（活动层覆盖 + 目录默认解析的字面值），
  // 草稿全局生效只体现在预览窗口（预览面板的局部草稿变量优先级高于根钉定）。
  // #96：依赖活动编译令牌内容指纹（#63 同 id 内容更新路径不改变 activePresetId——
  // 旧 memo 只依赖 id，工作室内外配色会不一致）
  const activeTokensKey = JSON.stringify(controller?.engine.getActiveCompiled()?.tokens ?? null)
  const chromePins = React.useMemo(() => {
    try {
      return computeChromePins(controller?.engine.getActiveCompiled()?.tokens ?? null, detectAppScheme())
    } catch {
      return {}
    }
  }, [controller, activeTokensKey])

  // M2-4：活动预设是否携带主题注册（状态条「切换到此主题」入口的数据源）。
  const [activeThemeId, setActiveThemeId] = React.useState<string | null>(null)
  React.useEffect(() => {
    let cancelled = false
    const id = controller?.getState().activePresetId ?? null
    if (id === null) {
      setActiveThemeId(null)
      return undefined
    }
    void controller?.loadPreset(id).then(preset => {
      if (!cancelled) setActiveThemeId(preset?.theme?.id ?? null)
    })
    return () => { cancelled = true }
  }, [controller, controller?.getState().activePresetId])

  const refreshPresets = React.useCallback(async () => {
    const list = await controller?.listPresets() ?? []
    setPresets(list)
    setPresetsLoaded(true)
  }, [controller])

  React.useEffect(() => {
    void refreshPresets()
    // M5-2：跨窗口库变更广播 → 刷新左栏预设列表（其他窗口新建/删除/导入即时可见）。
    const unsubscribe = controller?.subscribeLibrary(() => { void refreshPresets() })
    return () => { unsubscribe?.() }
  }, [controller, refreshPresets])

  // 评审 P1-5：卸载（关闭设置面板）时暂存未保存会话（草稿层保留——所见即所得）。
  React.useEffect(() => {
    if (!isPrimary.current) return
    return () => {
      const s = sessionRef.current
      if (s !== null && controller?.engine.getState().hasDraft === true) {
        stashedSession = s
      }
    }
  }, [controller])

  if (!isPrimary.current || !open) return null

  const state = controller?.getState()

  /** 是否有未保存草稿（dirty 判定，评审 P1-3）。 */
  const hasUnsavedDraft = (): boolean => {
    return session !== null && controller?.engine.getState().hasDraft === true
  }
  /** #58：应用内确认框（替代原生 window.confirm——桌面端原生对话框丢键盘焦点，
   * 关闭后输入框全部无法输入）。无草稿时直接执行。 */
  const requestDiscard = (action: () => void): void => {
    if (!hasUnsavedDraft()) { action(); return }
    setConfirmBox({ message: '当前有未保存的改动，放弃并继续？', label: '放弃并继续', action })
  }
  const requestConfirm = (message: string, label: string, action: () => void): void => {
    setConfirmBox({ message, label, action })
  }

  const openEditor = async (id: string): Promise<void> => {
    requestDiscard(() => { void doOpenEditor(id) })
  }

  const doOpenEditor = async (id: string): Promise<void> => {
    setBusy(true)
    try {
      const preset = await controller?.loadPreset(id)
      if (preset === null) { setNotice(`预设 ${id} 不存在`); return }
      const next: EditorSession = {
        presetId: preset.id,
        presetName: preset.name,
        tokens: { ...preset.tokens },
        css: preset.css ?? [],
        theme: { enabled: preset.theme !== undefined, colorScheme: preset.theme?.colorScheme ?? 'dark' },
        assets: preset.assets ?? [],
        widgets: preset.widgets ?? [],
        cover: preset.cover,
        // #74：加载预设自带分组（extra.groups——用户自建组随预设走）
        groups: Array.isArray(preset.extra?.groups) ? preset.extra.groups as EditorSession['groups'] : [],
      }
      setSession(next)
      stashedSession = null
      controller?.engine.startDraft(preset)
      setNotice(null)
    } finally { setBusy(false) }
  }

  const startNew = (): void => {
    requestDiscard(() => {
      // 评审 P1-1：新建即分配固定 id（不再每次 buildPreset 生成新 id——避免草稿 id 抖动）。
      const id = `preset-${Date.now().toString(36)}`
      const next: EditorSession = { presetId: id, presetName: '新预设', tokens: {}, css: [], theme: { enabled: false, colorScheme: 'dark' }, assets: [], widgets: [], cover: undefined, groups: [] }
      setSession(next)
      stashedSession = null
      const empty: Preset = { schemaVersion: 1, id, name: '新预设', edition: 'standard', tokens: {} }
      controller?.engine.startDraft(empty)
      setNotice(null)
    })
  }

  const captureActive = (): void => {
    requestDiscard(() => {
      // 评审 P1-1：捕获即分配固定 id。
      const id = `preset-${Date.now().toString(36)}`
      const tokens = controller?.engine.getActiveCompiled()?.tokens ?? {}
      if (Object.keys(tokens).length === 0) {
        // 无活动预设 = 默认外观（零覆盖层）——捕获为空令牌草稿：
        // 应用即原版外观，编辑时改什么就叠加什么（M1 修复：不再误报"无活动预设"）。
        const next: EditorSession = { presetId: id, presetName: '从默认外观新建', tokens: {}, css: [], theme: { enabled: false, colorScheme: 'dark' }, assets: [], widgets: [], cover: undefined, groups: [] }
        setSession(next)
        stashedSession = null
        const empty: Preset = { schemaVersion: 1, id, name: '从默认外观新建', edition: 'standard', tokens: {} }
        controller?.engine.startDraft(empty)
        setNotice('已从默认外观创建（当前无活动预设，将使用系统默认样式）')
        return
      }
      const next: EditorSession = { presetId: id, presetName: '从当前外观新建', tokens: { ...tokens }, css: [], theme: { enabled: false, colorScheme: 'dark' }, assets: [], widgets: [], cover: undefined, groups: [] }
      setSession(next)
      stashedSession = null
      controller?.engine.startDraft(buildPreset(next))
      setNotice(null)
    })
  }

  const onSessionChange = (next: EditorSession, changedNames: string[]): void => {
    setSession(next)
    const preset = buildPreset(next)
    if (changedNames.length === 0) {
      // 仅改名：更新草稿基线（name 不入 tokens）
      if (controller?.engine.getState().hasDraft === true) {
        controller.engine.patchDraft(preset)
      }
      return
    }
    controller?.engine.patchDraft(preset)
  }

  const save = async (): Promise<void> => {
    if (session === null) { setNotice('没有正在编辑的预设'); return }
    setBusy(true)
    try {
      // 评审 UX：内置预设强制另存（不允许覆盖出厂预设）——生成新 id 并提示。
      const isBuiltin = DEMO_PRESETS.some(p => p.id === session.presetId)
      let workingSession = session
      if (isBuiltin && session.presetId !== null) {
        const newId = `${session.presetId}-custom`
        workingSession = { ...session, presetId: newId, presetName: `${session.presetName}（自定义）` }
        setSession(workingSession)
      }
      const preset = buildPreset(workingSession)
      // 新建会话现在有固定 id——备份判定由 savePreset 内部按"库中是否存在"决定。
      const ok = await controller?.savePreset(preset) ?? false
      if (ok) {
        // review P2-3（全量评审）：保存用合并式更新——PUT 期间用户继续编辑的输入
        // （onSessionChange 已更新 session）不被保存快照顶回（原实现 setSession 无条件覆盖，
        // 编辑内容回跳丢失）。仅回写 presetId（另存为时）。
        setSession(prev => {
          if (prev === null) return { ...workingSession, presetId: preset.id }
          const merged = { ...prev }
          // 另存为时把临时/旧 id 同步为落盘 id（保留用户已输入的其余字段）
          if (prev.presetId !== preset.id) merged.presetId = preset.id
          return merged
        })
        stashedSession = null
        const name = preset.name
        setNotice(isBuiltin ? `内置预设已另存为「${name}」` : `已保存「${name}」`)
        await refreshPresets()
      } else {
        setNotice(controller?.engine.getState().lastError ?? '保存失败')
      }
    } finally { setBusy(false) }
  }

  const discard = (): void => {
    requestDiscard(() => {
      controller?.engine.discardDraft()
      setSession(null)
      stashedSession = null
      setNotice('已放弃未保存的改动')
    })
  }

  const duplicate = async (id: string): Promise<void> => {
    setBusy(true)
    try {
      const preset = await controller?.loadPreset(id)
      if (preset === null) { setNotice(`预设 ${id} 不存在`); return }
      // 评审 P2-6：副本 id 冲突时加时间戳后缀（不覆盖已有副本）。
      let copyId = `${id}-copy`
      const existing = await controller?.listPresets() ?? []
      if (existing.some(p => p.id === copyId)) copyId = `${id}-copy-${Date.now().toString(36)}`
      const copy: Preset = { ...preset, id: copyId, name: `${preset.name}（副本）` }
      const ok = await controller?.savePreset(copy, { activate: false }) ?? false
      if (ok) {
        setNotice(`已复制为「${copy.name}」`)
        await refreshPresets()
      } else {
        setNotice('复制失败')
      }
    } finally { setBusy(false) }
  }

  const remove = async (id: string): Promise<void> => {
    // review P2-2（全量评审）：删除永久性（含 backup.json，Node 不走回收站）——加确认。
    // #58：全部用应用内确认框（原生 confirm 桌面端丢键盘焦点）。
    const doRemove = async (): Promise<void> => {
      const ok = await controller?.deletePreset(id) ?? false
      if (ok) {
        setNotice(`已删除 ${id}`)
        if (session?.presetId === id) {
          setSession(null)
          stashedSession = null
          controller?.engine.discardDraft()
          // review P2-2：删除活动预设后外观被还原——说明原因。
          setNotice(`已删除 ${id}（外观已还原默认）`)
        }
        await refreshPresets()
      } else {
        setNotice('删除失败')
      }
    }
    if (session?.presetId === id && hasUnsavedDraft()) {
      setConfirmBox({
        message: '当前有未保存的改动，放弃并继续？',
        label: '放弃并继续',
        action: () => { requestConfirm(`删除预设「${id}」？此操作不可恢复。`, '删除', () => { void doRemove() }) },
      })
    } else {
      requestConfirm(`删除预设「${id}」？此操作不可恢复。`, '删除', () => { void doRemove() })
    }
  }

  /** #62 备份还原入口：用 backup.json 交换式还原（当前版本自动存入备份，可再还原回去；
   * 纯库操作不自动应用——用户拍板）。编辑同一预设且有未保存草稿 → 先确认放弃。 */
  const restoreBackup = (id: string): void => {
    const name = presets.find(p => p.id === id)?.name ?? id
    const doRestore = async (): Promise<void> => {
      setBusy(true)
      try {
        const result = await controller?.restoreBackup(id)
        if (result?.ok === true) {
          setNotice(`已还原备份「${name}」（还原前版本已存入备份，未自动应用）`)
          await refreshPresets()
        } else {
          setNotice(result?.error ?? '还原备份失败')
        }
      } finally { setBusy(false) }
    }
    const confirmRestore = (): void => {
      requestConfirm(
        `用备份还原预设「${name}」？当前版本将存入备份（备份仅保留一层，可再还原回去），还原不自动应用。`,
        '还原备份',
        () => { void doRestore() },
      )
    }
    if (session?.presetId === id && hasUnsavedDraft()) {
      setConfirmBox({
        message: '当前有未保存的改动，放弃并继续？',
        label: '放弃并继续',
        action: confirmRestore,
      })
    } else {
      confirmRestore()
    }
  }

  const importFile = async (file: File | undefined): Promise<void> => {
    if (file === undefined) return
    const result = await controller?.importPresetFile(file)
    if (result?.ok === true) {
      setNotice(`已导入 ${result.id}`)
      await refreshPresets()
    } else {
      setNotice(result?.error ?? '导入失败')
    }
  }

  /** M2-5：导出 zip 三件套（preset.json + cover.svg + manifest.json；#93 默认名 = 预设名）。
   * JSON 导出已移除（用户拍板只留 zip）。 */
  const exportZipCurrent = async (): Promise<void> => {
    if (session !== null) {
      const ok = await controller?.exportZipFile(buildPreset(session)) ?? false
      if (ok) setNotice('已导出 ZIP 三件套（含封面）')
    } else if (state?.activePresetId !== null && state?.activePresetId !== undefined) {
      const preset = await controller?.loadPreset(state.activePresetId)
      if (preset !== null) {
        const ok = await controller?.exportZipFile(preset) ?? false
        if (ok) setNotice('已导出 ZIP 三件套（含封面）')
      } else {
        setNotice('活动预设不存在，无法导出')
      }
    } else {
      setNotice('没有可导出的预设')
    }
  }

  const applyPreset = (id: string): void => {
    // review P2-4（全量评审）：编辑中应用其他预设会被草稿遮蔽且保存时静默覆盖——
    // 有未保存草稿时先确认（放弃草稿再应用，与 openEditor 同款 dirty 语义）。
    // #58：应用内确认框（原生 confirm 桌面端丢键盘焦点）。
    const doApply = async (): Promise<void> => {
      // 评审 P2-2：应用失败必须给反馈（损坏文件/版本契约拒绝等）。
      const ok = await controller?.applyPresetById(id) ?? false
      setNotice(ok ? null : `应用「${id}」失败：${controller?.engine.getState().lastError ?? '预设不存在或已损坏'}`)
    }
    if (session !== null && controller?.engine.getState().hasDraft === true) {
      setConfirmBox({
        message: '当前有未保存的编辑草稿（会遮蔽外观预览）。放弃草稿并应用所选预设？',
        label: '放弃并应用',
        action: () => {
          controller?.engine.discardDraft()
          setSession(null)
          stashedSession = null
          void doApply()
        },
      })
    } else {
      void doApply()
    }
  }

  const activeId = state?.activePresetId
  // 评审 UX：活动标签用预设名（name）而非 id——从列表查名，找不到回退 id。
  const activeName = activeId !== null && activeId !== undefined
    ? (presets.find(p => p.id === activeId)?.name ?? activeId)
    : null

  return (
    <div
      data-up-studio
      // M4-2 键盘可操作：根元素捕获 Esc（任意内部焦点都响应）。
      // #96（审计）：输入焦点下先 blur 不关层（原 review P3 守卫挂在 window 冒泡——
      // 根捕获先执行且无焦点判断，P3 守卫实际是死代码；编辑中误触 Esc 即丢上下文）
      onKeyDownCapture={e => {
        if (e.key !== 'Escape') return
        const target = e.target as HTMLElement | null
        if (target !== null && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          target.blur()
          return
        }
        closeStudio()
        const trigger = document.querySelector('[data-up-section] button, [data-up-row] button') as HTMLElement | null
        trigger?.focus()
      }}
      ref={el => {
        if (el !== null && document.activeElement === document.body) {
          (el.querySelector('[data-up-studio-bar] button') as HTMLElement | null)?.focus()
        }
      }}
      style={Object.keys(chromePins).length > 0 ? (chromePins as React.CSSProperties) : undefined}
    >
      <div data-up-studio-bar>
        <button type="button" data-up-btn onClick={() => { closeStudio() }}>‹ 返回</button>
        <div data-up-studio-title>外观预设工作室</div>
        <span data-up-status style={{ marginRight: 'auto' }}>{activeName !== null ? `活动：${activeName}` : '无活动预设'}</span>
        {/* #93：只保留 ZIP 导出（用户拍板：其他格式不要了） */}
        <button type="button" data-up-btn onClick={() => { void exportZipCurrent() }}>导出 ZIP</button>
        <button type="button" data-up-btn onClick={discard} disabled={session === null || busy}>放弃</button>
        <button type="button" data-up-btn data-up-btn-primary onClick={() => { void save() }} disabled={session === null || busy}>保存</button>
      </div>
      <div data-up-studio-body style={{ display: 'flex', gap: 16, padding: 16, flex: 1, overflow: 'hidden' }}>
        {/* 左栏：预设列表（M4-3 窄屏响应式规则见共享 CSS：<900px 纵向堆叠） */}
        <aside style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button type="button" data-up-btn onClick={startNew} disabled={busy}>新建</button>
            <button type="button" data-up-btn onClick={captureActive} disabled={busy}>从当前外观新建</button>
            <button type="button" data-up-btn onClick={() => { fileInputRef.current?.click() }} disabled={busy}>导入</button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              style={{ display: 'none' }}
              onChange={e => { void importFile(e.target.files?.[0]); e.target.value = '' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {presets.map(item => (
              <div key={item.id} data-up-card style={{ padding: 10, gap: 4 }}>
                <div data-up-card-title style={{ fontSize: 13 }}>{item.name}</div>
                <div data-up-card-desc>{item.id}{item.builtin ? ' · 内置' : ''}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <button type="button" data-up-btn style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => { void applyPreset(item.id) }} disabled={busy}>应用</button>
                  <button type="button" data-up-btn style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => { void openEditor(item.id) }} disabled={busy}>编辑</button>
                  <button type="button" data-up-btn style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => { void duplicate(item.id) }} disabled={busy || item.builtin}>复制</button>
                  <button type="button" data-up-btn style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => { void remove(item.id) }} disabled={busy || item.builtin}>删除</button>
                  {/* #62 备份还原入口：仅存在 backup.json 时显示（交换式还原，不自动应用） */}
                  {item.hasBackup && (
                    <button type="button" data-up-btn data-up-restore-btn style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => { restoreBackup(item.id) }} disabled={busy}>还原备份</button>
                  )}
                </div>
              </div>
            ))}
            {presetsLoaded && presets.length === 0 && <div data-up-status>预设库为空——新建或导入一个预设开始。</div>}
          </div>
        </aside>
        {/* 中栏：编辑器（修复轮 #30：整体可滚——overflow auto + minHeight 0，
            否则旋钮层等超高内容无滚动容器，滚轮无效且被裁切） */}
        <main
          data-up-editor-col
          style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}
        >
          {/* review P3：简洁版死分支已删——决策 #43 后固定 standard 掩码，分支不可达 */}
          {/* 评审 P1-4：TokenEditor 按预设 id 加 key——切换编辑目标时重置撤销历史，
              防止 A 的历史污染 B（跨会话撤销泄漏）。 */}
          {hasCapability('knobs') && session !== null && (
            <TokenEditor key={session.presetId ?? 'new'} session={session} onSessionChange={onSessionChange} />
          )}
          {hasCapability('knobs') && session === null && (
            <div data-up-wall style={{ justifyContent: 'center', height: '100%' }}>
              <div data-up-status>从左侧选择一个预设「编辑」，或「新建」开始创作。</div>
            </div>
          )}
        </main>
      </div>
      {/* 状态条（评审 P0-1：常驻，永不消失） */}
      <div data-up-studio-status style={{ padding: '8px 16px', borderTop: '1px solid var(--dsw-alias-border-l2)', fontSize: 12, color: 'var(--dsw-alias-label-tertiary, #999)', display: 'flex', gap: 12, alignItems: 'center' }}>
        {state?.hasDraft === true
          ? <span style={{ color: 'var(--dsw-alias-state-warn-primary, #b7791f)' }}>● 预览中（未保存）</span>
          : <span>已保存</span>}
        {/* M2-4：活动预设携带主题 → 已注册 + 选择入口 */}
        {activeThemeId !== null && (
          <span data-up-theme-row style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            主题「{activeThemeId}」已注册
            <button
              type="button"
              data-up-btn
              style={{ padding: '2px 10px', fontSize: 11 }}
              onClick={() => {
                const result = controller?.selectTheme(activeThemeId)
                if (result?.ok === true) setNotice(`已切换到主题「${activeThemeId}」`)
              }}
            >
              切换到此主题
            </button>
          </span>
        )}
        <span>{notice ?? ''}</span>
        {state?.lastError !== null && state?.lastError !== undefined && <span data-up-error>{state.lastError}</span>}
      </div>
      {/* #58：应用内确认框（替代原生 confirm——桌面端原生对话框丢键盘焦点） */}
      {confirmBox !== null && (
        <ConfirmDialog
          message={confirmBox.message}
          confirmLabel={confirmBox.label}
          onConfirm={() => {
            const action = confirmBox.action
            setConfirmBox(null)
            action()
          }}
          onCancel={() => { setConfirmBox(null) }}
        />
      )}
    </div>
  )
}
