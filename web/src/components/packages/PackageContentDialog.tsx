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
import { createPackageAddon, deletePackageAddon, getPackageAddons } from '../../api/packageAddonsApi';
import { createPackageDish, deletePackageDish, getPackageDishes } from '../../api/packageDishesApi';
import type { Addon } from '../../types/addonTypes';
import type { Dish } from '../../types/dishTypes';
import type {
  PackageAddonAssignment,
  PackageDishAssignment,
} from '../../types/packageAssignmentTypes';
import type { Package } from '../../types/packageTypes';

type PackageContentDialogProps = {
  open: boolean;
  packageItem: Package | null;
  dishes: Dish[];
  addons: Addon[];
  onClose: () => void;
};

export function PackageContentDialog({
  open,
  packageItem,
  dishes,
  addons,
  onClose,
}: PackageContentDialogProps) {
  const [packageDishes, setPackageDishes] = useState<PackageDishAssignment[]>([]);
  const [packageAddons, setPackageAddons] = useState<PackageAddonAssignment[]>([]);
  const [selectedDishId, setSelectedDishId] = useState('');
  const [selectedAddonId, setSelectedAddonId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const availableDishes = useMemo(() => {
    const assignedDishIds = new Set(packageDishes.map((assignment) => assignment.dishId));

    return dishes.filter(
      (dish) =>
        dish.isActive &&
        dish.cateringCompanyId === packageItem?.cateringCompanyId &&
        !assignedDishIds.has(dish.id),
    );
  }, [dishes, packageDishes, packageItem]);

  const availableAddons = useMemo(() => {
    const assignedAddonIds = new Set(packageAddons.map((assignment) => assignment.addonId));

    return addons.filter(
      (addon) =>
        addon.isActive &&
        addon.cateringCompanyId === packageItem?.cateringCompanyId &&
        !assignedAddonIds.has(addon.id),
    );
  }, [addons, packageAddons, packageItem]);

  async function loadContent() {
    if (!packageItem) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const [dishAssignments, addonAssignments] = await Promise.all([
        getPackageDishes(packageItem.id),
        getPackageAddons(packageItem.id),
      ]);

      setPackageDishes(dishAssignments);
      setPackageAddons(addonAssignments);
      setSelectedDishId('');
      setSelectedAddonId('');
    } catch (error) {
      // Komunikat błędu pobierania zawartości pakietu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać zawartości pakietu'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddDish() {
    if (!packageItem || !selectedDishId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await createPackageDish({
        packageId: packageItem.id,
        dishId: selectedDishId,
      });

      await loadContent();
    } catch (error) {
      // Komunikat błędu przypisania dania pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się przypisać dania do pakietu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddAddon() {
    if (!packageItem || !selectedAddonId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await createPackageAddon({
        packageId: packageItem.id,
        addonId: selectedAddonId,
      });

      await loadContent();
    } catch (error) {
      // Komunikat błędu przypisania dodatku pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się przypisać dodatku do pakietu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteDishAssignment(assignment: PackageDishAssignment) {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deletePackageDish(assignment.id);
      await loadContent();
    } catch (error) {
      // Komunikat błędu usunięcia dania z pakietu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć dania z pakietu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteAddonAssignment(assignment: PackageAddonAssignment) {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deletePackageAddon(assignment.id);
      await loadContent();
    } catch (error) {
      // Komunikat błędu usunięcia dodatku z pakietu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć dodatku z pakietu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (open) {
      void loadContent();
    }
  }, [open, packageItem]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Dania i dodatki w pakiecie: {packageItem?.name}</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {/* Sekcja przypisywania dań dostępnych dla firmy pakietu */}
          <Stack spacing={1.5}>
            <Typography variant="h6">Dania w pakiecie</Typography>

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
                Przypisz danie
              </Button>
            </Stack>

            <Stack spacing={1}>
              {packageDishes.length === 0 && (
                <Typography color="text.secondary">Brak dań przypisanych do pakietu</Typography>
              )}

              {packageDishes.map((assignment) => (
                <Box
                  key={assignment.id}
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
                    <Typography>{assignment.dishName}</Typography>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={assignment.isActive ? 'Aktywne' : 'Nieaktywne'}
                    />
                  </Stack>

                  <Button
                    color="error"
                    size="small"
                    startIcon={<DeleteOutlineOutlinedIcon />}
                    onClick={() => handleDeleteDishAssignment(assignment)}
                    disabled={isSubmitting}
                  >
                    Usuń z pakietu
                  </Button>
                </Box>
              ))}
            </Stack>
          </Stack>

          <Divider />

          {/* Sekcja przypisywania dodatków dostępnych dla firmy pakietu */}
          <Stack spacing={1.5}>
            <Typography variant="h6">Dodatki w pakiecie</Typography>

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
                Przypisz dodatek
              </Button>
            </Stack>

            <Stack spacing={1}>
              {packageAddons.length === 0 && (
                <Typography color="text.secondary">Brak dodatków przypisanych do pakietu</Typography>
              )}

              {packageAddons.map((assignment) => (
                <Box
                  key={assignment.id}
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
                    <Typography>{assignment.addonName}</Typography>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={assignment.isActive ? 'Aktywny' : 'Nieaktywny'}
                    />
                  </Stack>

                  <Button
                    color="error"
                    size="small"
                    startIcon={<DeleteOutlineOutlinedIcon />}
                    onClick={() => handleDeleteAddonAssignment(assignment)}
                    disabled={isSubmitting}
                  >
                    Usuń z pakietu
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
