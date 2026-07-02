import { httpClient } from './httpClient';
import type { CreateMenuDayRequest, MenuDay, UpdateMenuDayRequest } from '../types/menuTypes';

export async function getMenuDaysByPeriod(menuPeriodId: string) {
  // Pobiera dni menu przypisane do wybranego okresu menu
  const response = await httpClient.get<MenuDay[]>(`/menudays/menu-period/${menuPeriodId}`);

  return response.data;
}

export async function createMenuDay(request: CreateMenuDayRequest) {
  // Tworzy dzień menu w ramach wybranego okresu
  const response = await httpClient.post<MenuDay>('/menudays', request);

  return response.data;
}

export async function updateMenuDay(id: string, request: UpdateMenuDayRequest) {
  // Aktualizuje datę lub status wybranego dnia menu
  const response = await httpClient.put<MenuDay>(`/menudays/${id}`, request);

  return response.data;
}

export async function deleteMenuDay(id: string) {
  // Usuwa wybrany dzień menu
  await httpClient.delete(`/menudays/${id}`);
}