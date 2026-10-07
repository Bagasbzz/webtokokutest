'use client'

import React, { useState } from 'react'
import { Bell, BellRing, CheckCircle2, Loader2, Radio, Send, User, Users } from 'lucide-react'
import { sendAdminNotification, type NotificationType } from '../actions'
import styles from '../admin.module.css'

interface Props {
  sellers: { id: string; nama_lengkap: string; email: string }[]
  recentNotifs: {
    id: string
    title: string
    message: string
    type: string
    created_at: string
    recipient_seller_id: string | null
  }[]
}

export default function NotificationsClient({ sellers, recentNotifs }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [target, setTarget] = useState<'broadcast' | 'single'>('broadcast')
  const [recipientId, setRecipientId] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<NotificationType>('info')
  const [linkUrl, setLinkUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return
    if (target === 'single' && !recipientId) {
      setError('Pilih penerima notifikasi.')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await sendAdminNotification(
        target === 'broadcast' ? null : recipientId,
        title.trim(),
        message.trim(),
        type,
        linkUrl.trim() || undefined
      )

      if (result.success) {
        setSuccess(`Notifikasi berhasil dikirim ke ${result.count} seller!`)
        setTitle('')
        setMessage('')
        setLinkUrl('')
      } else {
        setError(result.error || 'Gagal mengirim notifikasi.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const typeColors: Record<string, { bg: string; color: string; label: string }> = {
    info:    { bg: '#e8f6ee', color: '#247a52', label: 'Info' },
    success: { bg: '#d1fae5', color: '#059669', label: 'Sukses' },
    warning: { bg: '#fff7ed', color: '#c2410c', label: 'Peringatan' },
    error:   { bg: '#fee2e2', color: '#dc2626', label: 'Error / Urgent' },
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Bell size={30} color="#247a52" />
            Kirim Notifikasi
          </h1>
          <p className={styles.pageSubtitle}>Kirim pengumuman atau pesan penting ke seller secara individual atau broadcast ke semua.</p>
        </div>
      </header>

      <div className={styles.grid2}>
        {/* COMPOSE FORM */}
        <form onSubmit={handleSubmit} className={styles.card} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 4 }}>
            Compose Notifikasi
          </h2>

          {success && (
            <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '12px 16px', color: '#065f46', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={18} /> {success}
            </div>
          )}
          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', color: '#b91c1c' }}>
              {error}
            </div>
          )}

          {/* TARGET TOGGLE */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Kirim ke:</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setTarget('broadcast')}
                className={styles.actionButton}
                style={target === 'broadcast' ? { background: '#247a52', color: '#fff', border: 'none' } : {}}
              >
                <Radio size={14} /> Semua Seller
              </button>
              <button
                type="button"
                onClick={() => setTarget('single')}
                className={styles.actionButton}
                style={target === 'single' ? { background: '#247a52', color: '#fff', border: 'none' } : {}}
              >
                <User size={14} /> Seller Tertentu
              </button>
            </div>
          </div>

          {target === 'single' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Pilih Penerima *</label>
              <select
                value={recipientId}
                onChange={e => setRecipientId(e.target.value)}
                className={styles.selectField}
                required
              >
                <option value="">- Pilih seller -</option>
                {sellers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nama_lengkap || s.email} ({s.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* TYPE */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Tipe Notifikasi</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.entries(typeColors).map(([t, { bg, color, label }]) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t as NotificationType)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    border: `2px solid ${type === t ? color : '#e2e8f0'}`,
                    background: type === t ? bg : '#fff',
                    color: type === t ? color : '#64748b',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* TITLE */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Judul Notifikasi *</label>
            <input
              type="text"
              className={styles.inputField}
              placeholder="cth: Pembaruan Kebijakan Platform"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          {/* MESSAGE */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Pesan *</label>
            <textarea
              className={styles.textareaField}
              style={{ minHeight: 120, resize: 'vertical' }}
              placeholder="Tulis pesan lengkap untuk seller..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>

          {/* LINK URL (optional) */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Link Tindakan (opsional)</label>
            <input
              type="url"
              className={styles.inputField}
              placeholder="https://... - URL tujuan jika seller klik"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !message.trim()}
              className={styles.submitBtnPremium}
            >
              {isLoading ? <><Loader2 size={15} className="animate-spin" /> Mengirim...</> : <><Send size={15} /> Kirim Notifikasi</>}
            </button>
          </div>
        </form>

        {/* RECENT NOTIFICATIONS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}><BellRing size={16} style={{ marginRight: 6 }} />Riwayat Notifikasi</h2>
          </div>
          <div className={styles.cardBody}>
            {recentNotifs.length > 0 ? (
              <div className={styles.list}>
                {recentNotifs.map(n => {
                  const tc = typeColors[n.type] || typeColors.info
                  return (
                    <div key={n.id} className={styles.listItem}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ background: tc.bg, color: tc.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                            {tc.label}
                          </span>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>
                            {n.recipient_seller_id ? 'Individual' : <><Users size={11} /> Broadcast</>}
                          </span>
                        </div>
                        <strong style={{ fontSize: 13 }}>{n.title}</strong>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{n.message.substring(0, 80)}{n.message.length > 80 ? '...' : ''}</span>
                      </div>
                      <span className={styles.badge} style={{ flexShrink: 0 }}>
                        {new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className={styles.empty}>Belum ada notifikasi dikirim.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
