import React from 'react'
import { ProductVariant } from '@/types/commerce'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariantIds: Record<string, string>
  onSelect: (variant: ProductVariant) => void
}

export function VariantSelector({ variants, selectedVariantIds, onSelect }: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null

  // Group variants by name (e.g., "Ukuran", "Warna")
  const groupedVariants = variants.reduce((acc, variant) => {
    if (!acc[variant.name]) acc[variant.name] = []
    acc[variant.name].push(variant)
    return acc
  }, {} as Record<string, ProductVariant[]>)

  return (
    <div className="flex flex-col gap-4 mt-6">
      {Object.entries(groupedVariants).map(([name, options]) => (
        <div key={name} className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-900">{name}</span>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const groupKey = opt.groupId || name
              const isSelected = selectedVariantIds[groupKey] === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => onSelect(opt)}
                  className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                    isSelected 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {opt.colorHex && (
                    <span
                      className="mr-2 inline-block h-3 w-3 rounded-full border border-black/10 align-middle"
                      style={{ backgroundColor: opt.colorHex }}
                    />
                  )}
                  {opt.value}
                  {opt.priceDelta ? ` +Rp ${opt.priceDelta.toLocaleString('id-ID')}` : ''}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
