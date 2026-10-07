'use client'

import React, { useState } from 'react'
import { useEditor } from './VisualEditor'
import { sanitizeRichHtml } from '@/lib/customization-security'

interface Props {
  section: string;
  element: string;
  defaultText: string;
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  className?: string;
  style?: React.CSSProperties;
  isHtml?: boolean;
}

export function EditableText({ section, element, defaultText, as: Tag = 'span', className, style, isHtml = false }: Props) {
  const { isEditMode, customizations, saveCustomization } = useEditor()
  const key = `${section}.${element}`
  const text = customizations[key] ?? defaultText

  const [isEditing, setIsEditing] = useState(false)
  const [val, setVal] = useState(text)

  const handleSave = () => {
    saveCustomization(section, element, val)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setVal(text)
    setIsEditing(false)
  }

  if (!isEditMode) {
    if (isHtml) {
      const Element = Tag as any
      return <Element className={className} style={style} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(text) }} />
    }
    const Element = Tag as any
    return <Element className={className} style={style}>{text}</Element>
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
        style={{ 
          cursor: 'pointer', 
          border: '2px dashed #247a52',
          padding: '2px',
          borderRadius: '4px',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          transition: 'all 0.2s',
          display: 'inline-flex',
          alignItems: 'center'
        }}
      >
        {isHtml ? (
          <span dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(text) }} />
        ) : (
          <span>{text}</span>
        )}
        <div style={{ 
          marginLeft: '8px', 
          background: '#247a52',
          color: 'white', 
          borderRadius: '50%', 
          width: '20px', 
          height: '20px', 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '10px'
        }}>
          <i className="fa-solid fa-pen"></i>
        </div>
      </div>

      {isEditing && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          background: 'white', 
          padding: '12px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
          zIndex: 10000, 
          border: '1px solid #E5E7EB', 
          borderRadius: '8px',
          marginTop: '8px',
          minWidth: '250px'
        }}>
          <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
            Edit Text ({section}.{element})
          </div>
          <textarea 
            value={val} 
            onChange={e => setVal(e.target.value)}
            style={{ 
              width: '100%', 
              minHeight: '80px', 
              color: 'black',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontFamily: 'sans-serif',
              fontSize: '14px'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSave(); }} 
              style={{ 
                background: '#10B981', 
                color: 'white', 
                padding: '6px 12px', 
                borderRadius: '4px', 
                border: 'none', 
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
                flex: 1
              }}
            >
              Simpan
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCancel(); }} 
              style={{ 
                background: '#F3F4F6', 
                color: '#4B5563',
                padding: '6px 12px', 
                borderRadius: '4px', 
                border: '1px solid #D1D5DB',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
                flex: 1
              }}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
