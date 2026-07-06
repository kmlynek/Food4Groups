import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { type FormEvent, useEffect, useState } from 'react';
import type { MenuDay, MenuPeriod } from '../../types/menuTypes';

type MenuDayFormValues = {
  menuDate: string;
  isActive: boolean;
};

type MenuDayFormProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
  canEditStatus: boolean;
  menuPeriod: MenuPeriod | null;
  initialDay?: MenuDay | null;
  onClose: () => void;
  onSubmit: (values: MenuDayFormValues) => Promise<void>;
};

function toDateInputValue(value?: string) {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

export function MenuDayForm({
  open,
  title,
  submitLabel,
  isSubmitting,
  canEditStatus,
  menuPeriod,
  initialDay,
  onClose,
  onSubmit,
}: MenuDayFormProps) {
  const [menuDate, setMenuDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) {
      return;
    }

    // Formularz uzupełnia datę podczas edycji albo czyści ją przy tworzeniu nowego dnia menu
    setMenuDate(toDateInputValue(initialDay?.menuDate));
    setIsActive(initialDay?.isActive ?? true);
  }, [initialDay, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      menuDate,
      isActive,
    });
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* Data dnia menu musi mieścić się w zakresie wybranego okresu menu */}
            <TextField
              label="Data menu"
              type="date"
              value={menuDate}
              onChange={(event) => setMenuDate(event.target.value)}
              required
              fullWidth
              autoFocus
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                  min: toDateInputValue(menuPeriod?.startDate),
                  max: toDateInputValue(menuPeriod?.endDate),
                },
              }}
            />

            {/* Status aktywności pozwala ukryć dzień menu bez usuwania go z bazy */}
            {canEditStatus && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                  />
                }
                label="Dzień menu aktywny"
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || !menuPeriod}>
            {isSubmitting ? 'Zapisywanie...' : submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}