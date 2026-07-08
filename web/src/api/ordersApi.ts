import { httpClient } from './httpClient';
import type {
  ChangeOrderStatusRequest,
  CreateOrderRequest,
  Order,
  OrderOptions,
  OrderStatus,
} from '../types/orderTypes';

export async function getOrders() {
  // Pobiera wszystkie zamówienia dla ról obsługujących realizację
  const response = await httpClient.get<Order[]>('/orders');

  return response.data;
}

export async function getMyOrders() {
  // Pobiera zamówienia aktualnie zalogowanego klienta
  const response = await httpClient.get<Order[]>('/orders/my');

  return response.data;
}

export async function getCoordinatorOrders() {
  // Pobiera zamówienia grupy przypisanej do aktualnie zalogowanego koordynatora
  const response = await httpClient.get<Order[]>('/orders/coordinator');

  return response.data;
}

export async function getOrderStatuses() {
  // Pobiera słownik statusów wykorzystywanych przy obsłudze zamówień
  const response = await httpClient.get<OrderStatus[]>('/orders/statuses');

  return response.data;
}

export async function getOrderOptions() {
  // Pobiera dni menu, dania i dodatki dostępne dla aktualnie zalogowanego klienta
  const response = await httpClient.get<OrderOptions>('/orders/options');

  return response.data;
}

export async function createOrder(request: CreateOrderRequest) {
  // Tworzy zamówienie klienta w ramach jego aktywnego uczestnictwa w grupie
  const response = await httpClient.post<Order>('/orders', request);

  return response.data;
}

export async function changeOrderStatus(id: string, request: ChangeOrderStatusRequest) {
  // Aktualizuje status zamówienia i zapisuje zmianę w historii po stronie backendu
  const response = await httpClient.put<Order>(`/orders/${id}/status`, request);

  return response.data;
}