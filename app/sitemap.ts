import type { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog'

const baseUrl = 'https://www.webtokoku.id'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/blog'].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  const blogRoutes = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...blogRoutes]
}
