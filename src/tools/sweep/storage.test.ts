import { beforeEach, describe, expect, it } from "vitest";
import data from "./data.json";
import {
  readSweepStorageState,
  sanitizeSelectedQuantities,
  sanitizeSelectedQuickRank,
  sanitizeSelectedRanks,
  sanitizeWeaponType,
  sweepStorageKey,
  writeSweepStorageState,
} from "./storage";
import type { SweepData } from "./types";

const sweepData = data as SweepData;

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

describe("sweep storage repair", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: createMemoryStorage(),
    });
  });

  it("drops invalid selected materials and quantities", () => {
    const selected = sanitizeSelectedQuantities(
      {
        "material-078": 46,
        "missing-material": 10,
        "material-079": -1,
        "material-080": "bad",
      },
      sweepData,
    );

    expect(Object.fromEntries(selected)).toEqual({ "material-078": 46 });
  });

  it("repairs invalid rank filters to all ranks", () => {
    expect(Array.from(sanitizeSelectedRanks("bad", [1, 2, 3]))).toEqual([1, 2, 3]);
  });

  it("drops out-of-range rank filters", () => {
    expect(Array.from(sanitizeSelectedRanks([1, 9, "bad", 2], [1, 2, 3]))).toEqual([1, 2]);
  });

  it("repairs invalid quick-select controls", () => {
    expect(sanitizeWeaponType("magic")).toBe("magic");
    expect(sanitizeWeaponType("bad")).toBe("physical");
    expect(sanitizeSelectedQuickRank(9)).toBe(9);
    expect(sanitizeSelectedQuickRank(1)).toBeNull();
    expect(sanitizeSelectedQuickRank("9")).toBeNull();
  });

  it("restores the selected weapon type and quick rank", () => {
    writeSweepStorageState({
      selectedQuantities: new Map([["material-085", 52]]),
      selectedRanks: new Set([8, 9]),
      weaponType: "magic",
      selectedQuickRank: 9,
    });

    const restored = readSweepStorageState(sweepData, [1, 2, 3, 4, 5, 6, 7, 8, 9]);

    expect(restored.weaponType).toBe("magic");
    expect(restored.selectedQuickRank).toBe(9);
  });

  it("migrates version 2 selections without discarding them", () => {
    localStorage.setItem(
      sweepStorageKey,
      JSON.stringify({
        schemaVersion: 2,
        selectedQuantities: { "material-078": 46 },
        selectedRanks: [7, 8],
      }),
    );

    const restored = readSweepStorageState(sweepData, [1, 2, 3, 4, 5, 6, 7, 8, 9]);

    expect(Object.fromEntries(restored.selectedQuantities)).toEqual({ "material-078": 46 });
    expect(Array.from(restored.selectedRanks)).toEqual([7, 8]);
    expect(restored.weaponType).toBe("physical");
    expect(restored.selectedQuickRank).toBeNull();
    expect(JSON.parse(localStorage.getItem(sweepStorageKey) ?? "{}").schemaVersion).toBe(3);
  });
});
