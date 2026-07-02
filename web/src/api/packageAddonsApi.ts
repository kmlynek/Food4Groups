import { httpClient } from './httpClient';
import type {
  CreatePackageAddonAssignmentRequest,
  PackageAddonAssignment,
} from '../types/packageAssignmentTypes';

export async function getPackageAddons(packageId: string) {
  // Pobiera dodatki przypisane do wybranego pakietu
  const response = await httpClient.get<PackageAddonAssignment[]>(`/packageaddons/package/${packageId}`);

  return response.data;
}

export async function createPackageAddon(request: CreatePackageAddonAssignmentRequest) {
  // Przypisuje dodatek do pakietu
  const response = await httpClient.post<PackageAddonAssignment>('/packageaddons', request);

  return response.data;
}

export async function deletePackageAddon(id: string) {
  // Usuwa przypisanie dodatku do pakietu
  await httpClient.delete(`/packageaddons/${id}`);
}