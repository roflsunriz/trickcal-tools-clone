import { buildEquipmentRequirements } from "../sweep/quickEquipment";
import { buildStageData, compareStages } from "../sweep/sweep";
import type { MaterialId, StageName, SweepData } from "../sweep/types";
import type { WeaponType } from "../sweep/quickEquipment";

export const estimatedDropRate = 0.75;
export const dropRateRange = { minimum: 0.7, maximum: 0.8 } as const;

export type RankPlanStage = {
  stage: StageName;
  rank: number;
  materials: MaterialId[];
  materialQuantity: number;
  yieldPerSuccess: number;
  minimumRuns: number;
  optimisticRuns: number;
  recommendedRuns: number;
  conservativeRuns: number;
};

export type RankUpPlan = {
  stages: RankPlanStage[];
  requirements: Map<MaterialId, number>;
  totalMinimumRuns: number;
  totalRecommendedRuns: number;
  totalRecommendedStamina: number;
};

type StageCandidate = {
  materials: MaterialId[];
  units: MaterialId[];
  stage: StageName;
};

const targetRanks = [3, 4, 5, 6, 7, 8, 9];

export function buildRankUpRequirements(weaponType: WeaponType, data: SweepData) {
  const requirements = new Map<MaterialId, number>();

  for (const targetRank of targetRanks) {
    for (const [material, quantity] of Object.entries(buildEquipmentRequirements(targetRank, weaponType, data))) {
      requirements.set(material, (requirements.get(material) ?? 0) + quantity);
    }
  }

  return requirements;
}

function stageValue(stage: StageName) {
  const [world, number] = stage.split("-").map(Number);
  return world * 100 + number;
}

function createStagePlan(
  rank: number,
  materials: MaterialId[],
  materialQuantity: number,
  stageData: Record<StageName, MaterialId[]>,
  data: SweepData,
) {
  if (materialQuantity % 2 !== 0) throw new Error(`Rank ${rank}: 奇数の必要数には対応していません。`);
  const materialSet = new Set(materials);
  const candidatesByUnits = new Map<string, StageCandidate>();

  for (const [stage, drops] of Object.entries(stageData)) {
    const equipmentDrops = drops.filter((material) => data[material]?.rank >= 2);
    const covered = equipmentDrops.filter((material) => materialSet.has(material));
    let candidate: StageCandidate | null = null;
    if (covered.length === 1) {
      candidate = { stage, materials: covered, units: [covered[0]] };
    } else if (covered.length === 2) {
      candidate = { stage, materials: covered, units: [covered[0], covered[1]] };
    }
    if (!candidate) continue;
    const key = [...candidate.units].sort().join(":");
    const current = candidatesByUnits.get(key);
    if (!current || compareStages(current.stage, stage) < 0) candidatesByUnits.set(key, candidate);
  }

  const candidates = [...candidatesByUnits.values()].sort(
    (left, right) => stageValue(right.stage) - stageValue(left.stage),
  );
  const materialIndexes = new Map(materials.map((material, index) => [material, index]));
  const memo = new Map<string, StageCandidate[] | null>();

  function isBetter(candidate: StageCandidate[], current: StageCandidate[] | null) {
    if (!current || candidate.length !== current.length) return !current || candidate.length < current.length;
    const candidateStages = candidate.map((item) => stageValue(item.stage)).sort((left, right) => right - left);
    const currentStages = current.map((item) => stageValue(item.stage)).sort((left, right) => right - left);
    for (let index = 0; index < candidateStages.length; index += 1) {
      if (candidateStages[index] !== currentStages[index]) return candidateStages[index] > currentStages[index];
    }
    return false;
  }

  function solve(remaining: number[]): StageCandidate[] | null {
    if (remaining.every((quantity) => quantity === 0)) return [];
    const memoKey = remaining.join(",");
    if (memo.has(memoKey)) return memo.get(memoKey) ?? null;
    const targetIndex = remaining.findIndex((quantity) => quantity > 0);
    const target = materials[targetIndex];
    let best: StageCandidate[] | null = null;

    for (const candidate of candidates) {
      if (!candidate.units.includes(target)) continue;
      const next = [...remaining];
      let fits = true;
      for (const unit of candidate.units) {
        const index = materialIndexes.get(unit);
        if (index === undefined || next[index] === 0) {
          fits = false;
          break;
        }
        next[index] -= 1;
      }
      if (!fits) continue;
      const rest = solve(next);
      if (rest) {
        const plan = [candidate, ...rest];
        if (isBetter(plan, best)) best = plan;
      }
    }

    memo.set(memoKey, best);
    return best;
  }

  const basePlan = solve(materials.map(() => 2));
  if (!basePlan) throw new Error(`Rank ${rank}: 必要素材を均等に集める周回計画を作成できません。`);
  const consolidated = new Map<string, { candidate: StageCandidate; baseRuns: number }>();
  for (const candidate of basePlan) {
    const current = consolidated.get(candidate.stage);
    consolidated.set(candidate.stage, { candidate, baseRuns: (current?.baseRuns ?? 0) + 1 });
  }

  return [...consolidated.values()].map(({ candidate, baseRuns }): RankPlanStage => {
    const minimumRuns = (materialQuantity / 2) * baseRuns;
    const yieldPerSuccess = 1;
    return {
      stage: candidate.stage,
      rank,
      materials: candidate.materials,
      materialQuantity,
      yieldPerSuccess,
      minimumRuns,
      optimisticRuns: Math.ceil(minimumRuns / dropRateRange.maximum),
      recommendedRuns: Math.ceil(minimumRuns / estimatedDropRate),
      conservativeRuns: Math.ceil(minimumRuns / dropRateRange.minimum),
    };
  });
}

export function createRankUpPlan(weaponType: WeaponType, data: SweepData): RankUpPlan {
  const requirements = buildRankUpRequirements(weaponType, data);
  const stageData = buildStageData(data);
  const stages: RankPlanStage[] = [];

  for (let rank = 2; rank <= 9; rank += 1) {
    const materials = [...requirements.keys()].filter((material) => data[material]?.rank === rank);
    if (materials.length === 0) continue;
    const quantities = new Set(materials.map((material) => requirements.get(material)));
    if (quantities.size !== 1) throw new Error(`Rank ${rank}: 部位ごとの必要数が一致しません。`);
    const [materialQuantity] = quantities;
    if (!materialQuantity) throw new Error(`Rank ${rank}: 必要数が不正です。`);
    stages.push(...createStagePlan(rank, materials, materialQuantity, stageData, data));
  }

  const totalMinimumRuns = stages.reduce((total, stage) => total + stage.minimumRuns, 0);
  const totalRecommendedRuns = stages.reduce((total, stage) => total + stage.recommendedRuns, 0);
  return {
    stages,
    requirements,
    totalMinimumRuns,
    totalRecommendedRuns,
    totalRecommendedStamina: totalRecommendedRuns * 10,
  };
}
