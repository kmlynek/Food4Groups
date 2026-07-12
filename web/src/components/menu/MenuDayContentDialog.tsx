import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../../api/apiError';
import {
  createMenuDayAddon,
  createMenuItem,
  deleteMenuDayAddon,
  deleteMenuItem,
  getMenuDayAddonsByDay,
  getMenuItemsByDay,
} from '../../api/menuContentApi';
import type { Addon } from '../../types/addonTypes';
import type { Dish } from '../../types/dishTypes';
import type { MenuDay, MenuDayAddon, MenuItem as MenuDayItem } from '../../types/menuTypes';

type MenuDayContentDialogProps = {
  open: boolean;
  menuDay: MenuDay | null;
  dishes: Dish[];
  addons: Addon[];
  onClose: () => void;
};

function formatDate(value?: string) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'full',
  }).format(new Date(value));
}

export function MenuDayContentDialog({
  open,
  menuDay,
  dishes,
  addons,
  onClose,
}: MenuDayContentDialogProps) {
  const [menuItems, setMenuItems] = useState<MenuDayItem[]>([]);
  const [menuDayAddons, setMenuDayAddons] = useState<MenuDayAddon[]>([]);
  const [selectedDishId, setSelectedDishId] = useState('');
  const [selectedAddonId, setSelectedAddonId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const availableDishes = useMemo(() => {
    const assignedDishIds = new Set(menuItems.map((item) => item.dishId));

    return dishes.filter(
      (dish) =>
        dish.isActive &&
        dish.cateringCompanyId === menuDay?.cateringCompanyId &&
        !assignedDishIds.has(dish.id),
    );
  }, [dishes, menuItems, menuDay]);

  const availableAddons = useMemo(() => {
    const assignedAddonIds = new Set(menuDayAddons.map((item) => item.addonId));

    return addons.filter(
      (addon) =>
        addon.isActive &&
        addon.cateringCompanyId === menuDay?.cateringCompanyId &&
        !assignedAddonIds.has(addon.id),
    );
  }, [addons, menuDayAddons, menuDay]);

  async function loadContent() {
    if (!menuDay) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const [itemsData, addonsData] = await Promise.all([
        getMenuItemsByDay(menuDay.id),
        getMenuDayAddonsByDay(menuDay.id),
      ]);

      setMenuItems(itemsData);
      setMenuDayAddons(addonsData);
      setSelectedDishId('');
      setSelectedAddonId('');
    } catch (error) {
      // Komunikat błędu pobierania zawartości dnia menu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać zawartości dnia menu'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddDish() {
    if (!menuDay || !selectedDishId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await createMenuItem({
        menuDayId: menuDay.id,
        dishId: selectedDishId,
      });

      await loadContent();
    } catch (error) {
      // Komunikat błędu przypisania dania do dnia menu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się przypisać dania do dnia menu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddAddon() {
    if (!menuDay || !selectedAddonId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await createMenuDayAddon({
        menuDayId: menuDay.id,
        addonId: selectedAddonId,
      });

      await loadContent();
    } catch (error) {
      // Komunikat błędu przypisania dodatku do dnia menu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się przypisać dodatku do dnia menu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteMenuItem(item: MenuDayItem) {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deleteMenuItem(item.id);
      await loadContent();
    } catch (error) {
      // Komunikat błędu usunięcia dania z dnia menu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć dania z dnia menu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteMenuDayAddon(item: MenuDayAddon) {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deleteMenuDayAddon(item.id);
      await loadContent();
    } catch (error) {
      // Komunikat błędu usunięcia dodatku z dnia menu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć dodatku z dnia menu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (open) {
      void loadContent();
    }
  }, [open, menuDay]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Dania i dodatki w dniu menu: {formatDate(menuDay?.menuDate)}</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {/* Sekcja przypisywania dań dostępnych dla firmy dnia menu */}
          <Stack spacing={1.5}>
            <Typography variant="h6">Dania w menu na ten dzień</Typography>

            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Wybierz danie"
                value={selectedDishId}
                onChange={(event) => setSelectedDishId(event.target.value)}
                select
                fullWidth
                disabled={isLoading || isSubmitting || availableDishes.length === 0}
              >
                {availableDishes.map((dish) => (
                  <MenuItem key={dish.id} value={dish.id}>
                    {dish.name}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="contained"
                startIcon={<AddOutlinedIcon />}
                onClick={handleAddDish}
                disabled={!selectedDishId || isSubmitting}
              >
                Dodaj danie
              </Button>
            </Stack>

            <Stack spacing={1}>
              {menuItems.length === 0 && (
                <Typography color="text.secondary">Brak dań przypisanych do dnia menu</Typography>
              )}

              {menuItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography>{item.dishName}</Typography>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={item.isActive ? 'Aktywne' : 'Nieaktywne'}
                    />
                  </Stack>

                  <Button
                    color="error"
                    size="small"
                    startIcon={<DeleteOutlineOutlinedIcon />}
                    onClick={() => handleDeleteMenuItem(item)}
                    disabled={isSubmitting}
                  >
                    Usuń z dnia menu
                  </Button>
                </Box>
              ))}
            </Stack>
          </Stack>

          <Divider />

          {/* Sekcja przypisywania dodatków dostępnych dla firmy dnia menu */}
          <Stack spacing={1.5}>
            <Typography variant="h6">Dodatki w menu na ten dzień</Typography>

            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Wybierz dodatek"
                value={selectedAddonId}
                onChange={(event) => setSelectedAddonId(event.target.value)}
                select
                fullWidth
                disabled={isLoading || isSubmitting || availableAddons.length === 0}
              >
                {availableAddons.map((addon) => (
                  <MenuItem key={addon.id} value={addon.id}>
                    {addon.name}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="contained"
                startIcon={<AddOutlinedIcon />}
                onClick={handleAddAddon}
                disabled={!selectedAddonId || isSubmitting}
              >
                Dodaj dodatek
              </Button>
            </Stack>

            <Stack spacing={1}>
              {menuDayAddons.length === 0 && (
                <Typography color="text.secondary">Brak dodatków przypisanych do dnia menu</Typography>
              )}

              {menuDayAddons.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography>{item.addonName}</Typography>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={item.isActive ? 'Aktywny' : 'Nieaktywny'}
                    />
                  </Stack>

                  <Button
                    color="error"
                    size="small"
                    startIcon={<DeleteOutlineOutlinedIcon />}
                    onClick={() => handleDeleteMenuDayAddon(item)}
                    disabled={isSubmitting}
                  >
                    Usuń z dnia menu
                  </Button>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
}
