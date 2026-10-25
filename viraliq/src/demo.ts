import { Post, topics } from "./types";
const ideas: Record<string, string[]> = {
  Technology: ["AI tools", "open source", "software teams", "automation"],
  Gaming: [
    "cooperative games",
    "game design",
    "indie studios",
    "competitive play",
  ],
  Finance: [
    "budget habits",
    "compound growth",
    "market uncertainty",
    "financial literacy",
  ],
  Sports: ["teamwork", "training routines", "match strategy", "recovery"],
  Entertainment: [
    "storytelling",
    "independent films",
    "live music",
    "creative practice",
  ],
  Science: [
    "space research",
    "climate experiments",
    "new discoveries",
    "scientific curiosity",
  ],
  Politics: [
    "public policy",
    "local participation",
    "civic debate",
    "community priorities",
  ],
  Other: ["creative habits", "learning", "community projects", "new ideas"],
};
export function demoPosts(topic: string, now = Date.now()): Post[] {
  const subjects = ideas[topic] ?? ideas.Other;
  return Array.from({ length: 720 }, (_, i) => {
    const subject = subjects[i % 4],
      style = i % 6;
    const text = [
      `What if ${subject} started with one better question? Small experiments teach us more than big promises. #${topic}`,
      `A practical lesson: ${subject} works best when people share what failed, too. Here is the part we keep overlooking: consistent feedback. #Learning`,
      `The next chapter of ${subject} belongs to curious people.`,
      `Three things I learned about ${subject}: start small, measure the result, and keep asking why. Progress is a process, not a headline. #${topic}`,
      `Unpopular opinion: ${subject} needs fewer hot takes and more patient testing. What would you try first?`,
      `Today I tried a new approach to ${subject}. One tiny change made the work clearer. Sometimes the simplest idea is the one worth sharing. #Ideas`,
    ][style];
    return {
      id: `demo-${topic}-${i}`,
      text,
      createdAt: new Date(
        now - (i < 180 ? i / 180 : 1 + ((i - 180) / 540) * 166) * 3600000,
      ).toISOString(),
      author: `Demo Creator ${(i % 23) + 1}`,
      hasImage: i % 3 === 0,
      metrics: {
        likes: Math.floor(((i * 7919) % 1500) * (style === 0 ? 1.5 : 1)),
        reposts: (i * 37) % 210,
        replies: (i * 13) % 90,
        quotes: (i * 7) % 40,
      },
    };
  });
}
export const demoTopics = topics;
