import { describe, expect, it } from "vitest";
import data from "./data.json";
import { buildStageData, createSweepPlan, getMissingMaterials } from "./sweep";
import type { SweepData } from "./types";

describe("sweep planner", () => {
  const sweepData = data as SweepData;
  const stageData = buildStageData(sweepData);

  it("groups materials by stage", () => {
    expect(stageData["1-1"]).toContain("領口鬆垮的T恤");
    expect(stageData["1-1"]).toContain("鬆緊帶短褲");
  });

  it("chooses a stage that covers selected materials", () => {
    const selected = ["領口鬆垮的T恤", "鬆緊帶短褲"];
    expect(createSweepPlan(selected, stageData)).toEqual(["1-1"]);
  });

  it("reports materials that cannot be mapped to a stage", () => {
    const selected = ["存在しない素材"];
    const plan = createSweepPlan(selected, stageData);
    expect(getMissingMaterials(selected, plan, stageData)).toEqual(["存在しない素材"]);
  });
});
