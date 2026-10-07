'use client'

import React, { memo } from 'react'
import type { EditableElement } from '@/lib/template-editables'
import { ImageField } from './ImageField'
import { validateField } from '@/lib/editor-validation'

interface FieldRendererProps {
  storeId: string
  field: EditableElement
  value: string
  error?: string | null
  onChange: (key: string, value: string) => void
  isSelected?: boolean
  isHighlighted?: boolean
  isSearchMatch?: boolean
}

export const FieldRenderer = memo(function FieldRenderer({ 
  storeId, 
  field, 
  value, 
  error, 
  onChange,
  isSelected,
  isHighlighted,
  isSearchMatch
}: FieldRendererProps) {
  const key = `${field.section}.${field.element}`
  const softError = validateField(field, value)
  const displayError = error || softError

  return (
    <div style={{
      ...s.wrapper,
      ...(isSearchMatch ? s.searchMatch : {})
    }}>
      <div style={s.labelRow}>
        <label style={s.label}>{field.label}</label>
        {isSearchMatch && <span style={s.matchBadge}>Matched</span>}
      </div>

      {field.type === 'toggle' && (
        <ToggleField
          value={value}
          onChange={v => onChange(key, v)}
        />
      )}

      {field.type === 'image' && (
        <ImageField
          storeId={storeId}
          section={field.section}
          element={field.element}
          value={value}
          error={error}
          onChange={v => onChange(key, v)}
        />
      )}
      {field.helperText && <p style={s.helperText}>{field.helperText}</p>}

      {field.type === 'text' && (
        <TextField
          value={value}
          error={displayError}
          maxLength={200}
          onChange={v => onChange(key, v)}
          isSelected={isSelected}
          isHighlighted={isHighlighted}
        />
      )}

      {(field.type === 'link' || field.type === 'video') && (
        <TextField
          value={value}
          error={displayError}
          maxLength={800}
          onChange={v => onChange(key, v)}
          isSelected={isSelected}
          isHighlighted={isHighlighted}
          placeholder={field.type === 'video' ? 'https://www.youtube.com/watch?v=...' : 'https://...'}
        />
      )}

      {(field.type === 'textarea') && (
        <TextareaField
          value={value}
          error={displayError}
          maxLength={1000}
          onChange={v => onChange(key, v)}
          isSelected={isSelected}
          isHighlighted={isHighlighted}
        />
      )}

      {field.type === 'richtext' && (
        <RichtextField
          value={value}
          error={displayError}
          maxLength={3000}
          onChange={v => onChange(key, v)}
          isSelected={isSelected}
          isHighlighted={isHighlighted}
        />
      )}

      <p style={s.keyHint}>{key}</p>
    </div>
  )
})

/* ────────── Sub-fields ────────── */

function TextField({ value, error, maxLength, onChange, isSelected, isHighlighted, placeholder }: {
  value: string; error?: string | null; maxLength: number; onChange: (v: string) => void; isSelected?: boolean; isHighlighted?: boolean; placeholder?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      inputRef.current.focus({ preventScroll: true })
    }
  }, [isSelected])

  const nearLimit = value.length > maxLength * 0.9
  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength + 20}
        style={{ 
          ...s.input, 
          ...(error ? s.inputError : {}),
          ...(isHighlighted ? { outline: '2px solid #247a52', outlineOffset: '2px' } : {})
        }}
      />
      <div style={s.inputFooter}>
        {error ? <span style={s.errorText}>{error}</span> : <span />}
        <span style={{ ...s.charCount, color: nearLimit ? '#EF4444' : '#9CA3AF' }}>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}

