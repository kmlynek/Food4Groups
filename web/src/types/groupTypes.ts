export type Group = {
  id: string;
  cateringCompanyId: string;
  cateringCompanyName?: string;
  coordinatorUserId?: string;
  coordinatorEmail?: string;
  name: string;
  memberCount: number;
  createdAt: string;
  updatedAt?: string;
};

export type AvailableGroupCoordinator = {
  id: string;
  email?: string;
};

export type CreateGroupRequest = {
  cateringCompanyId: string;
  name: string;
  coordinatorUserId?: string | null;
};

export type UpdateGroupRequest = {
  cateringCompanyId: string;
  name: string;
  coordinatorUserId?: string | null;
};