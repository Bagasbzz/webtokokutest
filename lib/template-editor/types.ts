/**
 * Type Definitions for Template Editor
 */

import type { TemplateId } from '@/lib/types'

// Section content types
export interface HeroContent {
  title: string
  subtitle: string
  description: string
  image_url: string
  cta_text: string
  background_color: string
}

export interface AboutContent {
  title: string
  text: string
  image_url: string
}

export interface ContactContent {
  title: string
  address: string
  phone: string
  show_map: boolean
}

export interface FooterContent {
  copyright: string
  social_links: Array<{
    platform: string
    url: string
  }>
}

export interface MenuHighlightsContent {
  title: string
  items: Array<{
    name: string
    price: string
    description: string
  }>
}

export interface FeaturedProductsContent {
  title: string
  products: Array<{
    name: string
    price: string
    image: string
  }>
}

export interface BenefitsContent {
  title: string
  items: Array<{
    title: string
    description: string
  }>
}

export interface IngredientsContent {
  title: string
  items: Array<{
    name: string
    benefit: string
  }>
}

export interface ProductShowcaseContent {
  title: string
  products: Array<{
    name: string
    price: string
    image: string
  }>
}

export interface TestimonialsContent {
  title: string
  testimonials: Array<{
    name: string
    text: string
    rating: number
  }>
}

export interface ServicesContent {
  title: string
  services: Array<{
    name: string
    description: string
    icon: string
  }>
}

export interface CertificationsContent {
  title: string
  certifies: Array<{
    name: string
    description: string
  }>
}

// Union type for all section content types
export type SectionContent = 
  | HeroContent
  | AboutContent
  | ContactContent
  | FooterContent
  | MenuHighlightsContent
  | FeaturedProductsContent
  | BenefitsContent
  | IngredientsContent
  | ProductShowcaseContent
  | TestimonialsContent
  | ServicesContent
  | CertificationsContent

// Database types
export interface TemplateCustomization {
  id: string
  store_id: string
  template_id: TemplateId
  section_id: string
  is_visible: boolean
  content: SectionContent
  created_at: string
  updated_at: string
}

// Editor state types
export interface EditorState {
  templateId: TemplateId
  customizations: TemplateCustomization[]
  editingSection: string | null
  previewMode: boolean
  saving: boolean
  saved: boolean
}

export interface EditModalState {
  isOpen: boolean
  sectionId: string | null
  content: SectionContent | null
  field?: 'text' | 'image' | 'list'
}

// API types
export interface SaveCustomizationRequest {
  storeId: string
  templateId: TemplateId
  sectionId: string
  content: SectionContent
  isVisible: boolean
}

export interface SaveCustomizationResponse {
  success: boolean
  data?: TemplateCustomization
  error?: string
}

// Component props types
export interface EditableSectionProps {
  section: {
    id: string
    type: string
    required: boolean
    editable: string[]
    deletable: boolean
  }
  customization: TemplateCustomization
  onEdit: (sectionId: string) => void
  onDelete: (sectionId: string) => void
  onToggleVisibility: (sectionId: string) => void
}

export interface EditModalProps {
  sectionId: string
  content: SectionContent
  editableFields: string[]
  onSave: (content: SectionContent) => void
  onClose: () => void
}

export interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  accept?: string
  maxSize?: number
}

// Helper type for template customization
export interface TemplateCustomization {
  section_id: string
  is_visible: boolean
  content: SectionContent
}

// Export types for easier usage
export type { TemplateId } from '@/lib/types'
