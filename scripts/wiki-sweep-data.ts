import { equipmentByRank } from "../src/tools/sweep/quickEquipment";
import { compareStages } from "../src/tools/sweep/sweep";
import type { MaterialId, SweepData } from "../src/tools/sweep/types";

export const wikiSourceUrl = "https://wikiwiki.jp/thetrickal/装備設計図";
const equipmentKinds = ["armor", "hat", "sparkling", "boots", "brilliant", "physical", "magic"] as const;
const equipmentLabels = ["鎧", "帽子", "煌めく装飾品", "ブーツ", "華麗な装飾品", "物理武器", "魔法武器"];

export type WikiStageDrops = Map<string, MaterialId[]>;

// The public page leaves the table empty until its accordion is expanded.
// Resolve the changing line number and hashes from that page, not a saved URL.
export function getWikiDropTableUrl(html: string) {
  const accordions = html.matchAll(
    /<div\b([^>]*\bclass="[^"]*\blazy-accordion-container\b[^"]*"[^>]*)>\s*<h2\b[^>]*>([\s\S]*?)<\/h2>/g,
  );
  for (const [, attributes, heading] of accordions) {
    if (heading.replace(/<[^>]*>/g, "").trim() !== "素材ドロップ場所一覧") continue;
    const url = new URL("/thetrickal/::partial_content/lazy_accordion", wikiSourceUrl);
    const names = { page: "page", line: "line", key: "key", part: "part", src: "source-hash", hash: "html-hash" };
    for (const [parameter, attribute] of Object.entries(names)) {
      const value = attributes.match(new RegExp(`\\bdata-${attribute}="([^"]+)"`))?.[1];
      if (!value) throw new Error(`wikiの素材表に data-${attribute} がありません。取得形式を確認してください。`);
      url.searchParams.set(parameter, value);
    }
    if (url.searchParams.get("page") !== "装備設計図" || url.searchParams.get("part") !== "main") {
      throw new Error("wikiの素材表が別ページを参照しています。取得元を確認してください。");
    }
    return url;
  }
  throw new Error("wikiの「素材ドロップ場所一覧」が見つかりません。ページの取得形式を確認してください。");
}

export function extractWikiDropTable(html: string) {
  const tables = [...html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/g)]
    .map(([table]) => table)
    .filter((table) => /<th>(?:ステージ|場所)<\/th><th>設計図<\/th><th>副産物<\/th>/.test(table));
  if (tables.length !== 1) throw new Error("wikiの素材表を一意に取得できません。表の見出しを確認してください。");
  return tables[0];
}

function parseEquipmentCode(code: string, stage: string, data: SweepData) {
  const match = code.match(/^(\d+)([1-7])_([^\d]+)(\d+)$/);
  if (!match) throw new Error(`${stage}: 未知の装備コード「${code}」です。wikiと装備の対応表を確認してください。`);
  const rank = Number(match[1]);
  const kind = Number(match[2]) - 1;
  const material = equipmentByRank[rank]?.[equipmentKinds[kind]];
  if (Number(match[4]) !== rank || equipmentLabels[kind] !== match[3] || !material || data[material]?.rank !== rank) {
    throw new Error(`${stage}: 装備コード「${code}」に対応するランク・種別・素材IDがありません。`);
  }
  return material;
}

