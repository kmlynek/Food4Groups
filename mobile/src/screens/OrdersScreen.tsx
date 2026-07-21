import { useFocusEffect } from '@react-navigation/native';
import { ClipboardList } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { getMyOrders, type Order } from '../orders';

const orderStatusLabels: Record<string, string> = {
  Created: 'Złożone',
  Accepted: 'Przyjęte',
  Prepared: 'Przygotowane',
  Completed: 'Zrealizowane',
  Cancelled: 'Anulowane',
};

// Ekran prezentuje historię oraz aktualne statusy zamówień Klienta
export function OrdersScreen() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadOrders = useCallback(async () => {
    if (!session) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      setOrders(await getMyOrders(session.token));
    } catch (error) {
      setOrders([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nie udało się pobrać zamówień',
      );
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Powrót do zakładki automatycznie pobiera aktualne statusy zamówień
  useFocusEffect(
    useCallback(() => {
      void loadOrders();
    }, [loadOrders]),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Moje zamówienia
        </Text>

        <Text variant="bodyMedium" style={styles.description}>
          Sprawdzaj wybrane posiłki i ich aktualne statusy
        </Text>

        {isLoading ? <OrdersLoadingState /> : null}

        {!isLoading && errorMessage ? (
          <OrdersErrorState
            message={errorMessage}
            onRetry={() => void loadOrders()}
          />
        ) : null}

        {!isLoading && !errorMessage && orders.length === 0 ? (
          <OrdersEmptyState />
        ) : null}

        {!isLoading && !errorMessage && orders.length > 0 ? (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function OrdersLoadingState() {
  return (
    <Card mode="outlined" style={styles.stateCard}>
      <Card.Content style={styles.stateContent}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge">Pobieranie zamówień...</Text>
      </Card.Content>
    </Card>
  );
}

type OrdersErrorStateProps = {
  message: string;
  onRetry: () => void;
};

function OrdersErrorState({ message, onRetry }: OrdersErrorStateProps) {
  return (
    <Card mode="outlined" style={styles.stateCard}>
      <Card.Content style={styles.stateContent}>
        <Text variant="titleMedium">Nie udało się pobrać zamówień</Text>
        <Text variant="bodyMedium" style={styles.stateDescription}>
          {message}
        </Text>
        <Button mode="outlined" onPress={onRetry}>
          Spróbuj ponownie
        </Button>
      </Card.Content>
    </Card>
  );
}

function OrdersEmptyState() {
  return (
    <Card mode="outlined" style={styles.stateCard}>
      <Card.Content style={styles.stateContent}>
        <ClipboardList color="#047857" size={40} />
        <Text variant="titleMedium">Brak zamówień</Text>
        <Text variant="bodyMedium" style={styles.stateDescription}>
          Nie masz jeszcze żadnych zamówień
        </Text>
      </Card.Content>
    </Card>
  );
}

type OrderCardProps = {
  order: Order;
};

function OrderCard({ order }: OrderCardProps) {
  const addonNames = order.addons
    .map((addon) => addon.addonName)
    .filter((name): name is string => Boolean(name));

  return (
    <Card mode="outlined" style={styles.orderCard}>
      <Card.Content style={styles.orderContent}>
        <View style={styles.orderHeader}>
          <View style={styles.orderTitleContainer}>
            <Text variant="titleMedium" style={styles.orderTitle}>
              {order.dishName ?? 'Brak nazwy dania'}
            </Text>
            <Text variant="bodyMedium" style={styles.secondaryText}>
              Dzień menu: {formatDate(order.menuDate)}
            </Text>
          </View>

          <Chip compact mode="outlined">
            {getOrderStatusLabel(order.orderStatusName)}
          </Chip>
        </View>

        <View style={styles.orderDetails}>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7f4',
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    color: '#12372a',
    fontWeight: '700',
  },
  description: {
    color: '#52605a',
    marginBottom: 24,
    marginTop: 4,
  },
  stateCard: {
    backgroundColor: '#ffffff',
  },
  stateContent: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 32,
  },
  stateDescription: {
    color: '#52605a',
    textAlign: 'center',
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#ffffff',
  },
  orderContent: {
    gap: 20,
  },
  orderHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  orderTitleContainer: {
    flex: 1,
    gap: 4,
  },
  orderTitle: {
    color: '#12372a',
    fontWeight: '700',
  },
  orderDetails: {
    gap: 4,
  },
  secondaryText: {
    color: '#52605a',
  },
});
