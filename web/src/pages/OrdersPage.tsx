import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
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
import {
  changeOrderStatus,
  createOrder,
  getCoordinatorOrders,
  getMyOrders,
  getOrderOptions,
  getOrderStatuses,
  getOrders,
} from '../api/ordersApi';
import { OrderForm } from '../components/orders/OrderForm';
import { useAuth } from '../hooks/useAuth';
import { roles } from '../types/authTypes';
import type { Order, OrderOptions, OrderStatus } from '../types/orderTypes';

type OrderFormValues = {
  menuDayId: string;
  dishId: string;
  addonIds: string[];
};

type OrderStatusChange = {
  order: Order;
  status: OrderStatus;
};

type OrdersSortOption = 'createdDesc' | 'createdAsc' | 'menuDateAsc' | 'menuDateDesc';


const orderStatusLabels: Record<string, string> = {
  Created: 'Utworzone',
  Accepted: 'Przyjęte',
  Prepared: 'Przygotowane',
  Completed: 'Zakończone',
  Cancelled: 'Anulowane',
};

function formatDate(value?: string) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function formatDateTime(value?: string) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getStatusLabel(statusName?: string) {
  if (!statusName) {
    return 'Brak statusu';
  }

  return orderStatusLabels[statusName] ?? statusName;
}

function getStatusColor(statusName?: string) {
  if (statusName === 'Accepted') {
    return 'info';
  }

  if (statusName === 'Completed') {
    return 'success';
  }

  if (statusName === 'Cancelled') {
    return 'error';
  }

  if (statusName === 'Prepared') {
    return 'warning';
  }

  if (statusName === 'Accepted') {
    return 'info';
  }

  return 'primary';
}



