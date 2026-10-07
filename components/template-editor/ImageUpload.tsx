'use client'

/**
 * Image Upload Component
 * 
 * Component untuk upload dan preview gambar.
 * Mendukung drag & drop dan click to upload.
 * Setelah crop, gambar langsung diupload ke server (bukan hanya objectURL lokal).
 */

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { ImageCropperModal } from '../editor/ImageCropperModal'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/ToastContainer'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  accept?: string
  maxSize?: number
  className?: string
  aspectRatio?: number
  cropShape?: 'circle' | 'rect'
  storeId?: string // Diperlukan untuk upload ke server
}

export function ImageUpload({ 
  value, 
  onChange, 
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
  aspectRatio = 4 / 3,
  cropShape = 'rect',
  storeId
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toasts, toast, dismiss } = useToast()

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Format berkas salah! Silakan pilih file gambar (PNG, JPG, GIF, WEBP).')
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      toast.warning(`Ukuran file terlalu besar! Maksimal ukuran file adalah ${maxSize / 1024 / 1024}MB.`)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setCropSrc(objectUrl)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropSrc(null)
    setIsUploading(true)
    try {
      if (storeId) {
        // Upload ke server - jangan pakai compressImage agar masking tidak hilang
        const fileName = `editor-cropped-${Date.now()}.webp`
        const file = new File([croppedBlob], fileName, { type: 'image/webp' })

        const formData = new FormData()
        formData.append('file', file)
        formData.append('store_id', storeId)
        formData.append('purpose', 'editor')

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const json = await res.json().catch(() => ({}))

        if (!res.ok || json.error) {
          toast.error(json.error || 'Gagal mengunggah gambar. Silakan coba lagi.')
          return
        }

        onChange(json.url)
      } else {
        // Fallback: objectURL lokal jika tidak ada storeId
        const url = URL.createObjectURL(croppedBlob)
        onChange(url)
      }
    } catch (error) {
      console.error('Error uploading cropped image:', error)
      toast.error('Gagal memproses dan mengunggah gambar. Silakan coba lagi.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemove = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`image-upload ${className}`}>
      {value ? (
        // Preview mode
        <div className="relative group">
          <div className="relative overflow-hidden rounded-lg border border-gray-200">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-48 object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Change image"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRemove}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Upload mode
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragging 
              ? 'border-emerald-400 bg-emerald-50'
              : isUploading
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-gray-600">Mengunggah...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-lg font-medium text-gray-700 mb-1">
                Drop image here or click to upload
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to {maxSize / 1024 / 1024}MB
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {cropSrc && (
        <ImageCropperModal
          src={cropSrc}
          aspectRatio={aspectRatio}
          cropShape={cropShape}
          onClose={() => setCropSrc(null)}
          onCrop={handleCropComplete}
          title="Sesuaikan Foto Template"
        />
      )}

      {/* Container Toast untuk notifikasi error/warning lokal */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
