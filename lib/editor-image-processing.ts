/**
 * Browser-side image compression and normalization
 */

const MAX_WIDTH = 1400
const QUALITY_STEPS = [0.78, 0.68, 0.58, 0.48]

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('Canvas toBlob failed'))
      else resolve(blob)
    }, type, quality)
  })
}

export async function compressImage(file: File, targetBytes = 750 * 1024): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // 1. Normalize Dimensions
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width)
          width = MAX_WIDTH
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // 2. Determine format (prefer WebP)
        const format = 'image/webp'

        try {
          let bestBlob: Blob | null = null
          for (const quality of QUALITY_STEPS) {
            bestBlob = await canvasToBlob(canvas, format, quality)
            if (bestBlob.size <= targetBytes) break
          }

          if (!bestBlob) {
            reject(new Error('Image compression failed'))
            return
          }

          const newFile = new File([bestBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: format,
              lastModified: Date.now(),
          })
          resolve(newFile)
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = () => reject(new Error('Image load failed'))
    }
    reader.onerror = () => reject(new Error('FileReader failed'))
  })
}
