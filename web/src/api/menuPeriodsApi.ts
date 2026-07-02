import { httpClient } from './httpClient';
import type {
  CreateMenuPeriodRequest,
  MenuPeriod,
  UpdateMenuPeriodRequest,
} from '../types/menuTypes';

export async function getMenuPeriods() {
  // Pobiera listę okresów menu dostępnych dla ról zarządzających ofertą
  const response = await httpClient.get<MenuPeriod[]>('/menuperiods');

  return response.data;
}

export async function createMenuPeriod(request: CreateMenuPeriodRequest) {
  // Tworzy nowy okres menu dla wybranej firmy cateringowej
  const response = await httpClient.post<MenuPeriod>('/menuperiods', request);

  return response.data;
}

export async function updateMenuPeriod(id: string, request: UpdateMenuPeriodRequest) {
  // Aktualizuje dane wybranego okresu menu
  const response = await httpClient.put<MenuPeriod>(`/menuperiods/${id}`, request);

  return response.data;
}

export async function deleteMenuPeriod(id: string) {
  // Usuwa wybrany okres menu z systemu
  await httpClient.delete(`/menuperiods/${id}`);
}