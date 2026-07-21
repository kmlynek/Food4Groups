import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { UtensilsCrossed } from 'lucide-react-native';

// Ekran odpowiada za zebranie danych logowania i rozpoczęcie sesji Klienta
export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage('Podaj adres e-mail');
      return;
    }

    if (!password) {
      setErrorMessage('Podaj hasło');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(normalizedEmail, password);
    } catch (error) {
      // Komunikat pochodzi z backendu 
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nie udało się zalogować',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Avatar.Icon
              icon={({ color, size }) => (
                <UtensilsCrossed color={color} size={size} />
              )}
              size={64}
              style={styles.logo}
            />

            <Text variant="headlineMedium" style={styles.title}>
              Food4Groups
            </Text>

            <Text variant="bodyLarge" style={styles.description}>
              Logowanie do aplikacji Klienta
            </Text>
          </View>

          <Card mode="outlined" style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleLarge" style={styles.formTitle}>
                Zaloguj się
              </Text>

              <TextInput
                label="Adres e-mail"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                disabled={isSubmitting}
              />

              <TextInput
                label="Hasło"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={() => void handleLogin()}
                disabled={isSubmitting}
              />

              {errorMessage ? (
                <HelperText type="error" visible>
                  {errorMessage}
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={() => void handleLogin()}
                loading={isSubmitting}
                disabled={isSubmitting}
                contentStyle={styles.buttonContent}
              >
                Zaloguj
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7f4',
  },
  keyboardArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    backgroundColor: '#d1fae5',
    marginBottom: 16,
  },
  title: {
    color: '#12372a',
    fontWeight: '700',
  },
  description: {
    color: '#52605a',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    maxWidth: 440,
    width: '100%',
  },
  cardContent: {
    gap: 16,
    paddingVertical: 24,
  },
  formTitle: {
    color: '#12372a',
    fontWeight: '700',
  },
  buttonContent: {
    minHeight: 48,
  },
});