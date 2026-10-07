'use client'

import React, { createContext, useContext, ReactNode } from 'react'

interface StoreData {
  id: string
  nama_toko: string
  wa_nomor: string
  slug: string
  paymentMethods?: any[]
  shippingSettings?: {
    auto_shipping_enabled?: boolean
    pickup_enabled?: boolean
    cod_enabled?: boolean
    allowed_couriers?: string[]
    free_shipping_minimum?: number
  }
  featureFlags?: Record<string, boolean>
}

const StoreContext = createContext<StoreData | undefined>(undefined)

export function StoreProvider({ 
  data, 
  featureFlags,
  children 
}: { 
  data: StoreData
  featureFlags?: Record<string, boolean>
  children: ReactNode 
}) {
  return (
    <StoreContext.Provider value={{ ...data, featureFlags }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStoreData() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStoreData must be used within a StoreProvider')
  }
  return context
}
