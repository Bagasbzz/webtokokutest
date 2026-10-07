import type { ProductAddon, ProductDetails, ProductOptionGroup, ProductOptionType } from '@/lib/types'

const optionTypes = new Set(['size', 'color', 'portion', 'shade', 'flavor', 'scent', 'material', 'topping', 'custom'])

export function parseOptionGroups(input: string): ProductOptionGroup[] {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, groupIndex) => {
      const [nameRaw, requiredRaw, typeRaw, valuesRaw = ''] = line.split('|')
      const type = optionTypes.has((typeRaw || '').trim()) ? (typeRaw.trim() as ProductOptionType) : 'custom'
      const values = valuesRaw
        .split(';')
        .map((value, valueIndex) => {
          const [labelRaw, priceRaw, stockRaw, colorRaw] = value.split(',').map((part) => part.trim())
          if (!labelRaw) return null
          return {
            id: `opt-${groupIndex}-${valueIndex}`,
            label: labelRaw,
            price_delta: Number(priceRaw || 0),
            stock: stockRaw ? Number(stockRaw) : undefined,
            color_hex: colorRaw || undefined,
          }
        })
        .filter(Boolean) as ProductOptionGroup['values']

      return {
        id: `group-${groupIndex}`,
        name: (nameRaw || 'Pilihan').trim(),
        required: (requiredRaw || '').trim().toLowerCase() !== 'opsional',
        type,
        values,
      }
    })
    .filter((group) => group.values.length > 0)
}

export function stringifyOptionGroups(groups?: ProductOptionGroup[]) {
  return (groups || [])
    .map((group) => `${group.name}|${group.required ? 'wajib' : 'opsional'}|${group.type}|${group.values.map((value) => `${value.label},${value.price_delta || 0},${value.stock || ''},${value.color_hex || ''}`).join(';')}`)
    .join('\n')
}

export function parseAddons(input: string): ProductAddon[] {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [name, price, maxQty] = line.split('|').map((part) => part.trim())
      return {
        id: `addon-${index}`,
        name,
        price: Number(price || 0),
        max_qty: Number(maxQty || 1),
      }
    })
    .filter((addon) => addon.name)
}

export function stringifyAddons(addons?: ProductAddon[]) {
  return (addons || []).map((addon) => `${addon.name}|${addon.price || 0}|${addon.max_qty || 1}`).join('\n')
}

export function compactDetails(details: ProductDetails): ProductDetails {
  return Object.fromEntries(
    Object.entries(details).filter(([, value]) => String(value || '').trim() !== ''),
  ) as ProductDetails
}
