## 🍽️🔥 WereCooked API

REST API sederhana untuk mencari dan melihat resep makanan berdasarkan bahan, dibangun menggunakan [Hapi.js](https://hapi.dev/) dan [MongoDB](https://www.mongodb.com/).

---

## 🚀 Fitur
- Ambil daftar resep
- Lihat detail resep berdasarkan ID
- Registrasi dan login pengguna (autentikasi JWT)
- Manajemen bookmark resep oleh pengguna
- Pengelolaan profil pengguna (update profil dan password)
- Struktur modular dengan controller, handler, dan model
- Menggunakan `.env` untuk konfigurasi lingkungan

---

## 📁 Struktur Proyek

```
project-root/
├── server.js                  # Entry point aplikasi
├── src/
│   ├── handlers/             # Controller untuk request handling
│   │   ├── authHandler.js    # Logika register & login
│   │   ├── bookmarkHandler.js# Logika CRUD bookmark
│   │   ├── recipeHandler.js  # Logika resep masakan
│   │   └── userHandler.js    # Logika profil user
│   ├── middlewares/          # Middleware, misal autentikasi
│   │   └── authMiddleware.js
│   ├── routes/               # Route definitions
│   │   ├── authRoutes.js     # Route register & login
│   │   ├── bookmarkRoutes.js # Route bookmark (dengan auth)
│   │   ├── recipeRoutes.js   # Route resep masakan
│   │   └── userRoutes.js     # Route profil user (dengan auth)
│   ├── services/             # Business logic dan akses DB
│   │   ├── db.js             # Koneksi database
│   │   └── userService.js    # Service user
│   ├── utils/                # Utility helper functions
│   │   ├── hash.js           # Hash password
│   │   └── token.js          # Generate JWT token
│   └── validations/          # Validasi input request
│       └── authValidation.js # Joi schema untuk register
├── .env                      # Konfigurasi environment variables
├── package.json              # Dependencies dan scripts
└── readme.md                 # Dokumentasi proyek
```


---

## ⚙️ Instalasi & Setup

### 1. Clone & Install Dependency

```bash
git clone https://github.com/takedowndmca/were-cooked-backend.git
cd were-cooked-backend
npm install
````

### 2. Buat File `.env`

Isi dengan konfigurasi MongoDB lokal:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/dapur
JWT_SECRET=
```

### 3. Jalankan Server

```bash
npm start
```

Atau dengan nodemon (hot reload):

```bash
npm run dev
```

Server akan berjalan di:

```
http://localhost:3000
```

---

## 📚 Dokumentasi API

## Autentikasi

### POST /register

Registrasi user baru.

**Request Body:**

```json
{
  "name": "string, minimal 3 karakter",
  "email": "string, email valid",
  "password": "string, minimal 8 karakter"
}
```

**Response (201 Created):**

```json
{
  "error": false,
  "message": "User Created",
  "userId": "id user"
}
```

**Error:**

* 400 Bad Request (validasi gagal)
* 409 Conflict (email sudah terdaftar)

---

### POST /login

Login user.

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 OK):**

```json
{
  "error": false,
  "message": "Login berhasil",
  "loginResult": {
    "userId": "id user",
    "name": "nama user",
    "token": "JWT token"
  }
}
```

**Error:**

* 404 Not Found (email tidak ditemukan)
* 401 Unauthorized (password salah)

---

## User Profile

*Semua endpoint di bawah menggunakan autentikasi JWT melalui middleware `authMiddleware`.*

### GET /profile

Ambil data profil user.

**Response (200 OK):**

```json
{
  "error": false,
  "message": "Berhasil mendapatkan profil",
  "user": {
    "id": "user id",
    "name": "nama user",
    "email": "email user",
    "photo": "url photo atau string kosong",
    // field lain kecuali password dan _id
  }
}
```

**Error:**

* 404 Not Found (user tidak ditemukan)

---

### PUT /profile

Update profil user (nama dan foto).

**Request Body:**

```json
{
  "name": "string, minimal 3 karakter",
  "photo": "string (opsional)"
}
```

**Response (200 OK):**

```json
{
  "error": false,
  "message": "Profil berhasil diperbarui",
  "user": {
    "id": "user id",
    "name": "nama user baru",
    "email": "email user",
    "photo": "photo terbaru"
  }
}
```

**Error:**

* 400 Bad Request (nama kurang dari 3 karakter)
* 404 Not Found (user tidak ditemukan)

---

### PUT /profile/password

Update password user.

**Request Body:**

```json
{
  "currentPassword": "string",
  "newPassword": "string, minimal 8 karakter"
}
```

