import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { type FormEvent, useState } from 'react';
import type { OrderOptions } from '../../types/orderTypes';

export type OrderFormValues = {
  menuDayId: string;
  dishId: string;
  addonIds: string[];
};

type OrderFormProps = {
  open: boolean;
  isSubmitting: boolean;
  options: OrderOptions | null;
  onClose: () => void;
  onSubmit: (values: OrderFormValues) => Promise<void>;
};

function formatDate(value?: string) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'full',
  }).format(new Date(value));
}

export function OrderForm({ open, isSubmitting, options, onClose, onSubmit }: OrderFormProps) {
  const firstMenuDay = options?.menuDays[0];
  const [menuDayId, setMenuDayId] = useState(firstMenuDay?.id ?? '');
  const [dishId, setDishId] = useState(firstMenuDay?.dishes[0]?.id ?? '');
  const [addonIds, setAddonIds] = useState<string[]>([]);

  const menuDays = options?.menuDays ?? [];
  const selectedMenuDay = menuDays.find(
    (menuDay) => menuDay.id === menuDayId,
  );

  function handleMenuDayChange(nextMenuDayId: string) {
    const nextMenuDay = menuDays.find((menuDay) => menuDay.id === nextMenuDayId);

    setMenuDayId(nextMenuDayId);
    setDishId(nextMenuDay?.dishes[0]?.id ?? '');
    setAddonIds([]);
  }

  function handleAddonChange(addonId: string, checked: boolean) {
    setAddonIds((currentAddonIds) => {
      if (checked) {
        return [...currentAddonIds, addonId];
      }

      return currentAddonIds.filter((currentAddonId) => currentAddonId !== addonId);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      menuDayId,
      dishId,
      addonIds,
    });
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>Złóż zamówienie</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* Grupa uczestnika wyznacza dostępny pakiet i menu */}
            <TextField label="Grupa" value={options?.groupName ?? ''} fullWidth disabled />

            {/* Dzień menu zawęża listę dostępnych dań i dodatków */}
            <TextField
              label="Dzień menu"
              value={menuDayId}
              onChange={(event) => handleMenuDayChange(event.target.value)}
              required
              fullWidth
              select
              disabled={menuDays.length === 0 || isSubmitting}
            >
              {menuDays.map((menuDay) => (
                <MenuItem key={menuDay.id} value={menuDay.id}>
                  {formatDate(menuDay.menuDate)}
                </MenuItem>
              ))}
            </TextField>

            {/* Danie główne jest wymaganym elementem zamówienia */}
            <TextField
              label="Danie"
              value={dishId}
              onChange={(event) => setDishId(event.target.value)}
              required
              fullWidth
              select
              disabled={!selectedMenuDay || selectedMenuDay.dishes.length === 0 || isSubmitting}
            >
              {selectedMenuDay?.dishes.map((dish) => (
                <MenuItem key={dish.id} value={dish.id}>
                  {dish.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Dodatki są opcjonalnym uzupełnieniem zamówienia */}
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Dodatki
              </Typography>

              {selectedMenuDay && selectedMenuDay.addons.length > 0 ? (
                <FormGroup>
                  {selectedMenuDay.addons.map((addon) => (
                    <FormControlLabel
                      key={addon.id}
                      control={
                        <Checkbox
                          checked={addonIds.includes(addon.id)}
                          onChange={(event) => handleAddonChange(addon.id, event.target.checked)}
                          disabled={isSubmitting}
                        />
                      }
                      label={addon.name}
                    />
                  ))}
                </FormGroup>
              ) : (
                <Typography color="text.secondary">Brak dodatków dostępnych dla wybranego dnia</Typography>
              )}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || !menuDayId || !dishId}>
            {isSubmitting ? 'Zapisywanie...' : 'Złóż zamówienie'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
