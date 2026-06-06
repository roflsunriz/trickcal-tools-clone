import { describe, expect, it } from "vitest";
import data from "./data.json";
import { buildStageData, createSweepPlan, getMissingMaterials } from "./sweep";
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
});
