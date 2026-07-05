import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
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
import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../../api/apiError';
import {
    createGroupMember,
    deleteGroupMember,
    getAvailableGroupMemberUsers,
    getGroupMembers,
    updateGroupMember,
} from '../../api/groupMembersApi';
import type { AvailableGroupMemberUser, GroupMember } from '../../types/groupMemberTypes';
import type { Group } from '../../types/groupTypes';
import { GroupMemberForm } from './GroupMemberForm';

type GroupMembersDialogProps = {
    open: boolean;
    group: Group | null;
    onClose: () => void;
    onChanged: () => Promise<void>;
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function GroupMembersDialog({ open, group, onClose, onChanged }: GroupMembersDialogProps) {
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [users, setUsers] = useState<AvailableGroupMemberUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<GroupMember | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const groupMembers = useMemo(() => {
        if (!group) {
            return [];
        }

        return members.filter((member) => member.groupId === group.id);
    }, [group, members]);

    // Jeden klient może należeć tylko do jednej grupy, więc lista pomija użytkowników przypisanych gdziekolwiek
    const availableUsers = useMemo(() => {
        const assignedUserIds = new Set(members.map((member) => member.userId));
        return users.filter((user) => !assignedUserIds.has(user.id));
    }, [members, users]);

    async function loadData() {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const [membersData, usersData] = await Promise.all([
                getGroupMembers(),
                getAvailableGroupMemberUsers(),
            ]);

            setMembers(membersData);
            setUsers(usersData);
        } catch (error) {
            // Komunikat błędu pobierania członków grupy pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać członków grupy'));
        } finally {
            setIsLoading(false);
        }
    }

    function openCreateForm() {
        setSelectedMember(null);
        setIsFormOpen(true);
    }

    function openEditForm(member: GroupMember) {
        setSelectedMember(member);
        setIsFormOpen(true);
    }

    function closeForm() {
        setSelectedMember(null);
        setIsFormOpen(false);
    }

    async function handleSaveMember(values: { userId: string; isActive: boolean }) {
        if (!group) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            if (selectedMember) {
                await updateGroupMember(selectedMember.id, {
                    groupId: group.id,
                    userId: selectedMember.userId,
                    isActive: values.isActive,
                });
            } else {
                await createGroupMember({
                    groupId: group.id,
                    userId: values.userId,
                });
            }

            closeForm();
            await loadData();
            await onChanged();
        } catch (error) {
            // Komunikat błędu zapisu członkostwa pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się zapisać członkostwa'));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDeleteMember() {
        if (!memberToDelete) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            await deleteGroupMember(memberToDelete.id);
            setMemberToDelete(null);
            await loadData();
            await onChanged();
        } catch (error) {
            // Komunikat błędu usuwania członkostwa pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć członkostwa'));
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (open) {
            void loadData();
        }
    }, [open]);

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle>Uczestnicy: {group?.name}</DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

                        {/* Pasek akcji dla odświeżenia i dodania członka grupy */}
                        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshOutlinedIcon />}
                                onClick={loadData}
                                disabled={isLoading}
                            >
                                Odśwież
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<AddOutlinedIcon />}
                                onClick={openCreateForm}
                                disabled={!group || availableUsers.length === 0}
                            >
                                Dodaj uczestnika
                            </Button>
                        </Stack>

                        {/* Stan ładowania członków grupy */}
                        {isLoading && (
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
                                        <CircularProgress />
                                        <Typography color="text.secondary">Pobieranie członków grupy...</Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pusty stan dla grupy bez przypisanych członków */}
                        {!isLoading && groupMembers.length === 0 && (
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
                                        <GroupsOutlinedIcon color="primary" fontSize="large" />
                                        <Typography variant="h6">Brak uczestników grupy</Typography>
                                        <Typography color="text.secondary">
                                            Po dodaniu zostaną wyświetleni uczestnicy
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {/* Lista członków przypisanych do wybranej grupy */}
                        {!isLoading && groupMembers.length > 0 && (
                            <Stack spacing={1.5}>
                                {groupMembers.map((member) => (
                                    <Box
                                        key={member.id}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            p: 2,
                                        }}
                                    >
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', gap: 2 }}>
                                                <Box>
                                                    <Typography variant="h6">{member.userEmail}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Dołączono: {formatDate(member.joinedAt)}
                                                    </Typography>
                                                </Box>

                                                <Chip
                                                    color={member.isActive ? 'success' : 'default'}
                                                    variant="outlined"
                                                    label={member.isActive ? 'Aktywny' : 'Nieaktywny'}
                                                />
                                            </Stack>

                                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<EditOutlinedIcon />}
                                                    onClick={() => openEditForm(member)}
                                                >
                                                    Edytuj
                                                </Button>

                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    startIcon={<DeleteOutlineOutlinedIcon />}
                                                    onClick={() => setMemberToDelete(member)}
                                                >
                                                    Usuń
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={onClose} disabled={isSubmitting}>
                        Zamknij
                    </Button>
                </DialogActions>
            </Dialog>

            <GroupMemberForm
                open={isFormOpen}
                title={selectedMember ? 'Edytuj' : 'Dodaj'}
                submitLabel={selectedMember ? 'Zapisz' : 'Dodaj'}
                isSubmitting={isSubmitting}
                canEditStatus={Boolean(selectedMember)}
                group={group}
                users={selectedMember ? users : availableUsers}
                initialMember={selectedMember}
                onClose={closeForm}
                onSubmit={handleSaveMember}
            />

            <Dialog open={Boolean(memberToDelete)} onClose={() => setMemberToDelete(null)}>
                <DialogTitle>Usuń członkostwo</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Czy na pewno chcesz usunąć <strong>{memberToDelete?.userEmail}</strong> z grupy?
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setMemberToDelete(null)} disabled={isSubmitting}>
                        Anuluj
                    </Button>
                    <Button color="error" variant="contained" onClick={handleDeleteMember} disabled={isSubmitting}>
                        {isSubmitting ? 'Usuwanie...' : 'Usuń'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}