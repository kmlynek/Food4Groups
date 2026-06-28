import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
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
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { register } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (password !== confirmPassword) {
            setErrorMessage('Potwierdzone hasło nie jest zgodne');
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                email,
                password,
            });        
            // Po utworzeniu konta użytkownik zostaje od razu zalogowany
            await login(email, password);
            navigate('/dashboard', { replace: true });

        } catch (error) {
            // Komunikat błędu rejestracji pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się utworzyć konta'));
        } finally {
            setIsSubmitting(false);
        }
    }

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
            <Card
                sx={{
                    width: '100%',
                    maxWidth: 460,
                    bgcolor: '#ffffff',
                    border: '1px solid rgba(148, 163, 184, 0.24)',
                }}
            >
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    <Stack spacing={3} sx={{ alignItems: 'stretch' }}>
                        {/* Nagłówek formularza rejestracji nowego klienta */}
                        <Stack spacing={1.5}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <PersonAddAltOutlinedIcon />
                            </Avatar>

                            <Box>
                                <Typography variant="h5">Rejestracja konta</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Nowe konto otrzyma rolę klienta i dostęp po przypisaniu do grupy
                                </Typography>
                            </Box>
                        </Stack>

                        <Divider />

                        {successMessage && <Alert severity="success">{successMessage}</Alert>}
                        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

                        {/* Formularz wysyła dane rejestracji do backendu */}
                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack spacing={2.25}>
                                <TextField
                                    label="Email"
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
                                    autoComplete="new-password"
                                />

                                <TextField
                                    label="Potwierdź hasło"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    required
                                    fullWidth
                                    autoComplete="new-password"
                                />

                                <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                                    {isSubmitting ? 'Tworzenie konta...' : 'Utwórz konto'}
                                </Button>
                            </Stack>
                        </Box>

                        {/* Link powrotu do formularza logowania */}
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            Masz już konto?{' '}
                            <MuiLink component={RouterLink} to="/login" underline="hover">
                                Zaloguj się
                            </MuiLink>
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}