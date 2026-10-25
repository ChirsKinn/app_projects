import { test } from "node:test";
import assert from "node:assert/strict";
import { research, generate, promptContext } from "../src/services";
import { characterCount } from "../src/analytics";
test("demo analysis feeds configurable original variations without API access", async () => {
  const ds = await research(
    {
      topic: "Science",
      query: "",
      hours: 24,
      count: 50,
      engagement: "Most liked",
      media: "Any media",
    },
    "Demo",
  );
  assert.equal(ds.source, "Demo");
  assert.equal(ds.analytics.count, 50);
  assert.equal(ds.posts.length, 50);
  for (const tone of [
    "Professional",
    "Casual",
    "Humorous",
    "Provocative",
    "Informative",
  ])
    for (const length of ["Short", "Medium", "Long"]) {
      const r = await generate(
        ds,
        { instructions: "Discuss space research", tone, length, count: 5 },
        "Demo",
      );
      assert.equal(r.posts.length, 5);
      assert.equal(new Set(r.posts).size, 5);
      assert.ok(r.origin.includes("not AI"));
      assert.ok(
        r.posts.every(
          (p) =>
            characterCount(p) <=
            (length === "Short" ? 120 : length === "Medium" ? 210 : 280),
        ),
      );
      assert.ok(
        r.posts.every((p) => !ds.posts.some((source) => source.text === p)),
      );
    }
  assert.equal("posts" in promptContext(ds), false);
});
test("invalid research and unmatched keywords produce actionable errors", async () => {
  const config = {
    topic: "Other",
    query: "",
    hours: 24,
    count: 25,
    engagement: "All matching posts" as const,
    media: "Any media" as const,
  };
  await assert.rejects(research(config, "Demo"), /Enter a keyword/);
  await assert.rejects(
    research(
      { ...config, topic: "Science", query: "not-present-in-samples" },
      "Demo",
    ),
    /No matching posts/,
  );
});
