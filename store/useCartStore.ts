import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types/commerce'

interface CartState {
  items: CartItem[]
  isDrawerOpen: boolean
  orderNote: string
  storeSlug: string | null
  // Actions
  addItem: (item: CartItem) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, qty: number) => void
  setOrderNote: (note: string) => void
  toggleDrawer: () => void
  openDrawer: () => void
  closeDrawer: () => void
  clearCart: () => void
  setStoreSlug: (slug: string) => void
  // Selectors
  getCartTotal: () => number
  getCartCount: () => number
}

// Custom storage wrapper for dynamic keys and migration
const createCustomStorage = () => {
  const baseKey = 'webtokoku-cart'
  const legacyKey = baseKey

  return {
    getItem: (name: string) => {
      // name is passed as 'webtokoku-cart' from persist config
      // But we will actually check for slug-specific keys
      const slug = (typeof window !== 'undefined' && (window as any).__WEBT_STORE_SLUG__) || null
      const activeKey = slug ? `${baseKey}-${slug}` : baseKey
      
      const storedValue = localStorage.getItem(activeKey)
      
      // Migration: If slug key is empty but legacy key has data, migrate it
      if (slug && !storedValue) {
        const legacyValue = localStorage.getItem(legacyKey)
        if (legacyValue) {
          console.log(`[Cart] Migrating legacy data to store: ${slug}`)
          localStorage.setItem(activeKey, legacyValue)
          // We don't delete legacyKey to avoid losing data if user switches back/forth
          return JSON.parse(legacyValue)
        }
      }

      return storedValue ? JSON.parse(storedValue) : null
    },
    setItem: (name: string, value: any) => {
      const slug = (typeof window !== 'undefined' && (window as any).__WEBT_STORE_SLUG__) || value.state?.storeSlug || null
      const activeKey = slug ? `${baseKey}-${slug}` : baseKey
      localStorage.setItem(activeKey, JSON.stringify(value))
    },
    removeItem: (name: string) => {
      const slug = (typeof window !== 'undefined' && (window as any).__WEBT_STORE_SLUG__) || null
      const activeKey = slug ? `${baseKey}-${slug}` : baseKey
      localStorage.removeItem(activeKey)
    }
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      orderNote: '',
      storeSlug: null,
      
      addItem: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(i => i.cartItemId === item.cartItemId)
          if (existingItemIndex > -1) {
            const newItems = [...state.items]
            const existingItem = newItems[existingItemIndex]
            const maxStock = existingItem.stock ?? 999
            
            // Create a new object for the updated item (immutable)
            newItems[existingItemIndex] = {
              ...existingItem,
              quantity: Math.min(maxStock, existingItem.quantity + item.quantity)
            }
            return { items: newItems }
          }
          return { items: [...state.items, item] }
        })
      },
      
      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter(i => i.cartItemId !== cartItemId)
        }))
      },
      
      updateQuantity: (cartItemId, qty) => {
        set((state) => ({
          items: state.items.map(i => {
            if (i.cartItemId === cartItemId) {
              const maxStock = i.stock ?? 999
              return { ...i, quantity: Math.min(maxStock, Math.max(1, qty)) }
            }
            return i
          })
        }))
      },
      
      setOrderNote: (note) => set({ orderNote: note }),
      setStoreSlug: (slug) => {
        set({ storeSlug: slug })
        if (typeof window !== 'undefined') {
          (window as any).__WEBT_STORE_SLUG__ = slug
          // Re-hydrate store manually if slug changed to get store-specific items
          // This ensures that when user navigates between stores, the items update immediately
          const stored = createCustomStorage().getItem('webtokoku-cart')
          if (stored && stored.state) {
            set({ items: stored.state.items || [], orderNote: stored.state.orderNote || '' })
          } else {
            set({ items: [], orderNote: '' })
          }
        }
      },
      
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      
      clearCart: () => set({ items: [], orderNote: '' }),
      
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
      
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: 'webtokoku-cart', 
      storage: createCustomStorage(),
      partialize: (state) => ({ items: state.items, orderNote: state.orderNote, storeSlug: state.storeSlug }),
    }
  )
)
