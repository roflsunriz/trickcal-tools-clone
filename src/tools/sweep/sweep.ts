import type { AlternativeStage, MaterialName, StageName, SweepData } from "./types";

export function compareStages(a: StageName, b: StageName) {
  const [chapterA, stageA] = a.split("-").map(Number);
  const [chapterB, stageB] = b.split("-").map(Number);
  return chapterA !== chapterB ? chapterA - chapterB : stageA - stageB;
}

export function buildStageData(data: SweepData) {
  const stages: Record<StageName, MaterialName[]> = {};

  for (const [material, detail] of Object.entries(data)) {
    if (!detail?.stages?.length) continue;

    for (const stage of detail.stages) {
      stages[stage] ??= [];
      stages[stage].push(material);
    }
  }

  return stages;
}

export function createSweepPlan(selectedMaterials: Iterable<MaterialName>, stageData: Record<StageName, MaterialName[]>) {
  const selected = Array.from(selectedMaterials);
  const remaining = new Set(selected);
  const plan: StageName[] = [];
  const stages = Object.entries(stageData).sort(([a], [b]) => compareStages(a, b));

  while (remaining.size > 0) {
    let bestStage: StageName | null = null;
    let bestMatches = 0;

    for (const [stage, materials] of stages) {
      const matches = materials.filter((material) => remaining.has(material)).length;
      if (matches > bestMatches) {
        bestStage = stage;
        bestMatches = matches;
      }
    }

    if (!bestStage) break;

    plan.push(bestStage);
    for (const material of stageData[bestStage]) {
      remaining.delete(material);
    }
  }

  return plan
    .filter((stage) => stageData[stage].some((material) => selected.includes(material)))
    .sort(compareStages);
}

export function getMissingMaterials(
  selectedMaterials: Iterable<MaterialName>,
  plan: StageName[],
  stageData: Record<StageName, MaterialName[]>,
) {
  return Array.from(selectedMaterials).filter(
    (material) => !plan.some((stage) => stageData[stage]?.includes(material)),
  );
}

export function isBlueprintMaterial(material: MaterialName, data: SweepData) {
  return (data[material]?.rank ?? 0) >= 2;
}

export function getAlternativeStages(plan: StageName[], selected: Set<MaterialName>, data: SweepData, stageData: Record<StageName, MaterialName[]>) {
  const alternatives = new Map<StageName, AlternativeStage[]>();

  for (const stage of plan) {
    const selectedDrops = (stageData[stage] ?? []).filter((material) => selected.has(material));
    if (selectedDrops.length !== 1) continue;

    const [target] = selectedDrops;
    const targetData = data[target];
    if (!targetData || targetData.stages.length <= 1) continue;

    const options: AlternativeStage[] = [];
    for (const candidate of targetData.stages) {
      if (candidate === stage) continue;
      const candidateMaterials = stageData[candidate] ?? [];
      const sideMaterials = candidateMaterials.filter((material) => {
        if (material === target) return false;
        return data[material]?.rank !== 1;
      });
      const blueprints = candidateMaterials.filter((material) => isBlueprintMaterial(material, data));
      if (sideMaterials.length > 0) {
        options.push({ stage: candidate, materials: sideMaterials, blueprints });
      }
    }

    if (options.length > 0) {
      alternatives.set(stage, options.sort((a, b) => compareStages(a.stage, b.stage)));
    }
  }

  return alternatives;
}
