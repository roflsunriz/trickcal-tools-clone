import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import source from "./fixtures/rank-ten-source.json";
import data from "../src/tools/sweep/data.json";
import { buildStageData, createSweepPlan, getMissingMaterials } from "../src/tools/sweep/sweep";
import { buildEquipmentSet } from "../src/tools/sweep/quickEquipment";
import { getMaterialName } from "../src/tools/sweep/materialNames";
import {
  extractRankTenChapter,
  extractRankTenRecipes,
  fetchRankTenSource,
  mergeRankTenDrops,
  parseRankTenSource,
  rankTenSourceUrls,
} from "./rank-ten-data";

function chapterPage(chapter: unknown) {
  const payload = `1:${JSON.stringify(["$", "Chapter", null, chapter])}\n`;
  return `<script>self.__next_f.push([1,${JSON.stringify(payload)}])</script>`;
}

describe("Rank 10 equipment source", () => {
  it("imports every normal World 33/34 pair and preserves the two accessory kinds", () => {
    const { drops, icons } = parseRankTenSource(source);
    const expected = [
      ["085", "097"],
      ["090", "098"],
      ["091", "093"],
      ["086", "094"],
      ["087", "095"],
      ["088", "096"],
      ["089", "092"],
      ["090", "097"],
      ["085", "098"],
      ["091", "093"],
      ["086", "094"],
      ["087", "095"],
      ["088", "096"],
      ["089", "097"],
      ["090", "092"],
      ["085", "098"],
      ["091", "093"],
      ["086", "094"],
      ["090", "095"],
      ["088", "096"],
    ];
    const stageData = buildStageData(data);
    expect(drops.size).toBe(20);
    expected.forEach((pair, index) => {
      const stage = `${33 + Math.floor(index / 10)}-${(index % 10) + 1}`;
      const materials = pair.map((suffix) => `material-${suffix}`);
      expect(drops.get(stage)).toEqual(materials);
      expect(stageData[stage]).toEqual(materials);
    });
    expect(icons.size).toBe(7);
    expect(icons.get("material-097")).toContain("Accessory1001.png");
    expect(icons.get("material-098")).toContain("Accessory1002.png");
  });

  it("extracts public chapter props and both complete six-slot recipes", () => {
    source.chapters.forEach((chapter) =>
      expect(extractRankTenChapter(chapterPage(chapter), chapter.chapterId)).toEqual(chapter),
    );
    source.recipes.forEach((recipe) => expect(extractRankTenRecipes(`<html>${recipe}</html>`)).toBe(recipe));
    expect(() => extractRankTenChapter("<html>unavailable</html>", 133)).toThrow("公開データ");
    expect(() => extractRankTenRecipes("<html>unavailable</html>")).toThrow("レシピ");
    expect(() => extractRankTenRecipes(source.recipes[0] + source.recipes[1])).toThrow("一意");
  });

  it("rejects incomplete stages, another server, unknown items, and changed recipes", () => {
    const missing = structuredClone(source);
    missing.chapters[0].stages.pop();
    expect(() => parseRankTenSource(missing)).toThrow("10ステージ");
    const duplicate = structuredClone(source);
    duplicate.chapters[0].stages[1].stageNum = 1;
    expect(() => parseRankTenSource(duplicate)).toThrow("重複");
    const wrongServer = structuredClone(source);
    wrongServer.chapters[0].worldId = 2;
    expect(() => parseRankTenSource(wrongServer)).toThrow("別の章");
    const unknown = structuredClone(source);
    unknown.chapters[0].stages[0].pools[0].drops[0].item = "999999";
    expect(() => parseRankTenSource(unknown)).toThrow("未知");
    const firstClear = structuredClone(source);
    firstClear.chapters[0].stages[0].pools[0].kind = "firstClear";
    expect(() => parseRankTenSource(firstClear)).toThrow("通常ドロップ");
    expect(() =>
      parseRankTenSource({
        ...source,
        recipes: source.recipes.map((html) => html.replace(/64<\/span>/g, "63</span>")),
      }),
    ).toThrow("必要数");
  });

  it("rejects conflicting overlap with the original wiki without changing either map", () => {
    const { drops } = parseRankTenSource(source);
    const conflict = new Map([["33-1", ["material-085", "material-098"]]]);
    expect(() => mergeRankTenDrops(conflict, drops)).toThrow("矛盾");
    expect(conflict.get("33-1")).toEqual(["material-085", "material-098"]);
    expect(mergeRankTenDrops(drops, drops)).toEqual(drops);
  });

  it("provides both weapon sets, localized names, and verified local PNG assets", () => {
    const stageData = buildStageData(data);
    for (const weapon of ["physical", "magic"] as const) {
      const selected = buildEquipmentSet(10, weapon, data);
      const plan = createSweepPlan(selected, stageData);
      expect(plan).toHaveLength(6);
      expect(getMissingMaterials(selected, plan, stageData)).toEqual([]);
      expect(plan.every((stage) => /^3[34]-/.test(stage))).toBe(true);
    }
    for (const asset of source.assets) {
      const bytes = readFileSync(new URL(`../public/assets/gears/rank-10/${asset.filename}`, import.meta.url));
      expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(bytes.length).toBe(asset.size);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sha256);
      expect(getMaterialName(asset.material, "ja")).toContain("10段階");
      expect(getMaterialName(asset.material, "en")).toContain("Tier 10");
    }
  });

  it("fetches source pages and validates every downloaded image with a fake network", async () => {
    const pages = [...source.chapters.map(chapterPage), ...source.recipes];
    const fetcher: typeof fetch = async (url) => {
      const index = rankTenSourceUrls.indexOf(String(url));
      if (index >= 0) return new Response(pages[index]);
      const asset = source.assets.find((asset) => asset.url === String(url));
      if (!asset) throw new Error("Unexpected URL");
      return new Response(readFileSync(new URL(`../public/assets/gears/rank-10/${asset.filename}`, import.meta.url)), {
        headers: { "content-type": "image/png" },
      });
    };
    expect((await fetchRankTenSource(fetcher)).source).toEqual(source);
    await expect(fetchRankTenSource(async () => new Response("unavailable", { status: 503 }))).rejects.toThrow(
      "HTTP 503",
    );
    await expect(
      fetchRankTenSource(async (url) =>
        rankTenSourceUrls.includes(String(url))
          ? fetcher(url)
          : new Response("not a PNG", { headers: { "content-type": "image/png" } }),
      ),
    ).rejects.toThrow("PNG画像");
  });
});
