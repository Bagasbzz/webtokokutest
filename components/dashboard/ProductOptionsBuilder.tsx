'use client'

import { Plus, Trash2 } from 'lucide-react'
import type { ProductAddon, ProductOptionGroup, ProductOptionType, ProductOptionValue } from '@/lib/types'
import styles from './ProductOptionsBuilder.module.css'

const OPTION_TYPES: Array<{ value: ProductOptionType; label: string }> = [
  { value: 'size', label: 'Ukuran' },
  { value: 'color', label: 'Warna' },
  { value: 'portion', label: 'Porsi' },
  { value: 'shade', label: 'Shade' },
  { value: 'flavor', label: 'Rasa' },
  { value: 'scent', label: 'Aroma' },
  { value: 'material', label: 'Bahan' },
  { value: 'topping', label: 'Topping' },
  { value: 'custom', label: 'Lainnya' },
]

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toNumber(value: string) {
  const cleaned = value.replace(/[^\d-]/g, '')
  return cleaned ? Number(cleaned) : 0
}

function emptyValue(): ProductOptionValue {
  return {
    id: makeId('opt'),
    label: '',
    price_delta: 0,
    stock: 0,
    weight_delta: 0,
  }
}

function emptyGroup(): ProductOptionGroup {
  return {
    id: makeId('group'),
    name: '',
    type: 'custom',
    required: false,
    values: [emptyValue()],
  }
}

function emptyAddon(): ProductAddon {
  return {
    id: makeId('addon'),
    name: '',
    price: 0,
    max_qty: 1,
    required: false,
  }
}

type Props = {
  optionGroups: ProductOptionGroup[]
  onOptionGroupsChange: (groups: ProductOptionGroup[]) => void
  addons: ProductAddon[]
  onAddonsChange: (addons: ProductAddon[]) => void
}

