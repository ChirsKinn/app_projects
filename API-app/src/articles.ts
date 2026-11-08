export type Source = 'Hacker News' | 'DEV.to';

export interface Article {
  id: string;
  source: Source;
  title: string;
  author: string;
  description: string | null;
  image: string | null;
  publishedAt: string | null;
  url: string;
  tags?: string[];
  readingTime?: number;
  points?: number;
  comments?: number;
}

type Story = {
  objectID: string;
  title?: string;
  author?: string;
  story_text?: string;
  created_at?: string;
  url?: string;
  points?: number;
  num_comments?: number;
};

type DevPost = {
  id: number;
  title: string;
  user?: { name?: string; username?: string };
  description?: string;
  cover_image?: string;
  published_at?: string;
  url: string;
  tag_list?: string[] | string;
  reading_time_minutes?: number;
  comments_count?: number;
};

const devUrl = 'https://dev.to/api/articles';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Request failed (HTTP ${response.status})`);
  return response.json();
}

export async function getHackerNews(query: string, signal?: AbortSignal): Promise<Article[]> {
  const path = query ? `search?query=${encodeURIComponent(query)}&tags=story` : 'search_by_date?tags=story';
  const { hits } = await getJson<{ hits: Story[] }>(`https://hn.algolia.com/api/v1/${path}`, signal);
  return hits.filter(story => story.title?.trim()).map(story => ({
    id: `hn-${story.objectID}`,
    source: 'Hacker News',
    title: story.title!.trim(),
    author: story.author || 'Unknown author',
    description: story.story_text?.replace(/<[^>]*>/g, ' ').trim() || null,
    image: null,
    publishedAt: story.created_at || null,
    url: story.url || `https://news.ycombinator.com/item?id=${story.objectID}`,
    points: story.points,
    comments: story.num_comments,
  }));
}

function normalizeDev(post: DevPost): Article {
  return {
    id: `dev-${post.id}`,
    source: 'DEV.to',
    title: post.title?.trim() || 'Untitled article',
    author: post.user?.name || post.user?.username || 'Unknown author',
    description: post.description || null,
    image: post.cover_image || null,
    publishedAt: post.published_at || null,
    url: post.url || `https://dev.to/${post.id}`,
    tags: typeof post.tag_list === 'string' ? post.tag_list.split(',').map(tag => tag.trim()) : post.tag_list,
    readingTime: post.reading_time_minutes,
    comments: post.comments_count,
  };
}

export async function getDevArticles(query: string, signal?: AbortSignal): Promise<Article[]> {
  const term = query.toLowerCase();
  const tag = term.replace(/^#/, '');
  const feed = getJson<DevPost[]>(`${devUrl}?per_page=30`, signal);
  if (!term) return (await feed).map(normalizeDev);

  const tagged = /^[a-z0-9]+$/.test(tag)
    ? getJson<DevPost[]>(`${devUrl}?tag=${encodeURIComponent(tag)}&per_page=30`, signal)
    : Promise.resolve([]);
  const [general, exact] = await Promise.all([feed, tagged]);
  const matches = general.map(normalizeDev).filter(article =>
    [article.title, article.author, article.description, ...(article.tags || [])]
      .some(value => value?.toLowerCase().includes(tag)),
  );
  return uniqueArticles([...exact.map(normalizeDev), ...matches]);
}

export async function getDevDetail(id: string, signal?: AbortSignal) {
  return normalizeDev(await getJson<DevPost>(`${devUrl}/${encodeURIComponent(id.slice(4))}`, signal));
}

export function uniqueArticles(articles: Article[]): Article[] {
  const ids = new Set<string>();
  const urls = new Set<string>();
  return articles.filter(article => {
    const url = article.url.replace(/#.*$/, '').replace(/\/$/, '');
    if (ids.has(article.id) || urls.has(url)) return false;
    ids.add(article.id);
    urls.add(url);
    return true;
  });
}

export function articleDate(value: string | null) {
  const date = new Date(value || '');
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
