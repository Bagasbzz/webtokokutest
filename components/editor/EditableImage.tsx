'use client'

import React, { useState, useRef } from 'react'
import { useEditor } from './VisualEditor'

interface Props {
  section: string;
  element: string;
  defaultSrc: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function EditableImage({ section, element, defaultSrc, alt = '', className, style }: Props) {
  const { isEditMode, customizations, saveCustomization, storeId } = useEditor()
  const key = `${section}.${element}`
  const src = customizations[key] ?? defaultSrc

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isEditMode) {
    return <img src={src} alt={alt} className={className} style={style} />
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !storeId) return

    setIsUploading(true)
    setUploadError(false)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('store_id', storeId)
      formData.append('purpose', 'editor')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (!response.ok || result.error || !result.url) {
        console.error('Upload error:', result.error)
        setUploadError(true)
        setIsUploading(false)
        setTimeout(() => setUploadError(false), 3000)
        return
      }

      await saveCustomization(section, element, result.url)
    } catch (err) {
      console.error(err)
      setUploadError(true)
      setTimeout(() => setUploadError(false), 3000)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: style?.width || '100%', height: style?.height || '100%' }}>
      <div 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}
        style={{ 
          cursor: isUploading ? 'wait' : 'pointer', 
          border: '2px dashed #10B981', 
          padding: '2px',
          borderRadius: '8px',
          transition: 'all 0.2s',
          display: 'block',
          position: 'relative',
          width: '100%',
          height: '100%'
        }}
      >
        <img src={src} alt={alt} className={className} style={{ ...style, opacity: isUploading ? 0.5 : 1 }} />
        
        <div style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: uploadError ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.9)', 
          color: 'white', 
          padding: '8px 16px',
          borderRadius: '100px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '8px',
          fontWeight: 'bold',
          fontSize: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          pointerEvents: 'none',
          transition: 'background-color 0.2s ease'
        }}>
          {isUploading ? (
            <><i className="fa-solid fa-spinner fa-spin"></i> Mengupload...</>
          ) : uploadError ? (
            <><i className="fa-solid fa-circle-exclamation"></i> Gagal Upload!</>
          ) : (
            <><i className="fa-solid fa-camera"></i> Ganti Gambar</>
          )}
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />
    </div>
  )
}
