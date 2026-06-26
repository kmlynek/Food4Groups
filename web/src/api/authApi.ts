import { httpClient } from './httpClient';
import type { ChangePasswordRequest, LoginRequest, LoginResponse } from '../types/authTypes';

// Funkcje API oddzielają komunikację z backendem od logiki komponentów React
export async function loginRequest(request: LoginRequest) {
    const response = await httpClient.post<LoginResponse>('/Auth/login', request);

    return response.data;
}

export async function changePassword(request: ChangePasswordRequest) {
  // Wysyła żądanie zmiany hasła dla aktualnie zalogowanego użytkownika
  await httpClient.post('/auth/change-password', request);
}