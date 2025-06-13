import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "../utils/api";
import { showErrorAlert, showConfirmationAlert, showSuccessAlert } from "../utils/alerts";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState([]);

  useEffect(() => {
    if (!user) {
      // showErrorAlert("Silakan login terlebih dahulu.");
      setTimeout(() => navigate("/login"), 100);
      return;
    }

    const token = localStorage.getItem("token");
    apiGet("/bookmark", token).then((res) => {
      if (!res.error) {
        setSavedRecipes(res.data);
      }
    });
  }, [navigate, user]);

  const handleLogout = () => {
    showConfirmationAlert("Anda akan keluar dari akun. Lanjutkan?", () => {
      logout();
      showSuccessAlert("Anda telah keluar dari akun.");
      navigate("/login");
    });
  };

  if (!user) return null;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-6 py-10">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <img
            src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`}
            alt="profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
          />
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
          </div>
        </div>

        {/* Bookmark Info */}
        <div>
          <h3 className="text-lg font-semibold mb-2">🔖 Resep Tersimpan</h3>
          <ul className="list-disc ml-6 text-sm text-gray-600 dark:text-gray-300">
            {savedRecipes.slice(0, 3).map((recipe) => (
              <li key={recipe.id}>{recipe.title}</li>
            ))}
            <li>Total bookmark: {savedRecipes.length} resep</li>
          </ul>
          <Link to="/bookmark" className="text-blue-500 hover:underline text-sm mt-2 inline-block">
            ➡️ Lihat semua bookmark
          </Link>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-300 dark:border-gray-600 flex justify-between flex-wrap gap-4">
          <button onClick={() => navigate("/ubah-profil")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl">
            Ubah Profil
          </button>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl">
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
