import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { schema } from "../src/schema";
test("real SQLite schema persists, expires content, preserves orphan drafts and settings", () => {
  const dir = mkdtempSync(join(tmpdir(), "viraliq-")),
    file = join(dir, "test.db");
  try {
    let db = new DatabaseSync(file);
    db.exec("PRAGMA foreign_keys=ON;");
    db.exec(schema);
    db.prepare("INSERT INTO datasets VALUES(?,?)").run(
      "one",
      JSON.stringify({ topic: "Science", source: "Live" }),
    );
    db.prepare("INSERT INTO research_posts VALUES(?,?,?,?)").run(
      "external",
      "one",
      "{}",
      "2020-01-01T00:00:00.000Z",
    );
    db.prepare("INSERT INTO drafts VALUES(?,?,?)").run(
      "draft",
      "one",
      JSON.stringify({ content: "Keep this draft" }),
    );
    db.prepare("INSERT INTO settings VALUES(?,?)").run("active", "one");
    db.close();
    db = new DatabaseSync(file);
    db.exec("PRAGMA foreign_keys=ON;");
    assert.equal(db.prepare("PRAGMA user_version").get()?.user_version, 1);
    assert.equal(
      db.prepare("SELECT value FROM settings WHERE key=?").get("active")?.value,
      "one",
    );
    assert.equal(db.prepare("SELECT count(*) AS n FROM datasets").get()?.n, 1);
    db.prepare("DELETE FROM research_posts WHERE content_expiry_at<=?").run(
      new Date().toISOString(),
    );
    assert.equal(
      db.prepare("SELECT count(*) AS n FROM research_posts").get()?.n,
      0,
    );
    db.prepare("DELETE FROM datasets WHERE id=?").run("one");
    assert.equal(
      db.prepare("SELECT dataset_id FROM drafts").get()?.dataset_id,
      null,
    );
    assert.ok(
      String(db.prepare("SELECT payload FROM drafts").get()?.payload).includes(
        "Keep this draft",
      ),
    );
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

