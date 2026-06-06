import { getDefaultMaterialCount } from "./quickEquipment";
import type { MaterialId, SweepData } from "./types";

const storageVersion = 2;

export const sweepStorageKey = "trickcal_sweep_state";
export const legacySelectedStorageKey = "trickcal_sweep_selected_materials";
export const legacyRankStorageKey = "trickcal_sweep_rank_filter";

type PersistedSweepState = {
  schemaVersion: typeof storageVersion;
  selectedQuantities: Record<MaterialId, number>;
  selectedRanks: number[];
};

export type SweepStorageState = {
  selectedQuantities: Map<MaterialId, number>;
  selectedRanks: Set<number>;
};

function toPersistedState(state: SweepStorageState): PersistedSweepState {
  return {
    schemaVersion: storageVersion,
    selectedQuantities: Object.fromEntries(state.selectedQuantities),
    selectedRanks: Array.from(state.selectedRanks).sort((a, b) => a - b),
  };
}

function writeState(state: SweepStorageState) {
  localStorage.setItem(sweepStorageKey, JSON.stringify(toPersistedState(state)));
}

function removeLegacyState() {
  localStorage.removeItem(legacySelectedStorageKey);
  localStorage.removeItem(legacyRankStorageKey);
}

export function sanitizeSelectedQuantities(value: unknown, data: SweepData) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return new Map<MaterialId, number>();
  }

  const entries: Array<[MaterialId, number]> = [];
  for (const [material, quantity] of Object.entries(value)) {
    if (material in data && typeof quantity === "number" && Number.isFinite(quantity) && quantity > 0) {
      entries.push([material, Math.ceil(quantity)]);
    }
  }

  return new Map<MaterialId, number>(entries);
}

export function sanitizeSelectedRanks(value: unknown, allRanks: number[]) {
  if (!Array.isArray(value)) {
    return new Set<number>(allRanks);
  }

  const allowedRanks = new Set(allRanks);
  return new Set<number>(value.filter((rank) => typeof rank === "number" && allowedRanks.has(rank)));
}

function migrateLegacySelectedQuantities(data: SweepData) {
  const value = localStorage.getItem(legacySelectedStorageKey);
  if (!value) return new Map<MaterialId, number>();

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return new Map<MaterialId, number>(
        parsed
          .filter((material) => material in data)
          .map((material) => [material, getDefaultMaterialCount(data[material].rank)]),
      );
    }

    return sanitizeSelectedQuantities(parsed, data);
  } catch {
    return new Map<MaterialId, number>();
  }
}

function migrateLegacyRanks(allRanks: number[]) {
  const value = localStorage.getItem(legacyRankStorageKey);
  if (!value) return new Set<number>(allRanks);

  try {
    return sanitizeSelectedRanks(JSON.parse(value), allRanks);
  } catch {
    return new Set<number>(allRanks);
  }
}

function migrateLegacyState(data: SweepData, allRanks: number[]) {
  const state: SweepStorageState = {
    selectedQuantities: migrateLegacySelectedQuantities(data),
    selectedRanks: migrateLegacyRanks(allRanks),
  };
  writeState(state);
  removeLegacyState();
  return state;
}

export function readSweepStorageState(data: SweepData, allRanks: number[]): SweepStorageState {
  const value = localStorage.getItem(sweepStorageKey);
  if (!value) {
    return migrateLegacyState(data, allRanks);
  }

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || parsed.schemaVersion !== storageVersion) {
      return migrateLegacyState(data, allRanks);
    }

    const state: SweepStorageState = {
      selectedQuantities: sanitizeSelectedQuantities(parsed.selectedQuantities, data),
      selectedRanks: sanitizeSelectedRanks(parsed.selectedRanks, allRanks),
    };
    writeState(state);
    removeLegacyState();
    return state;
  } catch {
    const state: SweepStorageState = {
      selectedQuantities: new Map<MaterialId, number>(),
      selectedRanks: new Set<number>(allRanks),
    };
    writeState(state);
    removeLegacyState();
    return state;
  }
}

export function writeSweepStorageState(state: SweepStorageState) {
  writeState(state);
  removeLegacyState();
}
