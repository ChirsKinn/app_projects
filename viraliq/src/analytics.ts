import {
  Analytics,
  Dataset,
  Frequency,
  Metric,
  Post,
  ResearchConfig,
} from "./types";
const metrics: Metric[] = ["likes", "reposts", "replies", "quotes"];
export const engagement = (p: Post) =>
  metrics.reduce((s, k) => s + (p.metrics[k] ?? 0), 0);
export const mean = (a: number[]) =>
  a.length ? a.reduce((s, n) => s + n, 0) / a.length : 0;
export const median = (a: number[]) => {
  const b = [...a].sort((x, y) => x - y);
  return b.length
    ? (b[Math.floor(b.length / 2)] + b[Math.ceil(b.length / 2) - 1]) / 2
    : 0;
};
const stop = new Set(
  "the a an and or to of is in on for with this that it you your we our are be at from as by i my about how what".split(
    " ",
  ),
);
const frequency = (a: string[]): Frequency =>
  Object.entries(
    a.reduce<Record<string, number>>((r, w) => {
      r[w] = (r[w] ?? 0) + 1;
      return r;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8);
export function analyze(posts: Post[]): Analytics {
  const lengths = posts.map((p) => Array.from(p.text).length),
    ranked = [...posts].sort((a, b) => engagement(b) - engagement(a));
  const averages: Analytics["averages"] = {};
  for (const k of metrics) {
    const v = posts.flatMap((p) =>
      typeof p.metrics[k] === "number" ? [p.metrics[k]!] : [],
    );
    if (v.length) averages[k] = mean(v);
  }
  const questions = posts.filter((p) => p.text.includes("?")).length;
  const top = ranked.slice(0, Math.max(1, Math.ceil(posts.length * 0.2)));
  return {
    count: posts.length,
    averages,
    total: posts.reduce((s, p) => s + engagement(p), 0),
    medianEngagement: median(posts.map(engagement)),
    averageLength: mean(lengths),
    medianLength: median(lengths),
    keywords: frequency(
      posts.flatMap((p) =>
        (p.text.toLowerCase().match(/[\p{L}]{3,}/gu) ?? []).filter(
          (w) => !stop.has(w),
        ),
      ),
    ),
    hashtags: frequency(
      posts.flatMap(
        (p) => p.text.toLowerCase().match(/#[\p{L}\p{N}_]+/gu) ?? [],
      ),
    ),
    hooks: frequency(
      posts.map((p) => p.text.split(/\s+/).slice(0, 3).join(" ").toLowerCase()),
    ),
    questions,
    lengths: [
      lengths.filter((n) => n < 80).length,
      lengths.filter((n) => n >= 80 && n < 160).length,
      lengths.filter((n) => n >= 160).length,
    ],
    patterns: top.length
      ? [
          `Top 20%: ${Math.round(mean(top.map((p) => p.text.length)))} characters on average.`,
          `${top.filter((p) => p.text.includes("?")).length} of ${top.length} leading posts ask a question.`,
          `${top.filter((p) => p.hasImage).length} of ${top.length} leading posts contain an image.`,
        ]
      : [],
  };
}
export function filterPosts(
  posts: Post[],
  c: ResearchConfig,
  now = Date.now(),
): Post[] {
  const unique = [...new Map(posts.map((p) => [p.id, p])).values()].filter(
    (p) =>
      Date.parse(p.createdAt) >= now - c.hours * 3600000 &&
      Date.parse(p.createdAt) <= now &&
      (c.media === "Any media" ||
        (c.media === "Images only" ? p.hasImage : !p.hasImage)) &&
      (!c.query || p.text.toLowerCase().includes(c.query.toLowerCase())),
  );
  if (c.engagement !== "All matching posts")
    unique.sort((a, b) =>
      c.engagement === "Most liked"
        ? (b.metrics.likes ?? 0) - (a.metrics.likes ?? 0)
        : c.engagement === "Most reposted"
          ? (b.metrics.reposts ?? 0) - (a.metrics.reposts ?? 0)
          : engagement(b) - engagement(a),
    );
  else unique.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return unique.slice(0, c.count);
}
export const change = (a: number, b: number) => ({
  absolute: b - a,
  percent: a === 0 ? (b === 0 ? 0 : null) : ((b - a) / Math.abs(a)) * 100,
});
export function compare(a: Dataset, b: Dataset) {
  const warnings: string[] = [];
  if (a.topic !== b.topic || a.query !== b.query)
    warnings.push("Topics or keywords differ.");
  if (
    a.hours !== b.hours ||
    a.capturedAt.slice(0, 10) !== b.capturedAt.slice(0, 10)
  )
    warnings.push("Capture dates or date ranges differ.");
  if (
    a.media !== b.media ||
    a.engagement !== b.engagement ||
    a.source !== b.source
  )
    warnings.push("Filters or sources differ.");
  if (a.count !== b.count || a.analytics.count !== b.analytics.count)
    warnings.push("Requested or actual sample sizes differ.");
  const rows = [
    { label: "Posts", a: a.analytics.count, b: b.analytics.count },
    {
      label: "Average length",
      a: a.analytics.averageLength,
      b: b.analytics.averageLength,
    },
  ];
  for (const k of metrics)
    if (
      a.analytics.averages[k] !== undefined &&
      b.analytics.averages[k] !== undefined
    )
      rows.push({
        label: `Average ${k}`,
        a: a.analytics.averages[k]!,
        b: b.analytics.averages[k]!,
      });
  return { warnings, rows: rows.map((r) => ({ ...r, ...change(r.a, r.b) })) };
}
// Practical weighting: links count as 23; CJK and emoji count as two. Not a publishing validator.
export const characterCount = (text: string) =>
  Array.from(text.replace(/https?:\/\/\S+/g, "a".repeat(23))).reduce(
    (n, c) => n + ((c.codePointAt(0) ?? 0) > 0x10ff ? 2 : 1),
    0,
  );
