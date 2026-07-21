import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClipboardList, UserRound } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useAuth } from '../auth';
import { AccountScreen } from '../screens/AccountScreen';
import { CreateOrderScreen } from '../screens/CreateOrderScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { navigationTheme } from '../theme';

type RootStackParamList = {
  Login: undefined;
};

type ClientTabParamList = {
  Orders: undefined;
  Account: undefined;
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  CreateOrder: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<ClientTabParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();

// Nawigator przełącza dostępne ekrany na podstawie bieżącego stanu sesji
export function AppNavigator() {
  const { session, isLoading } = useAuth();

  // Ekran ładowania zapobiega pokazaniu formularza przed odczytaniem zapisanej sesji
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Uruchamianie aplikacji...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {session ? (
        <ClientTabs />
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

// Dolne zakładki ograniczają nawigację do funkcji dostępnych Klientowi
function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShadowVisible: false,
        tabBarActiveTintColor: navigationTheme.colors.primary,
        tabBarInactiveTintColor: '#52605a',
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{
          title: 'Zamówienia',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <ClipboardList color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: 'Konto',
          tabBarIcon: ({ color, size }) => (
            <UserRound color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Stos zamówień oddziela listę od procesu tworzenia nowego zamówienia
function OrdersNavigator() {
  return (
    <OrdersStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
      <OrdersStack.Screen
        name="OrdersList"
        component={OrdersScreen}
        options={{ title: 'Zamówienia' }}
      />
      <OrdersStack.Screen
        name="CreateOrder"
        component={CreateOrderScreen}
        options={{ title: 'Nowe zamówienie' }}
      />
    </OrdersStack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f4f7f4',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#52605a',
    marginTop: 16,
  },
});
