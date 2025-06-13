import React, { useState } from "react";
import { showSuccessAlert, showErrorAlert, showLoadingAlert, hideLoadingAlert } from "../utils/alerts";
import { apiPost } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const isFormValid = name && email && password.length >= 8;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    showLoadingAlert("Memproses login...");
    try {
      const res = await apiPost("/register", { name, email, password });
  
      if (res.error) {
        showErrorAlert(res.message || "Gagal daftar");
      } else {
        showSuccessAlert("Akun berhasil dibuat!");
        navigate("/login"); // redirect ke login
      }
    } catch (err) {
      showErrorAlert("Terjadi kesalahan saat mendaftar", err.message || "Silakan coba lagi.");
    } finally {
      hideLoadingAlert();
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <form onSubmit={handleRegister} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Daftar</h1>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Nama</label>
          <input type="text" value={name} required onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white" />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Email</label>
          <input type="email" value={email} required onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white" />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Password</label>
          <input type="password" value={password} required onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white" />
          {password && password.length < 8 && <p className="text-red-500 text-sm mt-1">Password minimal 8 karakter</p>}
        </div>

        <button type="submit" disabled={!isFormValid} className={`w-full py-2 rounded-xl text-white ${isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}>
          Daftar
        </button>
      </form>
    </div>
  );
}
