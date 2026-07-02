export type PackageDishAssignment = {
  id: string;
  packageId: string;
  packageName?: string;
  dishId: string;
  dishName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type PackageAddonAssignment = {
  id: string;
  packageId: string;
  packageName?: string;
  addonId: string;
  addonName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type CreatePackageDishAssignmentRequest = {
  packageId: string;
  dishId: string;
};

export type CreatePackageAddonAssignmentRequest = {
  packageId: string;
  addonId: string;
};