import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { blogPosts } from '@/lib/blog'
import { WebtokokuLogo } from '@/components/brand/WebtokokuLogo'
import styles from './blog.module.css'

export const metadata: Metadata = {
  title: 'Blog webtokoku - Panduan Website Toko Online untuk UMKM',
  description:
    'Artikel singkat tentang website toko online, katalog produk, domain toko, dan strategi jualan digital untuk UMKM.',
  alternates: {
    canonical: 'https://www.webtokoku.id/blog',
  },
}

export default function BlogPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}>
          <WebtokokuLogo className={styles.logoInline} />
        </Link>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} />
          Kembali
        </Link>
      </nav>

      <section className={styles.hero}>
        <p>Blog</p>
        <h1>Panduan ringkas untuk membangun toko online yang lebih rapi.</h1>
        <span>
          Ditulis untuk seller UMKM yang ingin memahami website toko, katalog produk,
          domain, dan cara membuat pengalaman belanja terasa lebih jelas.
        </span>
      </section>

      <section className={styles.grid}>
        {blogPosts.map(post => (
          <Link href={`/blog/${post.slug}`} key={post.slug} className={styles.card}>
            <small>{post.category} - {post.readTime}</small>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <span>
              Baca artikel <ArrowRight size={15} />
            </span>
          </Link>
        ))}
      </section>
    </main>
  )
}
