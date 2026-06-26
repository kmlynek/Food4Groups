import axios from 'axios';
import { getStoredAuth } from '../utils/authStorage';

// Wspólny klient HTTP wykorzystywany przez całą aplikację
export const httpClient = axios.create({
    // Wszystkie żądania są kierowane przez proxy Vite do backendu ASP.NET Core
    baseURL: '/api',
});

httpClient.interceptors.request.use((config) => {
    const auth = getStoredAuth();

    // Token JWT jest automatycznie dołączany do każdego chronionego żądania
    if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
    }

    return config;
});