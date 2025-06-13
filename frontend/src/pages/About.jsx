import React from 'react';

export default function AboutPage() {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-2">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Tentang Aplikasi</h1>
        <p className="text-md leading-relaxed">
          <strong>We're Cooked</strong> adalah aplikasi rekomendasi resep masakan berbasis bahan yang kamu miliki.
          Aplikasi ini dibuat sebagai bagian dari proyek capstone kami, dengan integrasi teknologi Machine Learning, PWA, dan IndexedDB untuk pengalaman yang cepat, ringan, dan bisa digunakan saat offline.
        </p>
        <ol className="mt-4 list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
          Anggota Tim:
            <li >(FEBE) FC861D5Y1587 - Ali Tawfiqur Rahman - IAI Al Muhammad Cepu</li>
            <li >(ML) MC006D5Y1437 - Radithya Fawwaz Aydin - Universitas Brawijaya</li>
            <li >(ML) MC006D5Y1489 - Muhammad Aldy Naufal Fadhilah - Universitas Brawijaya</li>
            <li >(ML) MC006D5Y1489 - Sulthan Muhammad Rafif Ilham - Universitas Brawijaya</li>   
            <li >(FEBE) FC327D5Y0513 - Haikal Fawwaz Karim - Universitas Teknologi Yogyakarta</li>
            <li >(FEBE) FC769D5Y2138 - Muhammad Farid Jazir Fadhlurrahman - Universitas Islam Makassar</li>       
        </ol>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Dibuat dengan ❤️ oleh tim CC25-CF275 Capstone CodingCamp Mahasiswa dengan penuh semangat.
        </p>
      </div>
    </div>
  );
}
