export type Package = {
  id: string;
  cateringCompanyId: string;
  cateringCompanyName?: string;
  name: string;
  pricePerPerson: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type CreatePackageRequest = {
  cateringCompanyId: string;
  name: string;
  pricePerPerson: number;
};

export type UpdatePackageRequest = {
  cateringCompanyId: string;
  name: string;
  pricePerPerson: number;
  isActive: boolean;
};