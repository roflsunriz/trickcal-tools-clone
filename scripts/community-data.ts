import { createHash } from "node:crypto";
import type {
  BoardCellType,
  BoardLayer,
  CommunityCharacter,
  CommunityData,
  CommunityFoodImage,
  FoodPreference,
  FoodRarity,
} from "../src/tools/community/types";

export const boardSourceUrl = "https://trickcal-strategy.pages.dev/board/manager.html";
export const foodSourceUrl = "https://wikiwiki.jp/thetrickal/宴会場";

const boardTypeNames: Record<string, BoardCellType> = {
  攻撃: "attack",
  会心: "crit",
  HP: "hp",
  抵抗: "critResist",
  防御: "defense",
};

function decodeHtml(value: string) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function normalizeCharacterName(value: string) {
  return decodeHtml(value).trim().replaceAll("(", "（").replaceAll(")", "）");
}

function attribute(html: string, name: string) {
  return decodeHtml(html.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? "");
}

function stripTags(html: string) {
  return decodeHtml(html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")).trim();
}

function boardImageSource(name: string) {
  return new URL(`../assets/icons/${encodeURIComponent(name)}.png`, boardSourceUrl).href;
}

function characterCardSections(html: string) {
  const starts = [...html.matchAll(/<div class="char-card owned-toggle[^>]*>/g)];
  return starts.map((match, index) => {
    const start = match.index;
    const followingScript = start === undefined ? -1 : html.indexOf("<script", start);
    const end = starts[index + 1]?.index ?? (followingScript >= 0 ? followingScript : html.length);
    if (start === undefined) throw new Error("補完元のクレヨン情報を区切れません。");
    return html.slice(start, end);
  });
}

export function parseBoardCharacters(html: string): Record<string, CommunityCharacter> {
  const characters: Record<string, CommunityCharacter> = {};
  for (const section of characterCardSections(html)) {
    const openingTag = section.match(/^<div\b[^>]*>/)?.[0] ?? "";
    const name = normalizeCharacterName(attribute(openingTag, "data-name"));
    if (!name) throw new Error("補完元のクレヨン情報に使徒名がありません。");
    if (characters[name]) throw new Error(`クレヨン情報で使徒「${name}」が重複しています。`);

    const layers: Record<BoardLayer, BoardCellType[]> = { layer1: [], layer2: [], layer3: [] };
    const tiles = [
      ...section.matchAll(
        /<label\b[^>]*\bclass="[^"]*\btile-btn\b[^"]*"[^>]*\bdata-board="([123])"[^>]*\bdata-type="([^"]+)"[^>]*>[\s\S]*?<input\b[^>]*\bclass="[^"]*\bspecial-tile-cb\b[^"]*"[^>]*\bdata-name="([^"]+)"[^>]*\bdata-index="(\d+)"[^>]*>/g,
      ),
    ];
    for (const [, layerNumber, rawType, rawName] of tiles) {
      if (normalizeCharacterName(rawName) !== name) {
        throw new Error(`${name}: 別の使徒のクレヨン情報が混在しています。`);
      }
      const type = boardTypeNames[decodeHtml(rawType)];
      if (!type) throw new Error(`${name}: 未知のボード種類「${decodeHtml(rawType)}」です。`);
      layers[`layer${layerNumber}` as BoardLayer].push(type);
    }
    if (layers.layer1.length !== 2 || layers.layer2.length !== 3 || layers.layer3.length !== 4) {
      throw new Error(`${name}: ボードの特殊マス数が2・3・4になっていません。`);
    }

    characters[name] = {
      name,
      personality: attribute(openingTag, "data-trait"),
      race: attribute(openingTag, "data-race"),
      deployRow: attribute(openingTag, "data-placement"),
      image: {
        path: `assets/community/characters/${name}.png`,
        sourceUrl: boardImageSource(name),
      },
      boardTypes: layers,
    };
  }
  if (Object.keys(characters).length < 65) {
    throw new Error(`クレヨン情報が${Object.keys(characters).length}人分しかありません。取得元を確認してください。`);
  }
  return characters;
}

function findFoodPreferenceTable(html: string) {
  const tables = [...html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/g)]
    .map(([table]) => table)
    .filter((table) => {
      const firstRow = table.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/)?.[0] ?? "";
      const heading = stripTags(firstRow);
      return heading.includes("使徒") && heading.includes("とても 好き") && heading.includes("嫌い");
    });
  if (tables.length !== 1) throw new Error("wikiの好物早見表を一意に取得できません。");
  return tables[0];
}

function foodFromCell(cell: string): { name: string; image: CommunityFoodImage } | undefined {
  const alt = cell.match(/\balt="([^"]+)"/)?.[1];
  if (!alt) return undefined;
  const name = decodeHtml(alt)
    .replace(/_高学年スキル$/, "")
    .trim();
  const sourceUrl = decodeHtml(cell.match(/\bsrc="([^"]+)"/)?.[1] ?? "");
  const sheet = sourceUrl.match(/\/48:(\d+)/)?.[1];
  const left = Number(cell.match(/\bleft:\s*(-?\d+)px/)?.[1]);
  const top = Number(cell.match(/\btop:\s*(-?\d+)px/)?.[1]);
  if (!name || !sourceUrl || !sheet || !Number.isFinite(left) || !Number.isFinite(top)) {
    throw new Error(`料理画像の名前・スプライト・座標を取得できません: ${name}`);
  }
  return {
    name,
    image: {
      path: `assets/community/foods/food-${sheet}.webp`,
      sourceUrl,
      left,
      top,
    },
  };
}

