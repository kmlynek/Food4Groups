import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import {
  OrderConfirmationDialog,
  type OrderConfirmationDetails,
} from '../components/orders/OrderConfirmationDialog';
import { OrderSelectionOption } from '../components/orders/OrderSelectionOption';
import type { OrdersStackParamList } from '../navigation/AppNavigator';
import {
  createOrder,
  getOrderOptions,
  type OrderOptions,
} from '../orders';

type CreateOrderScreenProps = NativeStackScreenProps<
  OrdersStackParamList,
  'CreateOrder'
>;

// Ekran prowadzi Klienta przez wybór dnia, dania i opcjonalnych dodatków
export function CreateOrderScreen({ navigation }: CreateOrderScreenProps) {
  const { session } = useAuth();
  const [options, setOptions] = useState<OrderOptions | null>(null);
  const [menuDayId, setMenuDayId] = useState('');
  const [dishId, setDishId] = useState('');
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] =
    useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');

  const selectedMenuDay = options?.menuDays.find(
    (menuDay) => menuDay.id === menuDayId,
  );
  const selectedDish = selectedMenuDay?.dishes.find(
    (dish) => dish.id === dishId,
  );
  const selectedAddons = useMemo(
    () =>
      selectedMenuDay?.addons.filter((addon) =>
        addonIds.includes(addon.id),
      ) ?? [],
    [addonIds, selectedMenuDay],
  );
  const confirmationDetails = useMemo<OrderConfirmationDetails>(
    () => ({
      menuDate: selectedMenuDay?.menuDate,
      dishName: selectedDish?.name,
      addonNames: selectedAddons
        .map((addon) => addon.name)
        .filter((name): name is string => Boolean(name)),
    }),
    [selectedAddons, selectedDish, selectedMenuDay],
  );

  const loadOptions = useCallback(async () => {
    if (!session) {
      return;
    }

    setIsLoading(true);
    setLoadErrorMessage('');

    try {
      const response = await getOrderOptions(session.token);
      const firstMenuDay = response.menuDays[0];

      setOptions(response);
      setMenuDayId(firstMenuDay?.id ?? '');
      setDishId(firstMenuDay?.dishes[0]?.id ?? '');
      setAddonIds([]);
    } catch (error) {
      setOptions(null);
      setLoadErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nie udało się pobrać dostępnego menu',
      );
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      void loadOptions();
    }, [loadOptions]),
  );

  function handleMenuDayChange(nextMenuDayId: string) {
    const nextMenuDay = options?.menuDays.find(
      (menuDay) => menuDay.id === nextMenuDayId,
    );

    setMenuDayId(nextMenuDayId);
    setDishId(nextMenuDay?.dishes[0]?.id ?? '');
    setAddonIds([]);
  }

  function handleAddonChange(addonId: string) {
    setAddonIds((currentAddonIds) =>
      currentAddonIds.includes(addonId)
        ? currentAddonIds.filter(
            (currentAddonId) => currentAddonId !== addonId,
          )
        : [...currentAddonIds, addonId],
    );
  }

  function showConfirmation() {
    setSubmitErrorMessage('');
    setIsConfirmationVisible(true);
  }

  async function handleConfirmOrder() {
    if (
      !session ||
      !options?.groupMemberId ||
      !menuDayId ||
      !dishId
    ) {
      setSubmitErrorMessage('Uzupełnij wymagane dane zamówienia');
      return;
    }

    setIsSubmitting(true);
    setSubmitErrorMessage('');

    try {
      await createOrder(session.token, {
        groupMemberId: options.groupMemberId,
        menuDayId,
        dishId,
        addonIds,
      });

      setIsConfirmationVisible(false);
      navigation.goBack();
    } catch (error) {
      setSubmitErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nie udało się złożyć zamówienia',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Złóż zamówienie
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          Wybierz dzień menu, danie i dodatki
        </Text>

        {isLoading ? <OptionsLoadingState /> : null}

        {!isLoading && loadErrorMessage ? (
          <OptionsErrorState
            message={loadErrorMessage}
            onRetry={() => void loadOptions()}
          />
        ) : null}

        {!isLoading && !loadErrorMessage && !options?.groupMemberId ? (
          <UnavailableState
            message="Twoje konto nie jest aktywnym uczestnikiem grupy. Aby uzyskać dostęp do zamówień, skontaktuj się z pracownikiem cateringu"
            onBack={navigation.goBack}
          />
        ) : null}

        {!isLoading &&
        !loadErrorMessage &&
        options?.groupMemberId &&
        options.menuDays.length === 0 ? (
          <UnavailableState
            message="Brak dostępnego menu. Nie możesz teraz złożyć zamówienia."
            onBack={navigation.goBack}
          />
        ) : null}

        {!isLoading &&
        !loadErrorMessage &&
        options?.groupMemberId &&
        options.menuDays.length > 0 ? (
          <View style={styles.form}>
            <Card mode="outlined" style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text variant="labelLarge" style={styles.secondaryText}>
                  Grupa
                </Text>
                <Text variant="titleMedium">
                  {options.groupName ?? 'Brak nazwy grupy'}
                </Text>
              </Card.Content>
            </Card>

            <SelectionSection title="Dzień menu">
              {options.menuDays.map((menuDay) => (
                <OrderSelectionOption
                  key={menuDay.id}
                  label={formatDate(menuDay.menuDate)}
                  description={menuDay.menuPeriodName}
                  selected={menuDay.id === menuDayId}
                  onPress={() => handleMenuDayChange(menuDay.id)}
                />
              ))}
            </SelectionSection>

            <SelectionSection title="Danie">
              {selectedMenuDay?.dishes.map((dish) => (
                <OrderSelectionOption
                  key={dish.id}
                  label={dish.name ?? 'Brak nazwy dania'}
                  selected={dish.id === dishId}
                  onPress={() => setDishId(dish.id)}
                />
              ))}
            </SelectionSection>

            <SelectionSection title="Dodatki" optional>
              {selectedMenuDay?.addons.length ? (
                selectedMenuDay.addons.map((addon) => (
                  <OrderSelectionOption
                    key={addon.id}
                    label={addon.name ?? 'Brak nazwy dodatku'}
                    selected={addonIds.includes(addon.id)}
                    multiple
                    onPress={() => handleAddonChange(addon.id)}
                  />
                ))
              ) : (
                <Text variant="bodyMedium" style={styles.secondaryText}>
                  Brak dodatków dostępnych dla wybranego dnia
                </Text>
              )}
            </SelectionSection>

            <Button
              mode="contained"
              contentStyle={styles.submitButtonContent}
              disabled={!menuDayId || !dishId}
              onPress={showConfirmation}
            >
              Złóż zamówienie
            </Button>
          </View>
        ) : null}
      </ScrollView>

      <OrderConfirmationDialog
        visible={isConfirmationVisible}
        details={confirmationDetails}
        isSubmitting={isSubmitting}
        errorMessage={submitErrorMessage}
        onClose={() => setIsConfirmationVisible(false)}
        onConfirm={() => void handleConfirmOrder()}
      />
    </SafeAreaView>
  );
}

