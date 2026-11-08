import { StyleSheet } from 'react-native';

export const colors = {
  background: '#f1f5fa', surface: '#ffffff', ink: '#14243d', muted: '#4b5d75',
  blue: '#174ba5', paleBlue: '#e5efff', line: '#d5e0ed', error: '#9e2626',
};

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, gap: 14 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '800' },
  heading: { color: colors.ink, fontSize: 19, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  label: { color: colors.blue, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.paleBlue },
  buttonText: { color: colors.blue, fontSize: 15, fontWeight: '700' },
  panel: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 16, gap: 8 },
  error: { color: colors.error, fontSize: 15, lineHeight: 22 },
});
