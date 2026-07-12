import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../api/apiError';
import { getAddons } from '../../api/addonsApi';
import { getDishes } from '../../api/dishesApi';
import {
  createMenuDay,
  deleteMenuDay,
  getMenuDaysByPeriod,
  updateMenuDay,
} from '../../api/menuDaysApi';
import type { Addon } from '../../types/addonTypes';
import type { Dish } from '../../types/dishTypes';
import type { MenuDay, MenuPeriod } from '../../types/menuTypes';
import { MenuDayContentDialog } from './MenuDayContentDialog';
import { MenuDayForm } from './MenuDayForm';

type MenuDaysDialogProps = {
  open: boolean;
  menuPeriod: MenuPeriod | null;
  onClose: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'full',
  }).format(new Date(value));
}

export function MenuDaysDialog({ open, menuPeriod, onClose }: MenuDaysDialogProps) {
  const [days, setDays] = useState<MenuDay[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<MenuDay | null>(null);
  const [dayToDelete, setDayToDelete] = useState<MenuDay | null>(null);
  const [dayContent, setDayContent] = useState<MenuDay | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadDays() {
    if (!menuPeriod) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getMenuDaysByPeriod(menuPeriod.id);
      setDays(data);
    } catch (error) {
      // Komunikat błędu pobierania dni menu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać dni menu'));
    } finally {
      setIsLoading(false);
    }
  }

  async function loadOfferItems() {
    try {
      const [dishesData, addonsData] = await Promise.all([getDishes(), getAddons()]);

      setDishes(dishesData);
      setAddons(addonsData);
    } catch (error) {
      // Komunikat błędu pobierania dań i dodatków pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać listy dań i dodatków'));
    }
  }

  function openCreateForm() {
    setSelectedDay(null);
    setIsFormOpen(true);
  }

  function openEditForm(day: MenuDay) {
    setSelectedDay(day);
    setIsFormOpen(true);
  }

  function closeForm() {
    setSelectedDay(null);
    setIsFormOpen(false);
  }

  async function handleSaveDay(values: { menuDate: string; isActive: boolean }) {
    if (!menuPeriod) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (selectedDay) {
        await updateMenuDay(selectedDay.id, {
          menuPeriodId: menuPeriod.id,
          menuDate: values.menuDate,
          isActive: values.isActive,
        });
      } else {
        await createMenuDay({
          menuPeriodId: menuPeriod.id,
          menuDate: values.menuDate,
        });
      }

      closeForm();
      await loadDays();
    } catch (error) {
      // Komunikat błędu zapisu dnia menu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się zapisać dnia menu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteDay() {
    if (!dayToDelete) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deleteMenuDay(dayToDelete.id);
      setDayToDelete(null);
      await loadDays();
    } catch (error) {
      // Komunikat błędu usuwania dnia menu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć dnia menu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (open) {
      void loadDays();
      void loadOfferItems();
    }
  }, [open, menuPeriod]);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Dni menu: {menuPeriod?.name}</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            {/* Główna akcja dodania dnia menu */}
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddOutlinedIcon />}
                onClick={openCreateForm}
                disabled={!menuPeriod}
              >
                Dodaj dzień
              </Button>
            </Stack>

            {/* Stan ładowania dni menu */}
            {isLoading && (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography color="text.secondary">Pobieranie dni menu…</Typography>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Pusty stan dla okresu bez zdefiniowanych dni menu */}
            {!isLoading && days.length === 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
                    <EventOutlinedIcon color="primary" fontSize="large" />
                    <Typography variant="h6">Brak dni menu</Typography>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Lista dni menu przypisanych do wybranego okresu */}
            {!isLoading && days.length > 0 && (
              <Stack spacing={1.5}>
                {days.map((day) => (
                  <Box
                    key={day.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                          <Typography variant="h6">{formatDate(day.menuDate)}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {day.menuPeriodName}
                          </Typography>
                        </Box>

                        <Chip
                          color={day.isActive ? 'success' : 'default'}
                          variant="outlined"
                          label={day.isActive ? 'Aktywny' : 'Nieaktywny'}
                        />
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PlaylistAddCheckOutlinedIcon />}
                          onClick={() => setDayContent(day)}
                        >
                          Dania i dodatki
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => openEditForm(day)}
                        >
                          Edytuj
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteOutlineOutlinedIcon />}
                          onClick={() => setDayToDelete(day)}
                        >
                          Usuń
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Zamknij
          </Button>
        </DialogActions>
      </Dialog>

      <MenuDayForm
        open={isFormOpen}
        title={selectedDay ? 'Edytuj dzień menu' : 'Dodaj dzień menu'}
        submitLabel={selectedDay ? 'Zapisz' : 'Dodaj dzień'}
        isSubmitting={isSubmitting}
        canEditStatus={Boolean(selectedDay)}
        menuPeriod={menuPeriod}
        initialDay={selectedDay}
        onClose={closeForm}
        onSubmit={handleSaveDay}
      />

      <MenuDayContentDialog
        open={Boolean(dayContent)}
        menuDay={dayContent}
        dishes={dishes}
        addons={addons}
        onClose={() => setDayContent(null)}
      />

      <Dialog open={Boolean(dayToDelete)} onClose={() => setDayToDelete(null)}>
        <DialogTitle>Usuń dzień menu</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Usunąć dzień menu z <strong>{dayToDelete ? formatDate(dayToDelete.menuDate) : ''}</strong>?
            Dnia powiązanego z daniami, dodatkami lub zamówieniami nie można usunąć.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDayToDelete(null)} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button color="error" variant="contained" onClick={handleDeleteDay} disabled={isSubmitting}>
            {isSubmitting ? 'Usuwanie…' : 'Usuń'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
