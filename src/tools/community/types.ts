export const boardCellTypes = ["attack", "crit", "hp", "critResist", "defense"] as const;
export const personalityTones = {
  純粋: "pure",
  活発: "lively",
  冷静: "calm",
  憂鬱: "gloomy",
  狂気: "mad",
  裏面: "reverse",
} as const;

export type BoardCellType = (typeof boardCellTypes)[number];
export type BoardLayer = "layer1" | "layer2" | "layer3";
export type FoodRarity = "common" | "uncommon" | "rare" | "legendary";
export type PersonalityTone = (typeof personalityTones)[keyof typeof personalityTones] | "neutral";

export function getPersonalityTone(personality: string): PersonalityTone {
  return personalityTones[personality as keyof typeof personalityTones] ?? "neutral";
}

export type CommunityCharacter = {
  name: string;
  personality: string;
  race: string;
  deployRow: string;
  image: {
    path: string;
    sourceUrl: string;
  };
  boardTypes: Record<BoardLayer, BoardCellType[]>;
};

export type CommunityFoodImage = {
  path: string;
  sourceUrl: string;
  left: number;
  top: number;
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
  foods: Record<string, { rarity: FoodRarity; image: CommunityFoodImage }>;
  foodPreferences: Record<string, FoodPreference>;
};
