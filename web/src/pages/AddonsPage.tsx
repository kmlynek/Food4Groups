import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
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
    Stack,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/apiError';
import { createAddon, deleteAddon, getAddons, updateAddon } from '../api/addonsApi';
import { getCateringCompanies } from '../api/cateringCompaniesApi';
import { AddonForm } from '../components/addons/AddonForm';
import { useAuth } from '../hooks/useAuth';
import type { Addon } from '../types/addonTypes';
import type { CateringCompany } from '../types/cateringCompanyTypes';
import { roles } from '../types/authTypes';

function formatDate(value?: string) {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function AddonsPage() {
    const { auth } = useAuth();
    const userRoles = auth?.user.roles ?? [];
    const canManageAddons = userRoles.includes(roles.admin) || userRoles.includes(roles.dietitian);

    const [addons, setAddons] = useState<Addon[]>([]);
    const [companies, setCompanies] = useState<CateringCompany[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);
    const [addonToDelete, setAddonToDelete] = useState<Addon | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function loadAddons() {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await getAddons();
            setAddons(data);
        } catch (error) {
            // Komunikat błędu pobierania dodatków pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać listy dodatków'));
        } finally {
            setIsLoading(false);
        }
    }

    async function loadCompanies() {
        if (!canManageAddons) {
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

    function openCreateForm() {
        setSelectedAddon(null);
        setIsFormOpen(true);
    }

    function openEditForm(addon: Addon) {
        setSelectedAddon(addon);
        setIsFormOpen(true);
    }

    function closeForm() {
        setSelectedAddon(null);
        setIsFormOpen(false);
    }

    async function handleSaveAddon(values: {
        name: string;
        description?: string;
        cateringCompanyId: string;
        isActive: boolean;
    }) {
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            if (selectedAddon) {
                await updateAddon(selectedAddon.id, values);
            } else {
                await createAddon({
                    name: values.name,
                    description: values.description,
                    cateringCompanyId: values.cateringCompanyId,
                });
            }

            closeForm();
            await loadAddons();
        } catch (error) {
            // Komunikat błędu zapisu dodatku pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się zapisać dodatku'));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDeleteAddon() {
        if (!addonToDelete) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            await deleteAddon(addonToDelete.id);
            setAddonToDelete(null);
            await loadAddons();
        } catch (error) {
            // Komunikat błędu usuwania dodatku pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć dodatku'));
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        void loadAddons();
        void loadCompanies();
    }, []);

    return (
        <Stack spacing={3}>
            {/* Nagłówek strony opisuje zakres modułu dodatków */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Dodatki
                </Typography>
                <Typography color="text.secondary">
                    Katalog dodatków wykorzystywanych przy budowaniu menu i uzupełnianiu zamówień
                </Typography>
            </Box>

            {/* Pasek akcji dla odświeżenia danych i zarządzania katalogiem dodatków */}
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    startIcon={<RefreshOutlinedIcon />}
                    onClick={loadAddons}
                    disabled={isLoading}
                >
                    Odśwież
                </Button>

                {canManageAddons && (
                    <Button
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        onClick={openCreateForm}
                        disabled={companies.length === 0}
                    >
                        Dodaj dodatek
                    </Button>
                )}
            </Stack>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            {/* Stan ładowania widoczny podczas pobierania danych z API */}
            {isLoading && (
                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
                            <CircularProgress />
                            <Typography color="text.secondary">Pobieranie dodatków...</Typography>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Pusty stan dla sytuacji, w której system nie ma jeszcze żadnych dodatków */}
            {!isLoading && addons.length === 0 && (
                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
                            <ExtensionOutlinedIcon color="primary" fontSize="large" />
                            <Typography variant="h6">Brak dodatków</Typography>
                            <Typography color="text.secondary">
                                Po dodaniu dodatków będą one widoczne w tym miejscu
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Lista dodatków pobrana z backendu */}
            {!isLoading && addons.length > 0 && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                        gap: 2,
                    }}
                >
                    {addons.map((addon) => (
                        <Card key={addon.id} variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', gap: 2 }}>
                                        <Box>
                                            <Typography variant="h6">{addon.name}</Typography>

                                            {addon.cateringCompanyName && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {addon.cateringCompanyName}
                                                </Typography>
                                            )}
                                        </Box>

                                        {typeof addon.isActive === 'boolean' && (
                                            <Chip
                                                color={addon.isActive ? 'success' : 'default'}
                                                variant="outlined"
                                                label={addon.isActive ? 'Aktywny' : 'Nieaktywny'}
                                            />
                                        )}
                                    </Stack>

                                    {addon.description && (
                                        <Typography color="text.secondary">{addon.description}</Typography>
                                    )}

                                    {addon.createdAt && (
                                        <Typography variant="body2" color="text.secondary">
                                            Utworzono: {formatDate(addon.createdAt)}
                                        </Typography>
                                    )}

                                    {canManageAddons && (
                                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<EditOutlinedIcon />}
                                                onClick={() => openEditForm(addon)}
                                            >
                                                Edytuj
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<DeleteOutlineOutlinedIcon />}
                                                onClick={() => setAddonToDelete(addon)}
                                            >
                                                Usuń
                                            </Button>
                                        </Stack>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            <AddonForm
                open={isFormOpen}
                title={selectedAddon ? 'Edytuj dodatek' : 'Dodaj dodatek'}
                submitLabel={selectedAddon ? 'Zapisz' : 'Dodaj dodatek'}
                isSubmitting={isSubmitting}
                canEditStatus={Boolean(selectedAddon)}
                companies={companies}
                initialAddon={selectedAddon}
                onClose={closeForm}
                onSubmit={handleSaveAddon}
            />

            <Dialog open={Boolean(addonToDelete)} onClose={() => setAddonToDelete(null)}>
                <DialogTitle>Usuń dodatek</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Czy na pewno chcesz usunąć <strong>{addonToDelete?.name}</strong>?
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setAddonToDelete(null)} disabled={isSubmitting}>
                        Anuluj
                    </Button>
                    <Button color="error" variant="contained" onClick={handleDeleteAddon} disabled={isSubmitting}>
                        {isSubmitting ? 'Usuwanie...' : 'Usuń'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}