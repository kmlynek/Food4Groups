import { apiRequest } from './api';

export type OrderAddon = {
  addonId: string;
  addonName?: string;
};

export type OrderStatusHistory = {
  orderStatusId: string;
  orderStatusName?: string;
  changedByUserId?: string;
  changedAt: string;
};

export type Order = {
  id: string;
  groupMemberId: string;
  customerEmail?: string;
  groupId: string;
  groupName?: string;
  menuDayId: string;
  menuDate?: string;
  dishId: string;
  dishName?: string;
  orderStatusId: string;
  orderStatusName?: string;
  addons: OrderAddon[];
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt?: string;
};

// Funkcja pobiera wyłącznie zamówienia zalogowanego Klienta
export function getMyOrders(token: string) {
  return apiRequest<Order[]>('/orders/my', { token });
}
