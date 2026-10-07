/**
 * API Functions for Template Editor
 */

import { createClient } from '@/lib/supabase/client'
import type { TemplateId } from '@/lib/types'
import type { TemplateCustomization, SectionContent } from './types'
import { getSectionDefinition } from './definitions'
import {
  sanitizeColorValue,
  sanitizePlainText,
  sanitizeRichHtml,
  sanitizeUrl,
} from '@/lib/customization-security'

function sanitizeLegacyValue(fieldName: string, value: any): any {
  if (value === null || value === undefined) return value
  if (typeof value === 'boolean' || typeof value === 'number') return value

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLegacyValue(fieldName, item))
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeLegacyValue(key, nestedValue)])
    )
  }

  const text = String(value)
  const normalized = fieldName.toLowerCase()

  if (
    normalized.endsWith('_url') ||
    normalized === 'url' ||
    normalized === 'image' ||
    normalized.includes('image')
  ) {
    return sanitizeUrl(text, 'image')
  }

  if (normalized.includes('color')) {
    return sanitizeColorValue(text)
  }

  if (normalized === 'text' || normalized === 'description' || normalized === 'subtitle') {
    return sanitizePlainText(text)
  }

  if (normalized === 'title') {
    return sanitizeRichHtml(text)
  }

  return sanitizePlainText(text)
}

function sanitizeLegacySectionContent(
  templateId: TemplateId,
  sectionId: string,
  content: SectionContent
): { content?: SectionContent; error?: string } {
  const section = getSectionDefinition(templateId, sectionId)
  if (!section) {
    return { error: `Section tidak diizinkan: ${sectionId}` }
  }

  const allowedKeys = new Set(section.editable)
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(content as Record<string, any>)) {
    if (!allowedKeys.has(key)) {
      return { error: `Field section tidak diizinkan: ${sectionId}.${key}` }
    }
    sanitized[key] = sanitizeLegacyValue(key, value)
  }

  return { content: sanitized as SectionContent }
}

/**
 * Get all template customizations for a store
 */
export async function getTemplateCustomizations(storeId: string): Promise<TemplateCustomization[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('template_customizations')
    .select('*')
    .eq('store_id', storeId)
    .order('section_id')
  
  if (error) {
    console.error('Error fetching template customizations:', error)
    return []
  }
  
  return data || []
}

/**
 * Get customization for specific section
 */
export async function getSectionCustomization(
  storeId: string,
  templateId: TemplateId,
  sectionId: string
): Promise<TemplateCustomization | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('template_customizations')
    .select('*')
    .eq('store_id', storeId)
    .eq('template_id', templateId)
    .eq('section_id', sectionId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No customization exists yet
      return null
    }
    console.error('Error fetching section customization:', error)
    return null
  }
  
  return data
}

/**
 * Save or update template customization
 */
export async function saveTemplateCustomization(
  storeId: string,
  templateId: TemplateId,
  sectionId: string,
  content: SectionContent,
  isVisible: boolean = true
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const sanitized = sanitizeLegacySectionContent(templateId, sectionId, content)
    if (sanitized.error || !sanitized.content) {
      return { success: false, error: sanitized.error || 'Konten section tidak valid' }
    }

    const { error } = await supabase
      .from('template_customizations')
      .upsert({
        store_id: storeId,
        template_id: templateId,
        section_id: sectionId,
        is_visible: isVisible,
        content: sanitized.content,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'store_id,template_id,section_id'
      })
    
    if (error) {
      console.error('Error saving template customization:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete/hide template section
 */
export async function deleteTemplateSection(
  storeId: string,
  templateId: TemplateId,
  sectionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('template_customizations')
      .update({ 
        is_visible: false,
        updated_at: new Date().toISOString()
      })
      .eq('store_id', storeId)
      .eq('template_id', templateId)
      .eq('section_id', sectionId)
    
    if (error) {
      console.error('Error deleting template section:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Restore/show template section
 */
export async function restoreTemplateSection(
  storeId: string,
  templateId: TemplateId,
  sectionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('template_customizations')
      .update({ 
        is_visible: true,
        updated_at: new Date().toISOString()
      })
      .eq('store_id', storeId)
      .eq('template_id', templateId)
      .eq('section_id', sectionId)
    
    if (error) {
      console.error('Error restoring template section:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadTemplateImage(
  storeId: string,
  file: File,
  sectionId: string,
  fieldName: string
): Promise<{ url: string; error?: string }> {
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
      console.error('Error uploading image:', result.error)
      return { url: '', error: result.error || 'Gagal mengunggah gambar' }
    }

    return { url: result.url }
  } catch (error: any) {
    console.error('Unexpected error uploading image:', error)
    return { url: '', error: error.message }
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteTemplateImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    // Extract file path from URL
    const url = new URL(imageUrl)
    const filePath = url.pathname.split('/template-assets/')[1]
    
    if (!filePath) {
      return { success: false, error: 'Invalid image URL' }
    }
    
    const { error } = await supabase
      .storage
      .from('template-assets')
      .remove([filePath])
    
    if (error) {
      console.error('Error deleting image:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error deleting image:', error)
    return { success: false, error: error.message }
  }
}
