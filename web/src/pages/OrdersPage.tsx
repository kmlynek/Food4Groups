import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  FinalStatusChangeDialog,
  OrderConfirmationDialog,
  type OrderConfirmationDetails,
  type OrderStatusChange,
} from '../components/orders/OrderConfirmationDialogs';
import {
  OrderForm,
  type OrderFormValues,
} from '../components/orders/OrderForm';
import {
  OrdersFilters,
  type OrdersSortOption,
} from '../components/orders/OrdersFilters';
import { OrdersListSection } from '../components/orders/OrdersListSection';
import { getOrderStatusLabel } from '../components/orders/orderPresentation';
import { useAuth } from '../hooks/useAuth';
import { roles } from '../types/authTypes';
import type { Order, OrderOptions, OrderStatus } from '../types/orderTypes';

export function OrdersPage() {
  const { auth } = useAuth();
  const userRoles = auth?.user.roles ?? [];

  // Uprawnienia określają zakres danych i dostępnych działań
  const canManageOrders =
    userRoles.includes(roles.admin) ||
    userRoles.includes(roles.cateringEmployee);
  const isClient = userRoles.includes(roles.user);
  const isGroupCoordinator = userRoles.includes(roles.groupCoordinator);
  const canCreateOrders =
    (isClient || isGroupCoordinator) && !canManageOrders;
  const canSeeOrderContext = canManageOrders || isGroupCoordinator;

  const pageDescription = canManageOrders
    ? 'Przeglądaj zamówienia i zarządzaj ich realizacją'
    : isGroupCoordinator
      ? canCreateOrders
        ? 'Przeglądaj zamówienia swojej grupy i składaj własne'
        : 'Przeglądaj zamówienia uczestników swojej grupy'
      : 'Składaj zamówienia i sprawdzaj ich status';

  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [orderOptions, setOrderOptions] = useState<OrderOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [orderToConfirm, setOrderToConfirm] =
    useState<OrderFormValues | null>(null);
  const [statusChangeToConfirm, setStatusChangeToConfirm] =
    useState<OrderStatusChange | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedStatusName, setSelectedStatusName] = useState('');
  const [sortOption, setSortOption] =
    useState<OrdersSortOption>('createdDesc');

  const availableStatusNames = useMemo(() => {
    const statusNames = new Set(
      orders
        .map((order) => order.orderStatusName)
        .filter(Boolean) as string[],
    );

    // Wybrany status pozostaje na liście, gdy ostatnie pasujące zamówienie zmieni status
    if (selectedStatusName) {
      statusNames.add(selectedStatusName);
    }

    return Array.from(statusNames);
  }, [orders, selectedStatusName]);

  // Wyszukiwanie, filtrowanie i sortowanie odbywa się lokalnie na pobranych danych
  const filteredOrders = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    return orders
      .filter((order) => {
        const searchableText = [
          order.dishName,
          order.groupName,
          order.customerEmail,
          order.orderStatusName
            ? getOrderStatusLabel(order.orderStatusName)
            : '',
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesSearchText =
          normalizedSearchText.length === 0 ||
          searchableText.includes(normalizedSearchText);

        const matchesStatus =
          !selectedStatusName ||
          order.orderStatusName === selectedStatusName;

        return matchesSearchText && matchesStatus;
      })
      .sort((firstOrder, secondOrder) => {
        const firstCreatedAt = new Date(firstOrder.createdAt).getTime();
        const secondCreatedAt = new Date(secondOrder.createdAt).getTime();
        const firstMenuDate = new Date(
          firstOrder.menuDate ?? firstOrder.createdAt,
        ).getTime();
        const secondMenuDate = new Date(
          secondOrder.menuDate ?? secondOrder.createdAt,
        ).getTime();

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

  // Szczegóły wybranego zamówienia są przygotowywane dla dialogu potwierdzenia
  const orderConfirmationDetails =
    useMemo<OrderConfirmationDetails | null>(() => {
      if (!orderToConfirm || !orderOptions) {
        return null;
      }

      const menuDay = orderOptions.menuDays.find(
        (option) => option.id === orderToConfirm.menuDayId,
      );
      const dish = menuDay?.dishes.find(
        (option) => option.id === orderToConfirm.dishId,
      );
      const addons =
        menuDay?.addons.filter((option) =>
          orderToConfirm.addonIds.includes(option.id),
        ) ?? [];

      return {
        menuDate: menuDay?.menuDate,
        dishName: dish?.name,
        addonNames: addons
          .map((addon) => addon.name)
          .filter((name): name is string => Boolean(name)),
      };
    }, [orderOptions, orderToConfirm]);

  // Pobiera dane odpowiednie dla roli aktualnego użytkownika
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (canManageOrders) {
        const [ordersData, statusesData] = await Promise.all([
          getOrders(),
          getOrderStatuses(),
        ]);
        setOrders(ordersData);
        setStatuses(statusesData);
        setOrderOptions(null);
        return;
      }

      if (isGroupCoordinator) {
        // Koordynator widzi zamówienia grupy oraz własne zamówienia bez duplikatów
        const [coordinatorOrders, myOrders, optionsData] =
          await Promise.all([
            getCoordinatorOrders(),
            getMyOrders(),
            getOrderOptions(),
          ]);
        const ordersById = new Map(
          [...coordinatorOrders, ...myOrders].map((order) => [
            order.id,
            order,
          ]),
        );

        setOrders(Array.from(ordersById.values()));
        setStatuses([]);
        setOrderOptions(optionsData);
        return;
      }

      if (canCreateOrders) {
        const [ordersData, statusesData, optionsData] =
          await Promise.all([
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
      setErrorMessage(
        getApiErrorMessage(error, 'Nie udało się pobrać zamówień'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [canCreateOrders, canManageOrders, isGroupCoordinator]);

  async function handleConfirmOrder() {
    if (!orderOptions?.groupMemberId || !orderToConfirm) {
      setErrorMessage('Konto nie jest aktywnym uczestnikiem grupy');
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
      setErrorMessage(
        getApiErrorMessage(error, 'Nie udało się złożyć zamówienia'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitOrderForm(values: OrderFormValues) {
    // Zamówienie wymaga potwierdzenia, ponieważ nie można później zmienić wyboru
    setOrderToConfirm(values);
  }

  async function handleChangeOrderStatus(
    orderId: string,
    orderStatusId: string,
  ) {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const updatedOrder = await changeOrderStatus(orderId, {
        orderStatusId,
      });

      // Podmiana jednego zamówienia zachowuje pozycję użytkownika i aktywne filtry
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
      );
    } catch (error) {
      // Komunikat błędu zmiany statusu pochodzi z odpowiedzi backendu
      setErrorMessage(
        getApiErrorMessage(
          error,
          'Nie udało się zmienić statusu zamówienia',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleStatusSelection(order: Order, orderStatusId: string) {
    const nextStatus = statuses.find(
      (status) => status.id === orderStatusId,
    );

    if (!nextStatus) {
      return;
    }

    if (nextStatus.isFinal) {
      // Status finalny wymaga potwierdzenia, ponieważ blokuje kolejne zmiany
      setStatusChangeToConfirm({
        order,
        status: nextStatus,
      });
      return;
    }

    void handleChangeOrderStatus(order.id, nextStatus.id);
  }

  function handleClearFilters() {
    setSearchText('');
    setSelectedStatusName('');
  }

  async function handleConfirmFinalStatusChange() {
    if (!statusChangeToConfirm) {
      return;
    }

    await handleChangeOrderStatus(
      statusChangeToConfirm.order.id,
      statusChangeToConfirm.status.id,
    );
    setStatusChangeToConfirm(null);
  }

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <Stack spacing={3}>
      {/* Nagłówek strony opisuje zakres obsługi zamówień */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Zamówienia
        </Typography>
        <Typography color="text.secondary">{pageDescription}</Typography>
      </Box>

      {/* Główna akcja utworzenia własnego zamówienia */}
      {canCreateOrders && (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: 'flex-end' }}
        >
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setIsFormOpen(true)}
            disabled={
              !orderOptions?.groupMemberId ||
              orderOptions.menuDays.length === 0
            }
          >
            Złóż zamówienie
          </Button>
        </Stack>
      )}

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {canCreateOrders && !isLoading && !orderOptions?.groupMemberId && (
        <Alert severity="info" variant="outlined">
          {isGroupCoordinator
            ? 'Aby złożyć własne zamówienie, konto musi mieć aktywne uczestnictwo w grupie'
            : 'Twoje konto nie jest aktywnym uczestnikiem grupy. Aby uzyskać dostęp do zamówień, skontaktuj się z pracownikiem cateringu'}
        </Alert>
      )}

      {/* Filtry pozostają widoczne również po zmianie statusu zamówienia */}
      {!isLoading && orders.length > 0 && (
        <OrdersFilters
          searchText={searchText}
          selectedStatusName={selectedStatusName}
          sortOption={sortOption}
          statusNames={availableStatusNames}
          onSearchTextChange={setSearchText}
          onStatusNameChange={setSelectedStatusName}
          onSortOptionChange={setSortOption}
        />
      )}

      {canCreateOrders &&
        !isLoading &&
        orderOptions?.groupMemberId &&
        orderOptions.menuDays.length === 0 && (
          <Alert severity="info" variant="outlined">
            Brak dostępnego menu. Nie możesz teraz złożyć zamówienia.
          </Alert>
        )}

      {/* Sekcja odpowiada za stan ładowania, puste stany i listę kart */}
      <OrdersListSection
        visibleOrders={filteredOrders}
        totalOrderCount={orders.length}
        statuses={statuses}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        canManageOrders={canManageOrders}
        canSeeOrderContext={canSeeOrderContext}
        onStatusSelect={handleStatusSelection}
        onClearFilters={handleClearFilters}
      />

      {/* Formularz jest montowany przy otwarciu, dlatego zawsze zaczyna od aktualnych opcji */}
      {isFormOpen && (
        <OrderForm
          open={isFormOpen}
          isSubmitting={isSubmitting}
          options={orderOptions}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitOrderForm}
        />
      )}

      <OrderConfirmationDialog
        open={Boolean(orderToConfirm)}
        details={orderConfirmationDetails}
        isSubmitting={isSubmitting}
        onClose={() => setOrderToConfirm(null)}
        onConfirm={handleConfirmOrder}
      />

      <FinalStatusChangeDialog
        statusChange={statusChangeToConfirm}
        isSubmitting={isSubmitting}
        onClose={() => setStatusChangeToConfirm(null)}
        onConfirm={handleConfirmFinalStatusChange}
      />
    </Stack>
  );
}
