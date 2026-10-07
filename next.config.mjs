/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirect: jika ada yang akses /index.html langsung, kembalikan ke '/'
  // Ini mencegah [slug] menangkap /index.html dan menampilkan "Toko Tidak Ditemukan"
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Izinkan Next.js Image component load dari domain eksternal
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.com',
      },
    ],
  },
};

export default nextConfig;
