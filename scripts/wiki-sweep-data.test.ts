import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import data from "../src/tools/sweep/data.json";
import {
  fetchWikiDropTable,
  getWikiDropTableUrl,
  mergeWikiStageDrops,
  parseWikiStageDrops,
  summarizeWikiChanges,
} from "./wiki-sweep-data";

const snapshot = readFileSync(new URL("./fixtures/wiki-equipment-drops.html", import.meta.url), "utf8");
// Captured from the public page on 2026-09-11; only the relevant markup is kept.
const page = `Last-modified: 2026-09-11 (金) 01:30:16
<div class="lazy-accordion-container" data-page="装備設計図" data-line="7" data-key="装備設計図" data-part="main" data-source-hash="5b7d4d5ca9460ed6a6a927e53e8e74d5" data-html-hash="21335fa862ff32cf5319ad5af2f14e9d">
    <h2 class="accordion-header">
        <i class="fa-solid fa-plus-square hidden-on-open"></i>
        <i class="fa-solid fa-minus-square visible-on-open"></i>
        素材ドロップ場所一覧
    </h2>
    <div class="accordion-content"></div>
</div>`;

describe("wiki equipment data import", () => {
  it("resolves the lazy table using the current page attributes", () => {
    const url = getWikiDropTableUrl(page.replace('data-line="7"', 'data-line="12"'));
    expect(url.origin).toBe("https://wikiwiki.jp");
    expect(url.pathname).toBe("/thetrickal/::partial_content/lazy_accordion");
    expect(url.searchParams.get("page")).toBe("装備設計図");
    expect(url.searchParams.get("line")).toBe("12");
    expect(url.searchParams.get("src")).toBe("5b7d4d5ca9460ed6a6a927e53e8e74d5");
    expect(url.searchParams.get("hash")).toBe("21335fa862ff32cf5319ad5af2f14e9d");
  });

  it("rejects missing table attributes and unrelated pages", () => {
    expect(() => getWikiDropTableUrl("<html>unavailable</html>")).toThrow("見つかりません");
    expect(() => getWikiDropTableUrl(page.replace(/ data-source-hash="[^"]+"/, ""))).toThrow("data-source-hash");
    expect(() => getWikiDropTableUrl(page.replace('data-page="装備設計図"', 'data-page="別ページ"'))).toThrow(
      "別ページ",
    );
  });

  it("imports all 300 stages, including both rank 9 drops and empty early side drops", () => {
    const drops = parseWikiStageDrops(snapshot, data);
    expect(drops.size).toBe(300);
    expect(drops.get("31-1")).toEqual(["material-085", "material-087"]);
    expect(drops.get("32-10")).toEqual(["material-086", "material-089"]);
    expect(drops.get("8-10")).toEqual(["material-047"]);
    expect(drops.get("10-5")).toEqual(["material-048", "material-050"]);
  });

  it("rejects truncated responses, missing worlds, malformed stages and unknown equipment", () => {
    expect(() => parseWikiStageDrops(snapshot.replace(/<tr><td>32-10<\/td>.*?<\/tr>/, ""), data)).toThrow("32-10");
    expect(() => parseWikiStageDrops(snapshot.replace(/<tr><td>31-\d+<\/td>.*?<\/tr>/g, ""), data)).toThrow("欠落");
    expect(() => parseWikiStageDrops(snapshot.replace("32-10</td>", "32-11</td>"), data)).toThrow("不正な行");
    expect(() => parseWikiStageDrops(snapshot.replace("94_ブーツ9", "104_ブーツ10"), data)).toThrow("対応する");
    expect(() => parseWikiStageDrops(snapshot.replace("94_ブーツ9", "94_帽子9"), data)).toThrow("対応する");
    expect(() => parseWikiStageDrops(snapshot.replace("94_ブーツ9", "94_ブーツ8"), data)).toThrow("対応する");
    expect(() => parseWikiStageDrops(snapshot.replace("94_ブーツ9", "調査中"), data)).toThrow("未知の装備コード");
    expect(() => parseWikiStageDrops(snapshot.replace("<td>97_魔法武器9</td>", "<td></td>"), data)).toThrow(
      "副産物が未記入",
    );
    expect(() => parseWikiStageDrops("<html>maintenance</html>", data)).toThrow("素材表");
  });

  it("rejects conflicting duplicate rows without merging their drops", () => {
    const conflict = snapshot.replace(
      "</tbody>",
      "<tr><td>32-10</td><td>94_ブーツ9</td><td>96_物理武器9</td></tr></tbody>",
    );
    expect(() => parseWikiStageDrops(conflict, data)).toThrow("32-10: ドロップ情報が矛盾");
  });

  it("updates covered stages while preserving rank 1 and worlds 1–2 without mutating the input", () => {
    const before = structuredClone(data);
    before["material-085"].stages = ["29-1", "29-10", "30-5"];
    before["material-076"].stages.push("21-1");
    before["material-077"].stages = before["material-077"].stages.filter((stage) => stage !== "21-1");
    const preserved = structuredClone(before);
    const updated = mergeWikiStageDrops(before, parseWikiStageDrops(snapshot, before));
    expect(before).toEqual(preserved);
    for (const [material, detail] of Object.entries(before)) {
      if (detail.rank === 1) expect(updated[material]).toEqual(detail);
      expect(updated[material].stages.filter((stage) => /^[12]-/.test(stage))).toEqual(
        detail.stages.filter((stage) => /^[12]-/.test(stage)),
      );
    }
    expect(updated["material-085"].stages).toContain("32-9");
    expect(updated["material-076"].stages).not.toContain("21-1");
    expect(updated["material-077"].stages).toContain("21-1");
    expect(Object.keys(updated)).toEqual(Object.keys(before));
    expect(summarizeWikiChanges(before, updated).find((change) => change.material === "material-085")?.added).toEqual([
      "31-1",
      "31-4",
      "31-10",
      "32-3",
      "32-6",
      "32-9",
    ]);
    expect(summarizeWikiChanges(updated, mergeWikiStageDrops(updated, parseWikiStageDrops(snapshot, updated)))).toEqual(
      [],
    );
  });

  it("does not overwrite a newer database with an older wiki snapshot", () => {
    const oldSnapshot = snapshot.replace(/<tr><td>3[12]-\d+<\/td>.*?<\/tr>/g, "");
    expect(() => mergeWikiStageDrops(data, parseWikiStageDrops(oldSnapshot, data))).toThrow("既存ステージ");
  });

  it("reproduces the checked-in database from the saved source table", () => {
    expect(mergeWikiStageDrops(data, parseWikiStageDrops(snapshot, data))).toEqual(data);
  });

  it("fetches the lazy table and records its source date without live network requests", async () => {
    const requests: string[] = [];
    const fetcher: typeof fetch = async (url, options) => {
      expect(options?.signal).toBeDefined();
      requests.push(String(url));
      return new Response(requests.length === 1 ? page : snapshot);
    };
    const result = await fetchWikiDropTable(fetcher);
    expect(requests).toHaveLength(2);
    expect(new URL(requests[1]).searchParams.get("line")).toBe("7");
    expect(result.snapshot).toContain("Source last modified (JST): 2026-09-11 01:30:16");
    expect(parseWikiStageDrops(result.snapshot, data).size).toBe(300);
  });

  it("reports HTTP and network failures instead of accepting empty data", async () => {
    await expect(fetchWikiDropTable(async () => new Response("unavailable", { status: 503 }))).rejects.toThrow(
      "HTTP 503",
    );
    await expect(
      fetchWikiDropTable(async () => {
        throw new Error("connection failed");
      }),
    ).rejects.toThrow("connection failed");
  });
});
