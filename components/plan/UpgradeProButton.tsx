'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { CheckCircle2, Crown, Sparkles, X } from 'lucide-react'
import { FREE_PLAN_LIMITS, getUpgradeWhatsAppUrl } from '@/lib/plan'

type StoreLike = {
  nama_toko?: string | null
  slug?: string | null
} | null

type UpgradeProButtonProps = {
  store?: StoreLike
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const benefits = [
  `Produk aktif lebih dari ${FREE_PLAN_LIMITS.products}`,
  `Kategori lebih dari ${FREE_PLAN_LIMITS.categories}`,
  'Tanpa watermark WebTokoku di storefront',
  'Bebas mengganti template setelah toko publish',
  'Tampilan toko lebih siap untuk branding serius',
]

export function UpgradeProButton({ store, className, style, children }: UpgradeProButtonProps) {
  const [open, setOpen] = useState(false)
  const waUrl = getUpgradeWhatsAppUrl({
    nama_toko: store?.nama_toko || 'toko saya',
    slug: store?.slug || '',
  })

  return (
    <>
      <button type="button" className={className} style={style} onClick={() => setOpen(true)}>
        {children || 'Upgrade Pro'}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Benefit Paket Pro"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            background: 'rgba(15, 23, 42, 0.56)',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              width: 'min(520px, 100%)',
              borderRadius: 18,
              border: '1px solid rgba(226, 232, 240, 0.9)',
              background: '#fff',
              boxShadow: '0 24px 80px rgba(15, 23, 42, 0.28)',
              overflow: 'hidden',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 16, padding: '24px 24px 18px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, background: '#fffbeb', color: '#b45309', padding: '6px 10px', fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
                  <Crown size={14} /> Paket Pro
                </div>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: 24, lineHeight: 1.15, fontWeight: 850 }}>Upgrade untuk toko yang mulai berkembang</h2>
                <p style={{ margin: '10px 0 0', color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                  Lihat benefit terlebih dahulu. Setelah lanjut, Anda akan diarahkan ke WhatsApp admin untuk konfirmasi pembayaran dan aktivasi.
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setOpen(false)}
                style={{ border: 0, background: '#f8fafc', color: '#334155', borderRadius: 999, width: 34, height: 34, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '0 24px 20px' }}>
              <div style={{ display: 'grid', gap: 10 }}>
                {benefits.map((benefit) => (
                  <div key={benefit} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1e293b', fontSize: 14, fontWeight: 650 }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: 20, background: '#f8fafc', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ minHeight: 42, borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', color: '#334155', padding: '0 16px', fontWeight: 750, cursor: 'pointer' }}
              >
                Nanti dulu
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                style={{ minHeight: 42, borderRadius: 10, border: '1px solid #b45309', background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff', padding: '0 18px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
              >
                <Sparkles size={16} /> Lanjut ke WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
