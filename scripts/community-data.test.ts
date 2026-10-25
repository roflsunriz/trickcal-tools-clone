import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import data from "../src/tools/community/data.json";
import {
  buildCommunityData,
  parseApostleEnglishNames,
  parseBoardCharacters,
  parseFoodPreferences,
} from "./community-data";

const boardFixture = readFileSync(fileURLToPath(new URL("./fixtures/community-board.html", import.meta.url)), "utf8");
const foodFixture = readFileSync(fileURLToPath(new URL("./fixtures/community-food.html", import.meta.url)), "utf8");
const apostleFixture = readFileSync(
  fileURLToPath(new URL("./fixtures/community-apostles.html", import.meta.url)),
  "utf8",
);
const assetManifest = JSON.parse(
  readFileSync(fileURLToPath(new URL("../public/assets/community/manifest.json", import.meta.url)), "utf8"),
) as { assets: Array<{ path: string; sha256: string; mimeType: string }> };

describe("community data sources", () => {
  it("parses every saved board and food entry", () => {
    const characters = parseBoardCharacters(boardFixture);
    const food = parseFoodPreferences(foodFixture);
    const apostles = parseApostleEnglishNames(apostleFixture);

    expect(Object.keys(characters)).toHaveLength(82);
    expect(Object.keys(food.preferences)).toHaveLength(76);
    expect(Object.keys(food.foods)).toHaveLength(60);
    expect(Object.keys(apostles.names).length).toBeGreaterThanOrEqual(82);
  });

  it("includes apostles added after the cloned source data", () => {
    const characters = parseBoardCharacters(boardFixture);
    const food = parseFoodPreferences(foodFixture);
    const { names: apostleEnglishNames } = parseApostleEnglishNames(apostleFixture);

    expect(characters["グウィン"].boardTypes.layer1).toEqual(["defense", "attack"]);
    expect(characters["コミー（水着）"].boardTypes.layer3).toEqual(["attack", "crit", "hp", "defense"]);
    expect(food.preferences["レーテー"].veryLike).toEqual(["逆鱗なでなでキャンディ"]);
    expect(food.preferences["コミー（水着）"].like).toContain("アニマル缶");
    expect(characters["グウィン"].image.path).toBe("assets/community/characters/グウィン.png");
    expect(food.foods["逆鱗なでなでキャンディ"].image.path).toMatch(/assets\/community\/foods\/food-\d+\.webp/);
    expect(apostleEnglishNames["グウィン"]).toBe("Guin");
    expect(apostleEnglishNames["コミー（水着）"]).toBe("Kommy (Swimsuit)");
  });

  it("keeps every downloaded image identical to its verified manifest", () => {
    expect(assetManifest.assets).toHaveLength(87);
    for (const asset of assetManifest.assets) {
      const bytes = readFileSync(fileURLToPath(new URL(`../public/${asset.path}`, import.meta.url)));
      expect(createHash("sha256").update(bytes).digest("hex"), asset.path).toBe(asset.sha256);
      expect(["image/png", "image/webp"]).toContain(asset.mimeType);
    }
  });

  it("recreates the checked-in app data from the saved sources", () => {
    const recreated = buildCommunityData(
      `${boardFixture}<script></script>`,
      `${foodFixture}\nLast-modified: ${data.sources.food.lastModified}\n`,
      apostleFixture,
    );
    expect(recreated).toEqual(data);
  });

  it("has complete English labels for apostles, attributes, and foods", () => {
    for (const character of Object.values(data.characters)) {
      expect(character.nameEn).not.toBe("");
      expect(character.personalityEn).not.toBe("");
      expect(character.raceEn).not.toBe("");
      expect(character.deployRowEn).not.toBe("");
    }
    for (const food of Object.values(data.foods)) expect(food.nameEn).not.toBe("");
    expect(data.characters["アメリア"]).toMatchObject({
      nameEn: "Amelia",
      personalityEn: "Composed",
      raceEn: "Elf",
      deployRowEn: "Rear",
    });
    expect(data.foods["ANSA宇宙食"].nameEn).toBe("ANSA Space Food");
    expect(data.foods["ロイヤルハニーガーリックサーモン"].nameEn).toBe("Royal Honey Garlic Salmon");
  });

  it("rejects missing board cells and truncated food tables", () => {
    expect(() => parseBoardCharacters(boardFixture.replace('data-index="8"', 'data-index-removed="8"'))).toThrow(
      "特殊マス数",
    );
    expect(() => parseFoodPreferences(foodFixture.replace(/<td[^>]*>[\s\S]*?<\/td>/, ""))).toThrow();
    expect(() => parseBoardCharacters(boardFixture.replace('data-trait="冷静"', 'data-trait="未知"'))).toThrow(
      "英語名がありません",
    );
    expect(() => parseFoodPreferences(foodFixture.replace('alt="ANSA宇宙食"', 'alt="未知料理"'))).toThrow(
      "料理の英語名がありません",
    );
    expect(() =>
      buildCommunityData(
        boardFixture,
        `${foodFixture}\nLast-modified: ${data.sources.food.lastModified}\n`,
        apostleFixture.replace(">Guin</td>", "></td>"),
      ),
    ).toThrow("使徒一覧に英語名がない使徒");
  });
});
