export type Dish = {
  id: string;
  cateringCompanyId: string;
  cateringCompanyName?: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type CreateDishRequest = {
  cateringCompanyId: string;
  name: string;
  description?: string;
};

export type UpdateDishRequest = {
  cateringCompanyId: string;
  name: string;
  description?: string;
  isActive: boolean;
};