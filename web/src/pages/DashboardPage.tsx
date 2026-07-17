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
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
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
import {
  DashboardActionsGrid,
  type DashboardActionItem,
} from '../components/dashboard/DashboardActionsGrid';
import {
  OfferDashboardSection,
  type OfferSummaryItem,
  type RecentOfferItem,
} from '../components/dashboard/OfferDashboardSection';
import { OrderDashboardSection } from '../components/dashboard/OrderDashboardSection';
import { useAuth } from '../hooks/useAuth';
import { roleLabels, roles, type UserRole } from '../types/authTypes';
import type { Order } from '../types/orderTypes';
import { hasSeededPasswordChanged } from '../utils/securityNoticeStorage';

// Uprawnienia określają, dla których ról karta jest dostępna
type DashboardAction = DashboardActionItem & {
  allowedRoles: UserRole[];
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
    description:
      'Zarządzanie kontami, rolami oraz przypisaniem użytkowników do grup',
    path: '/users',
    icon: <PeopleAltOutlinedIcon />,
    allowedRoles: [roles.admin],
  },
  {
    title: 'Grupy',
    description:
      'Obsługa grup żywieniowych, koordynatorów oraz uczestników grup',
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
    description:
      'Katalog dodatków dostępnych przy budowaniu menu i składaniu zamówień',
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
    description:
      'Menu dzienne, pakiety oraz przypisanie dań do konkretnych terminów',
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

// Łączy listy zamówień i usuwa ewentualne duplikaty
function mergeOrders(orders: Order[]) {
  return Array.from(new Map(orders.map((order) => [order.id, order])).values());
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
  const canShowOfferDashboard = isDietitian && !canShowOrderDashboard;

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
  const [recentOfferItems, setRecentOfferItems] = useState<
    RecentOfferItem[]
  >([]);
  const [isOfferLoading, setIsOfferLoading] = useState(
    canShowOfferDashboard,
  );
  const [offerErrorMessage, setOfferErrorMessage] = useState('');

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
        const [dishes, addons, packages, menuPeriods] = await Promise.all([
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
            active: packages.filter((packageItem) => packageItem.isActive)
              .length,
          },
          {
            label: 'Okresy menu',
            total: menuPeriods.length,
            active: menuPeriods.filter((period) => period.isActive).length,
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
                new Date(secondItem.createdAt ?? '').getTime() -
                new Date(firstItem.createdAt ?? '').getTime(),
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

      {/* Sekcja zamówień jest widoczna dla ról uczestniczących w ich obsłudze */}
      {canShowOrderDashboard && (
        <OrderDashboardSection
          orders={dashboardOrders}
          isLoading={isOrdersLoading}
          errorMessage={ordersErrorMessage}
          title={orderDashboardTitle}
          description={orderDashboardDescription}
        />
      )}

      {/* Podsumowanie oferty jest przeznaczone dla Dietetyka */}
      {canShowOfferDashboard && (
        <OfferDashboardSection
          summary={offerSummary}
          recentItems={recentOfferItems}
          isLoading={isOfferLoading}
          errorMessage={offerErrorMessage}
        />
      )}

      {/* Karty funkcjonalności odpowiadają uprawnieniom aktualnego użytkownika */}
      <DashboardActionsGrid actions={availableActions} />
    </Stack>
  );
}
