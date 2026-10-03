import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { HeaderButtons } from '../components/HeaderButtons';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function Navigation() {
  const { colors, ready } = useTheme();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  return <>
    <StatusBar style={colors.dark || colors.headerText === '#ffffff' ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerStyle: { backgroundColor: colors.header }, headerTintColor: colors.headerText, contentStyle: { backgroundColor: colors.background }, title: 'Criminal Intent' }}>
      <Stack.Screen name="index" options={{ headerRight: () => <HeaderButtons add /> }} />
      <Stack.Screen name="crime/[id]" options={{ headerRight: () => <HeaderButtons /> }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  </>;
}

export default function Layout() { return <ThemeProvider><Navigation /></ThemeProvider>; }
