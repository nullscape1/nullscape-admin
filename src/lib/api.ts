import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
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



