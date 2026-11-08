import { useEffect, useState } from 'react';
import { FlatList, Keyboard, Text, View } from 'react-native';
import { Article, Source, getDevArticles, getHackerNews, uniqueArticles } from '../../src/articles';
import { Action, ArticleCard, EmptyState, Filter, LoadingIndicator, SearchBar, SourceFilter } from '../../src/components';
import { openArticle } from '../../src/navigation';
import { ui } from '../../src/theme';

export default function DiscoverScreen() {
  const [input, setInput] = useState('');
  const [request, setRequest] = useState({ query: '', refresh: false });
  const [filter, setFilter] = useState<Filter>('All');
  const [articles, setArticles] = useState<Article[]>([]);
  const [failures, setFailures] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let active = true;
    Promise.allSettled([
      getHackerNews(request.query, controller.signal),
      getDevArticles(request.query, controller.signal),
    ]).then(([hn, dev]) => {
      if (!active) return;
      const results: Article[] = [];
      const unavailable: Source[] = [];
      if (hn.status === 'fulfilled') results.push(...hn.value);
      else unavailable.push('Hacker News');
      if (dev.status === 'fulfilled') results.push(...dev.value);
      else unavailable.push('DEV.to');
      setArticles(results.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')));
      setFailures(unavailable);
      setLoading(false);
      clearTimeout(timeout);
    });
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [request]);

  function load(query: string, refresh = false) {
    Keyboard.dismiss();
    setLoading(true);
    setFailures([]);
    if (!refresh) setArticles([]);
    setRequest({ query: query.trim(), refresh });
  }

  const visible = uniqueArticles(articles.filter(article => filter === 'All' || article.source === filter));
  const unavailable = failures.filter(source => filter === 'All' || filter === source);

  return (
    <FlatList style={ui.screen} contentContainerStyle={ui.content} data={visible}
      keyExtractor={article => article.id} keyboardShouldPersistTaps="handled"
      onRefresh={() => load(request.query, true)} refreshing={loading && request.refresh}
      renderItem={({ item }) => <ArticleCard article={item} onOpen={() => openArticle(item)} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          <Text style={ui.label}>TWO SOURCES · ONE READING LIST</Text>
          <Text style={ui.title}>Discover articles</Text>
          <SearchBar value={input} onChange={setInput} onSearch={() => load(input)}
            onClear={() => { setInput(''); load(''); }} />
          <SourceFilter value={filter} onChange={setFilter} />
          <Text style={ui.body}>DEV.to search matches tags and text in fetched posts only.</Text>
          <Action label="Refresh articles" onPress={() => load(request.query, true)} disabled={loading} />
          {loading && <LoadingIndicator label="Loading articles…" />}
          {unavailable.length > 0 && (
            <View style={ui.panel} accessibilityLiveRegion="polite">
              <Text style={ui.error}>Could not load {unavailable.join(' and ')}. Check your connection and try again.</Text>
              <Action label="Retry" onPress={() => load(request.query, true)} />
            </View>
          )}
        </View>
      }
      ListEmptyComponent={!loading && unavailable.length === 0
        ? <EmptyState title="No articles found" message="Try another search or choose a different source." /> : undefined}
    />
  );
}
