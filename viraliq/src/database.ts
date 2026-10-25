import * as SQLite from "expo-sqlite";
import { AppState } from "react-native";
import { Dataset, Draft, Post } from "./types";
import { schema } from "./schema";
let connection: Promise<SQLite.SQLiteDatabase> | undefined;
export async function db() {
  if (!connection)
    connection = (async () => {
      const d = await SQLite.openDatabaseAsync("viraliq.db");
      await d.execAsync("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;");
      const v = await d.getFirstAsync<{ user_version: number }>(
        "PRAGMA user_version",
      );
      if ((v?.user_version ?? 0) < 1)
        await d.withTransactionAsync(() => d.execAsync(schema));
      if ((v?.user_version ?? 0) > 1)
        throw Error("This database needs a newer version of ViralIQ.");
      return d;
    })().catch((e) => {
      connection = undefined;
      throw e;
    });
  return connection;
}
export { uid } from "./id";
export async function setting(key: string, value?: string) {
  const d = await db();
  if (value !== undefined)
    await d.runAsync(
      "INSERT OR REPLACE INTO settings(key,value) VALUES(?,?)",
      key,
      value,
    );
  return (
    await d.getFirstAsync<{ value: string }>(
      "SELECT value FROM settings WHERE key=?",
      key,
    )
  )?.value;
}
export async function purgeExpired() {
  await (
    await db()
  ).runAsync(
    "DELETE FROM research_posts WHERE content_expiry_at IS NOT NULL AND content_expiry_at<=?",
    new Date().toISOString(),
  );
}
export async function listDatasets(): Promise<Dataset[]> {
  await purgeExpired();
  return (
    await (
      await db()
    ).getAllAsync<{ payload: string }>(
      "SELECT payload FROM datasets ORDER BY rowid DESC",
    )
  ).map((r) => ({ ...JSON.parse(r.payload), posts: [] }));
}
export async function getDataset(id: string): Promise<Dataset | undefined> {
  await purgeExpired();
  const d = await db(),
    row = await d.getFirstAsync<{ payload: string }>(
      "SELECT payload FROM datasets WHERE id=?",
      id,
    );
  if (!row) return;
  const posts = (
    await d.getAllAsync<{ payload: string }>(
      "SELECT payload FROM research_posts WHERE dataset_id=?",
      id,
    )
  ).map((p) => JSON.parse(p.payload) as Post);
  return { ...JSON.parse(row.payload), posts };
}
export async function saveDataset(data: Dataset) {
  const d = await db();
  await d.withTransactionAsync(async () => {
    await d.runAsync(
      "INSERT INTO datasets(id,payload) VALUES(?,?)",
      data.id,
      JSON.stringify({ ...data, posts: [] }),
    );
    for (const p of data.posts) {
      if (data.source === "Live" && !p.expiresAt) continue;
      await d.runAsync(
        "INSERT INTO research_posts(id,dataset_id,payload,content_expiry_at) VALUES(?,?,?,?)",
        p.id,
        data.id,
        JSON.stringify(p),
        p.expiresAt ?? null,
      );
    }
  });
}
export async function deleteDataset(id: string) {
  await (await db()).runAsync("DELETE FROM datasets WHERE id=?", id);
}
export async function deleteExternal(id: string) {
  await (await db()).runAsync("DELETE FROM research_posts WHERE id=?", id);
}
export async function clearLiveContent() {
  await (
    await db()
  ).runAsync(
    "DELETE FROM research_posts WHERE dataset_id IN (SELECT id FROM datasets WHERE json_extract(payload,'$.source')='Live')",
  );
}
export async function listDrafts(): Promise<Draft[]> {
  return (
    await (
      await db()
    ).getAllAsync<{ payload: string; dataset_id: string | null }>(
      "SELECT payload,dataset_id FROM drafts ORDER BY rowid DESC",
    )
  ).map((r) => ({ ...JSON.parse(r.payload), datasetId: r.dataset_id }));
}
export async function saveDraft(draft: Draft) {
  await (
    await db()
  ).runAsync(
    "INSERT INTO drafts(id,dataset_id,payload) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET dataset_id=excluded.dataset_id,payload=excluded.payload",
    draft.id,
    draft.datasetId,
    JSON.stringify(draft),
  );
}
export async function deleteDraft(id: string) {
  await (await db()).runAsync("DELETE FROM drafts WHERE id=?", id);
}
export function observeExpiry(onResume: () => void) {
  const s = AppState.addEventListener("change", (s) => {
    if (s === "active") onResume();
  });
  return () => s.remove();
}

