import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function HeaderButtons({ add = false }: { add?: boolean }) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Settings"
        hitSlop={6}
        style={styles.button}
        onPress={() => router.push('/settings')}
      >
        <Ionicons name="settings-outline" size={25} color={colors.headerText} style={styles.icon} />
      </Pressable>
      {add && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add crime"
          hitSlop={6}
          style={styles.button}
          onPress={() => router.push('/crime/new')}
        >
          <Ionicons name="add" size={32} color={colors.headerText} style={styles.icon} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  button: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 32, lineHeight: 32, textAlign: 'center', includeFontPadding: false },
});
