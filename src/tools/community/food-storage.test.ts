import { beforeEach, describe, expect, it } from "vitest";
import { cloudLocalUpdatedAtKey } from "../../cloud/storage";
import rawData from "./data.json";
import { foodStorageKey, readFoodStorageState, sanitizeFoodStorageState, writeFoodStorageState } from "./food-storage";
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

describe("food preference storage", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: createMemoryStorage(),
    });
  });

  it("restores searches and the selected apostle", () => {
    writeFoodStorageState({
      characterSearch: "レーテー",
      foodSearch: "Dragon",
      selectedCharacter: "レーテー",
    });

    expect(readFoodStorageState(data)).toEqual({
      characterSearch: "レーテー",
      foodSearch: "Dragon",
      selectedCharacter: "レーテー",
      selectedFood: undefined,
    });
    expect(localStorage.getItem(cloudLocalUpdatedAtKey)).not.toBeNull();
  });

  it("restores the selected food", () => {
    writeFoodStorageState({
      characterSearch: "Gwynn",
      foodSearch: "宇宙食",
      selectedFood: "ANSA宇宙食",
    });

    expect(readFoodStorageState(data)).toEqual({
      characterSearch: "Gwynn",
      foodSearch: "宇宙食",
      selectedCharacter: undefined,
      selectedFood: "ANSA宇宙食",
    });
  });

  it("repairs invalid versions, names, and conflicting selections", () => {
    expect(
      sanitizeFoodStorageState(
        {
          schemaVersion: 1,
          characterSearch: "x".repeat(600),
          foodSearch: 123,
          selectedCharacter: "レーテー",
          selectedFood: "ANSA宇宙食",
        },
        data,
      ),
    ).toEqual({
      characterSearch: "x".repeat(500),
      foodSearch: "",
      selectedCharacter: "レーテー",
      selectedFood: undefined,
    });
    expect(sanitizeFoodStorageState({ schemaVersion: 999 }, data)).toEqual({
      characterSearch: "",
      foodSearch: "",
    });

    localStorage.setItem(foodStorageKey, "not-json");
    expect(readFoodStorageState(data)).toEqual({ characterSearch: "", foodSearch: "" });
  });
});
