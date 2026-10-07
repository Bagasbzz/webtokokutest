'use client'

import { useState, useEffect } from 'react'
import { listRevisions } from '@/lib/revisions'
import { RevisionCard } from './RevisionCard'

interface RevisionPanelProps {
  storeId: string
  isOpen: boolean
  onClose: () => void
  onRestore: (id: string) => void
  isRestoring: boolean
}

export function RevisionPanel({ storeId, isOpen, onClose, onRestore, isRestoring }: RevisionPanelProps) {
  const [revisions, setRevisions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadRevisions()
    }
  }, [isOpen])

  async function loadRevisions() {
    setLoading(true)
    const { data, error } = await listRevisions(storeId)
    if (!error && data) {
      setRevisions(data)
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.sidebar} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <h3 style={s.title}>Riwayat Revisi</h3>
          <button onClick={onClose} style={s.btnClose}>✕</button>
        </div>

        <div style={s.list}>
          {loading ? (
            <p style={s.empty}>Memuat riwayat...</p>
          ) : revisions.length === 0 ? (
            <p style={s.empty}>Belum ada riwayat publikasi.</p>
          ) : (
            revisions.map(rev => (
              <RevisionCard 
                key={rev.id} 
                revision={rev} 
                onRestore={onRestore}
                disabled={isRestoring}
              />
            ))
          )}
        </div>
        
        <p style={s.footer}>
          Restore akan menimpa draft saat ini tanpa langsung mengubah toko live.
        </p>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  sidebar: {
    width: '320px',
    height: '100%',
    background: '#F9FAFB',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideIn 0.3s ease-out',
  },
  header: {
    padding: '20px',
    background: '#fff',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  btnClose: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#9CA3AF',
    cursor: 'pointer',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  empty: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#9CA3AF',
    marginTop: '40px',
  },
  footer: {
    padding: '16px',
    fontSize: '11px',
    color: '#9CA3AF',
    background: '#fff',
    borderTop: '1px solid #E5E7EB',
    margin: 0,
    textAlign: 'center',
    fontStyle: 'italic',
  }
}
