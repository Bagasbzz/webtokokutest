import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Globe2,
  MessageCircle,
  Package,
  Palette,
  ShoppingBag,
} from 'lucide-react'
import { blogPosts } from '@/lib/blog'
import { WebtokokuLogo } from '@/components/brand/WebtokokuLogo'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'webtokoku - Website Toko untuk UMKM',
  description:
    'Buat website toko yang rapi untuk UMKM. Tampilkan katalog, terima pesanan lewat WhatsApp, dan bagikan link toko sendiri.',
  alternates: {
    canonical: 'https://www.webtokoku.id',
  },
  openGraph: {
    title: 'webtokoku - Website Toko untuk UMKM',
    description:
      'Platform sederhana untuk membuat website toko, katalog produk, dan checkout WhatsApp untuk seller UMKM.',
    url: 'https://www.webtokoku.id',
    siteName: 'webtokoku',
    locale: 'id_ID',
    type: 'website',
  },
}

const templates = [
  {
    name: 'Butik Hana',
    category: 'Fashion',
    desktop: '/template-previews/butik-desktop.jpg',
    mobile: '/template-previews/butik-mobile.jpg',
    href: '/demo/fashion.html',
  },
  {
    name: 'Dapur Nusantara',
    category: 'Kuliner',
    desktop: '/template-previews/dapur-desktop.jpg',
    mobile: '/template-previews/dapur-mobile.jpg',
    href: '/demo/makanan.html',
  },
  {
    name: 'Glow Lab',
    category: 'Skincare',
    desktop: '/template-previews/glow-desktop.jpg',
    mobile: '/template-previews/glow-mobile.jpg',
    href: '/demo/skincare.html',
  },
  {
    name: 'Luna Beauty',
    category: 'Kosmetik',
    desktop: '/template-previews/luxe-desktop.jpg',
    mobile: '/template-previews/luxe-mobile.jpg',
    href: '/demo/kosmetik.html',
  },
  {
    name: 'Bazzhealth',
    category: 'Kesehatan',
    desktop: '/template-previews/herba-desktop.jpg',
    mobile: '/template-previews/herba-mobile.jpg',
    href: '/demo/kesehatan.html',
  },
]

const features = [
  {
    icon: <Package size={20} />,
    title: 'Katalog yang mudah dibaca',
    body: 'Foto, harga, stok, kategori, dan deskripsi produk tersusun di satu halaman.',
  },
  {
    icon: <MessageCircle size={20} />,
    title: 'Pesanan tetap lewat WhatsApp',
    body: 'Pembeli memilih produk, mengisi data singkat, lalu ringkasan order masuk ke WhatsApp toko.',
  },
  {
    icon: <Palette size={20} />,
    title: 'Tampilan bisa dirapikan',
    body: 'Ubah teks, gambar, warna, dan bagian utama toko dari dashboard.',
  },
  {
    icon: <Globe2 size={20} />,
    title: 'Punya alamat toko sendiri',
    body: 'Mulai dari subdomain webtokoku. Custom domain bisa disiapkan saat toko sudah siap.',
  },
]

const testimonials = [
  {
    name: 'Budi Santoso',
    shopName: 'Kopi Tubruk Nusantara',
    category: 'Kuliner',
    avatarInitials: 'BS',
    avatarBg: '#dcfce7',
    avatarColor: '#166534',
    quote:
      'Dulu repot banget tiap ada pelanggan nanya harga lewat WA harus ketik ulang satu-satu. Sekarang tinggal sebar link webtokoku, mereka bisa lihat menu sendiri dan langsung checkout. Pembayaran juga jadi lebih teratur.',
  },
  {
    name: 'Siti Rahma',
    shopName: 'Glow & Co',
    category: 'Skincare',
    avatarInitials: 'SR',
    avatarBg: '#ecfdf5',
    avatarColor: '#047857',
    quote:
      'Pelanggan saya suka banget karena tampilannya bersih dan kelihatan profesional. Nggak kelihatan kayak website hasil template murahan. Proses pesannya gampang banget, pembeli tinggal klik trus rinciannya langsung masuk WA saya.',
  },
  {
    name: 'Andi Wijaya',
    shopName: 'Luxe Apparel',
    category: 'Fashion',
    avatarInitials: 'AW',
    avatarBg: '#f0fdf4',
    avatarColor: '#15803d',
    quote:
      'Sangat membantu buat jualan baju online. Katalognya rapi, stoknya otomatis berkurang pas ada yang checkout, jadi nggak ada lagi kejadian pembeli komplain karena barang habis. Sangat direkomendasikan!',
  },
]

