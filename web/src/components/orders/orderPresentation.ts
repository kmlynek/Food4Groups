import type { ChipProps } from '@mui/material';

// Polskie etykiety statusów wykorzystywane w widoku zamówień
const orderStatusLabels: Record<string, string> = {
  Created: 'Złożone',
  Accepted: 'Przyjęte',
  Prepared: 'Przygotowane',
  Completed: 'Zrealizowane',
  Cancelled: 'Anulowane',
};

export function formatOrderDate(value?: string) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function formatOrderDateTime(value?: string) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function getOrderStatusLabel(statusName?: string) {
  if (!statusName) {
    return 'Brak statusu';
  }

  return orderStatusLabels[statusName] ?? statusName;
}

export function getOrderStatusColor(
  statusName?: string,
): ChipProps['color'] {
  if (statusName === 'Accepted') {
    return 'info';
  }

  if (statusName === 'Prepared') {
    return 'warning';
  }

  if (statusName === 'Completed') {
    return 'success';
  }

  if (statusName === 'Cancelled') {
    return 'error';
  }

  return 'primary';
}
