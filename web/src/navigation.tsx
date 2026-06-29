import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import type { ReactNode } from 'react';
import { roles, type UserRole } from './types/authTypes';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

export type NavigationItem = {
  label: string;
  path: string;
  icon: ReactNode;
  allowedRoles: UserRole[];
};

// Główne pozycje menu dostępne po zalogowaniu
export const navigationItems: NavigationItem[] = [
  {
    label: 'Pulpit',
    path: '/dashboard',
    icon: <DashboardOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee, roles.dietitian, roles.groupCoordinator, roles.user],
  },
  {
    label: 'Moje konto',
    path: '/account',
    icon: <AccountCircleOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee, roles.dietitian, roles.groupCoordinator, roles.user],
  },
  {
    label: 'Użytkownicy',
    path: '/users',
    icon: <PeopleAltOutlinedIcon />,
    allowedRoles: [roles.admin, roles.groupCoordinator],
  },
  {
    label: 'Grupy',
    path: '/groups',
    icon: <GroupOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee],
  },
  {
    label: 'Dania',
    path: '/dishes',
    icon: <RestaurantMenuOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee, roles.dietitian, roles.groupCoordinator, roles.user],
  },
  {
    label: 'Menu',
    path: '/menus',
    icon: <MenuBookOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee, roles.dietitian],
  },
  {
    label: 'Zamówienia',
    path: '/orders',
    icon: <ReceiptLongOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee, roles.groupCoordinator, roles.user],
  },
];