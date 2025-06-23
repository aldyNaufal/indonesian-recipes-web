// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const getAuthToken = () => {
    // Implementasi sesuai dengan sistem auth Anda
    return null;
  };

  useEffect(() => {
    // Check auth status on mount
    const token = getAuthToken();
    if (token) {
      setIsLoggedIn(true);
      // Set user name from token or API call
    }
  }, []);

  return {
    isLoggedIn,
    setIsLoggedIn,
    userName,
    setUserName,
    getAuthToken
  };
};

