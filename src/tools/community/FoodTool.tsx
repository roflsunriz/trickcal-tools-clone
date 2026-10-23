import { Search, Utensils, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import rawData from "./data.json";
import { getPersonalityTone } from "./types";
import type { CommunityData, FoodPreference } from "./types";

const data = rawData as CommunityData;
type PreferenceLevel = keyof FoodPreference;
const levels: PreferenceLevel[] = ["veryLike", "like", "dislike"];
const rarityOrder = { common: 1, uncommon: 2, rare: 3, legendary: 4 } as const;

function assetPath(path: string) {
  return `${import.meta.env.BASE_URL}${path}`;
}

function preferenceForFood(preference: FoodPreference | undefined, food: string): PreferenceLevel | undefined {
  return levels.find((level) => preference?.[level].includes(food));
}

export function FoodTool() {
  const { t } = useI18n();
  const [characterSearch, setCharacterSearch] = useState("");
  const [foodSearch, setFoodSearch] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<string>();
  const [selectedFood, setSelectedFood] = useState<string>();
  const characterNames = useMemo(() => Object.keys(data.characters).sort((a, b) => a.localeCompare(b, "ja")), []);
  const foodNames = useMemo(
    () =>
      Object.keys(data.foods).sort((a, b) => {
        const rank = rarityOrder[data.foods[a].rarity] - rarityOrder[data.foods[b].rarity];
        return rank || a.localeCompare(b, "ja");
      }),
    [],
  );
  const selectedPreference = selectedCharacter ? data.foodPreferences[selectedCharacter] : undefined;

  const visibleCharacters = characterNames.filter((name) => {
    const matchesSearch = name.toLocaleLowerCase("ja").includes(characterSearch.trim().toLocaleLowerCase("ja"));
    return matchesSearch && (!selectedFood || preferenceForFood(data.foodPreferences[name], selectedFood));
  });
  const visibleFoods = foodNames.filter((food) => {
    const matchesSearch = food.toLocaleLowerCase("ja").includes(foodSearch.trim().toLocaleLowerCase("ja"));
    return matchesSearch && (!selectedCharacter || preferenceForFood(selectedPreference, food));
  });

  function chooseCharacter(name: string) {
    setSelectedCharacter(selectedCharacter === name ? undefined : name);
    setSelectedFood(undefined);
  }

  function chooseFood(food: string) {
    setSelectedFood(selectedFood === food ? undefined : food);
    setSelectedCharacter(undefined);
  }

  function clearSelection() {
    setSelectedCharacter(undefined);
    setSelectedFood(undefined);
  }

  return (
    <section className="community-root food-root">
      <div className="community-heading">
        <div>
          <h1>{t("food.heading.title")}</h1>
          <p>{t("food.heading.description")}</p>
        </div>
        {selectedCharacter || selectedFood ? (
          <button className="secondary-button" type="button" onClick={clearSelection}>
            <X size={17} />
            <span>{t("food.clear")}</span>
          </button>
        ) : null}
      </div>
      <div className="food-layout">
        <section className="panel food-panel">
          <div className="panel-header">
            <h2>{t("food.characters")}</h2>
            <span>{visibleCharacters.length}</span>
          </div>
          <label className="search-field">
            <Search size={18} />
            <input
              type="search"
              value={characterSearch}
              placeholder={t("food.searchCharacter")}
              onChange={(event) => setCharacterSearch(event.target.value)}
            />
          </label>
          <div className="food-card-grid character-food-grid">
            {visibleCharacters.map((name) => {
              const preference = selectedFood ? preferenceForFood(data.foodPreferences[name], selectedFood) : undefined;
              const character = data.characters[name];
              return (
                <button
                  className={`food-character-card personality-${getPersonalityTone(character.personality)}${selectedCharacter === name ? " selected" : ""}${preference ? ` preference-${preference}` : ""}`}
                  key={name}
                  type="button"
                  aria-pressed={selectedCharacter === name}
                  onClick={() => chooseCharacter(name)}
                >
                  <span className="community-character-image food-character-image">
                    <img
                      src={assetPath(character.image.path)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={(event) => event.currentTarget.parentElement?.classList.add("image-error")}
                    />
                    <span className="character-avatar-fallback">{name.slice(0, 1)}</span>
                  </span>
                  <strong>{name}</strong>
                  <small>{character.personality}</small>
                  {preference ? <span className="preference-badge">{t(`food.preference.${preference}`)}</span> : null}
                  {!data.foodPreferences[name] ? (
                    <span className="unconfirmed-badge">{t("food.unconfirmed")}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
        <section className="panel food-panel">
          <div className="panel-header">
            <h2>{t("food.foods")}</h2>
            <span>{visibleFoods.length}</span>
          </div>
          <label className="search-field">
            <Search size={18} />
            <input
              type="search"
              value={foodSearch}
              placeholder={t("food.searchFood")}
              onChange={(event) => setFoodSearch(event.target.value)}
            />
          </label>
          {selectedCharacter && !selectedPreference ? <div className="empty-state">{t("food.noData")}</div> : null}
          <div className="food-card-grid">
            {visibleFoods.map((food) => {
              const preference = selectedCharacter ? preferenceForFood(selectedPreference, food) : undefined;
              return (
                <button
                  className={`food-card${selectedFood === food ? " selected" : ""}${preference ? ` preference-${preference}` : ""}`}
                  key={food}
                  type="button"
                  aria-pressed={selectedFood === food}
                  onClick={() => chooseFood(food)}
                >
                  <span className={`food-symbol rarity-${data.foods[food].rarity}`}>
                    <img
                      src={assetPath(data.foods[food].image.path)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      style={{ left: data.foods[food].image.left, top: data.foods[food].image.top }}
                      onError={(event) => event.currentTarget.parentElement?.classList.add("image-error")}
                    />
                    <Utensils className="food-image-fallback" size={23} />
                  </span>
                  <strong>{food}</strong>
                  <small>{t(`food.rarity.${data.foods[food].rarity}`)}</small>
                  {preference ? <span className="preference-badge">{t(`food.preference.${preference}`)}</span> : null}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}
