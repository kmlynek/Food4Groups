import { allRoles, type AuthUser, type UserRole } from '../types/authTypes';

const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const emailClaim = 'email';

type JwtPayload = {
  [roleClaim]?: string | string[];
  [emailClaim]?: string;
};

// Backend zapisuje role w tokenie JWT jako claim .NET
// Ten helper odczytuje email i role użytkownika po zalogowaniu
export function getUserFromToken(token: string): AuthUser {
  const payload = decodePayload(token);
  const rawRoles = payload[roleClaim];
  const roleValues = Array.isArray(rawRoles) ? rawRoles : rawRoles ? [rawRoles] : [];
  const roles = roleValues.filter((role): role is UserRole => allRoles.includes(role as UserRole));

  return {
    email: payload[emailClaim] ?? '',
    roles,
  };
}

function decodePayload(token: string): JwtPayload {
  const payloadPart = token.split('.')[1];

  if (!payloadPart) {
    return {};
  }

  const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
  const json = window.atob(base64);

  return JSON.parse(json) as JwtPayload;
}