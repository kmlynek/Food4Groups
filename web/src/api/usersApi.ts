import { httpClient } from './httpClient';
import type { AdminUser, SetUserRoleRequest } from '../types/userTypes';

export async function getUsers() {
  // Pobiera listę użytkowników wraz z przypisanymi rolami
  const response = await httpClient.get<AdminUser[]>('/adminuser');

  return response.data;
}

export async function setUserRole(userId: string, request: SetUserRoleRequest) {
  // Zastępuje dotychczasowe role użytkownika jedną wybraną rolą
  await httpClient.put(`/adminuser/${userId}/role`, request);
}

export async function deleteUser(userId: string) {
  // Usuwa konto użytkownika z systemu
  await httpClient.delete(`/adminuser/${userId}`);
}