function TextareaField({ value, error, maxLength, onChange, isSelected, isHighlighted }: {
  value: string; error?: string | null; maxLength: number; onChange: (v: string) => void; isSelected?: boolean; isHighlighted?: boolean
}) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      inputRef.current.focus({ preventScroll: true })
    }
  }, [isSelected])

  const nearLimit = value.length > maxLength * 0.9
  return (
    <div>
      <textarea
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={4}
        maxLength={maxLength + 50}
        style={{ 
          ...s.textarea, 
          ...(error ? s.inputError : {}),
          ...(isHighlighted ? { outline: '2px solid #247a52', outlineOffset: '2px' } : {})
        }}
      />
      <div style={s.inputFooter}>
        {error ? <span style={s.errorText}>{error}</span> : <span />}
        <span style={{ ...s.charCount, color: nearLimit ? '#EF4444' : '#9CA3AF' }}>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}

function RichtextField({ value, error, maxLength, onChange, isSelected, isHighlighted }: {
  value: string; error?: string | null; maxLength: number; onChange: (v: string) => void; isSelected?: boolean; isHighlighted?: boolean
}) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      inputRef.current.focus({ preventScroll: true })
    }
  }, [isSelected])

  const nearLimit = value.length > maxLength * 0.9
  return (
    <div>
      <textarea
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={6}
        maxLength={maxLength + 100}
        style={{ 
          ...s.textarea, 
          fontFamily: 'monospace',
          minHeight: '150px',
          ...(error ? s.inputError : {}),
          ...(isHighlighted ? { outline: '2px solid #247a52', outlineOffset: '2px' } : {})
        }}
      />
      <div style={s.inputFooter}>
        {error ? <span style={s.errorText}>{error}</span> : <span />}
        <span style={{ ...s.charCount, color: nearLimit ? '#EF4444' : '#9CA3AF' }}>
          {value.length}/{maxLength}
        </span>
      </div>
      <p style={s.richHint}>Mendukung HTML: &lt;b&gt; &lt;i&gt; &lt;br/&gt; &lt;span&gt;</p>
    </div>
  )
}


function ToggleField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isOn = value !== 'false'
  return (
    <label style={s.toggleRow} onClick={() => onChange(isOn ? 'false' : 'true')}>
      <div style={{ ...s.toggleTrack, background: isOn ? '#111827' : '#D1D5DB' }}>
        <div style={{ ...s.toggleThumb, transform: isOn ? 'translateX(20px)' : 'translateX(2px)' }} />
      </div>
      <span style={s.toggleText}>{isOn ? 'Ditampilkan' : 'Disembunyikan'}</span>
    </label>
  )
}

/* ────────── Styles ────────── */
const s: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchMatch: {
    background: '#EFF6FF',
    margin: '-8px',
    padding: '8px',
    borderRadius: '12px',
    boxShadow: '0 0 0 2px #247a52',
  },
  matchBadge: {
    fontSize: '9px',
    fontWeight: 700,
    background: '#247a52',
    color: '#fff',
    padding: '1px 5px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  input: {
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    color: '#111827',
    outline: 'none',
    background: '#fff',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textarea: {
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    color: '#111827',
    outline: 'none',
    background: '#fff',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: 1.5,
  },
  inputFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
  },
  errorText: {
    fontSize: '11px',
    color: '#EF4444',
    fontWeight: 500,
  },
  charCount: {
    fontSize: '11px',
    fontFamily: 'monospace',
  },
  richHint: {
    fontSize: '11px',
    color: '#9CA3AF',
    marginTop: '4px',
  },
  imgPreview: {
    marginTop: '8px',
    width: '100%',
    maxHeight: '140px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    display: 'none',
  },
  keyHint: {
    fontSize: '10px',
    color: '#E5E7EB',
    fontFamily: 'monospace',
    marginTop: '2px',
  },
  helperText: {
    fontSize: '11px',
    color: '#6B7280',
    lineHeight: 1.45,
    marginTop: '-2px',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  toggleTrack: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    position: 'relative',
    transition: 'background 0.2s',
    flexShrink: 0,
  },
  toggleThumb: {
    position: 'absolute',
    top: '2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s',
  },
  toggleText: {
    fontSize: '13px',
    color: '#374151',
    fontWeight: 500,
  },
}
