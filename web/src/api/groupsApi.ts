import { httpClient } from './httpClient';
import type {
  AvailableGroupCoordinator,
  CreateGroupRequest,
  Group,
  UpdateGroupRequest,
} from '../types/groupTypes';

export async function getGroups() {
  // Pobiera listę grup dostępnych dla aktualnie zalogowanego użytkownika
  const response = await httpClient.get<Group[]>('/groups');

  return response.data;
}

export async function getGroupCoordinators() {
  // Pobiera użytkowników z rolą koordynatora grupy
  const response = await httpClient.get<AvailableGroupCoordinator[]>('/groups/coordinators');

  return response.data;
}

export async function createGroup(request: CreateGroupRequest) {
  // Tworzy nową grupę przypisaną do firmy cateringowej
  const response = await httpClient.post<Group>('/groups', request);

  return response.data;
}

export async function updateGroup(id: string, request: UpdateGroupRequest) {
  // Aktualizuje dane wybranej grupy
  const response = await httpClient.put<Group>(`/groups/${id}`, request);

  return response.data;
}

export async function deleteGroup(id: string) {
  // Usuwa wybraną grupę z systemu
  await httpClient.delete(`/groups/${id}`);
}