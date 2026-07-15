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
import type { Package } from '../../types/packageTypes';

type PackageFormValues = {
  name: string;
  cateringCompanyId: string;
  pricePerPerson: number;
  isActive: boolean;
};

type PackageFormProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
  canEditStatus: boolean;
  companies: CateringCompany[];
  initialPackage?: Package | null;
  onClose: () => void;
  onSubmit: (values: PackageFormValues) => Promise<void>;
};

export function PackageForm({
  open,
  title,
  submitLabel,
  isSubmitting,
  canEditStatus,
  companies,
  initialPackage,
  onClose,
  onSubmit,
}: PackageFormProps) {
  const [name, setName] = useState('');
  const [cateringCompanyId, setCateringCompanyId] = useState('');
  const [pricePerPerson, setPricePerPerson] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) {
      return;
    }

    // Formularz uzupełnia pola podczas edycji albo czyści je przy tworzeniu nowego pakietu
    setName(initialPackage?.name ?? '');
    setCateringCompanyId(initialPackage?.cateringCompanyId ?? companies[0]?.id ?? '');
    setPricePerPerson(initialPackage ? String(initialPackage.pricePerPerson) : '');
    setIsActive(initialPackage?.isActive ?? true);
  }, [companies, initialPackage, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      name,
      cateringCompanyId,
      pricePerPerson: Number(pricePerPerson),
      isActive,
    });
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* Podstawowe dane pakietu widoczne w ofercie */}
            <TextField
              label="Nazwa pakietu"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
              autoFocus
            />

            {/* Firma cateringowa określa właściciela pakietu i jego późniejsze przypisanie do grup */}
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

            {/* Cena za osobę dziennie jest wykorzystywana później przy rozliczeniach i zamówieniach */}
            <TextField
              label="Cena za osobę dziennie"
              type="number"
              value={pricePerPerson}
              onChange={(event) => setPricePerPerson(event.target.value)}
              required
              fullWidth
              slotProps={{
                htmlInput: { min: 0, step: '0.01' },
              }}
            />

            {/* Status aktywności pozwala ukryć pakiet bez usuwania go z bazy */}
            {canEditStatus && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                  />
                }
                label="Pakiet aktywny"
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
