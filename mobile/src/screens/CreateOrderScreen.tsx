import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Dialog,
  HelperText,
  Portal,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
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
                <SelectionOption
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
                <SelectionOption
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
                  <SelectionOption
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

      <Portal>
        <Dialog
          visible={isConfirmationVisible}
          dismissable={!isSubmitting}
          onDismiss={() => setIsConfirmationVisible(false)}
        >
          <Dialog.Title>Potwierdź zamówienie</Dialog.Title>
          <Dialog.Content>
            <View style={styles.confirmationContent}>
              <Text variant="bodyMedium">
                Złożyć zamówienie na{' '}
                <Text style={styles.confirmationEmphasis}>
                  {selectedDish?.name ?? 'Brak nazwy dania'}
                </Text>{' '}
                w dniu{' '}
                <Text style={styles.confirmationEmphasis}>
                  {formatDate(selectedMenuDay?.menuDate)}
                </Text>
                {'?'}
              </Text>
              <Text variant="bodyMedium">
                Po złożeniu zamówienia, nie będzie możliwości zmiany wybranego dania oraz dodatków.
              </Text>
              {selectedAddons.length > 0 ? (
                <View style={styles.selectedAddons}>
                  <Text variant="bodySmall" style={styles.secondaryText}>
                    Wybrane dodatki
                  </Text>
                  <View style={styles.addonChips}>
                    {selectedAddons.map((addon) => (
                      <Chip key={addon.id} compact mode="outlined">
                        {addon.name ?? 'Brak nazwy dodatku'}
                      </Chip>
                    ))}
                  </View>
                </View>
              ) : (
                <Text variant="bodyMedium" style={styles.secondaryText}>
                  Zamówienie bez dodatków
                </Text>
              )}
              {submitErrorMessage ? (
                <HelperText type="error" visible>
                  {submitErrorMessage}
                </HelperText>
              ) : null}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              disabled={isSubmitting}
              onPress={() => setIsConfirmationVisible(false)}
            >
              Anuluj
            </Button>
            <Button
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={() => void handleConfirmOrder()}
            >
              {isSubmitting ? 'Zapisywanie…' : 'Złóż zamówienie'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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

type SelectionOptionProps = {
  label: string;
  description?: string;
  selected: boolean;
  multiple?: boolean;
  onPress: () => void;
};

function SelectionOption({
  label,
  description,
  selected,
  multiple = false,
  onPress,
}: SelectionOptionProps) {
  return (
    <Pressable
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.selectedOption,
        pressed && styles.pressedOption,
      ]}
    >
      <View style={styles.optionText}>
        <Text variant="bodyLarge">{label}</Text>
        {description ? (
          <Text variant="bodySmall" style={styles.secondaryText}>
            {description}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.selectionIndicator,
          !multiple && styles.radioIndicator,
          selected && styles.selectedIndicator,
        ]}
      >
        {selected ? <Check color="#ffffff" size={16} strokeWidth={3} /> : null}
      </View>
    </Pressable>
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
  option: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#cbd5cb',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedOption: {
    backgroundColor: '#ecfdf5',
    borderColor: '#047857',
  },
  pressedOption: {
    opacity: 0.8,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  selectionIndicator: {
    alignItems: 'center',
    borderColor: '#82908a',
    borderRadius: 4,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioIndicator: {
    borderRadius: 12,
  },
  selectedIndicator: {
    backgroundColor: '#047857',
    borderColor: '#047857',
  },
  submitButtonContent: {
    minHeight: 48,
  },
  confirmationContent: {
    gap: 12,
  },
  confirmationEmphasis: {
    fontWeight: '700',
  },
  selectedAddons: {
    gap: 8,
  },
  addonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  secondaryText: {
    color: '#52605a',
  },
});
