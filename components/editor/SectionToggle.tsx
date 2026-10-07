'use client'

import React from 'react'
import { useEditor } from './VisualEditor'

interface Props {
  section: string;
  defaultVisible?: boolean;
  children: React.ReactNode;
}

export function SectionToggle({ section, defaultVisible = true, children }: Props) {
  const { isEditMode, customizations, saveCustomization } = useEditor()
  const key = `${section}.visible`
  
  // If not set, use default
  const isVisibleStr = customizations[key]
  const isVisible = isVisibleStr ? isVisibleStr === 'true' : defaultVisible

  const toggleVisibility = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    saveCustomization(section, 'visible', (!isVisible).toString())
  }

  // If not edit mode and not visible, don't render anything
  if (!isEditMode && !isVisible) {
    return null
  }

  // In edit mode, if hidden, show a placeholder with an option to show
  if (isEditMode && !isVisible) {
    return (
      <div style={{ 
        padding: '20px', 
        margin: '20px 0', 
        border: '2px dashed #9CA3AF', 
        borderRadius: '8px', 
        background: '#F3F4F6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6B7280'
      }}>
        <div style={{ marginBottom: '10px' }}><i className="fa-solid fa-eye-slash" style={{ fontSize: '24px' }}></i></div>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Section: {section} disembunyikan</p>
        <button 
          onClick={toggleVisibility}
          style={{
            background: '#247a52',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '100px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          <i className="fa-solid fa-eye"></i> Tampilkan Section Ini
        </button>
      </div>
    )
  }

  // If visible (in edit mode or not), render children.
  // If in edit mode, wrap with an overlay/button to hide.
  if (isEditMode) {
    return (
      <div style={{ position: 'relative', border: '2px dashed transparent', transition: 'all 0.3s' }} className="editor-section-hover">
        <style dangerouslySetInnerHTML={{__html: `
          .editor-section-hover:hover { border-color: #EF4444; }
          .editor-section-hover .hide-btn { opacity: 0; transition: 0.3s; }
          .editor-section-hover:hover .hide-btn { opacity: 1; }
        `}} />
        
        <div 
          className="hide-btn"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
          }}
        >
          <button 
            onClick={toggleVisibility}
            style={{
              background: '#EF4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '100px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <i className="fa-solid fa-eye-slash"></i> Sembunyikan Section
          </button>
        </div>
        {children}
      </div>
    )
  }

  return <>{children}</>
}
