import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { type FormEvent, useState } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../api/apiError';

// Lista atutów aplikacji wyświetlana po lewej stronie ekranu logowania
const businessHighlights = [
  {
    icon: GroupsIcon,
    title: 'Obsługa wielu ról',
    description: 'Administratorzy, firmy cateringowe, dietetycy, koordynatorzy i klienci w jednym spójnym środowisku',
  },
  {
    icon: RestaurantMenuIcon,
    title: 'Łatwe zarządzanie menu',
    description: 'Twórz odpowiednie pakiety menu, edytuj dania i dodatki na każdy dzień',
  },
  {
    icon: CheckCircleOutlinedIcon,
    title: 'Obsługa zamówień grupowych',
    description: 'System wspiera składanie, przeglądanie i obsługę zamówień dla grup',
  },
];

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/dashboard';

  // Zalogowany użytkownik nie powinien wracać do formularza logowania
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Obsługa formularza logowania i przekierowania po poprawnym zalogowaniu
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      // Komunikat błędu logowania pochodzi z odpowiedzi backendu
      setErrorMessage(
        getApiErrorMessage(error, 'Nie udało się zalogować. Sprawdź adres e-mail i hasło.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Ekran logowania składa się z lewej sekcji informacyjnej i prawej sekcji formularza
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#07120d',
        color: '#f8fafc',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1180,
          minHeight: { md: 640 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
          overflow: 'hidden',
          border: '1px solid rgba(148, 163, 184, 0.22)',
          borderRadius: 3,
          bgcolor: '#0b1510',
        }}
      >
        {/* Lewa sekcja z opisem zastosowania systemu */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 6,
            background:
              'linear-gradient(135deg, rgba(4, 120, 87, 0.26), rgba(7, 18, 13, 0.96) 58%), radial-gradient(circle at top left, rgba(34, 197, 94, 0.28), transparent 36%)',
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: '#10b981', color: '#052e16' }}>
                <RestaurantMenuIcon />
              </Avatar>
              <Typography variant="h5">Food4Groups</Typography>
            </Stack>

            <Typography variant="h4" sx={{ maxWidth: 520, lineHeight: 1.15 }}>
              System do organizacji posiłków dla grup
            </Typography>

            <Typography sx={{ maxWidth: 560, color: '#cbd5d1' }}>
              Wszystko, czego potrzebujesz do zarządzania ofertą, menu, grupami i zamówieniami.
            </Typography>
          </Stack>

          {/* Lista głównych obszarów, które system wspiera biznesowo */}
          <Stack spacing={3}>
            {businessHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <Stack key={item.title} direction="row" spacing={2}>
                  <Avatar sx={{ width: 38, height: 38, bgcolor: 'rgba(16, 185, 129, 0.14)', color: '#86efac' }}>
                    <Icon fontSize="small" />
                  </Avatar>

                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#a7b7af', maxWidth: 520 }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </Box>

        {/* Prawa sekcja z formularzem logowania */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2, sm: 4, md: 6 },
            bgcolor: { xs: '#07120d', md: 'rgba(2, 6, 4, 0.4)' },
          }}
        >
          <Card
            sx={{
              width: '100%',
              maxWidth: 430,
              bgcolor: '#ffffff',
              border: '1px solid rgba(148, 163, 184, 0.24)',
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack spacing={3} sx={{ alignItems: 'stretch' }}>
                <Stack spacing={1.5}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <LockOutlinedIcon />
                  </Avatar>

                  <Box>
                    <Typography variant="h5">Zaloguj się</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dostęp wyłącznie dla uprawnionych użytkowników systemu
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                {error && <Alert severity="error">{error}</Alert>}

                {/* Formularz wysyła dane logowania do backendu przez AuthContext */}
                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2.25}>
                    <TextField
                      label="Adres e-mail"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      fullWidth
                      autoComplete="email"
                    />

                    <TextField
                      label="Hasło"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      fullWidth
                      autoComplete="current-password"
                    />

                    <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                      {isSubmitting ? 'Logowanie…' : 'Zaloguj'}
                    </Button>
                  </Stack>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Nie masz konta?{' '}
                  <MuiLink component={RouterLink} to="/register" underline="hover">
                    Zarejestruj się
                  </MuiLink>
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', color: 'text.secondary' }}>
                  {/* Link do rejestracji nowego konta klienta */}

                  <VerifiedUserIcon color="success" fontSize="small" />

                  <Typography variant="caption">
                    Po zalogowaniu zobaczysz dostępne funkcje
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
