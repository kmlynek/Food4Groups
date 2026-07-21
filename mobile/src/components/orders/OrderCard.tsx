import { StyleSheet, View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';
import type { Order } from '../../orders';

const orderStatusLabels: Record<string, string> = {
  Created: 'Złożone',
  Accepted: 'Przyjęte',
  Prepared: 'Przygotowane',
  Completed: 'Zrealizowane',
  Cancelled: 'Anulowane',
};

// Kolory statusów odpowiadają etapom realizacji użytym w aplikacji webowej
const orderStatusColors: Record<
  string,
  { background: string; border: string; text: string }
> = {
  Created: {
    background: '#d1fae5',
    border: '#6ee7b7',
    text: '#065f46',
  },
  Accepted: {
    background: '#dbeafe',
    border: '#93c5fd',
    text: '#1e40af',
  },
  Prepared: {
    background: '#fef3c7',
    border: '#fcd34d',
    text: '#92400e',
  },
  Completed: {
    background: '#dcfce7',
    border: '#86efac',
    text: '#166534',
  },
  Cancelled: {
    background: '#fee2e2',
    border: '#fca5a5',
    text: '#991b1b',
  },
};

const fallbackStatusColors = {
  background: '#f3f4f6',
  border: '#d1d5db',
  text: '#374151',
};

type OrderCardProps = {
  order: Order;
};

// Karta prezentuje najważniejsze informacje o pojedynczym zamówieniu
export function OrderCard({ order }: OrderCardProps) {
  const addonNames = order.addons
    .map((addon) => addon.addonName)
    .filter((name): name is string => Boolean(name));
  const statusColors = getOrderStatusColors(order.orderStatusName);

  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.title}>
              {order.dishName ?? 'Brak nazwy dania'}
            </Text>
            <Text variant="bodyMedium" style={styles.secondaryText}>
              Dzień menu: {formatDate(order.menuDate)}
            </Text>
          </View>

          <Chip
            compact
            mode="outlined"
            style={[
              styles.statusChip,
              {
                backgroundColor: statusColors.background,
                borderColor: statusColors.border,
              },
            ]}
            textStyle={{ color: statusColors.text }}
          >
            {getOrderStatusLabel(order.orderStatusName)}
          </Chip>
        </View>

        <View style={styles.details}>
          <Text variant="labelLarge">Dodatki</Text>
          <Text variant="bodyMedium" style={styles.secondaryText}>
            {addonNames.length > 0
              ? addonNames.join(', ')
              : 'Brak dodatków'}
          </Text>
        </View>

        <Text variant="bodySmall" style={styles.secondaryText}>
          Złożono: {formatDateTime(order.createdAt)}
        </Text>
      </Card.Content>
    </Card>
  );
}

function getOrderStatusLabel(statusName?: string) {
  if (!statusName) {
    return 'Brak statusu';
  }

  return orderStatusLabels[statusName] ?? statusName;
}

function getOrderStatusColors(statusName?: string) {
  if (!statusName) {
    return fallbackStatusColors;
  }

  return orderStatusColors[statusName] ?? fallbackStatusColors;
}

function formatDate(value?: string) {
  if (!value) {
    return 'Brak daty';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Brak daty';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'long',
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Brak daty';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
  },
  content: {
    gap: 20,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: '#12372a',
    fontWeight: '700',
  },
  statusChip: {
    flexShrink: 0,
  },
  details: {
    gap: 4,
  },
  secondaryText: {
    color: '#52605a',
  },
});
