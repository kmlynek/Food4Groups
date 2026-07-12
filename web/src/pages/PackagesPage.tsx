import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
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
import { getAddons } from '../api/addonsApi';
import { getCateringCompanies } from '../api/cateringCompaniesApi';
import { getDishes } from '../api/dishesApi';
import { createPackage, deletePackage, getPackages, updatePackage } from '../api/packagesApi';
import { PackageContentDialog } from '../components/packages/PackageContentDialog';
import { PackageForm } from '../components/packages/PackageForm';
import { useAuth } from '../hooks/useAuth';
import type { Addon } from '../types/addonTypes';
import { roles } from '../types/authTypes';
import type { CateringCompany } from '../types/cateringCompanyTypes';
import type { Dish } from '../types/dishTypes';
import type { Package } from '../types/packageTypes';

type PackageStatusFilter = 'all' | 'active' | 'inactive';
type PackageSortOption = 'nameAsc' | 'nameDesc' | 'priceAsc' | 'priceDesc';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(value);
}

export function PackagesPage() {
  const { auth } = useAuth();
  const userRoles = auth?.user.roles ?? [];

  const canManagePackages =
    userRoles.includes(roles.admin) || userRoles.includes(roles.cateringEmployee);

  const canManagePackageContent =
    userRoles.includes(roles.admin) || userRoles.includes(roles.dietitian);

  const [packages, setPackages] = useState<Package[]>([]);
  const [companies, setCompanies] = useState<CateringCompany[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
  const [packageContent, setPackageContent] = useState<Package | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [statusFilter, setStatusFilter] = useState<PackageStatusFilter>('all');
  const [sortOption, setSortOption] = useState<PackageSortOption>('nameAsc');

  const packageCompanyOptions = useMemo(() => {
    const companyMap = new Map<string, string>();

    packages.forEach((packageItem) => {
      if (packageItem.cateringCompanyId && packageItem.cateringCompanyName) {
        companyMap.set(packageItem.cateringCompanyId, packageItem.cateringCompanyName);
      }
    });

    return Array.from(companyMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((firstCompany, secondCompany) => firstCompany.name.localeCompare(secondCompany.name));
  }, [packages]);

  const filteredPackages = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    return packages
      .filter((packageItem) => {
        const searchableText = [packageItem.name, packageItem.cateringCompanyName]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesSearchText =
          normalizedSearchText.length === 0 || searchableText.includes(normalizedSearchText);

        const matchesCompany =
          !selectedCompanyId || packageItem.cateringCompanyId === selectedCompanyId;

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && packageItem.isActive) ||
          (statusFilter === 'inactive' && !packageItem.isActive);

        return matchesSearchText && matchesCompany && matchesStatus;
      })
      .sort((firstPackage, secondPackage) => {
        if (sortOption === 'priceAsc') {
          return firstPackage.pricePerPerson - secondPackage.pricePerPerson;
        }

        if (sortOption === 'priceDesc') {
          return secondPackage.pricePerPerson - firstPackage.pricePerPerson;
        }

        return sortOption === 'nameAsc'
          ? firstPackage.name.localeCompare(secondPackage.name)
          : secondPackage.name.localeCompare(firstPackage.name);
      });
  }, [packages, searchText, selectedCompanyId, sortOption, statusFilter]);

  async function loadPackages() {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getPackages();
      setPackages(data);
    } catch (error) {
      // Komunikat błędu pobierania pakietów pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać listy pakietów'));
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCompanies() {
    if (!canManagePackages) {
      return;
    }

    try {
      const data = await getCateringCompanies();
      setCompanies(data.filter((company) => company.isActive));
    } catch (error) {
      // Komunikat błędu pobierania firm cateringowych pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać listy firm cateringowych'));
    }
  }

  async function loadOfferItems() {
    if (!canManagePackageContent) {
      return;
    }

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
    setSelectedPackage(null);
    setIsFormOpen(true);
  }

  function openEditForm(packageItem: Package) {
    setSelectedPackage(packageItem);
    setIsFormOpen(true);
  }

  function closeForm() {
    setSelectedPackage(null);
    setIsFormOpen(false);
  }

  async function handleSavePackage(values: {
    name: string;
    cateringCompanyId: string;
    pricePerPerson: number;
    isActive: boolean;
  }) {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (selectedPackage) {
        await updatePackage(selectedPackage.id, values);
      } else {
        await createPackage({
          name: values.name,
          cateringCompanyId: values.cateringCompanyId,
          pricePerPerson: values.pricePerPerson,
        });
      }

      closeForm();
      await loadPackages();
    } catch (error) {
      // Komunikat błędu zapisu pakietu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się zapisać pakietu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeletePackage() {
    if (!packageToDelete) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deletePackage(packageToDelete.id);
      setPackageToDelete(null);
      await loadPackages();
    } catch (error) {
      // Komunikat błędu usuwania pakietu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć pakietu'));
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    void loadPackages();
    void loadCompanies();
    void loadOfferItems();
  }, []);

  return (
    <Stack spacing={3}>
      {/* Nagłówek strony opisuje zakres modułu pakietów */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Pakiety
        </Typography>
        <Typography color="text.secondary">
          Pakiety określają warianty oferty dostępne dla wybranych grup
        </Typography>
      </Box>

      {/* Pasek akcji dla odświeżenia danych i zarządzania pakietami */}
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshOutlinedIcon />}
          onClick={loadPackages}
          disabled={isLoading}
        >
          Odśwież
        </Button>

        {canManagePackages && (
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={openCreateForm}
            disabled={companies.length === 0}
          >
            Dodaj pakiet
          </Button>
        )}
      </Stack>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {/* Filtry pakietów ułatwiają przegląd wariantów oferty i ich dostępności */}
      {!isLoading && packages.length > 0 && (
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
                label="Szukaj pakietu"
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
                {packageCompanyOptions.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as PackageStatusFilter)}
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
                onChange={(event) => setSortOption(event.target.value as PackageSortOption)}
                select
                fullWidth
              >
                <MenuItem value="nameAsc">Nazwa A-Z</MenuItem>
                <MenuItem value="nameDesc">Nazwa Z-A</MenuItem>
                <MenuItem value="priceAsc">Cena rosnąco</MenuItem>
                <MenuItem value="priceDesc">Cena malejąco</MenuItem>
              </TextField>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Stan ładowania widoczny podczas pobierania danych z API */}
      {isLoading && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography color="text.secondary">Pobieranie pakietów...</Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Pusty stan dla sytuacji, w której system nie ma jeszcze żadnych pakietów */}
      {!isLoading && packages.length === 0 && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
              <Inventory2OutlinedIcon color="primary" fontSize="large" />
              <Typography variant="h6">Brak pakietów</Typography>
              <Typography color="text.secondary">
                Po dodaniu pakietów będą one widoczne w tym miejscu
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Pusty stan dla aktywnych filtrów pakietów */}
      {!isLoading && packages.length > 0 && filteredPackages.length === 0 && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
              <Inventory2OutlinedIcon color="primary" fontSize="large" />
              <Typography variant="h6">Brak wyników</Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Lista pakietów pobrana z backendu */}
      {!isLoading && filteredPackages.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {filteredPackages.map((packageItem) => (
            <Card key={packageItem.id} variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                      <Typography variant="h6">{packageItem.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {packageItem.cateringCompanyName ?? 'Brak przypisanej firmy'}
                      </Typography>
                    </Box>

                    <Chip
                      color={packageItem.isActive ? 'success' : 'default'}
                      variant="outlined"
                      label={packageItem.isActive ? 'Aktywny' : 'Nieaktywny'}
                    />
                  </Stack>

                  <Typography color="text.secondary">
                    Cena za osobę: {formatPrice(packageItem.pricePerPerson)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Utworzono: {formatDate(packageItem.createdAt)}
                  </Typography>

                  {(canManagePackageContent || canManagePackages) && (
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      {canManagePackageContent && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PlaylistAddCheckOutlinedIcon />}
                          onClick={() => setPackageContent(packageItem)}
                        >
                          Zawartość
                        </Button>
                      )}

                      {canManagePackages && (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditOutlinedIcon />}
                            onClick={() => openEditForm(packageItem)}
                          >
                            Edytuj
                          </Button>

                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteOutlineOutlinedIcon />}
                            onClick={() => setPackageToDelete(packageItem)}
                          >
                            Usuń
                          </Button>
                        </>
                      )}
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <PackageForm
        open={isFormOpen}
        title={selectedPackage ? 'Edytuj pakiet' : 'Dodaj pakiet'}
        submitLabel={selectedPackage ? 'Zapisz zmiany' : 'Dodaj pakiet'}
        isSubmitting={isSubmitting}
        canEditStatus={Boolean(selectedPackage)}
        companies={companies}
        initialPackage={selectedPackage}
        onClose={closeForm}
        onSubmit={handleSavePackage}
      />

      <PackageContentDialog
        open={Boolean(packageContent)}
        packageItem={packageContent}
        dishes={dishes}
        addons={addons}
        onClose={() => setPackageContent(null)}
      />

      <Dialog open={Boolean(packageToDelete)} onClose={() => setPackageToDelete(null)}>
        <DialogTitle>Usuń pakiet</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Czy na pewno chcesz usunąć <strong>{packageToDelete?.name}</strong>? Tej operacji nie
            można cofnąć.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setPackageToDelete(null)} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button color="error" variant="contained" onClick={handleDeletePackage} disabled={isSubmitting}>
            {isSubmitting ? 'Usuwanie...' : 'Usuń'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
