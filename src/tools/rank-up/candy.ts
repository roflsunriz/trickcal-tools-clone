export const naturalRecoveryPerDay = 240;
export const dailyMailCandy = 100;
export const dailyShopCandy = 100;
export const subscriptionDays = 31;
export const subscriptionImmediateCandy = 300;
export const subscriptionDailyCandy = 120;
export const subscriptionFinalDayCandy = 200;
export const subscriptionCandyPerTerm =
  subscriptionImmediateCandy + subscriptionDailyCandy * subscriptionDays + subscriptionFinalDayCandy;
export const subscriptionCandyPerDay = subscriptionCandyPerTerm / subscriptionDays;
export const maximumOfferingResearchStage = 12;

export type CandyIncomeSettings = {
  shrineLevel: number;
  offeringResearchStage: number;
  includeDailyMail: boolean;
  includeDailyShop: boolean;
  includeSubscription: boolean;
  eliefPurchasesPerDay: number;
};

export type CandyIncome = {
  natural: number;
  offering: number;
  dailyMail: number;
  dailyShop: number;
  subscription: number;
  elief: number;
  eliefCost: number;
  totalPerDay: number;
};

export const defaultCandyIncomeSettings: CandyIncomeSettings = {
  shrineLevel: 13,
  offeringResearchStage: 0,
  includeDailyMail: true,
  includeDailyShop: true,
  includeSubscription: false,
  eliefPurchasesPerDay: 0,
};

const eliefCosts = [30, 30, 30, 50, 50, 70, 70, 70, 100, 100] as const;

export const eliefPurchaseOptions = Array.from({ length: eliefCosts.length + 1 }, (_, purchases) => ({
  purchases,
  candy: purchases * 100,
  elief: eliefCosts.slice(0, purchases).reduce((total, cost) => total + cost, 0),
}));

export function baseOfferingCandyPerDay(shrineLevel: number) {
  if (!Number.isInteger(shrineLevel) || shrineLevel < 1 || shrineLevel > 30) {
    throw new Error("世界樹聖画レベルは1〜30で指定してください。");
  }
  if (shrineLevel < 4) return 0;
  return shrineLevel < 13 ? 144 : 288;
}

export function offeringCandyPerDay(shrineLevel: number, researchStage: number) {
  if (!Number.isInteger(researchStage) || researchStage < 0 || researchStage > maximumOfferingResearchStage) {
    throw new Error(`供物量研究は0〜${maximumOfferingResearchStage}段階で指定してください。`);
  }
  return baseOfferingCandyPerDay(shrineLevel) * (1 + researchStage * 0.1);
}

export function calculateCandyIncome(settings: CandyIncomeSettings): CandyIncome {
  const eliefOption = eliefPurchaseOptions[settings.eliefPurchasesPerDay];
  if (!eliefOption) throw new Error("エリーフ購入回数は0〜10回で指定してください。");

  const income = {
    natural: naturalRecoveryPerDay,
    offering: offeringCandyPerDay(settings.shrineLevel, settings.offeringResearchStage),
    dailyMail: settings.includeDailyMail ? dailyMailCandy : 0,
    dailyShop: settings.includeDailyShop ? dailyShopCandy : 0,
    subscription: settings.includeSubscription ? subscriptionCandyPerDay : 0,
    elief: eliefOption.candy,
    eliefCost: eliefOption.elief,
  };
  return {
    ...income,
    totalPerDay:
      income.natural + income.offering + income.dailyMail + income.dailyShop + income.subscription + income.elief,
  };
}

export function daysForCandy(requiredCandy: number, candyPerDay: number) {
  if (!Number.isFinite(requiredCandy) || requiredCandy < 0) throw new Error("必要キャンディ数が不正です。");
  if (!Number.isFinite(candyPerDay) || candyPerDay <= 0) throw new Error("1日あたりのキャンディが不正です。");
  return requiredCandy / candyPerDay;
}

export function totalCandyForApostles(
  physicalCandy: number,
  magicCandy: number,
  physicalApostles: number,
  magicApostles: number,
) {
  return physicalCandy * physicalApostles + magicCandy * magicApostles;
}
