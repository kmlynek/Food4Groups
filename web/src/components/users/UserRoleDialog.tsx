import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../api/apiError';
import { setUserRole } from '../../api/usersApi';
import { allRoles, roleLabels, type UserRole } from '../../types/authTypes';
import type { AdminUser } from '../../types/userTypes';

type UserRoleDialogProps = {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onChanged: () => Promise<void>;
};

export function UserRoleDialog({ open, user, onClose, onChanged }: UserRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open || !user) {
      return;
    }

    // Starsze konto z kilkoma rolami wymaga świadomego wskazania jednej roli
    setSelectedRole(user.roles.length === 1 ? user.roles[0] : '');
    setErrorMessage('');
  }, [open, user]);

  const hasUnchangedRole =
    user?.roles.length === 1 && user.roles[0] === selectedRole;

  async function handleSaveRole() {
    if (!user || !selectedRole) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await setUserRole(user.id, { roleName: selectedRole });
      await onChanged();
      handleClose();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się zmienić roli'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setSelectedRole('');
    setErrorMessage('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Zmień rolę użytkownika</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {user && user.roles.length > 1 && (
            <Alert severity="warning">
              Konto ma obecnie kilka ról. Wybierz rolę, która ma pozostać
            </Alert>
          )}

          {user && user.roles.length === 0 && (
            <Alert severity="warning">
              Konto nie ma przypisanej roli. Wybierz rolę, aby przywrócić dostęp do systemu
            </Alert>
          )}

          {/* Dane konta, którego rola jest aktualnie edytowana */}
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Użytkownik
            </Typography>
            <Typography variant="h6">{user?.email}</Typography>
          </Stack>

          {/* Jedna rola określa zakres funkcji dostępnych dla użytkownika */}
          <TextField
            label="Rola"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value as UserRole)}
            helperText="Rola określa dostępne funkcje systemu"
            select
            fullWidth
            disabled={isSubmitting}
          >
            {allRoles.map((role) => (
              <MenuItem key={role} value={role}>
                {roleLabels[role]}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Anuluj
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveRole}
          disabled={!selectedRole || hasUnchangedRole || isSubmitting}
        >
          {isSubmitting ? 'Zapisywanie…' : 'Zapisz zmiany'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
