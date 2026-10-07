import sharp from 'sharp'

export type SafeImageFormat = 'jpg' | 'png' | 'webp'

type ProcessImageOptions = {
  maxOriginalBytes: number
  maxOriginalLabel: string
  maxStoredBytes?: number
  maxStoredLabel?: string
  maxDimension: number
  outputFormat: SafeImageFormat
}

type ProcessedImage =
  | {
      ok: true
      buffer: Buffer
      contentType: string
      extension: SafeImageFormat
      width: number
      height: number
      originalFormat: SafeImageFormat
    }
  | {
      ok: false
      status: number
      error: string
    }

const CONTENT_TYPES: Record<SafeImageFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

function detectImageFormat(buffer: Buffer): SafeImageFormat | null {
  if (buffer.length < 12) return null

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg'
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png'
  }

  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp'
  }

  return null
}

function createPipeline(input: Buffer, maxDimension: number) {
  return sharp(input, {
    failOn: 'error',
    limitInputPixels: maxDimension * maxDimension * 2,
  })
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: 'inside',
      withoutEnlargement: true,
    })
}

async function encodeImage(input: Buffer, format: SafeImageFormat, maxDimension: number, quality = 82) {
  const pipeline = createPipeline(input, maxDimension)

  if (format === 'png') {
    return pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer()
  }

  if (format === 'jpg') {
    return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer()
  }

  return pipeline.webp({ quality, effort: 4 }).toBuffer()
}

export function safeStorageSegment(value: string | null | undefined, fallback = 'unknown') {
  const cleaned = String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return cleaned || fallback
}

export async function processImageUpload(file: File, options: ProcessImageOptions): Promise<ProcessedImage> {
  if (!file || file.size <= 0) {
    return { ok: false, status: 400, error: 'File tidak ditemukan atau kosong' }
  }

  if (file.size > options.maxOriginalBytes) {
    return {
      ok: false,
      status: 400,
      error: `Ukuran file maksimal ${options.maxOriginalLabel}`,
    }
  }

  const originalBuffer = Buffer.from(await file.arrayBuffer())
  const originalFormat = detectImageFormat(originalBuffer)

  if (!originalFormat) {
    return {
      ok: false,
      status: 400,
      error: 'Format file tidak valid. Gunakan JPG, PNG, atau WEBP.',
    }
  }

  try {
    const metadata = await sharp(originalBuffer, {
      failOn: 'error',
      limitInputPixels: options.maxDimension * options.maxDimension * 2,
    }).metadata()

    if (!metadata.width || !metadata.height) {
      return { ok: false, status: 400, error: 'File gambar tidak valid' }
    }

    let output = await encodeImage(originalBuffer, options.outputFormat, options.maxDimension)

    if (options.maxStoredBytes && output.length > options.maxStoredBytes && options.outputFormat !== 'png') {
      for (const quality of [74, 66, 58, 50, 42]) {
        output = await encodeImage(originalBuffer, options.outputFormat, options.maxDimension, quality)
        if (output.length <= options.maxStoredBytes) break
      }
    }

    if (options.maxStoredBytes && output.length > options.maxStoredBytes) {
      return {
        ok: false,
        status: 400,
        error: `Gambar terlalu besar setelah diproses. Maksimal ${options.maxStoredLabel || 'file tersimpan terlalu besar'}.`,
      }
    }

    const finalMetadata = await sharp(output, {
      failOn: 'error',
      limitInputPixels: options.maxDimension * options.maxDimension * 2,
    }).metadata()

    return {
      ok: true,
      buffer: output,
      contentType: CONTENT_TYPES[options.outputFormat],
      extension: options.outputFormat,
      width: finalMetadata.width || metadata.width,
      height: finalMetadata.height || metadata.height,
      originalFormat,
    }
  } catch {
    return {
      ok: false,
      status: 400,
      error: 'File gambar rusak atau tidak bisa diproses',
    }
  }
}
