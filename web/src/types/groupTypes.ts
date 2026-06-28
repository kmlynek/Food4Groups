export type Group = {
  id: string;
  cateringCompanyId: string;
  cateringCompanyName?: string;
  name: string;
  memberCount: number;
  createdAt: string;
  updatedAt?: string;
};

export type CreateGroupRequest = {
  cateringCompanyId: string;
  name: string;
};

export type UpdateGroupRequest = {
  cateringCompanyId: string;
  name: string;
};