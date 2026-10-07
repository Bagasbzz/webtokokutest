import type { Metadata } from "next";
import "./globals.css";
import "../src/styles/designTokens.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.webtokoku.id"),
  title: {
    default: "webtokoku - Website Toko Online untuk UMKM",
    template: "%s | webtokoku",
  },
  description: "Buat website toko online untuk UMKM. Kelola katalog produk, tampilkan template toko, dan terima order lewat WhatsApp.",
  keywords: [
    "website toko online",
    "toko online UMKM",
    "katalog produk online",
    "website jualan",
    "checkout WhatsApp",
  ],
  authors: [{ name: "webtokoku" }],
  creator: "webtokoku",
  publisher: "webtokoku",
  alternates: {
    canonical: "https://www.webtokoku.id",
  },
  icons: {
    icon: [
      { url: '/brand/webtokoku-logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: '/brand/webtokoku-logo.svg',
  },
  verification: {
    google: "r-RpP1KKnonQkR864pV2qxT-6ZAEBKLhLWcdCU5wH2M",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://www.webtokoku.id",
    siteName: "webtokoku",
    title: "webtokoku - Website Toko Online untuk UMKM",
    description: "Buat website toko online yang rapi untuk katalog produk, branding, dan order WhatsApp.",
    images: [
      {
        url: "/brand/webtokoku-logo.svg",
        width: 128,
        height: 128,
        alt: "webtokoku logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "webtokoku - Website Toko Online untuk UMKM",
    description: "Buat website toko online yang rapi untuk katalog produk, branding, dan order WhatsApp.",
    images: ["/brand/webtokoku-logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
