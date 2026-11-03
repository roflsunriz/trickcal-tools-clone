export type SkillKind = "active" | "passive";

export type SkillCost = {
  low: number;
  medium: number;
  high: number;
  gold: number;
};

type Marshmallows = readonly [low: number, medium: number, high: number];

export type SkillUpgrade = {
  level: number;
  active: Marshmallows;
  passive: Marshmallows;
  gold: number;
};

// Wiki「キャラクター育成」の使用マシュマロ数。各行は直前のレベルからの費用。
export const skillUpgrades: readonly SkillUpgrade[] = [
  { level: 2, active: [15, 0, 0], passive: [15, 0, 0], gold: 28000 },
  { level: 3, active: [20, 0, 0], passive: [15, 0, 0], gold: 28000 },
  { level: 4, active: [25, 0, 0], passive: [15, 0, 0], gold: 28000 },
  { level: 5, active: [40, 20, 0], passive: [25, 15, 0], gold: 72000 },
  { level: 6, active: [45, 25, 0], passive: [25, 15, 0], gold: 72000 },
  { level: 7, active: [50, 30, 0], passive: [25, 15, 0], gold: 72000 },
  { level: 8, active: [80, 50, 40], passive: [45, 35, 30], gold: 140000 },
  { level: 9, active: [85, 55, 45], passive: [45, 35, 30], gold: 140000 },
  { level: 10, active: [90, 60, 50], passive: [45, 35, 30], gold: 140000 },
  { level: 11, active: [120, 80, 70], passive: [55, 45, 40], gold: 280000 },
  { level: 12, active: [130, 85, 75], passive: [55, 45, 40], gold: 280000 },
  { level: 13, active: [140, 90, 80], passive: [65, 55, 50], gold: 280000 },
  { level: 14, active: [150, 95, 80], passive: [65, 55, 50], gold: 280000 },
  { level: 15, active: [160, 100, 85], passive: [65, 55, 50], gold: 280000 },
];

export function isTargetSkillLevel(level: number): boolean {
  return Number.isInteger(level) && level >= 2 && level <= 15;
}

export function calculateSkillCost(kind: SkillKind, targetLevel: number): SkillCost {
  if (!isTargetSkillLevel(targetLevel)) {
    throw new RangeError("Invalid target skill level");
  }

  return skillUpgrades
    .filter((upgrade) => upgrade.level <= targetLevel)
    .reduce<SkillCost>(
      (total, upgrade) => {
        const [low, medium, high] = upgrade[kind];
        return {
          low: total.low + low,
          medium: total.medium + medium,
          high: total.high + high,
          gold: total.gold + upgrade.gold,
        };
      },
      { low: 0, medium: 0, high: 0, gold: 0 },
    );
}

export function calculateAllSkillsCost(apostleCount: number, targetLevel: number): SkillCost {
  if (!Number.isSafeInteger(apostleCount) || apostleCount < 0) {
    throw new RangeError("Invalid apostle count");
  }
  const active = calculateSkillCost("active", targetLevel);
  const passive = calculateSkillCost("passive", targetLevel);
  return {
    low: (active.low * 2 + passive.low) * apostleCount,
    medium: (active.medium * 2 + passive.medium) * apostleCount,
    high: (active.high * 2 + passive.high) * apostleCount,
    gold: (active.gold * 2 + passive.gold) * apostleCount,
  };
}
