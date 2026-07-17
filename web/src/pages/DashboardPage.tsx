import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAddons } from '../api/addonsApi';
import { getApiErrorMessage } from '../api/apiError';
import { getDishes } from '../api/dishesApi';
import { getMenuPeriods } from '../api/menuPeriodsApi';
import {
  getCoordinatorOrders,
  getMyOrders,
  getOrders,
} from '../api/ordersApi';
import { getPackages } from '../api/packagesApi';
import { useAuth } from '../hooks/useAuth';
import { roleLabels, roles, type UserRole } from '../types/authTypes';
import type { Order } from '../types/orderTypes';
import { hasSeededPasswordChanged } from '../utils/securityNoticeStorage';

// Karta funkcjonalności wyświetlana na pulpicie
type DashboardAction = {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[];
};

// Podsumowanie liczby aktywnych i wszystkich elementów oferty
type OfferSummaryItem = {
  label: string;
  total: number;
  active: number;
};

// Ostatnio dodany element prezentowany na pulpicie
type RecentOfferItem = {
  id: string;
  title: string;
  type: string;
  createdAt?: string;
  path: string;
};

// Polskie etykiety statusów zamówień
const orderStatusLabels: Record<string, string> = {
  Created: 'Złożone',
  Accepted: 'Przyjęte',
  Prepared: 'Przygotowane',
  Completed: 'Zrealizowane',
  Cancelled: 'Anulowane',
};

// Kolejność prezentacji statusów zamówień
const orderStatusOrder = ['Created', 'Accepted', 'Prepared', 'Completed', 'Cancelled'];

// Kolory przypisane do poszczególnych statusów zamówień
const orderStatusColors: Record<string, string> = {
  Created: 'primary.main',
  Accepted: 'info.main',
  Prepared: 'warning.main',
  Completed: 'success.main',
  Cancelled: 'error.main',
};

// Konta tworzone automatycznie podczas inicjalizacji aplikacji
const seededAccountEmails = [
  'admin@food4groups.com',
  'catering@food4groups.com',
  'dietitian@food4groups.com',
  'coordinator@food4groups.com',
  'user@food4groups.com',
];

// Moduły dostępne na pulpicie w zależności od roli użytkownika
const dashboardActions: DashboardAction[] = [
  {
    title: 'Użytkownicy',
    description: 'Zarządzanie kontami, rolami oraz przypisaniem użytkowników do grup',
    path: '/users',
    icon: <PeopleAltOutlinedIcon />,
    allowedRoles: [roles.admin],
  },
  {
    title: 'Grupy',
    description: 'Obsługa grup żywieniowych, koordynatorów oraz uczestników grup',
    path: '/groups',
    icon: <GroupOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee],
  },
  {
    title: 'Dania',
    description: 'Katalog dań i zarządzanie ich dostępnością w ofercie',
    path: '/dishes',
    icon: <RestaurantMenuOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee, roles.dietitian],
  },
  {
    title: 'Dodatki',
    description: 'Katalog dodatków dostępnych przy budowaniu menu i składaniu zamówień',
    path: '/addons',
    icon: <ExtensionOutlinedIcon />,
    allowedRoles: [
      roles.admin,
      roles.cateringEmployee,
      roles.dietitian,
      roles.groupCoordinator,
      roles.user,
    ],
  },
  {
    title: 'Pakiety',
    description: 'Zestawy dań i dodatków przypisane do grup żywieniowych',
    path: '/packages',
    icon: <Inventory2OutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee, roles.dietitian],
  },
  {
    title: 'Menu',
    description: 'Menu dzienne, pakiety oraz przypisanie dań do konkretnych terminów',
    path: '/menus',
    icon: <MenuBookOutlinedIcon />,
    allowedRoles: [roles.admin, roles.cateringEmployee, roles.dietitian],
  },
  {
    title: 'Zamówienia',
    description: 'Składanie zamówień, przegląd realizacji oraz statusów',
    path: '/orders',
    icon: <AssignmentOutlinedIcon />,
    allowedRoles: [
      roles.admin,
      roles.cateringEmployee,
      roles.groupCoordinator,
      roles.user,
    ],
  },
  {
    title: 'Raporty',
    description: 'Raporty rozliczeniowe i zestawienia',
    path: '/reports',
    icon: <AssessmentOutlinedIcon />,
    allowedRoles: [
      roles.admin,
      roles.cateringEmployee,
      roles.groupCoordinator,
    ],
  },
];

// Formatuje datę zgodnie z polskimi ustawieniami regionalnymi
function formatDate(value?: string) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

