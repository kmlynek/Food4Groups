import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/apiError';
import { deleteUser, getUsers } from '../api/usersApi';
import { roleLabels } from '../types/authTypes';
import type { AdminUser } from '../types/userTypes';
import { UserRolesDialog } from '../components/users/UserRolesDialog';

export function UsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
    const [userRolesToEdit, setUserRolesToEdit] = useState<AdminUser | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function loadUsers() {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            // Komunikat błędu pobierania użytkowników pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać listy użytkowników'));
        } finally {
            setIsLoading(false);
        }
    }

    // Aktualizuje stan ról po edycji 
    async function handleUserRolesChanged() {
        const data = await getUsers();
        setUsers(data);

        if (userRolesToEdit) {
            const updatedUser = data.find((user) => user.id === userRolesToEdit.id) ?? null;
            setUserRolesToEdit(updatedUser);
        }
    }

    async function handleDeleteUser() {
        if (!userToDelete) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            await deleteUser(userToDelete.id);
            setUserToDelete(null);
            await loadUsers();
        } catch (error) {
            // Komunikat błędu usuwania użytkownika pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć użytkownika'));
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        void loadUsers();
    }, []);

    return (
        <Stack spacing={3}>
            {/* Nagłówek strony opisuje zakres administracji użytkownikami */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Użytkownicy
                </Typography>
                <Typography color="text.secondary">
                    Lista kont użytkowników oraz przypisanych ról systemowych
                </Typography>
            </Box>

            {/* Pasek akcji dla odświeżenia danych użytkowników */}
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    startIcon={<RefreshOutlinedIcon />}
                    onClick={loadUsers}
                    disabled={isLoading}
                >
                    Odśwież
                </Button>
            </Stack>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            {/* Stan ładowania widoczny podczas pobierania użytkowników */}
            {isLoading && (
                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
                            <CircularProgress />
                            <Typography color="text.secondary">Pobieranie użytkowników...</Typography>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Pusty stan dla sytuacji, w której system nie ma użytkowników */}
            {!isLoading && users.length === 0 && (
                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
                            <ManageAccountsOutlinedIcon color="primary" fontSize="large" />
                            <Typography variant="h6">Brak użytkowników</Typography>                            
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Lista użytkowników pobrana z backendu */}
            {!isLoading && users.length > 0 && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                        gap: 2,
                    }}
                >
                    {users.map((user) => (
                        <Card key={user.id} variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', gap: 2 }}>
                                        <Box>
                                            <Typography variant="h6">{user.email ?? 'Brak adresu email'}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                ID: {user.id}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                        {user.roles.map((role) => (
                                            <Chip key={role} color="primary" variant="outlined" label={roleLabels[role]} />
                                        ))}
                                    </Stack>

                                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<AdminPanelSettingsOutlinedIcon />}
                                            onClick={() => setUserRolesToEdit(user)}
                                        >
                                            Role
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<DeleteOutlineOutlinedIcon />}
                                            onClick={() => setUserToDelete(user)}
                                        >
                                            Usuń
                                        </Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
            <UserRolesDialog
                open={Boolean(userRolesToEdit)}
                user={userRolesToEdit}
                onClose={() => setUserRolesToEdit(null)}
                onChanged={handleUserRolesChanged}
            />
            <Dialog open={Boolean(userToDelete)} onClose={() => setUserToDelete(null)}>
                <DialogTitle>Usuń użytkownika</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Czy na pewno chcesz usunąć <strong>{userToDelete?.email}</strong>? Tej operacji nie można
                        cofnąć.
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setUserToDelete(null)} disabled={isSubmitting}>
                        Anuluj
                    </Button>
                    <Button color="error" variant="contained" onClick={handleDeleteUser} disabled={isSubmitting}>
                        {isSubmitting ? 'Usuwanie...' : 'Usuń'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}