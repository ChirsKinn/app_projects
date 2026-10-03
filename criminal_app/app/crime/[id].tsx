import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { getCrime, saveCrime } from '../../storage/crimeStorage';
import { Crime } from '../../types/Crime';

export default function CrimeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [crime, setCrime] = useState<Crime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    // New drafts exist only in this screen until Save is pressed.
    const load = id === 'new'
      ? Promise.resolve({ id: Crypto.randomUUID(), title: '', details: '', date: new Date().toISOString(), solved: false, imageUri: null })
      : getCrime(id);
    load.then(value => { if (active) { if (value) setCrime(value); else setError('This crime could not be found.'); } })
      .catch(() => { if (active) setError('Could not load this crime from storage.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  function update(changes: Partial<Crime>) {
    setCrime(current => current ? { ...current, ...changes } : current);
    setSaved(false);
  }
  async function selectPhoto() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { Alert.alert('Photo permission', 'Allow photo library access to select a crime photo.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (!result.canceled && result.assets[0]) update({ imageUri: result.assets[0].uri });
    } catch { Alert.alert('Photo error', 'Could not open the photo library. Please try again.'); }
  }
  async function save() {
    if (!crime || saving) return;
    setSaving(true);
    try { await saveCrime(crime); setSaved(true); }
    catch { Alert.alert('Save failed', 'Your changes have not been saved. Please try again.'); }
    finally { setSaving(false); }
  }
  const buttonStyle = { backgroundColor: colors.primary, padding: 13, borderRadius: 2, alignItems: 'center' as const, elevation: 3 };
  const labelStyle = { color: colors.text, fontSize: 20, fontWeight: 'bold' as const };
  if (loading) return <ActivityIndicator style={{ marginTop: 30 }} color={colors.primary} />;
  if (!crime) return <Text style={{ color: colors.text, padding: 20 }}>{error}</Text>;

  return <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <View style={{ width: 100, gap: 8 }}>
            {crime.imageUri ? <Image accessibilityLabel="Crime photo" source={{ uri: crime.imageUri }} style={{ width: 100, height: 100 }} /> : <View accessibilityLabel="No photo selected" style={{ width: 100, height: 100, backgroundColor: colors.border }} />}
            <Pressable disabled={saving} accessibilityRole="button" accessibilityLabel="Select photo from library" onPress={() => void selectPhoto()} style={{ backgroundColor: colors.surface, padding: 8, alignItems: 'center', borderRadius: 4 }}><Ionicons name="camera" size={28} color={colors.text} /></Pressable>
          </View>
          <View style={{ flex: 1, gap: 12 }}><Text style={{ ...labelStyle, fontSize: 25 }}>Title</Text><TextInput accessibilityLabel="Crime title" editable={!saving} placeholder="Title" placeholderTextColor={colors.secondaryText} value={crime.title} onChangeText={title => update({ title })} style={{ color: colors.text, fontSize: 16, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 8 }} /></View>
        </View>
        <Text style={labelStyle}>Details</Text>
        <TextInput accessibilityLabel="Crime details" editable={!saving} multiline textAlignVertical="top" placeholder="What happened?" placeholderTextColor={colors.secondaryText} value={crime.details} onChangeText={details => update({ details })} style={{ minHeight: 110, color: colors.text, backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, padding: 10, fontSize: 16 }} />
        <Pressable accessibilityRole="button" accessibilityLabel="Choose crime date" disabled={saving} onPress={() => setShowDate(true)} style={buttonStyle}><Text style={{ color: '#ffffff', fontSize: 16 }}>{new Date(crime.date).toDateString().toUpperCase()}</Text></Pressable>
        {showDate && <View>
          <DateTimePicker value={new Date(crime.date)} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} themeVariant={colors.dark ? 'dark' : 'light'} onChange={(event, date) => { if (Platform.OS !== 'ios') setShowDate(false); if (event.type === 'set' && date) update({ date: date.toISOString() }); }} />
          {Platform.OS === 'ios' && <Pressable onPress={() => setShowDate(false)} style={buttonStyle}><Text style={{ color: '#ffffff' }}>DONE</Text></Pressable>}
        </View>}
        <Pressable disabled={saving} accessibilityRole="checkbox" accessibilityState={{ checked: crime.solved }} accessibilityLabel="Solved" onPress={() => update({ solved: !crime.solved })} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name={crime.solved ? 'checkbox' : 'square-outline'} size={27} color={crime.solved ? colors.primary : colors.secondaryText} /><Text style={{ color: colors.text, fontSize: 16 }}>Solved</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={saving} onPress={() => void save()} style={{ ...buttonStyle, opacity: saving ? 0.6 : 1 }}><Text style={{ color: '#ffffff', fontSize: 16 }}>{saving ? 'SAVING…' : 'SAVE'}</Text></Pressable>
        {saved && <Text accessibilityRole="alert" style={{ color: colors.text, textAlign: 'center' }}>Crime saved successfully.</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
