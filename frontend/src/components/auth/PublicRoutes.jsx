// components/common/PublicRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Tampilkan loading state saat sedang mengecek autentikasi
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Jika user sudah login, redirect ke dashboard/home
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Jika belum login, tampilkan halaman public (login/register)
  return children;
};

export default PublicRoute;