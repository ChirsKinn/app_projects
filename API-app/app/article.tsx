import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Linking, ScrollView, Text, View } from 'react-native';
import { Article, articleDate, getDevDetail } from '../src/articles';
import { useBookmarks } from '../src/bookmarks';
import { Action, EmptyState, LoadingIndicator } from '../src/components';
import { colors, ui } from '../src/theme';

function readArticle(data?: string): Article | null {
  try {
    const article = JSON.parse(data || 'null');
    return typeof article?.id === 'string' && typeof article.title === 'string' ? article : null;
  } catch {
    return null;
  }
}

export default function ArticleScreen() {
  const { data } = useLocalSearchParams<{ data?: string }>();
  const preview = useMemo(() => readArticle(data), [data]);
  const [detail, setDetail] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [linkError, setLinkError] = useState(false);
  const { saved, ready, busy, error, feedback, toggle, reload } = useBookmarks();

  useEffect(() => {
    setDetail(null);
    setFailed(false);
    setLinkError(false);
    setLoading(preview?.source === 'DEV.to');
    if (preview?.source !== 'DEV.to') return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let active = true;
    getDevDetail(preview.id, controller.signal)
      .then(result => { if (active) setDetail(result); })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => {
        clearTimeout(timeout);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [preview, attempt]);

  const article = detail?.id === preview?.id ? detail : preview;
  if (!article) {
    return <View style={[ui.screen, ui.content]}><EmptyState title="Article unavailable" message="Go back and choose an article from Discover or Saved." /></View>;
  }
  const bookmarked = saved.some(item => item.id === article.id);

  async function openFullArticle(url: string) {
    setLinkError(false);
    try {
      if (!/^https?:\/\//i.test(url)) throw new Error('Unsupported URL');
      await Linking.openURL(url);
    } catch {
      setLinkError(true);
    }
  }

  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.content}>
      {article.image && <Image source={{ uri: article.image }} style={{ width: '100%', aspectRatio: 2, borderRadius: 16, backgroundColor: colors.line }} />}
      <View style={ui.panel}>
        <Text style={ui.label}>{article.source.toUpperCase()}</Text>
        <Text style={ui.title}>{article.title}</Text>
        <Text style={ui.body}>{article.author} · {articleDate(article.publishedAt)}</Text>
        {article.readingTime != null && <Text style={ui.body}>{article.readingTime} min read</Text>}
        {article.points != null && <Text style={ui.body}>{article.points} points</Text>}
        {article.comments != null && <Text style={ui.body}>{article.comments} comments</Text>}
        {!!article.tags?.length && <Text style={ui.body}>{article.tags.map(tag => '#' + tag).join('  ')}</Text>}
      </View>
      {loading && <LoadingIndicator label="Loading article details…" />}
      {failed && <View style={ui.panel}>
        <Text style={ui.error}>Could not load more details. The original article link is still available.</Text>
        <Action label="Retry details" onPress={() => setAttempt(attempt + 1)} />
      </View>}
      <View style={ui.panel}>
        <Text style={ui.heading}>Description</Text>
        <Text style={ui.body}>{article.description || 'This source did not provide a description.'}</Text>
      </View>
      <Action label="Open Full Article" onPress={() => void openFullArticle(article.url)} selected />
      {linkError && <Text accessibilityLiveRegion="polite" style={ui.error}>Could not open this link.</Text>}
      <Action label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
        onPress={() => void toggle(article)} disabled={!ready || busy} />
      {busy && <LoadingIndicator label="Updating bookmarks…" />}
      {feedback && <Text accessibilityLiveRegion="polite" style={ui.body}>{feedback}</Text>}
      {error && <Text accessibilityLiveRegion="polite" style={ui.error}>{error}</Text>}
      {!ready && error && <Action label="Retry loading bookmarks" onPress={reload} />}
    </ScrollView>
  );
}
