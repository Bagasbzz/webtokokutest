import type { EditableElement } from './template-editables'

export interface ValidationError {
  key: string
  message: string
}

const TEXT_MAX = 200
const TEXTAREA_MAX = 1000
const RICHTEXT_MAX = 3000

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateField(field: EditableElement, value: string): string | null {
  if (field.type === 'toggle') {
    if (value !== 'true' && value !== 'false') return 'Nilai harus true atau false'
    return null
  }
  if (field.type === 'image') {
    if (value && !isValidUrl(value)) return 'Format URL tidak valid. Harus dimulai dengan https://'
    return null
  }
  if (field.type === 'text') {
    if (value.length > TEXT_MAX) return `Maksimal ${TEXT_MAX} karakter`
    return null
  }
  if (field.type === 'textarea') {
    if (value.length > TEXTAREA_MAX) return `Maksimal ${TEXTAREA_MAX} karakter`
    return null
  }
  if (field.type === 'richtext') {
    if (value.length > RICHTEXT_MAX) return `Maksimal ${RICHTEXT_MAX} karakter (termasuk tag HTML)`
    return null
  }
  return null
}

export function validateAll(
  schema: EditableElement[],
  formData: Record<string, string>
): ValidationError[] {
  const errors: ValidationError[] = []
  schema.forEach(field => {
    const key = `${field.section}.${field.element}`
    const value = formData[key] ?? field.default_value ?? ''
    const error = validateField(field, value)
    if (error) errors.push({ key, message: error })
  })
  return errors
}
