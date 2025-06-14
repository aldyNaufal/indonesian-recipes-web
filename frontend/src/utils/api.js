// api.js - Fixed version
// Untuk Docker deployment, selalu gunakan /api karena akan di-proxy oleh nginx
const baseUrl = '/api';

export async function apiGet(endpoint, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, { headers });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('API GET Error:', error);
    throw error;
  }
}

export async function apiPost(endpoint, data, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('API POST Error:', error);
    throw error;
  }
}

export async function apiPut(endpoint, data, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('API PUT Error:', error);
    throw error;
  }
}

export async function apiDelete(endpoint, token) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('API DELETE Error:', error);
    throw error;
  }
}