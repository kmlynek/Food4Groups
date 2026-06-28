import { httpClient } from './httpClient';
import type { CateringCompany } from '../types/cateringCompanyTypes';

export async function getCateringCompanies() {
  // Pobiera listę firm cateringowych dostępnych przy tworzeniu i edycji grup
  const response = await httpClient.get<CateringCompany[]>('/cateringcompanies');

  return response.data;
}