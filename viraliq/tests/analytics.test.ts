import { test } from "node:test";
import assert from "node:assert/strict";
import {
  analyze,
  change,
  compare,
  filterPosts,
  characterCount,
} from "../src/analytics";
import { demoPosts } from "../src/demo";
import { Dataset, Post, ResearchConfig } from "../src/types";
const config: ResearchConfig = {
  topic: "Technology",
  query: "",
  hours: 24,
  count: 50,
  engagement: "Highest engagement",
  media: "Any media",
};
const p = (id: string, likes?: number): Post => ({
  id,
  text: "What can science teach us? #Science",
  author: "Example",
  createdAt: new Date().toISOString(),
  metrics: { likes, reposts: 2 },
  hasImage: false,
});
test("analytics exclude missing metrics and compute medians", () => {
  const a = analyze([p("1", 0), p("2", 10), p("3")]);
  assert.equal(a.averages.likes, 5);
  assert.equal(a.averages.replies, undefined);
  assert.equal(a.total, 16);
  assert.equal(a.medianEngagement, 2);
  assert.equal(a.questions, 3);
  assert.deepEqual(a.hashtags, [["#science", 3]]);
  assert.equal(a.keywords.find((x) => x[0] === "science")?.[1], 6);
});
test("empty analytics remain finite", () => {
  const a = analyze([]);
  assert.equal(a.total, 0);
  assert.equal(a.averageLength, 0);
  assert.equal(a.medianLength, 0);
  assert.deepEqual(a.averages, {});
});
test("filters deduplicate, filter timestamps and images, then rank", () => {
  const now = Date.now(),
    posts = demoPosts("Technology", now),
    result = filterPosts(
      [...posts, ...posts],
      { ...config, media: "Images only", query: "AI tools" },
      now,
    );
  assert.ok(result.length > 0);
  assert.equal(new Set(result.map((p) => p.id)).size, result.length);
  assert.ok(result.every((p) => p.hasImage && p.text.includes("AI tools")));
  assert.ok(result.every((p) => Date.parse(p.createdAt) >= now - 24 * 3600000));
  assert.deepEqual(
    filterPosts(posts, { ...config, query: "no-such-keyword" }, now),
    [],
  );
});
test("all requested timeframes have real temporal variation", () => {
  const now = Date.now(),
    posts = demoPosts("Science", now);
  assert.ok(
    filterPosts(posts, { ...config, hours: 168, count: 500 }, now).length >
      filterPosts(posts, { ...config, hours: 1, count: 500 }, now).length,
  );
});
test("changes handle zero baseline without Infinity", () => {
  assert.deepEqual(change(0, 10), { absolute: 10, percent: null });
  assert.deepEqual(change(0, 0), { absolute: 0, percent: 0 });
  assert.deepEqual(change(10, 5), { absolute: -5, percent: -50 });
});
test("comparison includes common metrics only and warns on confounders", () => {
  const a: Dataset = {
    ...config,
    id: "a",
    source: "Demo",
    capturedAt: "2026-10-24T12:00:00Z",
    posts: [],
    analytics: analyze([p("1", 10)]),
  };
  const b: Dataset = {
    ...a,
    id: "b",
    topic: "Science",
    hours: 1,
    media: "Images only",
    count: 25,
    capturedAt: "2026-10-23T12:00:00Z",
    analytics: analyze([p("2")]),
  };
  const c = compare(a, b);
  assert.equal(c.warnings.length, 4);
  assert.equal(
    c.rows.some((r) => r.label === "Average likes"),
    false,
  );
  assert.ok(c.rows.some((r) => r.label === "Average reposts"));
});
test("practical character count weights links and emoji", () => {
  assert.equal(characterCount("https://example.com/long/path"), 23);
  assert.equal(characterCount("Hi 😀"), 5);
});
