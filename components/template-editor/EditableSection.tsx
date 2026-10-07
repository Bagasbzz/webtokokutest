'use client'

/**
 * Editable Section Component
 * 
 * Wrapper untuk setiap section yang bisa diedit.
 * Menampilkan tombol edit, delete, dan toggle visibility.
 */

import { useState } from 'react'
import { Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import type { SectionDefinition } from '@/lib/template-editor/definitions'
import type { TemplateCustomization } from '@/lib/template-editor/types'
import { SectionRenderer } from './SectionRenderer'

interface EditableSectionProps {
  section: SectionDefinition
  customization: TemplateCustomization
  onEdit: (sectionId: string) => void
  onDelete: (sectionId: string) => void
  onToggleVisibility: (sectionId: string) => void
}

export function EditableSection({ 
  section, 
  customization, 
  onEdit, 
  onDelete, 
  onToggleVisibility 
}: EditableSectionProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (!customization.is_visible) {
    return (
      <div className="hidden-section border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EyeOff className="w-5 h-5 text-gray-400" />
            <span className="text-gray-500">
              Section {section.id} disembunyikan
            </span>
          </div>
          <button
            onClick={() => onToggleVisibility(section.id)}
            className="text-emerald-700 hover:text-emerald-700 text-sm"
          >
            Tampilkan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`editable-section relative group ${
        isHovered ? 'ring-2 ring-blue-200 rounded-lg' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-section-id={section.id}
    >
      {/* Section Controls */}
      <div className={`absolute top-4 right-4 z-10 flex items-center gap-2 transition-opacity ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Drag Handle (visual only) */}
        <div className="bg-white rounded shadow-md p-1.5 cursor-move">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        
        {/* Edit Button */}
        <button
          onClick={() => onEdit(section.id)}
          className="bg-white rounded shadow-md p-1.5 hover:bg-emerald-50 transition-colors"
          title="Edit section"
        >
          <Edit className="w-4 h-4 text-emerald-700" />
        </button>
        
        {/* Visibility Toggle */}
        <button
          onClick={() => onToggleVisibility(section.id)}
          className="bg-white rounded shadow-md p-1.5 hover:bg-gray-50 transition-colors"
          title="Toggle visibility"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </button>
        
        {/* Delete Button (if deletable) */}
        {section.deletable && (
          <button
            onClick={() => onDelete(section.id)}
            className="bg-white rounded shadow-md p-1.5 hover:bg-red-50 transition-colors"
            title="Hide section"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        )}
      </div>

      {/* Section Badge */}
      <div className={`absolute top-4 left-4 z-10 transition-opacity ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="bg-emerald-700 text-white text-xs px-2 py-1 rounded-full">
          {section.id}
          {section.required && ' *'}
        </div>
      </div>

      {/* Section Content */}
      <div 
        className="section-content cursor-pointer"
        onClick={() => onEdit(section.id)}
      >
        <SectionRenderer 
          type={section.type}
          content={customization.content}
          sectionId={section.id}
        />
      </div>

      {/* Section Footer (when hovered) */}
      {isHovered && (
        <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
          Click to edit • {section.editable.length} fields editable
        </div>
      )}
    </div>
  )
}
