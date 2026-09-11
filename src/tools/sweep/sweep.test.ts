import { describe, expect, it } from "vitest";
import data from "./data.json";
import { buildStageData, createSweepPlan, getAlternativeStages, getMissingMaterials } from "./sweep";
import type { SweepData } from "./types";

describe("sweep planner", () => {
  const sweepData = data as SweepData;
  const stageData = buildStageData(sweepData);

  it("groups materials by stage", () => {
    expect(stageData["1-1"]).toContain("material-001");
    expect(stageData["1-1"]).toContain("material-002");
  });

  it("chooses a stage that covers selected materials", () => {
    const selected = ["material-001", "material-002"];
    expect(createSweepPlan(selected, stageData)).toEqual(["1-1"]);
  });

  it("reports materials that cannot be mapped to a stage", () => {
    const selected = ["missing-material"];
    const plan = createSweepPlan(selected, stageData);
    expect(getMissingMaterials(selected, plan, stageData)).toEqual(["missing-material"]);
  });

  it("includes high-rank side-product stage data from the wiki", () => {
    expect(stageData["28-4"]).toContain("material-078");
    expect(stageData["28-4"]).toContain("material-080");
    expect(stageData["30-8"]).toContain("material-079");
    expect(stageData["30-8"]).toContain("material-087");
  });

  it("includes the complete world 31 and 32 drop pairs from the wiki", () => {
    const expected: Record<string, string[]> = {
      "31-1": ["material-085", "material-087"],
      "31-2": ["material-086", "material-088"],
      "31-3": ["material-089", "material-091"],
      "31-4": ["material-085", "material-090"],
      "31-5": ["material-086", "material-087"],
      "31-6": ["material-088", "material-091"],
      "31-7": ["material-089", "material-090"],
      "31-8": ["material-086", "material-087"],
      "31-9": ["material-088", "material-090"],
      "31-10": ["material-085", "material-089"],
      "32-1": ["material-086", "material-091"],
      "32-2": ["material-087", "material-090"],
      "32-3": ["material-085", "material-088"],
      "32-4": ["material-089", "material-091"],
      "32-5": ["material-090", "material-091"],
      "32-6": ["material-085", "material-087"],
      "32-7": ["material-086", "material-088"],
      "32-8": ["material-087", "material-089"],
      "32-9": ["material-085", "material-088"],
      "32-10": ["material-086", "material-089"],
    };
    for (const [stage, materials] of Object.entries(expected)) expect(stageData[stage]).toEqual(materials);
    expect(stageData["21-1"].filter((material) => sweepData[material].rank >= 2)).toEqual([
      "material-064",
      "material-077",
    ]);
  });

  it("plans the two rank 9 accessories in one new stage and exposes new alternatives", () => {
    const selected = new Set(["material-090", "material-091"]);
    const plan = createSweepPlan(selected, stageData);
    expect(plan).toEqual(["32-5"]);
    expect(getMissingMaterials([...selected], plan, stageData)).toEqual([]);
    const alternatives = getAlternativeStages(["29-1"], new Set(["material-085"]), sweepData, stageData);
    expect(alternatives.get("29-1")).toContainEqual({
      stage: "31-1",
      materials: ["material-087"],
      blueprints: ["material-085", "material-087"],
    });
  });
});
