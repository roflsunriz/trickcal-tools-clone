import type { BoardCellType, BoardLayer, CommunityCharacter } from "./types";

const schemaVersion = 1;
export const communityStorageKey = "trickcal_community_state";

export type CommunityStorageState = {
  ownedCharacters: Set<string>;
  activatedCells: Set<string>;
};

export function boardCellKey(name: string, layer: BoardLayer, type: BoardCellType) {
  return `${name}|${layer}|${type}`;
}

function validCellKeys(characters: Record<string, CommunityCharacter>) {
  const keys = new Set<string>();
  for (const character of Object.values(characters)) {
    for (const layer of ["layer1", "layer2", "layer3"] as const) {
      for (const type of character.boardTypes[layer]) keys.add(boardCellKey(character.name, layer, type));
    }
  }
  return keys;
}

export function sanitizeCommunityStorageState(
  value: unknown,
  characters: Record<string, CommunityCharacter>,
): CommunityStorageState {
  const empty = { ownedCharacters: new Set<string>(), activatedCells: new Set<string>() };
  if (!value || typeof value !== "object" || Array.isArray(value)) return empty;
  const candidate = value as Record<string, unknown>;
  if (candidate.schemaVersion !== schemaVersion) return empty;
  const characterNames = new Set(Object.keys(characters));
  const cells = validCellKeys(characters);
  return {
    ownedCharacters: new Set(
      Array.isArray(candidate.ownedCharacters)
        ? candidate.ownedCharacters.filter(
            (name): name is string => typeof name === "string" && characterNames.has(name),
          )
        : [],
    ),
    activatedCells: new Set(
      Array.isArray(candidate.activatedCells)
        ? candidate.activatedCells.filter((key): key is string => typeof key === "string" && cells.has(key))
        : [],
    ),
  };
}

export function readCommunityStorageState(characters: Record<string, CommunityCharacter>): CommunityStorageState {
  try {
    const value = localStorage.getItem(communityStorageKey);
    return sanitizeCommunityStorageState(value ? JSON.parse(value) : null, characters);
  } catch {
    return { ownedCharacters: new Set(), activatedCells: new Set() };
  }
}

export function writeCommunityStorageState(state: CommunityStorageState) {
  localStorage.setItem(
    communityStorageKey,
    JSON.stringify({
      schemaVersion,
      ownedCharacters: [...state.ownedCharacters].sort((a, b) => a.localeCompare(b, "ja")),
      activatedCells: [...state.activatedCells].sort(),
    }),
  );
}
