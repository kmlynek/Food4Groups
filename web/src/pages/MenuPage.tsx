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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
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

type MenuStatusFilter = 'all' | 'active' | 'inactive';
type MenuSortOption = 'startDateDesc' | 'startDateAsc' | 'nameAsc' | 'nameDesc';

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
  const [searchText, setSearchText] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [statusFilter, setStatusFilter] = useState<MenuStatusFilter>('all');
  const [sortOption, setSortOption] = useState<MenuSortOption>('startDateDesc');

  const periodCompanyOptions = useMemo(() => {
    const companyMap = new Map<string, string>();

    periods.forEach((period) => {
      if (period.cateringCompanyId && period.cateringCompanyName) {
        companyMap.set(period.cateringCompanyId, period.cateringCompanyName);
      }
    });

    return Array.from(companyMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((firstCompany, secondCompany) => firstCompany.name.localeCompare(secondCompany.name));
  }, [periods]);

  const filteredPeriods = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    return periods
      .filter((period) => {
        const searchableText = [period.name, period.cateringCompanyName]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesSearchText =
          normalizedSearchText.length === 0 || searchableText.includes(normalizedSearchText);

        const matchesCompany =
          !selectedCompanyId || period.cateringCompanyId === selectedCompanyId;

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && period.isActive) ||
          (statusFilter === 'inactive' && !period.isActive);

        return matchesSearchText && matchesCompany && matchesStatus;
      })
      .sort((firstPeriod, secondPeriod) => {
        const firstStartDate = new Date(firstPeriod.startDate).getTime();
        const secondStartDate = new Date(secondPeriod.startDate).getTime();

        if (sortOption === 'startDateAsc') {
          return firstStartDate - secondStartDate;
        }

        if (sortOption === 'nameAsc') {
          return firstPeriod.name.localeCompare(secondPeriod.name);
        }

        if (sortOption === 'nameDesc') {
          return secondPeriod.name.localeCompare(firstPeriod.name);
        }

        return secondStartDate - firstStartDate;
      });
  }, [periods, searchText, selectedCompanyId, sortOption, statusFilter]);

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

      {/* Filtry okresów menu pomagają znaleźć harmonogram dla wybranej firmy i statusu */}
      {!isLoading && periods.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                label="Szukaj okresu"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Nazwa lub firma"
                fullWidth
              />

              <TextField
                label="Firma"
                value={selectedCompanyId}
                onChange={(event) => setSelectedCompanyId(event.target.value)}
                select
                fullWidth
              >
                <MenuItem value="">Wszystkie firmy</MenuItem>
                {periodCompanyOptions.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as MenuStatusFilter)}
                select
                fullWidth
              >
                <MenuItem value="all">Wszystkie</MenuItem>
                <MenuItem value="active">Aktywne</MenuItem>
                <MenuItem value="inactive">Nieaktywne</MenuItem>
              </TextField>

              <TextField
                label="Sortowanie"
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as MenuSortOption)}
                select
                fullWidth
              >
                <MenuItem value="startDateDesc">Najnowsze okresy</MenuItem>
                <MenuItem value="startDateAsc">Najstarsze okresy</MenuItem>
                <MenuItem value="nameAsc">Nazwa A-Z</MenuItem>
                <MenuItem value="nameDesc">Nazwa Z-A</MenuItem>
              </TextField>
            </Box>
          </CardContent>
        </Card>
      )}

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

      {/* Pusty stan dla aktywnych filtrów menu */}
      {!isLoading && periods.length > 0 && filteredPeriods.length === 0 && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
              <CalendarMonthOutlinedIcon color="primary" fontSize="large" />
              <Typography variant="h6">Brak wyników</Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Lista okresów menu pobrana z backendu */}
      {!isLoading && filteredPeriods.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {filteredPeriods.map((period) => (
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
