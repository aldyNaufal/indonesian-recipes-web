import React, { useState } from "react";
import bgImage from "../assets/bg-login.png";
import leftImage from "../assets/login (1).jpg";
import { apiPost } from "../utils/httpClient";
import {
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  hideLoadingAlert,
} from "../utils/alerts";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const isFormValid = email && password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    showLoadingAlert("Memproses login...");
    try {
      const res = await apiPost("/login", { email, password });
      if (res.error) {
        showErrorAlert(res.message || "Login gagal");
      } else {
        showSuccessAlert("Login berhasil!");
        login(res.loginResult, res.loginResult.token);
      }
    } catch (err) {
      showErrorAlert("Terjadi kesalahan saat login", err.message || "Silakan coba lagi.");
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
        <img src={leftImage} alt="Left" className="w-full h-full object-cover" />
      </div>

      {/* Form kanan */}
      <div className="bg-[#fdf4e3] w-full lg:w-1/2 p-8 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-center text-red-500">Login</h1>

          {/* Input Email */}
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white border border-black text-black shadow-sm"
            />
          </div>

          {/* Input Password */}
          <div className="mb-2">
            <label className="block mb-1 text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white border border-black text-black shadow-sm"
            />
            {password && password.length < 8 && (
              <p className="text-red-500 text-sm mt-1">
                Password minimal 8 karakter
              </p>
            )}
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 rounded-xl text-white mt-5 mb-3 ${
              isFormValid
                ? "bg-[#E02929] hover:bg-[#B91C1C] transition-colors duration-300"
                : "bg-[#B91C1C] cursor-not-allowed"
            }`}
          >
            Login
          </button>


          {/* Link Sign Up */}
          <div className="text-sm text-gray-600 mt-2 mb-4 text-center">
            Belum punya akun?{" "}
            <a href="/register" className="text-red-500 hover:underline font-medium">
              Sign Up di sini
            </a>
          </div>


        </form>
      </div>
    </div>
  </div>
);

}
