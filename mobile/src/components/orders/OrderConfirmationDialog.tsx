import { StyleSheet, View } from 'react-native';
import {
  Button,
  Chip,
  Dialog,
  HelperText,
  Portal,
  Text,
} from 'react-native-paper';

export type OrderConfirmationDetails = {
  menuDate?: string;
  dishName?: string;
  addonNames: string[];
};

type OrderConfirmationDialogProps = {
  visible: boolean;
  details: OrderConfirmationDetails;
  isSubmitting: boolean;
  errorMessage: string;
  onClose: () => void;
  onConfirm: () => void;
};

// Dialog prezentuje podsumowanie przed ostatecznym utworzeniem zamówienia
export function OrderConfirmationDialog({
  visible,
  details,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}: OrderConfirmationDialogProps) {
  return (
    <Portal>
      <Dialog
        visible={visible}
        dismissable={!isSubmitting}
        onDismiss={onClose}
      >
        <Dialog.Title>Potwierdź zamówienie</Dialog.Title>
        <Dialog.Content>
          <View style={styles.content}>
            <Text variant="bodyMedium">
              Złożyć zamówienie na{' '}
              <Text style={styles.emphasis}>
                {details.dishName ?? 'Brak nazwy dania'}
              </Text>{' '}
              w dniu{' '}
              <Text style={styles.emphasis}>
                {formatDate(details.menuDate)}
              </Text>
              {'?'}
            </Text>
            <Text variant="bodyMedium">
              Po złożeniu zamówienia, nie będzie możliwości zmiany wybranego dania oraz dodatków.
            </Text>
            {details.addonNames.length > 0 ? (
              <View style={styles.selectedAddons}>
                <Text variant="bodySmall" style={styles.secondaryText}>
                  Wybrane dodatki
                </Text>
                <View style={styles.addonChips}>
                  {details.addonNames.map((addonName) => (
                    <Chip key={addonName} compact mode="outlined">
                      {addonName}
                    </Chip>
                  ))}
                </View>
              </View>
            ) : (
              <Text variant="bodyMedium" style={styles.secondaryText}>
                Zamówienie bez dodatków
              </Text>
            )}
            {errorMessage ? (
              <HelperText type="error" visible>
                {errorMessage}
              </HelperText>
            ) : null}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button disabled={isSubmitting} onPress={onClose}>
            Anuluj
          </Button>
          <Button
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={onConfirm}
          >
            {isSubmitting ? 'Zapisywanie…' : 'Złóż zamówienie'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
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
  content: {
    gap: 12,
  },
  emphasis: {
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
