import { CartItem } from '@/types/commerce'

interface StoreDetails {
  namaToko: string;
  waNumber: string;
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

export function generateWhatsAppURL(
  store: StoreDetails,
  items: CartItem[],
  orderNote: string,
  total: number
): string {
  let message = `Halo *${store.namaToko}*,\nSaya ingin memesan:\n\n`

  items.forEach((item, index) => {
    message += `${index + 1}. *${item.title}*\n`
    if (item.variant) {
      message += `   Varian: ${item.variant.value}\n`
    }
    message += `   ${item.quantity} x ${formatRupiah(item.price)}\n`
    message += `   Subtotal: ${formatRupiah(item.quantity * item.price)}\n\n`
  })

  message += `*TOTAL: ${formatRupiah(total)}*\n\n`

  if (orderNote.trim()) {
    message += `*Catatan Pesanan:*\n${orderNote.trim()}\n\n`
  }

  message += `Mohon info total biaya beserta ongkos kirim. Terima kasih.`

  let cleanWa = store.waNumber.replace(/\D/g, '')
  if (cleanWa.startsWith('0')) {
    cleanWa = '62' + cleanWa.substring(1)
  }

  return `https://wa.me/${cleanWa}?text=${encodeURIComponent(message)}`
}
