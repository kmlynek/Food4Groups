import { httpClient } from './httpClient';
import type {
  AvailableGroupMemberUser,
  CreateGroupMemberRequest,
  GroupMember,
  UpdateGroupMemberRequest,
} from '../types/groupMemberTypes';

export async function getGroupMembers() {
  // Pobiera listę przypisań użytkowników do grup
  const response = await httpClient.get<GroupMember[]>('/groupmembers');

  return response.data;
}

export async function getAvailableGroupMemberUsers() {
  // Pobiera użytkowników dostępnych do przypisania do grupy
  const response = await httpClient.get<AvailableGroupMemberUser[]>('/groupmembers/users');

  return response.data;
}

export async function createGroupMember(request: CreateGroupMemberRequest) {
  // Przypisuje użytkownika do grupy
  const response = await httpClient.post<GroupMember>('/groupmembers', request);

  return response.data;
}

export async function updateGroupMember(id: string, request: UpdateGroupMemberRequest) {
  // Aktualizuje przypisanie użytkownika do grupy
  const response = await httpClient.put<GroupMember>(`/groupmembers/${id}`, request);

  return response.data;
}

export async function deleteGroupMember(id: string) {
  // Usuwa przypisanie użytkownika do grupy
  await httpClient.delete(`/groupmembers/${id}`);
}