import type { MaterialId, SweepData } from "./types";

export type WeaponType = "physical" | "magic";

type EquipmentSet = {
  physical: MaterialId;
  magic: MaterialId;
  armor: MaterialId;
  hat: MaterialId;
  boots: MaterialId;
  sparkling: MaterialId;
  brilliant: MaterialId;
};

export const equipmentByRank: Record<number, EquipmentSet> = {
  2: {
    physical: "material-036",
    magic: "material-038",
    armor: "material-040",
    hat: "material-042",
    boots: "material-037",
    sparkling: "material-039",
    brilliant: "material-041",
  },
  3: {
    physical: "material-043",
    magic: "material-044",
    armor: "material-045",
    hat: "material-046",
    boots: "material-047",
    sparkling: "material-048",
    brilliant: "material-049",
  },
  4: {
    physical: "material-050",
    magic: "material-051",
    armor: "material-052",
    hat: "material-053",
    boots: "material-054",
    sparkling: "material-055",
    brilliant: "material-056",
  },
  5: {
    physical: "material-057",
    magic: "material-059",
    armor: "material-060",
    hat: "material-061",
    boots: "material-062",
    sparkling: "material-063",
    brilliant: "material-058",
  },
  6: {
    physical: "material-064",
    magic: "material-066",
    armor: "material-067",
    hat: "material-068",
    boots: "material-069",
    sparkling: "material-070",
    brilliant: "material-065",
  },
  7: {
    physical: "material-071",
    magic: "material-072",
    armor: "material-073",
    hat: "material-074",
    boots: "material-075",
    sparkling: "material-076",
    brilliant: "material-077",
  },
  8: {
    physical: "material-078",
    magic: "material-079",
    armor: "material-080",
    hat: "material-081",
    boots: "material-082",
    sparkling: "material-083",
    brilliant: "material-084",
  },
  9: {
    physical: "material-085",
    magic: "material-086",
    armor: "material-087",
    hat: "material-088",
    boots: "material-089",
    sparkling: "material-090",
    brilliant: "material-091",
  },
};

export const quickRanks = [2, 3, 4, 5, 6, 7, 8, 9];

export const requiredEquipmentRankMap: Record<number, number[]> = {
  2: [1, 2],
  3: [2, 3],
  4: [4],
  5: [4, 5],
  6: [5, 6],
  7: [7],
  8: [7, 8],
  9: [8, 9],
};

export const requiredMaterialCountByTargetRank: Record<number, Record<number, number>> = {
  2: { 1: 4, 2: 10 },
  3: { 2: 8, 3: 18 },
  4: { 4: 20 },
  5: { 4: 12, 5: 30 },
  6: { 5: 14, 6: 36 },
  7: { 7: 42 },
  8: { 7: 18, 8: 46 },
  9: { 8: 20, 9: 52 },
};

export function requiredEquipmentRanks(rank: number) {
  return requiredEquipmentRankMap[rank] ?? [rank];
}

export function getRequiredMaterialCount(targetRank: number, materialRank: number) {
  return requiredMaterialCountByTargetRank[targetRank]?.[materialRank] ?? 1;
}

export function getDefaultMaterialCount(materialRank: number) {
  return getRequiredMaterialCount(materialRank, materialRank);
}

export function buildEquipmentRequirements(rank: number, weaponType: WeaponType, data: SweepData) {
  return requiredEquipmentRanks(rank).reduce<Record<MaterialId, number>>((requirements, requiredRank) => {
    const count = getRequiredMaterialCount(rank, requiredRank);
    if (requiredRank === 1) {
      for (const material of Object.keys(data).filter((item) => data[item].rank === 1)) {
        requirements[material] = count;
      }
      return requirements;
    }

    const equipment = equipmentByRank[requiredRank];
    if (!equipment) return requirements;

    for (const material of [
      equipment[weaponType],
      equipment.armor,
      equipment.hat,
      equipment.boots,
      equipment.sparkling,
      equipment.brilliant,
    ]) {
      requirements[material] = count;
    }

    return requirements;
  }, {});
}

export function buildEquipmentSet(rank: number, weaponType: WeaponType, data: SweepData) {
  return Object.keys(buildEquipmentRequirements(rank, weaponType, data));
}
