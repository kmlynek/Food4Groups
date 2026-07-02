import { httpClient } from './httpClient';
import type {
  CreatePackageDishAssignmentRequest,
  PackageDishAssignment,
} from '../types/packageAssignmentTypes';

export async function getPackageDishes(packageId: string) {
  // Pobiera dania przypisane do wybranego pakietu
  const response = await httpClient.get<PackageDishAssignment[]>(`/packagedishes/package/${packageId}`);

  return response.data;
}

export async function createPackageDish(request: CreatePackageDishAssignmentRequest) {
  // Przypisuje danie do pakietu
  const response = await httpClient.post<PackageDishAssignment>('/packagedishes', request);

  return response.data;
}

export async function deletePackageDish(id: string) {
  // Usuwa przypisanie dania do pakietu
  await httpClient.delete(`/packagedishes/${id}`);
}