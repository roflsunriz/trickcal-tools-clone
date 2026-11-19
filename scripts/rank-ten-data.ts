import { createHash } from "node:crypto";
import { equipmentByRank, getRequiredMaterialCount } from "../src/tools/sweep/quickEquipment";
import { getMaterialAssetSlug } from "../src/tools/sweep/materialNames";
import type { WikiStageDrops } from "./wiki-sweep-data";

const sourceRoot = "https://wiki.cheeky.tsuncloud.com/global";
export const rankTenSourceUrls = [
  `${sourceRoot}/stages/133`,
  `${sourceRoot}/stages/134`,
  `${sourceRoot}/apostles/aya`,
  `${sourceRoot}/apostles/butter`,
];

// Game item IDs are independent of our persisted material IDs. Accessory 1 is
// the ring (煌めく), accessory 2 the headphones (華麗); source English differs.
const itemMaterials: Record<string, string> = {
  "150036": "material-085",
  "150037": "material-086",
  "150038": "material-087",
  "150039": "material-088",
  "150040": "material-089",
  "150041": "material-090",
  "150042": "material-091",
  "140015": "material-092",
  "140016": "material-093",
  "140017": "material-094",
  "140018": "material-095",
  "140019": "material-096",
  "140020": "material-097",
  "140021": "material-098",
};

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Rank 10: 不正な出典データです。");
  return value as Record<string, unknown>;
}

function list(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error("Rank 10: 出典の配列がありません。");
  return value;
}

function imageUrl(value: unknown) {
  if (typeof value !== "string") throw new Error("Rank 10: 画像URLがありません。");
  const url = new URL(value);
  if (
    url.origin !== "https://cheeky.tsuncloud.com" ||
    !url.pathname.startsWith("/deploy/com.bilibili.trickcal/") ||
    !url.pathname.endsWith(".png")
  ) {
    throw new Error("Rank 10: グローバル版のPNG画像ではありません。");
  }
  return value;
}

// Read the public, server-rendered chapter props without executing page scripts.
export function extractRankTenChapter(html: string, chapterId: number) {
  const chunks = [...html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)].map(([, chunk]): unknown =>
    JSON.parse(chunk),
  );
  if (chunks.some((chunk) => typeof chunk !== "string")) throw new Error("Rank 10: ページの取得形式が変わりました。");
  let found: Record<string, unknown> | undefined;
  function visit(value: unknown) {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") {
      const object = record(value);
      if (object.chapterId === chapterId && object.worldId === 1 && Array.isArray(object.stages)) {
        if (found) throw new Error("Rank 10: 出典の章が重複しています。");
        found = object;
      } else Object.values(object).forEach(visit);
    }
  }
  for (const line of chunks.join("").split("\n")) {
    const payload = line.slice(line.indexOf(":") + 1);
    if (payload.startsWith("[") || payload.startsWith("{")) visit(JSON.parse(payload));
  }
  if (!found) throw new Error(`Rank 10: chapter ${chapterId} の公開データがありません。`);
  const chapter = found as Record<string, unknown>;
  const items = record(chapter.items);
  const stages = list(chapter.stages)
    .map(record)
    .filter((stage) => stage.difficulty === 1)
    .map((stage) => ({
      stageNum: stage.stageNum,
      difficulty: stage.difficulty,
      staminaCost: stage.staminaCost,
      pools: list(stage.pools)
        .map(record)
        .filter((pool) => pool.kind === "clear")
        .map((pool) => ({
          kind: pool.kind,
          pickOne: pool.pickOne,
          drops: list(pool.drops)
            .map(record)
            .filter((drop) => /^1[45]\d{4}$/.test(String(drop.item))),
        })),
    }));
  const itemIds = new Set(
    stages.flatMap((stage) => stage.pools.flatMap((pool) => pool.drops.map((drop) => String(drop.item)))),
  );
  return { chapterId, worldId: 1, stages, items: Object.fromEntries([...itemIds].map((id) => [id, items[id]])) };
}

export function extractRankTenRecipes(html: string) {
  const matches = [...html.matchAll(/<details\b[^>]*>[\s\S]*?<\/details>/g)]
    .map(([details]) => details)
    .filter((details) => /<summary\b[^>]*>Rank\s*(?:<!-- -->)?10<\/summary>/.test(details));
  if (matches.length !== 1) throw new Error("Rank 10: 装備レシピを一意に取得できません。");
  return matches[0];
}

