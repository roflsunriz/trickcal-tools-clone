import { markCloudStateChanged } from "../../cloud/storage";
import type { CommunityData } from "./types";

const schemaVersion = 1;
const maximumSearchLength = 500;
export const foodStorageKey = "trickcal_food_state";

type FoodData = Pick<CommunityData, "characters" | "foods">;

export type FoodStorageState = {
  characterSearch: string;
  foodSearch: string;
  selectedCharacter?: string;
  selectedFood?: string;
};

function emptyFoodStorageState(): FoodStorageState {
  return { characterSearch: "", foodSearch: "" };
}

function sanitizedSearch(value: unknown) {
  return typeof value === "string" ? value.slice(0, maximumSearchLength) : "";
}

export function sanitizeFoodStorageState(value: unknown, data: FoodData): FoodStorageState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return emptyFoodStorageState();
  const candidate = value as Record<string, unknown>;
  if (candidate.schemaVersion !== schemaVersion) return emptyFoodStorageState();

  const selectedCharacter =
    typeof candidate.selectedCharacter === "string" && candidate.selectedCharacter in data.characters
      ? candidate.selectedCharacter
      : undefined;
  const selectedFood =
    !selectedCharacter && typeof candidate.selectedFood === "string" && candidate.selectedFood in data.foods
      ? candidate.selectedFood
      : undefined;

  return {
    characterSearch: sanitizedSearch(candidate.characterSearch),
    foodSearch: sanitizedSearch(candidate.foodSearch),
    selectedCharacter,
    selectedFood,
  };
}

export function readFoodStorageState(data: FoodData): FoodStorageState {
  try {
    const value = localStorage.getItem(foodStorageKey);
    return sanitizeFoodStorageState(value ? JSON.parse(value) : null, data);
  } catch {
    return emptyFoodStorageState();
  }
}

export function writeFoodStorageState(state: FoodStorageState) {
  localStorage.setItem(
    foodStorageKey,
    JSON.stringify({
      schemaVersion,
      characterSearch: state.characterSearch.slice(0, maximumSearchLength),
      foodSearch: state.foodSearch.slice(0, maximumSearchLength),
      selectedCharacter: state.selectedCharacter ?? null,
      selectedFood: state.selectedCharacter ? null : (state.selectedFood ?? null),
    }),
  );
  markCloudStateChanged();
}
