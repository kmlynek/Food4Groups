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
import type { Dish } from '../../types/dishTypes';

type DishFormValues = {
  name: string;
  description?: string;
  cateringCompanyId: string;
  isActive: boolean;
};

type DishFormProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
  canEditStatus: boolean;
  companies: CateringCompany[];
  initialDish?: Dish | null;
  onClose: () => void;
  onSubmit: (values: DishFormValues) => Promise<void>;
};

export function DishForm({
  open,
  title,
  submitLabel,
  isSubmitting,
  canEditStatus,
  companies,
  initialDish,
  onClose,
  onSubmit,
}: DishFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cateringCompanyId, setCateringCompanyId] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) {
      return;
    }

    // Formularz uzupełnia pola podczas edycji albo czyści je przy tworzeniu nowego dania
    setName(initialDish?.name ?? '');
    setDescription(initialDish?.description ?? '');
    setCateringCompanyId(initialDish?.cateringCompanyId ?? companies[0]?.id ?? '');
    setIsActive(initialDish?.isActive ?? true);
  }, [companies, initialDish, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      name,
      description: description.trim() || undefined,
      cateringCompanyId,
      isActive,
    });
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* Podstawowe dane dania widoczne w ofercie i menu */}
            <TextField
              label="Nazwa dania"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Opis (opcjonalnie)"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              fullWidth
              multiline
              minRows={3}
            />

            {/* Firma cateringowa określa właściciela dania i jego późniejsze użycie w menu */}
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

            {/* Status aktywności pozwala ukryć danie przed klientami bez usuwania go z bazy */}
            {canEditStatus && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                  />
                }
                label="Danie aktywne"
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || companies.length === 0}>
            {isSubmitting ? 'Zapisywanie…' : submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
