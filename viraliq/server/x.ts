import { Post, ResearchConfig } from "../src/types";
type XResponse = {
  data?: {
    id: string;
    text: string;
    author_id?: string;
    created_at: string;
    public_metrics?: {
      like_count?: number;
      retweet_count?: number;
      reply_count?: number;
      quote_count?: number;
    };
    attachments?: { media_keys?: string[] };
  }[];
  includes?: {
    users?: { id: string; name: string; username: string }[];
    media?: { media_key: string; type: string }[];
  };
  meta?: { next_token?: string };
};
export async function searchX(c: ResearchConfig): Promise<Post[]> {
  if (!process.env.X_BEARER_TOKEN)
    throw Error("X access is not configured on the backend. Use Demo mode.");
  const cap = Math.min(
    2000,
    Math.max(100, Number(process.env.X_CANDIDATE_LIMIT) || 500),
  );
  const retention = Math.min(
    24,
    Math.max(0, Number(process.env.X_CONTENT_RETENTION_HOURS) || 0),
  );
  const posts: Post[] = [];
  let next: string | undefined;
  const end = Date.now() - 15000;
  do {
    const url = new URL("https://api.x.com/2/tweets/search/recent");
    const phrase = (c.query || c.topic).replace(/["\\\r\n]/g, " ").trim();
    url.searchParams.set(
      "query",
      `"${phrase}" -is:retweet${c.media === "Images only" ? " has:images" : c.media === "Text-only" ? " -has:media" : ""}`,
    );
    url.searchParams.set(
      "max_results",
      String(Math.min(100, cap - posts.length)),
    );
    // Seven days is a rolling limit: keep the request just inside that boundary.
    url.searchParams.set(
      "start_time",
      new Date(
        Math.max(Date.now() - 7 * 86400000 + 60000, end - c.hours * 3600000),
      ).toISOString(),
    );
    url.searchParams.set("end_time", new Date(end).toISOString());
    url.searchParams.set(
      "tweet.fields",
      "created_at,public_metrics,attachments,author_id",
    );
    url.searchParams.set("expansions", "author_id,attachments.media_keys");
    url.searchParams.set("user.fields", "name,username");
    url.searchParams.set("media.fields", "type");
    if (next) url.searchParams.set("next_token", next);
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.X_BEARER_TOKEN}` },
      signal: AbortSignal.timeout(12000),
    });
    if (r.status === 429)
      throw Error(
        `X rate limit reached. Retry after ${r.headers.get("x-rate-limit-reset") ? new Date(Number(r.headers.get("x-rate-limit-reset")) * 1000).toISOString() : "the current limit window"}.`,
      );
    if (!r.ok)
      throw Error(
        `X returned ${r.status}. Check backend access permissions and account quota.`,
      );
    const data = (await r.json()) as XResponse;
    for (const p of data.data ?? []) {
      const u = data.includes?.users?.find((u) => u.id === p.author_id),
        m = p.public_metrics;
      posts.push({
        id: p.id,
        text: p.text,
        author: u?.name ?? "X author",
        username: u?.username,
        createdAt: p.created_at,
        hasImage: !!p.attachments?.media_keys?.some((k) =>
          data.includes?.media?.some(
            (m) => m.media_key === k && m.type === "photo",
          ),
        ),
        metrics: {
          likes: m?.like_count,
          reposts: m?.retweet_count,
          replies: m?.reply_count,
          quotes: m?.quote_count,
        },
        expiresAt:
          retention > 0
            ? new Date(Date.now() + retention * 3600000).toISOString()
            : undefined,
      });
    }
    next = data.meta?.next_token;
  } while (next && posts.length < cap && cap - posts.length >= 10);
  return posts;
}
