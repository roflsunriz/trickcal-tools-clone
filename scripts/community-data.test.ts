import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import data from "../src/tools/community/data.json";
import { buildCommunityData, parseBoardCharacters, parseFoodPreferences } from "./community-data";

const boardFixture = readFileSync(fileURLToPath(new URL("./fixtures/community-board.html", import.meta.url)), "utf8");
const foodFixture = readFileSync(fileURLToPath(new URL("./fixtures/community-food.html", import.meta.url)), "utf8");
const assetManifest = JSON.parse(
  readFileSync(fileURLToPath(new URL("../public/assets/community/manifest.json", import.meta.url)), "utf8"),
) as { assets: Array<{ path: string; sha256: string; mimeType: string }> };

describe("community data sources", () => {
  it("parses every saved board and food entry", () => {
    const characters = parseBoardCharacters(boardFixture);
    const food = parseFoodPreferences(foodFixture);

    expect(Object.keys(characters)).toHaveLength(82);
    expect(Object.keys(food.preferences)).toHaveLength(76);
    expect(Object.keys(food.foods)).toHaveLength(60);
  });

  it("includes apostles added after the cloned source data", () => {
    const characters = parseBoardCharacters(boardFixture);
    const food = parseFoodPreferences(foodFixture);

    expect(characters["グウィン"].boardTypes.layer1).toEqual(["defense", "attack"]);
    expect(characters["コミー（水着）"].boardTypes.layer3).toEqual(["attack", "crit", "hp", "defense"]);
    expect(food.preferences["レーテー"].veryLike).toEqual(["逆鱗なでなでキャンディ"]);
    expect(food.preferences["コミー（水着）"].like).toContain("アニマル缶");
    expect(characters["グウィン"].image.path).toBe("assets/community/characters/グウィン.png");
    expect(food.foods["逆鱗なでなでキャンディ"].image.path).toMatch(/assets\/community\/foods\/food-\d+\.webp/);
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
    );
    expect(recreated).toEqual(data);
  });

  it("rejects missing board cells and truncated food tables", () => {
    expect(() => parseBoardCharacters(boardFixture.replace('data-index="8"', 'data-index-removed="8"'))).toThrow(
      "特殊マス数",
    );
    expect(() => parseFoodPreferences(foodFixture.replace(/<td[^>]*>[\s\S]*?<\/td>/, ""))).toThrow();
  });
});
