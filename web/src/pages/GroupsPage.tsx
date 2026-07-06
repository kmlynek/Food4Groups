import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/apiError';
import { getCateringCompanies } from '../api/cateringCompaniesApi';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../api/groupsApi';
import { GroupForm } from '../components/groups/GroupForm';
import { GroupMembersDialog } from '../components/groups/GroupMembersDialog';
import type { CateringCompany } from '../types/cateringCompanyTypes';
import type { Group } from '../types/groupTypes';

function formatDate(value: string) {
    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [companies, setCompanies] = useState<CateringCompany[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [groupMembers, setGroupMembers] = useState<Group | null>(null);
    const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function loadGroups() {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await getGroups();
            setGroups(data);
        } catch (error) {
            // Komunikat błędu pobierania grup pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać listy grup'));
        } finally {
            setIsLoading(false);
        }
    }

    async function loadCompanies() {
        try {
            const data = await getCateringCompanies();
            setCompanies(data.filter((company) => company.isActive));
        } catch (error) {
            // Komunikat błędu pobierania firm cateringowych pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać listy firm cateringowych'));
        }
    }

    function openCreateForm() {
        setSelectedGroup(null);
        setIsFormOpen(true);
    }

    function openEditForm(group: Group) {
        setSelectedGroup(group);
        setIsFormOpen(true);
    }

    function closeForm() {
        setSelectedGroup(null);
        setIsFormOpen(false);
    }

    async function handleSaveGroup(values: { name: string; cateringCompanyId: string }) {
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            if (selectedGroup) {
                await updateGroup(selectedGroup.id, values);
            } else {
                await createGroup(values);
            }

            closeForm();
            await loadGroups();
        } catch (error) {
            // Komunikat błędu zapisu grupy pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się zapisać grupy'));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDeleteGroup() {
        if (!groupToDelete) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            await deleteGroup(groupToDelete.id);
            setGroupToDelete(null);
            await loadGroups();
        } catch (error) {
            // Komunikat błędu usuwania grupy pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć grupy'));
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        void loadGroups();
        void loadCompanies();
    }, []);

    return (
        <Stack spacing={3}>
            {/* Nagłówek strony opisuje zakres modułu grup */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Grupy
                </Typography>
                <Typography color="text.secondary">
                    Lista grup obsługiwanych w systemie wraz z przypisaną firmą cateringową
                </Typography>
            </Box>

            {/* Pasek akcji dla odświeżenia danych i dodania nowej grupy */}
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    startIcon={<RefreshOutlinedIcon />}
                    onClick={loadGroups}
                    disabled={isLoading}
                >
                    Odśwież
                </Button>

                <Button
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                    onClick={openCreateForm}
                    disabled={companies.length === 0}
                >
                    Dodaj grupę
                </Button>
            </Stack>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            {/* Stan ładowania widoczny podczas pobierania danych z API */}
            {isLoading && (
                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
                            <CircularProgress />
                            <Typography color="text.secondary">Pobieranie grup...</Typography>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Pusty stan dla sytuacji, w której system nie ma jeszcze żadnych grup */}
            {!isLoading && groups.length === 0 && (
                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
                            <GroupsOutlinedIcon color="primary" fontSize="large" />
                            <Typography variant="h6">Brak grup</Typography>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Lista grup pobrana z backendu */}
            {!isLoading && groups.length > 0 && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                        gap: 2,
                    }}
                >
                    {groups.map((group) => (
                        <Card key={group.id} variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', gap: 2 }}>
                                        <Box>
                                            <Typography variant="h6">{group.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {group.cateringCompanyName ?? 'Brak przypisanej firmy'}
                                            </Typography>
                                        </Box>

                                        <Chip color="primary" variant="outlined" label={`Liczba uczestników: ${group.memberCount}`} />
                                    </Stack>

                                    <Typography variant="body2" color="text.secondary">
                                        Utworzono: {formatDate(group.createdAt)}
                                    </Typography>

                                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<PeopleAltOutlinedIcon />}
                                            onClick={() => setGroupMembers(group)}
                                        >
                                            Uczestnicy
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<EditOutlinedIcon />}
                                            onClick={() => openEditForm(group)}
                                        >
                                            Edytuj
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<DeleteOutlineOutlinedIcon />}
                                            onClick={() => setGroupToDelete(group)}
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

            <GroupForm
                open={isFormOpen}
                title={selectedGroup ? 'Edytuj grupę' : 'Dodaj grupę'}
                submitLabel={selectedGroup ? 'Zapisz' : 'Dodaj grupę'}
                isSubmitting={isSubmitting}
                companies={companies}
                initialGroup={selectedGroup}
                onClose={closeForm}
                onSubmit={handleSaveGroup}
            />
            <GroupMembersDialog
                open={Boolean(groupMembers)}
                group={groupMembers}
                onClose={() => setGroupMembers(null)}
                onChanged={async () => {
                    await loadGroups();
                }}
            />
            <Dialog open={Boolean(groupToDelete)} onClose={() => setGroupToDelete(null)}>
                <DialogTitle>Usuń grupę</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Czy na pewno chcesz usunąć <strong>{groupToDelete?.name}</strong>?
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setGroupToDelete(null)} disabled={isSubmitting}>
                        Anuluj
                    </Button>
                    <Button color="error" variant="contained" onClick={handleDeleteGroup} disabled={isSubmitting}>
                        {isSubmitting ? 'Usuwanie...' : 'Usuń'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}