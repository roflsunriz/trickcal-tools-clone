import { Check, CircleOff, Paintbrush, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import rawData from "./data.json";
import { boardCellKey, readCommunityStorageState, writeCommunityStorageState } from "./storage";
import { boardCellTypes, getPersonalityTone } from "./types";
import type { BoardCellType, BoardLayer, CommunityData } from "./types";

const data = rawData as CommunityData;
const layers: BoardLayer[] = ["layer1", "layer2", "layer3"];

function assetPath(path: string) {
  return `${import.meta.env.BASE_URL}${path}`;
}

export function BoardTool() {
  const { t } = useI18n();
  const [layer, setLayer] = useState<BoardLayer>("layer1");
  const [cellType, setCellType] = useState<BoardCellType>("attack");
  const [state, setState] = useState(() => readCommunityStorageState(data.characters));
  const characters = useMemo(
    () => Object.values(data.characters).sort((a, b) => a.name.localeCompare(b.name, "ja")),
    [],
  );
  const visibleCharacters = useMemo(
    () => characters.filter((character) => character.boardTypes[layer].includes(cellType)),
    [cellType, characters, layer],
  );

  const layerStats = useMemo(() => {
    const byType = Object.fromEntries(
      boardCellTypes.map((type) => {
        const eligible = characters.filter((character) => character.boardTypes[layer].includes(type));
        const activated = eligible.filter((character) =>
          state.activatedCells.has(boardCellKey(character.name, layer, type)),
        ).length;
        return [type, { total: eligible.length, activated }];
      }),
    ) as Record<BoardCellType, { total: number; activated: number }>;
    const total = Object.values(byType).reduce((sum, detail) => sum + detail.total, 0);
    const activated = Object.values(byType).reduce((sum, detail) => sum + detail.activated, 0);
    return { byType, total, activated };
  }, [characters, layer, state.activatedCells]);

  const allCells = characters.flatMap((character) =>
    layers.flatMap((itemLayer) =>
      character.boardTypes[itemLayer].map((type) => ({
        key: boardCellKey(character.name, itemLayer, type),
        layer: itemLayer,
      })),
    ),
  );
  const currentCrayons = characters.reduce(
    (sum, character) =>
      sum +
      character.boardTypes[layer].filter((type) => !state.activatedCells.has(boardCellKey(character.name, layer, type)))
        .length *
        data.boardConfig[layer].crayonsPerCell,
    0,
  );
  const allCrayons = allCells.reduce(
    (sum, cell) => sum + (state.activatedCells.has(cell.key) ? 0 : data.boardConfig[cell.layer].crayonsPerCell),
    0,
  );

  function updateState(nextState: typeof state) {
    setState(nextState);
    writeCommunityStorageState(nextState);
  }

  function toggleOwned(name: string) {
    const ownedCharacters = new Set(state.ownedCharacters);
    if (ownedCharacters.has(name)) ownedCharacters.delete(name);
    else ownedCharacters.add(name);
    updateState({ ...state, ownedCharacters });
  }

  function toggleCell(name: string) {
    const activatedCells = new Set(state.activatedCells);
    const key = boardCellKey(name, layer, cellType);
    if (activatedCells.has(key)) activatedCells.delete(key);
    else activatedCells.add(key);
    updateState({ ...state, activatedCells });
  }

  function resetBoard() {
    if (!window.confirm(t("board.resetConfirm"))) return;
    updateState({ ownedCharacters: new Set(), activatedCells: new Set() });
  }

  const completionRate = layerStats.total ? Math.round((layerStats.activated / layerStats.total) * 100) : 0;
  const layerBonus = layerStats.activated * data.boardConfig[layer].bonusPerCell;
  const totalActivated = state.activatedCells.size;
  const totalBonus = allCells.reduce(
    (sum, cell) => sum + (state.activatedCells.has(cell.key) ? data.boardConfig[cell.layer].bonusPerCell : 0),
    0,
  );

  return (
    <section className="community-root board-root">
      <div className="community-heading">
        <div>
          <h1>{t("board.heading.title")}</h1>
          <p>{t("board.heading.description")}</p>
        </div>
        <button className="secondary-button" type="button" onClick={resetBoard}>
          <CircleOff size={17} />
          <span>{t("board.reset")}</span>
        </button>
      </div>

      <div className="board-dashboard">
        <aside className="panel board-summary-panel">
          <div className="layer-tabs" aria-label={t("board.layers")}>
            {layers.map((itemLayer, index) => (
              <button
                className={layer === itemLayer ? "rank-option active" : "rank-option"}
                key={itemLayer}
                type="button"
                aria-pressed={layer === itemLayer}
                onClick={() => setLayer(itemLayer)}
              >
                {t("board.layer", { layer: index + 1 })}
              </button>
            ))}
          </div>
          <div
            className="board-progress-ring"
            style={{ "--progress": `${completionRate * 3.6}deg` } as React.CSSProperties}
          >
            <strong>{completionRate}%</strong>
          </div>
          <div className="board-summary-numbers">
            <span>{t("board.activated")}</span>
            <strong>
              {layerStats.activated} / {layerStats.total}
            </strong>
            <span>{t("board.layerBonus")}</span>
            <strong>+{layerBonus}%</strong>
          </div>
          <div className="board-breakdown">
            {boardCellTypes.map((type) => {
              const detail = layerStats.byType[type];
              return (
                <button type="button" key={type} onClick={() => setCellType(type)}>
                  <span>{t(`board.cell.${type}`)}</span>
                  <strong>
                    {detail.activated}/{detail.total}
                  </strong>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="panel board-main-panel">
          <div className="panel-header board-panel-header">
            <div>
              <h2>{t("board.layer", { layer: layers.indexOf(layer) + 1 })}</h2>
              <span>{t("board.characterCount", { count: characters.length })}</span>
            </div>
            <div className="board-cost-chip">
              <Paintbrush size={17} />
              {t("board.cellCost", { count: data.boardConfig[layer].crayonsPerCell })}
            </div>
          </div>
          <div className="board-type-tabs">
            {boardCellTypes.map((type) => (
              <button
                className={cellType === type ? "segment active" : "segment"}
                key={type}
                type="button"
                aria-pressed={cellType === type}
                onClick={() => setCellType(type)}
              >
                {t(`board.cell.${type}`)}
              </button>
            ))}
          </div>
          <div className="board-character-grid">
            {visibleCharacters.map((character) => {
              const active = state.activatedCells.has(boardCellKey(character.name, layer, cellType));
              const owned = state.ownedCharacters.has(character.name);
              return (
                <article
                  className={`board-character-card personality-${getPersonalityTone(character.personality)}${active ? " active" : ""}`}
                  key={character.name}
                >
                  <button
                    className="board-character-main"
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleCell(character.name)}
                  >
                    <span className="community-character-image">
                      <img
                        src={assetPath(character.image.path)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={(event) => event.currentTarget.parentElement?.classList.add("image-error")}
                      />
                      <span className="character-avatar-fallback">{character.name.slice(0, 1)}</span>
                    </span>
                    <span className="board-character-info">
                      <strong>{character.name}</strong>
                      <small>
                        {character.personality} · {character.race} · {character.deployRow}
                      </small>
                    </span>
                    {active ? <Check size={19} /> : null}
                  </button>
                  <button
                    className={owned ? "owned-toggle active" : "owned-toggle"}
                    type="button"
                    aria-pressed={owned}
                    onClick={() => toggleOwned(character.name)}
                  >
                    <UserCheck size={15} />
                    {owned ? t("board.owned") : t("board.notOwned")}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="panel board-insight-panel">
          <h2>{t("board.overview")}</h2>
          <dl className="board-overview-list">
            <div>
              <dt>{t("board.ownedCharacters")}</dt>
              <dd>
                {state.ownedCharacters.size} / {characters.length}
              </dd>
            </div>
            <div>
              <dt>{t("board.allActivated")}</dt>
              <dd>
                {totalActivated} / {allCells.length}
              </dd>
            </div>
            <div>
              <dt>{t("board.allBonus")}</dt>
              <dd>+{totalBonus}%</dd>
            </div>
          </dl>
          <h2>{t("board.resources")}</h2>
          <dl className="board-overview-list crayon-requirements">
            <div>
              <dt>{t("board.currentNeeded")}</dt>
              <dd>{currentCrayons}</dd>
            </div>
            <div>
              <dt>{t("board.allNeeded")}</dt>
              <dd>{allCrayons}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
