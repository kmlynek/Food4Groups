export type Addon = {
    id: string;
    cateringCompanyId: string;
    cateringCompanyName?: string;
    name: string;
    description?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateAddonRequest = {
    cateringCompanyId: string;
    name: string;
    description?: string;
};

export type UpdateAddonRequest = {
    cateringCompanyId: string;
    name: string;
    description?: string;
    isActive: boolean;
};