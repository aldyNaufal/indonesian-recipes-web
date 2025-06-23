import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccessAlert, showErrorAlert, showLoadingAlert, hideLoadingAlert } from "../../utils/alerts";
import { apiPost } from "../../utils/httpClient";
import { useAuth } from "../../context/AuthContext";
import PasswordFormBase from "../../components/auth/PasswordForm";

export default function ChangePassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Untuk change password, harus ada user yang login
    if (!user?.email) {
      showErrorAlert("Anda harus login terlebih dahulu");
      navigate("/login");
      return;
    }
    
    // Auto-fill email dari user yang login
    setEmail(user.email);
  }, [user, navigate]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    showLoadingAlert("Mengubah password...");

    try {
      console.log("Change Password - Endpoint: api/change-password");
      console.log("Change Password - Request Data:", {
        newPassword: formData.password
      });

      const res = await apiPost("api/change-password", {
        newPassword: formData.password
      });
      
      if (res.error) {
        showErrorAlert(res.message || "Gagal mengubah password");
      } else {
        showSuccessAlert("Password berhasil diubah!");
        
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      }
    } catch (err) {
      console.error('Change password error:', err);
      showErrorAlert("Terjadi kesalahan", err.message || "Silakan coba lagi.");
    } finally {
      hideLoadingAlert();
      setIsSubmitting(false);
    }
  };

  // Jika user belum login, jangan render form
  if (!user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h1>
          <p className="text-gray-600 mb-4">Anda harus login terlebih dahulu untuk mengubah password</p>
          <button 
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <PasswordFormBase
      title="Ubah Password"
      subtitle="Masukkan password baru untuk akun Anda"
      showEmailField={true}
      emailValue={email}
      isEmailDisabled={true}
      onEmailChange={() => {}} // Email tidak bisa diubah
      onSubmit={handleSubmit}
      submitButtonText="Ubah Password"
      isSubmitting={isSubmitting}
    />
  );
}