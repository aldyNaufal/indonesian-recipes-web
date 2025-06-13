import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccessAlert, showErrorAlert } from "../utils/alerts";
import { apiPut } from "../utils/api";
// import toBase64  from "../utils/file";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [name, setName] = useState(user?.name || "");
  const [photo, setPhoto] = useState(user?.photo || "");

  useEffect(() => {
    if (!user) {
      showErrorAlert("Anda harus login terlebih dahulu.");
      navigate("/login");
    }
  }, [user, navigate]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await toBase64(file);
      setPhoto(base64);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await apiPut("/profile", { name, photo }, token);
      if (!res.error) {
        localStorage.setItem("user", JSON.stringify(res.user));
        showSuccessAlert("Profil berhasil diperbarui!");
        navigate("/profile");
      } else {
        showErrorAlert(res.message || "Gagal memperbarui profil");
      }
    } catch {
      showErrorAlert("Terjadi kesalahan saat memperbarui profil");
    }
  };

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-10">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Ubah Profil</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Nama
            </label>
            <input
              type="text"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Foto Profil
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full text-sm text-gray-500"
            />
          </div>

          {photo && (
            <div className="text-center">
              <img
                src={photo}
                alt="Preview"
                className="w-20 h-20 rounded-full mx-auto mt-4 border border-blue-500 object-cover"
              />
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