function rarityFromCell(cell: string): FoodRarity {
  const color = cell.match(/background-color:\s*(#[\dA-Fa-f]{6})/)?.[1]?.toUpperCase();
  if (color === "#F6C4FF") return "legendary";
  if (color === "#ACE7F3") return "rare";
  if (color === "#C3F394") return "uncommon";
  return "common";
}

export function parseFoodPreferences(html: string) {
  const table = findFoodPreferenceTable(html);
  const preferences: Record<string, FoodPreference> = {};
  const foods: Record<string, { rarity: FoodRarity; image: CommunityFoodImage }> = {};
  const rows = [...table.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/g)].slice(1);

  for (const [row] of rows) {
    const cells = [...row.matchAll(/<td\b[^>]*>[\s\S]*?<\/td>/g)].map(([cell]) => cell);
    if (cells.length !== 12) throw new Error(`wikiの好物早見表に${cells.length}列の行があります。`);
    const title = cells[0].match(/<a\b[^>]*\btitle="([^"]+)"/)?.[1];
    const name = normalizeCharacterName(title ?? stripTags(cells[0]));
    if (!name || preferences[name]) throw new Error(`wikiの好物早見表で使徒名が空か重複しています: ${name}`);

    const readFoods = (indexes: number[]) =>
      indexes.flatMap((index) => {
        const detail = foodFromCell(cells[index]);
        if (!detail) return [];
        const { name: food, image } = detail;
        const rarity = rarityFromCell(cells[index]);
        if (
          foods[food] &&
          (foods[food].rarity !== rarity ||
            foods[food].image.path !== image.path ||
            foods[food].image.left !== image.left ||
            foods[food].image.top !== image.top)
        ) {
          throw new Error(`${food}: 料理のレアリティまたは画像位置が行によって異なります。`);
        }
        foods[food] = { rarity, image };
        return [food];
      });

    preferences[name] = {
      veryLike: readFoods([1]),
      like: readFoods([3, 4, 5, 6]),
      dislike: readFoods([8, 9, 10, 11]),
    };
  }
  if (Object.keys(preferences).length < 58 || Object.keys(foods).length < 30) {
    throw new Error("wikiの好物早見表の使徒数または料理数が少なすぎます。");
  }
  return { preferences, foods, table };
}

export function extractBoardSnapshot(html: string) {
  return characterCardSections(html)
    .map((section) => {
      const tag = (section.match(/^<div\b[^>]*>/)?.[0] ?? "").replace(/\s+/g, " ").replace(/\s+>/g, ">").trim();
      const tiles = [...section.matchAll(/<label\b[^>]*\bclass="[^"]*\btile-btn\b[^"]*"[^>]*>[\s\S]*?<\/label>/g)].map(
        ([tile]) => tile.replace(/\s+/g, " ").trim(),
      );
      return `${tag}\n${tiles.join("\n")}\n</div>`;
    })
    .join("\n");
}

export function extractFoodSnapshot(html: string) {
  return findFoodPreferenceTable(html).replace(/>\s+</g, "><").trim();
}

export function sourceHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function buildCommunityData(boardHtml: string, foodHtml: string): CommunityData {
  const boardSnapshot = extractBoardSnapshot(boardHtml);
  const foodSnapshot = extractFoodSnapshot(foodHtml);
  const characters = parseBoardCharacters(boardSnapshot);
  const { preferences, foods } = parseFoodPreferences(foodSnapshot);
  const unknownFoodCharacters = Object.keys(preferences).filter((name) => !characters[name]);
  if (unknownFoodCharacters.length) {
    throw new Error(`クレヨン情報にいない使徒が好物表にあります: ${unknownFoodCharacters.join(", ")}`);
  }
  const modified = foodHtml.match(/Last-modified:\s*([^<\r\n]+)/)?.[1]?.trim();
  if (!modified) throw new Error("wikiの更新日時を取得できません。");

  return {
    schemaVersion: 1,
    sources: {
      board: { url: boardSourceUrl, sha256: sourceHash(boardSnapshot) },
      food: { url: foodSourceUrl, sha256: sourceHash(foodSnapshot), lastModified: modified },
    },
    boardConfig: {
      layer1: { bonusPerCell: 3, crayonsPerCell: 2 },
      layer2: { bonusPerCell: 4, crayonsPerCell: 4 },
      layer3: { bonusPerCell: 5, crayonsPerCell: 6 },
    },
    characters,
    foods,
    foodPreferences: preferences,
  };
}
