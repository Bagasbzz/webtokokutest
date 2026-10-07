'use client'

/**
 * Preview Mode Component
 * 
 * Menampilkan preview template seperti yang akan terlihat di website live.
 * Mode ini untuk melihat hasil edit tanpa tombol edit.
 */

import type { TemplateDefinition } from '@/lib/template-editor/definitions'
import type { TemplateCustomization } from '@/lib/template-editor/types'
import type { Store } from '@/lib/types'
import { SectionRenderer } from './SectionRenderer'

interface PreviewModeProps {
  template: TemplateDefinition
  customizations: TemplateCustomization[]
  store: Store
}

export function PreviewMode({ 
  template, 
  customizations, 
  store 
}: PreviewModeProps) {
  return (
    <div className="preview-mode">
      {/* Preview Header */}
      <div className="sticky top-0 z-30 bg-gray-900 text-white px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-700 px-3 py-1 rounded-full text-sm">
              Preview Mode
            </div>
            <div className="text-sm text-gray-300">
              Template: {template.nama}
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Store: {store.nama_toko} • webtokoku.my.id/{store.slug}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="preview-content bg-gray-50 min-h-screen">
        {/* Simulated Website Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {store.logo_url && (
                  <img 
                    src={store.logo_url} 
                    alt={store.nama_toko}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                <h1 className="text-xl font-bold text-gray-900">
                  {store.nama_toko}
                </h1>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-gray-600 hover:text-gray-900">Beranda</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Produk</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Tentang</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Kontak</a>
              </nav>
            </div>
          </div>
        </div>

        {/* Render All Visible Sections */}
        <div className="max-w-6xl mx-auto py-8">
          <div className="space-y-12">
            {template.sections.map(section => {
              const customization = customizations.find(c => c.section_id === section.id)
              
              // Skip hidden sections
              if (!customization || !customization.is_visible) {
                return null
              }

              return (
                <div key={section.id} className="section-wrapper">
                  <SectionRenderer 
                    type={section.type}
                    content={customization.content}
                    sectionId={section.id}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Simulated Website Footer */}
        <div className="bg-gray-900 text-white mt-16">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold mb-4">{store.nama_toko}</h3>
                <p className="text-gray-400 text-sm">
                  {store.deskripsi || 'Website toko online profesional'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white">Beranda</a></li>
                  <li><a href="#" className="hover:text-white">Produk</a></li>
                  <li><a href="#" className="hover:text-white">Tentang</a></li>
                  <li><a href="#" className="hover:text-white">Kontak</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Kontak</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>WA: {store.no_wa}</li>
                  {store.alamat && <li>Alamat: {store.alamat}</li>}
                  {store.kota && <li>Kota: {store.kota}</li>}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Powered by</h4>
                <div className="text-gray-400 text-sm">
                  <p>webtokoku</p>
                  <p className="text-xs">Website toko online instan</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>© 2024 {store.nama_toko}. All rights reserved.</p>
              <p className="mt-1">
                Dibuat dengan ❤️ oleh{' '}
                <a href="#" className="hover:text-white">webtokoku</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white px-6 py-2 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Preview</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">
              {customizations.filter(c => c.is_visible).length} sections visible
            </span>
          </div>
          <div className="text-gray-500">
            Switch to Edit Mode to make changes
          </div>
        </div>
      </div>
    </div>
  )
}
