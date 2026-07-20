import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import type { Order, OrderStatus } from '../../types/orderTypes';
import {
  formatOrderDate,
  getOrderStatusLabel,
} from './orderPresentation';

export type OrderConfirmationDetails = {
  menuDate?: string;
  dishName?: string;
  addonNames: string[];
};

export type OrderStatusChange = {
  order: Order;
  status: OrderStatus;
};

type OrderConfirmationDialogProps = {
  open: boolean;
  details: OrderConfirmationDetails | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type FinalStatusChangeDialogProps = {
  statusChange: OrderStatusChange | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function OrderConfirmationDialog({
  open,
  details,
  isSubmitting,
  onClose,
  onConfirm,
}: OrderConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Potwierdź zamówienie</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText>
            Złożyć zamówienie na <strong>{details?.dishName}</strong>
            {details?.menuDate ? (
              <>
                {' '}
                w dniu{' '}
                <strong>{formatOrderDate(details.menuDate)}</strong>
              </>
            ) : null}
            ? <br /> Po złożeniu zamówienia, nie będzie możliwości
            zmiany wybranego dania oraz dodatków.
          </DialogContentText>

          {details?.addonNames.length ? (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Wybrane dodatki
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}
              >
                {details.addonNames.map((addonName) => (
                  <Chip
                    key={addonName}
                    label={addonName}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          ) : (
            <Typography color="text.secondary">
              Zamówienie bez dodatków
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Anuluj
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Zapisywanie…' : 'Złóż zamówienie'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function FinalStatusChangeDialog({
  statusChange,
  isSubmitting,
  onClose,
  onConfirm,
}: FinalStatusChangeDialogProps) {
  return (
    <Dialog open={Boolean(statusChange)} onClose={onClose}>
      <DialogTitle>Potwierdź zmianę statusu</DialogTitle>

      <DialogContent>
        <DialogContentText>
          Ustawić status{' '}
          <strong>
            {getOrderStatusLabel(statusChange?.status.name)}
          </strong>{' '}
          dla zamówienia <strong>{statusChange?.order.dishName}</strong>?
          Po zapisaniu ponowna zmiana statusu nie będzie możliwa.
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Anuluj
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Zapisywanie…' : 'Zmień status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
