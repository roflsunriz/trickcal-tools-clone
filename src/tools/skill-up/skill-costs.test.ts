import { describe, expect, it } from "vitest";
import { calculateAllSkillsCost, calculateSkillCost, isTargetSkillLevel, skillUpgrades } from "./skill-costs";

describe("skill upgrade costs", () => {
  it("has one upgrade for every target level from 2 through 15", () => {
    expect(skillUpgrades.map(({ level }) => level)).toEqual(Array.from({ length: 14 }, (_, index) => index + 2));
    expect(skillUpgrades[0]).toEqual({ level: 2, active: [15, 0, 0], passive: [15, 0, 0], gold: 28000 });
    expect(skillUpgrades[6]).toEqual({ level: 8, active: [80, 50, 40], passive: [45, 35, 30], gold: 140000 });
    expect(skillUpgrades[11]).toEqual({ level: 13, active: [140, 90, 80], passive: [65, 55, 50], gold: 280000 });
    expect(skillUpgrades[13]).toEqual({ level: 15, active: [160, 100, 85], passive: [65, 55, 50], gold: 280000 });
  });

  it.each([
    ["active", 7, 195, 75, 0, 300000],
    ["passive", 7, 120, 45, 0, 300000],
    ["active", 12, 700, 405, 280, 1280000],
    ["passive", 12, 365, 240, 170, 1280000],
    ["active", 15, 1150, 690, 525, 2120000],
    ["passive", 15, 560, 405, 320, 2120000],
  ] as const)("totals %s costs from level 1 to %i", (kind, target, low, medium, high, gold) => {
    expect(calculateSkillCost(kind, target)).toEqual({ low, medium, high, gold });
  });

  it("rejects levels outside the supported range and non-integers", () => {
    for (const level of [0, 1, 16, 2.5, NaN, Infinity]) {
      expect(isTargetSkillLevel(level)).toBe(false);
      expect(() => calculateSkillCost("active", level)).toThrow(RangeError);
    }
    expect(isTargetSkillLevel(2)).toBe(true);
    expect(isTargetSkillLevel(15)).toBe(true);
    expect(calculateSkillCost("active", 2)).toEqual({ low: 15, medium: 0, high: 0, gold: 28000 });
  });

  it("totals both active skills and the passive for all apostles", () => {
    expect(calculateAllSkillsCost(1, 12)).toEqual({ low: 1765, medium: 1050, high: 730, gold: 3840000 });
    expect(calculateAllSkillsCost(12, 12)).toEqual({ low: 21180, medium: 12600, high: 8760, gold: 46080000 });
    expect(calculateAllSkillsCost(47, 12)).toEqual({ low: 82955, medium: 49350, high: 34310, gold: 180480000 });
    expect(calculateAllSkillsCost(23, 12)).toEqual({ low: 40595, medium: 24150, high: 16790, gold: 88320000 });
    expect(calculateAllSkillsCost(82, 12)).toEqual({ low: 144730, medium: 86100, high: 59860, gold: 314880000 });
    expect(calculateAllSkillsCost(0, 12)).toEqual({ low: 0, medium: 0, high: 0, gold: 0 });
    expect(calculateAllSkillsCost(1, 7)).toEqual({ low: 510, medium: 195, high: 0, gold: 900000 });
    expect(() => calculateAllSkillsCost(-1, 12)).toThrow(RangeError);
    expect(() => calculateAllSkillsCost(1.5, 12)).toThrow(RangeError);
  });
});
