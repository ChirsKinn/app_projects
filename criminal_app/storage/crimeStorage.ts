import AsyncStorage from '@react-native-async-storage/async-storage';
import { Crime } from '../types/Crime';

const KEY = 'criminal-intent-crimes';

export async function getCrimes(): Promise<Crime[]> {
  const stored = await AsyncStorage.getItem(KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function getCrime(id: string): Promise<Crime | undefined> {
  return (await getCrimes()).find(crime => crime.id === id);
}

export async function saveCrime(crime: Crime): Promise<void> {
  const crimes = await getCrimes();
  const index = crimes.findIndex(item => item.id === crime.id);
  if (index === -1) crimes.push(crime);
  else crimes[index] = crime;
  await AsyncStorage.setItem(KEY, JSON.stringify(crimes));
}
