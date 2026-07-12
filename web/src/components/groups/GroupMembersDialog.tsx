import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
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

function formatDate(value?: string) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function GroupMembersDialog({ open, group, onClose, onChanged }: GroupMembersDialogProps) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [users, setUsers] = useState<AvailableGroupMemberUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<GroupMember | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const groupMembers = useMemo(() => {
    if (!group) {
      return [];
    }

    return members.filter((member) => member.groupId === group.id);
  }, [group, members]);

  const availableUsers = useMemo(() => {
    // Jeden klient może należeć tylko do jednej grupy, więc lista pomija użytkowników przypisanych gdziekolwiek
    const assignedUserIds = new Set(members.map((member) => member.userId));

    return users.filter((user) => !assignedUserIds.has(user.id));
  }, [members, users]);

  const usersForForm = useMemo(() => {
    if (!selectedMember) {
      return availableUsers;
    }

    const selectedUserExists = availableUsers.some((user) => user.id === selectedMember.userId);

    if (selectedUserExists) {
      return availableUsers;
    }

    return [
      ...availableUsers,
      {
        id: selectedMember.userId,
        email: selectedMember.userEmail,
      },
    ];
  }, [availableUsers, selectedMember]);

  async function loadData() {
    if (!group) {
      return;
    }

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
      // Komunikat błędu pobierania uczestników pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać uczestników grupy'));
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
          userId: values.userId,
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
      // Komunikat błędu zapisu uczestnika pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się zapisać uczestnika grupy'));
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
      // Komunikat błędu usuwania uczestnika pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć uczestnika grupy'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setMembers([]);
    setUsers([]);
    setSelectedMember(null);
    setMemberToDelete(null);
    setErrorMessage('');
    onClose();
  }

  useEffect(() => {
    if (open) {
      void loadData();
    }
  }, [open, group]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Uczestnicy grupy</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Box>
            <Typography variant="h6">{group?.name}</Typography>
            <Typography color="text.secondary">
              Uczestnicy grupy mogą składać zamówienia zgodnie z aktywnym pakietem przypisanym do grupy
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={openCreateForm}
              disabled={availableUsers.length === 0}
            >
              Przypisz uczestnika
            </Button>
          </Stack>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {availableUsers.length === 0 && !isLoading && (
            <Alert severity="info" variant="outlined">
              Brak klientów dostępnych do przypisania do grupy
            </Alert>
          )}

          {/* Stan ładowania widoczny podczas pobierania uczestników grupy */}
          {isLoading && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography color="text.secondary">Pobieranie uczestników…</Typography>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Pusty stan dla grupy bez przypisanych uczestników */}
          {!isLoading && groupMembers.length === 0 && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
                  <PeopleAltOutlinedIcon color="primary" fontSize="large" />
                  <Typography variant="h6">Brak uczestników</Typography>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Lista uczestników przypisanych do wybranej grupy */}
          {!isLoading && groupMembers.length > 0 && (
            <Stack spacing={2}>
              {groupMembers.map((member) => (
                <Card key={member.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
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
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Zamknij
        </Button>
      </DialogActions>

      <GroupMemberForm
        open={isFormOpen}
        title={selectedMember ? 'Edytuj uczestnika' : 'Przypisz uczestnika'}
        submitLabel={selectedMember ? 'Zapisz zmiany' : 'Przypisz do grupy'}
        isSubmitting={isSubmitting}
        canEditStatus={Boolean(selectedMember)}
        group={group}
        users={usersForForm}
        initialMember={selectedMember}
        onClose={closeForm}
        onSubmit={handleSaveMember}
      />

      <Dialog open={Boolean(memberToDelete)} onClose={() => setMemberToDelete(null)}>
        <DialogTitle>Usuń uczestnika z grupy</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Usunąć <strong>{memberToDelete?.userEmail}</strong> z grupy <strong>{group?.name}</strong>?
            Konto użytkownika pozostanie w systemie.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setMemberToDelete(null)} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button color="error" variant="contained" onClick={handleDeleteMember} disabled={isSubmitting}>
            {isSubmitting ? 'Usuwanie…' : 'Usuń z grupy'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