export default function LandingPage() {
  const jsonLd = [
    {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'webtokoku',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
      url: 'https://www.webtokoku.id',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    description:
      'Platform pembuatan website toko untuk UMKM dengan katalog produk, template toko, dan checkout WhatsApp.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'webtokoku',
      url: 'https://www.webtokoku.id',
      description: 'webtokoku adalah platform pembuatan website toko untuk seller UMKM Indonesia.',
      logo: 'https://www.webtokoku.id/favicon.ico',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'webtokoku',
      url: 'https://www.webtokoku.id',
      description: 'Website toko untuk UMKM dengan katalog produk dan checkout WhatsApp.',
      inLanguage: 'id-ID',
    },
  ]

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnalyticsTracker storeId={null} />
      <Navbar />
      <HeroSection />
      <ScrollReveal><DashboardPreviewSection /></ScrollReveal>
      <ScrollReveal><ProblemSection /></ScrollReveal>
      <ScrollReveal><FeaturesSection /></ScrollReveal>
      <ScrollReveal><TemplatesSection /></ScrollReveal>
      <ScrollReveal><WorkflowSection /></ScrollReveal>
      <ScrollReveal><TestimonialsSection /></ScrollReveal>
      <ScrollReveal><PricingSection /></ScrollReveal>
      <ScrollReveal><BlogSection /></ScrollReveal>
      <ScrollReveal><FAQSection /></ScrollReveal>
      <ScrollReveal><FinalCTA /></ScrollReveal>
      <Footer />
    </main>
  )
}

function Navbar() {
  return (
    <header className={styles.navWrap}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand} aria-label="webtokoku">
          <WebtokokuLogo className={styles.logoInline} />
        </Link>
        <div className={styles.navLinks}>
          <a href="#fitur">Fitur</a>
          <a href="#template">Template</a>
          <a href="#cara-kerja">Cara kerja</a>
          <Link href="/blog">Blog</Link>
        </div>
        <div className={styles.navActions}>
          <Link href="/auth/login" className={styles.textLink}>
            Masuk
          </Link>
          <Link href="/auth/register" className={styles.navButton}>
            Buat Toko - Gratis!
          </Link>
        </div>
      </nav>
    </header>
  )
}

function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <h1>Buat web tokomu sendiri dalam sekali klik</h1>
          <p className={styles.heroLead}>
            Katalog, harga, stok, alamat, dan order WhatsApp dalam satu halaman.
            Seller tinggal isi, pembeli langsung paham.
          </p>
          <div className={styles.heroActions}>
            <Link href="/auth/register" className={styles.primaryButton}>
              Buat Toko - Gratis! <ArrowRight size={18} />
            </Link>
            <Link href="/demo/fashion.html" className={styles.secondaryButton}>
              Lihat demo <ExternalLink size={16} />
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="Preview website toko">
          <div className={styles.browserMock}>
            <div className={styles.browserBar}>
              <span aria-hidden="true"><i /><i /><i /></span>
              <strong>luna.webtokoku.id</strong>
            </div>
            <div className={styles.desktopShot}>
              <img src="/template-previews/luxe-desktop.jpg" alt="Preview website toko desktop" />
            </div>
          </div>
          <div className={styles.mobileMock}>
            <div className={styles.mobileSpeaker} aria-hidden="true" />
            <div className={styles.mobileShot}>
              <img src="/template-previews/luxe-mobile.jpg" alt="Preview website toko mobile" />
            </div>
          </div>
          <div className={styles.previewFeatures} aria-label="Fitur preview">
            <span>Katalog produk</span>
            <span>Siap di mobile</span>
            <span>Order langsung</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProblemSection() {
  return (
    <section className={styles.section}>
      <div className={styles.split}>
        <div>
          <div className={styles.sectionRule} aria-label="Fungsi utama" />
          <h2>Marketplace tetap jalan. Website toko jadi pusat info.</h2>
        </div>
        <div className={styles.copyStack}>
          <p>
            Banyak seller sudah punya produk bagus, tapi katalog masih tersebar di chat,
            feed, dan marketplace. webtokoku menyatukan info penting ke satu halaman.
          </p>
          <p>
            Pembeli bisa melihat produk, alamat, dan cara order tanpa tanya ulang.
            Seller tetap menerima pesanan di WhatsApp.
          </p>
        </div>
      </div>
    </section>
  )
}

