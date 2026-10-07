'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Search } from 'lucide-react'

interface Command {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  category?: string
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  commands: Command[]
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredCommands = useMemo(() => {
    if (!search) return commands
    const s = search.toLowerCase()
    return commands.filter(c => c.label.toLowerCase().includes(s))
  }, [commands, search])

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          onClose()
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onClose])

  if (!isOpen) return null

  return (
    <div 
      style={s.overlay} 
      onClick={onClose}
    >
      <div 
        style={s.modal} 
        onClick={e => e.stopPropagation()}
      >
        <div style={s.searchBox}>
          <Search size={18} style={{ color: '#9CA3AF' }} />
          <input
            ref={inputRef}
            style={s.input}
            placeholder="Type a command or search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={s.shortcutHint}>ESC</span>
        </div>

        <div style={s.list} ref={listRef}>
          {filteredCommands.length === 0 ? (
            <div style={s.empty}>No commands found.</div>
          ) : (
            filteredCommands.map((cmd, i) => (
              <div
                key={cmd.id}
                style={{
                  ...s.item,
                  background: i === selectedIndex ? '#F3F4F6' : 'transparent',
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => {
                  cmd.action()
                  onClose()
                }}
              >
                <span style={s.itemIcon}>{cmd.icon}</span>
                <span style={s.itemLabel}>{cmd.label}</span>
                {i === selectedIndex && <span style={s.itemEnter}>↵</span>}
              </div>
            ))
          )}
        </div>

        <div style={s.footer}>
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '15vh',
    zIndex: 100000,
  },
  modal: {
    width: '100%',
    maxWidth: '500px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #F3F4F6',
    gap: '12px',
  },
  searchIcon: { fontSize: '18px', color: '#9CA3AF' },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#111827',
    background: 'transparent',
  },
  shortcutHint: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#9CA3AF',
    border: '1px solid #E5E7EB',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  list: {
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '8px',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#6B7280',
    fontSize: '14px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    gap: '12px',
    transition: 'background 0.1s',
  },
  itemIcon: { fontSize: '18px', width: '24px', textAlign: 'center' },
  itemLabel: { flex: 1, fontSize: '14px', color: '#374151', fontWeight: 500 },
  itemEnter: { fontSize: '14px', color: '#9CA3AF' },
  footer: {
    padding: '8px 16px',
    background: '#F9FAFB',
    borderTop: '1px solid #F3F4F6',
    display: 'flex',
    gap: '16px',
    fontSize: '10px',
    color: '#9CA3AF',
    fontWeight: 500,
  }
}
