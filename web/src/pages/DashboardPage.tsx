import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { roleLabels, roles, type UserRole } from '../types/authTypes';

const roleDescriptions: Record<UserRole, { title: string; items: string[] }> = {
  [roles.admin]: {
    title: 'Administracja',
    items: ['Użytkownicy i role', 'Firmy cateringowe', 'Grupy', 'Pełny podgląd systemu'],
  },
  [roles.cateringEmployee]: {
    title: 'Obsługa cateringu',
    items: ['Pakiety', 'Menu', 'Zamówienia', 'Raporty i wydruki'],
  },
  [roles.dietitian]: {
    title: 'Dietetyk',
    items: ['Dania', 'Dodatki', 'Menu', 'Powiązania oferty'],
  },
  [roles.groupCoordinator]: {
    title: 'Koordynator grupy',
    items: ['Członkowie grupy', 'Przegląd zamówień', 'Informacje organizacyjne grupy'],
  },
  [roles.user]: {
    title: 'Użytkownik',
    items: ['Nowe zamówienie', 'Moje zamówienia', 'Dostępne dania i dodatki'],
  },
};

export function DashboardPage() {
  const { auth } = useAuth();
  const userRoles = auth?.user.roles ?? [];

  return (
    <Stack spacing={3}>
      {/* Nagłówek strony informuje użytkownika, w jakim obszarze aplikacji się znajduje */}
      <Box>
        <Typography variant="h4">Panel operacyjny</Typography>
        <Typography color="text.secondary">
          Najważniejsze obszary pracy dostępne dla Twojej roli w systemie
        </Typography>
      </Box>

      {/* Role z tokenu JWT pokazujemy jako czytelne etykiety */}
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {userRoles.map((role) => (
          <Chip key={role} color="primary" label={roleLabels[role]} />
        ))}
      </Stack>

      {/* Karty pokazują zakres funkcji dostępnych dla aktualnego użytkownika */}
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
        {userRoles.map((role) => (
          <Box key={role}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">{roleDescriptions[role].title}</Typography>

                  <Stack spacing={1}>
                    {roleDescriptions[role].items.map((item) => (
                      <Typography key={item} variant="body2" color="text.secondary">
                        {item}
                      </Typography>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}