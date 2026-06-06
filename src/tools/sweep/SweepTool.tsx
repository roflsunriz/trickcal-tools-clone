import { Search, Shield, Sparkles, Swords, WandSparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import rawData from "./data.json";
import { getMaterialImagePath, getMaterialName } from "./materialNames";
import {
  buildEquipmentRequirements,
  getDefaultMaterialCount,
  quickRanks,
  requiredEquipmentRanks,
} from "./quickEquipment";
import { readSweepStorageState, writeSweepStorageState } from "./storage";
import { buildStageData, createSweepPlan, getAlternativeStages, getMissingMaterials } from "./sweep";
import type { MaterialId, SweepData } from "./types";
import type { WeaponType } from "./quickEquipment";

const data = rawData as SweepData;
const materials = Object.keys(data);
const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function SweepTool() {
  const { locale, t } = useI18n();
  const [initialStorageState] = useState(() => readSweepStorageState(data, ranks));
  const [selectedQuantities, setSelectedQuantities] = useState<Map<MaterialId, number>>(
    initialStorageState.selectedQuantities,
  );
  const [selectedRanks, setSelectedRanks] = useState<Set<number>>(initialStorageState.selectedRanks);
  const [query, setQuery] = useState("");
  const [weaponType, setWeaponType] = useState<WeaponType>("physical");

  const stageData = useMemo(() => buildStageData(data), []);
  const selected = useMemo(() => new Set(selectedQuantities.keys()), [selectedQuantities]);
  const filteredMaterials = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return materials.filter((material) => {
      const rankMatches = selectedRanks.size === 0 || selectedRanks.has(data[material].rank);
      const queryMatches =
        !normalizedQuery || getMaterialName(material, locale).toLowerCase().includes(normalizedQuery);
      return rankMatches && queryMatches;
    });
  }, [locale, query, selectedRanks]);

  const plan = useMemo(() => createSweepPlan(selected, stageData), [selected, stageData]);
  const missingMaterials = useMemo(() => getMissingMaterials(selected, plan, stageData), [selected, plan, stageData]);
  const requiredMaterialCount = useMemo(
    () => Array.from(selectedQuantities.values()).reduce((total, quantity) => total + quantity, 0),
    [selectedQuantities],
  );
  const estimatedStamina = requiredMaterialCount * 10;
  const alternatives = useMemo(
    () => getAlternativeStages(plan, selected, data, stageData),
    [plan, selected, stageData],
  );

  function persistSelected(nextSelectedQuantities: Map<MaterialId, number>) {
    setSelectedQuantities(nextSelectedQuantities);
    writeSweepStorageState({ selectedQuantities: nextSelectedQuantities, selectedRanks });
  }

  function persistRanks(nextRanks: Set<number>) {
    setSelectedRanks(nextRanks);
    writeSweepStorageState({ selectedQuantities, selectedRanks: nextRanks });
  }

  function toggleMaterial(material: MaterialId) {
    const nextSelectedQuantities = new Map(selectedQuantities);
    if (nextSelectedQuantities.has(material)) {
      nextSelectedQuantities.delete(material);
    } else {
      nextSelectedQuantities.set(material, getDefaultMaterialCount(data[material].rank));
    }
    persistSelected(nextSelectedQuantities);
  }

  function clearSelection() {
    persistSelected(new Map());
  }

  function toggleRank(rank: number) {
    const nextRanks = new Set(selectedRanks);
    if (nextRanks.has(rank)) {
      nextRanks.delete(rank);
    } else {
      nextRanks.add(rank);
    }
    persistRanks(nextRanks);
  }

  function toggleAllRanks() {
    persistRanks(selectedRanks.size === ranks.length ? new Set() : new Set(ranks));
  }

  function selectEquipmentSet(rank: number) {
    const nextSelectedQuantities = new Map(Object.entries(buildEquipmentRequirements(rank, weaponType, data)));
    const nextRanks = new Set(requiredEquipmentRanks(rank));
    setSelectedQuantities(nextSelectedQuantities);
    setSelectedRanks(nextRanks);
    writeSweepStorageState({ selectedQuantities: nextSelectedQuantities, selectedRanks: nextRanks });
    setQuery("");
  }

  return (
    <section className="sweep-root">
      <div className="sweep-heading">
        <div>
          <h1>{t("sweep.heading.title")}</h1>
          <p>{t("sweep.heading.description")}</p>
        </div>
        <div className="selection-count">{t("sweep.selectionCount", { count: selected.size })}</div>
      </div>

      <div className="sweep-layout">
        <section className="panel catalog-panel" aria-label={t("sweep.catalog.aria")}>
          <div className="panel-header">
            <h2>{t("sweep.catalog.title")}</h2>
            <div className="header-actions">
              <button className="secondary-button" type="button" onClick={clearSelection}>
                <X size={16} />
                <span>{t("sweep.clear")}</span>
              </button>
            </div>
          </div>

          <label className="search-field">
            <Search size={18} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("sweep.search.placeholder")}
            />
          </label>

          <div className="rank-options">
            <button
              className={selectedRanks.size === ranks.length ? "rank-option active" : "rank-option"}
              type="button"
              onClick={toggleAllRanks}
            >
              {t("sweep.allRanks")}
            </button>
            {ranks.map((rank) => (
              <button
                className={selectedRanks.has(rank) ? "rank-option active" : "rank-option"}
                key={rank}
                type="button"
                onClick={() => toggleRank(rank)}
              >
                Rank {rank}
              </button>
            ))}
          </div>

          <section className="quick-select" aria-label={t("sweep.quickSelect.title")}>
            <div className="quick-select-header">
              <h3>{t("sweep.quickSelect.title")}</h3>
              <Shield size={16} />
            </div>
            <div className="quick-select-row">
              <span className="quick-select-label">{t("sweep.weaponType")}</span>
              <div className="segmented-control">
                <button
                  className={weaponType === "physical" ? "segment active" : "segment"}
                  type="button"
                  onClick={() => setWeaponType("physical")}
                >
                  <Swords size={16} />
                  <span>{t("sweep.physicalWeapon")}</span>
                </button>
                <button
                  className={weaponType === "magic" ? "segment active" : "segment"}
                  type="button"
                  onClick={() => setWeaponType("magic")}
                >
                  <WandSparkles size={16} />
                  <span>{t("sweep.magicWeapon")}</span>
                </button>
              </div>
            </div>
            <div className="quick-select-row">
              <span className="quick-select-label">{t("sweep.requiredRanks")}</span>
              <div className="quick-rank-grid">
                {quickRanks.map((rank) => (
                  <button
                    className="quick-rank-button"
                    key={rank}
                    type="button"
                    title={t("sweep.quickRankTitle", { rank })}
                    onClick={() => selectEquipmentSet(rank)}
                  >
                    <Sparkles size={15} />
                    <span>{t("sweep.quickRank", { rank })}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="catalog-grid">
            {filteredMaterials.map((material) => (
              <button
                className={selected.has(material) ? "material-card selected" : "material-card"}
                key={material}
                type="button"
                title={getMaterialName(material, locale)}
                onClick={() => toggleMaterial(material)}
              >
                <span className="material-rank">R{data[material].rank}</span>
                <img
                  src={getMaterialImagePath(material, data[material].rank)}
                  alt=""
                  loading="lazy"
                  onError={(event) => (event.currentTarget.style.display = "none")}
                />
                <span>{getMaterialName(material, locale)}</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="panel plan-panel" aria-label={t("sweep.plan.aria")}>
          <div className="panel-header">
            <h2>{t("sweep.plan.title")}</h2>
          </div>

          {selected.size === 0 ? (
            <div className="empty-state">{t("sweep.empty")}</div>
          ) : (
            <>
              <div className="plan-summary">
                <strong>{plan.length}</strong>
                <span>{t("sweep.planSummary", { stamina: estimatedStamina })}</span>
              </div>

              {missingMaterials.length > 0 ? (
                <div className="warning">{t("sweep.missing", { count: missingMaterials.length })}</div>
              ) : null}

              <ul className="stage-list">
                {plan.map((stage) => {
                  const matched = stageData[stage].filter((material) => selected.has(material));
                  const stageAlternatives = alternatives.get(stage) ?? [];
                  return (
                    <li className="stage-item" key={stage}>
                      <details open>
                        <summary>
                          <span>{stage}</span>
                          <small>{t("sweep.stageStamina")}</small>
                        </summary>
                        <div className="chip-list">
                          {matched.map((material) => (
                            <button
                              className="material-chip"
                              key={material}
                              type="button"
                              onClick={() => toggleMaterial(material)}
                              title={getMaterialName(material, locale)}
                            >
                              <img
                                src={getMaterialImagePath(material, data[material].rank)}
                                alt=""
                                onError={(event) => (event.currentTarget.style.display = "none")}
                              />
                              <span>{getMaterialName(material, locale)}</span>
                              <span className="material-quantity">x{selectedQuantities.get(material) ?? 1}</span>
                            </button>
                          ))}
                        </div>
                        {stageAlternatives.length > 0 ? (
                          <div className="alternatives">
                            <h3>{t("sweep.alternatives")}</h3>
                            <div className="alternative-list">
                              {stageAlternatives.slice(0, 8).map((alternative) => (
                                <div className="alternative-item" key={alternative.stage}>
                                  <strong>{alternative.stage}</strong>
                                  <div className="alternative-materials">
                                    {alternative.materials.slice(0, 3).map((material) => (
                                      <span
                                        className="alternative-material"
                                        key={material}
                                        title={getMaterialName(material, locale)}
                                      >
                                        <img
                                          src={getMaterialImagePath(material, data[material].rank)}
                                          alt=""
                                          onError={(event) => (event.currentTarget.style.display = "none")}
                                        />
                                        <span>{getMaterialName(material, locale)}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </details>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
