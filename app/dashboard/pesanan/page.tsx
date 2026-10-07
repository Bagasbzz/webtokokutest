'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getMyStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { 
  Loader2, 
  Package, 
  Search, 
  Filter,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Banknote,
  Eye,
  MessageCircle
} from 'lucide-react'
import styles from './page.module.css'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/ToastContainer'

interface Order {
  id: string
  order_code: string
  customer_name: string
  customer_whatsapp: string
  customer_address: string
  items: any[]
  subtotal: number
  shipping_cost: number
  total: number
  payment_method: string
  payment_status: string
  order_status: string
  bukti_url: string | null
  bukti_storage_path?: string | null
  created_at: string
  shipping_courier?: string
  shipping_service?: string
}

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  'menunggu_pembayaran': { label: 'Menunggu Pembayaran', color: '#f59e0b', icon: Clock },
  'menunggu_konfirmasi': { label: 'Menunggu Konfirmasi', color: '#3b82f6', icon: Eye },
  'diproses': { label: 'Diproses', color: '#8b5cf6', icon: Package },
  'dikirim': { label: 'Dikirim', color: '#06b6d4', icon: Truck },
  'selesai': { label: 'Selesai', color: '#10b981', icon: CheckCircle },
  'dibatalkan': { label: 'Dibatalkan', color: '#ef4444', icon: XCircle },
}

const paymentLabels: Record<string, { label: string; color: string; background: string }> = {
  pending: { label: 'Belum Bayar', color: '#b45309', background: '#fef3c7' },
  menunggu_konfirmasi: { label: 'Menunggu Konfirmasi', color: '#1d4ed8', background: '#dbeafe' },
  lunas: { label: 'Lunas', color: '#047857', background: '#d1fae5' },
  ditolak: { label: 'Bukti Ditolak', color: '#b91c1c', background: '#fee2e2' },
}

function getSelectedOptionIds(item: any) {
  if (Array.isArray(item.selected_option_ids)) return item.selected_option_ids
  if (Array.isArray(item.selected_options)) return item.selected_options.map((option: any) => option.id).filter(Boolean)
  return []
}

