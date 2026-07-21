import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth';
import { AppNavigator } from './src/navigation/AppNavigator';
import { theme } from './src/theme';


// Komponent główny rejestruje providery współdzielone przez całą aplikację
export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider
        theme={theme}
      >
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>

        <StatusBar style="dark" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}