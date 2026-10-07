'use client'

/**
 * Main Template Editor Component
 * 
 * Component utama untuk visual editor template.
 * Menghandle state, loading, dan koordinasi antar sub-components.
 */

import { useState, useEffect } from 'react'
import { Loader2, Eye, Edit, Save, X } from 'lucide-react'
import { getTemplateDefinition, getDefaultContent } from '@/lib/template-editor/definitions'
import { getTemplateCustomizations, saveTemplateCustomization } from '@/lib/template-editor/api'
import type { Store } from '@/lib/types'
import type { TemplateCustomization, SectionContent } from '@/lib/template-editor/types'
import { EditableSection } from './EditableSection'
import { EditModal } from './EditModal'
import { PreviewMode } from './PreviewMode'

interface TemplateEditorProps {
  store: Store
}

export function TemplateEditor({ store }: TemplateEditorProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [customizations, setCustomizations] = useState<TemplateCustomization[]>([])
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteSection, setConfirmDeleteSection] = useState<string | null>(null)

  // Template editor lama ini masih dipakai oleh beberapa route legacy, jadi hook harus tetap stabil
  // walaupun template belum terdaftar.
  const template = getTemplateDefinition(store.template)

  const loadCustomizations = async () => {
    if (!template) {
      setLoading(false)
      setError('Template tidak ditemukan')
      return
    }

    try {
      setLoading(true)
      const data = await getTemplateCustomizations(store.id)
      
      // Initialize default content for sections that don't have customizations yet
      const initializedCustomizations = template.sections.map(section => {
        const existing = data.find(c => c.section_id === section.id)
        
        if (existing) {
          return existing
        } else {
          // Create default customization
          return {
            id: '',
            store_id: store.id,
            template_id: store.template,
            section_id: section.id,
            is_visible: true,
            content: section.defaultContent as any, // Cast to any to avoid type issues
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      })
      
      setCustomizations(initializedCustomizations)
    } catch (err) {
      console.error('Error loading customizations:', err)
      setError('Gagal memuat data template')
    } finally {
      setLoading(false)
    }
  }

  // Load customizations on mount
  useEffect(() => {
    loadCustomizations()
  }, [store.id])

  if (!template) {
    return <div>Template tidak ditemukan</div>
  }

  const handleEditSection = (sectionId: string) => {
    setEditingSection(sectionId)
  }

  const handleSaveSection = async (sectionId: string, content: SectionContent) => {
    try {
      setSaving(true)
      setError(null)
      
      const result = await saveTemplateCustomization(
        store.id,
        store.template,
        sectionId,
        content,
        true // visible by default when editing
      )
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      // Update local state
      setCustomizations(prev => 
        prev.map(c => 
          c.section_id === sectionId 
            ? { ...c, content, updated_at: new Date().toISOString() }
            : c
        )
      )
      
      setEditingSection(null)
      setSaved(true)
      
      // Clear saved indicator after 2 seconds
      setTimeout(() => setSaved(false), 2000)
      
    } catch (err: any) {
      console.error('Error saving section:', err)
      setError(err.message || 'Gagal menyimpan perubahan')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleVisibility = async (sectionId: string) => {
    try {
      const customization = customizations.find(c => c.section_id === sectionId)
      if (!customization) return
      
      const newVisibility = !customization.is_visible
      
      const result = await saveTemplateCustomization(
        store.id,
        store.template,
        sectionId,
        customization.content,
        newVisibility
      )
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      // Update local state
      setCustomizations(prev => 
        prev.map(c => 
          c.section_id === sectionId 
            ? { ...c, is_visible: newVisibility, updated_at: new Date().toISOString() }
            : c
        )
      )
      
    } catch (err: any) {
      console.error('Error toggling visibility:', err)
      setError(err.message || 'Gagal mengubah visibilitas')
    }
  }

  const handleDeleteSection = (sectionId: string) => {
    setConfirmDeleteSection(sectionId)
  }

  const executeDeleteSection = async () => {
    if (!confirmDeleteSection) return
    const secId = confirmDeleteSection
    setConfirmDeleteSection(null)
    await handleToggleVisibility(secId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Memuat template...</span>
      </div>
    )
  }

  return (
    <div className="template-editor">
      {/* Header */}
      <div className="editor-header sticky top-0 z-40 bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Template: {template.nama}</h1>
            <p className="text-sm text-gray-600">
              Klik elemen untuk mengedit, atau gunakan mode preview untuk melihat hasil
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Preview Toggle */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                previewMode 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </button>
            
            {/* Save Status */}
            {saving && (
              <div className="flex items-center gap-2 text-orange-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </div>
            )}
            
            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <Save className="w-4 h-4" />
                Tersimpan!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <X className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="editor-content">
        {previewMode ? (
          <PreviewMode 
            template={template}
            customizations={customizations}
            store={store}
          />
        ) : (
          <div className="edit-mode">
            <div className="max-w-6xl mx-auto p-6">
              <div className="space-y-8">
                {template.sections.map(section => {
                  const customization = customizations.find(c => c.section_id === section.id)
                  if (!customization) return null
                  
                  return (
                    <EditableSection
                      key={section.id}
                      section={section}
                      customization={customization}
                      onEdit={handleEditSection}
                      onDelete={handleDeleteSection}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <EditModal
          sectionId={editingSection}
          section={template.sections.find(s => s.id === editingSection)!}
          content={customizations.find(c => c.section_id === editingSection)?.content || {} as any}
          onSave={(content) => handleSaveSection(editingSection, content)}
          onClose={() => setEditingSection(null)}
        />
      )}

      {/* Confirmation Modal */}
      {confirmDeleteSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-red-600 mb-2">Sembunyikan Section?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin menyembunyikan section ini dari website? Anda dapat menampilkannya kembali nanti.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setConfirmDeleteSection(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-semibold transition-colors"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={executeDeleteSection}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Sembunyikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