export default function OrdersPage() {
  const [store, setStore] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({})
  const itemsPerPage = 10
  const { toasts, toast, dismiss } = useToast()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const myStore = await getMyStore()
      if (!myStore) return
      
      setStore(myStore)
      
      const supabaseClient = createClient()
      const loadedOrders: Order[] = []
      const pageSize = 1000

      for (let from = 0; ; from += pageSize) {
        const { data, error } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('store_id', myStore.id)
          .order('created_at', { ascending: false })
          .range(from, from + pageSize - 1)

        if (error) {
          console.error('Error loading orders:', error)
          return
        }

        loadedOrders.push(...((data || []) as Order[]))
        if (!data || data.length < pageSize) break
      }

      setOrders(loadedOrders)
      await loadProofUrls(loadedOrders)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProofUrls = async (orderList: Order[]) => {
    const proofEntries = await Promise.all(
      orderList
        .filter(order => order.bukti_storage_path || order.bukti_url)
        .map(async (order) => {
          if (order.bukti_url && /^https?:\/\//.test(order.bukti_url)) {
            return [order.id, order.bukti_url] as const
          }
          try {
            const res = await fetch(`/api/orders/payment-proof-url?order_id=${encodeURIComponent(order.id)}`)
            const data = await res.json()
            if (!res.ok || !data?.url) return null
            return [order.id, data.url] as const
          } catch {
            return null
          }
        }),
    )

    setProofUrls(Object.fromEntries(proofEntries.filter(Boolean) as Array<readonly [string, string]>))
  }

  const getProofUrl = (order: Order) => proofUrls[order.id] || (/^https?:\/\//.test(order.bukti_url || '') ? order.bukti_url : null)

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const order = orders.find(o => o.id === orderId)
      if (!order) return

      if (order.order_status === newStatus) return

      const supabaseClient = createClient()

      // Rollback stock if status changes to dibatalkan
      if (newStatus === 'dibatalkan' && order.order_status !== 'dibatalkan') {
        for (const item of order.items) {
          if (!item.id || !item.quantity) continue
          
          const { data: success, error: rpcError } = await supabaseClient
            .rpc('increment_product_stock_with_options', {
              p_product_id: item.id,
              p_quantity: item.quantity,
              p_selected_option_ids: getSelectedOptionIds(item),
            })
            
          if (rpcError || !success) {
            throw new Error(`Gagal mengembalikan stok untuk "${item.nama || 'produk'}"`)
          }
        }
      } 
      // If status changes FROM dibatalkan to something else, we should re-deduct stock
      else if (order.order_status === 'dibatalkan' && newStatus !== 'dibatalkan') {
        const deductedItems: any[] = []
        try {
          for (const item of order.items) {
            if (!item.id || !item.quantity) continue
            
            const { data: success, error: rpcError } = await supabaseClient
              .rpc('decrement_product_stock_with_options', {
                p_product_id: item.id,
                p_quantity: item.quantity,
                p_selected_option_ids: getSelectedOptionIds(item),
              })
              
            if (rpcError || !success) {
              throw new Error(`Stok untuk produk "${item.nama || 'produk'}" tidak mencukupi untuk memulihkan pesanan ini.`)
            }
            deductedItems.push(item)
          }
        } catch (err: any) {
          // Rollback yang sudah dikurangi jika ada yang gagal
          for (const item of deductedItems) {
            const { error: rbErr } = await supabaseClient.rpc('increment_product_stock_with_options', {
              p_product_id: item.id,
              p_quantity: item.quantity,
              p_selected_option_ids: getSelectedOptionIds(item),
            })
            if (rbErr) console.error('Gagal rollback stok:', rbErr)
          }
          throw err
        }
      }

      const { error } = await supabaseClient
        .from('orders')
        .update({ order_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
      
      if (error) {
        toast.error('Gagal memperbarui status pesanan: ' + error.message)
        return
      }
      
      // Refresh orders
      loadOrders()
      toast.success('Status pesanan berhasil diperbarui!')
    } catch (error: any) {
      toast.error('Terjadi kesalahan sistem: ' + error.message)
    }
  }

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const supabaseClient = createClient()
      const { error } = await supabaseClient
        .from('orders')
        .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) {
        toast.error('Gagal memperbarui status pembayaran: ' + error.message)
        return
      }

      setOrders(prev => prev.map(order => (
        order.id === orderId ? { ...order, payment_status: newStatus } : order
      )))
      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, payment_status: newStatus } : prev)
      toast.success('Status pembayaran berhasil diperbarui.')
    } catch (error: any) {
      toast.error('Terjadi kesalahan sistem: ' + error.message)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_whatsapp.includes(searchQuery)
    
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const paginatedOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_whatsapp.includes(searchQuery)
    
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter
    
    return matchesSearch && matchesStatus
  }) // wait, let's use the actual filteredOrders list for pagination slicing

  // Let's rewrite this cleanly:
  // filteredOrders is the full list after search/filter.
  // paginatedOrders is the sliced sub-array for the current page.
  const paginatedOrdersList = paginatedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const formatCurrency = (amount: number) => {
    return 'Rp ' + amount.toLocaleString('id-ID')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.warning('Tidak ada pesanan untuk diekspor.')
      return
    }

    const headers = [
      'Kode Order',
      'Tanggal',
      'Nama Pelanggan',
      'No. WhatsApp',
      'Alamat Pelanggan',
      'Kurir',
      'Layanan',
      'Ongkir',
      'Subtotal',
      'Total',
      'Metode Pembayaran',
      'Status Pembayaran',
      'Status Pesanan'
    ]

    const rows = filteredOrders.map(order => [
      order.order_code,
      formatDate(order.created_at),
      order.customer_name,
      order.customer_whatsapp,
      `"${order.customer_address.replace(/"/g, '""')}"`,
      order.shipping_courier || '-',
      order.shipping_service || '-',
      order.shipping_cost,
      order.subtotal,
      order.total,
      order.payment_method,
      order.payment_status,
      order.order_status
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `rekap_pesanan_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('File CSV berhasil diunduh.')
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 size={32} className={styles.spinner} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Manajemen Pesanan</h1>
          <p className={styles.subtitle}>Kelola pesanan dari pembeli</p>
        </div>
      </header>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{orders.length}</div>
          <div className={styles.statLabel}>Total Pesanan</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {orders.filter(o => o.order_status === 'menunggu_konfirmasi').length}
          </div>
          <div className={styles.statLabel}>Menunggu Konfirmasi</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {orders.filter(o => o.order_status === 'diproses').length}
          </div>
          <div className={styles.statLabel}>Diproses</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {orders.filter(o => o.order_status === 'selesai').length}
          </div>
          <div className={styles.statLabel}>Selesai</div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari kode order, nama, atau WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterBox}>
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Semua Status</option>
            <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
            <option value="diproses">Diproses</option>
            <option value="dikirim">Dikirim</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>

        <button 
          onClick={handleExportCSV}
          className={styles.btnExport}
          title="Ekspor daftar pesanan yang sedang ditampilkan ke format CSV"
        >
          Ekspor CSV
        </button>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={64} className={styles.emptyIcon} />
          <h3>Belum ada pesanan</h3>
          <p>Pesanan dari pembeli akan muncul di sini</p>
        </div>
      ) : (
        <div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Kode Order</th>
                  <th>Pembeli</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrdersList.map((order) => {
                  const status = statusLabels[order.order_status] || statusLabels['menunggu_konfirmasi']
                  const StatusIcon = status.icon
                  
                  return (
                    <tr key={order.id} className={styles.tableRow}>
                      <td>
                        <span className={styles.orderCode}>{order.order_code}</span>
                      </td>
                      <td>
                        <div className={styles.customerInfo}>
                          <span className={styles.customerName}>{order.customer_name}</span>
                          <span className={styles.customerWhatsapp}>{order.customer_whatsapp}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.total}>{formatCurrency(order.total)}</span>
                      </td>
                      <td>
                        <span 
                          className={styles.statusBadge}
                          style={{ 
                            backgroundColor: `${status.color}20`,
                            color: status.color,
                            borderColor: status.color
                          }}
                        >
                          <StatusIcon size={14} />
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <span className={styles.date}>{formatDate(order.created_at)}</span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className={styles.btnDetail}
                            title="Lihat Detail Pesanan"
                          >
                            <Eye size={16} />
                          </button>
                          {getProofUrl(order) && (
                            <a 
                              href={getProofUrl(order) || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.btnBukti}
                              title="Lihat bukti pembayaran"
                            >
                              <Banknote size={16} />
                            </a>
                          )}
                          <a 
                            href={`https://wa.me/${order.customer_whatsapp}?text=Halo%20${encodeURIComponent(order.customer_name)},%20terima%20kasih%20sudah%20order%20${order.order_code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.btnWa}
                            title="Chat WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                          <select
                            value={order.order_status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={styles.statusSelect}
                          >
                            <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
                            <option value="diproses">Diproses</option>
                            <option value="dikirim">Dikirim</option>
                            <option value="selesai">Selesai</option>
                            <option value="dibatalkan">Dibatalkan</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationBtn}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </button>
              <div className={styles.paginationPages}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`${styles.paginationPageNumber} ${page === currentPage ? styles.paginationPageNumberActive : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className={styles.paginationBtn}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL DETAIL PESANAN */}
      {selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Detail Pesanan {selectedOrder.order_code}</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Dibuat pada {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <button className={styles.btnClose} onClick={() => setSelectedOrder(null)}>
                <XCircle size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Kolom 1: Informasi Pelanggan & Pengiriman */}
              <div className={styles.detailSection}>
                <h3 className={styles.sectionTitle}>Informasi Pengiriman</h3>
                <div className={styles.infoGroup}>
                  <label>Nama Penerima</label>
                  <span>{selectedOrder.customer_name}</span>
                </div>
                <div className={styles.infoGroup}>
                  <label>No. WhatsApp</label>
                  <a 
                    href={`https://wa.me/${selectedOrder.customer_whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waLink}
                  >
                    {selectedOrder.customer_whatsapp} <ExternalLink size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                  </a>
                </div>
                <div className={styles.infoGroup}>
                  <label>Alamat Lengkap</label>
                  <p className={styles.addressText}>{selectedOrder.customer_address}</p>
                </div>
                <div className={styles.infoGroup}>
                  <label>Jasa Pengiriman (Kurir)</label>
                  <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    {selectedOrder.shipping_courier || 'Manual / Pengambilan Sendiri'} 
                    {selectedOrder.shipping_service ? ` (${selectedOrder.shipping_service})` : ''}
                  </span>
                </div>
                <div className={styles.infoGroup}>
                  <label>Metode Pembayaran</label>
                  <span style={{ textTransform: 'capitalize' }}>
                    {selectedOrder.payment_method?.replace('_', ' ') || 'Manual / Transfer Bank'}
                  </span>
                </div>
                <div className={styles.infoGroup}>
                  <label>Status Pembayaran</label>
                  <div style={{ marginTop: '4px' }}>
                    {(() => {
                      const payment = paymentLabels[selectedOrder.payment_status] || paymentLabels.pending
                      return (
                    <span 
                      className={styles.paymentStatusBadge}
                      style={{
                        color: payment.color,
                        background: payment.background
                      }}
                    >
                      {payment.label}
                    </span>
                      )
                    })()}
                  </div>
                </div>
              </div>

              {/* Kolom 2: Rincian Produk & Harga */}
              <div className={styles.itemsSection}>
                <h3 className={styles.sectionTitle}>Rincian Produk</h3>
                <div className={styles.itemList}>
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className={styles.itemRow}>
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.nama || item.name}</p>
                        {item.variant && (
                          <p className={styles.itemVariant}>Varian: {item.variant}</p>
                        )}
                        {item.addons && item.addons.length > 0 && (
                          <p className={styles.itemVariant}>Tambahan: {item.addons.join(', ')}</p>
                        )}
                        <p className={styles.itemQty}>
                          {item.quantity} x {formatCurrency(item.harga || item.price)}
                        </p>
                      </div>
                      <div className={styles.itemSubtotal}>
                        {formatCurrency((item.harga || item.price) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.priceSummary}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Ongkos Kirim</span>
                    <span>{formatCurrency(selectedOrder.shipping_cost || 0)}</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Total Keseluruhan</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Status Pesanan:</span>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) => {
                    updateOrderStatus(selectedOrder.id, e.target.value);
                    setSelectedOrder(prev => prev ? { ...prev, order_status: e.target.value } : null);
                  }}
                  className={styles.statusSelect}
                >
                  <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
                  <option value="diproses">Diproses</option>
                  <option value="dikirim">Dikirim</option>
                  <option value="selesai">Selesai</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={styles.btnActionSecondary}
                  onClick={() => updatePaymentStatus(selectedOrder.id, 'lunas')}
                >
                  Tandai Lunas
                </button>
                <button
                  type="button"
                  className={styles.btnActionSecondary}
                  onClick={() => updatePaymentStatus(selectedOrder.id, 'ditolak')}
                >
                  Tolak Bukti
                </button>
                {getProofUrl(selectedOrder) && (
                  <a 
                    href={getProofUrl(selectedOrder) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnActionSecondary}
                  >
                    Buka Bukti Bayar
                  </a>
                )}
                <a 
                  href={`https://wa.me/${selectedOrder.customer_whatsapp}?text=Halo%20${encodeURIComponent(selectedOrder.customer_name)},%20terima%20kasih%20sudah%20order%20${selectedOrder.order_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnActionPrimary}
                >
                  Hubungi WhatsApp
                </a>
                <button className={styles.btnActionClose} onClick={() => setSelectedOrder(null)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifikasi Lokal Halaman Pesanan */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
