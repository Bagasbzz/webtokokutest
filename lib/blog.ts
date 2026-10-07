export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  publishedAt: string
  readTime: string
  keywords: string[]
  content: Array<{
    heading: string
    body: string[]
  }>
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'website-toko-online-untuk-umkm',
    title: 'Kenapa UMKM Mulai Perlu Website Toko Sendiri',
    excerpt:
      'Marketplace tetap penting, tetapi website toko memberi ruang untuk membangun brand, repeat order, dan hubungan langsung dengan pelanggan.',
    category: 'Strategi Jualan',
    publishedAt: '2026-05-15',
    readTime: '4 menit',
    keywords: ['website toko online', 'UMKM digital', 'toko online sendiri'],
    content: [
      {
        heading: 'Marketplace bagus untuk mencari pembeli baru',
        body: [
          'Banyak seller memulai dari marketplace karena trafiknya sudah tersedia. Itu masuk akal. Tantangannya, pembeli sering mengingat platform, bukan nama toko.',
          'Website toko sendiri membantu seller punya alamat yang lebih mudah dibagikan, lebih rapi untuk katalog, dan lebih kuat untuk membangun identitas brand.',
        ],
      },
      {
        heading: 'Repeat order lebih mudah diarahkan',
        body: [
          'Saat pelanggan sudah pernah membeli, seller bisa mengarahkan repeat order ke website sendiri. Di sana pelanggan melihat katalog terbaru, pilihan pembayaran, dan informasi toko tanpa distraksi kompetitor.',
          'Untuk UMKM, langkah kecil seperti punya domain toko sendiri bisa membuat bisnis terlihat lebih siap dan lebih dipercaya.',
        ],
      },
    ],
  },
  {
    slug: 'cara-membuat-katalog-produk-yang-meyakinkan',
    title: 'Cara Membuat Katalog Produk yang Lebih Meyakinkan',
    excerpt:
      'Katalog yang rapi tidak harus rumit. Fokus pada foto jelas, harga terbaca, deskripsi singkat, dan tombol order yang mudah ditemukan.',
    category: 'Katalog Produk',
    publishedAt: '2026-05-15',
    readTime: '3 menit',
    keywords: ['katalog produk online', 'foto produk', 'deskripsi produk'],
    content: [
      {
        heading: 'Mulai dari foto dan nama produk',
        body: [
          'Pembeli memindai halaman dengan cepat. Nama produk perlu jelas, foto tidak terlalu gelap, dan harga harus mudah ditemukan di layar mobile.',
          'Jangan menumpuk terlalu banyak informasi di kartu produk. Simpan detail panjang di deskripsi atau percakapan WhatsApp.',
        ],
      },
      {
        heading: 'Buat alur order terasa pendek',
        body: [
          'Setelah pembeli tertarik, tombol order harus terlihat tanpa membuat mereka mencari-cari. Checkout via WhatsApp cocok untuk UMKM karena percakapan tetap personal.',
          'Katalog yang baik bukan hanya terlihat cantik, tetapi membantu pembeli mengambil keputusan dengan tenang.',
        ],
      },
    ],
  },
  {
    slug: 'subdomain-dan-custom-domain-untuk-toko-online',
    title: 'Subdomain dan Custom Domain untuk Toko Online: Bedanya Apa?',
    excerpt:
      'Subdomain cocok untuk mulai cepat. Custom domain cocok saat toko ingin tampil lebih mandiri dan mudah diingat.',
    category: 'Domain Toko',
    publishedAt: '2026-05-15',
    readTime: '4 menit',
    keywords: ['custom domain toko', 'subdomain toko online', 'domain UMKM'],
    content: [
      {
        heading: 'Subdomain membuat toko bisa langsung punya alamat',
        body: [
          'Dengan subdomain seperti nama-toko.webtokoku.id, seller bisa langsung membagikan website toko tanpa membeli domain sendiri terlebih dahulu.',
          'Format ini rapi untuk tahap awal karena tetap membawa nama toko di bagian depan alamat.',
        ],
      },
      {
        heading: 'Custom domain memberi kesan lebih mandiri',
        body: [
          'Saat bisnis mulai lebih serius, domain seperti namatoko.id bisa dipasang sebagai alamat utama. Website tetap dikelola dari platform yang sama, tetapi alamatnya menjadi milik seller.',
          'Untuk pelanggan, domain yang pendek dan konsisten membantu toko lebih mudah diingat.',
        ],
      },
    ],
  },
]

export function getBlogPost(slug: string) {
  return blogPosts.find(post => post.slug === slug)
}
