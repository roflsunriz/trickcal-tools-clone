export const boardCellTypes = ["attack", "crit", "hp", "critResist", "defense"] as const;

export type BoardCellType = (typeof boardCellTypes)[number];
export type BoardLayer = "layer1" | "layer2" | "layer3";
export type FoodRarity = "common" | "uncommon" | "rare" | "legendary";

export type CommunityCharacter = {
  name: string;
  personality: string;
  race: string;
  deployRow: string;
  boardTypes: Record<BoardLayer, BoardCellType[]>;
};

export type FoodPreference = {
  veryLike: string[];
  like: string[];
  dislike: string[];
};

export type CommunityData = {
  schemaVersion: 1;
  sources: {
    board: { url: string; sha256: string };
    food: { url: string; sha256: string; lastModified: string };
  };
  boardConfig: Record<BoardLayer, { bonusPerCell: number; crayonsPerCell: number }>;
  characters: Record<string, CommunityCharacter>;
  foods: Record<string, { rarity: FoodRarity }>;
  foodPreferences: Record<string, FoodPreference>;
};
