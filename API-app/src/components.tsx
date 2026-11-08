import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Article, Source, articleDate } from './articles';
import { colors, ui } from './theme';

export function Action({ label, onPress, selected, disabled }: {
  label: string; onPress: () => void; selected?: boolean; disabled?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected, disabled }} disabled={disabled}
      onPress={onPress} style={({ pressed }) => [
        ui.button, selected && styles.selected, (pressed || disabled) && { opacity: 0.65 },
      ]}>
      <Text style={[ui.buttonText, selected && { color: colors.surface }]}>{label}</Text>
    </Pressable>
  );
}

export function ArticleCard({ article, onOpen, onRemove }: {
  article: Article; onOpen: () => void; onRemove?: () => void;
}) {
  return (
    <View style={ui.panel}>
      <Pressable accessibilityRole="button" onPress={onOpen} style={({ pressed }) => [styles.cardBody, pressed && { opacity: 0.65 }]}>
        {article.image && <Image source={{ uri: article.image }} style={styles.image} />}
        <Text style={ui.label}>{article.source.toUpperCase()}</Text>
        <Text style={ui.heading}>{article.title}</Text>
        <Text style={ui.body}>{article.author} · {articleDate(article.publishedAt)}</Text>
        {article.description && <Text numberOfLines={2} style={ui.body}>{article.description}</Text>}
      </Pressable>
      {onRemove && <Action label="Remove bookmark" onPress={onRemove} />}
    </View>
  );
}

export function SearchBar({ value, onChange, onSearch, onClear }: {
  value: string; onChange: (value: string) => void; onSearch: () => void; onClear: () => void;
}) {
  return (
    <View style={styles.row}>
      <TextInput accessibilityLabel="Search articles" placeholder="Search articles" placeholderTextColor={colors.muted}
        value={value} onChangeText={onChange} onSubmitEditing={onSearch} returnKeyType="search"
        autoCapitalize="none" style={styles.input} />
      <Action label="Search" onPress={onSearch} selected />
      {value.length > 0 && <Action label="Clear" onPress={onClear} />}
    </View>
  );
}

export type Filter = 'All' | Source;
const filters: Filter[] = ['All', 'Hacker News', 'DEV.to'];

export function SourceFilter({ value, onChange }: { value: Filter; onChange: (value: Filter) => void }) {
  return (
    <View style={styles.row}>
      {filters.map(filter => (
        <Action key={filter} label={filter} selected={value === filter} onPress={() => onChange(filter)} />
      ))}
    </View>
  );
}

export function LoadingIndicator({ label }: { label: string }) {
  return (
    <View style={styles.row} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.blue} />
      <Text style={ui.body}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return <View style={ui.panel}><Text style={ui.heading}>{title}</Text><Text style={ui.body}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  selected: { backgroundColor: colors.blue },
  input: { flex: 1, minWidth: 110, minHeight: 48, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, color: colors.ink, fontSize: 16 },
  image: { width: '100%', aspectRatio: 2.4, borderRadius: 10, backgroundColor: colors.background },
  cardBody: { gap: 7, minHeight: 48 },
});
