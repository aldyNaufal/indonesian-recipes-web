import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/bg-login.png";
import leftImage from "../../assets/login (1).jpg";
import { apiPost } from "../../utils/httpClient";
import {
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  hideLoadingAlert,
} from "../../utils/alerts";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const isFormValid = email && password.length >= 8;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    showLoadingAlert("Memproses login...");
    
    try {
      const res = await apiPost("api/login", { email, password });
      
      console.log('Login API Response:', res); // Debug log
      
      if (res.error) {
        showErrorAlert(res.message || "Login gagal");
        return;
      }
      
      // Pastikan response memiliki data yang diperlukan
      const userData = res.loginResult || res.user || res.data;
      const userToken = res.loginResult?.token || res.token;
      
      console.log('Extracted data:', { userData, userToken }); // Debug log
      
      if (!userData || !userToken) {
        console.error('Missing user data or token in response:', res);
        showErrorAlert("Response tidak lengkap dari server");
        return;
      }
      
      // Login ke context
      await login(userData, userToken);
      
      // Tampilkan success message
      showSuccessAlert("Login berhasil!");
      
      // Redirect dengan delay lebih pendek
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
      
    } catch (err) {
      console.error('Login error:', err);
      showErrorAlert("Terjadi kesalahan saat login", err.message || "Silakan coba lagi.");
    } finally {
      hideLoadingAlert();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-12 rounded bg-white border border-black text-black shadow-sm"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.45703 12C3.73128 7.94291 7.52159 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C20.2672 16.0571 16.4769 19 11.9992 19C7.52159 19 3.73128 16.0571 2.45703 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.999 15C13.6559 15 14.999 13.6569 14.999 12C14.999 10.3431 13.6559 9 11.999 9C10.3422 9 8.99902 10.3431 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
              {password && password.length < 8 && (
                <p className="text-red-500 text-sm mt-1">
                  Password minimal 8 karakter
                </p>
              )}
              
              <div className="text-right mt-2">
                <a 
                  href="/forgot-password" 
                  className="text-sm text-red-500 hover:underline font-medium"
                >
                  Lupa Password?
                </a>
              </div>
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