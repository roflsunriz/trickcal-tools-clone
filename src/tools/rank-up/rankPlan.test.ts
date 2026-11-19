import { describe, expect, it } from "vitest";
import rawData from "../sweep/data.json";
import type { SweepData } from "../sweep/types";
import { buildRankUpRequirements, createRankUpPlan } from "./rankPlan";

const data = rawData as SweepData;

describe("Rank 1 to Rank 10 planner", () => {
  it("accumulates Rank 3 through Rank 10 recipes and excludes Rank 1 gear", () => {
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
    expect(requirements.get("material-092")).toBe(64);
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
    expect(magicPlan.totalMinimumRuns).toBe(1368);
    expect(magicPlan.totalRecommendedRuns).toBe(1833);
    expect(magicPlan.totalRecommendedStamina).toBe(18_330);
  });

  it("creates a complete plan using paired drops and the wiki drop-rate estimate", () => {
    const plan = createRankUpPlan("physical", data);

    expect(plan.requirements).toHaveLength(54);
    expect(plan.stages).toHaveLength(33);
    expect(plan.totalMinimumRuns).toBe(1359);
    expect(plan.totalRecommendedRuns).toBe(1821);
    expect(plan.totalRecommendedStamina).toBe(18_210);

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

  it("covers all six Rank 10 shards on the new worlds for both weapons", () => {
    for (const weapon of ["physical", "magic"] as const) {
      const plan = createRankUpPlan(weapon, data);
      const stages = plan.stages.filter((stage) => stage.rank === 10);
      expect(stages).toHaveLength(6);
      expect(stages.every((stage) => /^3[34]-/.test(stage.stage))).toBe(true);
      expect(
        stages.every(
          (stage) =>
            stage.minimumRuns === 64 &&
            stage.recommendedRuns === 86 &&
            stage.optimisticRuns === 80 &&
            stage.conservativeRuns === 92,
        ),
      ).toBe(true);
      const materials = stages.flatMap((stage) => stage.materials);
      expect(materials).toContain(weapon === "physical" ? "material-092" : "material-093");
      expect(materials).not.toContain(weapon === "physical" ? "material-093" : "material-092");
      for (const [id, required] of plan.requirements) {
        expect(
          plan.stages
            .filter((stage) => stage.materials.includes(id))
            .reduce((total, stage) => total + stage.minimumRuns, 0),
        ).toBeGreaterThanOrEqual(required);
      }
    }
  });
});
