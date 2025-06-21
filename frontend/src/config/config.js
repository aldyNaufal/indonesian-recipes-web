// config.js - Configuration utilities
export const getBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  return '';
};

export const baseUrl = getBaseUrl();


// TAMBAHKAN function ini ke config.js yang sudah ada
export const getFlaskApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return ''; // Ganti dengan domain production
};

export const flaskApiUrl = getFlaskApiUrl();

// Tambahkan di export default
export default {
  getBaseUrl,
  getFlaskApiUrl, // NEW
  baseUrl,
  flaskApiUrl,    // NEW
};
