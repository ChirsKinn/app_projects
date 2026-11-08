import { Tabs } from 'expo-router';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.blue, tabBarInactiveTintColor: colors.muted,
      tabBarLabelStyle: { fontSize: 13, fontWeight: '700' }, headerTintColor: colors.ink, headerShadowVisible: false }}>
      <Tabs.Screen name="index" options={{ title: 'Discover', headerTitle: 'Article Explorer' }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved', headerTitle: 'Saved articles' }} />
    </Tabs>
  );
}
