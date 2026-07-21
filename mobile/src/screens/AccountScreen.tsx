import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  Button,
  Card,
  Divider,
  HelperText,
  List,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { LogOut, Mail, UserRound } from 'lucide-react-native';

// Ekran prezentuje podstawowe dane zalogowanego Klienta i obsługuje wylogowanie
export function AccountScreen() {
  const { session, logout } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setErrorMessage('');
    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      setErrorMessage('Nie udało się wylogować');
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Dane konta
        </Text>

        <Text variant="bodyMedium" style={styles.description}>
          Podstawowe informacje o zalogowanym użytkowniku
        </Text>

        <Card mode="outlined" style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <List.Item
              title="Adres e-mail"
              description={session?.user.email ?? ''}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={({ color, size }) => (
                    <Mail color={color} size={size} />
                  )}
                />
              )}
            />

            <Divider />

            <List.Item
              title="Rola"
              description="Klient"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={({ color, size }) => (
                    <UserRound color={color} size={size} />
                  )}
                />
              )}
            />
          </Card.Content>
        </Card>

        {errorMessage ? (
          <HelperText type="error" visible>
            {errorMessage}
          </HelperText>
        ) : null}

        <Button
          mode="outlined"
          icon={({ color, size }) => (
            <LogOut color={color} size={size} />
          )}
          onPress={() => void handleLogout()}
          loading={isLoggingOut}
          disabled={isLoggingOut}
        >
          Wyloguj
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7f4',
  },
  content: {
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
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 24,
  },
  cardContent: {
    paddingVertical: 4,
  },
});