import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text } from 'react-native';
import { CrimeListItem } from '../components/CrimeListItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { getCrimes } from '../storage/crimeStorage';
import { Crime } from '../types/Crime';

export default function CrimeList() {
  const { colors } = useTheme();
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    getCrimes().then(items => { if (active) { setCrimes(items); setError(''); } })
      .catch(() => { if (active) setError('Could not load crimes. Return to this screen to try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));
  return <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.surface }}>
    {loading ? <ActivityIndicator style={{ marginTop: 30 }} color={colors.primary} /> : <FlatList
      data={crimes} keyExtractor={crime => crime.id} contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      ListEmptyComponent={<Text style={{ color: colors.secondaryText, textAlign: 'center', marginTop: 40 }}>{error || 'No crimes yet. Tap + to add one.'}</Text>}
      ListHeaderComponent={crimes.length && error ? <Text style={{ color: colors.text }}>{error}</Text> : null}
      renderItem={({ item }) => (
        <CrimeListItem crime={item} onPress={() => router.push({ pathname: '/crime/[id]', params: { id: item.id } })} />
      )}
    />}
  </SafeAreaView>;
}
