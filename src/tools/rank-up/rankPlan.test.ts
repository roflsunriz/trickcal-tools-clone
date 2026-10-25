import { describe, expect, it } from "vitest";
import rawData from "../sweep/data.json";
import type { SweepData } from "../sweep/types";
import { buildRankUpRequirements, createRankUpPlan } from "./rankPlan";

const data = rawData as SweepData;

describe("Rank 1 to Rank 9 planner", () => {
  it("accumulates Rank 3 through Rank 9 recipes and excludes Rank 1 gear", () => {
    const requirements = buildRankUpRequirements("physical", data);

    expect([...requirements].some(([material]) => data[material].rank === 1)).toBe(false);
    expect(requirements.get("material-036")).toBe(8);
    expect(requirements.get("material-043")).toBe(18);
    expect(requirements.get("material-050")).toBe(32);
    expect(requirements.get("material-057")).toBe(44);
    expect(requirements.get("material-064")).toBe(36);
    expect(requirements.get("material-071")).toBe(60);
    expect(requirements.get("material-078")).toBe(66);
    expect(requirements.get("material-085")).toBe(52);
  });

  it("switches only the weapon requirements between physical and magic", () => {
    const physical = buildRankUpRequirements("physical", data);
    const magic = buildRankUpRequirements("magic", data);

    expect(physical.has("material-036")).toBe(true);
    expect(physical.has("material-038")).toBe(false);
    expect(magic.has("material-036")).toBe(false);
    expect(magic.has("material-038")).toBe(true);
    expect(physical.get("material-087")).toBe(magic.get("material-087"));

    const magicPlan = createRankUpPlan("magic", data);
    expect(magicPlan.totalMinimumRuns).toBe(984);
    expect(magicPlan.totalRecommendedRuns).toBe(1317);
    expect(magicPlan.totalRecommendedStamina).toBe(13_170);
  });

  it("creates a complete plan using paired drops and the wiki drop-rate estimate", () => {
    const plan = createRankUpPlan("physical", data);

    expect(plan.requirements).toHaveLength(48);
    expect(plan.stages).toHaveLength(27);
    expect(plan.totalMinimumRuns).toBe(975);
    expect(plan.totalRecommendedRuns).toBe(1305);
    expect(plan.totalRecommendedStamina).toBe(13_050);

    for (const [material, quantity] of plan.requirements) {
      const plannedQuantity = plan.stages
        .filter((stage) => stage.materials.includes(material))
        .reduce((total, stage) => total + stage.minimumRuns * stage.yieldPerSuccess, 0);
      expect(plannedQuantity, material).toBeGreaterThanOrEqual(quantity);
    }
  });

  it("uses the latest complete Rank 9 physical pairing", () => {
    const rankNineStages = createRankUpPlan("physical", data)
      .stages.filter((stage) => stage.rank === 9)
      .map((stage) => stage.stage)
      .sort();

    expect(rankNineStages).toEqual(["32-5", "32-8", "32-9"]);
  });
});
