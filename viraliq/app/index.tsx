import React from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import { useData } from "../src/contexts";
import {
  Screen,
  Card,
  Label,
  Button,
  StatCard,
  EmptyState,
  LoadingState,
  Selector,
  row,
  age,
  ThemeToggle,
} from "../src/components";
export default function Home() {
  const d = useData();
  return (
    <Screen title="ViralIQ" subtitle="Find the signal. Create with intention.">
      <View style={row}>
        <Selector
          label="Research source"
          values={["Demo", "Live"] as const}
          value={d.mode}
          onChange={(m) => {
            void d
              .setMode(m)
              .catch(() =>
                Alert.alert(
                  "Research source wasn’t saved",
                  "Select your research source again. Your saved datasets and drafts are still available.",
                ),
              );
          }}
        />
        <ThemeToggle />
      </View>
      {d.error ? (
        <Card>
          <Label>{d.error}</Label>
          <Button
            title="Reload saved research"
            onPress={() => void d.refresh()}
          />
        </Card>
      ) : null}
      {d.loading ? (
        <LoadingState />
      ) : d.active ? (
        <Card>
          <Label muted size={11}>
            Active research · {d.active.source.toLowerCase()}
          </Label>
          <Label size={26}>
            {d.active.topic}
            {d.active.query ? ` / ${d.active.query}` : ""}
          </Label>
          <Label>{d.active.analytics.count} posts analyzed</Label>
          <Label muted>
            {new Date(d.active.capturedAt).toLocaleString()} ·{" "}
            {age(d.active.capturedAt)}
          </Label>
          <Button
            title="View latest results →"
            secondary
            onPress={() => router.push("/results")}
          />
        </Card>
      ) : (
        <EmptyState text="Welcome to your research studio. Analyze a topic to unlock insights and create your first drafts. Demo mode needs no accounts or API keys." />
      )}
      <View style={row}>
        <StatCard label="Saved datasets" value={d.datasets.length} />
        <StatCard label="Saved drafts" value={d.drafts.length} />
      </View>
      <Button
        title="Analyze a topic →"
        onPress={() => router.push("/analyze")}
      />
      <Button
        title="Generate posts ✦"
        secondary
        onPress={() =>
          d.active
            ? router.push("/generate")
            : Alert.alert(
                "Research required",
                "Analyze a topic before generating a post.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Analyze a topic",
                    onPress: () => router.push("/analyze"),
                  },
                ],
              )
        }
      />
      <Card>
        <Label size={18}>Research, with perspective.</Label>
        <Label muted>
          Explore patterns across a sample. Use them to guide your creativity,
          without a promise of future performance.
        </Label>
        <Label muted>
          {d.mode === "Demo"
            ? "Demo · Synthetic sample posts and local draft templates."
            : "Live · Requires a configured backend and API access."}
        </Label>
      </Card>
    </Screen>
  );
}
