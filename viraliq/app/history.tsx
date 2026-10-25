import React, { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useData } from "../src/contexts";
import {
  deleteDataset,
  deleteDraft,
  clearLiveContent,
  deleteExternal,
} from "../src/database";
import { DraftEditor } from "../src/DraftEditor";
import {
  Screen,
  Card,
  Label,
  Button,
  Selector,
  Input,
  EmptyState,
} from "../src/components";
export default function History() {
  const d = useData(),
    [tab, setTab] = useState("Datasets"),
    [external, setExternal] = useState("");
  const perform = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      await d.refresh();
    } catch {
      Alert.alert(
        "Your library couldn’t be updated",
        "Try the action again. If this keeps happening, reopen the app and reload your saved research.",
      );
    }
  };
  const confirm = (
    title: string,
    actionLabel: string,
    message: string,
    fn: () => Promise<unknown>,
  ) =>
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: actionLabel,
        style: "destructive",
        onPress: () => void perform(fn),
      },
    ]);
  return (
    <Screen
      title="Your research library"
      subtitle="Saved on this device. Ready when you are."
    >
      <Selector
        label="View"
        values={["Datasets", "Saved drafts"]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Datasets" ? (
        <>
          <Button
            secondary
            title="Compare saved datasets"
            onPress={() => router.push("/compare")}
          />
          {!d.datasets.length ? (
            <EmptyState text="Your completed research will appear here." />
          ) : (
            d.datasets.map((ds) => (
              <Card key={ds.id}>
                <Label size={22}>
                  {ds.topic}
                  {d.active?.id === ds.id ? " · Active" : ""}
                </Label>
                <Label muted>
                  {ds.source} · {ds.analytics.count} posts ·{" "}
                  {new Date(ds.capturedAt).toLocaleString()}
                </Label>
                <Label muted>
                  {ds.query || "Topic research"} · Last {ds.hours}h · {ds.media}{" "}
                  · {ds.engagement}
                </Label>
                <Button
                  title="Open results & set active"
                  onPress={() =>
                    void perform(async () => {
                      await d.select(ds.id);
                      router.push("/results");
                    })
                  }
                />
                <Button
                  secondary
                  title="Set as active dataset"
                  onPress={() => void perform(() => d.select(ds.id))}
                />
                <Button
                  secondary
                  title="Delete dataset"
                  onPress={() =>
                    confirm(
                      "Delete dataset?",
                      "Delete dataset",
                      "This removes the dataset and its source posts from this device. Saved drafts remain editable.",
                      () => deleteDataset(ds.id),
                    )
                  }
                />
              </Card>
            ))
          )}
          <Card>
            <Label size={18}>External content controls</Label>
            <Label muted size={12}>
              Remove stored post content while keeping aggregate analytics.
              Content expiry also runs on startup and when returning to the app.
            </Label>
            <Input
              label="External post ID for deletion request"
              value={external}
              onChangeText={setExternal}
            />
            <Button
              secondary
              title="Remove this source post locally"
              disabled={!external.trim()}
              onPress={() =>
                confirm(
                  "Remove source content?",
                  "Remove source post",
                  "This removes the source post from every dataset on this device. Aggregate statistics remain available.",
                  () => deleteExternal(external.trim()),
                )
              }
            />
            <Button
              secondary
              title="Clear all retained live content"
              onPress={() =>
                confirm(
                  "Clear live content?",
                  "Clear live content",
                  "This removes all retained live source posts from this device. Your datasets, statistics and drafts remain available.",
                  clearLiveContent,
                )
              }
            />
          </Card>
        </>
      ) : d.drafts.length ? (
        d.drafts.map((dr) => (
          <Card key={dr.id}>
            <Label muted>{new Date(dr.createdAt).toLocaleString()}</Label>
            <DraftEditor draft={dr} />
            <Button
              secondary
              title="Delete saved draft"
              onPress={() =>
                confirm(
                  "Delete draft?",
                  "Delete draft",
                  "This permanently removes the saved draft from this device.",
                  () => deleteDraft(dr.id),
                )
              }
            />
          </Card>
        ))
      ) : (
        <EmptyState text="Save generated variations to edit, copy and share them here." />
      )}
    </Screen>
  );
}
