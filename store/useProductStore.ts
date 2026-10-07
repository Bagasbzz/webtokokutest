import { create } from 'zustand'
import { CommerceProduct } from '@/types/commerce'

interface ProductState {
  activeProduct: CommerceProduct | null
  isPDPOpen: boolean
  openPDP: (product: CommerceProduct) => void
  closePDP: () => void
}

export const useProductStore = create<ProductState>((set) => ({
  activeProduct: null,
  isPDPOpen: false,
  openPDP: (product) => set({ activeProduct: product, isPDPOpen: true }),
  closePDP: () => set({ isPDPOpen: false }),
}))
