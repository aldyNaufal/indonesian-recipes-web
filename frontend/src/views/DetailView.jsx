import React from "react";
import { Link } from "react-router-dom";

export default function DetailView({ presenter }) {
  const {
    recipe,
    saved,
    handleSave,
    handlePrint,
    handleTutorial,
    handleExportPDF,
  } = presenter;

  if (!recipe) {
    return (
      <p className="p-8 text-center text-red-600">Resep tidak ditemukan.</p>
    );
  }

  return (
    <div
      id="recipe-detail"
      className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-xl dark:bg-gray-600"
    >
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-2 print-container transition-colors duration-300">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transition-colors duration-300">
          <h1 className="text-2xl font-bold mb-4">{recipe.Title}</h1>
          {recipe.Image && (
            <img
              src={recipe.Image}
              alt={recipe.Title}
              className="rounded-xl w-full mb-4 object-cover max-h-96"
            />
          )}
          <p className="mb-2">
            <strong>Bahan:</strong>
          </p>
          <p className="whitespace-pre-line mb-4 text-sm">
            {recipe["Ingredients Cleaned"]}
          </p>

          <p className="mb-2">
            <strong>Langkah-langkah:</strong>
          </p>
          <p className="whitespace-pre-line mb-4 text-sm">{recipe.Steps}</p>

          <div className="flex gap-3 flex-wrap mt-6 no-print">
            <button
              className={`px-4 py-2 rounded-xl ${
                saved ? "bg-green-600" : "bg-blue-600"
              } text-white hover:opacity-90`}
              onClick={handleSave}
              disabled={saved}
            >
              {saved ? "Resep Disimpan" : "Simpan Resep"}
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-orange-500 text-white hover:opacity-90"
              onClick={handlePrint}
            >
              Cetak Resep
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:opacity-90"
              onClick={handleTutorial}
            >
              Lihat Tutorial YouTube
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:opacity-90"
              onClick={handleExportPDF}
            >
              {" "}
              Simpan ke PDF
            </button>

            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-gray-600 text-white hover:opacity-90"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
