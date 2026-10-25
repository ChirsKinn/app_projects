import React from "react";
import { Linking, View } from "react-native";
import { router } from "expo-router";
import { useData } from "../src/contexts";
import { engagement } from "../src/analytics";
import {
  Screen,
  Card,
  Label,
  Button,
  EmptyState,
  StatCard,
  Bars,
  row,
  number,
} from "../src/components";
export default function Results() {
  const { active: d } = useData();
  if (!d)
    return (
      <Screen title="Results" subtitle="Your research, explained">
        <EmptyState text="Analyze a topic or select a saved dataset from History." />
      </Screen>
    );
  const a = d.analytics;
  return (
    <Screen
      title={d.topic}
      subtitle={`${d.source} research · ${new Date(d.capturedAt).toLocaleString()}`}
    >
      <Card>
        <Label>
          {a.count} collected / {d.count} requested · Last {d.hours} hours
        </Label>
        <Label muted>
          {d.query || "All topic keywords"} · {d.media} · {d.engagement}
        </Label>
        {a.count < d.count ? (
          <Label muted>
            Fewer matches than requested. These results describe the collected
            sample only.
          </Label>
        ) : null}
      </Card>
      <View style={row}>
        {Object.entries(a.averages).map(([k, v]) => (
          <StatCard key={k} label={`Average ${k}`} value={number(v)} />
        ))}
        <StatCard label="Average characters" value={number(a.averageLength)} />
        <StatCard label="Measured engagement" value={number(a.total)} />
        <StatCard
          label="Median engagement"
          value={number(a.medianEngagement)}
        />
        <StatCard label="Median characters" value={number(a.medianLength)} />
      </View>
      <Card>
        <Label size={20}>Statistics-based insights</Label>
        <Label muted>
          {a.questions} questions · {a.count - a.questions} statements
        </Label>
        {a.patterns.map((p) => (
          <Label key={p}>{p}</Label>
        ))}
        <Label muted size={12}>
          These are descriptive heuristics. Correlation does not guarantee
          future performance. Missing metrics are excluded from their averages.
        </Label>
      </Card>
      {d.summary ? (
        <Card>
          <Label size={20}>AI-generated summary</Label>
          <Label>{d.summary}</Label>
        </Card>
      ) : null}
      <Card>
        <Label size={20}>Conversation keywords</Label>
        <Bars items={a.keywords} />
      </Card>
      <Card>
        <Label size={20}>Post length distribution</Label>
        <Bars
          items={[
            ["Under 80", a.lengths[0]],
            ["80–159", a.lengths[1]],
            ["160+", a.lengths[2]],
          ]}
        />
      </Card>
      <Card>
        <Label size={20}>Hashtags & opening phrases</Label>
        <Label>
          {a.hashtags.map(([s, n]) => `${s} (${n})`).join(" · ") ||
            "No hashtags"}
        </Label>
        {a.hooks.map(([s, n]) => (
          <Label muted key={s}>
            “{s}” · {n}
          </Label>
        ))}
      </Card>
      <Label size={21}>
        {d.source === "Live" ? "Source references" : "Top synthetic examples"}
      </Label>
      {d.posts.length === 0 ? (
        <Card>
          <Label muted>
            Third-party content is not retained by default, or has expired.
            Aggregate analytics remain available.
          </Label>
        </Card>
      ) : (
        [...d.posts]
          .sort((a, b) => engagement(b) - engagement(a))
          .slice(0, 5)
          .map((p) => (
            <Card key={p.id}>
              <Label>
                {p.author}
                {p.username ? ` · @${p.username}` : ""}
              </Label>
              <Label muted>
                {new Date(p.createdAt).toLocaleString()} ·{" "}
                {p.hasImage ? "Image" : "Text"}
              </Label>
              {d.source === "Demo" ? (
                <Label>{p.text}</Label>
              ) : (
                <Label muted>
                  Open the original on X for the current post and author
                  context.
                </Label>
              )}
              <Label muted>
                ♥ {number(p.metrics.likes)} · Reposts{" "}
                {number(p.metrics.reposts)} · Replies{" "}
                {number(p.metrics.replies)}
              </Label>
              {d.source === "Live" ? (
                <Button
                  secondary
                  title="View original post on X ↗"
                  onPress={() =>
                    void Linking.openURL(`https://x.com/i/status/${p.id}`)
                  }
                />
              ) : null}
            </Card>
          ))
      )}
      <Button
        title="Generate posts from this dataset"
        onPress={() => router.push("/generate")}
      />
      <Button
        secondary
        title="Compare datasets"
        onPress={() => router.push("/compare")}
      />
      <Button secondary title="Back to home" onPress={() => router.push("/")} />
    </Screen>
  );
}