export function parseWikiStageDrops(html: string, data: SweepData): WikiStageDrops {
  const table = extractWikiDropTable(html);
  const drops: WikiStageDrops = new Map();
  for (const [row] of table.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/g)) {
    if (row.includes("<th>")) continue;
    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(([, cell]) => cell.trim());
    const [stage, primary, secondary] = cells;
    if (cells.length !== 3 || !/^[1-9]\d*-(?:[1-9]|10)$/.test(stage) || !primary) {
      throw new Error(`wikiの素材表に不正な行があります: ${cells.join(" / ")}`);
    }
    // Only the early worlds have documented equipment drops without a side drop.
    if (Number(stage.split("-")[0]) >= 9 && !secondary) {
      throw new Error(`${stage}: 副産物が未記入です。wikiの素材表を確認してください。`);
    }
    const materials = [primary, secondary].filter(Boolean).map((code) => parseEquipmentCode(code, stage, data));
    materials.sort();
    if (new Set(materials).size !== materials.length) throw new Error(`${stage}: 同じ装備が重複しています。`);
    const previous = drops.get(stage);
    // The wiki contains 10-5 twice with the two drops reversed. Identical sets
    // are harmless; conflicting duplicates must never be silently combined.
    if (previous && previous.join() !== materials.join()) throw new Error(`${stage}: ドロップ情報が矛盾しています。`);
    drops.set(stage, materials);
  }

  const worlds = [...new Set([...drops.keys()].map((stage) => Number(stage.split("-")[0])))].sort((a, b) => a - b);
  if (!worlds.length) throw new Error("wikiの素材表が空です。");
  for (const [index, world] of worlds.entries()) {
    if (world !== index + 3) throw new Error("wikiの素材表でワールド3以降の連続した収録範囲に欠落があります。");
    for (let stage = 1; stage <= 10; stage++) {
      if (!drops.has(`${world}-${stage}`)) throw new Error(`${world}-${stage}: wikiの素材表にステージがありません。`);
    }
  }
  return drops;
}

export function mergeWikiStageDrops(data: SweepData, drops: WikiStageDrops): SweepData {
  const byMaterial = new Map<MaterialId, string[]>();
  for (const [stage, materials] of drops) {
    for (const material of materials) {
      const stages = byMaterial.get(material) ?? [];
      stages.push(stage);
      byMaterial.set(material, stages);
    }
  }
  return Object.fromEntries(
    Object.entries(data).map(([material, detail]) => {
      // Rank 1 and worlds 1–2 are not covered by this wiki table.
      if (detail.rank === 1) return [material, { ...detail, stages: [...detail.stages] }];
      const uncovered = detail.stages.filter((stage) => Number(stage.split("-")[0]) < 3);
      const missing = detail.stages.filter((stage) => Number(stage.split("-")[0]) >= 3 && !drops.has(stage));
      if (missing.length) throw new Error(`${material}: 既存ステージ ${missing.join(", ")} がwikiから欠落しています。`);
      const stages = byMaterial.get(material);
      if (!stages?.length) throw new Error(`${material}: wikiに対応する装備のドロップ情報がありません。`);
      return [material, { ...detail, stages: [...new Set([...uncovered, ...stages])].sort(compareStages) }];
    }),
  );
}

export function summarizeWikiChanges(before: SweepData, after: SweepData) {
  return Object.entries(after).flatMap(([material, detail]) => {
    const added = detail.stages.filter((stage) => !before[material].stages.includes(stage));
    const removed = before[material].stages.filter((stage) => !detail.stages.includes(stage));
    return added.length || removed.length ? [{ material, added, removed }] : [];
  });
}

export async function fetchWikiDropTable(fetcher: typeof fetch = fetch) {
  async function fetchHtml(url: string | URL) {
    const response = await fetcher(url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`wikiの取得に失敗しました: HTTP ${response.status} (${url})`);
    return response.text();
  }
  const page = await fetchHtml(wikiSourceUrl);
  const table = extractWikiDropTable(await fetchHtml(getWikiDropTableUrl(page)));
  const modified = page.match(/Last-modified:\s*(\d{4}-\d{2}-\d{2})\s*\([^)]+\)\s*(\d{2}:\d{2}:\d{2})/);
  if (!modified) throw new Error("wikiの更新日時を取得できません。取得元を確認してください。");
  const snapshot = [
    `<!-- Source: ${wikiSourceUrl} -->`,
    `<!-- Source last modified (JST): ${modified[1]} ${modified[2]} -->`,
    "<!-- prettier-ignore -->",
    table.replace(/(<\/?(?:table|thead|tbody)>|<\/tr>)/g, "$1\n").trim(),
    "",
  ].join("\n");
  return { table, snapshot };
}
