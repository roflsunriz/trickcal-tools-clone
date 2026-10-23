import { Search, Shield, Sparkles, Swords, WandSparkles, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
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
  const [weaponType, setWeaponType] = useState<WeaponType>(initialStorageState.weaponType);
  const [selectedQuickRank, setSelectedQuickRank] = useState<number | null>(initialStorageState.selectedQuickRank);
  const weaponTypeRef = useRef(initialStorageState.weaponType);
  const selectedQuickRankRef = useRef(initialStorageState.selectedQuickRank);

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
    setSelectedQuickRank(null);
    selectedQuickRankRef.current = null;
    writeSweepStorageState({
      selectedQuantities: nextSelectedQuantities,
      selectedRanks,
      weaponType: weaponTypeRef.current,
      selectedQuickRank: null,
    });
  }

  function persistRanks(nextRanks: Set<number>) {
    setSelectedRanks(nextRanks);
    writeSweepStorageState({
      selectedQuantities,
      selectedRanks: nextRanks,
      weaponType: weaponTypeRef.current,
      selectedQuickRank: selectedQuickRankRef.current,
    });
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

  function selectWeaponType(nextWeaponType: WeaponType) {
    setWeaponType(nextWeaponType);
    weaponTypeRef.current = nextWeaponType;
    if (selectedQuickRankRef.current === null) {
      writeSweepStorageState({
        selectedQuantities,
        selectedRanks,
        weaponType: nextWeaponType,
        selectedQuickRank: null,
      });
      return;
    }

    selectEquipmentSet(selectedQuickRankRef.current, nextWeaponType);
  }

  function selectEquipmentSet(rank: number, nextWeaponType = weaponTypeRef.current) {
    const nextSelectedQuantities = new Map(Object.entries(buildEquipmentRequirements(rank, nextWeaponType, data)));
    const nextRanks = new Set(requiredEquipmentRanks(rank));
    setSelectedQuantities(nextSelectedQuantities);
    setSelectedRanks(nextRanks);
    setSelectedQuickRank(rank);
    selectedQuickRankRef.current = rank;
    writeSweepStorageState({
      selectedQuantities: nextSelectedQuantities,
      selectedRanks: nextRanks,
      weaponType: nextWeaponType,
      selectedQuickRank: rank,
    });
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
                  aria-pressed={weaponType === "physical"}
                  onClick={() => selectWeaponType("physical")}
                >
                  <Swords size={16} />
                  <span>{t("sweep.physicalWeapon")}</span>
                </button>
                <button
                  className={weaponType === "magic" ? "segment active" : "segment"}
                  type="button"
                  aria-pressed={weaponType === "magic"}
                  onClick={() => selectWeaponType("magic")}
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
                    className={selectedQuickRank === rank ? "quick-rank-button active" : "quick-rank-button"}
                    key={rank}
                    type="button"
                    title={t("sweep.quickRankTitle", { rank })}
                    aria-pressed={selectedQuickRank === rank}
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
            <div className="plan-content">
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
                      <div className="stage-item-header">
                        <strong>{stage}</strong>
                        <small>{t("sweep.stageStamina")}</small>
                      </div>
                      <div className="plan-material-list">
                        {matched.map((material) => (
                          <button
                            className="plan-material"
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
                        <details className="alternatives">
                          <summary>
                            <span>{t("sweep.alternatives")}</span>
                            <span className="alternative-count">{stageAlternatives.length}</span>
                          </summary>
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
                        </details>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
