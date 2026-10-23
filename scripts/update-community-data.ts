import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";
import {
  boardSourceUrl,
  buildCommunityData,
  extractBoardSnapshot,
  extractFoodSnapshot,
  foodSourceUrl,
} from "./community-data";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const dataPath = resolve(repositoryRoot, "src/tools/community/data.json");
const boardSnapshotPath = resolve(repositoryRoot, "scripts/fixtures/community-board.html");
const foodSnapshotPath = resolve(repositoryRoot, "scripts/fixtures/community-food.html");
const assetManifestPath = resolve(repositoryRoot, "public/assets/community/manifest.json");

type GeneratedFile = {
  path: string;
  after: string | Buffer;
  text: boolean;
};

async function readOptional(path: string) {
  try {
    return await readFile(path);
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

function validateImage(buffer: Buffer, mimeType: string, sourceUrl: string) {
  const png = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const webp =
    buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (buffer.length < 100 || (mimeType === "image/png" ? !png : mimeType === "image/webp" ? !webp : true)) {
    throw new Error(`画像の形式が不正です: ${mimeType || "unknown"} (${sourceUrl})`);
  }
}

async function downloadAsset(path: string, sourceUrl: string) {
  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`画像の取得に失敗しました: HTTP ${response.status} (${sourceUrl})`);
  const mimeType = response.headers.get("content-type")?.split(";")[0] ?? "";
  const buffer = Buffer.from(await response.arrayBuffer());
  validateImage(buffer, mimeType, sourceUrl);
  return {
    path,
    sourceUrl,
    mimeType,
    bytes: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    buffer,
  };
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, task: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await task(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function sameFile(file: GeneratedFile, before: Buffer | undefined) {
  if (!before) return false;
  if (file.text) return before.toString("utf8").replace(/\r\n/g, "\n") === String(file.after);
  return Buffer.compare(before, file.after as Buffer) === 0;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--check")) throw new Error("使い方: bun scripts/update-community-data.ts [--check]");
  const [boardHtml, foodHtml] = await Promise.all([fetchText(boardSourceUrl), fetchText(foodSourceUrl)]);
  const data = buildCommunityData(boardHtml, foodHtml);
  const assetSources = new Map<string, string>();
  for (const character of Object.values(data.characters))
    assetSources.set(character.image.path, character.image.sourceUrl);
  for (const food of Object.values(data.foods)) {
    const previous = assetSources.get(food.image.path);
    if (previous && previous !== food.image.sourceUrl) {
      throw new Error(`${food.image.path}: 同じ画像先に異なる情報源があります。`);
    }
    assetSources.set(food.image.path, food.image.sourceUrl);
  }
  const assets = await mapWithConcurrency([...assetSources], 8, ([path, sourceUrl]) => downloadAsset(path, sourceUrl));
  assets.sort((a, b) => a.path.localeCompare(b.path, "ja"));

  const config = await resolveConfig(dataPath);
  const formatted = await format(JSON.stringify(data, null, 2), { ...config, parser: "json" });
  const manifest = await format(
    JSON.stringify(
      {
        schemaVersion: 1,
        assets: assets.map((asset) => ({
          path: asset.path,
          sourceUrl: asset.sourceUrl,
          mimeType: asset.mimeType,
          bytes: asset.bytes,
          sha256: asset.sha256,
        })),
      },
      null,
      2,
    ),
    { ...config, parser: "json" },
  );
  const files: GeneratedFile[] = [
    { path: dataPath, after: formatted, text: true },
    { path: boardSnapshotPath, after: `${extractBoardSnapshot(boardHtml)}\n`, text: true },
    { path: foodSnapshotPath, after: `${extractFoodSnapshot(foodHtml)}\n`, text: true },
    { path: assetManifestPath, after: manifest, text: true },
    ...assets.map((asset) => ({
      path: resolve(repositoryRoot, "public", asset.path),
      after: asset.buffer,
      text: false,
    })),
  ];
  const withBefore = await Promise.all(files.map(async (file) => ({ ...file, before: await readOptional(file.path) })));
  const changed = withBefore.filter((file) => !sameFile(file, file.before));

  console.log(`クレヨン情報: ${Object.keys(data.characters).length}使徒 (${boardSourceUrl})`);
  console.log(
    `食べ物情報: ${Object.keys(data.foodPreferences).length}使徒・${Object.keys(data.foods).length}料理 (${foodSourceUrl})`,
  );
  console.log(`画像: ${assets.length}ファイルを検証しました。`);
  if (!changed.length) {
    console.log("クレヨン・食べ物データ、画像、保存済みの出典表は一致しています。変更はありません。");
    return;
  }
  if (args.includes("--check")) {
    console.log(`更新差分があります（${changed.length}ファイル）。反映するには更新コマンドを実行してください。`);
    process.exitCode = 1;
    return;
  }

  const written: typeof withBefore = [];
  try {
    for (const file of withBefore) {
      await mkdir(dirname(file.path), { recursive: true });
      await writeFile(`${file.path}.tmp`, file.after);
    }
    for (const file of withBefore) {
      await rename(`${file.path}.tmp`, file.path);
      written.push(file);
    }
  } catch (error) {
    for (const file of written.reverse()) {
      if (file.before === undefined) await rm(file.path, { force: true });
      else await writeFile(file.path, file.before);
    }
    throw error;
  } finally {
    for (const file of withBefore) await rm(`${file.path}.tmp`, { force: true });
  }
  console.log(`クレヨン・食べ物データと画像を更新しました（${changed.length}ファイル）。`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