export function parseRankTenSource(source: unknown) {
  const snapshot = record(source);
  const drops: WikiStageDrops = new Map();
  const icons = new Map<string, string>();
  const chapters = list(snapshot.chapters);
  if (chapters.length !== 2) throw new Error("Rank 10: ワールド33・34が揃っていません。");
  for (const [index, value] of chapters.entries()) {
    const chapter = record(value);
    if (chapter.chapterId !== 133 + index || chapter.worldId !== 1) throw new Error("Rank 10: 別の章・サーバーです。");
    const items = record(chapter.items);
    const stages = list(chapter.stages);
    if (stages.length !== 10) throw new Error("Rank 10: 10ステージが揃っていません。");
    for (const value of stages) {
      const stage = record(value);
      const stageName = `${33 + index}-${stage.stageNum}`;
      if (
        !Number.isInteger(stage.stageNum) ||
        Number(stage.stageNum) < 1 ||
        Number(stage.stageNum) > 10 ||
        stage.difficulty !== 1 ||
        stage.staminaCost !== 10 ||
        drops.has(stageName)
      ) {
        throw new Error(`Rank 10: 不正・重複ステージ ${stageName} です。`);
      }
      const pools = list(stage.pools).map(record);
      if (pools.length !== 1 || pools[0].kind !== "clear" || pools[0].pickOne !== false)
        throw new Error(`${stageName}: 通常ドロップを確認できません。`);
      const materials = list(pools[0].drops)
        .map((value) => {
          const drop = record(value);
          const material = typeof drop.item === "string" ? itemMaterials[drop.item] : undefined;
          if (
            !material ||
            drop.min !== 1 ||
            drop.max !== 1 ||
            typeof drop.chance !== "number" ||
            drop.chance <= 0 ||
            drop.chance > 1
          )
            throw new Error(`${stageName}: 未知・不正な装備ドロップです。`);
          const item = record(items[String(drop.item)]);
          const icon = imageUrl(item.icon);
          if (icons.has(material) && icons.get(material) !== icon)
            throw new Error(`${material}: 画像が矛盾しています。`);
          icons.set(material, icon);
          return material;
        })
        .sort();
      if (
        materials.length !== 2 ||
        materials[0] === materials[1] ||
        !materials.some((material) => Object.values(equipmentByRank[10]).includes(material))
      )
        throw new Error(`${stageName}: Rank 10を含む2素材ではありません。`);
      drops.set(stageName, materials);
    }
  }
  const recipes = list(snapshot.recipes);
  if (recipes.length !== 2) throw new Error("Rank 10: 物理・魔法のレシピが揃っていません。");
  for (const [index, value] of recipes.entries()) {
    if (typeof value !== "string") throw new Error("Rank 10: レシピのHTMLがありません。");
    const ingredients = [
      ...value.matchAll(/<span\b[^>]* title="[^"]+"[^>]*><img\b[^>]*src="([^"]+)"[^>]*\/>(\d+)<\/span>/g),
    ];
    const equipment = equipmentByRank[10];
    const expected = Object.values(equipment).filter((id) => id !== equipment[index === 0 ? "physical" : "magic"]);
    const actual = ingredients.map(([, icon, quantity]) => {
      const material = [...icons].find(([, url]) => url === icon)?.[0];
      if (!material || Number(quantity) !== getRequiredMaterialCount(10, 10))
        throw new Error("Rank 10: 必要数・素材がレシピと一致しません。");
      return material;
    });
    if (actual.length !== 6 || new Set(actual).size !== 6 || expected.some((id) => !actual.includes(id)))
      throw new Error("Rank 10: 6部位のレシピが一致しません。");
  }
  return { drops, icons: new Map([...icons].filter(([id]) => Object.values(equipmentByRank[10]).includes(id))) };
}

export function mergeRankTenDrops(wiki: WikiStageDrops, supplement: WikiStageDrops) {
  const merged = new Map(wiki);
  for (const [stage, materials] of supplement) {
    const existing = merged.get(stage);
    if (existing && [...existing].sort().join() !== materials.join())
      throw new Error(`${stage}: wikiと補完元のドロップが矛盾しています。`);
    merged.set(stage, materials);
  }
  return merged;
}

export async function fetchRankTenSource(fetcher: typeof fetch = fetch) {
  async function get(url: string) {
    const response = await fetcher(url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Rank 10: 取得失敗 HTTP ${response.status} (${url})`);
    return response;
  }
  const pages = await Promise.all(rankTenSourceUrls.map(async (url) => (await get(url)).text()));
  const source = {
    sources: rankTenSourceUrls,
    chapters: pages.slice(0, 2).map((html, index) => extractRankTenChapter(html, 133 + index)),
    recipes: pages.slice(2).map(extractRankTenRecipes),
  };
  const { drops, icons } = parseRankTenSource(source);
  const assets = await Promise.all(
    [...icons].map(async ([material, url]) => {
      const response = await get(url);
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (
        !response.headers.get("content-type")?.startsWith("image/png") ||
        bytes.length < 8 ||
        ![137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)
      )
        throw new Error(`${material}: PNG画像の検証に失敗しました。`);
      return {
        material,
        url,
        filename: `${getMaterialAssetSlug(material)}.png`,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        bytes,
      };
    }),
  );
  return {
    source: { ...source, assets: assets.map(({ bytes: _bytes, ...asset }) => ({ ...asset, size: _bytes.length })) },
    drops,
    assets,
  };
}
