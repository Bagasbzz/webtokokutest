'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { 
  getMyStoreId, 
  getProducts, 
  deleteProduct, 
  getProductCategories, 
  ensureProductCategory, 
  deleteProductCategory, 
  assignProductsToCategory, 
  updateProductFields
} from '@/lib/product'
import { getMyStore } from '@/lib/store'
import { isProPlan, FREE_PLAN_LIMITS } from '@/lib/plan'
import { UpgradeProButton } from '@/components/plan/UpgradeProButton'
import type { Product, ProductCategory } from '@/lib/types'
import { 
  ShoppingBag, 
  Package, 
  Edit, 
  Trash2, 
  Loader2, 
  Plus, 
  AlertCircle, 
  Search, 
  FolderKanban, 
  Star, 
  X, 
  Check, 
  ChevronRight, 
  Info,
  Sparkles
} from 'lucide-react'
import styles from './page.module.css'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/ToastContainer'

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categoriesList, setCategoriesList] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [store, setStore] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Semua')
  const [sortOption, setSortOption] = useState('terbaru')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Modals state
  const [showCatModal, setShowCatModal] = useState(false)
  const [selectedCat, setSelectedCat] = useState<ProductCategory | null>(null)
  const [newCatName, setNewCatName] = useState('')
  const [checkedProducts, setCheckedProducts] = useState<string[]>([])
  const [catActionLoading, setCatActionLoading] = useState(false)

  // Confirmation states
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  const { toasts, toast, dismiss } = useToast()

  const categories = useMemo(() => {
    return ['Semua', ...Array.from(new Set(products.map(product => product.kategori).filter(Boolean) as string[])).sort()]
  }, [products])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter(product => {
      const matchesCategory = categoryFilter === 'Semua' || product.kategori === categoryFilter
      const matchesSearch = !query || [product.nama, product.kategori, product.deskripsi]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query))

      return matchesCategory && matchesSearch
    })
  }, [categoryFilter, products, search])

  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts]
    switch (sortOption) {
      case 'nama-asc':
        return items.sort((a, b) => a.nama.localeCompare(b.nama))
      case 'harga-asc':
        return items.sort((a, b) => a.harga - b.harga)
      case 'harga-desc':
        return items.sort((a, b) => b.harga - a.harga)
      case 'stok-asc':
        return items.sort((a, b) => (a.stok || 0) - (b.stok || 0))
      case 'terbaru':
      default:
        return items.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    }
  }, [filteredProducts, sortOption])

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedProducts, currentPage])

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, categoryFilter, sortOption])

  // Count homepage products
  const homepageProductsCount = useMemo(() => {
    return products.filter(p => p.show_on_homepage).length
  }, [products])

  const isPro = useMemo(() => {
    return isProPlan(store)
  }, [store])

  const isProductLimitReached = useMemo(() => {
    if (isPro) return false
    return products.filter(p => p.is_active).length >= FREE_PLAN_LIMITS.products
  }, [products, isPro])

  const isCategoryLimitReached = useMemo(() => {
    if (isPro) return false
    return categoriesList.filter(c => c.is_active).length >= FREE_PLAN_LIMITS.categories
  }, [categoriesList, isPro])

  const fetchProductsAndCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const myStore = await getMyStore()
      if (myStore) {
        setStore(myStore)
        setStoreId(myStore.id)
        const [prodData, catData] = await Promise.all([
          getProducts(myStore.id),
          getProductCategories(myStore.id)
        ])
        setProducts(prodData)
        setCategoriesList(catData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Gagal memuat produk dan kategori. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductsAndCategories()
  }, [])

  const handleDelete = async (id: string) => {
    setProductToDelete(id)
  }

  const executeDelete = async (id: string) => {
    setProductToDelete(null)
    setError(null)
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Produk berhasil dihapus permanen.')
    } catch (error) {
      toast.error('Gagal menghapus produk. Silakan coba lagi.')
    }
  }

  // Toggle homepage pinning
  const handleToggleHomepage = async (id: string, currentVal: boolean) => {
    // If we're pinning a new product and already have >= 6 pinned
    if (!currentVal && homepageProductsCount >= 6) {
      toast.warning('Maksimal 6 produk yang dapat ditampilkan di Halaman Utama. Silakan lepas bintang dari produk lain terlebih dahulu.')
      return
    }

    try {
      setError(null)
      await updateProductFields(id, { show_on_homepage: !currentVal })
      setProducts(prev => prev.map(p => p.id === id ? { ...p, show_on_homepage: !currentVal } : p))
    } catch (error: any) {
      console.error('Error toggling homepage status:', error)
      setError(error.message || 'Gagal mengubah status halaman utama.')
    }
  }

  // Add Category Handler
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !newCatName.trim()) return

    setCatActionLoading(true)
    try {
      const created = await ensureProductCategory(storeId, newCatName.trim())
      if (created) {
        setCategoriesList(prev => [...prev, created])
        setSelectedCat(created)
        setNewCatName('')
        toast.success('Kategori baru berhasil dibuat!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal membuat kategori baru')
    } finally {
      setCatActionLoading(false)
    }
  }

  // Delete Category Handler
  const handleDeleteCategory = async (catId: string) => {
    setCategoryToDelete(catId)
  }

  const executeDeleteCategory = async (catId: string) => {
    setCategoryToDelete(null)
    setCatActionLoading(true)
    try {
      await deleteProductCategory(catId)
      setCategoriesList(prev => prev.filter(c => c.id !== catId))
      if (selectedCat?.id === catId) {
        setSelectedCat(null)
        setCheckedProducts([])
      }
      // Refresh products to clear deleted category info from state
      const id = await getMyStoreId()
      if (id) {
        const prodData = await getProducts(id)
        setProducts(prodData)
      }
      toast.success('Kategori berhasil dihapus.')
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus kategori')
    } finally {
      setCatActionLoading(false)
    }
  }

  // Select Category in Modal
  const handleSelectCat = (cat: ProductCategory) => {
    setSelectedCat(cat)
    // Find products currently assigned to this category
    const assignedIds = products
      .filter(p => p.category_id === cat.id)
      .map(p => p.id)
    setCheckedProducts(assignedIds)
  }

  // Toggle checked products in modal
  const handleToggleProductCheck = (prodId: string) => {
    setCheckedProducts(prev => 
      prev.includes(prodId) 
        ? prev.filter(id => id !== prodId)
        : [...prev, prodId]
    )
  }

  // Save Category Assignments
  const handleSaveAssignments = async () => {
    if (!storeId || !selectedCat) return

    setCatActionLoading(true)
    try {
      await assignProductsToCategory(storeId, selectedCat.name, selectedCat.id, checkedProducts)
      
      // Refresh products list in dashboard
      const prodData = await getProducts(storeId)
      setProducts(prodData)
      
      toast.success('Pembagian kategori produk berhasil disimpan!')
      setShowCatModal(false)
      setSelectedCat(null)
      setCheckedProducts([])
    } catch (error: any) {
      toast.error(error.message || 'Gagal menetapkan kategori produk')
    } finally {
      setCatActionLoading(false)
    }
  }

  const formatRp = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID')
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    )
  }
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Produk Saya</h1>
          <p className={styles.subtitle}>{products.filter(p => p.is_active).length} produk aktif</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowCatModal(true)} className={styles.btnOutline}>
            <FolderKanban size={18} /> Kelola Kategori
          </button>
          {isProductLimitReached ? (
            <UpgradeProButton
              store={store}
              className={styles.btnPrimary}
              style={{ background: 'linear-gradient(135deg, #247a52, #145c39)', borderColor: '#247a52', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={16} /> Upgrade Pro
            </UpgradeProButton>
          ) : (
            <Link href="/dashboard/produk/tambah" className={styles.btnPrimary}>
              <Plus size={18} /> Tambah Produk
            </Link>
          )}
        </div>
      </header>

      {error && (
        <div className={styles.alertError}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isProductLimitReached && (
        <div className={styles.homepageHeaderBanner} style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)', border: '1px solid #fecaca', color: '#991b1b', marginBottom: '16px' }}>
          <div className={styles.homepageHeaderLeft}>
            <AlertCircle size={20} style={{ color: '#dc2626' }} />
            <div>
              <p className={styles.homepageHeaderTitle} style={{ color: '#991b1b' }}>Batas Jumlah Produk Tercapai ({FREE_PLAN_LIMITS.products}/{FREE_PLAN_LIMITS.products})</p>
              <p className={styles.homepageHeaderDesc} style={{ color: '#b91c1c' }}>
                Anda menggunakan Paket Gratis. Silakan upgrade ke Paket Pro untuk menambah produk tanpa batas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Homepage Selection Notification / Banner */}
      {products.length > 0 && (
        products.length <= 6 ? (
          <div className={styles.homepageHeaderBanner}>
            <div className={styles.homepageHeaderLeft}>
              <Info size={20} />
              <div>
                <p className={styles.homepageHeaderTitle}>Semua produk otomatis tampil di Halaman Utama</p>
                <p className={styles.homepageHeaderDesc}>Karena total produk tokomu masih kurang dari atau sama dengan 6.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.homepageHeaderBanner} style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f6ee 100%)', border: '1px solid #bfe8cf', color: '#145c39' }}>
            <div className={styles.homepageHeaderLeft}>
              <Star size={20} style={{ fill: '#247a52', color: '#247a52' }} />
              <div>
                <p className={styles.homepageHeaderTitle}>Pilih Produk untuk Halaman Utama ({homepageProductsCount}/6)</p>
                <p className={styles.homepageHeaderDesc} style={{ color: '#247a52' }}>
                  Produkmu lebih dari 6. Ketuk ikon bintang pada kartu produk untuk memilih produk yang tampil di halaman utama.
                </p>
              </div>
            </div>
          </div>
        )
      )}

      {products.length > 0 && (
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={18} />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Cari nama, kategori, atau deskripsi"
            />
          </label>
          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={event => setCategoryFilter(event.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={sortOption}
            onChange={event => setSortOption(event.target.value)}
          >
            <option value="terbaru">Terbaru</option>
            <option value="nama-asc">Nama (A-Z)</option>
            <option value="harga-asc">Harga Terendah</option>
            <option value="harga-desc">Harga Tertinggi</option>
            <option value="stok-asc">Stok Terendah</option>
          </select>
        </div>
      )}

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <ShoppingBag size={48} />
          </div>
          <h3>Belum ada produk</h3>
          <p>Tambahkan produk pertamamu untuk mulai jualan</p>
          <Link href="/dashboard/produk/tambah" className={styles.btnPrimaryEmpty}>
            <Plus size={18} /> Tambah Produk
          </Link>
        </div>
      ) : (
        sortedProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Search size={42} />
            </div>
            <h3>Produk tidak ditemukan</h3>
            <p>Ubah kata kunci pencarian atau filter kategori.</p>
          </div>
        ) : (
          <div>
            <div className={styles.productGrid}>
              {paginatedProducts.map(product => (
                <div 
                  key={product.id} 
                  className={`${styles.productCard} ${product.stok === 0 ? styles.outOfStockCard : ''}`}
                >
                  <div className={styles.imageContainer}>
                    {product.foto_url ? (
                      <img src={product.foto_url} alt={product.nama} className={styles.image} />
                    ) : (
                      <div className={styles.placeholderImage}>
                        <Package size={40} />
                      </div>
                    )}

                    {/* Category Badge */}
                    {product.kategori && (
                      <span className={styles.badge}>{product.kategori}</span>
                    )}

                    {/* Out of Stock Badge */}
                    {product.stok === 0 && (
                      <span className={styles.outOfStockBadge}>Stok Habis</span>
                    )}

                    {/* Star Toggle for Homepage - only enabled when total products > 6 */}
                    {products.length > 6 ? (
                      <button 
                        className={`${styles.btnStar} ${product.show_on_homepage ? styles.btnStarActive : ''}`}
                        onClick={() => handleToggleHomepage(product.id, !!product.show_on_homepage)}
                        title={product.show_on_homepage ? "Hapus dari Halaman Utama" : "Tampilkan di Halaman Utama"}
                      >
                        <Star size={16} style={{ fill: product.show_on_homepage ? '#fff' : 'none' }} />
                      </button>
                    ) : (
                      // Indicator for <= 6 automatic display
                      <span className={styles.homeBadge} style={{ background: '#10b981' }}>Aktif di Beranda</span>
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.nama}</h3>
                    <div className={styles.priceRow}>
                      <p className={styles.productPrice}>{formatRp(product.harga)}</p>
                      {product.compare_at_price && product.compare_at_price > product.harga && (
                        <span>{formatRp(product.compare_at_price)}</span>
                      )}
                    </div>
                    {product.badge_label && <p className={styles.productMeta}>{product.badge_label}</p>}
                    <p 
                      className={styles.productWeight} 
                      style={{
                        fontSize:'12px',
                        color: product.stok === 0 ? '#ef4444' : '#64748b',
                        marginTop:'4px',
                        fontWeight: product.stok === 0 ? 600 : 400
                      }}
                    >
                      Stok {product.stok || 0} · {product.berat_gram || 0} gram
                    </p>
                  </div>
                  <div className={styles.cardActions}>
                    <Link href={`/dashboard/produk/${product.id}/edit`} className={styles.btnAction}>
                      <Edit size={16} /> Edit
                    </Link>
                    <button onClick={() => handleDelete(product.id)} className={`${styles.btnAction} ${styles.btnDelete}`}>
                      <Trash2 size={16} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
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
        )
      )}

      {/* CATEGORY MANAGEMENT MODAL */}
      {showCatModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Kelola Kategori & Hubungkan Produk</h2>
              <button className={styles.btnClose} onClick={() => { setShowCatModal(false); setSelectedCat(null); setCheckedProducts([]); }}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Left Column: Categories List & Add Category Form */}
              <div className={styles.categorySection}>
                <h3 className={styles.assignTitle}>Daftar Kategori</h3>
                {isCategoryLimitReached ? (
                  <div style={{ padding: '12px', background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f6ee 100%)', border: '1px solid #bfe8cf', borderRadius: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#145c39', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} style={{ color: '#247a52' }} /> Batas Kategori Paket Gratis (3/3)
                    </p>
                    <UpgradeProButton
                      store={store}
                      style={{ fontSize: '0.75rem', fontWeight: 700, color: '#247a52', textDecoration: 'underline' }}
                    >
                      Upgrade ke Pro untuk kategori tanpa batas
                    </UpgradeProButton>
                  </div>
                ) : (
                  <form onSubmit={handleAddCategory} className={styles.addCategoryForm}>
                    <input
                      type="text"
                      className={styles.modalInput}
                      placeholder="Buat kategori baru..."
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      disabled={catActionLoading}
                    />
                    <button type="submit" className={styles.btnModalAdd} disabled={catActionLoading || !newCatName.trim()}>
                      {catActionLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
                    </button>
                  </form>
                )}

                <div className={styles.categoryList}>
                  {categoriesList.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', margin: '20px 0' }}>
                      Belum ada kategori. Buat kategori pertamamu di atas.
                    </p>
                  ) : (
                    categoriesList.map(cat => (
                      <div 
                        key={cat.id} 
                        className={`${styles.categoryItem} ${selectedCat?.id === cat.id ? styles.categoryItemActive : ''}`}
                        onClick={() => handleSelectCat(cat)}
                      >
                        <span className={styles.categoryName}>{cat.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ChevronRight size={14} style={{ color: '#64748b' }} />
                          <button 
                            type="button" 
                            className={styles.btnDeleteCat} 
                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                            title="Hapus Kategori"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Products Checklist */}
              <div className={styles.productAssignSection}>
                {selectedCat ? (
                  <>
                    <h3 className={styles.assignTitle}>Hubungkan produk ke Kategori: <strong style={{ color: '#10b981' }}>{selectedCat.name}</strong></h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                      Centang produk yang ingin dimasukkan ke dalam kategori ini, lalu klik Simpan.
                    </p>
                    <div className={styles.assignList}>
                      {products.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', padding: '20px' }}>
                          Belum ada produk aktif untuk dihubungkan.
                        </p>
                      ) : (
                        products.map(prod => {
                          const isChecked = checkedProducts.includes(prod.id)
                          return (
                            <div 
                              key={prod.id} 
                              className={styles.assignItem}
                              onClick={() => handleToggleProductCheck(prod.id)}
                            >
                              <input 
                                type="checkbox" 
                                className={styles.assignCheckbox}
                                checked={isChecked}
                                onChange={() => {}} // Controlled via onClick on parent container for better touch target
                              />
                              {prod.foto_url ? (
                                <img src={prod.foto_url} alt="" className={styles.assignProductImg} />
                              ) : (
                                <div className={styles.assignProductPlaceholder}>
                                  <Package size={16} />
                                </div>
                              )}
                              <div className={styles.assignProductInfo}>
                                <p className={styles.assignProductName}>{prod.nama}</p>
                                <p className={styles.assignProductPrice}>{formatRp(prod.harga)}</p>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', textAlign: 'center', padding: '20px' }}>
                    <FolderKanban size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Pilih Kategori</h4>
                    <p style={{ fontSize: '0.85rem', margin: 0, maxWidth: '280px' }}>
                      Silakan pilih salah satu kategori di sebelah kiri untuk mulai menghubungkan produk.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.btnSecondary} 
                onClick={() => { setShowCatModal(false); setSelectedCat(null); setCheckedProducts([]); }}
                disabled={catActionLoading}
              >
                Tutup
              </button>
              {selectedCat && (
                <button 
                  className={styles.btnPrimaryModal} 
                  onClick={handleSaveAssignments}
                  disabled={catActionLoading}
                >
                  {catActionLoading ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Simpan Pembagian</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL KONFIRMASI HAPUS PRODUK */}
      {productToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '400px' }}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#ef4444' }}>Hapus Produk?</h2>
            </div>
            <div className={styles.modalBody} style={{ padding: '16px 0' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                Apakah Anda yakin ingin menghapus produk ini? Tindakan ini bersifat permanen dan tidak bisa dibatalkan.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setProductToDelete(null)}>
                Batal
              </button>
              <button 
                className={styles.btnPrimary} 
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} 
                onClick={() => executeDelete(productToDelete)}
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS KATEGORI */}
      {categoryToDelete && (
        <div className={styles.modalOverlay} style={{ zIndex: 100000 }}>
          <div className={styles.modalContent} style={{ maxWidth: '400px' }}>
            <div className={styles.modalHeader}>
              <h2>Hapus Kategori?</h2>
            </div>
            <div className={styles.modalBody} style={{ padding: '16px 0' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                Apakah Anda yakin ingin menghapus kategori ini? Produk yang terhubung di dalamnya tidak akan dihapus, melainkan dikosongkan kategorinya.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setCategoryToDelete(null)}>
                Batal
              </button>
              <button 
                className={styles.btnPrimary} 
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} 
                onClick={() => executeDeleteCategory(categoryToDelete)}
              >
                Hapus Kategori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFIKASI */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
