import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { type FormEvent, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { roleLabels } from '../types/authTypes';
import { changePassword } from '../api/authApi';
import { getApiErrorMessage } from '../api/apiError';
import { markSeededPasswordChanged } from '../utils/securityNoticeStorage';

export function AccountPage() {
    const { auth } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (newPassword !== confirmNewPassword) {
            setErrorMessage('Potwierdzenie hasła nie jest zgodne z nowym hasłem');
            return;
        }

        if (currentPassword === newPassword) {
            setErrorMessage('Nowe hasło musi różnić się od obecnego hasła');
            return;
        }

        setIsSubmitting(true);

        try {
            await changePassword({
                currentPassword,
                newPassword,
            });

            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');

            if (auth?.user.email) {
                markSeededPasswordChanged(auth.user.email);
            }
            
            setSuccessMessage('Hasło zostało zmienione');
        } catch (error) {
            // Komunikat błędu zmiany hasła pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się zmienić hasła'));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Stack spacing={3}>
            {/* Nagłówek strony konta użytkownika */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Moje konto
                </Typography>
                <Typography color="text.secondary">
                    Dane konta i zmiana hasła
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.1fr' },
                    gap: 3,
                }}
            >
                {/* Dane użytkownika wynikające z aktualnego tokenu JWT */}
                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={2.5}>
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                <PersonOutlineOutlinedIcon color="primary" />
                                <Typography variant="h6">Dane użytkownika</Typography>
                            </Stack>

                            <Divider />

                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Adres e-mail
                                    </Typography>
                                    <Typography>{auth?.user.email}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Role
                                    </Typography>
                                    <Typography>
                                        {auth?.user.roles.map((role) => roleLabels[role]).join(', ')}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Formularz zmiany hasła dla zalogowanego użytkownika */}
                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={2.5}>
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                <LockResetOutlinedIcon color="primary" />
                                <Typography variant="h6">Zmiana hasła</Typography>
                            </Stack>

                            <Divider />

                            {successMessage && <Alert severity="success">{successMessage}</Alert>}
                            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

                            <Box component="form" onSubmit={handlePasswordChange}>
                                <Stack spacing={2}>
                                    <TextField
                                        label="Obecne hasło"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(event) => setCurrentPassword(event.target.value)}
                                        required
                                        fullWidth
                                        autoComplete="current-password"
                                    />

                                    <TextField
                                        label="Nowe hasło"
                                        type="password"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        required
                                        fullWidth
                                        autoComplete="new-password"
                                    />

                                    <TextField
                                        label="Potwierdź nowe hasło"
                                        type="password"
                                        value={confirmNewPassword}
                                        onChange={(event) => setConfirmNewPassword(event.target.value)}
                                        required
                                        fullWidth
                                        autoComplete="new-password"
                                    />

                                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                                        {isSubmitting ? 'Zapisywanie…' : 'Zmień hasło'}
                                    </Button>
                                </Stack>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Stack>
    );
}
