import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Order, OrderStatus } from '../../types/orderTypes';
import {
  formatOrderDate,
  formatOrderDateTime,
  getOrderStatusColor,
  getOrderStatusLabel,
} from './orderPresentation';

type OrdersListSectionProps = {
  visibleOrders: Order[];
  totalOrderCount: number;
  statuses: OrderStatus[];
  isLoading: boolean;
  isSubmitting: boolean;
  canManageOrders: boolean;
  canSeeOrderContext: boolean;
  onStatusSelect: (order: Order, orderStatusId: string) => void;
  onClearFilters: () => void;
};

type OrderCardProps = {
  order: Order;
  statuses: OrderStatus[];
  activeStatuses: OrderStatus[];
  isSubmitting: boolean;
  canManageOrders: boolean;
  canSeeOrderContext: boolean;
  onStatusSelect: (order: Order, orderStatusId: string) => void;
};

// Pojedyncza karta prezentuje dane zamówienia i pozwala obsłużyć jego status
function OrderCard({
  order,
  statuses,
  activeStatuses,
  isSubmitting,
  canManageOrders,
  canSeeOrderContext,
  onStatusSelect,
}: OrderCardProps) {
  const currentStatus = statuses.find(
    (status) => status.id === order.orderStatusId,
  );
  const isFinalStatus = currentStatus?.isFinal ?? false;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: 'space-between', gap: 2 }}
          >
            <Box>
              <Typography variant="h6">
                {order.dishName ?? 'Brak nazwy dania'}
              </Typography>
              {order.menuDate && (
                <Typography variant="body2" color="text.secondary">
                  Dzień menu: {formatOrderDate(order.menuDate)}
                </Typography>
              )}
            </Box>

            <Chip
              color={getOrderStatusColor(order.orderStatusName)}
              variant="outlined"
              label={getOrderStatusLabel(order.orderStatusName)}
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
                  Zamawiający: {order.customerEmail}
                </Typography>
              )}
            </Stack>
          )}

          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Dodatki
            </Typography>
            {order.addons.length > 0 ? (
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                {order.addons.map((addon) => (
                  <Chip
                    key={addon.addonId}
                    label={addon.addonName}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">
                Brak dodatków
              </Typography>
            )}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Złożono: {formatOrderDateTime(order.createdAt)}
          </Typography>

          {canManageOrders && (
            <TextField
              label="Status"
              value={order.orderStatusId}
              onChange={(event) =>
                onStatusSelect(order, event.target.value)
              }
              select
              fullWidth
              disabled={isSubmitting || isFinalStatus}
            >
              {activeStatuses.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {getOrderStatusLabel(status.name)}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function OrdersListSection({
  visibleOrders,
  totalOrderCount,
  statuses,
  isLoading,
  isSubmitting,
  canManageOrders,
  canSeeOrderContext,
  onStatusSelect,
  onClearFilters,
}: OrdersListSectionProps) {
  const activeStatuses = statuses.filter((status) => status.isActive);

  // Stan ładowania zastępuje listę do czasu pobrania danych
  if (isLoading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography color="text.secondary">
              Pobieranie zamówień…
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Osobny pusty stan informuje, że aktywne filtry nie zwróciły wyników
  if (totalOrderCount > 0 && visibleOrders.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack
            spacing={1.5}
            sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}
          >
            <AssignmentOutlinedIcon color="primary" fontSize="large" />
            <Typography variant="h6">Brak wyników</Typography>
            <Typography color="text.secondary">
              Brak zamówień spełniających wybrane kryteria
            </Typography>
            <Button variant="outlined" onClick={onClearFilters}>
              Wyczyść filtry
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (totalOrderCount === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack
            spacing={1.5}
            sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}
          >
            <AssignmentOutlinedIcon color="primary" fontSize="large" />
            <Typography variant="h6">Brak zamówień</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          lg: 'repeat(2, minmax(0, 1fr))',
        },
        gap: 2,
      }}
    >
      {visibleOrders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          statuses={statuses}
          activeStatuses={activeStatuses}
          isSubmitting={isSubmitting}
          canManageOrders={canManageOrders}
          canSeeOrderContext={canSeeOrderContext}
          onStatusSelect={onStatusSelect}
        />
      ))}
    </Box>
  );
}
