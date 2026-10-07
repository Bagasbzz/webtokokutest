'use client'

import type React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Palette, Package, Settings, Store } from 'lucide-react'

const STEPS = [
  {
    title: 'Lengkapi profil toko',
    desc: 'Nama toko, deskripsi, nomor WhatsApp, alamat, dan pembayaran disimpan dari menu Pengaturan.',
    href: '/dashboard/pengaturan',
    icon: Store,
  },
  {
    title: 'Tambah produk pertama',
    desc: 'Katalog yang rapi membuat preview template langsung terasa hidup.',
    href: '/dashboard/produk/tambah',
    icon: Package,
  },
  {
    title: 'Edit template langsung',
    desc: 'Gunakan editor inline untuk mengubah teks dan gambar dari tampilan toko asli.',
    href: '/dashboard/editor',
    icon: Palette,
  },
  {
    title: 'Cek pengiriman dan pembayaran',
    desc: 'Pastikan QRIS, rekening, dan metode pengiriman sudah sesuai sebelum dibagikan.',
    href: '/dashboard/pengaturan/pembayaran',
    icon: Settings,
  },
]

export default function SetupWizardClient() {
  return (
    <div style={s.page}>
      <section style={s.hero}>
        <div>
          <p style={s.eyebrow}>Setup Website</p>
          <h1 style={s.title}>Mulai dari langkah yang paling berdampak.</h1>
          <p style={s.subtitle}>
            Wizard lama sedang dirapikan. Untuk sekarang, ikuti checklist singkat ini supaya toko cepat siap dipakai tanpa masuk ke form panjang yang membingungkan.
          </p>
        </div>
        <Link href="/dashboard/editor" style={s.primaryBtn}>
          Buka Editor Template <ArrowRight size={16} />
        </Link>
      </section>

      <section style={s.grid}>
        {STEPS.map((step, index) => {
          const Icon = step.icon
          return (
            <Link key={step.href} href={step.href} style={s.card}>
              <div style={s.cardTop}>
                <span style={s.stepNumber}>{index + 1}</span>
                <Icon size={20} color="#0f172a" />
              </div>
              <h2 style={s.cardTitle}>{step.title}</h2>
              <p style={s.cardDesc}>{step.desc}</p>
              <span style={s.cardAction}>Buka halaman <ArrowRight size={14} /></span>
            </Link>
          )
        })}
      </section>

      <section style={s.note}>
        <CheckCircle2 size={18} color="#059669" />
        <p>
          Fokus recovery saat ini adalah membuat editor inline dan dashboard stabil dulu. Checklist ini sengaja ringkas agar seller tidak tersesat saat fitur setup wizard penuh belum selesai.
        </p>
      </section>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    padding: 28,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
  },
  eyebrow: {
    margin: '0 0 8px',
    color: '#059669',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    margin: '0 0 10px',
    color: '#0f172a',
    fontSize: 30,
    lineHeight: 1.15,
  },
  subtitle: {
    margin: 0,
    maxWidth: 720,
    color: '#64748b',
    fontSize: 15,
    lineHeight: 1.7,
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 190,
    padding: '12px 16px',
    background: '#0f172a',
    color: '#fff',
    borderRadius: 10,
    fontWeight: 700,
    textDecoration: 'none',
    fontSize: 14,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: 16,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 20,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    textDecoration: 'none',
    color: '#0f172a',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    background: '#ecfdf5',
    color: '#059669',
    fontSize: 13,
    fontWeight: 800,
  },
  cardTitle: {
    margin: 0,
    fontSize: 18,
  },
  cardDesc: {
    margin: 0,
    color: '#64748b',
    fontSize: 14,
    lineHeight: 1.6,
    flex: 1,
  },
  cardAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#059669',
    fontSize: 13,
    fontWeight: 800,
  },
  note: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    padding: 16,
    background: '#ecfdf5',
    border: '1px solid #bbf7d0',
    borderRadius: 12,
    color: '#065f46',
    fontSize: 14,
    lineHeight: 1.6,
  },
}
