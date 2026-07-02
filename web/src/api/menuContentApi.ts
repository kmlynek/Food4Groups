import { httpClient } from './httpClient';
import type {
  CreateMenuDayAddonRequest,
  CreateMenuItemRequest,
  MenuDayAddon,
  MenuItem,
} from '../types/menuTypes';

export async function getMenuItemsByDay(menuDayId: string) {
  // Pobiera dania przypisane do wybranego dnia menu
  const response = await httpClient.get<MenuItem[]>(`/menuitems/menu-day/${menuDayId}`);

  return response.data;
}

export async function createMenuItem(request: CreateMenuItemRequest) {
  // Przypisuje danie do dnia menu
  const response = await httpClient.post<MenuItem>('/menuitems', request);

  return response.data;
}

export async function deleteMenuItem(id: string) {
  // Usuwa przypisanie dania do dnia menu
  await httpClient.delete(`/menuitems/${id}`);
}

export async function getMenuDayAddonsByDay(menuDayId: string) {
  // Pobiera dodatki przypisane do wybranego dnia menu
  const response = await httpClient.get<MenuDayAddon[]>(`/menudayaddons/menu-day/${menuDayId}`);

  return response.data;
}

export async function createMenuDayAddon(request: CreateMenuDayAddonRequest) {
  // Przypisuje dodatek do dnia menu
  const response = await httpClient.post<MenuDayAddon>('/menudayaddons', request);

  return response.data;
}

export async function deleteMenuDayAddon(id: string) {
  // Usuwa przypisanie dodatku do dnia menu
  await httpClient.delete(`/menudayaddons/${id}`);
}