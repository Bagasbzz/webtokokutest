import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
