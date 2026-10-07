'use client'

interface RevisionCardProps {
  revision: {
    id: string
    revision_number: number
    created_at: string
    is_published: boolean
  }
  onRestore: (id: string) => void
  disabled?: boolean
}

export function RevisionCard({ revision, onRestore, disabled }: RevisionCardProps) {
  const date = new Date(revision.created_at).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div style={s.card}>
      <div style={s.header}>
        <span style={s.number}>Revisi #{revision.revision_number}</span>
        {revision.is_published && <span style={s.badge}>Published</span>}
      </div>
      
      <p style={s.date}>{date}</p>
      
      <button 
        onClick={() => onRestore(revision.id)} 
        disabled={disabled}
        style={s.btnRestore}
      >
        Restore ke Draft
      </button>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  card: {
    padding: '14px',
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  number: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#111827',
  },
  badge: {
    fontSize: '10px',
    fontWeight: 700,
    background: '#D1FAE5',
    color: '#065F46',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  date: {
    fontSize: '12px',
    color: '#6B7280',
    margin: 0,
  },
  btnRestore: {
    marginTop: '4px',
    background: '#F3F4F6',
    border: '1px solid #D1D5DB',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
}
