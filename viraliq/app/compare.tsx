import React, { useState } from "react";
import { View } from "react-native";
import { useData } from "../src/contexts";
import { compare } from "../src/analytics";
import {
  Screen,
  Card,
  Label,
  Button,
  EmptyState,
  Bars,
  number,
  row,
} from "../src/components";
export default function Compare() {
  const { datasets } = useData(),
    [left, setLeft] = useState(""),
    [right, setRight] = useState("");
  const a = datasets.find((d) => d.id === left) ?? datasets[0],
    b = datasets.find((d) => d.id === right) ?? datasets[1];
  if (!a || !b)
    return (
      <Screen title="Compare research" subtitle="Understand what changed">
        <EmptyState text="Save at least two datasets to compare their research." />
      </Screen>
    );
  const c = compare(a, b);
  return (
    <Screen
      title="Compare research"
      subtitle="Changes are measured from A to B."
    >
      <View style={row}>
        {[a, b].map((ds, i) => (
          <View key={i} style={{ flex: 1, minWidth: 130 }}>
            <Card>
              <Label muted>Dataset {i ? "B" : "A"}</Label>
              <Label size={20}>{ds.topic}</Label>
              <Label muted>{new Date(ds.capturedAt).toLocaleString()}</Label>
              <Label>
                {ds.source} · {ds.analytics.count} posts
              </Label>
              <Label muted>
                {ds.media} · {ds.engagement} · {ds.hours}h
              </Label>
              <Label>
                {ds.analytics.keywords
                  .map((x) => x[0])
                  .slice(0, 4)
                  .join(", ")}
              </Label>
              {ds.analytics.patterns.map((p) => (
                <Label muted key={p} size={12}>
                  {p}
                </Label>
              ))}
            </Card>
          </View>
        ))}
      </View>
      <Card>
        <Label>Select A</Label>
        {datasets.map((ds) => (
          <Button
            key={ds.id}
            secondary={ds.id !== a.id}
            title={`${ds.topic} · ${new Date(ds.capturedAt).toLocaleString()} · ${ds.analytics.count} posts`}
            onPress={() => setLeft(ds.id)}
          />
        ))}
      </Card>
      <Card>
        <Label>Select B</Label>
        {datasets.map((ds) => (
          <Button
            key={ds.id}
            secondary={ds.id !== b.id}
            title={`${ds.topic} · ${new Date(ds.capturedAt).toLocaleString()} · ${ds.analytics.count} posts`}
            onPress={() => setRight(ds.id)}
          />
        ))}
      </Card>
      {a.id === b.id ? (
        <Card>
          <Label>Select different datasets for a meaningful comparison.</Label>
        </Card>
      ) : null}
      {c.warnings.length ? (
        <Card>
          <Label size={19}>Compare with care</Label>
          {c.warnings.map((w) => (
            <Label key={w}>{w}</Label>
          ))}
          <Label muted>
            These differences can make apparent changes misleading.
          </Label>
        </Card>
      ) : null}
      {c.rows.map((r) => (
        <Card key={r.label}>
          <Label size={18}>{r.label}</Label>
          <Bars
            items={[
              [`A: ${number(r.a)}`, r.a],
              [`B: ${number(r.b)}`, r.b],
            ]}
          />
          <Label>
            {r.absolute >= 0 ? "+" : ""}
            {number(r.absolute)} ·{" "}
            {r.percent === null
              ? "Percentage undefined (A is zero)"
              : `${number(r.percent)}%`}
          </Label>
        </Card>
      ))}
    </Screen>
  );
}
