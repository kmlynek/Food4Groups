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
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../api/apiError';
import { deleteUser, getUsers } from '../api/usersApi';
import { allRoles, roleLabels, type UserRole } from '../types/authTypes';
import type { AdminUser } from '../types/userTypes';
import { UserRolesDialog } from '../components/users/UserRolesDialog';

type UsersSortOption = 'emailAsc' | 'emailDesc';

export function UsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
    const [userRolesToEdit, setUserRolesToEdit] = useState<AdminUser | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchText, setSearchText] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
    const [sortOption, setSortOption] = useState<UsersSortOption>('emailAsc');

    const filteredUsers = useMemo(() => {
        const normalizedSearchText = searchText.trim().toLowerCase();

        return users
            .filter((user) => {
                const matchesSearchText =
                    normalizedSearchText.length === 0 ||
                    (user.email ?? '').toLowerCase().includes(normalizedSearchText);

                const matchesRole =
                    !selectedRole || user.roles.includes(selectedRole);

                return matchesSearchText && matchesRole;
            })
            .sort((firstUser, secondUser) => {
                const firstEmail = firstUser.email ?? '';
                const secondEmail = secondUser.email ?? '';

                return sortOption === 'emailAsc'
                    ? firstEmail.localeCompare(secondEmail)
                    : secondEmail.localeCompare(firstEmail);
            });
    }, [searchText, selectedRole, sortOption, users]);


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

            {/* Filtry listy użytkowników działają lokalnie na danych pobranych z backendu */}
            {!isLoading && users.length > 0 && (
                <Card variant="outlined">
                    <CardContent>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
                                gap: 2,
                            }}
                        >
                            <TextField
                                label="Szukaj użytkownika"
                                value={searchText}
                                onChange={(event) => setSearchText(event.target.value)}
                                placeholder="Email użytkownika"
                                fullWidth
                            />

                            <TextField
                                label="Rola"
                                value={selectedRole}
                                onChange={(event) => setSelectedRole(event.target.value as UserRole | '')}
                                select
                                fullWidth
                            >
                                <MenuItem value="">Wszystkie role</MenuItem>
                                {allRoles.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {roleLabels[role]}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Sortowanie"
                                value={sortOption}
                                onChange={(event) => setSortOption(event.target.value as UsersSortOption)}
                                select
                                fullWidth
                            >
                                <MenuItem value="emailAsc">Email A-Z</MenuItem>
                                <MenuItem value="emailDesc">Email Z-A</MenuItem>
                            </TextField>
                        </Box>
                    </CardContent>
                </Card>
            )}

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

            {/* Pusty stan dla aktywnych filtrów */}
            {!isLoading && users.length > 0 && filteredUsers.length === 0 && (
                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
                            <ManageAccountsOutlinedIcon color="primary" fontSize="large" />
                            <Typography variant="h6">Brak wyników</Typography>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Lista użytkowników pobrana z backendu */}
            {!isLoading && filteredUsers.length > 0 && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                        gap: 2,
                    }}
                >
                    {filteredUsers.map((user) => (
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
                        Czy na pewno chcesz usunąć <strong>{userToDelete?.email}</strong>?
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