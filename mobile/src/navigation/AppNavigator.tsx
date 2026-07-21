import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useAuth } from '../auth';
import { AccountScreen } from '../screens/AccountScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { navigationTheme } from '../theme';

type RootStackParamList = {
  Login: undefined;
  Account: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Nawigator przełącza dostępne ekrany na podstawie bieżącego stanu sesji.
export function AppNavigator() {
  const { session, isLoading } = useAuth();

  // Ekran ładowania zapobiega pokazaniu formularza przed odczytaniem zapisanej sesji.
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
      <Stack.Navigator>
        {session ? (
          <Stack.Screen
            name="Account"
            component={AccountScreen}
            options={{
              title: 'Moje konto',
              headerShadowVisible: false,
            }}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
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