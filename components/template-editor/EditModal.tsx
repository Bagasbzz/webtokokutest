'use client'

/**
 * Edit Modal Component
 * 
 * Modal untuk edit section content.
 * Menampilkan field yang bisa diedit berdasarkan section definition.
 */

import { useState, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, Type, List } from 'lucide-react'
import type { SectionDefinition } from '@/lib/template-editor/definitions'
import type { SectionContent } from '@/lib/template-editor/types'
import { uploadTemplateImage } from '@/lib/template-editor/api'
import { ImageUpload } from './ImageUpload'

interface EditModalProps {
  sectionId: string
  section: SectionDefinition
  content: SectionContent
  onSave: (content: SectionContent) => void
  onClose: () => void
}

export function EditModal({ 
  sectionId, 
  section, 
  content, 
  onSave, 
  onClose 
}: EditModalProps) {
  const [editedContent, setEditedContent] = useState<SectionContent>(content)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'list'>('text')

  useEffect(() => {
    setEditedContent(content)
  }, [content])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(editedContent)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (field: string, file: File) => {
    try {
      // For now, we'll use a placeholder URL
      // In real implementation, you'd call uploadTemplateImage
      const url = URL.createObjectURL(file)
      setEditedContent((prev: SectionContent) => ({
        ...prev,
        [field]: url
      }))
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  const handleListChange = (field: string, index: number, subField: string, value: any) => {
    setEditedContent((prev: SectionContent) => {
      const currentArray = prev[field as keyof SectionContent] as any[]
      return {
        ...prev,
        [field]: currentArray.map((item: any, i: number) => 
          i === index ? { ...item, [subField]: value } : item
        )
      }
    })
  }

  const addListItem = (field: string) => {
    const newItem = field.includes('product') || field.includes('menu') 
      ? { name: '', price: '', description: '', image: '' }
      : field.includes('testimonial')
      ? { name: '', text: '', rating: 5 }
      : field.includes('benefit')
      ? { title: '', description: '' }
      : field.includes('ingredient')
      ? { name: '', benefit: '' }
      : field.includes('service')
      ? { name: '', description: '', icon: 'service' }
      : field.includes('cert')
      ? { name: '', description: '' }
      : { name: '', url: '' }

    setEditedContent((prev: SectionContent) => ({
      ...prev,
      [field]: [...(prev[field as keyof SectionContent] as any[]), newItem]
    }))
  }

  const removeListItem = (field: string, index: number) => {
    setEditedContent((prev: SectionContent) => {
      const currentArray = prev[field as keyof SectionContent] as any[]
      return {
        ...prev,
        [field]: currentArray.filter((_: any, i: number) => i !== index)
      }
    })
  }

  const renderField = (fieldName: string) => {
    const value = editedContent[fieldName as keyof SectionContent]
    const fieldLabel = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    if (fieldName.includes('image') || fieldName.includes('url')) {
      return (
        <div key={fieldName} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {fieldLabel}
          </label>
          <ImageUpload
            value={value as string}
            onChange={(url: string) => setEditedContent((prev: SectionContent) => ({
              ...prev,
              [fieldName]: url
            }))}
            accept="image/*"
          />
        </div>
      )
    }

    if (fieldName.includes('color')) {
      return (
        <div key={fieldName} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {fieldLabel}
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={value as string || '#000000'}
              onChange={(e) => setEditedContent((prev: SectionContent) => ({
                ...prev,
                [fieldName]: e.target.value
              }))}
              className="h-10 w-20"
            />
            <input
              type="text"
              value={value as string || ''}
              onChange={(e) => setEditedContent((prev: SectionContent) => ({
                ...prev,
                [fieldName]: e.target.value
              }))}
              placeholder="#000000"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )
    }

    if (typeof value === 'boolean') {
      return (
        <div key={fieldName} className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setEditedContent((prev: SectionContent) => ({
                ...prev,
                [fieldName]: e.target.checked
              }))}
              className="w-4 h-4 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {fieldLabel}
            </span>
          </label>
        </div>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div key={fieldName} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              {fieldLabel}
            </label>
            <button
              onClick={() => addListItem(fieldName)}
              className="text-emerald-700 hover:text-emerald-700 text-sm"
            >
              + Add Item
            </button>
          </div>
          <div className="space-y-3">
            {(value as any[]).map((item: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-sm">Item {index + 1}</h4>
                  <button
                    onClick={() => removeListItem(fieldName, index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3">
                  {Object.keys(item).map(key => (
                    <div key={key} className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      {key === 'rating' ? (
                        <select
                          value={item[key]}
                          onChange={(e) => handleListChange(fieldName, index, key, parseInt(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {[1,2,3,4,5].map(rating => (
                            <option key={rating} value={rating}>{rating} Stars</option>
                          ))}
                        </select>
                      ) : key.includes('image') ? (
                        <ImageUpload
                          value={item[key]}
                          onChange={(url) => handleListChange(fieldName, index, key, url)}
                        />
                      ) : (
                        <input
                          type="text"
                          value={item[key]}
                          onChange={(e) => handleListChange(fieldName, index, key, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div key={fieldName} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {fieldLabel}
        </label>
        {fieldName.includes('description') || fieldName.includes('text') ? (
          <textarea
            value={value as string || ''}
            onChange={(e) => setEditedContent((prev: SectionContent) => ({
              ...prev,
              [fieldName]: e.target.value
            }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
          />
        ) : (
          <input
            type="text"
            value={value as string || ''}
            onChange={(e) => setEditedContent((prev: SectionContent) => ({
              ...prev,
              [fieldName]: e.target.value
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
          />
        )}
      </div>
    )
  }

  // Determine which tab to show
  const hasTextFields = section.editable.some(field => 
    !field.includes('image') && !Array.isArray(content[field as keyof SectionContent])
  )
  const hasImageFields = section.editable.some(field => 
    field.includes('image') || field.includes('url')
  )
  const hasListFields = section.editable.some(field => 
    Array.isArray(content[field as keyof SectionContent])
  )

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">Edit {sectionId}</h2>
              <p className="text-sm text-gray-600">
                {section.required && 'Required section • '}
                {section.editable.length} fields editable
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          {(hasTextFields && hasImageFields) || hasListFields ? (
            <div className="flex border-b">
              {hasTextFields && (
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === 'text'
                      ? 'text-emerald-700 border-b-2 border-emerald-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  Text
                </button>
              )}
              {hasImageFields && (
                <button
                  onClick={() => setActiveTab('image')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === 'image'
                      ? 'text-emerald-700 border-b-2 border-emerald-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Images
                </button>
              )}
              {hasListFields && (
                <button
                  onClick={() => setActiveTab('list')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === 'list'
                      ? 'text-emerald-700 border-b-2 border-emerald-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Lists
                </button>
              )}
            </div>
          ) : null}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-6">
              {section.editable
                .filter(field => {
                  if (activeTab === 'text') return !field.includes('image') && !Array.isArray(content[field as keyof SectionContent])
                  if (activeTab === 'image') return field.includes('image') || field.includes('url')
                  if (activeTab === 'list') return Array.isArray(content[field as keyof SectionContent])
                  return true
                })
                .map(renderField)}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
