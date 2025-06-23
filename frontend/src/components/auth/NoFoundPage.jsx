// Contoh komponen NotFound
export default NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-8xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Halaman Tidak Ditemukan</h1>
        <p className="text-gray-600 mb-6">Halaman yang Anda cari tidak dapat ditemukan.</p>
        <a 
          href="/" 
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
};