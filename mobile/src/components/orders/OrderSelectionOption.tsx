import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

type OrderSelectionOptionProps = {
  label: string;
  description?: string;
  selected: boolean;
  multiple?: boolean;
  onPress: () => void;
};

// Opcja obsługuje pojedynczy wybór oraz wybór wielu dodatków
export function OrderSelectionOption({
  label,
  description,
  selected,
  multiple = false,
  onPress,
}: OrderSelectionOptionProps) {
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
      <View style={styles.textContainer}>
        <Text variant="bodyLarge">{label}</Text>
        {description ? (
          <Text variant="bodySmall" style={styles.secondaryText}>
            {description}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.indicator,
          !multiple && styles.radioIndicator,
          selected && styles.selectedIndicator,
        ]}
      >
        {selected ? <Check color="#ffffff" size={16} strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  textContainer: {
    flex: 1,
    gap: 2,
  },
  indicator: {
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
  secondaryText: {
    color: '#52605a',
  },
});
