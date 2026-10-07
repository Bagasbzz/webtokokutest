import { TEMPLATE_EDITABLES, type EditableElement, type EditableElementType } from './template-editables'

const MAX_VALUE_LENGTH = 8000
const KEY_PATTERN = /^[a-z0-9_]+\.[a-z0-9_]+$/i

const ALLOWED_RICH_TAGS = new Set(['br', 'p', 'strong', 'b', 'em', 'i', 'u', 'span'])
const BLOCKED_HTML_BLOCKS =
  /<\s*(script|style|iframe|object|embed|form|svg|math|meta|link|base|template)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi
const BLOCKED_HTML_TAGS =
  /<\s*\/?\s*(script|style|iframe|object|embed|form|svg|math|meta|link|base|template)[^>]*\/?\s*>/gi
const ANY_HTML_TAG = /<\s*(\/?)\s*([a-z][a-z0-9-]*)(?:\s[^>]*)?(\/?)\s*>/gi

const SAFE_COLOR =
  /^(#[0-9a-f]{3,8}|rgb\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*\)|rgba\(\s*(?:\d{1,3}\s*,\s*){3}(?:0|1|0?\.\d+)\s*\)|hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)|hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(?:0|1|0?\.\d+)\s*\))$/i

const SAFE_FONTS = new Set([
  'Inter',
  'Outfit',
  'Montserrat',
  'Playfair Display',
  'Plus Jakarta Sans',
  'Cinzel',
  'Syne',
  'Fraunces',
])

const URL_FIELD_TYPES: EditableElementType[] = ['image', 'link', 'video']

export type SanitizedCustomization = {
  ok: true
  value: string
} | {
  ok: false
  error: string
}

function trimValue(value: unknown) {
  if (value === null || value === undefined) return ''
  return String(value).slice(0, MAX_VALUE_LENGTH).replace(/\u0000/g, '').trim()
}

export function isValidCustomizationKey(key: string) {
  return KEY_PATTERN.test(key)
}

export function stripDangerousHtmlBlocks(input: string) {
  return input
    .replace(BLOCKED_HTML_BLOCKS, '')
    .replace(BLOCKED_HTML_TAGS, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}

export function sanitizePlainText(input: unknown) {
  return stripDangerousHtmlBlocks(trimValue(input))
    .replace(ANY_HTML_TAG, '')
    .replace(/\s+\n/g, '\n')
}

export function sanitizeRichHtml(input: unknown) {
  const cleaned = stripDangerousHtmlBlocks(trimValue(input))
  return cleaned.replace(ANY_HTML_TAG, (match, closeSlash, tagName) => {
    const tag = String(tagName).toLowerCase()
    if (!ALLOWED_RICH_TAGS.has(tag)) return ''
    if (tag === 'br') return '<br>'
    return closeSlash ? `</${tag}>` : `<${tag}>`
  })
}

export function sanitizeUrl(input: unknown, type: EditableElementType = 'link') {
  const value = trimValue(input)
  if (!value) return ''
  const lower = value.toLowerCase()
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.startsWith('blob:') ||
    lower.startsWith('//')
  ) {
    return ''
  }

  if (value.startsWith('/')) return value

  try {
    const parsed = new URL(value)
    if (parsed.protocol === 'https:') return parsed.toString()
    if (type === 'link' && (parsed.protocol === 'mailto:' || parsed.protocol === 'tel:')) return parsed.toString()
  } catch {
    return ''
  }

  return ''
}

export function sanitizeColorValue(input: unknown) {
  const value = trimValue(input)
  if (!value) return ''
  return SAFE_COLOR.test(value) ? value : ''
}

export function sanitizeFontValue(input: unknown) {
  const value = trimValue(input)
  return SAFE_FONTS.has(value) ? value : ''
}

export function sanitizeThemeColorList(input: unknown, fallback = '#16a34a') {
  const parts = trimValue(input).split(',').map((part) => sanitizeColorValue(part)).filter(Boolean)
  if (parts.length === 0) return fallback
  return parts.slice(0, 2).join(',')
}

export function sanitizeCssUrlForInlineBackground(input: unknown) {
  const value = sanitizeUrl(input, 'image')
  return value.replace(/["'()\\\n\r]/g, '')
}

export function getAllowedCustomizationField(templateId: string, key: string): EditableElement | null {
  if (!isValidCustomizationKey(key)) return null
  const [section, element] = key.split('.')
  return (TEMPLATE_EDITABLES[templateId] || []).find((field) => {
    return field.section === section && field.element === element
  }) || null
}

export function getAllowedCustomizationFieldFromAnyTemplate(key: string): EditableElement | null {
  if (!isValidCustomizationKey(key)) return null
  for (const templateId of Object.keys(TEMPLATE_EDITABLES)) {
    const field = getAllowedCustomizationField(templateId, key)
    if (field) return field
  }
  return null
}

export function sanitizeCustomizationValue(field: EditableElement, value: unknown): SanitizedCustomization {
  if (value !== null && value !== undefined && String(value).length > MAX_VALUE_LENGTH) {
    return { ok: false, error: `${field.section}.${field.element} terlalu panjang` }
  }

  if (field.type === 'toggle') {
    const text = trimValue(value).toLowerCase()
    return { ok: true, value: text === 'false' ? 'false' : 'true' }
  }

  if (field.type === 'richtext') {
    return { ok: true, value: sanitizeRichHtml(value) }
  }

  if (URL_FIELD_TYPES.includes(field.type)) {
    return { ok: true, value: sanitizeUrl(value, field.type) }
  }

  if (field.type === 'color' || field.type === 'gradient') {
    const safe = sanitizeColorValue(value)
    if (!safe && trimValue(value)) return { ok: false, error: `${field.section}.${field.element} bukan warna yang valid` }
    return { ok: true, value: safe }
  }

  return { ok: true, value: sanitizePlainText(value) }
}

export function sanitizeCustomizationEntry(
  key: string,
  value: unknown,
  templateId?: string
): SanitizedCustomization {
  if (!isValidCustomizationKey(key)) {
    return { ok: false, error: `Key kustomisasi tidak valid: ${key}` }
  }

  const field = templateId
    ? getAllowedCustomizationField(templateId, key)
    : getAllowedCustomizationFieldFromAnyTemplate(key)

  if (!field) {
    return { ok: false, error: `Field kustomisasi tidak diizinkan: ${key}` }
  }

  return sanitizeCustomizationValue(field, value)
}

export function sanitizeCustomizationMap(customizations?: Record<string, string>) {
  if (!customizations) return {}
  return Object.fromEntries(
    Object.entries(customizations).map(([key, value]) => {
      if (key.endsWith('_url') || key.endsWith('.article_url') || key.includes('map_url') || key.includes('youtube_url')) {
        return [key, sanitizeUrl(value)]
      }
      return [key, sanitizePlainText(value)]
    })
  )
}