export function OrdersPage() {
  const { auth } = useAuth();
  const userRoles = auth?.user.roles ?? [];
  const canManageOrders = userRoles.includes(roles.admin) || userRoles.includes(roles.cateringEmployee);
  const isClient = userRoles.includes(roles.user);
  const isGroupCoordinator = userRoles.includes(roles.groupCoordinator);
  const canCreateOrders = isClient && !canManageOrders && !isGroupCoordinator;
  const canSeeOrderContext = canManageOrders || isGroupCoordinator;

  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [orderOptions, setOrderOptions] = useState<OrderOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<OrderFormValues | null>(null);
  const [statusChangeToConfirm, setStatusChangeToConfirm] = useState<OrderStatusChange | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedStatusName, setSelectedStatusName] = useState('');
  const [sortOption, setSortOption] = useState<OrdersSortOption>('createdDesc');

  const activeStatuses = useMemo(
    () => statuses.filter((status) => status.isActive),
    [statuses],
  );

  const availableStatusNames = useMemo(
    () => Array.from(new Set(orders.map((order) => order.orderStatusName).filter(Boolean) as string[])),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    return orders
      .filter((order) => {
        const searchableText = [
          order.dishName,
          order.groupName,
          order.customerEmail,
          order.orderStatusName ? getStatusLabel(order.orderStatusName) : '',
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesSearchText =
          normalizedSearchText.length === 0 || searchableText.includes(normalizedSearchText);

        const matchesStatus =
          !selectedStatusName || order.orderStatusName === selectedStatusName;

        return matchesSearchText && matchesStatus;
      })
      .sort((firstOrder, secondOrder) => {
        const firstCreatedAt = new Date(firstOrder.createdAt).getTime();
        const secondCreatedAt = new Date(secondOrder.createdAt).getTime();
        const firstMenuDate = new Date(firstOrder.menuDate ?? firstOrder.createdAt).getTime();
        const secondMenuDate = new Date(secondOrder.menuDate ?? secondOrder.createdAt).getTime();

        if (sortOption === 'createdAsc') {
          return firstCreatedAt - secondCreatedAt;
        }

        if (sortOption === 'menuDateAsc') {
          return firstMenuDate - secondMenuDate;
        }

        if (sortOption === 'menuDateDesc') {
          return secondMenuDate - firstMenuDate;
        }

        return secondCreatedAt - firstCreatedAt;
      });
  }, [orders, searchText, selectedStatusName, sortOption]);


  const orderConfirmationDetails = useMemo(() => {
    if (!orderToConfirm || !orderOptions) {
      return null;
    }

    const menuDay = orderOptions.menuDays.find((option) => option.id === orderToConfirm.menuDayId);
    const dish = menuDay?.dishes.find((option) => option.id === orderToConfirm.dishId);
    const addons = menuDay?.addons.filter((option) => orderToConfirm.addonIds.includes(option.id)) ?? [];

    return {
      menuDate: menuDay?.menuDate,
      dishName: dish?.name,
      addonNames: addons.map((addon) => addon.name).filter(Boolean),
    };
  }, [orderOptions, orderToConfirm]);

  async function loadOrders() {
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (canManageOrders) {
        const [ordersData, statusesData] = await Promise.all([getOrders(), getOrderStatuses()]);
        setOrders(ordersData);
        setStatuses(statusesData);
        setOrderOptions(null);
        return;
      }

      if (isGroupCoordinator) {
        const ordersData = await getCoordinatorOrders();
        setOrders(ordersData);
        setStatuses([]);
        setOrderOptions(null);
        return;
      }

      if (canCreateOrders) {
        const [ordersData, statusesData, optionsData] = await Promise.all([
          getMyOrders(),
          getOrderStatuses(),
          getOrderOptions(),
        ]);

        setOrders(ordersData);
        setStatuses(statusesData);
        setOrderOptions(optionsData);
        return;
      }

      setOrders([]);
      setStatuses([]);
      setOrderOptions(null);
    } catch (error) {
      // Komunikat błędu pobierania zamówień pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać zamówień'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmOrder() {
    if (!orderOptions?.groupMemberId || !orderToConfirm) {
      setErrorMessage('Konto klienta nie jest przypisane do aktywnej grupy');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await createOrder({
        groupMemberId: orderOptions.groupMemberId,
        menuDayId: orderToConfirm.menuDayId,
        dishId: orderToConfirm.dishId,
        addonIds: orderToConfirm.addonIds,
      });

      setOrderToConfirm(null);
      setIsFormOpen(false);
      await loadOrders();
    } catch (error) {
      // Komunikat błędu składania zamówienia pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się złożyć zamówienia'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitOrderForm(values: OrderFormValues) {
    // Zamówienie wymaga dodatkowego potwierdzenia, ponieważ klient nie może później samodzielnie zmienić wyboru
    setOrderToConfirm(values);
  }

  async function handleChangeOrderStatus(orderId: string, orderStatusId: string) {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await changeOrderStatus(orderId, { orderStatusId });
      await loadOrders();
    } catch (error) {
      // Komunikat błędu zmiany statusu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się zmienić statusu zamówienia'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleStatusSelection(order: Order, orderStatusId: string) {
    const nextStatus = statuses.find((status) => status.id === orderStatusId);

    if (!nextStatus) {
      return;
    }

    if (nextStatus.isFinal) {
      // Status finalny wymaga potwierdzenia, ponieważ po jego zapisaniu backend blokuje kolejne zmiany
      setStatusChangeToConfirm({
        order,
        status: nextStatus,
      });
      return;
    }

    void handleChangeOrderStatus(order.id, nextStatus.id);
  }

  async function handleConfirmFinalStatusChange() {
    if (!statusChangeToConfirm) {
      return;
    }

    await handleChangeOrderStatus(statusChangeToConfirm.order.id, statusChangeToConfirm.status.id);
    setStatusChangeToConfirm(null);
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  return (
    <Stack spacing={3}>
      {/* Nagłówek strony opisuje zakres obsługi zamówień */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Zamówienia
        </Typography>
        <Typography color="text.secondary">
          Składanie zamówień przez klientów oraz obsługa statusów realizacji
        </Typography>
      </Box>

      {/* Pasek akcji dla odświeżenia danych i utworzenia zamówienia klienta */}
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshOutlinedIcon />}
          onClick={loadOrders}
          disabled={isLoading}
        >
          Odśwież
        </Button>

        {canCreateOrders && (
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setIsFormOpen(true)}
            disabled={!orderOptions?.groupMemberId || orderOptions.menuDays.length === 0}
          >
            Złóż zamówienie
          </Button>
        )}
      </Stack>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {canCreateOrders && !isLoading && !orderOptions?.groupMemberId && (
        <Alert severity="info" variant="outlined">
          Konto jeszcze nie zostało przypisane do grupy - po przypisaniu pojawi się możliwość złożenia zamówienia.
        </Alert>
      )}

      {/* Filtry zamówień działają lokalnie i ułatwiają przegląd pracy operacyjnej */}
      {!isLoading && orders.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                label="Szukaj zamówienia"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Danie, grupa lub klient"
                fullWidth
              />

              <TextField
                label="Status"
                value={selectedStatusName}
                onChange={(event) => setSelectedStatusName(event.target.value)}
                select
                fullWidth
              >
                <MenuItem value="">Wszystkie statusy</MenuItem>
                {availableStatusNames.map((statusName) => (
                  <MenuItem key={statusName} value={statusName}>
                    {getStatusLabel(statusName)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Sortowanie"
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as OrdersSortOption)}
                select
                fullWidth
              >
                <MenuItem value="createdDesc">Najnowsze zgłoszenia</MenuItem>
                <MenuItem value="createdAsc">Najstarsze zgłoszenia</MenuItem>
                <MenuItem value="menuDateAsc">Dzień menu rosnąco</MenuItem>
                <MenuItem value="menuDateDesc">Dzień menu malejąco</MenuItem>
              </TextField>
            </Box>
          </CardContent>
        </Card>
      )}

      {canCreateOrders && !isLoading && orderOptions?.groupMemberId && orderOptions.menuDays.length === 0 && (
        <Alert severity="info" variant="outlined">
          Brak dostępnych zamówień
        </Alert>
      )}

      {/* Stan ładowania widoczny podczas pobierania zamówień */}
      {isLoading && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography color="text.secondary">Pobieranie zamówień...</Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Pusty stan dla aktywnych filtrów zamówień */}
      {!isLoading && orders.length > 0 && filteredOrders.length === 0 && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
              <AssignmentOutlinedIcon color="primary" fontSize="large" />
              <Typography variant="h6">Brak wyników</Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Pusty stan dla sytuacji, w której nie ma jeszcze żadnych zamówień */}
      {!isLoading && orders.length === 0 && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
              <AssignmentOutlinedIcon color="primary" fontSize="large" />
              <Typography variant="h6">Brak zamówień</Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Lista zamówień pobrana z backendu */}
      {!isLoading && filteredOrders.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {filteredOrders.map((order) => {
            const currentStatus = statuses.find((status) => status.id === order.orderStatusId);
            const isFinalStatus = currentStatus?.isFinal ?? false;

            return (
              <Card key={order.id} variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', gap: 2 }}>
                      <Box>
                        <Typography variant="h6">{order.dishName ?? 'Brak nazwy dania'}</Typography>
                        {order.menuDate && (
                          <Typography variant="body2" color="text.secondary">
                            Menu z dnia: {formatDate(order.menuDate)}
                          </Typography>
                        )}
                      </Box>

                      <Chip
                        color={getStatusColor(order.orderStatusName)}
                        variant="outlined"
                        label={getStatusLabel(order.orderStatusName)}
                      />
                    </Stack>

                    {canSeeOrderContext && (
                      <Stack spacing={0.5}>
                        {order.groupName && (
                          <Typography variant="body2" color="text.secondary">
                            Grupa: {order.groupName}
                          </Typography>
                        )}
                        {order.customerEmail && (
                          <Typography variant="body2" color="text.secondary">
                            Klient: {order.customerEmail}
                          </Typography>
                        )}
                      </Stack>
                    )}

                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Dodatki
                      </Typography>
                      {order.addons.length > 0 ? (
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                          {order.addons.map((addon) => (
                            <Chip key={addon.addonId} label={addon.addonName} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      ) : (
                        <Typography color="text.secondary">Brak dodatków</Typography>
                      )}
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      Złożono: {formatDateTime(order.createdAt)}
                    </Typography>

                    {canManageOrders && (
                      <TextField
                        label="Status"
                        value={order.orderStatusId}
                        onChange={(event) => handleStatusSelection(order, event.target.value)}
                        select
                        fullWidth
                        disabled={isSubmitting || isFinalStatus}
                      >
                        {activeStatuses.map((status) => (
                          <MenuItem key={status.id} value={status.id}>
                            {getStatusLabel(status.name)}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <OrderForm
        open={isFormOpen}
        isSubmitting={isSubmitting}
        options={orderOptions}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitOrderForm}
      />

      <Dialog open={Boolean(orderToConfirm)} onClose={() => setOrderToConfirm(null)}>
        <DialogTitle>Potwierdź zamówienie</DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              Czy na pewno chcesz złożyć zamówienie <strong>{orderConfirmationDetails?.dishName}</strong>
              {orderConfirmationDetails?.menuDate ? (
                <>
                  {' '}
                  na dzień <strong>{formatDate(orderConfirmationDetails.menuDate)}</strong>
                </>
              ) : null}
              ? <br /> Po złożeniu zamówienia nie będzie możliwości edycji.
            </DialogContentText>

            {orderConfirmationDetails?.addonNames.length ? (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Wybrane dodatki
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {orderConfirmationDetails.addonNames.map((addonName) => (
                    <Chip key={addonName} label={addonName} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            ) : (
              <Typography color="text.secondary">Zamówienie bez dodatków</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOrderToConfirm(null)} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button variant="contained" onClick={handleConfirmOrder} disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : 'Potwierdź'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(statusChangeToConfirm)} onClose={() => setStatusChangeToConfirm(null)}>
        <DialogTitle>Potwierdź zmianę statusu</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Czy na pewno chcesz zmienić status zamówienia <strong>{statusChangeToConfirm?.order.dishName}</strong>
            {' '}na <strong>{getStatusLabel(statusChangeToConfirm?.status.name)}</strong>? <br />Po zmianie statusu
            nie będzie możliwości edycji zamówienia
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setStatusChangeToConfirm(null)} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button variant="contained" color="warning" onClick={handleConfirmFinalStatusChange} disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : 'Zmień status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
