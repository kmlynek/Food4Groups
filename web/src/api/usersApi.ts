import { httpClient } from './httpClient';
import type { AssignUserRoleRequest, AdminUser } from '../types/userTypes';

export async function getUsers() {
  // Pobiera listę użytkowników wraz z przypisanymi rolami
  const response = await httpClient.get<AdminUser[]>('/adminuser');

  return response.data;
}

export async function assignUserRole(userId: string, request: AssignUserRoleRequest) {
  // Przypisuje wybraną rolę użytkownikowi
  await httpClient.post(`/adminuser/${userId}/roles`, request);
}

export async function removeUserRole(userId: string, roleName: string) {
  // Usuwa wybraną rolę użytkownika
  await httpClient.delete(`/adminuser/${userId}/roles/${roleName}`);
}

export async function deleteUser(userId: string) {
  // Usuwa konto użytkownika z systemu
  await httpClient.delete(`/adminuser/${userId}`);
}