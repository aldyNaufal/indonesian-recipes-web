// config.js - Configuration utilities
export const getBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  return '';
};

export const baseUrl = getBaseUrl();

export default {
  getBaseUrl,
  baseUrl
};