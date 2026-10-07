'use client'

import type { EditableElement } from '@/lib/template-editables'
import { FieldRenderer } from './FieldRenderer'

interface EditorSectionProps {
  storeId: string
  sectionName: string
  sectionLabel: string
  fields: EditableElement[]
  formData: Record<string, string>
  errors: Record<string, string>
  onChange: (key: string, value: string) => void
  selectedKey: string | null
  highlightedKey: string | null
  searchQuery?: string
}

export function EditorSection({
  storeId,
  sectionName,
  sectionLabel,
  fields,
  formData,
  errors,
  onChange,
  selectedKey,
  highlightedKey,
  searchQuery = '',
}: EditorSectionProps) {
  const filteredFields = fields.filter(f => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      f.label.toLowerCase().includes(q) || 
      f.element.toLowerCase().includes(q) ||
      f.section.toLowerCase().includes(q)
    )
  })

  if (fields.length === 0) {
    return (
      <div style={s.empty}>
        <p>Tidak ada field yang bisa diedit untuk section ini.</p>
      </div>
    )
  }

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <h2 style={s.title}>{sectionLabel}</h2>
        <p style={s.hint}>
          Perubahan tampil di preview kanan secara realtime. Klik Simpan untuk menyimpan ke database.
        </p>
      </div>
      <div style={s.fieldList}>
        {filteredFields.length === 0 ? (
          <div style={s.noResults}>
            <p>Tidak ditemukan hasil untuk {searchQuery}</p>
          </div>
        ) : (
          filteredFields.map(field => {
            const key = `${field.section}.${field.element}`
            const isMatch = searchQuery !== '' && (
              field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              key.toLowerCase().includes(searchQuery.toLowerCase())
            )

            return (
              <FieldRenderer
                key={key}
                storeId={storeId}
                field={field}
                value={formData[key] ?? field.default_value ?? ''}
                error={errors[key] ?? null}
                onChange={onChange}
                isSelected={selectedKey === key}
                isHighlighted={highlightedKey === key}
                isSearchMatch={isMatch}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
  },
  header: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #F3F4F6',
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '4px',
  },
  hint: {
    fontSize: '12px',
    color: '#9CA3AF',
  },
  fieldList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9CA3AF',
    fontSize: '14px',
    padding: '40px',
  },
  noResults: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#6B7280',
    fontSize: '14px',
    background: '#F9FAFB',
    borderRadius: '12px',
    border: '1px dashed #E5E7EB',
  }
}
