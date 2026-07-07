import { httpClient } from './httpClient';
import type {
  CreateGroupPackageAssignmentRequest,
  GroupPackageAssignment,
  UpdateGroupPackageAssignmentRequest,
} from '../types/groupPackageAssignmentTypes';

export async function getGroupPackageAssignmentsByGroup(groupId: string) {
  // Pobiera historię pakietów przypisanych do wybranej grupy
  const response = await httpClient.get<GroupPackageAssignment[]>(`/grouppackageassignments/group/${groupId}`);

  return response.data;
}

export async function createGroupPackageAssignment(request: CreateGroupPackageAssignmentRequest) {
  // Przypisuje pakiet do grupy w określonym zakresie dat
  const response = await httpClient.post<GroupPackageAssignment>('/grouppackageassignments', request);

  return response.data;
}

export async function updateGroupPackageAssignment(id: string, request: UpdateGroupPackageAssignmentRequest) {
  // Aktualizuje pakiet przypisany do grupy oraz zakres jego obowiązywania
  const response = await httpClient.put<GroupPackageAssignment>(`/grouppackageassignments/${id}`, request);

  return response.data;
}

export async function deleteGroupPackageAssignment(id: string) {
  // Usuwa przypisanie pakietu do grupy
  await httpClient.delete(`/grouppackageassignments/${id}`);
}