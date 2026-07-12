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
import type { GroupPackageAssignment } from '../../types/groupPackageAssignmentTypes';
import type { Group } from '../../types/groupTypes';
import type { Package as CateringPackage } from '../../types/packageTypes';

type GroupPackageAssignmentFormValues = {
  packageId: string;
  activeFrom: string;
  activeTo?: string | null;
  isActive: boolean;
};

type GroupPackageAssignmentFormProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
  group: Group | null;
  packages: CateringPackage[];
  initialAssignment?: GroupPackageAssignment | null;
  onClose: () => void;
  onSubmit: (values: GroupPackageAssignmentFormValues) => Promise<void>;
};

function toDateInputValue(value?: string) {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

function getTodayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function GroupPackageAssignmentForm({
  open,
  title,
  submitLabel,
  isSubmitting,
  group,
  packages,
  initialAssignment,
  onClose,
  onSubmit,
}: GroupPackageAssignmentFormProps) {
  const [packageId, setPackageId] = useState('');
  const [activeFrom, setActiveFrom] = useState('');
  const [activeTo, setActiveTo] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) {
      return;
    }

    // Formularz uzupełnia zakres przypisania podczas edycji albo wybiera pierwszy dostępny pakiet przy tworzeniu
    setPackageId(initialAssignment?.packageId ?? packages[0]?.id ?? '');
    setActiveFrom(toDateInputValue(initialAssignment?.activeFrom) || getTodayDateInputValue());
    setActiveTo(toDateInputValue(initialAssignment?.activeTo));
    setIsActive(initialAssignment?.isActive ?? true);
  }, [initialAssignment, open, packages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      packageId,
      activeFrom,
      activeTo: activeTo || null,
      isActive,
    });
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* Grupa wyznacza firmę cateringową, dla której można wybrać pakiet */}
            <TextField label="Grupa" value={group?.name ?? ''} fullWidth disabled />

            {/* Pakiet określa listę dań i dodatków dostępnych później w zamówieniach klientów */}
            <TextField
              label="Pakiet"
              value={packageId}
              onChange={(event) => setPackageId(event.target.value)}
              required
              fullWidth
              select
              disabled={packages.length === 0 || isSubmitting}
            >
              {packages.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Zakres dat wskazuje, kiedy pakiet obowiązuje dla wybranej grupy */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Obowiązuje od"
                type="date"
                value={activeFrom}
                onChange={(event) => setActiveFrom(event.target.value)}
                required
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />

              <TextField
                label="Obowiązuje do (opcjonalnie)"
                type="date"
                value={activeTo}
                onChange={(event) => setActiveTo(event.target.value)}
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { min: activeFrom },
                }}
              />
            </Stack>

            {/* Status pozwala zakończyć obowiązywanie przypisania bez usuwania historii */}
            {initialAssignment && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                  />
                }
                label="Przypisanie aktywne"
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || !group || !packageId || !activeFrom}>
            {isSubmitting ? 'Zapisywanie…' : submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
