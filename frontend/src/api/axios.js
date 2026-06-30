import axios from 'axios';

let detectedBaseURL = null;
let detectedSocketURL = null;
let probePromise = null;

const LOCAL_BASE = 'http://localhost:5000';
const CLOUD_BASE = 'https://linkedin-clone-project-1.onrender.com';

export const probeBackend = () => {
  if (probePromise) return probePromise;

  probePromise = new Promise(async (resolve) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      // Probe localhost
      await fetch(`${LOCAL_BASE}/api`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors'
      });
      clearTimeout(timeoutId);
      detectedBaseURL = `${LOCAL_BASE}/api`;
      detectedSocketURL = LOCAL_BASE;
      console.log('Using local backend:', detectedBaseURL);
    } catch (err) {
      detectedBaseURL = `${CLOUD_BASE}/api`;
      detectedSocketURL = CLOUD_BASE;
      console.log('Local backend not available, using cloud backend:', detectedBaseURL);
    }
    
    resolve({ baseURL: detectedBaseURL, socketURL: detectedSocketURL });
  });

  return probePromise;
};

// Start probing immediately
probeBackend();

const API = axios.create({
  baseURL: LOCAL_BASE + '/api', // default initial value, will be overridden by interceptor
  withCredentials: true, // needed if backend uses cookies
});

// Attach token and dynamically set base URL
API.interceptors.request.use(async (config) => {
  const { baseURL } = await probeBackend();
  config.baseURL = baseURL;

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;