import React, { useState } from "react";
import { router } from "expo-router";
import { useData } from "../src/contexts";
import { Draft, GenerateOptions } from "../src/types";
import { getDataset, uid } from "../src/database";
import { generate } from "../src/services";
import { DraftEditor } from "../src/DraftEditor";
import {
  Screen,
  Card,
  Label,
  Button,
  Selector,
  Input,
  EmptyState,
  LoadingState,
  age,
  ErrorState,
} from "../src/components";
export default function Generate() {
  const d = useData(),
    [o, set] = useState<GenerateOptions>({
      instructions: "",
      tone: "Casual",
      length: "Medium",
      count: 3,
    }),
    [items, setItems] = useState<Draft[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function run() {
    if (!d.active) return;
    setBusy(true);
    setError("");
    try {
      const dataset = await getDataset(d.active.id);
      if (!dataset)
        throw Error(
          "Select a saved dataset in history, or analyze a topic before generating a post.",
        );
      const result = await generate(dataset, o, d.mode);
      setItems(
        result.posts.map((content) => ({
          id: uid(),
          datasetId: dataset.id,
          datasetTopic: dataset.topic,
          content,
          instructions: o.instructions,
          tone: o.tone,
          origin: result.origin,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      );
    } catch (e) {
      setError(
        e instanceof Error && !/sqlite|database|constraint/i.test(e.message)
          ? e.message
          : "Your saved research couldn’t be loaded. Select the dataset in history and generate posts again. Your instructions are still here.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!d.active)
    return (
      <Screen
        title="Create something original"
        subtitle="Research-informed writing"
      >
        <EmptyState text="Analyze a topic before generating a post." />
        <Button
          title="Analyze a topic"
          onPress={() => router.push("/analyze")}
        />
      </Screen>
    );
  return (
    <Screen
      title="Create something original"
      subtitle={`${d.mode === "Demo" ? "Local template" : "Hosted AI"} generation`}
    >
      <Card>
        <Label size={20}>{d.active.topic}</Label>
        <Label muted>
          {d.active.analytics.count} posts · {d.active.source} dataset
        </Label>
        <Label muted>
          {new Date(d.active.capturedAt).toLocaleString()} ·{" "}
          {age(d.active.capturedAt)}
        </Label>
      </Card>
      <Card>
        <Input
          label="Your direction (optional)"
          placeholder="Write a funny post about AI replacing office jobs…"
          multiline
          value={o.instructions}
          onChangeText={(instructions) => set({ ...o, instructions })}
        />
        <Label muted size={12}>
          Use your keyboard’s microphone for voice dictation.
        </Label>
        <Selector
          label="Tone"
          values={[
            "Professional",
            "Casual",
            "Humorous",
            "Provocative",
            "Informative",
          ]}
          value={o.tone}
          onChange={(tone) => set({ ...o, tone })}
        />
        <Selector
          label="Length"
          values={["Short", "Medium", "Long"]}
          value={o.length}
          onChange={(length) => set({ ...o, length })}
        />
        <Selector
          label="Variations"
          values={[1, 3, 5]}
          value={o.count}
          onChange={(count) => set({ ...o, count })}
        />
      </Card>
      {error ? (
        <Card>
          <ErrorState title="Posts couldn’t be generated" message={error} />
          {d.mode === "Live" ? (
            <Button
              secondary
              title="Use demo templates"
              onPress={() => {
                void d
                  .setMode("Demo")
                  .catch(() =>
                    setError(
                      "Demo mode couldn’t be saved. Select Demo on the home screen and try generating posts again.",
                    ),
                  );
              }}
            />
          ) : null}
        </Card>
      ) : null}
      {busy ? (
        <LoadingState text="Creating original variations from your saved research…" />
      ) : (
        <Button
          title={
            d.mode === "Demo"
              ? "Generate template posts ✦"
              : "Generate posts with AI ✦"
          }
          onPress={() => void run()}
        />
      )}
      <Label muted size={12}>
        {d.mode === "Demo"
          ? "Local rules use your direction, tone, length and research keywords. They are not an AI model."
          : "Only the active dataset’s topic, aggregate insights and your instructions are sent to the backend."}{" "}
        Edit and check every draft before sharing.
      </Label>
      {items.map((item) => (
        <DraftEditor
          key={item.id}
          draft={item}
          onRegenerate={() => void run()}
        />
      ))}
    </Screen>
  );
}
