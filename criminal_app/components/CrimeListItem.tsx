import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Crime } from '../types/Crime';

export function CrimeListItem({ crime, onPress }: { crime: Crime; onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${crime.title || 'Untitled crime'}`}
      onPress={onPress}
      style={styles.row}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{crime.title || 'Untitled crime'}</Text>
        <Text style={[styles.date, { color: colors.secondaryText }]}>{crime.date}</Text>
      </View>
      {crime.solved && (
        <MaterialCommunityIcons name="handcuffs" size={30} color={colors.text} accessibilityLabel="Solved" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: 14, minHeight: 84 },
  content: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold' },
  date: { fontSize: 15, marginTop: 8 },
});
