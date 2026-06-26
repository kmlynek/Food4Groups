export const roles = {
  admin: 'Admin',
  cateringEmployee: 'CateringEmployee',
  dietitian: 'Dietitian',
  groupCoordinator: 'GroupCoordinator',
  user: 'User',
} as const;

export const roleLabels: Record<UserRole, string> = {
  [roles.admin]: 'Administrator',
  [roles.cateringEmployee]: 'Pracownik cateringu',
  [roles.dietitian]: 'Dietetyk',
  [roles.groupCoordinator]: 'Koordynator grupy',
  [roles.user]: 'Klient',
};

export type UserRole = (typeof roles)[keyof typeof roles];

export const allRoles = Object.values(roles);

export type AuthUser = {
  email: string;
  roles: UserRole[];
};

export type AuthState = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  expiresAt: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};