# 🍳 We're Cooked

**We're Cooked** adalah aplikasi web rekomendasi resep makanan berbasis bahan, dirancang untuk membantu kamu memasak dari bahan yang tersedia di rumah.

Capstone Project ini dibangun dengan menggabungkan teknologi **Machine Learning**, **Progressive Web App (PWA)**, dan **IndexedDB**, serta UI responsif modern.

---

## ✨ Fitur Unggulan

- 🔍 **Rekomendasi Resep**: Masukkan bahan, dapatkan resep relevan dengan pencocokan cerdas (cosine similarity).
- 🎲 **Resep Acak**: Inspirasi masakan langsung muncul saat membuka aplikasi.
- 📄 **Simpan ke PDF**: Cetak atau unduh resep favoritmu dalam bentuk PDF.
- ❤️ **Bookmark**: Simpan resep favorit secara offline dengan IndexedDB.
- 🌗 **Dark Mode**: Nyaman digunakan siang dan malam.
- 📦 **Offline Ready**: PWA + IndexedDB memastikan aplikasi tetap bisa digunakan tanpa internet.
- 📱 **Responsif & Installable**: Bisa diakses dari semua perangkat dan diinstal seperti aplikasi native.
- ✨ **Transisi Halus**: Gunakan View Transition API untuk navigasi antar halaman yang smooth.

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: Context API
- **ML Logic**: Cosine Similarity (Manual model)
- **Data Storage**: IndexedDB (via `idb`)
- **PDF Export**: `html2pdf.js`
- **Alerts**: SweetAlert2
- **PWA Support**: Vite Plugin PWA
- **Scraping Gambar**: Node.js + Puppeteer (eksternal pre-processing)

---

## 🚀 Cara Menjalankan 

### Install dependencies
```bash
npm install
```

### Jalankan development server
```bash
npm run dev
```

### Jalankan build production
```bash
npm run build
npx serve dist
```

## Sturktur Proyek

```plaintext
├── public/
│   └── data_with_image.json  # Data resep dengan gambar
├── src/
│   ├── components/           # Navbar, Footer, dll
│   ├── context/              # SearchContext
│   ├── pages/                # Home, Detail, Bookmark, About, NotFound
│   ├── presenters/           # MVP logic: HomePresenter, DetailPresenter
│   ├── utils/                # IndexedDB handler, Alert helper
│   └── views/                # View untuk tiap halaman
```

🤝 Kontributor
Ali Tawfiqur Rahman 😎(Fullstack, UX/UI)
Tim ML & Dev (Capstone Team)