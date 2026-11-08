import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { BookmarkProvider } from '../src/bookmarks';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <BookmarkProvider>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerTintColor: colors.ink, headerShadowVisible: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="article" options={{ title: 'Article details' }} />
      </Stack>
    </BookmarkProvider>
  );
}
