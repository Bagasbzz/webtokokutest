'use client'

import React from 'react'
import { useEditor } from './VisualEditor'

export function EditorToolbar() {
  const { isEditMode, setIsEditMode, loading } = useEditor()
  const [showSavedMsg, setShowSavedMsg] = React.useState(false)

  if (loading) return null;

  const handleSaveClick = () => {
    setShowSavedMsg(true)
    setTimeout(() => setShowSavedMsg(false), 3000)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'white',
      padding: '12px 24px',
      borderRadius: '100px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      zIndex: 99999,
      border: '1px solid #E5E7EB',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#111827' }}>
        <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#247a52' }}></i>
        <span>Visual Editor</span>
      </div>

      <div style={{ width: '1px', height: '24px', background: '#E5E7EB' }}></div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={() => setIsEditMode(!isEditMode)}
          style={{
            background: isEditMode ? '#F3F4F6' : '#10B981',
            color: isEditMode ? '#4B5563' : 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '100px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: '0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isEditMode ? (
            <><i className="fa-solid fa-eye"></i> Mode Preview</>
          ) : (
            <><i className="fa-solid fa-pen-to-square"></i> Mode Edit</>
          )}
        </button>

        {isEditMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={handleSaveClick}
              style={{
                background: '#247a52',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '100px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: '0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fa-solid fa-cloud-arrow-up"></i> Simpan
            </button>
            {showSavedMsg && (
              <span style={{
                color: '#10B981',
                fontSize: '12px',
                fontWeight: 'bold',
                animation: 'fadeIn 0.2s ease',
                whiteSpace: 'nowrap'
              }}>
                <i className="fa-solid fa-circle-check"></i> Tersimpan otomatis!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