**Response (200 OK):**

```json
{
  "error": false,
  "message": "Password berhasil diperbarui"
}
```

**Error:**

* 404 Not Found (user tidak ditemukan)
* 401 Unauthorized (password lama salah)
* 400 Bad Request (password baru kurang dari 8 karakter)

---

## Resep

### GET /resep

Ambil daftar resep, mendukung pencarian dan paginasi.

**Query Parameters (opsional):**

* `search` = string, bahan atau kata kunci, bisa lebih dari satu dipisah koma, contoh: `search=ayam,bawang`
* `page` = integer, default 1
* `limit` = integer, default 50, max 50

**Response (200 OK):**

```json
{
  "error": false,
  "data": [
    {
      "id": "uuid",
      "Title": "Judul Resep",
      "Ingredients": "Daftar bahan lengkap",
      "Steps": "Langkah-langkah memasak",
      "Loves": "jumlah suka",
      "URL": "link resep asli",
      "Category": "kategori",
      "Title Cleaned": "judul bersih",
      "Total Ingredients": "jumlah bahan",
      "Ingredients Cleaned": "bahan bersih",
      "Total Steps": "jumlah langkah",
      "Image": "url gambar"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### GET /resep/{id}

Ambil detail resep berdasarkan ID.

**Response (200 OK):**

```json
{
  "error": false,
  "data": {
    "id": "uuid",
    "Title": "Judul Resep",
    "Ingredients": "Daftar bahan lengkap",
    "Steps": "Langkah-langkah memasak",
    "Loves": "jumlah suka",
    "URL": "link resep asli",
    "Category": "kategori",
    "Title Cleaned": "judul bersih",
    "Total Ingredients": "jumlah bahan",
    "Ingredients Cleaned": "bahan bersih",
    "Total Steps": "jumlah langkah",
    "Image": "url gambar"
  }
}
```

**Error (404 Not Found):**

```json
{
  "error": true,
  "message": "Resep tidak ditemukan"
}
```

---

## Bookmark

*Semua endpoint di bawah harus autentikasi JWT*

### GET /bookmark

Ambil daftar bookmark milik user.

**Response (200 OK):**

```json
{
  "error": false,
  "data": [
    {
      "userId": "id user",
      "recipeId": "id resep",
      "title": "judul resep",
      "image": "url gambar",
      "createdAt": "tanggal"
    },
    ...
  ]
}
```

---

### POST /bookmark

Tambah bookmark baru.

**Request Body:**

```json
{
  "recipeId": "string",
  "title": "string",
  "image": "string (url gambar)"
}
```

**Response (201 Created):**

```json
{
  "error": false,
  "message": "Bookmark berhasil ditambahkan"
}
```

**Error:**

* 409 Conflict (bookmark sudah ada)

---

### DELETE /bookmark/{id}

Hapus bookmark berdasarkan ID.

**Response (200 OK):**

```json
{
  "error": false,
  "message": "Bookmark dihapus"
}
```

**Error:**

* 404 Not Found (bookmark tidak ditemukan)
---

### 🌐 Base URL Integrasi Machine Learning
## > Semua endpoint ML dimulai dari prefix `/ml`

## 📋 Daftar Endpoint

### ✅ 1. `GET /health`

**Deskripsi:**
Cek kesehatan layanan ML API.

**Response:**

```json
{
    "features": {
        "advanced_filtering": true,
        "ingredient_normalization": true,
        "multiple_ingredients": true
    },
    "models_loaded": true,
    "status": "healthy",
    "total_recipes": 11334
}
```

---

### ✅ 2. `GET /categories`

**Deskripsi:**
Ambil daftar kategori makanan & tingkat kompleksitas.

**Response:**

```json
{
    "categories": [
        "Ayam",
        "Ikan",
        "Kambing",
        "Sapi",
        "Tahu",
        "Telur",
        "Tempe",
        "Udang"
    ],
    "complexities": [
        "Butuh Usaha",
        "Cepat & Mudah",
        "Level Dewa Masak"
    ],
    "ratings": [
        1,
        2,
        3,
        4,
        5
    ],
    "stats": {
        "avg_rating": 2,
        "total_categories": 8,
        "total_recipes": 11334
    },
    "status": "success"
}
```

---

### ✅ 3. `POST /recommend` 🔒

**Deskripsi:**
Rekomendasi resep berdasarkan bahan makanan dan filter tambahan.

**Headers:**

* `Authorization: Bearer <token>`

**Body (JSON):**

```json
{
  "ingredients": ["telur", "cabai"],
  "complexity_filter": "Cepat & Mudah",  // optional
  "min_rating": 4,                       // optional
  "top_n": 5                             // optional
}
```

**Response:**

```json
{
    "after_filters": 44,
    "message": "Ditemukan 5 resep untuk bahan: telur, cabai",
    "recommendations": [
        {
            "category": "Telur",
            "complexity": "Cepat & Mudah",
            "ingredients": "1/2 kg telur--200 gr cabai hijau--1 buah tomat--3 siung bawang merah--3 siung bawang putih--secukupnya Gula dan garam--secukupnya Minyak goreng--",
            "rating": 4,
            "similarity_score": 0.5224,
            "steps": "1) Rebus telur sampai matang, lalu kupas dan goreng sebentar dengan minyak panas.\n2) Rebus cabai hijau dan duo bawang sampai empuk/matang,tiriskan dan uleg.sisihkan.\n3) Panskan minyak goreng lalu masukan sambal, goreng sampai wangi lalu tambhkan tomat yg sudah d potong2, lalu masukan gula garam dan telur aduk sampai merata.matikan api.",
            "title": "🌶 telur sambal ijo 🌶"
        },
    ]
}
```

---

### ✅ 4. `POST /similar` 🔒

**Deskripsi:**
Ambil resep yang mirip berdasarkan bahan masakan.

**Headers:**

* `Authorization: Bearer <token>`

**Body (JSON):**

```json
{
  "recipe_title": "ayam kecap",
  "top_n": 5
}
```

**Response:**

```json
{
    "base_recipe": "ayam kecap",
    "message": "Ditemukan 5 resep yang mirip dengan \"ayam kecap\"",
    "recommendations": [
        {
            "category": "Ayam",
            "complexity": "Butuh Usaha",
            "ingredients": "1/4 ayam--Tepung sajiku--2 Bawang putih--3 Bawang merah--1 cm jahe--Cabe rawit--secukupnya Kecap--secukupnya Air--",
            "rating": 2,
            "similarity_score": 0.7332,
            "steps": "1) Ayam dipotong kecil-kecil dan campurkan dengan tepung sajiku, goreng sampai kering lalu tiriskan\n2) Iris tipis bawang putih, bawang merah, cabe rawit dan geprek jahe\n3) Tumis irisan bawang, cabe dan jahe sampai wangi lalu tambah air secukupnya\n4) Setelah air mendidih masukkan ayam dan tambahkan garam, penyedap rasa dan kecap secukupnya\n5) Tunggu hingga kuah menjadi sedikit kental dan ayam tepung kecap siap disiapkan",
            "title": "Ayam tepung kecap",
            "url": "https://cookpad.com/id/resep/4459543-ayam-tepung-kecap"
        },
    ]
}
```

---

## ✅ Validasi Input

**POST /recommend**

* `ingredients`: wajib, bisa string atau array minimal 1 item
* `complexity_filter`: salah satu dari `["Cepat & Mudah", "Sedang", "Sulit"]` *(optional)*
* `min_rating`: angka 1–5 *(optional)*
* `top_n`: angka minimal 1 *(optional)*

**POST /similar**

* `recipe_title`: Wajib, string yang berisi judul resep yang ingin dicari kemiripannya.
* `top_n`: Angka antara 1 hingga 100 *(optional)*.
  *(Default: 10 jika tidak diberikan)*
---

## 🔐 Autentikasi

Gunakan token JWT (Bearer Token) untuk endpoint yang dilindungi (`/recommend` dan `/similar`):

```http
Authorization: Bearer <token>
```

---

## 🛠 Contoh Implementasi di Frontend

```js
await fetch('/ml/recommend', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify({
    ingredients: ['telur', 'bawang'],
    top_n: 5
  })
});
```

## Teknologi yang Digunakan

* [@hapi/hapi](https://hapi.dev/) — Framework server Node.js
* [mongoose](https://mongoosejs.com/) — ODM MongoDB (kalau dipakai)
* [dotenv](https://github.com/motdotla/dotenv) — Manajemen konfigurasi environment variables
* [bcrypt](https://github.com/kelektiv/node.bcrypt.js/) — Hash password
* [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — Generate dan verifikasi JWT token
* [joi](https://joi.dev/) — Validasi schema input
* [mongodb](https://mongodb.github.io/node-mongodb-native/) — Driver MongoDB native
* [uuid](https://github.com/uuidjs/uuid) — Generate UUID unik
* [axios](https://github.com/axios/axios) — HTTP client untuk melakukan request API

---

## Lisensi

CC25-CF275 © 2025 – Made with ❤️ for learning and real-world projects.