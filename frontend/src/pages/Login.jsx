import React, { useState } from "react";
import { apiPost } from "../utils/api";
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
      showErrorAlert(
        "Terjadi kesalahan saat login",
        err.message || "Silakan coba lagi."
      );
    } finally {
      hideLoadingAlert();
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Masuk
        </h1>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white"
          />
          {password && password.length < 8 && (
            <p className="text-red-500 text-sm mt-1">
              Password minimal 8 karakter
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full py-2 rounded-xl text-white ${
            isFormValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Masuk
        </button>
      </form>
    </div>
  );
}
