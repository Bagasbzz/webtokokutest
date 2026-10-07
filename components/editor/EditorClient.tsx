'use client'

/**
 * EditorClient - Dashboard Form Editor Orchestrator (STEP 3D, 4B, 4C)
 *
 * Orchestrator murni. Field rendering didelegasikan ke:
 *   - SectionSidebar  -> navigasi section
 *   - EditorSection   -> wrapper section + list field
 *   - FieldRenderer   -> render per field berdasarkan type
 *
 * Validation via lib/editor-validation.ts
 * Live preview via iframe + postMessage ke /dashboard/editor/preview
 * Asset management: tracks replaced images and cleans up on successful save.
 * Publish workflow: Save Draft vs Publish Live.
 * Revision History: listing and restoring previous versions to draft.
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { 
  Pencil, Clock, Undo2, Redo2, Monitor, Smartphone, 
  ExternalLink, BookmarkCheck, SendHorizontal, 
  RefreshCw, CheckCircle2, AlertTriangle, WifiOff,
  Type, ChevronRight, Sparkles, ScanEye, X, Check,
  PanelLeftClose, PanelLeftOpen, MousePointer2
} from 'lucide-react'
import { validateAll } from '@/lib/editor-validation'
import { saveDraft, loadDraft, clearDraft, getDraftAge } from '@/lib/editor-draft'
import { deleteAssetByUrl } from '@/lib/editor-upload'
import { restoreRevisionToDraft } from '@/lib/revisions'
import { useEditorHistory } from '@/hooks/useEditorHistory'
import type { EditableElement } from '@/lib/template-editables'
import { SectionSidebar } from './SectionSidebar'
import dynamic from 'next/dynamic'
import { EditorSection } from './EditorSection'
import { PreviewFrame } from './PreviewFrame'
import { EditorErrorBoundary } from './EditorErrorBoundary'

const RevisionPanel = dynamic(
  () => import('./RevisionPanel').then((mod) => mod.RevisionPanel),
  { ssr: false }
)
import { CommandPalette } from './CommandPalette'
import { registerEditorLogger } from '@/lib/editor-logger'
import type { PreviewFrameHandle } from './PreviewFrame'


interface EditorClientProps {
  storeId: string
  storeSlug: string
  templateId: string
  schema: EditableElement[]
  savedCustomizations: Record<string, string>
}

export const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero / Banner',
  topbar: 'Topbar',
  menu: 'Katalog Menu',
  catalog: 'Katalog Produk',
  promo: 'Promo',
  promo_banner: 'Banner Promo',
  outlet: 'Outlet / Kontak',
  trust: 'Trust Badges',
  banner: 'Banner Info',
  routine: 'Informasi',
  reviews: 'Ulasan',
  gallery: 'Galeri',
  docs: 'Dokumentasi',
  location: 'Map / Lokasi',
  contact: 'Kontak Cepat',
  social: 'Sosial Media',
  faq: 'Pertanyaan Umum',
  features: 'Keunggulan',
  consult: 'Konsultasi',
  marquee: 'Teks Berjalan',
  values: 'Nilai Kami',
  cta: 'Call-to-Action',
  split: 'Detail Produk',
  masterpiece: 'Tentang Koleksi',
  footer: 'Footer',
}

function groupBySection(schema: EditableElement[]): Record<string, EditableElement[]> {
  return schema.reduce((acc, field) => {
    if (!acc[field.section]) acc[field.section] = []
    acc[field.section].push(field)
    return acc
  }, {} as Record<string, EditableElement[]>)
}

export function EditorClient({
  storeId,
  storeSlug,
  templateId,
  schema,
  savedCustomizations,
}: EditorClientProps) {
  // formData is the single source of truth for draft edits. Sidebar fields,
  // iframe preview updates, quick edit, undo/redo, and publish all flow through it.
  const { 
    state: formData, 
    setPresent: setFormData, 
    undo, 
    redo, 
    commit: commitHistory, 
    reset: resetHistory,
    canUndo, 
    canRedo 
  } = useEditorHistory<Record<string, string>>(savedCustomizations)

  const [lastSaved, setLastSaved] = useState<Record<string, string>>(savedCustomizations)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeSection, setActiveSection] = useState<string>(() => {
    const secs = Array.from(new Set(schema.map(f => f.section)))
    return secs[0] || ''
  })
  
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop')
  const [isFormPanelOpen, setIsFormPanelOpen] = useState(true)
  const [draftBanner, setDraftBanner] = useState<{ age: string; data: any } | null>(null)
  
  const [isRevisionOpen, setIsRevisionOpen] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null)

  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null)

  const [replacedAssets, setReplacedAssets] = useState<string[]>([])

  const [messageId, setMessageId] = useState(0)
  const [ackedId, setAckedId] = useState(0)
  const messageIdRef = useRef(0)

  type SaveStatus = 'idle' | 'typing' | 'saving' | 'saved' | 'error' | 'offline' | 'autosaved'
  const [status, setStatus] = useState<SaveStatus>('idle')
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [sidebarSearch, setSidebarSearch] = useState('')

  const previewRef = useRef<PreviewFrameHandle>(null)
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastPostedPreviewRef = useRef('')
  // formDataRef menjaga agar callback async (termasuk listener PREVIEW_READY)
  // selalu membaca nilai formData terbaru, bukan nilai yang tertangkap saat closure dibuat.
  const formDataRef = useRef<Record<string, string>>(savedCustomizations)

  const grouped = useMemo(() => groupBySection(schema), [schema])
  const sections = useMemo(() => Array.from(new Set(schema.map(f => f.section))), [schema])
  const editorValues = useMemo(() => {
    const defaults = Object.fromEntries(
      schema.map(field => [`${field.section}.${field.element}`, field.default_value ?? ''])
    )
    return { ...defaults, ...formData }
  }, [schema, formData])

  const commands = useMemo(() => [
    { id: 'save', label: 'Save Draft', icon: <BookmarkCheck size={14} />, action: handleSave },
    { id: 'publish', label: 'Publish to Live', icon: <SendHorizontal size={14} />, action: handlePublish },
    { id: 'undo', label: 'Undo', icon: <Undo2 size={14} />, action: undo },
    { id: 'redo', label: 'Redo', icon: <Redo2 size={14} />, action: redo },
    { id: 'desktop', label: 'Desktop Preview', icon: <Monitor size={14} />, action: () => setDeviceMode('desktop') },
    { id: 'mobile', label: 'Mobile Preview', icon: <Smartphone size={14} />, action: () => setDeviceMode('mobile') },
    { id: 'history', label: 'View History', icon: <Clock size={14} />, action: () => setIsRevisionOpen(true) },
    { id: 'restore-draft', label: 'Restore Last Draft', icon: <RefreshCw size={14} />, action: handleRestoreDraft },
    ...sections.map(s => ({
      id: `go-${s}`,
      label: `Go to ${SECTION_LABELS[s] || s}`,
      icon: <ChevronRight size={14} />,
      action: () => setActiveSection(s)
    }))
  ], [sections, handleSave, handlePublish, undo, redo, handleRestoreDraft])

  const handleElementSelect = useCallback((key: string) => {
    setSelectedKey(key)
    
    // Parse section from key (e.g., "hero.title" -> "hero")
    const section = key.split('.')[0]
    if (sections.includes(section)) {
      setActiveSection(section)
    }

    // Set temporary highlight
    setHighlightedKey(key)
    setTimeout(() => setHighlightedKey(null), 1500)
  }, [sections])

  // Quick edit from overlay - delegates to same handleChange as the sidebar form
  const handleQuickEdit = (key: string, value: string) => {
    handleChange(key, value)
    // Also sync sidebar selection so user can see which field was updated
    handleElementSelect(key)
  }

  // Image replace from overlay - opens sidebar to the image field
  const handleImageReplace = (key: string) => {
    handleElementSelect(key)
    // Sidebar will scroll to the image field; user can upload there
    setToast({ type: 'success', msg: `Ganti gambar: pilih field "${key.split('.').pop()}" di sidebar.` })
    setTimeout(() => setToast(null), 3500)
  }

  // Section hide from inline toolbar
  const handleSectionHide = (sectionId: string) => {
    const visKey = `${sectionId}.visible`
    handleChange(visKey, 'false')
    setToast({ type: 'success', msg: `Section "${sectionId}" disembunyikan.` })
    setTimeout(() => setToast(null), 2500)
  }

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(lastSaved)
  }, [formData, lastSaved])

  // Register logger so EditorErrorBoundary class can emit errors
  // without a circular import dependency
  useEffect(() => {
    registerEditorLogger()
    
    // Offline detection
    const handleOnline = () => setStatus(isDirty ? 'idle' : 'saved')
    const handleOffline = () => setStatus('offline')
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    if (!navigator.onLine) setStatus('offline')
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isDirty])

  // Sinkronisasi formDataRef setiap kali formData berubah agar listener message
  // selalu memiliki referensi ke draf terkini.
  useEffect(() => {
    formDataRef.current = formData
  }, [formData])

  // Handle messages from preview iframe (ACKs + PREVIEW_READY)
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return

      if (event.data?.type === 'PREVIEW_ACK') {
        setAckedId(event.data.messageId)
      }

      // Ketika iframe pratinjau selesai dimuat (mount pertama atau reload akibat
      // pergantian mode desktop/mobile), ia mengirim sinyal PREVIEW_READY.
      // Kita langsung balas dengan data draf terkini agar tampilan selalu sinkron
      // tanpa perlu user mengetik ulang atau reload halaman editor.
      if (event.data?.type === 'PREVIEW_READY') {
        const iframe = previewRef.current?.getIframe()
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: 'PREVIEW_UPDATE',
              customizations: formDataRef.current,
              messageId: -1, // sinyal inisialisasi, tidak perlu ACK tracking
            },
            window.location.origin
          )
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmd = isMac ? e.metaKey : e.ctrlKey
      const shift = e.shiftKey

      if (cmd && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (shift) redo()
        else undo()
      } else if (cmd && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      } else if (cmd && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      } else if (cmd && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (isDirty) handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, handleSave, isDirty])

  // Post message whenever formData changes (including from undo/redo)
  useEffect(() => {
    const serialized = JSON.stringify(formData)
    if (serialized !== lastPostedPreviewRef.current) {
      postMessageToPreview(formData)
    }
  }, [formData])

  // Handle browser close/refresh warning
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft(storeId)
    if (draft && JSON.stringify(draft) !== JSON.stringify(savedCustomizations)) {
      setDraftBanner({ data: draft, age: getDraftAge(storeId) || 'beberapa saat lalu' })
    }
  }, [storeId, savedCustomizations])

  function postMessageToPreview(data: Record<string, string>) {
    lastPostedPreviewRef.current = JSON.stringify(data)
    const nextId = messageIdRef.current + 1
    messageIdRef.current = nextId
    setMessageId(nextId)

    const iframe = previewRef.current?.getIframe()
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { 
          type: 'PREVIEW_UPDATE', 
          customizations: data,
          messageId: nextId 
        },
        window.location.origin
      )
    }
  }

  function handleChange(key: string, value: string) {
    // Image URLs replaced from editor storage are tracked so successful saves can
    // clean up orphaned assets later.
    const current = formDataRef.current
    const oldValue = current[key]
    if (oldValue && oldValue !== value && oldValue.includes('product-images/')) {
      setReplacedAssets(prev => Array.from(new Set([...prev, oldValue])))
    }

    const next = { ...current, [key]: value }
    formDataRef.current = next
    setFormData(next) // Immediate UI update
    postMessageToPreview(next)
    
    if (errors[key]) {
      setErrors(prev => { const e = { ...prev }; delete e[key]; return e })
    }

    // Update status to typing
    if (navigator.onLine) {
      setStatus('typing')
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
      statusTimerRef.current = setTimeout(() => setStatus('idle'), 2000)
    }

    // Debounced history commit
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current)
    historyTimerRef.current = setTimeout(() => {
      commitHistory(next)
    }, 800)

    // Debounced draft save
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    draftTimerRef.current = setTimeout(() => {
      saveDraft(storeId, next)
      if (navigator.onLine && status !== 'saving') {
        setStatus('autosaved')
        if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
        statusTimerRef.current = setTimeout(() => setStatus('idle'), 2500)
      }
    }, 1500)
  }

  function handleRestoreDraft() {
    if (draftBanner) {
      setFormData(draftBanner.data)
      resetHistory(draftBanner.data)
      postMessageToPreview(draftBanner.data)
      setDraftBanner(null)
    }
  }

  function handleIgnoreDraft() {
    clearDraft(storeId)
    setDraftBanner(null)
  }

  async function handleSave() {
    // Save only writes draft rows. Public storefront reads published rows until
    // the seller explicitly clicks Publish.
    const dataToSave = formDataRef.current
    const validationErrors = validateAll(schema, dataToSave)
    if (validationErrors.length > 0) {
      const errorMap = Object.fromEntries(validationErrors.map(e => [e.key, e.message]))
      setErrors(errorMap)
      setToast({ type: 'error', msg: `${validationErrors.length} field memiliki error.` })
      setTimeout(() => setToast(null), 5000)
      return
    }

    setSaveState('saving')
    setStatus('saving')
    setToast(null)

    try {
      const res = await fetch('/api/customizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeId, data: dataToSave })
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || 'Gagal menyimpan ke server')
      }

      setSaveState('success')
      setStatus('saved')
      setLastSaved(dataToSave)
      
      // Clean up replaced assets from storage/DB if needed
      if (replacedAssets.length > 0) {
        for (const url of replacedAssets) {
          await deleteAssetByUrl(url)
        }
        setReplacedAssets([])
      }

      clearDraft(storeId)
      setDraftBanner(null)
      
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
      statusTimerRef.current = setTimeout(() => setStatus('idle'), 3000)
    } catch (err: any) {
      setSaveState('error')
      setStatus('error')
      setToast({ type: 'error', msg: 'Gagal menyimpan perubahan: ' + err.message })
    }
  }

  async function handlePublish() {
    setConfirmModal({
      title: 'Terbitkan Perubahan?',
      message: 'Apakah Anda yakin ingin mempublikasikan semua perubahan saat ini ke website toko live Anda?',
      onConfirm: () => {
        setConfirmModal(null)
        executePublish()
      }
    })
  }

  async function executePublish() {
    setPublishState('publishing')
    setToast(null)

    try {
      // 1. Simpan draft dulu agar data sinkron
      const dataToPublish = formDataRef.current
      const saveRes = await fetch('/api/customizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeId, data: dataToPublish })
      })
      
      if (!saveRes.ok) throw new Error('Gagal sinkronisasi draft sebelum publish.')

      // 2. Publish
      const res = await fetch('/api/customizations/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeId })
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || 'Gagal mempublikasikan ke live.')
      }

      setPublishState('success')
      setLastSaved(dataToPublish)
      clearDraft(storeId)
      setDraftBanner(null)
      setIsLive(true)
      setToast({ type: 'success', msg: `Berhasil dipublikasikan (Revisi #${json.revision_number})` })
      
      setTimeout(() => {
        setPublishState('idle')
        setToast(null)
        setIsLive(false)
      }, 3000)
    } catch (err: any) {
      setPublishState('error')
      setToast({ type: 'error', msg: err.message })
    }
  }

  async function handleRestoreRevision(revisionId: string) {
    setConfirmModal({
      title: 'Kembalikan ke Revisi Ini?',
      message: 'Apakah Anda yakin ingin mengembalikan isi draft ke versi revisi terpilih? Perubahan draft saat ini yang belum disimpan akan hilang.',
      onConfirm: () => {
        setConfirmModal(null)
        executeRestoreRevision(revisionId)
      }
    })
  }

  async function executeRestoreRevision(revisionId: string) {
    setIsRestoring(true)
    const { data, error } = await restoreRevisionToDraft(storeId, revisionId)
    setIsRestoring(false)

    if (error) {
      setToast({ type: 'error', msg: error })
    } else if (data) {
      setFormData(data)
      resetHistory(data)
      postMessageToPreview(data)
      setIsRevisionOpen(false)
      setToast({ type: 'success', msg: 'Revisi berhasil direstore ke draft.' })
    }
  }

  function sectionHasError(sec: string): boolean {
    return (grouped[sec] || []).some(f => !!errors[`${f.section}.${f.element}`])
  }

  return (
    <div style={s.root}>
      {/* Header */}
      <div className="editor-header" style={s.header}>
        <div className="editor-header-left" style={s.headerLeft}>
          <div style={{ color: '#6366F1', display: 'flex', alignItems: 'center' }}>
            <Pencil size={18} strokeWidth={2.5} />
          </div>
          <span style={s.headerTitle}>Edit Template</span>
          <span style={s.headerBadge}>{templateId.toUpperCase()}</span>
          <div className="editor-sync-status" style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', borderLeft: '1px solid #E5E7EB' }}>
            {status === 'typing' && (
              <span style={{...s.statusBadge, color: '#6B7280'}}>
                <Type size={12} className="animate-pulse" /> Mengetik...
              </span>
            )}
            {status === 'saving' && (
              <span style={{...s.statusBadge, color: '#247a52'}}>
                <RefreshCw size={12} className="animate-spin" /> Menyimpan...
              </span>
            )}
            {status === 'saved' && (
              <span style={{...s.statusBadge, color: '#10B981'}}>
                <CheckCircle2 size={12} /> Tersimpan
              </span>
            )}
            {status === 'autosaved' && (
              <span style={{...s.statusBadge, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: '4px', fontSize: '11px'}}>
                <CheckCircle2 size={12} style={{ marginRight: '2px' }} /> Draf disimpan otomatis
              </span>
            )}
            {status === 'error' && (
              <span style={{...s.statusBadge, color: '#EF4444'}}>
                <AlertTriangle size={12} /> Gagal simpan
              </span>
            )}
            {status === 'offline' && (
              <span style={{...s.statusBadge, color: '#D97706'}}>
                <WifiOff size={12} /> Offline
              </span>
            )}
            {status === 'idle' ? (
              isDirty ? (
                <span style={s.dirtyBadge}><span style={{width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', marginRight: '4px', verticalAlign: 'middle'}} /> Ada perubahan</span>
              ) : (
                <span style={s.savedBadge}><span style={{width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', marginRight: '4px', verticalAlign: 'middle'}} /> Draft tersimpan</span>
              )
            ) : (
              <span style={s.savedBadge}><span style={{width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', marginRight: '4px', verticalAlign: 'middle'}} /> Data Sinkron</span>
            )}
          </div>
        </div>
        <div className="editor-header-right" style={s.headerRight}>
          <button onClick={() => setIsRevisionOpen(true)} style={s.btnHistory} className="btn-history">
            <Clock size={14} /> Riwayat
          </button>

          <div className="undo-redo-group" style={{ display: 'flex', gap: '6px', marginRight: '8px', paddingRight: '12px', borderRight: '1px solid #E5E7EB' }}>
            <button 
              onClick={undo} 
              disabled={!canUndo} 
              style={{...s.iconBtn, opacity: canUndo ? 1 : 0.3}}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>
            <button 
              onClick={redo} 
              disabled={!canRedo} 
              style={{...s.iconBtn, opacity: canRedo ? 1 : 0.3}}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 size={16} />
            </button>
          </div>

          <a href={`/${storeSlug}`} target="_blank" rel="noopener noreferrer" style={s.btnSecondary} className="btn-view-store">
            Lihat Toko <ExternalLink size={14} style={{ marginLeft: '4px', verticalAlign: 'text-bottom' }} />
          </a>
          
          <button 
            onClick={handleSave} 
            disabled={saveState === 'saving' || !isDirty}
            style={{...s.btnDraft, opacity: isDirty ? 1 : 0.5}}
            className="btn-save"
          >
            {saveState === 'saving' ? 'Menyimpan...' : <><BookmarkCheck size={14} /> Simpan</>}
          </button>

          <button 
            onClick={handlePublish}
            disabled={publishState === 'publishing'}
            style={s.btnPublish}
            className="btn-publish"
          >
            {publishState === 'publishing' ? 'Publishing...' : <><SendHorizontal size={14} /> Terbitkan</>}
          </button>
        </div>
      </div>

      {/* Revision Panel */}
      <RevisionPanel 
        storeId={storeId}
        isOpen={isRevisionOpen}
        onClose={() => setIsRevisionOpen(false)}
        onRestore={handleRestoreRevision}
        isRestoring={isRestoring}
      />

      {/* Draft Banner */}
      {draftBanner && (
        <div style={s.draftBanner}>
          <span style={s.draftText}><Clock size={12} style={{ marginRight: '6px' }} /> Draft ditemukan dari {draftBanner.age}. Ingin dilanjutkan?</span>
          <div style={s.draftActions}>
            <button onClick={handleRestoreDraft} style={s.btnDraftAction}>Restore</button>
            <button onClick={handleIgnoreDraft} style={s.btnDraftIgnore}>Abaikan</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={toast.type === 'success' ? s.toastSuccess : s.toastError}>
          {toast.msg}
        </div>
      )}
      
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />

      {/* Custom Confirmation Modal */}
      {confirmModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(9, 9, 11, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            fontFamily: 'sans-serif',
            color: '#1f2937'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
              {confirmModal.title}
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.925rem', color: '#4b5563', lineHeight: '1.5' }}>
              {confirmModal.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setConfirmModal(null)}
                style={{
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  padding: '9px 18px',
                  borderRadius: '100px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                style={{
                  border: 'none',
                  background: '#247a52',
                  color: 'white',
                  padding: '9px 18px',
                  borderRadius: '100px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1023px) {
          .editor-mobile-warning { display: flex !important; }
        }
        @media (max-width: 768px) {
          /* Sembunyikan kontrol sekunder di mobile header */
          .btn-history, .undo-redo-group, .btn-view-store {
            display: none !important;
          }
          /* Perkecil padding tombol simpan & terbitkan */
          .btn-save, .btn-publish {
            padding: 8px 12px !important;
            font-size: 12px !important;
          }
          .editor-header {
            height: auto !important;
            min-height: 62px !important;
            padding: 10px 12px !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }
          .editor-header-left {
            min-width: 0 !important;
            flex: 1 1 auto !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
          }
          .editor-sync-status {
            width: 100% !important;
            margin-left: 0 !important;
            padding-left: 0 !important;
            border-left: 0 !important;
            overflow-x: auto !important;
          }
          .editor-header-right {
            flex: 0 0 auto !important;
            gap: 6px !important;
          }
          /* Form panel menutupi seluruh screen di mobile saat terbuka */
          .editor-body-container.form-open .editor-left-panel {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            height: calc(100vh - 62px) !important;
            position: fixed !important;
            top: 62px !important;
            left: 0 !important;
            z-index: 1000 !important;
            display: flex !important;
          }
          /* Sembunyikan panel preview ketika form terbuka */
          .editor-body-container.form-open .editor-right-panel {
            display: none !important;
          }
          /* Preview mengambil lebar penuh ketika form ditutup */
          .editor-body-container:not(.form-open) .editor-right-panel {
            width: 100% !important;
            padding: 10px !important;
          }
          .editor-preview-toolbar {
            height: auto !important;
            min-height: 44px !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }
          .editor-preview-hint {
            display: none !important;
          }
        }
      `}} />
      <div className="editor-mobile-warning" style={s.mobileWarning}>
        <AlertTriangle size={14} /> Editor dioptimalkan untuk Desktop. Gunakan layar lebih lebar untuk pengalaman terbaik.
      </div>

      {/* Body Container */}
      <div className={`editor-body-container ${isFormPanelOpen ? 'form-open' : ''}`} style={s.bodyContainer}>
        {/* Left Panel */}
        {isFormPanelOpen && (
          <div className="editor-left-panel" style={s.leftPanel}>
            <SectionSidebar
              sections={sections}
              activeSection={activeSection}
              sectionLabels={SECTION_LABELS}
              hasError={sectionHasError}
              onChange={setActiveSection}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={s.sidebarGuide}>
                <div style={s.sidebarGuideTitle}>
                  <MousePointer2 size={13} /> Dua cara edit
                </div>
                <p style={s.sidebarGuideText}>
                  Double click objek ber-outline di preview untuk edit cepat. Pakai form ini untuk field panjang, gambar, toggle section, dan koreksi yang butuh kontrol lebih rapi.
                </p>
                <button onClick={() => setIsFormPanelOpen(false)} style={s.sidebarHideBtn}>
                  <PanelLeftClose size={13} /> Sembunyikan form
                </button>
              </div>
              <div style={s.sidebarSearchWrapper}>
                <input
                  type="text"
                  placeholder="Cari field (misal: judul, gambar)..."
                  value={sidebarSearch}
                  onChange={e => setSidebarSearch(e.target.value)}
                  style={s.sidebarSearchInput}
                />
                {sidebarSearch && (
                  <button onClick={() => setSidebarSearch('')} style={s.sidebarSearchClear}><X size={12} /></button>
                )}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
                <EditorErrorBoundary context="EditorSection">
                  <EditorSection
                    storeId={storeId}
                    sectionName={activeSection}
                    sectionLabel={SECTION_LABELS[activeSection] || activeSection}
                    fields={grouped[activeSection] || []}
                    formData={editorValues}
                    errors={errors}
                    onChange={handleChange}
                    selectedKey={selectedKey}
                    highlightedKey={highlightedKey}
                    searchQuery={sidebarSearch}
                  />
                </EditorErrorBoundary>
              </div>
            </div>
          </div>
        )}

        {!isFormPanelOpen && (
          <button onClick={() => setIsFormPanelOpen(true)} style={s.formRailButton}>
            <PanelLeftOpen size={15} />
            Form
          </button>
        )}

        {/* Right Panel */}
        <div className="editor-right-panel" style={s.rightPanel}>
          <div className="editor-preview-toolbar" style={s.previewToolbar}>
            <div style={s.previewLeft}>
              <button
                onClick={() => setIsFormPanelOpen(v => !v)}
                style={s.inlineModeBtn}
                title={isFormPanelOpen ? 'Sembunyikan form dan fokus inline edit' : 'Tampilkan form field'}
              >
                {isFormPanelOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
                {isFormPanelOpen ? 'Fokus Inline' : 'Tampilkan Form'}
              </button>
              <div style={s.deviceToggle}>
                <button 
                  onClick={() => setDeviceMode('desktop')} 
                  style={{...s.deviceBtn, ...(deviceMode === 'desktop' ? s.deviceBtnActive : {})}}
                ><Monitor size={14} /></button>
                <button 
                  onClick={() => setDeviceMode('mobile')} 
                  style={{...s.deviceBtn, ...(deviceMode === 'mobile' ? s.deviceBtnActive : {})}}
                ><Smartphone size={14} /></button>
              </div>
              <span style={s.previewLabel}>Preview toko asli</span>
              {messageId > ackedId ? (
                <span style={{ fontSize: '10px', color: '#6B7280', fontStyle: 'italic', marginLeft: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><RefreshCw size={10} className="animate-spin" /> Sinkronisasi...</span>
              ) : messageId > 0 ? (
                <span style={{ fontSize: '10px', color: '#10B981', marginLeft: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Check size={10} /> Terhubung</span>
              ) : null}
            </div>
            <span className="editor-preview-hint" style={s.previewHint}>Scroll normal di preview. Double click objek ber-outline untuk edit inline.</span>
          </div>
          
          <PreviewFrame 
            ref={previewRef}
            src={`/dashboard/editor/preview?storeId=${storeId}`}
            deviceMode={deviceMode}
            onElementSelect={handleElementSelect}
            onQuickEdit={handleQuickEdit}
            onImageReplace={handleImageReplace}
            onSectionHide={handleSectionHide}
            formData={editorValues}
          />
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: 'Inter, system-ui, sans-serif',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#F6F8FB',
    minWidth: '0',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    background: '#fff',
    borderBottom: '1px solid #E5E7EB',
    height: '62px',
    boxSizing: 'border-box',
    flexShrink: 0,
    zIndex: 50,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  headerTitle: { fontWeight: 700, fontSize: '15px', color: '#111827' },
  headerBadge: {
    background: '#EEF2F7',
    color: '#6B7280',
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '6px',
    letterSpacing: '0.05em',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dirtyBadge: {
    color: '#D97706',
    fontSize: '11px',
    fontWeight: 600,
  },
  savedBadge: {
    color: '#059669',
    fontSize: '11px',
    fontWeight: 600,
  },
  liveBadge: {
    color: '#111827',
    fontSize: '11px',
    fontWeight: 700,
    background: '#F3F4F6',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  btnHistory: {
    background: 'transparent',
    color: '#374151',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  btnDraft: {
    background: '#fff',
    color: '#374151',
    border: '1px solid #D1D5DB',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  },
  btnPublish: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnSecondary: {
    background: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    padding: '7px 14px',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '13px',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  draftBanner: {
    background: '#FFFBEB',
    padding: '8px 20px',
    borderBottom: '1px solid #FEF3C7',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  draftText: { fontSize: '12px', color: '#92400E', fontWeight: 500 },
  draftActions: { display: 'flex', gap: '8px' },
  btnDraftAction: {
    padding: '4px 10px',
    background: '#F59E0B',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  btnDraftIgnore: {
    padding: '4px 10px',
    background: 'transparent',
    color: '#92400E',
    border: '1px solid #F59E0B',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  toastSuccess: {
    background: '#111827',
    color: '#fff',
    padding: '12px 24px',
    fontSize: '13px',
    fontWeight: 500,
    position: 'absolute',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  toastError: {
    background: '#DC2626',
    color: '#fff',
    padding: '12px 24px',
    fontSize: '13px',
    fontWeight: 500,
    position: 'absolute',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(220,38,38,0.2)',
    zIndex: 100,
  },
  bodyContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  mobileWarning: {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: '#FFFBEB',
    color: '#D97706',
    fontSize: '12px',
    fontWeight: 600,
    padding: '8px 16px',
    textAlign: 'center' as const,
    zIndex: 20000,
    borderBottom: '1px solid #FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  leftPanel: {
    width: '460px',
    minWidth: '380px',
    display: 'flex',
    background: '#fff',
    borderRight: '1px solid #E5E7EB',
    overflow: 'hidden',
    flexShrink: 0,
  },
  sidebarGuide: {
    padding: '14px 20px',
    background: '#F8FAFC',
    borderBottom: '1px solid #E5E7EB',
    flexShrink: 0,
  },
  sidebarGuideTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 800,
    color: '#111827',
    marginBottom: '6px',
  },
  sidebarGuideText: {
    fontSize: '11px',
    lineHeight: 1.55,
    color: '#64748B',
    margin: '0 0 10px',
  },
  sidebarHideBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#fff',
    color: '#334155',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    padding: '7px 10px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  formRailButton: {
    width: '48px',
    flexShrink: 0,
    border: 'none',
    borderRight: '1px solid #E5E7EB',
    background: '#fff',
    color: '#334155',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  sidebarSearchWrapper: {
    padding: '12px 20px',
    background: '#fff',
    borderBottom: '1px solid #F3F4F6',
    position: 'relative',
    flexShrink: 0,
  },
  sidebarSearchInput: {
    width: '100%',
    padding: '8px 12px',
    paddingRight: '32px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    fontSize: '13px',
    background: '#F9FAFB',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  sidebarSearchClear: {
    position: 'absolute',
    right: '28px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#9CA3AF',
    cursor: 'pointer',
    fontSize: '12px',
  },
  rightPanel: {
    flex: 1,
    background: '#EAF0F6',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    overflowY: 'auto',
  },
  previewToolbar: {
    height: '44px',
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderBottom: 'none',
    borderRadius: '12px 12px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    flexShrink: 0,
  },
  previewLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  inlineModeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#111827',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  deviceToggle: { display: 'flex', background: '#F3F4F6', borderRadius: '8px', padding: '3px' },
  deviceBtn: {
    border: 'none',
    background: 'transparent',
    padding: '4px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  deviceBtnActive: { background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  previewLabel: { fontSize: '12px', fontWeight: 600, color: '#374151' },
  previewHint: { fontSize: '11px', color: '#9CA3AF' },
}
