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

export type OrderStatus = {
  id: string;
  name: string;
  isFinal: boolean;
  isActive: boolean;
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

export type ChangeOrderStatusRequest = {
  orderStatusId: string;
};