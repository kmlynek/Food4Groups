import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '../../types/orderTypes';

type OrderDashboardSectionProps = {
  orders: Order[];
  isLoading: boolean;
  errorMessage: string;
  title: string;
  description: string;
};

// Polskie etykiety statusów zamówień
const orderStatusLabels: Record<string, string> = {
  Created: 'Złożone',
  Accepted: 'Przyjęte',
  Prepared: 'Przygotowane',
  Completed: 'Zrealizowane',
  Cancelled: 'Anulowane',
};

// Kolejność prezentacji statusów odpowiada przebiegowi realizacji zamówienia
const orderStatusOrder = [
  'Created',
  'Accepted',
  'Prepared',
  'Completed',
  'Cancelled',
];

// Kolory rozróżniają statusy na pasku podsumowania
const orderStatusColors: Record<string, string> = {
  Created: 'primary.main',
  Accepted: 'info.main',
  Prepared: 'warning.main',
  Completed: 'success.main',
  Cancelled: 'error.main',
};

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

export function OrderDashboardSection({
  orders,
  isLoading,
  errorMessage,
  title,
  description,
}: OrderDashboardSectionProps) {
  // Sekcja prezentuje maksymalnie pięć ostatnich zamówień
  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (firstOrder, secondOrder) =>
            new Date(secondOrder.createdAt).getTime() -
            new Date(firstOrder.createdAt).getTime(),
        )
        .slice(0, 5),
    [orders],
  );

  // Podsumowanie grupuje zamówienia według ich aktualnego statusu
  const statusSummary = useMemo(() => {
    if (orders.length === 0) {
      return [];
    }

    const statusCounts = new Map<string, number>();

    orders.forEach((order) => {
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
        percent: Math.round((count / orders.length) * 100),
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
          return firstStatus.label.localeCompare(secondStatus.label);
        }

        if (firstIndex === -1) {
          return 1;
        }

        if (secondIndex === -1) {
          return -1;
        }

        return firstIndex - secondIndex;
      });
  }, [orders]);

  return (
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
                <Typography variant="h6">{title}</Typography>
                <Typography color="text.secondary">
                  {description}
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

            {errorMessage && (
              <Alert severity="error">{errorMessage}</Alert>
            )}

            {isLoading && (
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

            {!isLoading && !errorMessage && orders.length === 0 && (
              <Typography color="text.secondary">
                Brak zamówień
              </Typography>
            )}

            {!isLoading && !errorMessage && orders.length > 0 && (
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: 'wrap', gap: 1 }}
                >
                  <Chip
                    color="primary"
                    label={formatOrderCount(orders.length)}
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
                        minWidth: status.percent > 0 ? 8 : 0,
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
            <Typography variant="h6">Ostatnie zamówienia</Typography>

            {errorMessage && (
              <Typography color="text.secondary">
                Ostatnie zamówienia są chwilowo niedostępne
              </Typography>
            )}

            {isLoading && (
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

            {!isLoading &&
              !errorMessage &&
              recentOrders.length === 0 && (
                <Typography color="text.secondary">
                  Brak ostatnich zamówień
                </Typography>
              )}

            {!isLoading &&
              !errorMessage &&
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
                        <Typography sx={{ fontWeight: 600 }} noWrap>
                          {order.dishName ?? 'Brak nazwy dania'}
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
  );
}
