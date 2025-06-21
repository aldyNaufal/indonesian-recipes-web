import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  showLoadingAlert,
  hideLoadingAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../utils/alerts";
import { apiPost } from "../../utils/httpClient";
import { useAuth } from "../../hooks/useAuth";

const CATEGORY_OPTIONS = [
  { key: "ayam", label: "🐔 Ayam" },
  { key: "sapi", label: "🐄 Sapi" },
  { key: "ikan", label: "🐟 Ikan" },
  { key: "udang", label: "🦐 Udang" },
  { key: "tempe", label: "🟤 Tempe" },
  { key: "tahu", label: "🟨 Tahu" },
  { key: "telur", label: "🥚 Telur" },
  { key: "kambing", label: "🐐 Kambing" },
];

const TIME_OPTIONS = [
  { key: "Pagi", label: "🌅 Pagi" },
  { key: "Siang", label: "🌞 Siang" },
  { key: "Malam", label: "🌙 Malam" },
];

const AVOID_OPTIONS = [
  { key: "Daging", label: "🥩 Daging" },
  { key: "Telur", label: "🥚 Telur" },
  { key: "Seafood", label: "🦞 Seafood" },
  { key: "Susu", label: "🥛 Susu" },
  { key: "Kacang", label: "🥜 Kacang" },
];

const TASTE_OPTIONS = [
  { key: "Gurih", label: "🍜 Gurih" },
  { key: "Manis", label: "🍬 Manis" },
  { key: "Pedas", label: "🌶️ Pedas" },
  { key: "Asam", label: "🍋 Asam" },
];

const SKILL_OPTIONS = [
  { key: "Cepat & Mudah", label: "👶 Cukup Bisa" },
  { key: "Butuh Usaha", label: "🧑‍🍳 Lumayan Bisa" },
  { key: "Level Dewa Masak", label: "🔥 Dewa Masak" },
];

export default function PreferencesPage() {
  const navigate = useNavigate();
  const { token, user, markPreferencesAsSet } = useAuth();

  const [preferredCategories, setPreferredCategories] = useState([]);
  const [cookPeriod, setCookPeriod] = useState("");
  const [avoidIngredients, setAvoidIngredients] = useState([]);
  const [cookTime, setCookTime] = useState(30);
  const [tastePreference, setTastePreference] = useState("");
  const [cookingSkillLevel, setCookingSkillLevel] = useState("");

  const handleCheckbox = (value, setter, current) => {
    setter(current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoadingAlert("Menyimpan preferensi...");

    const preferencesData = {
      preferred_categories: preferredCategories,
      cook_period: cookPeriod,
      avoid_ingredients: avoidIngredients,
      cooking_duration: cookTime,
      taste_preference: tastePreference,
      cooking_skill_level: cookingSkillLevel,
    };

    try {
      const response = await apiPost("/preferences", preferencesData, token);
      hideLoadingAlert();

      if (response.error) {
        showErrorAlert(response.message || "Gagal menyimpan preferensi.");
      } else {
        markPreferencesAsSet();
        showSuccessAlert("Preferensi berhasil disimpan! Menampilkan resep untukmu...");
        navigate("/");
      }
    } catch (error) {
      hideLoadingAlert();
      showErrorAlert("Terjadi kesalahan pada server. Silakan coba lagi.");
    }
  };

  const totalSteps = 6;
  const answeredSteps = [preferredCategories.length, cookPeriod, avoidIngredients.length, tastePreference, cookingSkillLevel, cookTime].filter(Boolean).length;
  const progressPercent = (answeredSteps / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-10 text-gray-900 dark:text-white">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-center">
          Selamat Datang, {user?.name}!
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Bantu kami mengenal seleramu agar kami bisa memberikan rekomendasi resep terbaik.
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Kategori Bahan */}
          <div>
            <label className="block font-semibold mb-2">🍗 Apa kategori bahan favoritmu?</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {CATEGORY_OPTIONS.map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    value={key}
                    onChange={() => handleCheckbox(key, setPreferredCategories, preferredCategories)}
                    checked={preferredCategories.includes(key)}
                    className="form-checkbox"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Waktu Masak */}
          <div>
            <label className="block font-semibold mb-2">🍽️ Kapan kamu paling sering memasak?</label>
            <div className="flex gap-4">
              {TIME_OPTIONS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cookPeriod"
                    value={key}
                    checked={cookPeriod === key}
                    onChange={(e) => setCookPeriod(e.target.value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pantangan Bahan */}
          <div>
            <label className="block font-semibold mb-2">🧂 Apakah kamu punya pantangan bahan?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVOID_OPTIONS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={key}
                    onChange={() => handleCheckbox(key, setAvoidIngredients, avoidIngredients)}
                    checked={avoidIngredients.includes(key)}
                    className="form-checkbox"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Durasi Masak */}
          <div>
            <label htmlFor="cookTime" className="block font-semibold mb-2">
              ⏱️ Berapa lama waktu ideal memasak bagimu? <strong>{cookTime} menit</strong>
            </label>
            <input
              id="cookTime"
              type="range"
              min="5"
              max="60"
              step="5"
              value={cookTime}
              onChange={(e) => setCookTime(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Preferensi Rasa */}
          <div>
            <label className="block font-semibold mb-2">🥗 Apa kamu lebih suka makanan...?</label>
            <div className="flex gap-4">
              {TASTE_OPTIONS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tastePreference"
                    value={key}
                    checked={tastePreference === key}
                    onChange={(e) => setTastePreference(e.target.value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skill Level */}
          <div>
            <label className="block font-semibold mb-2">👨‍🍳 Seberapa jago kamu memasak?</label>
            <div className="flex flex-col gap-2">
              {SKILL_OPTIONS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cookingSkillLevel"
                    value={key}
                    checked={cookingSkillLevel === key}
                    onChange={(e) => setCookingSkillLevel(e.target.value)}
                  />
                  <span>{label}</span>
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
