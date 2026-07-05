import type { UserRole } from './authTypes';

export type AdminUser = {
  id: string;
  email?: string;
  roles: UserRole[];
};

export type AssignUserRoleRequest = {
  roleName: UserRole;
};