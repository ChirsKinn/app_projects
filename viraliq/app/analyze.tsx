import React, { useState } from "react";
import { router } from "expo-router";
import { useData } from "../src/contexts";
import { ResearchConfig, topics } from "../src/types";
import { research } from "../src/services";
import { saveDataset } from "../src/database";
import {
  Screen,
  Card,
  Label,
  Selector,
  Input,
  Button,
  LoadingState,
  ErrorState,
} from "../src/components";
export default function Analyze() {
  const d = useData();
  const [c, set] = useState<ResearchConfig>({
      topic: "Technology",
      query: "",
      hours: 24,
      count: 50,
      engagement: "Highest engagement",
      media: "Any media",
    }),
    [busy, loading] = useState(false),
    [error, setError] = useState("");
  async function start() {
    loading(true);
    setError("");
    try {
      const result = await research(c, d.mode);
      await saveDataset(result);
      await d.refresh();
      await d.select(result.id);
      router.push("/results");
    } catch (e) {
      setError(
        e instanceof Error && !/sqlite|database|constraint/i.test(e.message)
          ? e.message
          : "Your analysis couldn’t be saved. Start the analysis again. If this keeps happening, reopen the app.",
      );
    } finally {
      loading(false);
    }
  }
  return (
    <Screen
      title="Discover the signal"
      subtitle={`New research · ${d.mode} mode`}
    >
      <Card>
        <Selector
          label="Topic"
          values={topics}
          value={c.topic}
          onChange={(topic) => set({ ...c, topic })}
        />
        <Input
          label="Custom keyword (optional; required for Other)"
          placeholder="e.g. AI tools"
          value={c.query}
          onChangeText={(query) => set({ ...c, query })}
        />
        <Selector
          label="Timeframe"
          values={[
            "Last hour",
            "Last 6 hours",
            "Last 24 hours",
            "Last 3 days",
            "Last 7 days",
          ]}
          value={
            [
              "Last hour",
              "Last 6 hours",
              "Last 24 hours",
              "Last 3 days",
              "Last 7 days",
            ][[1, 6, 24, 72, 168].indexOf(c.hours)]
          }
          onChange={(v) =>
            set({
              ...c,
              hours: [1, 6, 24, 72, 168][
                [
                  "Last hour",
                  "Last 6 hours",
                  "Last 24 hours",
                  "Last 3 days",
                  "Last 7 days",
                ].indexOf(v)
              ],
            })
          }
        />
        <Selector
          label="Requested posts"
          values={[25, 50, 100, 250, 500]}
          value={c.count}
          onChange={(count) => set({ ...c, count })}
        />
        <Label muted size={12}>
          Sample size is a target. Filters and access can reduce the number
          collected.
        </Label>
        <Selector
          label="Engagement"
          values={
            [
              "All matching posts",
              "Highest engagement",
              "Most liked",
              "Most reposted",
            ] as const
          }
          value={c.engagement}
          onChange={(engagement) => set({ ...c, engagement })}
        />
        <Selector
          label="Media"
          values={["Any media", "Text-only", "Images only"] as const}
          value={c.media}
          onChange={(media) => set({ ...c, media })}
        />
      </Card>
      {error ? (
        <ErrorState title="Analysis couldn’t be completed" message={error} />
      ) : null}
      {busy ? (
        <LoadingState text="Retrieving posts, applying filters, calculating insights and saving research…" />
      ) : (
        <Button title="Analyze topic →" onPress={() => void start()} />
      )}
      <Label muted size={12}>
        {d.mode === "Demo"
          ? "Demo samples are synthetic and span seven days. Keywords filter their actual text."
          : "Live ranks a bounded recent-search candidate pool locally; it cannot discover every viral post."}
      </Label>
    </Screen>
  );
}
