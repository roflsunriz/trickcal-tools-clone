import { describe, expect, it } from "vitest";
import data from "./data.json";
import {
  buildEquipmentRequirements,
  buildEquipmentSet,
  getDefaultMaterialCount,
  getRequiredMaterialCount,
  requiredEquipmentRanks,
} from "./quickEquipment";
import type { SweepData } from "./types";

const sweepData = data as SweepData;

describe("quick equipment selection", () => {
  it("uses the wiki rank-pair requirements for quick selection", () => {
    expect(requiredEquipmentRanks(2)).toEqual([1, 2]);
    expect(requiredEquipmentRanks(3)).toEqual([2, 3]);
    expect(requiredEquipmentRanks(4)).toEqual([4]);
    expect(requiredEquipmentRanks(5)).toEqual([4, 5]);
    expect(requiredEquipmentRanks(6)).toEqual([5, 6]);
    expect(requiredEquipmentRanks(7)).toEqual([7]);
    expect(requiredEquipmentRanks(8)).toEqual([7, 8]);
    expect(requiredEquipmentRanks(9)).toEqual([8, 9]);
  });

  it("selects rank 1 materials plus rank 2 equipment for rank 2", () => {
    const selected = buildEquipmentSet(2, "physical", sweepData);
    expect(selected.filter((material) => sweepData[material].rank === 1)).toHaveLength(35);
    expect(selected.filter((material) => sweepData[material].rank === 2)).toHaveLength(6);
  });

  it("uses wiki material counts for stamina estimates", () => {
    expect(getRequiredMaterialCount(9, 9)).toBe(52);
    expect(getRequiredMaterialCount(9, 8)).toBe(20);
    expect(getRequiredMaterialCount(8, 8)).toBe(46);
    expect(getRequiredMaterialCount(8, 7)).toBe(18);
    expect(getRequiredMaterialCount(5, 5)).toBe(30);
    expect(getRequiredMaterialCount(5, 4)).toBe(12);
  });

  it("uses rank-default material counts for manual selections", () => {
    expect(getDefaultMaterialCount(8)).toBe(46);
    expect(getDefaultMaterialCount(7)).toBe(42);
    expect(getDefaultMaterialCount(5)).toBe(30);
    expect(getDefaultMaterialCount(1)).toBe(1);
  });

  it("assigns required quantities to quick-selected materials", () => {
    const requirements = buildEquipmentRequirements(8, "physical", sweepData);
    expect(requirements["material-078"]).toBe(46);
    expect(requirements["material-071"]).toBe(18);
    expect(Object.values(requirements).reduce((total, quantity) => total + quantity, 0)).toBe(384);
  });

  it("selects only rank 4 equipment for rank 4", () => {
    const selected = buildEquipmentSet(4, "magic", sweepData);
    expect(selected).toHaveLength(6);
    expect(selected.every((material) => sweepData[material].rank === 4)).toBe(true);
    expect(selected).toContain("material-051");
  });
});
