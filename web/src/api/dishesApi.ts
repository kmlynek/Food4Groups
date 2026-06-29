import { httpClient } from './httpClient';
import type { CreateDishRequest, Dish, UpdateDishRequest } from '../types/dishTypes';

export async function getDishes() {
  // Pobiera listę dań dostępnych dla aktualnie zalogowanego użytkownika
  const response = await httpClient.get<Dish[]>('/dishes');

  return response.data;
}

export async function createDish(request: CreateDishRequest) {
  // Tworzy nowe danie przypisane do firmy cateringowej
  const response = await httpClient.post<Dish>('/dishes', request);

  return response.data;
}

export async function updateDish(id: string, request: UpdateDishRequest) {
  // Aktualizuje dane wybranego dania
  const response = await httpClient.put<Dish>(`/dishes/${id}`, request);

  return response.data;
}

export async function deleteDish(id: string) {
  // Usuwa wybrane danie z systemu
  await httpClient.delete(`/dishes/${id}`);
}