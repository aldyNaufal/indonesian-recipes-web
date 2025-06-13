import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiPost } from "../utils/api";
import {
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  hideLoadingAlert,
} from "../utils/alerts";

const CATEGORY_OPTIONS = [
  "ayam",
  "daging",
  "sapi",
  "ikan",
  "seafood",
  "tempe",
  "tahu",
  "telur",
  "sayur",
  "sup",
];
const METHOD_OPTIONS = [
  "Goreng",
  "Rebus",
  "Bakar",
  "Panggang",
  "Kukus",
  "Tumis",
];

export default function PreferencesPage() {
  const navigate = useNavigate();
  // --- [DIUBAH] --- Ambil fungsi markPreferencesAsSet
  const { token, user, markPreferencesAsSet } = useAuth();

  const [preferredCategories, setPreferredCategories] = useState([]);
  const [difficulty, setDifficulty] = useState("Mudah");
  const [maxIngredients, setMaxIngredients] = useState(10);
  const [maxSteps, setMaxSteps] = useState(8);
  const [cookingMethods, setCookingMethods] = useState([]);

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setPreferredCategories((prev) => [...prev, value]);
    } else {
      setPreferredCategories((prev) => prev.filter((cat) => cat !== value));
    }
  };

  const handleMethodChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setCookingMethods((prev) => [...prev, value]);
    } else {
      setCookingMethods((prev) => prev.filter((method) => method !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoadingAlert("Menyimpan preferensi...");

    const preferencesData = {
      preferred_categories: preferredCategories,
      difficulty_preference: difficulty,
      max_ingredients: maxIngredients,
      max_steps: maxSteps,
      cooking_methods: cookingMethods,
    };

    try {
      const response = await apiPost("/preferences", preferencesData, token);
      hideLoadingAlert();

      if (response.error) {
        showErrorAlert(response.message || "Gagal menyimpan preferensi.");
      } else {
        markPreferencesAsSet();

        showSuccessAlert(
          "Preferensi berhasil disimpan! Menampilkan resep untukmu..."
        );

        navigate("/");
      }
    } catch (error) {
      hideLoadingAlert();
      showErrorAlert("Terjadi kesalahan pada server. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-center">
          Selamat Datang, {user?.name}!
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Bantu kami mengenal seleramu agar kami bisa memberikan rekomendasi
          resep terbaik.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kategori Favorit */}
          <div>
            <label className="block font-semibold mb-2">
              Apa kategori bahan favoritmu?
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {CATEGORY_OPTIONS.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={category}
                    onChange={handleCategoryChange}
                    className="form-checkbox"
                  />
                  <span className="capitalize">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tingkat Kesulitan */}
          <div>
            <label htmlFor="difficulty" className="block font-semibold mb-2">
              Pilih tingkat kesulitan:
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-500"
            >
              <option value="Cepat & Mudah">Cepat & Mudah</option>
              <option value="Mudah">Mudah</option>
              <option value="Sedang">Sedang</option>
              <option value="Sulit">Sulit</option>
              <option value="Sangat Sulit">Sangat Sulit</option>
            </select>
          </div>

          {/* Slider */}
          <div>
            <label
              htmlFor="maxIngredients"
              className="block font-semibold mb-2"
            >
              Maksimum jumlah bahan: <strong>{maxIngredients}</strong>
            </label>
            <input
              id="maxIngredients"
              type="range"
              min="3"
              max="20"
              value={maxIngredients}
              onChange={(e) => setMaxIngredients(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="maxSteps" className="block font-semibold mb-2">
              Maksimum jumlah langkah: <strong>{maxSteps}</strong>
            </label>
            <input
              id="maxSteps"
              type="range"
              min="3"
              max="15"
              value={maxSteps}
              onChange={(e) => setMaxSteps(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          {/* Metode Masak */}
          <div>
            <label className="block font-semibold mb-2">
              Metode masak yang disukai (opsional):
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {METHOD_OPTIONS.map((method) => (
                <label
                  key={method}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={method}
                    onChange={handleMethodChange}
                    className="form-checkbox"
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Simpan Preferensi & Lihat Resep
          </button>
        </form>
      </div>
    </div>
  );
}
