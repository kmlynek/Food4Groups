import { httpClient } from './httpClient';
import type { Addon, CreateAddonRequest, UpdateAddonRequest } from '../types/addonTypes';

export async function getAddons() {
    // Pobiera listę dodatków dostępnych dla aktualnie zalogowanego użytkownika
    const response = await httpClient.get<Addon[]>('/addons');

    return response.data;
}

export async function createAddon(request: CreateAddonRequest) {
    // Tworzy nowy dodatek przypisany do firmy cateringowej
    const response = await httpClient.post<Addon>('/addons', request);

    return response.data;
}

export async function updateAddon(id: string, request: UpdateAddonRequest) {
    // Aktualizuje dane wybranego dodatku
    const response = await httpClient.put<Addon>(`/addons/${id}`, request);

    return response.data;
}

export async function deleteAddon(id: string) {
    // Usuwa wybrany dodatek z systemu
    await httpClient.delete(`/addons/${id}`);
}