function OptionsLoadingState() {
  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.stateContent}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge">Pobieranie dostępnego menu...</Text>
      </Card.Content>
    </Card>
  );
}

type OptionsErrorStateProps = {
  message: string;
  onRetry: () => void;
};

function OptionsErrorState({ message, onRetry }: OptionsErrorStateProps) {
  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.stateContent}>
        <Text variant="titleMedium">Nie udało się pobrać menu</Text>
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

type UnavailableStateProps = {
  message: string;
  onBack: () => void;
};

function UnavailableState({ message, onBack }: UnavailableStateProps) {
  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.stateContent}>
        <Text variant="titleMedium">Zamówienie niedostępne</Text>
        <Text variant="bodyMedium" style={styles.stateDescription}>
          {message}
        </Text>
        <Button mode="outlined" onPress={onBack}>
          Wróć do zamówień
        </Button>
      </Card.Content>
    </Card>
  );
}

type SelectionSectionProps = {
  title: string;
  optional?: boolean;
  children: React.ReactNode;
};

function SelectionSection({
  title,
  optional = false,
  children,
}: SelectionSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {title}
        </Text>
        {optional ? (
          <Text variant="bodySmall" style={styles.secondaryText}>
            Opcjonalne
          </Text>
        ) : null}
      </View>
      <View style={styles.optionsList}>{children}</View>
    </View>
  );
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
    dateStyle: 'full',
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
    paddingBottom: 40,
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
  form: {
    gap: 24,
  },
  card: {
    backgroundColor: '#ffffff',
  },
  cardContent: {
    gap: 4,
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
  section: {
    gap: 12,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#12372a',
    fontWeight: '700',
  },
  optionsList: {
    gap: 10,
  },
  submitButtonContent: {
    minHeight: 48,
  },
  secondaryText: {
    color: '#52605a',
  },
});
