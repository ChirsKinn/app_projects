import { ScrollView, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themes } from '../constants/themes';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { colors, theme, changeTheme } = useTheme();
  return <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 36, gap: 18 }}>
      <Text style={{ color: colors.text, textAlign: 'center', fontSize: 27, fontWeight: 'bold', marginBottom: 4 }}>Pick a Theme</Text>
      {Object.keys(themes).map(name => <Pressable key={name} accessibilityRole="radio" accessibilityState={{ checked: theme === name }} onPress={() => void changeTheme(name)} style={{ padding: 16, backgroundColor: colors.surface, borderRadius: 6, borderWidth: 1, borderColor: theme === name ? colors.primary : colors.border, elevation: 3 }}>
        <Text style={{ color: colors.text, textAlign: 'center', fontSize: 20 }}>{name}</Text>
      </Pressable>)}
    </ScrollView>
  </SafeAreaView>;
}
