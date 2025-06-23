import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, token, loading, isAuthenticated } = useAuth();
  const location = useLocation();

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

  // Enhanced debug logging
  console.log('ProtectedRoute check:', { 
    hasUser: !!user, 
    hasToken: !!token, 
    tokenValid: token && token !== 'null' && token !== 'undefined',
    isAuthenticated,
    loading,
    currentPath: location.pathname
  });

  // Improved authentication check
  const hasValidToken = token && token !== 'null' && token !== 'undefined';
  const hasValidUser = user && typeof user === 'object';
  
  if (!hasValidToken || !hasValidUser || !isAuthenticated) {
    console.log('ProtectedRoute: Redirecting to login', {
      reason: {
        noValidToken: !hasValidToken,
        noValidUser: !hasValidUser,
        notAuthenticated: !isAuthenticated
      }
    });
    
    // Simpan lokasi sebelumnya untuk redirect setelah login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jika semua pengecekan passed, tampilkan children
  console.log('ProtectedRoute: Access granted');
  return children;
};

export default ProtectedRoute;