import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
  Alert,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { roleLabels, roles, type UserRole } from '../types/authTypes';
import { hasSeededPasswordChanged } from '../utils/securityNoticeStorage';

// Opis elementów UI Pulpitu
type DashboardAction = {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[];
};

const seededAccountEmails = [
  'admin@food4groups.com',
  'catering@food4groups.com',
  'dietitian@food4groups.com',
  'coordinator@food4groups.com',
  'user@food4groups.com',
];

const dashboardActions: DashboardAction[] = [
  {
    title: 'Użytkownicy',
    description: 'Zarządzanie kontami, rolami oraz przypisaniem użytkowników do grup',
    path: '/users',
    icon: <PeopleAltOutlinedIcon />,
    allowedRoles: [roles.admin],
  },
  {
    title: 'Grupy',
    description: 'Obsługa grup żywieniowych, koordynatorów oraz członków grup',
    path: '/groups',
    icon: <GroupOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee],
  },
  {
    title: 'Dania',
    description: 'Katalog dań, informacje dietetyczne oraz dostępność pozycji w ofercie',
    path: '/dishes',
    icon: <RestaurantMenuOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee, roles.dietitian],
  },
  {
    title: 'Menu',
    description: 'Menu dzienne, pakiety oraz przypisanie dań do konkretnych terminów',
    path: '/menus',
    icon: <MenuBookOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee, roles.dietitian],
  },
  {
    title: 'Zamówienia',
    description: 'Składanie zamówień, przegląd realizacji oraz statusy zamówień',
    path: '/orders',
    icon: <AssignmentOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee, roles.groupCoordinator, roles.user],
  },
  {
    title: 'Raporty',
    description: 'Proformy rozliczeniowe oraz dzienne zestawienia zamówień',
    path: '/reports',
    icon: <AssessmentOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee, roles.groupCoordinator],
  },

];

export function DashboardPage() {
  const { auth } = useAuth();
  const userRoles = auth?.user.roles ?? [];

  const availableActions = dashboardActions.filter((action) =>
    action.allowedRoles.some((role) => userRoles.includes(role)),
  );

  const isClient = userRoles.includes(roles.user);

  // Sprawdza czy hasło konta startowego zostało zmienione
  const isSeededAccount = auth?.user.email
    ? seededAccountEmails.includes(auth.user.email.toLowerCase())
    : false;

  const isSeededPasswordChanged = auth?.user.email
    ? hasSeededPasswordChanged(auth.user.email)
    : false;

  const shouldShowSeededAccountAlert = isSeededAccount && !isSeededPasswordChanged;

  return (

    <Stack spacing={3}>
      {/* Nagłówek strony informuje użytkownika, w jakim obszarze aplikacji się znajduje */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Pulpit
        </Typography>
        <Typography color="text.secondary">
          Najważniejsze obszary pracy dostępne dla Twojej roli w systemie
        </Typography>
      </Box>

      {/* Role dostępne w tokenie JWT jako etykiety */}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {userRoles.map((role) => (
          <Chip key={role} color="primary" variant="outlined" label={roleLabels[role]} />
        ))}
      </Stack>
      {/* Informacja o zmianie hasła dla kont startowych tworzonych podczas inicjalizacji systemu */}
      {shouldShowSeededAccountAlert && (
        <Alert
          severity="warning"
          variant="filled"
          sx={{
            mt: 3,
            mb: 2,
            boxShadow: 3,
            fontSize: "1rem",
            alignItems: "center",
          }}
          action={
            <Button component={Link} to="/account" color="inherit" variant="outlined">
              Zmień hasło
            </Button>
          }
        >
          <strong>Ze względów bezpieczeństwa zalecamy zmianę hasła!</strong>
          <br />

        </Alert>
      )}
      {/* Komunikat dla klienta przed przypisaniem do grupy */}
      {isClient && (
        <Card sx={{ borderColor: 'primary.light' }} variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6">Status konta klienta</Typography>
              <Typography color="text.secondary">
                Jeśli konto nie zostało jeszcze przypisane do grupy, dostęp do menu i zamówień
                pojawi się po przypisaniu przez administratora lub koordynatora grupy
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Karty z zakresem funkcji dostępnych dla aktualnego użytkownika */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {availableActions.map((action) => (
          <Card key={action.path} variant="outlined">
            <CardActionArea component={Link} to={action.path} sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: 'rgba(46, 125, 50, 0.10)',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {action.icon}
                  </Box>

                  <Stack spacing={0.5}>
                    <Typography variant="h6">{action.title}</Typography>
                    <Typography color="text.secondary">{action.description}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {/* Sekcja podsumowania najważniejszych obszarów systemu */}
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <SettingsOutlinedIcon color="primary" />
            <Box>
              <Typography variant="h6">Podsumowanie systemu</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}