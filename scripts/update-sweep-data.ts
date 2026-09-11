import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";
import {
  extractWikiDropTable,
  fetchWikiDropTable,
  mergeWikiStageDrops,
  parseWikiStageDrops,
  summarizeWikiChanges,
  wikiSourceUrl,
} from "./wiki-sweep-data";
import type { SweepData } from "../src/tools/sweep/types";

const dataPath = fileURLToPath(new URL("../src/tools/sweep/data.json", import.meta.url));
const snapshotPath = fileURLToPath(new URL("./fixtures/wiki-equipment-drops.html", import.meta.url));

async function readOptional(path: string) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return undefined;
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--check")) throw new Error("使い方: bun run data:update [--check]");
  const original = await readFile(dataPath, "utf8");
  const current: SweepData = JSON.parse(original);
  const { table, snapshot } = await fetchWikiDropTable();
  const drops = parseWikiStageDrops(table, current);
  const updated = mergeWikiStageDrops(current, drops);
  const changes = summarizeWikiChanges(current, updated);
  const config = await resolveConfig(dataPath);
  const formatted = await format(JSON.stringify(updated, null, 2), { ...config, parser: "json" });
  const previousSnapshot = await readOptional(snapshotPath);
  const snapshotChanged = !previousSnapshot || extractWikiDropTable(previousSnapshot).replace(/>\s+</g, "><") !== table;

  console.log(`出典: ${wikiSourceUrl}`);
  console.log(`ワールド3〜${drops.size / 10 + 2}: ${drops.size}ステージを照合しました。`);
  for (const { material, added, removed } of changes) {
    console.log(`${material}: 追加 [${added.join(", ")}] / 削除 [${removed.join(", ")}]`);
  }
  if (!changes.length && !snapshotChanged && formatted === original.replace(/\r\n/g, "\n")) {
    console.log("装備データと保存済みの出典表は一致しています。変更はありません。");
    return;
  }
  if (args.includes("--check")) {
    console.log("更新差分があります。反映するには bun run data:update を実行してください。");
    process.exitCode = 1;
    return;
  }

  const files = [
    { path: dataPath, before: original, after: formatted },
    {
      path: snapshotPath,
      before: previousSnapshot,
      after: snapshotChanged ? snapshot : (previousSnapshot ?? snapshot),
    },
  ];
  const written: typeof files = [];
  try {
    // Validate the entire response before writing, then replace each file atomically.
    for (const file of files) {
      await mkdir(dirname(file.path), { recursive: true });
      await writeFile(`${file.path}.tmp`, file.after, "utf8");
    }
    for (const file of files) {
      await rename(`${file.path}.tmp`, file.path);
      written.push(file);
    }
  } catch (error) {
    for (const file of written.reverse()) {
      if (file.before === undefined) await rm(file.path, { force: true });
      else await writeFile(file.path, file.before, "utf8");
    }
    throw error;
  } finally {
    for (const file of files) await rm(`${file.path}.tmp`, { force: true });
  }
  console.log(`装備データを更新しました（${changes.length}素材）。出典表も保存しました。`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
