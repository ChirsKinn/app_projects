import { analyze, characterCount, filterPosts } from "./analytics";
import { demoPosts } from "./demo";
import { Dataset, GenerateOptions, Mode, Post, ResearchConfig } from "./types";
import { uid } from "./id";
const base = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
async function request<T>(path: string, body: unknown): Promise<T> {
  if (!base)
    throw Error(
      "Live research isn’t available yet. Select Demo on the home screen to analyze sample posts, or configure the live service before trying again.",
    );
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 60000);
  try {
    const r = await fetch(base + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (r.status === 429)
      throw Error(
        "The service has reached its request limit. Wait a few minutes, then try again. Your inputs are still here.",
      );
    if (r.status === 401 || r.status === 403)
      throw Error(
        "The live service couldn’t authorize this request. Check its API access, or select Demo on the home screen to use sample data.",
      );
    let data;
    try {
      data = await r.json();
    } catch {
      throw Error(
        "The service sent a response we couldn’t read. Try again, or select Demo on the home screen.",
      );
    }
    if (!r.ok)
      throw Error(
        typeof data.error === "string"
          ? data.error
          : "The live service couldn’t complete this request. Try again, or select Demo on the home screen.",
      );
    return data as T;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError")
      throw Error(
        "The service timed out. Please retry. Your inputs have been preserved.",
      );
    if (e instanceof TypeError)
      throw Error(
        "We couldn’t connect to the live service. Check your connection and try again, or select Demo on the home screen. Your inputs are still here.",
      );
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
export async function research(
  config: ResearchConfig,
  mode: Mode,
): Promise<Dataset> {
  if (
    !config.topic.trim() ||
    (config.topic === "Other" && !config.query.trim())
  )
    throw Error("Enter a keyword for Other.");
  if (config.query.length > 120)
    throw Error("Keep keywords under 120 characters.");
  const now = Date.now();
  const candidates =
    mode === "Demo"
      ? demoPosts(config.topic, now)
      : (await request<{ posts: Post[] }>("/research", config)).posts;
  const posts = filterPosts(candidates, config, now);
  if (!posts.length)
    throw Error(
      "No matching posts. Try a longer timeframe, fewer keywords, or a broader media filter.",
    );
  const dataset: Dataset = {
    ...config,
    id: uid(),
    source: mode,
    capturedAt: new Date(now).toISOString(),
    posts,
    analytics: analyze(posts),
  };
  if (mode === "Live") {
    try {
      dataset.summary = (
        await request<{ summary: string }>("/summary", {
          topic: dataset.topic,
          analytics: dataset.analytics,
        })
      ).summary;
    } catch {
      /* Statistics remain usable when optional AI is unavailable. */
    }
  }
  return dataset;
}
export const promptContext = (d: Dataset) => ({
  topic: d.topic,
  query: d.query,
  source: d.source,
  capturedAt: d.capturedAt,
  analytics: d.analytics,
});
export function templates(d: Dataset, o: GenerateOptions): string[] {
  const subject =
    o.instructions
      .trim()
      .replace(/[\r\n]+/g, " ")
      .slice(0, 90) ||
    d.query ||
    d.topic.toLowerCase();
  const key = d.analytics.keywords[0]?.[0] ?? d.topic.toLowerCase();
  const starts: Record<string, string[]> = {
    Professional: [
      "A useful perspective:",
      "One practical priority:",
      "A question for your team:",
      "Consider this:",
      "A small experiment:",
    ],
    Casual: [
      "Been thinking about",
      "Here’s a thought on",
      "Quick question about",
      "A little reminder about",
      "Let’s talk about",
    ],
    Humorous: [
      "Plot twist:",
      "My brain has opened 47 tabs about",
      "Today’s side quest:",
      "Someone give a user manual to",
      "The group chat has thoughts on",
    ],
    Provocative: [
      "What if we questioned",
      "The uncomfortable question about",
      "Hot take: rethink",
      "It’s time to revisit",
      "Challenge the default on",
    ],
    Informative: [
      "A closer look at",
      "A useful starting point for",
      "Three things to consider about",
      "A quick note on",
      "One detail worth understanding:",
    ],
  };
  const endings = [
    `What would you test first?`,
    `Start small. Measure what changes.`,
    `The useful lesson is in the details.`,
    `Ask better questions before making bigger promises.`,
    `Progress starts with a thoughtful experiment.`,
  ];
  return Array.from({ length: o.count }, (_, i) => {
    let text = `${(starts[o.tone] ?? starts.Professional)[i]} ${subject}. ${endings[i]}`;
    if (o.length === "Long")
      text += ` The conversation around ${key} is a reminder to stay curious and learn in public.`;
    const limit =
      o.length === "Short" ? 120 : o.length === "Medium" ? 210 : 280;
    while (characterCount(text) > limit)
      text = Array.from(text).slice(0, -1).join("");
    return text;
  });
}
export async function generate(d: Dataset, o: GenerateOptions, mode: Mode) {
  if (mode === "Demo")
    return { posts: templates(d, o), origin: "Local templates · not AI" };
  const response = await request<{ posts: string[] }>("/generate", {
    dataset: promptContext(d),
    options: o,
  });
  if (
    !Array.isArray(response.posts) ||
    response.posts.length !== o.count ||
    response.posts.some(
      (p) => typeof p !== "string" || !p.trim() || characterCount(p) > 280,
    )
  )
    throw Error(
      "AI returned invalid drafts. Retry or switch to Demo for local templates.",
    );
  return { ...response, origin: "Hosted AI" };
}
