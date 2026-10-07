'use client'

import { MessageCircle } from 'lucide-react'

interface FloatingWaButtonProps {
  phone: string
  message: string
}

export function FloatingWaButton({ phone, message }: FloatingWaButtonProps) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
        zIndex: 999,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        textDecoration: 'none',
        animation: 'waPulse 2s infinite',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(37,211,102,0.6)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(37,211,102,0.45)'
      }}
    >
      <MessageCircle size={26} color="#fff" fill="#fff" />
    </a>
  )
}
