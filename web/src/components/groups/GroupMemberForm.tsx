import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { type FormEvent, useEffect, useState } from 'react';
import type { AvailableGroupMemberUser, GroupMember } from '../../types/groupMemberTypes';
import type { Group } from '../../types/groupTypes';

type GroupMemberFormValues = {
  userId: string;
  isActive: boolean;
};

type GroupMemberFormProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
  canEditStatus: boolean;
  group: Group | null;
  users: AvailableGroupMemberUser[];
  initialMember?: GroupMember | null;
  onClose: () => void;
  onSubmit: (values: GroupMemberFormValues) => Promise<void>;
};

export function GroupMemberForm({
  open,
  title,
  submitLabel,
  isSubmitting,
  canEditStatus,
  group,
  users,
  initialMember,
  onClose,
  onSubmit,
}: GroupMemberFormProps) {
  const [userId, setUserId] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) {
      return;
    }

    // Formularz uzupełnia użytkownika podczas edycji albo wybiera pierwsze dostępne konto przy tworzeniu
    setUserId(initialMember?.userId ?? users[0]?.id ?? '');
    setIsActive(initialMember?.isActive ?? true);
  }, [initialMember, open, users]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      userId,
      isActive,
    });
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* Kontekst grupy, do której przypisywany jest użytkownik */}
            <TextField label="Grupa" value={group?.name ?? ''} fullWidth disabled />

            {/* Konto użytkownika przypisywane do grupy */}
            <TextField
              label="Klient"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              required
              fullWidth
              select
              disabled={users.length === 0 || Boolean(initialMember)}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.email}
                </MenuItem>
              ))}
            </TextField>

            {/* Status aktywności pozwala czasowo wyłączyć członkostwo bez usuwania historii */}
            {canEditStatus && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                  />
                }
                label="Uczestnictwo aktywne"
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || !group || !userId}>
            {isSubmitting ? 'Zapisywanie…' : submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
