export type Mode = "Demo" | "Live";
export const topics = [
  "Technology",
  "Gaming",
  "Finance",
  "Sports",
  "Entertainment",
  "Science",
  "Politics",
  "Other",
] as const;
export const hours = [1, 6, 24, 72, 168];
export type Metric = "likes" | "reposts" | "replies" | "quotes";
export type Post = {
  id: string;
  text: string;
  createdAt: string;
  author: string;
  username?: string;
  hasImage: boolean;
  metrics: Partial<Record<Metric, number>>;
  expiresAt?: string;
};
export type ResearchConfig = {
  topic: string;
  query: string;
  hours: number;
  count: number;
  engagement:
    | "All matching posts"
    | "Highest engagement"
    | "Most liked"
    | "Most reposted";
  media: "Any media" | "Text-only" | "Images only";
};
export type Frequency = [string, number][];
export type Analytics = {
  count: number;
  averages: Partial<Record<Metric, number>>;
  total: number;
  medianEngagement: number;
  averageLength: number;
  medianLength: number;
  keywords: Frequency;
  hashtags: Frequency;
  hooks: Frequency;
  questions: number;
  lengths: number[];
  patterns: string[];
};
export type Dataset = ResearchConfig & {
  id: string;
  source: Mode;
  capturedAt: string;
  analytics: Analytics;
  summary?: string;
  posts: Post[];
};
export type Draft = {
  id: string;
  datasetId: string | null;
  datasetTopic: string;
  content: string;
  instructions: string;
  tone: string;
  origin: string;
  createdAt: string;
  updatedAt: string;
};
export type GenerateOptions = {
  instructions: string;
  tone: string;
  length: string;
  count: number;
};
