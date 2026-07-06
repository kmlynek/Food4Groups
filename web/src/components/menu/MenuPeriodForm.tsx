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
import type { CateringCompany } from '../../types/cateringCompanyTypes';
import type { MenuPeriod } from '../../types/menuTypes';

type MenuPeriodFormValues = {
  name: string;
  cateringCompanyId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type MenuPeriodFormProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
  canEditStatus: boolean;
  companies: CateringCompany[];
  initialPeriod?: MenuPeriod | null;
  onClose: () => void;
  onSubmit: (values: MenuPeriodFormValues) => Promise<void>;
};

function toDateInputValue(value?: string) {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

export function MenuPeriodForm({
  open,
  title,
  submitLabel,
  isSubmitting,
  canEditStatus,
  companies,
  initialPeriod,
  onClose,
  onSubmit,
}: MenuPeriodFormProps) {
  const [name, setName] = useState('');
  const [cateringCompanyId, setCateringCompanyId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) {
      return;
    }

    // Formularz uzupełnia pola podczas edycji albo czyści je przy tworzeniu nowego okresu menu
    setName(initialPeriod?.name ?? '');
    setCateringCompanyId(initialPeriod?.cateringCompanyId ?? companies[0]?.id ?? '');
    setStartDate(toDateInputValue(initialPeriod?.startDate));
    setEndDate(toDateInputValue(initialPeriod?.endDate));
    setIsActive(initialPeriod?.isActive ?? true);
  }, [companies, initialPeriod, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      name,
      cateringCompanyId,
      startDate,
      endDate,
      isActive,
    });
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* Podstawowe dane okresu menu widoczne w module planowania */}
            <TextField
              label="Nazwa"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
              autoFocus
            />

            {/* Firma cateringowa określa właściciela menu i powiązanych pozycji */}
            <TextField
              label="Firma cateringowa"
              value={cateringCompanyId}
              onChange={(event) => setCateringCompanyId(event.target.value)}
              required
              fullWidth
              select
              disabled={companies.length === 0}
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Zakres dat ogranicza dni menu tworzone w ramach okresu */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Data od"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />

              <TextField
                label="Data do"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            {/* Status aktywności pozwala ukryć okres menu bez usuwania go z bazy */}
            {canEditStatus && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                  />
                }
                label="Aktywny"
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || companies.length === 0}>
            {isSubmitting ? 'Zapisywanie...' : submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}