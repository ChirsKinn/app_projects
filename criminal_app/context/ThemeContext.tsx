import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { ThemeColors, ThemeName, themes } from '../constants/themes';

const KEY = 'criminal-intent-theme';
const ThemeContext = createContext<{ theme: ThemeName; colors: ThemeColors; changeTheme: (name: ThemeName) => Promise<void>; ready: boolean } | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('White');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(saved => {
      if (saved && themes[saved]) setTheme(saved);
    }).catch(() => Alert.alert('Storage error', 'Could not load your saved theme.')).finally(() => setReady(true));
  }, []);
  async function changeTheme(name: ThemeName) {
    setTheme(name);
    try { await AsyncStorage.setItem(KEY, name); }
    catch { Alert.alert('Storage error', 'The theme changed, but could not be saved for next time.'); }
  }
  return <ThemeContext.Provider value={{ theme, colors: themes[theme], changeTheme, ready }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme requires ThemeProvider');
  return value;
}
