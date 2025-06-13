import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white px-6">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-lg mb-6">Halaman yang kamu cari tidak ditemukan.</p>
      <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