export function ProductOptionsBuilder({
  optionGroups,
  onOptionGroupsChange,
  addons,
  onAddonsChange,
}: Props) {
  const normalizedGroups = optionGroups || []
  const normalizedAddons = addons || []

  const updateGroup = (groupId: string, patch: Partial<ProductOptionGroup>) => {
    onOptionGroupsChange(normalizedGroups.map(group => (
      group.id === groupId ? { ...group, ...patch } : group
    )))
  }

  const updateValue = (groupId: string, valueId: string, patch: Partial<ProductOptionValue>) => {
    onOptionGroupsChange(normalizedGroups.map(group => {
      if (group.id !== groupId) return group
      return {
        ...group,
        values: group.values.map(value => (
          value.id === valueId ? { ...value, ...patch } : value
        )),
      }
    }))
  }

  const addValue = (groupId: string) => {
    onOptionGroupsChange(normalizedGroups.map(group => (
      group.id === groupId ? { ...group, values: [...group.values, emptyValue()] } : group
    )))
  }

  const removeValue = (groupId: string, valueId: string) => {
    onOptionGroupsChange(normalizedGroups.map(group => {
      if (group.id !== groupId) return group
      const nextValues = group.values.filter(value => value.id !== valueId)
      return { ...group, values: nextValues.length ? nextValues : [emptyValue()] }
    }))
  }

  const updateAddon = (addonId: string, patch: Partial<ProductAddon>) => {
    onAddonsChange(normalizedAddons.map(addon => (
      addon.id === addonId ? { ...addon, ...patch } : addon
    )))
  }

  return (
    <div className={styles.builder}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Variasi produk</h3>
            <p>Tambahkan pilihan seperti warna, ukuran, porsi, shade, rasa, atau topping.</p>
          </div>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => onOptionGroupsChange([...normalizedGroups, emptyGroup()])}
          >
            <Plus size={16} />
            Tambah variasi
          </button>
        </div>

        {normalizedGroups.length === 0 ? (
          <div className={styles.emptyState}>Belum ada variasi. Produk akan dijual sebagai satu pilihan utama.</div>
        ) : normalizedGroups.map(group => (
          <div className={styles.groupCard} key={group.id}>
            <div className={styles.groupHeader}>
              <div className={styles.field}>
                <label>Nama variasi</label>
                <input
                  className={styles.input}
                  value={group.name}
                  onChange={event => updateGroup(group.id, { name: event.target.value })}
                  placeholder="Contoh: Warna"
                />
              </div>
              <div className={styles.field}>
                <label>Jenis</label>
                <select
                  className={styles.select}
                  value={group.type}
                  onChange={event => updateGroup(group.id, { type: event.target.value as ProductOptionType })}
                >
                  {OPTION_TYPES.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <label className={styles.inlineCheck}>
                <input
                  type="checkbox"
                  checked={group.required}
                  onChange={event => updateGroup(group.id, { required: event.target.checked })}
                />
                Wajib dipilih
              </label>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={() => onOptionGroupsChange(normalizedGroups.filter(item => item.id !== group.id))}
              >
                <Trash2 size={16} />
                Hapus
              </button>
            </div>

            <div className={styles.values}>
              {(group.values || []).map(value => (
                <div className={styles.valueGrid} key={value.id}>
                  <div className={styles.field}>
                    <label>Nama pilihan</label>
                    <input
                      className={styles.input}
                      value={value.label}
                      onChange={event => updateValue(group.id, value.id, { label: event.target.value })}
                      placeholder="Contoh: Hitam"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Tambah harga</label>
                    <input
                      className={styles.input}
                      inputMode="numeric"
                      value={value.price_delta || ''}
                      onChange={event => updateValue(group.id, value.id, { price_delta: toNumber(event.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Stok</label>
                    <input
                      className={styles.input}
                      inputMode="numeric"
                      value={value.stock || ''}
                      onChange={event => updateValue(group.id, value.id, { stock: toNumber(event.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Tambah berat</label>
                    <input
                      className={styles.input}
                      inputMode="numeric"
                      value={value.weight_delta || ''}
                      onChange={event => updateValue(group.id, value.id, { weight_delta: toNumber(event.target.value) })}
                      placeholder="gram"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Warna</label>
                    <input
                      className={`${styles.input} ${styles.colorField}`}
                      type="color"
                      value={value.color_hex || '#16a34a'}
                      onChange={event => updateValue(group.id, value.id, { color_hex: event.target.value })}
                      disabled={group.type !== 'color'}
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label="Hapus pilihan"
                    onClick={() => removeValue(group.id, value.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.buttonRow}>
              <button type="button" className={styles.secondaryButton} onClick={() => addValue(group.id)}>
                <Plus size={16} />
                Tambah pilihan
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Tambahan produk</h3>
            <p>Gunakan untuk pilihan tambahan seperti topping, bungkus kado, atau aksesori.</p>
          </div>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => onAddonsChange([...normalizedAddons, emptyAddon()])}
          >
            <Plus size={16} />
            Tambah tambahan
          </button>
        </div>

        {normalizedAddons.length === 0 ? (
          <div className={styles.emptyState}>Belum ada tambahan produk.</div>
        ) : normalizedAddons.map(addon => (
          <div className={styles.addonCard} key={addon.id}>
            <div className={styles.addonGrid}>
              <div className={styles.field}>
                <label>Nama tambahan</label>
                <input
                  className={styles.input}
                  value={addon.name}
                  onChange={event => updateAddon(addon.id, { name: event.target.value })}
                  placeholder="Contoh: Extra sambal"
                />
              </div>
              <div className={styles.field}>
                <label>Harga</label>
                <input
                  className={styles.input}
                  inputMode="numeric"
                  value={addon.price || ''}
                  onChange={event => updateAddon(addon.id, { price: toNumber(event.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className={styles.field}>
                <label>Maksimal</label>
                <input
                  className={styles.input}
                  inputMode="numeric"
                  value={addon.max_qty || ''}
                  onChange={event => updateAddon(addon.id, { max_qty: Math.max(1, toNumber(event.target.value)) })}
                  placeholder="1"
                />
              </div>
              <label className={styles.inlineCheck}>
                <input
                  type="checkbox"
                  checked={Boolean(addon.required)}
                  onChange={event => updateAddon(addon.id, { required: event.target.checked })}
                />
                Wajib
              </label>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="Hapus tambahan"
                onClick={() => onAddonsChange(normalizedAddons.filter(item => item.id !== addon.id))}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
