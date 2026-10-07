import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { blogPosts, getBlogPost } from '@/lib/blog'
import { WebtokokuLogo } from '@/components/brand/WebtokokuLogo'
import styles from '../blog.module.css'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return blogPosts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost(params.slug)
  if (!post) return { title: 'Artikel Tidak Ditemukan | webtokoku' }

  return {
    title: `${post.title} | Blog webtokoku`,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: {
      canonical: `https://www.webtokoku.id/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.webtokoku.id/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
    },
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug)
  if (!post) notFound()

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}>
          <WebtokokuLogo className={styles.logoInline} />
        </Link>
        <Link href="/blog" className={styles.backLink}>
          <ArrowLeft size={16} />
          Blog
        </Link>
      </nav>

      <article className={styles.article}>
        <header>
          <p>{post.category} - {post.readTime}</p>
          <h1>{post.title}</h1>
          <span>{post.excerpt}</span>
        </header>

        {post.content.map(section => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        <footer className={styles.articleCta}>
          <h2>Siap membuat website toko sendiri?</h2>
          <p>Mulai dari katalog yang rapi, lalu bangun pengalaman belanja yang lebih dipercaya.</p>
          <Link href="/auth/register">Buat toko gratis</Link>
        </footer>
      </article>
    </main>
  )
}
