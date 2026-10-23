import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";
import {
  boardSourceUrl,
  buildCommunityData,
  extractBoardSnapshot,
  extractFoodSnapshot,
  foodSourceUrl,
} from "./community-data";

const dataPath = fileURLToPath(new URL("../src/tools/community/data.json", import.meta.url));
const boardSnapshotPath = fileURLToPath(new URL("./fixtures/community-board.html", import.meta.url));
const foodSnapshotPath = fileURLToPath(new URL("./fixtures/community-food.html", import.meta.url));

async function readOptional(path: string) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return undefined;
    throw error;
  }
}

async function fetchText(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`情報源の取得に失敗しました: HTTP ${response.status} (${url})`);
  return response.text();
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--check")) throw new Error("使い方: bun scripts/update-community-data.ts [--check]");
  const [boardHtml, foodHtml] = await Promise.all([fetchText(boardSourceUrl), fetchText(foodSourceUrl)]);
  const data = buildCommunityData(boardHtml, foodHtml);
  const config = await resolveConfig(dataPath);
  const formatted = await format(JSON.stringify(data, null, 2), { ...config, parser: "json" });
  const boardSnapshot = `${extractBoardSnapshot(boardHtml)}\n`;
  const foodSnapshot = `${extractFoodSnapshot(foodHtml)}\n`;
  const files = [
    { path: dataPath, after: formatted },
    { path: boardSnapshotPath, after: boardSnapshot },
    { path: foodSnapshotPath, after: foodSnapshot },
  ];
  const withBefore = await Promise.all(files.map(async (file) => ({ ...file, before: await readOptional(file.path) })));
  const changed = withBefore.filter((file) => file.before?.replace(/\r\n/g, "\n") !== file.after);

  console.log(`クレヨン情報: ${Object.keys(data.characters).length}使徒 (${boardSourceUrl})`);
  console.log(
    `食べ物情報: ${Object.keys(data.foodPreferences).length}使徒・${Object.keys(data.foods).length}料理 (${foodSourceUrl})`,
  );
  if (!changed.length) {
    console.log("クレヨン・食べ物データと保存済みの出典表は一致しています。変更はありません。");
    return;
  }
  if (args.includes("--check")) {
    console.log(`更新差分があります: ${changed.map((file) => file.path).join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const written: typeof withBefore = [];
  try {
    for (const file of withBefore) {
      await mkdir(dirname(file.path), { recursive: true });
      await writeFile(`${file.path}.tmp`, file.after, "utf8");
    }
    for (const file of withBefore) {
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
    for (const file of withBefore) await rm(`${file.path}.tmp`, { force: true });
  }
  console.log(`クレヨン・食べ物データを更新しました（${changed.length}ファイル）。`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
