import React, { useState } from "react";
import { showSuccessAlert, showErrorAlert, showLoadingAlert, hideLoadingAlert } from "../../utils/alerts";
import { apiPost } from "../../utils/httpClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// Import images - pastikan path sesuai dengan struktur project Anda
import bgImage from "../../assets/bg-login.png"; // Sesuaikan dengan path gambar background
import leftImage from "../../assets/regis.jpg"; // Sesuaikan dengan path gambar kiri

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // State untuk confirm password
  const [showPassword, setShowPassword] = useState(false); // State untuk toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State untuk toggle confirm password visibility
  const { login } = useAuth(); // Import login dari AuthContext
  const navigate = useNavigate();
  
  // Validasi form termasuk pengecekan password match
  const passwordsMatch = password === confirmPassword;
  const isFormValid = name && email && password.length >= 8 && confirmPassword && passwordsMatch;
  
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    showLoadingAlert("Memproses pendaftaran...");
    
    try {
      const res = await apiPost("api/register", { name, email, password });

      console.log('Register API Response:', res); // Debug log
  
      if (res.error) {
        showErrorAlert(res.message || "Gagal daftar");
        return;
      }

      // Extract user data dan token dari response - mirip seperti login
      const userData = res.loginResult || res.user || res.data;
      const userToken = res.loginResult?.token || res.token;

      console.log('Extracted register data:', { userData, userToken }); // Debug log

      // Jika API register mengembalikan token dan user data (auto-login)
      if (userData && userToken) {
        // Login otomatis setelah registrasi berhasil
        await login(userData, userToken);
        
        showSuccessAlert("Akun berhasil dibuat! Anda sudah login otomatis.");
        
        // Redirect ke form page dengan delay
        setTimeout(() => {
          navigate("/form", { replace: true });
        }, 1000);
      } else {
        // Jika API register tidak mengembalikan token (perlu login manual)
        console.warn('Register successful but no token returned, redirecting to login');
        showSuccessAlert("Akun berhasil dibuat! Silakan login untuk melanjutkan.");
        
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1000);
      }
    } catch (err) {
      console.error('Register error:', err);
      showErrorAlert("Terjadi kesalahan saat mendaftar", err.message || "Silakan coba lagi.");
    } finally {
      hideLoadingAlert();
    }
  };

  // Function untuk toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Function untuk toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-12 rounded bg-white border border-black text-black shadow-sm"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {showPassword ? (
                    // Icon mata tertutup (hide password)
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    // Icon mata terbuka (show password)
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
            </div>

            {/* Input Confirm Password */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-12 rounded bg-white border border-black text-black shadow-sm"
                  placeholder="Konfirmasi password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {showConfirmPassword ? (
                    // Icon mata tertutup (hide password)
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    // Icon mata terbuka (show password)
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.45703 12C3.73128 7.94291 7.52159 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C20.2672 16.0571 16.4769 19 11.9992 19C7.52159 19 3.73128 16.0571 2.45703 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.999 15C13.6559 15 14.999 13.6569 14.999 12C14.999 10.3431 13.6559 9 11.999 9C10.3422 9 8.99902 10.3431 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Pesan error jika password tidak cocok */}
              {confirmPassword && !passwordsMatch && (
                <p className="text-red-500 text-sm mt-1">
                  Password tidak cocok
                </p>
              )}
              
              {/* Pesan sukses jika password cocok */}
              {confirmPassword && passwordsMatch && password.length >= 8 && (
                <p className="text-green-500 text-sm mt-1">
                  Password cocok
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