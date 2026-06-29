import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
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
import { getCateringCompanies } from '../api/cateringCompaniesApi';
import { createDish, deleteDish, getDishes, updateDish } from '../api/dishesApi';
import { DishForm } from '../components/dishes/DishForm';
import { useAuth } from '../hooks/useAuth';
import type { CateringCompany } from '../types/cateringCompanyTypes';
import type { Dish } from '../types/dishTypes';
import { roles } from '../types/authTypes';

function formatDate(value?: string) {
    if (!value) {
        return 'Brak danych';
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function DishesPage() {
    const { auth } = useAuth();
    const userRoles = auth?.user.roles ?? [];
    const canManageDishes = userRoles.includes(roles.admin) || userRoles.includes(roles.dietitian);

    const [dishes, setDishes] = useState<Dish[]>([]);
    const [companies, setCompanies] = useState<CateringCompany[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
    const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function loadDishes() {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await getDishes();
            setDishes(data);
        } catch (error) {
            // Komunikat błędu pobierania dań pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać listy dań'));
        } finally {
            setIsLoading(false);
        }
    }

    async function loadCompanies() {
        if (!canManageDishes) {
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
        setSelectedDish(null);
        setIsFormOpen(true);
    }

    function openEditForm(dish: Dish) {
        setSelectedDish(dish);
        setIsFormOpen(true);
    }

    function closeForm() {
        setSelectedDish(null);
        setIsFormOpen(false);
    }

    async function handleSaveDish(values: {
        name: string;
        description?: string;
        cateringCompanyId: string;
        isActive: boolean;
    }) {
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            if (selectedDish) {
                await updateDish(selectedDish.id, values);
            } else {
                await createDish({
                    name: values.name,
                    description: values.description,
                    cateringCompanyId: values.cateringCompanyId,
                });
            }

            closeForm();
            await loadDishes();
        } catch (error) {
            // Komunikat błędu zapisu dania pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się zapisać dania'));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDeleteDish() {
        if (!dishToDelete) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            await deleteDish(dishToDelete.id);
            setDishToDelete(null);
            await loadDishes();
        } catch (error) {
            // Komunikat błędu usuwania dania pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć dania'));
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        void loadDishes();
        void loadCompanies();
    }, []);

    return (
        <Stack spacing={3}>
            {/* Nagłówek strony opisuje zakres modułu dań */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Dania
                </Typography>
                <Typography color="text.secondary">
                    Katalog dań wykorzystywanych przy budowaniu menu i obsłudze zamówień
                </Typography>
            </Box>

            {/* Pasek akcji dla odświeżenia danych i zarządzania katalogiem dań */}
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    startIcon={<RefreshOutlinedIcon />}
                    onClick={loadDishes}
                    disabled={isLoading}
                >
                    Odśwież
                </Button>

                {canManageDishes && (
                    <Button
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        onClick={openCreateForm}
                        disabled={companies.length === 0}
                    >
                        Dodaj danie
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
                            <Typography color="text.secondary">Pobieranie dań...</Typography>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Pusty stan dla sytuacji, w której system nie ma jeszcze żadnych dań */}
            {!isLoading && dishes.length === 0 && (
                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
                            <RestaurantMenuOutlinedIcon color="primary" fontSize="large" />
                            <Typography variant="h6">Brak dań</Typography>
                            <Typography color="text.secondary">
                                Po dodaniu dań będą one widoczne w tym miejscu
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Lista dań pobrana z backendu */}
            {!isLoading && dishes.length > 0 && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                        gap: 2,
                    }}
                >
                    {dishes.map((dish) => (
                        <Card key={dish.id} variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', gap: 2 }}>
                                        <Box>
                                            <Typography variant="h6">{dish.name}</Typography>
                                            {dish.cateringCompanyName && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {dish.cateringCompanyName}
                                                </Typography>
                                            )}
                                        </Box>

                                        {typeof dish.isActive === 'boolean' && (
                                            <Chip
                                                color={dish.isActive ? 'success' : 'default'}
                                                variant="outlined"
                                                label={dish.isActive ? 'Aktywne' : 'Nieaktywne'}
                                            />
                                        )}
                                    </Stack>

                                    {dish.description && (
                                        <Typography color="text.secondary">{dish.description}</Typography>
                                    )}

                                    {dish.createdAt && (
                                        <Typography variant="body2" color="text.secondary">
                                            Utworzono: {formatDate(dish.createdAt)}
                                        </Typography>
                                    )}

                                    {canManageDishes && (
                                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<EditOutlinedIcon />}
                                                onClick={() => openEditForm(dish)}
                                            >
                                                Edytuj
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<DeleteOutlineOutlinedIcon />}
                                                onClick={() => setDishToDelete(dish)}
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

            <DishForm
                open={isFormOpen}
                title={selectedDish ? 'Edytuj danie' : 'Dodaj danie'}
                submitLabel={selectedDish ? 'Zapisz zmiany' : 'Dodaj danie'}
                isSubmitting={isSubmitting}
                canEditStatus={Boolean(selectedDish)}
                companies={companies}
                initialDish={selectedDish}
                onClose={closeForm}
                onSubmit={handleSaveDish}
            />

            <Dialog open={Boolean(dishToDelete)} onClose={() => setDishToDelete(null)}>
                <DialogTitle>Usuń danie</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Czy na pewno chcesz usunąć <strong>{dishToDelete?.name}?</strong> Tej operacji nie można cofnąć.
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDishToDelete(null)} disabled={isSubmitting}>
                        Anuluj
                    </Button>
                    <Button color="error" variant="contained" onClick={handleDeleteDish} disabled={isSubmitting}>
                        {isSubmitting ? 'Usuwanie...' : 'Usuń'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}