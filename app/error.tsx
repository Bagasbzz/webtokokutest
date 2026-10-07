"use client";
import React from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  console.error(error);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">Terjadi Kesalahan</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Maaf, terjadi kesalahan pada server. Silakan coba lagi nanti.
      </p>
    </main>
  );
}
