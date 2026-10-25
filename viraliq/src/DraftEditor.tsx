import React, { useState } from "react";
import { Alert, Linking, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Draft } from "./types";
import { saveDraft } from "./database";
import { useData } from "./contexts";
import { characterCount } from "./analytics";
import { Card, Label, Input, Button } from "./components";
export function DraftEditor({
  draft,
  onRegenerate,
}: {
  draft: Draft;
  onRegenerate?: () => void;
}) {
  const [content, setContent] = useState(draft.content),
    [busy, setBusy] = useState(false),
    d = useData();
  const count = characterCount(content);
  async function action(
    fn: () => Promise<unknown>,
    recovery = "Try the action again. Your edited text is still here, so you can copy it before leaving this screen.",
  ) {
    setBusy(true);
    try {
      await fn();
    } catch {
      Alert.alert("Your draft action couldn’t be completed", recovery);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card>
      <Label muted size={12}>
        {draft.origin} · {draft.datasetTopic}
        {draft.datasetId ? "" : " · Research deleted"}
      </Label>
      <Input
        label="Edit post"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <Label muted>{count} / 280 weighted characters (approx.)</Label>
      {count > 280 ? (
        <Label>
          Shorten your post by approximately {count - 280} weighted characters
          before saving or sharing.
        </Label>
      ) : !content.trim() ? (
        <Label>Write a post before saving or sharing.</Label>
      ) : null}
      <Button
        title="Save draft"
        disabled={busy || !content.trim() || count > 280}
        onPress={() =>
          void action(async () => {
            await saveDraft({
              ...draft,
              content,
              updatedAt: new Date().toISOString(),
            });
            await d.refresh();
            Alert.alert("Saved", "Your draft is stored on this device.");
          })
        }
      />
      <Button
        secondary
        title="Copy post"
        disabled={busy}
        onPress={() =>
          void action(
            () => Clipboard.setStringAsync(content),
            "Your post couldn’t be copied. Try copying it again, or select the text manually.",
          )
        }
      />
      <Button
        secondary
        title="Share post…"
        disabled={busy || !content.trim() || count > 280}
        onPress={() =>
          void action(
            () => Share.share({ message: content }),
            "The share sheet couldn’t be opened. Try sharing again, or copy your post into another app.",
          )
        }
      />
      <Button
        secondary
        title="Open X compose ↗"
        disabled={busy || count > 280}
        onPress={() =>
          void action(
            () =>
              Linking.openURL(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`,
              ),
            "X compose couldn’t be opened. Try again, or copy your post and open X yourself.",
          )
        }
      />
      {onRegenerate ? (
        <Button
          secondary
          title="Regenerate variations"
          onPress={onRegenerate}
        />
      ) : null}
    </Card>
  );
}