// Zwraca etykietę statusu wyświetlaną w interfejsie
function getStatusLabel(statusName?: string) {
  if (!statusName) {
    return 'Brak statusu';
  }

  return orderStatusLabels[statusName] ?? statusName;
}

// Odmienia liczbę zamówień zgodnie z zasadami języka polskiego
function formatOrderCount(count: number) {
  if (count === 1) {
    return '1 zamówienie';
  }

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    (lastTwoDigits < 12 || lastTwoDigits > 14)
  ) {
    return `${count} zamówienia`;
  }

  return `${count} zamówień`;
}

// Łączy listy zamówień i usuwa ewentualne duplikaty
function mergeOrders(orders: Order[]) {
  return Array.from(new Map(orders.map((order) => [order.id, order])).values());
}

// Oblicza procent aktywnych elementów oferty
function getActivePercent(item: OfferSummaryItem) {
  if (item.total === 0) {
    return 0;
  }

  return Math.round((item.active / item.total) * 100);
}

export function DashboardPage() {
  const { auth } = useAuth();
  const userRoles = auth?.user.roles ?? [];

  // Uprawnienia określają zakres danych prezentowanych na pulpicie
  const canManageOrders =
    userRoles.includes(roles.admin) ||
    userRoles.includes(roles.cateringEmployee);
  const isGroupCoordinator = userRoles.includes(roles.groupCoordinator);
  const isClient = userRoles.includes(roles.user);
  const isDietitian = userRoles.includes(roles.dietitian);
  const canShowOrderDashboard =
    canManageOrders || isGroupCoordinator || isClient;
  const canShowOfferDashboard =
    isDietitian && !canShowOrderDashboard;

  // Karty funkcjonalności są filtrowane na podstawie ról użytkownika
  const availableActions = dashboardActions.filter((action) =>
    action.allowedRoles.some((role) => userRoles.includes(role)),
  );

  const [dashboardOrders, setDashboardOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(
    canShowOrderDashboard,
  );
  const [ordersErrorMessage, setOrdersErrorMessage] = useState('');
  const [offerSummary, setOfferSummary] = useState<OfferSummaryItem[]>([]);
  const [recentOfferItems, setRecentOfferItems] = useState<RecentOfferItem[]>([]);
  const [isOfferLoading, setIsOfferLoading] = useState(
    canShowOfferDashboard,
  );
  const [offerErrorMessage, setOfferErrorMessage] = useState('');

  // Pulpit prezentuje maksymalnie pięć ostatnich zamówień
  const recentOrders = useMemo(
    () =>
      [...dashboardOrders]
        .sort(
          (firstOrder, secondOrder) =>
            new Date(secondOrder.createdAt).getTime() -
            new Date(firstOrder.createdAt).getTime(),
        )
        .slice(0, 5),
    [dashboardOrders],
  );

  // Podsumowanie grupuje zamówienia według ich aktualnego statusu
  const statusSummary = useMemo(() => {
    if (dashboardOrders.length === 0) {
      return [];
    }

    const statusCounts = new Map<string, number>();

    dashboardOrders.forEach((order) => {
      const statusName = order.orderStatusName ?? '';
      statusCounts.set(
        statusName,
        (statusCounts.get(statusName) ?? 0) + 1,
      );
    });

    return Array.from(statusCounts.entries())
      .map(([statusName, count]) => ({
        statusName,
        count,
        label: getStatusLabel(statusName),
        percent: Math.round(
          (count / dashboardOrders.length) * 100,
        ),
        color: orderStatusColors[statusName] ?? 'grey.500',
      }))
      .sort((firstStatus, secondStatus) => {
        const firstIndex = orderStatusOrder.indexOf(
          firstStatus.statusName,
        );
        const secondIndex = orderStatusOrder.indexOf(
          secondStatus.statusName,
        );

        if (firstIndex === -1 && secondIndex === -1) {
          return firstStatus.label.localeCompare(
            secondStatus.label,
          );
        }

        if (firstIndex === -1) {
          return 1;
        }

        if (secondIndex === -1) {
          return -1;
        }

        return firstIndex - secondIndex;
      });
  }, [dashboardOrders]);

  // Tytuł i opis sekcji zamówień zależą od roli użytkownika
  const orderDashboardTitle = canManageOrders
    ? 'Podsumowanie zamówień'
    : isGroupCoordinator
      ? 'Zamówienia grupy i własne'
      : 'Moje zamówienia';

  const orderDashboardDescription = canManageOrders
    ? 'Bieżący obraz realizacji zamówień'
    : isGroupCoordinator
      ? 'Bieżący stan zamówień grupy i Twoich zamówień'
      : 'Ostatnia aktywność na Twoim koncie';

  // Alert bezpieczeństwa dotyczy wyłącznie kont korzystających z hasła startowego
  const isSeededAccount = auth?.user.email
    ? seededAccountEmails.includes(auth.user.email.toLowerCase())
    : false;

  const isSeededPasswordChanged = auth?.user.email
    ? hasSeededPasswordChanged(auth.user.email)
    : false;

  const shouldShowSeededAccountAlert =
    isSeededAccount && !isSeededPasswordChanged;

  // Pobiera dane zamówień odpowiednie dla roli użytkownika
  useEffect(() => {
    if (!canShowOrderDashboard) {
      setDashboardOrders([]);
      setIsOrdersLoading(false);
      return;
    }

    // Flaga zapobiega aktualizacji stanu po odmontowaniu komponentu
    let isActive = true;

    async function loadDashboardOrders() {
      setIsOrdersLoading(true);
      setOrdersErrorMessage('');

      try {
        if (canManageOrders) {
          const ordersData = await getOrders();

          if (isActive) {
            setDashboardOrders(ordersData);
          }

          return;
        }

        // Koordynator otrzymuje zamówienia swojej grupy oraz własne zamówienia bez duplikatów
        if (isGroupCoordinator) {
          const [coordinatorOrders, myOrders] = await Promise.all([
            getCoordinatorOrders(),
            getMyOrders(),
          ]);

          if (isActive) {
            setDashboardOrders(
              mergeOrders([...coordinatorOrders, ...myOrders]),
            );
          }

          return;
        }

        if (isClient) {
          const myOrders = await getMyOrders();

          if (isActive) {
            setDashboardOrders(myOrders);
          }
        }
      } catch (error) {
        if (isActive) {
          setDashboardOrders([]);
          setOrdersErrorMessage(
            getApiErrorMessage(
              error,
              'Nie udało się pobrać podsumowania zamówień',
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsOrdersLoading(false);
        }
      }
    }

    void loadDashboardOrders();

    return () => {
      isActive = false;
    };
  }, [
    canManageOrders,
    canShowOrderDashboard,
    isClient,
    isGroupCoordinator,
  ]);

  // Pobiera podsumowanie oferty prezentowane Dietetykowi
  useEffect(() => {
    if (!canShowOfferDashboard) {
      setOfferSummary([]);
      setRecentOfferItems([]);
      setIsOfferLoading(false);
      return;
    }

    // Flaga zapobiega aktualizacji stanu po odmontowaniu komponentu
    let isActive = true;

    async function loadOfferDashboard() {
      setIsOfferLoading(true);
      setOfferErrorMessage('');

      try {
        // Dane oferty są pobierane równolegle w celu skrócenia czasu ładowania
        const [dishes, addons, packages, menuPeriods] =
          await Promise.all([
            getDishes(),
            getAddons(),
            getPackages(),
            getMenuPeriods(),
          ]);

        if (!isActive) {
          return;
        }

        setOfferSummary([
          {
            label: 'Dania',
            total: dishes.length,
            active: dishes.filter((dish) => dish.isActive).length,
          },
          {
            label: 'Dodatki',
            total: addons.length,
            active: addons.filter((addon) => addon.isActive).length,
          },
          {
            label: 'Pakiety',
            total: packages.length,
            active: packages.filter(
              (packageItem) => packageItem.isActive,
            ).length,
          },
          {
            label: 'Okresy menu',
            total: menuPeriods.length,
            active: menuPeriods.filter(
              (period) => period.isActive,
            ).length,
          },
        ]);

        // Lista łączy ostatnio dodane elementy różnych części oferty
        setRecentOfferItems(
          [
            ...dishes.map((dish) => ({
              id: dish.id,
              title: dish.name,
              type: 'Danie',
              createdAt: dish.createdAt,
              path: '/dishes',
            })),
            ...addons.map((addon) => ({
              id: addon.id,
              title: addon.name,
              type: 'Dodatek',
              createdAt: addon.createdAt,
              path: '/addons',
            })),
            ...packages.map((packageItem) => ({
              id: packageItem.id,
              title: packageItem.name,
              type: 'Pakiet',
              createdAt: packageItem.createdAt,
              path: '/packages',
            })),
            ...menuPeriods.map((period) => ({
              id: period.id,
              title: period.name,
              type: 'Okres menu',
              createdAt: period.createdAt,
              path: '/menus',
            })),
          ]
            .filter((item) => Boolean(item.createdAt))
            .sort(
              (firstItem, secondItem) =>
                new Date(
                  secondItem.createdAt ?? '',
                ).getTime() -
                new Date(
                  firstItem.createdAt ?? '',
                ).getTime(),
            )
            .slice(0, 5),
        );
      } catch (error) {
        if (isActive) {
          setOfferSummary([]);
          setRecentOfferItems([]);
          setOfferErrorMessage(
            getApiErrorMessage(
              error,
              'Nie udało się pobrać podsumowania oferty',
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsOfferLoading(false);
        }
      }
    }

    void loadOfferDashboard();

    return () => {
      isActive = false;
    };
  }, [canShowOfferDashboard]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Pulpit
        </Typography>
        <Typography color="text.secondary">
          Najważniejsze obszary pracy dostępne dla Twojej roli w systemie
        </Typography>
      </Box>

       {/* Rola użytkownika jest prezentowana za pomocą czytelnej etykiety */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        {userRoles.map((role) => (
          <Chip
            key={role}
            color="primary"
            variant="outlined"
            label={roleLabels[role]}
          />
        ))}
      </Stack>

      {/* Alert przypomina o zmianie hasła startowego konta testowego */}
      {shouldShowSeededAccountAlert && (
        <Alert
          severity="warning"
          variant="filled"
          sx={{
            mt: 3,
            mb: 2,
            boxShadow: 3,
            fontSize: '1rem',
            alignItems: 'center',
          }}
          action={
            <Button
              component={Link}
              to="/account"
              color="inherit"
              variant="outlined"
            >
              Zmień hasło
            </Button>
          }
        >
          Konto korzysta z hasła startowego.{' '}
          <strong>Zalecamy jego zmianę</strong>
        </Alert>
      )}

      {/* Podsumowanie zamówień jest widoczne dla ról uczestniczących w procesie zamawiania */}
      {canShowOrderDashboard && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '1.2fr 1fr',
            },
            gap: 2,
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: {
                      xs: 'flex-start',
                      sm: 'center',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="h6">
                      {orderDashboardTitle}
                    </Typography>
                    <Typography color="text.secondary">
                      {orderDashboardDescription}
                    </Typography>
                  </Box>

                  <Button
                    component={Link}
                    to="/orders"
                    variant="outlined"
                  >
                    Przejdź do zamówień
                  </Button>
                </Stack>

                {ordersErrorMessage && (
                  <Alert severity="error">
                    {ordersErrorMessage}
                  </Alert>
                )}

                {isOrdersLoading && (
                  <Stack
                    spacing={2}
                    sx={{ alignItems: 'center', py: 3 }}
                  >
                    <CircularProgress size={28} />
                    <Typography color="text.secondary">
                      Pobieranie podsumowania…
                    </Typography>
                  </Stack>
                )}

                {!isOrdersLoading &&
                  !ordersErrorMessage &&
                  dashboardOrders.length === 0 && (
                    <Typography color="text.secondary">
                      Brak zamówień
                    </Typography>
                  )}

                {!isOrdersLoading &&
                  !ordersErrorMessage &&
                  dashboardOrders.length > 0 && (
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: 'wrap', gap: 1 }}
                      >
                        <Chip
                          color="primary"
                          label={formatOrderCount(
                            dashboardOrders.length,
                          )}
                        />
                      </Stack>

                      <Stack
                        direction="row"
                        sx={{
                          height: 10,
                          overflow: 'hidden',
                          borderRadius: 1,
                          bgcolor: 'grey.100',
                        }}
                      >
                        {statusSummary.map((status) => (
                          <Box
                            key={status.statusName || 'empty'}
                            sx={{
                              width: `${status.percent}%`,
                              minWidth:
                                status.percent > 0 ? 8 : 0,
                              bgcolor: status.color,
                            }}
                          />
                        ))}
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: 'wrap', gap: 1 }}
                      >
                        {statusSummary.map((status) => (
                          <Chip
                            key={status.statusName || 'empty'}
                            size="small"
                            variant="outlined"
                            label={`${status.label}: ${status.count}`}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  )}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">
                  Ostatnie zamówienia
                </Typography>

                {ordersErrorMessage && (
                  <Typography color="text.secondary">
                    Ostatnie zamówienia są chwilowo niedostępne
                  </Typography>
                )}

                {isOrdersLoading && (
                  <Stack
                    spacing={2}
                    sx={{ alignItems: 'center', py: 3 }}
                  >
                    <CircularProgress size={28} />
                    <Typography color="text.secondary">
                      Pobieranie zamówień…
                    </Typography>
                  </Stack>
                )}

                {!isOrdersLoading &&
                  !ordersErrorMessage &&
                  recentOrders.length === 0 && (
                    <Typography color="text.secondary">
                      Brak ostatnich zamówień
                    </Typography>
                  )}

                {!isOrdersLoading &&
                  !ordersErrorMessage &&
                  recentOrders.length > 0 && (
                    <Stack spacing={1.5}>
                      {recentOrders.map((order) => (
                        <Stack
                          key={order.id}
                          direction="row"
                          spacing={1.5}
                          sx={{
                            justifyContent: 'space-between',
                            gap: 2,
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{ fontWeight: 600 }}
                              noWrap
                            >
                              {order.dishName ??
                                'Brak nazwy dania'}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {[
                                order.groupName,
                                order.customerEmail,
                                formatDate(order.menuDate),
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </Typography>
                          </Box>

                          <Chip
                            size="small"
                            variant="outlined"
                            label={getStatusLabel(
                              order.orderStatusName,
                            )}
                            sx={{ flexShrink: 0 }}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Podsumowanie oferty jest przeznaczone dla Dietetyka */}
      {canShowOfferDashboard && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '1.2fr 1fr',
            },
            gap: 2,
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6">
                    Podsumowanie oferty
                  </Typography>
                  <Typography color="text.secondary">
                    Aktywne elementy katalogu i menu
                  </Typography>
                </Box>

                {offerErrorMessage && (
                  <Alert severity="error">
                    {offerErrorMessage}
                  </Alert>
                )}

                {isOfferLoading && (
                  <Stack
                    spacing={2}
                    sx={{ alignItems: 'center', py: 3 }}
                  >
                    <CircularProgress size={28} />
                    <Typography color="text.secondary">
                      Pobieranie podsumowania…
                    </Typography>
                  </Stack>
                )}

                {!isOfferLoading && !offerErrorMessage && (
                  <Stack spacing={2}>
                    {offerSummary.map((item) => (
                      <Box key={item.label}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.75,
                          }}
                        >
                          <Typography
                            sx={{ fontWeight: 600 }}
                          >
                            {item.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Aktywne: {item.active} z {' '}
                            {item.total}
                          </Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={getActivePercent(item)}
                          sx={{
                            height: 8,
                            borderRadius: 1,
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">
                  Ostatnio dodane
                </Typography>

                {offerErrorMessage && (
                  <Typography color="text.secondary">
                    Lista ostatnich pozycji jest chwilowo niedostępna
                  </Typography>
                )}

                {isOfferLoading && (
                  <Stack
                    spacing={2}
                    sx={{ alignItems: 'center', py: 3 }}
                  >
                    <CircularProgress size={28} />
                    <Typography color="text.secondary">
                      Pobieranie pozycji…
                    </Typography>
                  </Stack>
                )}

                {!isOfferLoading &&
                  !offerErrorMessage &&
                  recentOfferItems.length === 0 && (
                    <Typography color="text.secondary">
                      Brak pozycji do pokazania
                    </Typography>
                  )}

                {!isOfferLoading &&
                  !offerErrorMessage &&
                  recentOfferItems.length > 0 && (
                    <Stack spacing={1.5}>
                      {recentOfferItems.map((item) => (
                        <Stack
                          key={`${item.type}-${item.id}`}
                          component={Link}
                          to={item.path}
                          direction="row"
                          spacing={1.5}
                          sx={{
                            justifyContent: 'space-between',
                            gap: 2,
                            color: 'inherit',
                            textDecoration: 'none',
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{ fontWeight: 600 }}
                              noWrap
                            >
                              {item.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {item.createdAt
                                ? `Dodano: ${formatDate(
                                  item.createdAt,
                                )}`
                                : 'Brak daty dodania'}
                            </Typography>
                          </Box>

                          <Chip
                            size="small"
                            variant="outlined"
                            label={item.type}
                            sx={{ flexShrink: 0 }}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Karty funkcjonalności odpowiadają zakresowi uprawnień aktualnego użytkownika */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {availableActions.map((action) => (
          <Card key={action.path} variant="outlined">
            <CardActionArea
              component={Link}
              to={action.path}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: 'rgba(46, 125, 50, 0.10)',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {action.icon}
                  </Box>

                  <Stack spacing={0.5}>
                    <Typography variant="h6">
                      {action.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {action.description}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
