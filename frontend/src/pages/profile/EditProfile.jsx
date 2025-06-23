import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Camera, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

// API Base URL - sesuaikan dengan backend server Anda
const API_BASE_URL = 'http://localhost:3000'; // atau port backend Anda

const EditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    birthDate: '',
    location: '',
    photo: ''
  });
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Validasi token
      if (!token) {
        toast.error('Token tidak ditemukan, silakan login kembali');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Cek status response
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Sesi telah berakhir, silakan login kembali');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validasi response data
      if (!data || data.error) {
        throw new Error(data?.message || 'Data profil tidak valid');
      }
      
      const userData = {
        name: data.user?.name || '',
        email: data.user?.email || '',
        phone: data.user?.phone || '',
        gender: data.user?.gender || '',
        birthDate: data.user?.birthDate ? data.user.birthDate.split('T')[0] : '',
        location: data.user?.location || '',
        photo: data.user?.photo || ''
      };
      
      setFormData(userData);
      setOriginalData(userData);
      setPhotoPreview(data.user?.photo || null);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Gagal memuat profil: ' + error.message);
      
      // Redirect ke login jika error authentication
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi file
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Ukuran file maksimal 5MB');
        return;
      }

      setPhotoFile(file);
      
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Validasi token
      if (!token) {
        toast.error('Token tidak ditemukan, silakan login kembali');
        navigate('/login');
        return;
      }

      // Validasi nama wajib
      if (!formData.name || !formData.name.trim()) {
        toast.error('Nama tidak boleh kosong');
        setLoading(false);
        return;
      }

      // Validasi email format jika diisi
      if (formData.email && formData.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          toast.error('Format email tidak valid');
          setLoading(false);
          return;
        }
      }

      // Validasi phone format jika diisi (sesuai dengan backend)
      if (formData.phone && formData.phone.trim()) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
        if (!phoneRegex.test(formData.phone.trim())) {
          toast.error('Nomor telepon harus 10-15 karakter dan hanya boleh berisi angka, spasi, tanda hubung, plus, dan kurung');
          setLoading(false);
          return;
        }
      }

      // Siapkan data untuk dikirim
      const dataToSend = {
        name: formData.name.trim(),
        email: formData.email ? formData.email.trim() : '',
        phone: formData.phone ? formData.phone.trim() : '',
        gender: formData.gender || '',
        birthDate: formData.birthDate || '',
        location: formData.location ? formData.location.trim() : ''
      };

      // Handle photo upload
      if (photoFile) {
        try {
          const base64Photo = await convertToBase64(photoFile);
          dataToSend.photo = base64Photo;
        } catch (error) {
          toast.error('Gagal memproses foto');
          setLoading(false);
          return;
        }
      }

      console.log('Data yang akan dikirim:', dataToSend); // Debug log

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('Response status:', response.status); // Debug log

      // Cek status response
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Error response:', errorData); // Debug log
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
        }

        if (response.status === 401) {
          toast.error('Sesi telah berakhir, silakan login kembali');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        } else if (response.status === 400) {
          toast.error('Data tidak valid: ' + errorMessage);
        } else if (response.status === 413) {
          toast.error('File terlalu besar');
        } else {
          toast.error('Gagal memperbarui profil: ' + errorMessage);
        }
        
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Success response:', data); // Debug log

      if (data.error) {
        throw new Error(data.message || 'Unknown error');
      }

      toast.success('Profil berhasil diperbarui!');
      
      // Update data original dengan data baru
      setOriginalData(dataToSend);
      
      // Redirect ke profile page
      setTimeout(() => {
        navigate('/profile');
      }, 1000);

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal memperbarui profil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Edit Profil</h1>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Batal</span>
              </button>
              <button
                type="submit"
                form="edit-profile-form"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form id="edit-profile-form" onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Profile Photo Section */}
            <div className="bg-gradient-to-b from-[#B91C1C] to-[#E02929] px-8 py-8">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Foto Profil</h2>
                  <p className="text-blue-100 text-sm">
                    Klik ikon kamera untuk mengubah foto profil
                    <br />
                    <span className="text-xs">Maksimal 5MB, format: JPG, PNG, GIF</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="p-8 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">* Field wajib diisi</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Masukkan alamat email (opsional)"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Contoh: +62812345678 atau 081234567890"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Format: 10-15 karakter, boleh menggunakan angka, spasi, tanda hubung, plus, dan kurung
                </p>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Pilih jenis kelamin (opsional)</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Lahir
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Masukkan lokasi (opsional)"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;