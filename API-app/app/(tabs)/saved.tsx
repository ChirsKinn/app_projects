import { FlatList, Text, View } from 'react-native';
import { useBookmarks } from '../../src/bookmarks';
import { Action, ArticleCard, EmptyState, LoadingIndicator } from '../../src/components';
import { openArticle } from '../../src/navigation';
import { ui } from '../../src/theme';

export default function SavedScreen() {
  const { saved, ready, busy, error, feedback, toggle, reload } = useBookmarks();
  return (
    <FlatList style={ui.screen} contentContainerStyle={ui.content} data={saved}
      keyExtractor={article => article.id}
      ListHeaderComponent={<View style={{ gap: 10 }}>
        <Text style={ui.label}>YOUR READING LIST</Text>
        <Text style={ui.title}>Bookmarks</Text>
        {feedback && <Text accessibilityLiveRegion="polite" style={ui.body}>{feedback}</Text>}
        {error && <Text accessibilityLiveRegion="polite" style={ui.error}>{error}</Text>}
        {!ready && error && <Action label="Retry" onPress={reload} />}
        {(!ready && !error || busy) && <LoadingIndicator label={busy ? 'Updating bookmarks…' : 'Loading bookmarks…'} />}
      </View>}
      renderItem={({ item }) => <ArticleCard article={item} onOpen={() => openArticle(item)}
        onRemove={() => void toggle(item)} />}
      ListEmptyComponent={ready ? <EmptyState title="No bookmarks yet" message="Open an article in Discover to bookmark it." /> : undefined}
    />
  );
}
