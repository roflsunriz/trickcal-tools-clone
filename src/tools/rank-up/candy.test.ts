import { describe, expect, it } from "vitest";
import communityData from "../community/data.json";
import type { CommunityData } from "../community/types";
import {
  baseOfferingCandyPerDay,
  calculateCandyIncome,
  daysForCandy,
  defaultCandyIncomeSettings,
  eliefPurchaseOptions,
  offeringCandyPerDay,
  subscriptionCandyPerDay,
  subscriptionCandyPerTerm,
  totalCandyForApostles,
} from "./candy";

describe("Rank-up candy income", () => {
  it("calculates offering candy by shrine level and research stage", () => {
    expect(baseOfferingCandyPerDay(3)).toBe(0);
    expect(baseOfferingCandyPerDay(4)).toBe(144);
    expect(baseOfferingCandyPerDay(12)).toBe(144);
    expect(baseOfferingCandyPerDay(13)).toBe(288);
    expect(baseOfferingCandyPerDay(30)).toBe(288);
    expect(offeringCandyPerDay(13, 12)).toBeCloseTo(633.6);
    expect(() => offeringCandyPerDay(13, 13)).toThrow("0〜12段階");
  });

  it("includes natural recovery, daily sources, subscription, and every Elief tier", () => {
    expect(calculateCandyIncome(defaultCandyIncomeSettings)).toMatchObject({
      natural: 240,
      offering: 288,
      dailyMail: 100,
      dailyShop: 100,
      subscription: 0,
      elief: 0,
      eliefCost: 0,
      totalPerDay: 728,
    });
    expect(subscriptionCandyPerTerm).toBe(4220);
    expect(subscriptionCandyPerDay).toBeCloseTo(4220 / 31);
    expect(eliefPurchaseOptions[3]).toEqual({ purchases: 3, candy: 300, elief: 90 });
    expect(eliefPurchaseOptions[5]).toEqual({ purchases: 5, candy: 500, elief: 190 });
    expect(eliefPurchaseOptions[10]).toEqual({ purchases: 10, candy: 1000, elief: 600 });
  });

  it("calculates one-apostle and all-apostle theoretical durations", () => {
    const counts = Object.values((communityData as CommunityData).characters).reduce(
      (result, character) => ({ ...result, [character.attackType]: result[character.attackType] + 1 }),
      { physical: 0, magic: 0 },
    );
    expect(counts).toEqual({ physical: 44, magic: 38 });

    const allCandy = totalCandyForApostles(13_050, 13_170, counts.physical, counts.magic);
    expect(allCandy).toBe(1_074_660);
    expect(daysForCandy(13_050, 728)).toBeCloseTo(17.9258, 4);
    expect(daysForCandy(allCandy, 728)).toBeCloseTo(1476.1813, 4);
  });
});
