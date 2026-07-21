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

export type OrderOptionDish = {
  id: string;
  name?: string;
};

export type OrderOptionAddon = {
  id: string;
  name?: string;
};

export type OrderOptionMenuDay = {
  id: string;
  menuDate: string;
  menuPeriodName?: string;
  dishes: OrderOptionDish[];
  addons: OrderOptionAddon[];
};

export type OrderOptions = {
  groupMemberId?: string;
  groupId?: string;
  groupName?: string;
  menuDays: OrderOptionMenuDay[];
};

export type CreateOrderRequest = {
  groupMemberId: string;
  menuDayId: string;
  dishId: string;
  addonIds: string[];
};

// Funkcja pobiera wyłącznie zamówienia zalogowanego Klienta
export function getMyOrders(token: string) {
  return apiRequest<Order[]>('/orders/my', { token });
}

// Opcje zamówienia uwzględniają grupę, pakiet i dostępne menu Klienta
export function getOrderOptions(token: string) {
  return apiRequest<OrderOptions>('/orders/options', { token });
}

// Backend ponownie weryfikuje wszystkie elementy przed utworzeniem zamówienia
export function createOrder(token: string, request: CreateOrderRequest) {
  return apiRequest<Order>('/orders', {
    method: 'POST',
    token,
    body: JSON.stringify(request),
  });
}
