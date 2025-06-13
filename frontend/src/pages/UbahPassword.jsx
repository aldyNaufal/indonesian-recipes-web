// src/pages/UbahPassword.jsx
import React, { useState } from "react";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import { useNavigate } from "react-router-dom";
import { apiPut } from "../utils/api";

export default function UbahPassword() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [baru, setBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");

  const isFormValid = current && baru.length >= 8 && baru === konfirmasi;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (baru !== konfirmasi) {
      showErrorAlert("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      const res = await apiPut("/profile/password", {
        currentPassword: current,
        newPassword: baru,
      }, token);

      if (!res.error) {
        showSuccessAlert("Password berhasil diubah.");
        navigate("/profile");
      } else {
        showErrorAlert(res.message);
      }
    } catch (e) {
      showErrorAlert("Gagal mengubah password.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900 px-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">Ubah Password</h1>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Password Saat Ini</label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Password Baru</label>
          <input
            type="password"
            value={baru}
            onChange={(e) => setBaru(e.target.value)}
            className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Konfirmasi Password Baru</label>
          <input
            type="password"
            value={konfirmasi}
            onChange={(e) => setKonfirmasi(e.target.value)}
            className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white"
            required
          />
          {baru && baru !== konfirmasi && (
            <p className="text-red-500 text-sm mt-1">Password tidak cocok</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full py-2 rounded-xl text-white ${
            isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Simpan Password
        </button>
      </form>
    </div>
  );
}
