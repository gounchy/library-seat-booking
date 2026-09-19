import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function Chip({ label, selected, onPress }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.backgroundElement,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}>
      <ThemedText type="smallBold" themeColor={selected ? 'onPrimary' : 'text'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

type ZoneFilterProps = {
  zones: string[];
  selected: string | null;
  onSelect: (zone: string | null) => void;
};

export function ZoneFilter({ zones, selected, onSelect }: ZoneFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      <Chip label="All zones" selected={selected === null} onPress={() => onSelect(null)} />
      {zones.map((zone) => (
        <Chip
          key={zone}
          label={`Zone ${zone}`}
          selected={selected === zone}
          onPress={() => onSelect(zone)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: MinTouchTarget,
    minWidth: MinTouchTarget,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});