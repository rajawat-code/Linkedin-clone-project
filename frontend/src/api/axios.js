import axios from 'axios';

const API = axios.create({
  baseURL: 'https://linkedin-clone-project-4f7z.onrender.com/api', // ← must have /api
  withCredentials: true, // needed if backend uses cookies
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;