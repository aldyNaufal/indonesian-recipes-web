import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGet } from '../utils/httpClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state dari localStorage saat app pertama kali load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        console.log('Initializing auth...', { 
          hasToken: !!savedToken, 
          hasUser: !!savedUser,
          tokenValue: savedToken ? savedToken.substring(0, 20) + '...' : null
        });

        if (savedToken && savedToken !== 'null' && savedToken !== 'undefined') {
          // Set token terlebih dahulu
          setToken(savedToken);
          
          if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
              console.log('Loaded user from localStorage:', parsedUser);
            } catch (error) {
              console.error('Error parsing saved user data:', error);
              localStorage.removeItem('user');
            }
          }
          
          // Validate token dengan server
          await validateToken(savedToken);
        } else {
          console.log('No valid token found in localStorage');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fungsi untuk validate token dengan server
  const validateToken = async (userToken) => {
    try {
      console.log('Validating token with server...');
      const response = await apiGet('api/profile', userToken);
      
      console.log('Profile API Response:', response); // Debug full response
      
      // Periksa berbagai kemungkinan response structure
      const isSuccess = !response.error || 
                       response.message === "Berhasil mendapatkan profil" ||
                       response.success === true;
      
      if (isSuccess) {
        // Coba extract user data dari berbagai kemungkinan structure
        const userData = response.data || response.profile || response.user || response.result;
        
        if (userData) {
          console.log('Token valid, user data from server:', userData);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          console.log('Token valid but no user data found in response');
          // Jika token valid tapi tidak ada user data, gunakan existing user data
        }
      } else {
        console.warn('Token validation failed:', response.message);
        if (response.status === 401 || response.status === 403) {
          console.log('Token expired or invalid, logging out');
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error validating token:', error);
      // Jika ada error network, tetap gunakan data local jika ada
      if (!user) {
        console.log('Network error and no local user data, clearing auth');
        clearAuthData();
      }
    }
  };

  // Fungsi untuk clear semua auth data
  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const login = async (userData, userToken) => {
    console.log('Login function called with:', { 
      userData, 
      tokenExists: !!userToken,
      tokenValue: userToken ? userToken.substring(0, 20) + '...' : null
    });

    if (!userData || !userToken) {
      console.error('Login failed: Missing userData or userToken');
      throw new Error('Data login tidak lengkap');
    }

    // Set state terlebih dahulu
    setUser(userData);
    setToken(userToken);
    
    // Simpan ke localStorage
    try {
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Auth data saved to localStorage successfully');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }

    // Validate token untuk memastikan
    setTimeout(() => {
      validateToken(userToken);
    }, 100);
  };

  const logout = () => {
    console.log('Logging out...');
    clearAuthData();
    // Optional: redirect ke login page bisa dilakukan di component yang memanggil logout
  };

  const updateUser = (updatedUserData) => {
    console.log('Updating user data:', updatedUserData);
    setUser(updatedUserData);
    try {
      localStorage.setItem('user', JSON.stringify(updatedUserData));
    } catch (error) {
      console.error('Error updating user in localStorage:', error);
    }
  };

  // Improved isAuthenticated logic
  const isAuthenticated = !!(token && user);

  // Debug log untuk monitoring state
  useEffect(() => {
    console.log('Auth state changed:', { 
      hasUser: !!user, 
      hasToken: !!token, 
      isAuthenticated, 
      loading 
    });
  }, [user, token, isAuthenticated, loading]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    validateToken,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};