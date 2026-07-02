export type MenuPeriod = {
  id: string;
  cateringCompanyId: string;
  cateringCompanyName?: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type CreateMenuPeriodRequest = {
  cateringCompanyId: string;
  name: string;
  startDate: string;
  endDate: string;
};

export type UpdateMenuPeriodRequest = {
  cateringCompanyId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export type MenuDay = {
  id: string;
  menuPeriodId: string;
  menuPeriodName?: string;
  cateringCompanyId: string;
  cateringCompanyName?: string;
  menuDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type CreateMenuDayRequest = {
  menuPeriodId: string;
  menuDate: string;
};

export type UpdateMenuDayRequest = {
  menuPeriodId: string;
  menuDate: string;
  isActive: boolean;
};

export type MenuItem = {
  id: string;
  menuDayId: string;
  menuDate?: string;
  dishId: string;
  dishName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type CreateMenuItemRequest = {
  menuDayId: string;
  dishId: string;
};

export type MenuDayAddon = {
  id: string;
  menuDayId: string;
  menuDate?: string;
  addonId: string;
  addonName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type CreateMenuDayAddonRequest = {
  menuDayId: string;
  addonId: string;
};