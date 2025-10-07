import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./storage";
import { refreshToken as refreshApi } from "../apis/authService";

const instance = axios.create({
  baseURL: "https://temp-ziel-internal-backend-production.up.railway.app", // NestJS backend base URL
  // baseURL: "http://localhost:3000", // NestJS backend base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('hi')

instance.interceptors.request.use((config) => {
  console.log('[axios] Request interceptor - URL:', config.url || '');
  console.log('[axios] Request interceptor - method:', config.method);
  console.log('[axios] Request interceptor - headers:', config.headers);
  console.log('[axios] Request interceptor - data:', config.data);

  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh if 401
instance.interceptors.response.use(
  (res) => {
    console.log('[axios] Response interceptor - status:', res.status);
    console.log('[axios] Response interceptor - data:', res.data);
    return res;
  },
  async (error) => {
    console.error('[axios] Response interceptor - error:', error);
    console.error('[axios] Response interceptor - error status:', error.response?.status);
    console.error('[axios] Response interceptor - error data:', error.response?.data);

    const originalRequest = error.config || {};
    const url: string = originalRequest.url || '';

    // If the 401 happened during LOGIN, don't try to refresh or redirect.
    // Let the caller (e.g. login form) handle the error and show a message.
    if (error.response?.status === 401 && url.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        // Don't hard reload on SPAs unless necessary; reject and let guards handle.
        return Promise.reject(error);
      }

      try {
        const data = await refreshApi(refresh);
        setTokens(data.accessToken, refresh);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return instance(originalRequest); // retry
      } catch (err) {
        clearTokens();
        // Reject so route guards can kick user to login without a full reload
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
