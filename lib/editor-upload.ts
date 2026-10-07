import { createClient } from '@/lib/supabase/client'
import { compressImage } from './editor-image-processing'
import { IMAGE_UPLOAD } from '@/lib/upload-limits'

export interface UploadResult {
  url: string | null
  error: string | null
}

export function validateImage(file: File): string | null {
  if (!IMAGE_UPLOAD.allowedTypes.includes(file.type)) {
    return 'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.'
  }
  if (file.size > IMAGE_UPLOAD.maxOriginalBytes) {
    return `Ukuran file terlalu besar. Maksimal file awal ${IMAGE_UPLOAD.maxOriginalLabel}; gambar akan dikompres otomatis.`
  }
  return null
}

export function generateAssetPath(storeId: string, section: string, element: string, fileName: string): string {
  const extension = 'webp' // Always WebP after compression
  const timestamp = Date.now()
  const cleanSection = section.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const cleanElement = element.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  
  return `${storeId}/${cleanSection}-${cleanElement}-${timestamp}.${extension}`
}

export async function uploadImage(
  file: File,
  storeId: string,
  section: string,
  element: string,
  onProgress?: (p: number) => void
): Promise<UploadResult> {
  // 1. Validate Original
  const validationError = validateImage(file)
  if (validationError) return { url: null, error: validationError }

  try {
    // 2. Compress (simulate progress for compression)
    if (onProgress) onProgress(10)
    const processedFile = await compressImage(file, IMAGE_UPLOAD.maxStoredBytes)
    if (processedFile.size > IMAGE_UPLOAD.maxStoredBytes) {
      return { url: null, error: `Gambar masih terlalu besar setelah dikompres. Target maksimal ${IMAGE_UPLOAD.maxStoredLabel}.` }
    }
    if (onProgress) onProgress(30)

    // 3. Upload using server-side API
    const formData = new FormData()
    formData.append('file', processedFile)
    formData.append('store_id', storeId)
    formData.append('purpose', section) // section determines folder

    if (onProgress) onProgress(50)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (onProgress) onProgress(80)

    const json = await res.json()
    if (!res.ok || json.error) {
      console.error('Upload server error:', json.error)
      return { url: null, error: json.error || 'Gagal mengunggah gambar.' }
    }

    if (onProgress) onProgress(100)
    return { url: json.url, error: null }
  } catch (err: any) {
    console.error('Unexpected upload error:', err)
    return { url: null, error: err.message || 'Terjadi kesalahan sistem saat memproses gambar.' }
  }
}

/**
 * Upload gambar yang sudah di-crop oleh ImageCropperModal.
 * PENTING: JANGAN memanggil compressImage() di sini karena akan
 * menghilangkan bentuk masking (bulat/oval/segilima) yang sudah dibuat.
 * Blob dari cropper sudah diproses sebagai WebP dengan transparansi.
 */
export async function uploadCroppedImage(
  croppedBlob: Blob,
  storeId: string,
  purpose: string = 'brand',
  onProgress?: (p: number) => void
): Promise<UploadResult> {
  try {
    // Ukuran maksimum longgar karena gambar hasil crop sudah kecil
    const maxSizeForCrop = IMAGE_UPLOAD.maxStoredBytes * 3
    if (croppedBlob.size > maxSizeForCrop) {
      return { url: null, error: `Gambar terlalu besar. Coba kurangi zoom atau pilih gambar yang lebih kecil.` }
    }

    if (onProgress) onProgress(20)

    // Buat File dari Blob tanpa kompresi ulang
    const fileName = `cropped-${Date.now()}.webp`
    const file = new File([croppedBlob], fileName, { type: 'image/webp' })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('store_id', storeId)
    formData.append('purpose', purpose)

    if (onProgress) onProgress(50)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (onProgress) onProgress(80)

    const json = await res.json()
    if (!res.ok || json.error) {
      console.error('Upload cropped image error:', json.error)
      return { url: null, error: json.error || 'Gagal mengunggah gambar.' }
    }

    if (onProgress) onProgress(100)
    return { url: json.url, error: null }
  } catch (err: any) {
    console.error('Unexpected upload error:', err)
    return { url: null, error: err.message || 'Terjadi kesalahan sistem saat mengunggah gambar.' }
  }
}

/**
 * Delete an old asset from storage given its public URL
 */
export async function deleteAssetByUrl(url: string) {
  const bucketMatch = url.match(/\/(product-images|editor-images)\//)
  if (!bucketMatch) return
  
  const bucketName = bucketMatch[1]
  const supabase = createClient()
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split(`/${bucketName}/`)
    if (pathParts.length < 2) return
    
    const filePath = pathParts[1]
    await supabase.storage.from(bucketName).remove([filePath])
  } catch (err) {
    console.warn('Failed to cleanup old asset:', err)
  }
}
