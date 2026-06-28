import { httpClient } from './httpClient';
import type { ChangePasswordRequest, LoginRequest, LoginResponse, RegisterRequest } from '../types/authTypes';

// Funkcje API oddzielają komunikację z backendem od logiki komponentów React
export async function loginRequest(request: LoginRequest) {
    const response = await httpClient.post<LoginResponse>('/Auth/login', request);

    return response.data;
}

export async function changePassword(request: ChangePasswordRequest) {
  // Wysyła żądanie zmiany hasła dla aktualnie zalogowanego użytkownika
  await httpClient.post('/auth/change-password', request);
}

export async function register (request: RegisterRequest) {
  // Tworzy nowe konto klienta z domyślną rolą User nadawaną przez backend
  await httpClient.post('/auth/register', request)
}