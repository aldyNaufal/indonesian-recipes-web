import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { showSuccessAlert, showErrorAlert, showLoadingAlert, hideLoadingAlert } from "../../utils/alerts";
import { apiPost } from "../../utils/httpClient";
import PasswordFormBase from "../../components/auth/PasswordForm";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Pre-fill email jika diteruskan dari halaman lain
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    showLoadingAlert("Memproses reset password...");

    try {
      console.log("Forgot Password - Endpoint: api/forgot-password");
      console.log("Forgot Password - Request Data:", {
        email: formData.email,
        newPassword: formData.password
      });

      const res = await apiPost("api/forgot-password", {
        email: formData.email,
        newPassword: formData.password
      });
      
      if (res.error) {
        showErrorAlert(res.message || "Gagal mereset password");
      } else {
        showSuccessAlert("Password berhasil direset!");
        
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      showErrorAlert("Terjadi kesalahan", err.message || "Silakan coba lagi.");
    } finally {
      hideLoadingAlert();
      setIsSubmitting(false);
    }
  };

  return (
    <PasswordFormBase
      title="Reset Password"
      subtitle="Masukkan email dan password baru Anda"
      showEmailField={true}
      emailValue={email}
      isEmailDisabled={false}
      onEmailChange={handleEmailChange}
      onSubmit={handleSubmit}
      submitButtonText="Reset Password"
      isSubmitting={isSubmitting}
    />
  );
}