import { httpClient } from './httpClient';
import type { LoginRequest, LoginResponse } from '../types/authTypes';

// Funkcje w api/ izolują szczegóły komunikacji z backendem od komponentów React
export async function loginRequest(request: LoginRequest) {
  const response = await httpClient.post<LoginResponse>('/Auth/login', request);

  return response.data;
}