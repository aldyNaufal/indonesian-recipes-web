import React, { useState } from "react";
import { showSuccessAlert, showErrorAlert, showLoadingAlert, hideLoadingAlert } from "../utils/alerts";
import { apiPost } from "../utils/httpClient";
import { useNavigate } from "react-router-dom";

// Import images - pastikan path sesuai dengan struktur project Anda
import bgImage from "../assets/bg-login.png"; // Sesuaikan dengan path gambar background
import leftImage from "../assets/regis.jpg"; // Sesuaikan dengan path gambar kiri

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  const isFormValid = name && email && password.length >= 8;
  
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    showLoadingAlert("Memproses pendaftaran...");
    
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
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white/90 backdrop-blur-md flex w-[90%] max-w-5xl rounded-xl shadow-2xl overflow-hidden">
        {/* Gambar kiri */}
        <div className="hidden lg:flex justify-center items-center w-1/2">
          <img src={leftImage} alt="Register" className="w-full h-full object-cover" />
        </div>

        {/* Form kanan */}
        <div className="bg-[#fdf4e3] w-full lg:w-1/2 p-8 flex items-center justify-center">
          <form onSubmit={handleRegister} className="w-full max-w-sm">
            <h1 className="text-2xl font-bold mb-6 text-center text-red-500">Daftar</h1>

            {/* Input Nama */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Nama</label>
              <input
                type="text"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded bg-white border border-black text-black shadow-sm"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Input Email */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded bg-white border border-black text-black shadow-sm"
                placeholder="Masukkan email"
              />
            </div>

            {/* Input Password */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded bg-white border border-black text-black shadow-sm"
                placeholder="Masukkan password"
              />
              {password && password.length < 8 && (
                <p className="text-red-500 text-sm mt-1">
                  Password minimal 8 karakter
                </p>
              )}
            </div>

            {/* Tombol Daftar */}
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-2 rounded-xl text-white ${
                isFormValid
                  ? "bg-[#E02929] hover:bg-[#B91C1C] transition-colors duration-300"
                  : "bg-[#B91C1C] cursor-not-allowed"
              }`}
            >
              Daftar
            </button>

            {/* Link ke login */}
            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-red-500 hover:text-red-700 font-medium underline"
                >
                  Masuk di sini
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

}