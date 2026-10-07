import type { ProductAddon, ProductOptionGroup } from '@/lib/types'

export function normalizeOptionGroups(groups: ProductOptionGroup[]) {
  return (groups || [])
    .map((group, groupIndex) => {
      const name = group.name.trim()
      const values = (group.values || [])
        .map((value) => ({
          ...value,
          label: value.label.trim(),
          price_delta: Math.max(0, Number(value.price_delta || 0)),
          stock: Math.max(0, Number(value.stock || 0)),
          weight_delta: Math.max(0, Number(value.weight_delta || 0)),
          color_hex: group.type === 'color' ? value.color_hex : undefined,
        }))
        .filter((value) => value.label)

      if (!name && values.length === 0) return null
      if (!name) throw new Error(`Nama variasi ke-${groupIndex + 1} wajib diisi.`)
      if (values.length === 0) throw new Error(`Variasi "${name}" harus memiliki minimal satu pilihan.`)

      return {
        ...group,
        name,
        required: Boolean(group.required),
        values,
      }
    })
    .filter(Boolean) as ProductOptionGroup[]
}

export function normalizeAddons(addons: ProductAddon[]) {
  return (addons || [])
    .map((addon, addonIndex) => {
      const name = addon.name.trim()
      const price = Math.max(0, Number(addon.price || 0))
      const max_qty = Math.max(1, Number(addon.max_qty || 1))

      if (!name && price === 0) return null
      if (!name) throw new Error(`Nama tambahan ke-${addonIndex + 1} wajib diisi.`)

      return {
        ...addon,
        name,
        price,
        max_qty,
        required: Boolean(addon.required),
      }
    })
    .filter(Boolean) as ProductAddon[]
}
