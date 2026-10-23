import { beforeEach, describe, expect, it } from "vitest";
import rawData from "./data.json";
import {
  boardCellKey,
  communityStorageKey,
  readCommunityStorageState,
  sanitizeCommunityStorageState,
  writeCommunityStorageState,
} from "./storage";
import type { CommunityData } from "./types";

const data = rawData as CommunityData;

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

describe("community storage", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: createMemoryStorage(),
    });
  });

  it("restores valid owned apostles and board cells", () => {
    const cell = boardCellKey("グウィン", "layer1", "attack");
    writeCommunityStorageState({ ownedCharacters: new Set(["グウィン"]), activatedCells: new Set([cell]) });

    const restored = readCommunityStorageState(data.characters);
    expect([...restored.ownedCharacters]).toEqual(["グウィン"]);
    expect([...restored.activatedCells]).toEqual([cell]);
  });

  it("drops unknown apostles, cells, and schema versions", () => {
    const repaired = sanitizeCommunityStorageState(
      {
        schemaVersion: 1,
        ownedCharacters: ["グウィン", "存在しない使徒"],
        activatedCells: [boardCellKey("グウィン", "layer1", "attack"), "bad-cell"],
      },
      data.characters,
    );
    expect([...repaired.ownedCharacters]).toEqual(["グウィン"]);
    expect(repaired.activatedCells.size).toBe(1);

    localStorage.setItem(communityStorageKey, JSON.stringify({ schemaVersion: 999 }));
    expect(readCommunityStorageState(data.characters).ownedCharacters.size).toBe(0);
  });
});
