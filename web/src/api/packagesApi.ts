import { httpClient } from './httpClient';
import type { CreatePackageRequest, Package, UpdatePackageRequest } from '../types/packageTypes';

export async function getPackages() {
  // Pobiera listę pakietów dostępnych dla ról zarządzających ofertą
  const response = await httpClient.get<Package[]>('/packages');

  return response.data;
}

export async function createPackage(request: CreatePackageRequest) {
  // Tworzy nowy pakiet przypisany do firmy cateringowej
  const response = await httpClient.post<Package>('/packages', request);

  return response.data;
}

export async function updatePackage(id: string, request: UpdatePackageRequest) {
  // Aktualizuje dane wybranego pakietu
  const response = await httpClient.put<Package>(`/packages/${id}`, request);

  return response.data;
}

export async function deletePackage(id: string) {
  // Usuwa wybrany pakiet z systemu
  await httpClient.delete(`/packages/${id}`);
}