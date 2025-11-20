import axios from 'axios';
import Cookies from 'js-cookie';

// API Configuration
// Production: https://nullscape-backend.onrender.com/api/v1
// Development: http://localhost:4000/api/v1
// Can be overridden via NEXT_PUBLIC_API_URL environment variable
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Auto-detect production environment
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://nullscape-backend.onrender.com/api/v1';
  }
  return 'http://localhost:4000/api/v1';
};

export const api = axios.create({
  baseURL: getApiUrl(),
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  Cookies.set('accessToken', data.tokens.accessToken);
  Cookies.set('refreshToken', data.tokens.refreshToken);
  return data.user;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}



