import {
  DefaultTheme as NavigationDefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const theme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 2,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#047857',
    onPrimary: '#ffffff',
    primaryContainer: '#d1fae5',
    onPrimaryContainer: '#064e3b',
    secondary: '#166534',
    secondaryContainer: '#dcfce7',
    onSecondaryContainer: '#14532d',
    background: '#f4f7f4',
    surface: '#ffffff',
    surfaceVariant: '#eef3ee',
    onSurfaceVariant: '#52605a',
    outline: '#cbd5cb',
  },
};

// Motyw nawigacji wykorzystuje paletę co komponenty React Native Paper
export const navigationTheme: NavigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: '#047857',
    background: '#f4f7f4',
    card: '#ffffff',
    text: '#12372a',
    border: '#e2e8e2',
    notification: '#b91c1c',
  },
};