import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, User, Bookmark, Heart, Clock, MapPin, Upload, X, RefreshCw } from "lucide-react";
import { apiGet, apiPost } from "../../utils/httpClient";
import { showErrorAlert, showConfirmationAlert, showSuccessAlert } from "../../utils/alerts";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth();
  
  // User profile state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [userStats, setUserStats] = useState({
    totalBookmarks: 0,
    totalLikes: 0,
    joinDate: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef(null);

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem("token");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await apiGet("api/profile", token);
      
      if (!response.error) {
        setUser(response.user);
        // Update auth context with fresh user data
        updateUser(response.user);
      } else {
        throw new Error(response.message || "Failed to fetch profile");
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error.message);
      
      // If token is invalid, redirect to login
      if (error.message.includes("token") || error.message.includes("unauthorized")) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial profile fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  // Load bookmarked recipes after user data is available
  useEffect(() => {
    const loadBookmarkedRecipes = async () => {
      if (!user || !isAuthenticated) return;
      
      setLoadingRecipes(true);
      try {
        const token = localStorage.getItem("token");
        const res = await apiGet("api/bookmark", token);
        
        if (!res.error) {
          setSavedRecipes(res.data);
          setUserStats(prev => ({
            ...prev,
            totalBookmarks: res.data.length
          }));
        }
      } catch (error) {
        console.error('Error loading bookmarked recipes:', error);
      } finally {
        setLoadingRecipes(false);
      }
    };

    loadBookmarkedRecipes();
  }, [user, isAuthenticated]);

  // Function to refresh user data
  const handleRefreshUserData = async () => {
    setIsRefreshing(true);
    try {
      await fetchUserProfile();
      showSuccessAlert("Data profil berhasil disegarkan!");
    } catch (error) {
      showErrorAlert("Gagal memuat data terbaru");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    showConfirmationAlert("Anda akan keluar dari akun. Lanjutkan?", () => {
      logout();
      localStorage.removeItem("token");
      setUser(null);
      showSuccessAlert("Anda telah keluar dari akun.");
      navigate("/login");
    });
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleUpdateProfile = () => {
    navigate("/ubah-profil");
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showErrorAlert("Harap pilih file gambar yang valid (JPG, PNG, GIF)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorAlert("Ukuran file terlalu besar. Maksimal 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload immediately
      uploadProfilePhoto(file);
    }
  };

  // Upload profile photo
  const uploadProfilePhoto = async (file) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const token = localStorage.getItem("token");
      
      const response = await apiPost("api/user/upload-photo", formData, token, {
        'Content-Type': 'multipart/form-data'
      });

      if (!response.error) {
        // Update user state with new photo
        const updatedUser = { ...user, photo: response.data.photoUrl };
        setUser(updatedUser);
        updateUser(updatedUser);
        showSuccessAlert("Foto profil berhasil diperbarui!");
        setPreviewImage(null);
      } else {
        showErrorAlert(response.message || "Gagal mengunggah foto");
        setPreviewImage(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      showErrorAlert("Terjadi kesalahan saat mengunggah foto");
      setPreviewImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Cancel preview
  const cancelPreview = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Loading state when fetching user profile
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  // Error state or user not found after loading
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {error ? `Error: ${error}` : "Gagal memuat profil"}
          </p>
          <div className="space-x-4">
            <button 
              onClick={handleRefreshUserData}
              disabled={isRefreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isRefreshing ? "Memuat..." : "Coba Lagi"}
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header dengan refresh button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profil Pengguna</h1>
          <button
            onClick={handleRefreshUserData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Memuat...' : 'Segarkan'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Profile Picture & Stats */}
          <div className="space-y-6">
            {/* Profile Picture Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center mx-auto overflow-hidden border-4 border-gray-100">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : user.photo ? (
                      <img
                        src={user.photo}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-500" />
                    )}
                    
                    {/* Loading overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex justify-center gap-2 mt-4">
                    <button 
                      onClick={handleUpdateProfile}
                      className="bg-gradient-to-b from-[#B91C1C] to-[#E02929] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-lg"
                    >
                      <User className="w-4 h-4" />
                      Edit Profil
                    </button>

                     <button 
                      onClick={handleChangePassword}
                      className="bg-orange-600  text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-lg"
                    >
                      🔐 Ubah Kata Sandi
                    </button>
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.name || "Nama Pengguna"}
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Member sejak {user.createdAt ? new Date(user.createdAt).getFullYear() : "2024"}
                </p>

                {/* Upload instructions */}
                <div className="bg-blue-50 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-red-400 mb-2">📋 Info Upload Foto:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Format: JPG, PNG, GIF</li>
                    <li>• Ukuran maksimal: 5MB</li>
                    <li>• Rekomendasi: 500x500px</li>
                    <li>• Foto akan langsung tersimpan</li>
                  </ul>
                </div>

                 {/* Delete Account */}
                <div className="pt-4 border-t">
                  <button 
                    onClick={handleLogout}
                    className="text-red-500 text-sm font-medium hover:underline"
                  >
                    Keluar dari Akun
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Anda akan keluar dari sesi saat ini
                  </p>
                </div>
              </div>
            </div>

            {/* User Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                📊 Statistik Aktivitas
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Bookmark className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {loadingRecipes ? "..." : userStats.totalBookmarks}
                  </div>
                  <div className="text-sm text-gray-600">Resep Tersimpan</div>
                </div>
                
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {userStats.totalLikes}
                  </div>
                  <div className="text-sm text-gray-600">Resep Disukai</div>
                </div>
              </div>

              {/* Recent Bookmarks Preview */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Bookmark Terbaru</h4>
                <div className="space-y-2">
                  {loadingRecipes ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <>
                      {savedRecipes.slice(0, 3).map((recipe, index) => (
                        <div key={`bookmark-${recipe.id || index}`} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span className="text-sm text-gray-700 truncate">
                            {recipe.title}
                          </span>
                        </div>
                      ))}
                      
                      {savedRecipes.length === 0 && (
                        <p className="text-sm text-gray-500 italic">Belum ada resep yang disimpan</p>
                      )}
                    </>
                  )}
                </div>
                
                <Link 
                  to="/bookmark" 
                  className="text-blue-600 hover:underline text-sm mt-3 inline-block font-medium"
                >
                  ➡️ Lihat semua bookmark ({savedRecipes.length})
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - User Information & Actions */}
          <div className="space-y-6">
            {/* User Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 relative">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                👤 Informasi Pengguna
              </h3>
              
              {/* Loading overlay untuk user info */}
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-2xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <span className="text-gray-900">
                      {user.name || "Belum diatur"}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Email
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <span className="text-gray-900">
                      {user.email || "Belum diatur"}
                    </span>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <span className="text-gray-900">
                      {user.phone || "Belum diatur"}
                    </span>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kelamin
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <span className="text-gray-900">
                      {user.gender === 'male' ? 'Laki-laki' : 
                       user.gender === 'female' ? 'Perempuan' : 
                       user.gender === 'other' ? 'Lainnya' : 
                       "Belum diatur"}
                    </span>
                  </div>
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lahir
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <span className="text-gray-900">
                      {user.birthDate ? new Date(user.birthDate).toLocaleDateString('id-ID') : "Belum diatur"}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">
                      {user.location || "Belum diatur"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}