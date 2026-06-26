export const roles = {
  admin: 'Admin',
  cateringEmployee: 'CateringEmployee',
  dietitian: 'Dietitian',
  groupCoordinator: 'GroupCoordinator',
  user: 'User',
} as const;

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