import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClipboardList, Plus } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { OrderCard } from '../components/orders/OrderCard';
import type { OrdersStackParamList } from '../navigation/AppNavigator';
import { getMyOrders, type Order } from '../orders';

type OrdersScreenProps = NativeStackScreenProps<
  OrdersStackParamList,
  'OrdersList'
>;

// Ekran prezentuje historię oraz aktualne statusy zamówień Klienta
export function OrdersScreen({ navigation }: OrdersScreenProps) {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadOrders = useCallback(async (isPullToRefresh = false) => {
    if (!session) {
      return;
    }

    if (isPullToRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

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
      if (isPullToRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
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
      <ScrollView
        alwaysBounceVertical
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor="#047857"
            colors={['#047857']}
            onRefresh={() => void loadOrders(true)}
          />
        }
      >
        <Text variant="titleLarge" style={styles.title}>
          Moje zamówienia
        </Text>

        <Text variant="bodyMedium" style={styles.description}>
          Sprawdzaj wybrane posiłki i ich aktualne statusy
        </Text>

        <Button
          mode="contained"
          icon={({ color, size }) => (
            <Plus color={color} size={size} />
          )}
          contentStyle={styles.createButtonContent}
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateOrder')}
        >
          Złóż zamówienie
        </Button>

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
    marginTop: 4,
  },
  createButton: {
    marginBottom: 24,
    marginTop: 20,
  },
  createButtonContent: {
    minHeight: 48,
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
});
