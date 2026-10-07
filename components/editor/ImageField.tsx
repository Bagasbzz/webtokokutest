'use client'

import { useState, useRef, useEffect } from 'react'
import { validateImage } from '@/lib/editor-upload'
import { compressImage } from '@/lib/editor-image-processing'
import { IMAGE_UPLOAD } from '@/lib/upload-limits'
import { RefreshCw } from 'lucide-react'

interface ImageFieldProps {
  storeId: string
  section: string
  element: string
  value: string
  error?: string | null
  onChange: (value: string) => void
}

export function ImageField({
  storeId,
  section,
  element,
  value,
  error: externalError,
  onChange,
}: ImageFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [localError, setLocalError] = useState<string | null>(null)
  const [retryFile, setRetryFile] = useState<File | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const error = localError || externalError

  useEffect(() => {
    setImageLoaded(false)
  }, [value])

  async function startUpload(file: File) {
    setUploading(true)
    setLocalError(null)
    setRetryFile(null)
    setProgress(10)

    try {
      const validationError = validateImage(file)
      if (validationError) {
        throw new Error(validationError)
      }

      const processedFile = await compressImage(file, IMAGE_UPLOAD.maxStoredBytes)
      if (processedFile.size > IMAGE_UPLOAD.maxStoredBytes) {
        throw new Error(`Gambar masih terlalu besar setelah dikompres. Target maksimal ${IMAGE_UPLOAD.maxStoredLabel}.`)
      }

      const formData = new FormData()
      formData.append('file', processedFile)
      formData.append('store_id', storeId)
      
      setProgress(30)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      setProgress(80)
      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || 'Upload gagal')
      }

      onChange(json.url)
      setProgress(100)
    } catch (err: any) {
      setLocalError(err.message)
      setRetryFile(file)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await startUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div style={s.container}>
      {/* Preview Area */}
      <div style={s.previewArea}>
        {value ? (
          <>
            {!imageLoaded && <div style={s.skeleton} />}
            <img 
              src={value} 
              alt="Preview" 
              style={{
                ...s.image,
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.4s ease'
              }} 
              onLoad={() => setImageLoaded(true)}
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </>
        ) : (
          <div style={s.placeholder}>No Image Selected</div>
        )}
        
        {uploading && (
          <div style={s.uploadOverlay}>
            <div style={s.progressContainer}>
              <div style={{ ...s.progressBar, width: `${progress}%` }} />
            </div>
            <span style={s.uploadText}>{progress < 30 ? 'Processing...' : `Uploading ${progress}%`}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={s.btnUpload}
        >
          {value ? 'Ganti Gambar' : 'Pilih Gambar'}
        </button>
        
        {retryFile && (
          <button onClick={() => startUpload(retryFile)} style={s.btnRetry}>
            <RefreshCw size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} /> Coba Lagi
          </button>
        )}
        
        <div style={s.divider}>atau</div>
        
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          style={{ ...s.urlInput, ...(error ? s.inputError : {}) }}
          disabled={uploading}
        />
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
      />

      {error && <p style={s.errorText}>{error}</p>}
      <p style={s.hint}>File awal maksimal {IMAGE_UPLOAD.maxOriginalLabel}; disimpan terkompres sekitar {IMAGE_UPLOAD.maxStoredLabel}.</p>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  previewArea: {
    width: '100%',
    height: '160px',
    background: '#F3F4F6',
    borderRadius: '10px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  skeleton: {
    position: 'absolute',
    inset: 0,
    background: '#E5E7EB',
    animation: 'pulse 1.5s infinite',
  },
  placeholder: {
    fontSize: '12px',
    color: '#9CA3AF',
    fontWeight: 500,
  },
  uploadOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(255,255,255,0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    zIndex: 10,
  },
  uploadText: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#111827',
  },
  progressContainer: {
    width: '120px',
    height: '6px',
    background: '#E5E7EB',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: '#6366f1',
    transition: 'width 0.3s ease',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  btnUpload: {
    background: '#fff',
    border: '1px solid #D1D5DB',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#374151',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnRetry: {
    background: '#FEF2F2',
    border: '1px solid #FCA5A5',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#B91C1C',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  divider: {
    fontSize: '11px',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  urlInput: {
    flex: 1,
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '12px',
    outline: 'none',
    background: '#fff',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: '11px',
    color: '#EF4444',
    fontWeight: 500,
    margin: 0,
  },
  hint: {
    fontSize: '11px',
    color: '#9CA3AF',
    margin: 0,
  },
}