function DashboardPreviewSection() {
  const benefits = [
    {
      icon: ShoppingBag,
      title: 'Pesanan terpantau',
      description: 'Cek pesanan baru dan status pembayaran.',
    },
    {
      icon: Package,
      title: 'Produk lebih tertata',
      description: 'Kelola katalog, harga, dan stok dari satu tempat.',
    },
    {
      icon: BarChart3,
      title: 'Performa terlihat',
      description: 'Pantau omzet dan kunjungan toko dengan jelas.',
    },
  ]

  return (
    <section className={styles.dashboardPreview}>
      <div className={styles.dashboardPreviewGrid}>
        <div className={styles.dashboardPreviewCopy}>
          <span>DASHBOARD TOKO</span>
          <h2>Semua aktivitas toko dalam satu dashboard.</h2>
          <p>
            Pantau pesanan, omzet, produk, dan kunjungan tanpa berpindah aplikasi.
            Data diperbarui mengikuti aktivitas tokomu.
          </p>
          <div className={styles.dashboardBenefitList}>
            {benefits.map(({ icon: Icon, title, description }) => (
              <div key={title} className={styles.dashboardBenefit}>
                <Icon aria-hidden="true" />
                <div>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </div>
              </div>
            ))}
          </div>
          <Link href="/auth/register" className={styles.dashboardCta}>
            Mulai kelola toko
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.dashboardShot}>
          <img
            src="/marketing/vincosme-dashboard-real.webp"
            alt="Dashboard seller Webtokoku untuk toko Vincosme"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="fitur" className={styles.sectionAlt}>
      <SectionHeader
        label="Fitur"
        title="Yang dibutuhkan toko kecil untuk mulai online."
        body="Tidak dibuat ramai. Cukup alat yang membantu katalog terlihat rapi dan pesanan mudah masuk."
      />
      <div className={styles.featureGrid}>
        {features.map(feature => (
          <article key={feature.title} className={styles.featureCard}>
            <div className={styles.iconBox}>{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function TemplatesSection() {
  return (
    <section id="template" className={styles.templateSection}>
      <SectionHeader
        label="Template"
        title="Template untuk beberapa jenis usaha."
        body="Pilih desain awal, lalu sesuaikan isi dan gambarnya dari dashboard."
        dark
      />
      <div className={styles.templateRail}>
        <div className={styles.templateTrack}>
        {[...templates, ...templates].map((template, index) => (
          <Link href={template.href} key={`${template.name}-${index}`} className={styles.templateCard} target="_blank" aria-hidden={index >= templates.length}>
            <div className={styles.templateImage}>
              <img src={template.desktop} alt={`Template ${template.name}`} />
              <img src={template.mobile} alt={`Mobile ${template.name}`} className={styles.templatePhone} />
            </div>
            <div className={styles.templateInfo}>
              <span>{template.category}</span>
              <h3>{template.name}</h3>
            </div>
          </Link>
        ))}
        </div>
      </div>
    </section>
  )
}

function WorkflowSection() {
  const steps = [
    ['1', 'Buat akun', 'Seller daftar dan mengisi profil toko.'],
    ['2', 'Pilih template', 'Pilih desain yang sesuai kategori usaha.'],
    ['3', 'Tambah produk', 'Upload foto, harga, stok, dan deskripsi produk.'],
    ['4', 'Bagikan link', 'Toko siap dibuka di subdomain sendiri.'],
  ]

  return (
    <section id="cara-kerja" className={styles.section}>
      <SectionHeader
        label="Cara kerja"
        title="Dari data toko ke link yang bisa dibagikan."
        body="Mulai dari hal penting dulu. Produk, teks, dan tampilan bisa dirapikan setelah toko dibuat."
      />
      <div className={styles.stepGrid}>
        {steps.map(([number, title, body]) => (
          <article key={number} className={styles.stepCard}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="harga" className={styles.pricingSection}>
      <div className={styles.pricingHeader}>
        <h2>Mulai gratis. Naik paket kalau sudah perlu.</h2>
        <p>Paket awal cukup untuk membuat tokomu berjalan langsung. Upgrade Pro jika tokomu sudah berkembang pesat.</p>
      </div>
      <div className={styles.pricingTable}>
        <div className={styles.priceBox}>
          <div className={styles.planTop}>
            <div>
              <h3>Free</h3>
              <p>Untuk mulai mengenalkan tokomu secara online.</p>
            </div>
            <strong>Rp 0</strong>
          </div>
          <ul>
            <li><CheckCircle2 size={16} /> Maksimal 15 produk aktif</li>
            <li><CheckCircle2 size={16} /> Maksimal 3 kategori produk</li>
            <li><CheckCircle2 size={16} /> Pilihan 5 template toko</li>
            <li><CheckCircle2 size={16} /> nama-toko.webtokoku.id</li>
            <li><CheckCircle2 size={16} /> Watermark WebTokoku aktif</li>
            <li><CheckCircle2 size={16} /> Template terkunci setelah dipublish</li>
          </ul>
          <Link href="/auth/register" className={styles.primaryButton}>
            Buat Toko - Gratis!
          </Link>
        </div>
        <div className={styles.priceBox} style={{ border: '2px solid #247a52', boxShadow: '0 14px 28px -18px rgba(36, 122, 82, 0.45)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '12px', right: '-32px', background: 'linear-gradient(135deg, #247a52 0%, #185f3d 100%)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '4px 32px', transform: 'rotate(45deg)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Populer
          </div>
          <div className={styles.planTop}>
            <div>
              <h3>Pro</h3>
              <p>Untuk tokomu yang butuh penjualan tanpa batas.</p>
            </div>
            <strong>Rp 39rb<span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>/bln</span></strong>
          </div>
          <ul>
            <li><CheckCircle2 size={16} style={{ color: '#247a52' }} /> Produk aktif tanpa batas</li>
            <li><CheckCircle2 size={16} style={{ color: '#247a52' }} /> Kategori produk tanpa batas</li>
            <li><CheckCircle2 size={16} style={{ color: '#247a52' }} /> Bebas ganti template kapan saja</li>
            <li><CheckCircle2 size={16} style={{ color: '#247a52' }} /> Tanpa watermark WebTokoku</li>
            <li><CheckCircle2 size={16} style={{ color: '#247a52' }} /> Custom domain (segera hadir)</li>
            <li><CheckCircle2 size={16} style={{ color: '#247a52' }} /> Prioritas dukungan WhatsApp</li>
          </ul>
          <Link href="/auth/register" className={styles.primaryButton} style={{ background: 'linear-gradient(135deg, #247a52 0%, #185f3d 100%)', border: 'none' }}>
            Daftar & Upgrade Sekarang
          </Link>
        </div>
      </div>
    </section>
  )
}

function BlogSection() {
  return (
    <section className={styles.sectionAlt}>
      <div className={styles.blogHeader}>
        <SectionHeader
          label="Artikel"
          title="Catatan singkat untuk seller."
          body="Tulisan praktis tentang katalog, brand, dan pesanan."
        />
        <Link href="/blog" className={styles.textButton}>
          Lihat semua artikel <ArrowRight size={16} />
        </Link>
      </div>
      <div className={styles.blogGrid}>
        {blogPosts.slice(0, 3).map(post => (
          <Link href={`/blog/${post.slug}`} key={post.slug} className={styles.blogCard}>
            <span>{post.category}</span>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <small>{post.readTime}</small>
          </Link>
        ))}
      </div>
    </section>
  )
}

function FAQSection() {
  const faqs = [
    {
      q: 'Apakah webtokoku menggantikan marketplace?',
      a: 'Tidak harus. Banyak seller tetap memakai marketplace untuk mencari pembeli baru, lalu memakai website sendiri untuk katalog, branding, dan repeat order.',
    },
    {
      q: 'Apakah pembeli harus membuat akun?',
      a: 'Tidak. Pembeli bisa melihat produk dan mengirim pesanan ke WhatsApp seller tanpa akun pembeli.',
    },
    {
      q: 'Apakah toko bisa memakai domain sendiri?',
      a: 'Bisa disiapkan. Secara sistem, webtokoku sudah mendukung subdomain toko dan fondasi custom domain untuk seller yang ingin alamat lebih mandiri.',
    },
  ]

  return (
    <section className={styles.section}>
      <SectionHeader
        label="FAQ"
        title="Pertanyaan sebelum mulai."
        body="Jawaban singkat untuk hal yang sering ditanyakan."
      />
      <div className={styles.faqList}>
        {faqs.map(item => (
          <article key={item.q} className={styles.faqItem}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className={styles.finalCta}>
      <h2>Toko online dulu. Lengkapnya sambil jalan.</h2>
      <p>
        Masukkan produk utama, bagikan link, lalu rapikan isi toko dari dashboard.
      </p>
      <div className={styles.heroActions}>
        <Link href="/auth/register" className={styles.primaryButton}>
          Buat Toko - Gratis! <ArrowRight size={18} />
        </Link>
        <Link href="/demo/fashion.html" className={styles.secondaryButton}>
          Buka demo
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBrand}>
        <Link href="/" className={styles.brand}>
          <WebtokokuLogo className={styles.logoInline} />
        </Link>
        <p>Website toko sederhana untuk seller UMKM Indonesia.</p>
        <p className={styles.madeBy}>
          Dibuat oleh <a href="https://bazzcreate.vercel.app" target="_blank" rel="noreferrer">Bazzcreate</a>
        </p>
      </div>
      <div className={styles.footerColumns}>
        <div>
          <strong>Produk</strong>
          <a href="#fitur">Fitur</a>
          <a href="#template">Template</a>
          <a href="#cara-kerja">Cara kerja</a>
        </div>
        <div>
          <strong>Akun</strong>
          <Link href="/auth/login">Masuk</Link>
          <Link href="/auth/register">Buat Toko - Gratis!</Link>
          <Link href="/blog">Blog</Link>
        </div>
      </div>
    </footer>
  )
}

function TestimonialsSection() {
  return (
    <section id="testimonial" className={styles.sectionAlt}>
      <SectionHeader
        label="Testimonial"
        title="Kata mereka yang menggunakan webtokoku."
        body="UMKM dari berbagai bidang telah mempermudah proses jual beli mereka dengan website katalog yang rapi."
      />
      <div className={styles.testimonialGrid}>
        {testimonials.map(item => (
          <article key={item.shopName} className={styles.testimonialCard}>
            <div className={styles.testimonialHeader}>
              <div
                className={styles.testimonialAvatar}
                style={{ backgroundColor: item.avatarBg, color: item.avatarColor }}
                aria-hidden="true"
              >
                {item.avatarInitials}
              </div>
              <div className={styles.testimonialMeta}>
                <h3>{item.name}</h3>
                <span>{item.shopName} • {item.category}</span>
              </div>
            </div>
            <p className={styles.testimonialQuote}>&ldquo;{item.quote}&rdquo;</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function SectionHeader({
  label,
  title,
  body,
  dark = false,
}: {
  label: string
  title: string
  body: string
  dark?: boolean
}) {
  return (
    <div className={`${styles.sectionHeader} ${dark ? styles.darkHeader : ''}`}>
      <div className={styles.sectionRule} aria-label={label} />
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  )
}
