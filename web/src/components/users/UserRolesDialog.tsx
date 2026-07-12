import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { getApiErrorMessage } from '../../api/apiError';
import { assignUserRole, removeUserRole } from '../../api/usersApi';
import { allRoles, roleLabels, type UserRole } from '../../types/authTypes';
import type { AdminUser } from '../../types/userTypes';

type UserRolesDialogProps = {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onChanged: () => Promise<void>;
};

export function UserRolesDialog({ open, user, onClose, onChanged }: UserRolesDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const availableRoles = useMemo(() => {
    if (!user) {
      return [];
    }

    return allRoles.filter((role) => !user.roles.includes(role));
  }, [user]);

  async function handleAssignRole() {
    if (!user || !selectedRole) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await assignUserRole(user.id, {
        roleName: selectedRole,
      });

      setSelectedRole('');
      await onChanged();
    } catch (error) {
      // Komunikat błędu przypisania roli pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się przypisać roli'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveRole(role: UserRole) {
    if (!user) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await removeUserRole(user.id, role);
      await onChanged();
    } catch (error) {
      // Komunikat błędu usunięcia roli pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć roli'));
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
      <DialogTitle>Role użytkownika</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {/* Dane konta, którego role są aktualnie edytowane */}
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Użytkownik
            </Typography>
            <Typography variant="h6">{user?.email}</Typography>
          </Stack>

          {/* Aktualne role użytkownika z możliwością usunięcia */}
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Aktualne role
            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {user?.roles.map((role) => (
                <Chip
                  key={role}
                  color="primary"
                  variant="outlined"
                  label={roleLabels[role]}
                  onDelete={() => handleRemoveRole(role)}
                  deleteIcon={<DeleteOutlineOutlinedIcon />}
                />
              ))}
            </Stack>
          </Stack>

          {/* Przypisanie nowej roli spośród ról, których użytkownik jeszcze nie posiada */}
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Rola do przypisania"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as UserRole)}
              select
              fullWidth
              disabled={availableRoles.length === 0 || isSubmitting}
            >
              {availableRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {roleLabels[role]}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={handleAssignRole}
              disabled={!selectedRole || isSubmitting}
            >
              Przypisz rolę
            </Button>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
}
