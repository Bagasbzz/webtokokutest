'use client'

import { 
  Sparkles, Megaphone, LayoutGrid, Flame, MapPin, ShieldCheck, 
  Info, ListTodo, Star, Zap, MessageSquare, AlignLeft, 
  Gem, Target, Columns, Palette, Link as LinkIcon, FileText,
  HelpCircle
} from 'lucide-react'

const SECTION_ICONS: Record<string, React.ReactNode> = {
  hero: <Sparkles size={14} />,
  topbar: <Megaphone size={14} />,
  menu: <LayoutGrid size={14} />,
  promo: <Flame size={14} />,
  promo_banner: <Flame size={14} />,
  outlet: <MapPin size={14} />,
  trust: <ShieldCheck size={14} />,
  banner: <Info size={14} />,
  routine: <ListTodo size={14} />,
  reviews: <Star size={14} />,
  gallery: <LayoutGrid size={14} />,
  docs: <FileText size={14} />,
  location: <MapPin size={14} />,
  contact: <MessageSquare size={14} />,
  social: <LinkIcon size={14} />,
  faq: <HelpCircle size={14} />,
  features: <Zap size={14} />,
  consult: <MessageSquare size={14} />,
  marquee: <AlignLeft size={14} />,
  values: <Gem size={14} />,
  cta: <Target size={14} />,
  split: <Columns size={14} />,
  masterpiece: <Palette size={14} />,
  footer: <LinkIcon size={14} />,
}

interface SectionSidebarProps {
  sections: string[]
  activeSection: string
  sectionLabels: Record<string, string>
  hasError: (section: string) => boolean
  onChange: (section: string) => void
}

export function SectionSidebar({
  sections,
  activeSection,
  sectionLabels,
  hasError,
  onChange,
}: SectionSidebarProps) {
  return (
    <aside style={s.sidebar}>
      <p style={s.title}>SECTIONS</p>
      {sections.map(sec => {
        const isActive = activeSection === sec
        const hasErr = hasError(sec)
        return (
          <button
            key={sec}
            onClick={() => onChange(sec)}
            style={{
              ...s.item,
              ...(isActive ? s.itemActive : {}),
              ...(hasErr ? s.itemError : {}),
            }}
          >
            <span style={s.icon}>{SECTION_ICONS[sec] || <FileText size={14} />}</span>
            <span style={s.label}>{sectionLabels[sec] || sec}</span>
            {hasErr && <div style={s.errorDot} title="Ada error di section ini" />}
          </button>
        )
      })}
    </aside>
  )
}

const s: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '180px',
    minWidth: '180px',
    background: '#FAFAFA',
    borderRight: '1px solid #F0F0F0',
    padding: '16px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflowY: 'auto',
  },
  title: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '10px',
    paddingLeft: '8px',
  },
  item: {
    background: 'transparent',
    border: 'none',
    borderLeft: '3px solid transparent',
    padding: '8px 10px',
    borderRadius: '0 6px 6px 0',
    textAlign: 'left',
    fontSize: '13px',
    color: '#4B5563',
    cursor: 'pointer',
    fontWeight: 500,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.1s',
  },
  itemActive: {
    background: '#F3F4F6',
    borderLeftColor: '#111827',
    color: '#111827',
    fontWeight: 700,
  },
  itemError: {
    borderLeftColor: '#FCA5A5',
  },
  icon: {
    fontSize: '14px',
    flexShrink: 0,
  },
  label: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  errorDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#EF4444',
    flexShrink: 0,
  },
}
