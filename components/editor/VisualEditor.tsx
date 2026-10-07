'use client'

import React, { createContext, useContext, useState } from 'react'
import { useCustomizations } from './useCustomizations'

interface EditorContextType {
  isEditMode: boolean;
  setIsEditMode: (v: boolean) => void;
  customizations: Record<string, string>;
  saveCustomization: (section: string, element: string, value: string) => Promise<void>;
  storeId?: string;
  loading: boolean;
}

const EditorContext = createContext<EditorContextType | null>(null)

export const useEditor = () => {
  const ctx = useContext(EditorContext)
  if (!ctx) {
    // If not used within provider, return default non-edit mode (safe fallback for public storefront)
    return {
      isEditMode: false,
      setIsEditMode: () => {},
      customizations: {},
      saveCustomization: async () => {},
      loading: false
    }
  }
  return ctx
}

interface VisualEditorProps {
  children: React.ReactNode;
  storeId?: string;
  initialEditMode?: boolean;
  initialCustomizations?: Record<string, string>;
}

export function VisualEditor({ children, storeId, initialEditMode = false, initialCustomizations }: VisualEditorProps) {
  const [isEditMode, setIsEditMode] = useState(initialEditMode)
  const { customizations, loading, saveCustomization } = useCustomizations(storeId, initialCustomizations)

  return (
    <EditorContext.Provider value={{ isEditMode, setIsEditMode, customizations, saveCustomization, storeId, loading }}>
      {children}
    </EditorContext.Provider>
  )
}
