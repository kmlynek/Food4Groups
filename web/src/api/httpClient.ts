import axios from 'axios';
import { getStoredAuth } from '../utils/authStorage';

// Wspólny klient HTTP dla całej aplikacji
// baseURL '/api' trafia do proxy Vite, a proxy przekazuje request do backendu
export const httpClient = axios.create({
  baseURL: '/api',
});

httpClient.interceptors.request.use((config) => {
  const auth = getStoredAuth();

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});