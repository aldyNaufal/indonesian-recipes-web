import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PasswordFormBase({
  title,
  subtitle,
  showEmailField = false,
  emailValue = "",
  isEmailDisabled = false,
  onEmailChange,
  onSubmit,
  submitButtonText,
  isSubmitting = false
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  const passwordsMatch = password === confirmPassword;
  const isFormValid = 
    (!showEmailField || emailValue) && 
    password.length >= 8 && 
    confirmPassword && 
    passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    
    await onSubmit({
      email: emailValue,
      password,
      confirmPassword
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative bg-white">
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-orange-900/20"></div>
      
      <div className="relative z-10 bg-white/95 backdrop-blur-lg w-[90%] max-w-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
          <div className="mb-2">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C10.9 7 10 7.9 10 9V10C9.4 10 9 10.4 9 11V16C9 16.6 9.4 17 10 17H14C14.6 17 15 16.6 15 16V11C15 10.4 14.6 10 14 10V9C14 7.9 13.1 7 12 7ZM12 8C12.6 8 13 8.4 13 9V10H11V9C11 8.4 11.4 8 12 8Z" fill="white"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-red-100 text-sm mt-1">{subtitle}</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Email - Conditionally rendered */}
            {showEmailField && (
              <div>
                <label className="block mb-2 text-gray-700 font-medium">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={emailValue}
                    required
                    disabled={isEmailDisabled}
                    onChange={onEmailChange}
                    className={`w-full px-4 py-3 pl-12 rounded-lg border-2 transition-all duration-200 ${
                      isEmailDisabled 
                        ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed" 
                        : "bg-white border-gray-300 text-black focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    }`}
                    placeholder="Masukkan email Anda"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {isEmailDisabled && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="16" r="1" fill="currentColor"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Input Password */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Password Baru</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-12 rounded-lg border-2 border-gray-300 bg-white text-black focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200"
                  placeholder="Masukkan password baru"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Password minimal 8 karakter
                </p>
              )}
            </div>
            
            {/* Input Confirm Password */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-12 rounded-lg border-2 border-gray-300 bg-white text-black focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200"
                  placeholder="Konfirmasi password baru"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
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
              {confirmPassword && !passwordsMatch && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Password tidak cocok
                </p>
              )}
              {confirmPassword && passwordsMatch && password.length >= 8 && (
                <p className="text-green-500 text-sm mt-1 flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="9,12 12,15 18,9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Password cocok
                </p>
              )}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 transform ${
                isFormValid && !isSubmitting
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Memproses..." : submitButtonText}
            </button>
            
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                isSubmitting 
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-gray-600 bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Kembali
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}