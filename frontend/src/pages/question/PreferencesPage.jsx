import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showSuccessAlert, showErrorAlert, showLoadingAlert, hideLoadingAlert } from '../../utils/alerts';
import { apiPost } from '../../utils/httpClient';
import { useNavigate } from 'react-router-dom';

const FoodPreferenceOnboarding = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState({
    preferred_categories: [],
    skill_level: '',
    cooking_methods: [],
    avoid_ingredients: [],
    preferred_taste: [],
    preferred_time: ''
  });

  // Ambil data user dari AuthContext
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect jika user belum login
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const pages = [
    {
      id: 'lauk-andalan',
      title: `Hai ${user?.name || 'Chef'}! Kenalan dulu yuk 👋`,
      description: "Pas lagi mager tapi pengen makan enak, lauk apa yang paling gampang dan pasti enak?",
      field: 'preferred_categories',
      type: 'multiple',
      options: [
        { value: 'Ayam', label: '🐔 Ayam', desc: 'Gampang dimasak, rasanya pasti' },
        { value: 'Sapi', label: '🐄 Sapi', desc: 'Mewah sesekali boleh lah' },
        { value: 'Ikan', label: '🐟 Ikan', desc: 'Sehat dan gak ribet' },
        { value: 'Udang', label: '🦐 Udang', desc: 'Fancy tapi worth it' },
        { value: 'Tempe', label: '🟤 Tempe', desc: 'Murah meriah, bergizi' },
        { value: 'Tahu', label: '🟨 Tahu', desc: 'Bisa jadi apa aja' },
        { value: 'Telur', label: '🥚 Telur', desc: 'Never fail, always there' },
        { value: 'Kambing', label: '🐐 Kambing', desc: 'Sesekali pengen yang beda' }
      ]
    },
    {
      id: 'golden-hour',
      title: "Kapan mood masak kamu paling on fire? 🔥",
      description: "Entah karena santai atau emang lagi semangat, pilih waktu yang paling comfortable buat masak",
      field: 'preferred_time',
      type: 'single',
      options: [
        { value: 'Pagi', label: '🌅 Pagi (06:00-10:00)', desc: 'Fresh start, semangat pagi' },
        { value: 'Siang', label: '☀️ Siang (10:00-14:00)', desc: 'Pas break, masak santai' },
        { value: 'Sore', label: '🌇 Sore (14:00-18:00)', desc: 'Siap-siap dinner time' },
        { value: 'Malam', label: '🌙 Malam (18:00-22:00)', desc: 'Me time setelah aktivitas' }
      ]
    },
    {
      id: 'skill-level',
      title: "Seberapa jagoan kamu di dapur? 👨‍🍳",
      description: "Gak ada yang malu-maluin. Kita kasih resep yang sesuai skill level kamu sekarang",
      field: 'skill_level',
      type: 'single',
      options: [
        { value: 'Cepat & Mudah', label: '👶 Masih Belajar', desc: 'Indomie level, simple aja' },
        { value: 'Butuh Usaha', label: '🧑‍🍳 Lumayan Bisa', desc: 'Bisa masak agak ribet' },
        { value: 'Level Dewa Masak', label: '🔥 Dewa Masak', desc: 'Bisa eksperimen sendiri' }
      ]
    },
    {
      id: 'cooking-methods',
      title: "Metode masak favorit? 🍳",
      description: "Pilih cara masak yang paling kamu suka atau paling familiar",
      field: 'cooking_methods',
      type: 'multiple',
      options: [
        { value: 'Goreng', label: '🍳 Goreng', desc: 'Klasik dan gampang' },
        { value: 'Rebus', label: '🥘 Rebus/Kukus', desc: 'Sehat dan praktis' },
        { value: 'Bakar', label: '🔥 Bakar/Panggang', desc: 'Smoky flavor lover' },
        { value: 'Tumis', label: '🥗 Tumis', desc: 'Cepat dan fresh' },
        { value: 'Bersantan', label: '🥥 Bersantan', desc: 'Rich and creamy' },
        { value: 'Berkuah', label: '🍲 Berkuah', desc: 'Comfort food vibes' }
      ]
    },
    {
      id: 'avoid-ingredients',
      title: "Ada yang dihindari? 🚫",
      description: "Alergi, pantangan, atau emang gak suka aja (opsional)",
      field: 'avoid_ingredients',
      type: 'multiple',
      options: [
        { value: 'Seafood', label: '🦐 Seafood', desc: 'Alergi atau gak suka' },
        { value: 'Pedas', label: '🌶️ Pedas', desc: 'Gak tahan pedes' },
        { value: 'Santan', label: '🥥 Santan', desc: 'Diet atau masalah pencernaan' },
        { value: 'MSG', label: '🧂 MSG', desc: 'Prefer natural seasoning' },
        { value: 'Gluten', label: '🌾 Gluten', desc: 'Intolerance atau diet' },
        { value: 'Dairy', label: '🥛 Dairy', desc: 'Lactose intolerant' }
      ]
    },
    {
      id: 'taste-preference',
      title: "Rasa yang bikin nagih? 😋",
      description: "Kalau disuruh pilih satu, rasa apa yang paling bikin kamu happy? (opsional)",
      field: 'preferred_taste',
      type: 'multiple',
      options: [
        { value: 'Gurih', label: '🧄 Gurih', desc: 'Savory all the way' },
        { value: 'Pedas', label: '🌶️ Pedas', desc: 'No spice, no life' },
        { value: 'Manis', label: '🍯 Manis', desc: 'Sweet tooth activated' },
        { value: 'Asam', label: '🍋 Asam Segar', desc: 'Tangy and refreshing' },
        { value: 'Asin', label: '🧂 Asin', desc: 'Salty cravings' },
        { value: 'Umami', label: '🍄 Umami', desc: 'Deep, complex flavors' }
      ]
    },
    {
      id: 'confirmation',
      title: "Perfect! Kamu udah siap jadi chef handal! 🎉",
      description: "Berdasarkan pilihan kamu, kami punya banyak resep yang cocok banget. Mulai dari yang simpel sampai yang mau challenge!",
      field: 'confirmation',
      type: 'confirmation',
      options: []
    }
  ];

  const currentPageData = pages[currentPage];
  const progress = ((currentPage + 1) / pages.length) * 100;

  const handleOptionSelect = (value) => {
    const field = currentPageData.field;
    
    if (currentPageData.type === 'multiple') {
      setPreferences(prev => ({
        ...prev,
        [field]: prev[field].includes(value) 
          ? prev[field].filter(item => item !== value)
          : [...prev[field], value]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const isOptionSelected = (value) => {
    const field = currentPageData.field;
    if (currentPageData.type === 'multiple') {
      return preferences[field].includes(value);
    }
    return preferences[field] === value;
  };

  const canProceed = () => {
    const field = currentPageData.field;
    if (currentPageData.type === 'confirmation') {
      return true;
    }
    
    // Sesuaikan dengan schema Joi - field yang required
    const requiredFields = ['preferred_categories', 'cooking_methods'];
    const optionalFields = ['avoid_ingredients', 'preferred_taste'];
    
    if (requiredFields.includes(field)) {
      if (currentPageData.type === 'multiple') {
        return preferences[field].length > 0;
      }
      return preferences[field] !== '';
    }
    
    // Untuk field optional, bisa langsung lanjut
    if (optionalFields.includes(field)) {
      return true;
    }
    
    // Untuk field single (preferred_time, skill_level)
    if (currentPageData.type === 'single') {
      return preferences[field] !== '';
    }
    
    return false;
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Validation function sesuai dengan schema Joi
  const validatePreferences = (prefs) => {
    const errors = [];
    
    // Validasi required fields sesuai schema Joi
    if (!Array.isArray(prefs.preferred_categories) || prefs.preferred_categories.length === 0) {
      errors.push('Minimal pilih satu kategori makanan');
    }
    
    if (!Array.isArray(prefs.cooking_methods) || prefs.cooking_methods.length === 0) {
      errors.push('Minimal pilih satu metode masak');
    }
    
    // Optional fields - set default jika kosong
    if (!Array.isArray(prefs.avoid_ingredients)) {
      prefs.avoid_ingredients = [];
    }
    
    if (!Array.isArray(prefs.preferred_taste)) {
      prefs.preferred_taste = [];
    }
    
    // Set default values sesuai schema
    if (!prefs.preferred_time || prefs.preferred_time.trim() === '') {
      prefs.preferred_time = 'Siang'; // Default dari schema
    }
    
    if (!prefs.skill_level || prefs.skill_level.trim() === '') {
      prefs.skill_level = 'Cepat & Mudah'; // Default dari schema
    }
    
    // Validasi nilai sesuai dengan schema enum
    const validPreferredTime = ['Pagi', 'Siang', 'Sore', 'Malam'];
    if (!validPreferredTime.includes(prefs.preferred_time)) {
      errors.push(`Waktu masak harus salah satu dari: ${validPreferredTime.join(', ')}`);
    }
    
    const validSkillLevel = ['Cepat & Mudah', 'Butuh Usaha', 'Level Dewa Masak'];
    if (!validSkillLevel.includes(prefs.skill_level)) {
      errors.push(`Skill level harus salah satu dari: ${validSkillLevel.join(', ')}`);
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    showLoadingAlert("Menyimpan preferensi makanan...");
    
    try {
      console.log('=== DEBUGGING PREFERENCES SUBMISSION ===');
      console.log('Current preferences:', preferences);
      console.log('User object:', user);
      console.log('Is authenticated:', isAuthenticated);
      
      // Validasi user authentication
      if (!user?.id && !user?.userId) {
        console.error('User authentication failed:', { user, isAuthenticated });
        throw new Error('User tidak terautentikasi');
      }

      // Prepare data dengan default values sesuai schema
      const apiData = {
        preferred_categories: Array.isArray(preferences.preferred_categories) 
          ? preferences.preferred_categories 
          : [],
        cooking_methods: Array.isArray(preferences.cooking_methods) 
          ? preferences.cooking_methods 
          : [],
        avoid_ingredients: Array.isArray(preferences.avoid_ingredients) 
          ? preferences.avoid_ingredients 
          : [],
        preferred_taste: Array.isArray(preferences.preferred_taste) 
          ? preferences.preferred_taste 
          : [],
        preferred_time: preferences.preferred_time || "Siang", // ✅ Default sesuai schema
        skill_level: preferences.skill_level || "Cepat & Mudah" // ✅ Default sesuai schema
      };

      // Validasi data sebelum dikirim
      const validation = validatePreferences(apiData);
      console.log('Validation result:', validation);
      
      if (!validation.isValid) {
        console.error('Validation failed:', validation.errors);
        throw new Error(`Data tidak lengkap: ${validation.errors.join(', ')}`);
      }

      console.log('API Data to send:', apiData);
      console.log('Data types:', {
        preferred_categories: `${typeof apiData.preferred_categories} (length: ${apiData.preferred_categories.length})`,
        cooking_methods: `${typeof apiData.cooking_methods} (length: ${apiData.cooking_methods.length})`,
        avoid_ingredients: `${typeof apiData.avoid_ingredients} (length: ${apiData.avoid_ingredients.length})`,
        preferred_taste: `${typeof apiData.preferred_taste} (length: ${apiData.preferred_taste.length})`,
        preferred_time: `${typeof apiData.preferred_time} (value: "${apiData.preferred_time}")`,
        skill_level: `${typeof apiData.skill_level} (value: "${apiData.skill_level}")`
      });

      console.log('Sending API request...');
      
      // Kirim ke endpoint
      const response = await apiPost('/api/preferences', apiData);
      
      console.log('API Response:', response);
      
      // Handle response
      if (response.error === true) {
        throw new Error(response.message || 'Gagal menyimpan preferensi');
      }
      
      console.log('Preferences saved successfully!');
      
      hideLoadingAlert();
      
      const successMessage = response.message || 'Preferensi makanan berhasil disimpan! 🎉';
      showSuccessAlert(successMessage);
      
      // Store preferences in localStorage
      try {
        localStorage.setItem('userPreferences', JSON.stringify({
          ...apiData,
          id: response.data?.id,
          savedAt: new Date().toISOString()
        }));
        console.log('Preferences stored in localStorage');
      } catch (storageError) {
        console.warn('Failed to save preferences to localStorage:', storageError);
      }
      
      // Redirect setelah berhasil
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
      
    } catch (error) {
      console.error('=== ERROR SUBMITTING PREFERENCES ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      console.error('Error data:', error.data);
      
      hideLoadingAlert();
      
      // Enhanced error handling
      let errorMessage = 'Terjadi kesalahan saat menyimpan preferensi.';
      
      // Check for specific error responses
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.message.includes('autentikasi') || 
                 error.status === 401) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else if (error.status === 400) {
        errorMessage = error.data?.message || `Validasi gagal: ${error.message}`;
      } else if (error.status === 404) {
        errorMessage = 'Endpoint tidak ditemukan. Hubungi administrator.';
      } else if (error.status === 500) {
        errorMessage = 'Server bermasalah. Coba lagi dalam beberapa saat.';
      } else if (error.message.includes('network') || 
                 error.message.includes('fetch') ||
                 error.name === 'NetworkError') {
        errorMessage = 'Koneksi bermasalah. Periksa internet Anda dan coba lagi.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Final error message:', errorMessage);
      showErrorAlert(errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state jika user data belum tersedia
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-orange-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* User Info & Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <span className="text-lg font-medium text-gray-700">{currentPage + 1} dari {pages.length}</span>
              <span className="ml-4 text-sm text-gray-500">
                Halo, <strong className="text-orange-600">{user.name}</strong>! 👋
              </span>
            </div>
            <span className="text-lg font-medium text-gray-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-400 to-red-400 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex min-h-[600px]">
            {/* Left Side - Title & Description */}
            <div className="w-2/5 bg-gradient-to-br from-orange-400 to-red-500 p-8 flex flex-col justify-center text-white">
              <h1 className="text-4xl font-bold mb-6 leading-tight">
                {currentPageData.title}
              </h1>
              <p className="text-xl leading-relaxed opacity-90">
                {currentPageData.description}
              </p>
              
              {/* Current Selection Summary */}
              {canProceed() && currentPageData.type !== 'confirmation' && (
                <div className="mt-8 p-4 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <p className="text-sm opacity-80 mb-2">Pilihan kamu:</p>
                  <div className="text-base font-medium">
                    {currentPageData.type === 'multiple' 
                      ? preferences[currentPageData.field].map(val => 
                          currentPageData.options.find(opt => opt.value === val)?.label
                        ).join(', ')
                      : currentPageData.options.find(opt => opt.value === preferences[currentPageData.field])?.label
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Options */}
            <div className="w-3/5 p-8">
              <div className="h-full flex flex-col">
                {/* Options Grid or Confirmation */}
                <div className="flex-1 overflow-y-auto">
                  {currentPageData.type === 'confirmation' ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="text-8xl mb-8">🍳</div>
                      
                      {/* Preference Summary dengan data user */}
                      <div className="bg-gray-50 rounded-2xl p-6 mb-8 max-w-md">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">
                          Ringkasan Preferensi {user.name}:
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Email:</strong> {user.email}</p>
                          <p><strong>Lauk Favorit:</strong> {preferences.preferred_categories.length} pilihan</p>
                          <p><strong>Waktu Masak:</strong> {preferences.preferred_time}</p>
                          <p><strong>Skill Level:</strong> {preferences.skill_level}</p>
                          <p><strong>Metode Masak:</strong> {preferences.cooking_methods.length} pilihan</p>
                          <p><strong>Pantangan:</strong> {preferences.avoid_ingredients.length} item</p>
                          <p><strong>Rasa Favorit:</strong> {preferences.preferred_taste.length} pilihan</p>
                        </div>
                      </div>
                      
                      <p className="text-xl text-gray-600 mb-8">
                        Siap untuk petualangan kuliner yang amazing? 🚀
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-2">
                      {currentPageData.options.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleOptionSelect(option.value)}
                          className={`p-5 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-[1.02] ${
                            isOptionSelected(option.value)
                              ? 'border-orange-400 bg-orange-50 shadow-lg transform scale-[1.02]'
                              : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-25 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-800 mb-2">
                                {option.label}
                              </div>
                              <div className="text-sm text-gray-600 leading-relaxed">
                                {option.desc}
                              </div>
                            </div>
                            {isOptionSelected(option.value) && (
                              <Check className="w-6 h-6 text-orange-500 ml-3 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 0 || isSubmitting}
                    className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                      currentPage === 0 || isSubmitting
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Kembali
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={!canProceed() || isSubmitting}
                    className={`flex items-center px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                      canProceed() && !isSubmitting
                        ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white hover:from-orange-500 hover:to-red-500 shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        {currentPage === pages.length - 1 ? 'Simpan Preferensi!' : 'Lanjut'}
                        {currentPage !== pages.length - 1 && <ChevronRight className="w-5 h-5 ml-2" />}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPreferenceOnboarding;