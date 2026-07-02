import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
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
import { getApiErrorMessage } from '../api/apiError';
import { getCateringCompanies } from '../api/cateringCompaniesApi';
import {
  createMenuPeriod,
  deleteMenuPeriod,
  getMenuPeriods,
  updateMenuPeriod,
} from '../api/menuPeriodsApi';
import { MenuPeriodForm } from '../components/menu/MenuPeriodForm';
import type { CateringCompany } from '../types/cateringCompanyTypes';
import type { MenuPeriod } from '../types/menuTypes';
import { MenuDaysDialog } from '../components/menu/MenuDaysDialog';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function MenuPage() {
  const [periods, setPeriods] = useState<MenuPeriod[]>([]);
  const [companies, setCompanies] = useState<CateringCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<MenuPeriod | null>(null);
  const [periodToDelete, setPeriodToDelete] = useState<MenuPeriod | null>(null);
  const [periodDays, setPeriodDays] = useState<MenuPeriod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadPeriods() {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getMenuPeriods();
      setPeriods(data);
    } catch (error) {
      // Komunikat błędu pobierania okresów menu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać listy okresów menu'));
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCompanies() {
    try {
      const data = await getCateringCompanies();
      setCompanies(data.filter((company) => company.isActive));
    } catch (error) {
      // Komunikat błędu pobierania firm cateringowych pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać listy firm cateringowych'));
    }
  }

  function openCreateForm() {
    setSelectedPeriod(null);
    setIsFormOpen(true);
  }

  function openEditForm(period: MenuPeriod) {
    setSelectedPeriod(period);
    setIsFormOpen(true);
  }

  function closeForm() {
    setSelectedPeriod(null);
    setIsFormOpen(false);
  }

  async function handleSavePeriod(values: {
    name: string;
    cateringCompanyId: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }) {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (selectedPeriod) {
        await updateMenuPeriod(selectedPeriod.id, values);
      } else {
        await createMenuPeriod({
          name: values.name,
          cateringCompanyId: values.cateringCompanyId,
          startDate: values.startDate,
          endDate: values.endDate,
        });
      }

      closeForm();
      await loadPeriods();
    } catch (error) {
      // Komunikat błędu zapisu okresu menu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się zapisać okresu menu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeletePeriod() {
    if (!periodToDelete) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deleteMenuPeriod(periodToDelete.id);
      setPeriodToDelete(null);
      await loadPeriods();
    } catch (error) {
      // Komunikat błędu usuwania okresu menu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć okresu menu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    void loadPeriods();
    void loadCompanies();
  }, []);

  return (
    <Stack spacing={3}>
      {/* Nagłówek strony opisuje zakres modułu menu */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Menu
        </Typography>
        <Typography color="text.secondary">
          Planowanie okresów menu oraz późniejsze zarządzanie dniami i pozycjami oferty
        </Typography>
      </Box>

      {/* Pasek akcji dla odświeżenia danych i tworzenia okresu menu */}
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshOutlinedIcon />}
          onClick={loadPeriods}
          disabled={isLoading}
        >
          Odśwież
        </Button>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={openCreateForm}
          disabled={companies.length === 0}
        >
          Dodaj okres
        </Button>
      </Stack>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {/* Stan ładowania widoczny podczas pobierania okresów menu */}
      {isLoading && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography color="text.secondary">Pobieranie okresów menu...</Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Pusty stan dla sytuacji, w której system nie ma jeszcze okresów menu */}
      {!isLoading && periods.length === 0 && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
              <CalendarMonthOutlinedIcon color="primary" fontSize="large" />
              <Typography variant="h6">Brak okresów menu</Typography>
              <Typography color="text.secondary">
                Po dodaniu okresów menu będą one widoczne w tym miejscu
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Lista okresów menu pobrana z backendu */}
      {!isLoading && periods.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {periods.map((period) => (
            <Card key={period.id} variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                      <Typography variant="h6">{period.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {period.cateringCompanyName ?? 'Brak przypisanej firmy'}
                      </Typography>
                    </Box>

                    <Chip
                      color={period.isActive ? 'success' : 'default'}
                      variant="outlined"
                      label={period.isActive ? 'Aktywny' : 'Nieaktywny'}
                    />
                  </Stack>

                  <Typography color="text.secondary">
                    Okres: {formatDate(period.startDate)} - {formatDate(period.endDate)}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EventOutlinedIcon />}
                      onClick={() => setPeriodDays(period)}
                    >
                      Dni menu
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => openEditForm(period)}
                    >
                      Edytuj
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteOutlineOutlinedIcon />}
                      onClick={() => setPeriodToDelete(period)}
                    >
                      Usuń
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <MenuPeriodForm
        open={isFormOpen}
        title={selectedPeriod ? 'Edytuj okres menu' : 'Dodaj okres obowiązywania menu'}
        submitLabel={selectedPeriod ? 'Zapisz zmiany' : 'Dodaj'}
        isSubmitting={isSubmitting}
        canEditStatus={Boolean(selectedPeriod)}
        companies={companies}
        initialPeriod={selectedPeriod}
        onClose={closeForm}
        onSubmit={handleSavePeriod}
      />
      <MenuDaysDialog
        open={Boolean(periodDays)}
        menuPeriod={periodDays}
        onClose={() => setPeriodDays(null)}
      />
      <Dialog open={Boolean(periodToDelete)} onClose={() => setPeriodToDelete(null)}>
        <DialogTitle>Usuń okres menu</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Czy na pewno chcesz usunąć <strong>{periodToDelete?.name}</strong>? Tej operacji nie
            można cofnąć.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setPeriodToDelete(null)} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button color="error" variant="contained" onClick={handleDeletePeriod} disabled={isSubmitting}>
            {isSubmitting ? 'Usuwanie...' : 'Usuń'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}