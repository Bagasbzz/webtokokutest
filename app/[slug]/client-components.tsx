'use client'

import { MessageCircle, ShoppingBag } from 'lucide-react'
import styles from './page.module.css'

export function ScrollToProductsButton() {
  const scrollToProducts = () => {
    document.getElementById('produk')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <button onClick={scrollToProducts} className={styles.btnSecondary}>
      <ShoppingBag size={18} />
      Lihat Produk ▼
    </button>
  )
}

export function FloatingWaButton({ phone, message }: { phone: string, message: string }) {
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  
  return (
    <a 
      href={waUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className={styles.floatingWa}
      title="Hubungi via WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  )
}
