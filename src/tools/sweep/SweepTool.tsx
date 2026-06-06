import { ChevronLeft, ChevronRight, Filter, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import rawData from "./data.json";
import { getMaterialImagePath, getMaterialName } from "./materialNames";
import { buildStageData, createSweepPlan, getAlternativeStages, getMissingMaterials } from "./sweep";
import type { MaterialId, SweepData } from "./types";

const data = rawData as SweepData;
const materials = Object.keys(data);
const ranks = [1, 2, 3, 4, 5, 6, 7, 8];
const pageSize = 24;
const selectedStorageKey = "trickcal_sweep_selected_materials";
const rankStorageKey = "trickcal_sweep_rank_filter";

function readSelectedMaterials() {
  try {
    const value = localStorage.getItem(selectedStorageKey);
    const parsed = value ? JSON.parse(value) : [];
    return new Set<string>(Array.isArray(parsed) ? parsed.filter((material) => material in data) : []);
  } catch {
    return new Set<string>();
  }
}

function readSelectedRanks() {
  try {
    const value = localStorage.getItem(rankStorageKey);
    return new Set<number>(value ? JSON.parse(value) : ranks);
  } catch {
    return new Set<number>(ranks);
  }
}

export function SweepTool() {
  const { locale, t } = useI18n();
  const [selected, setSelected] = useState<Set<MaterialId>>(readSelectedMaterials);
  const [selectedRanks, setSelectedRanks] = useState<Set<number>>(readSelectedRanks);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const stageData = useMemo(() => buildStageData(data), []);
  const filteredMaterials = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return materials.filter((material) => {
      const rankMatches = selectedRanks.size === 0 || selectedRanks.has(data[material].rank);
      const queryMatches = !normalizedQuery || getMaterialName(material, locale).toLowerCase().includes(normalizedQuery);
      return rankMatches && queryMatches;
    });
  }, [locale, query, selectedRanks]);

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / pageSize));
  const visibleMaterials = filteredMaterials.slice((page - 1) * pageSize, page * pageSize);
  const plan = useMemo(() => createSweepPlan(selected, stageData), [selected, stageData]);
  const missingMaterials = useMemo(() => getMissingMaterials(selected, plan, stageData), [selected, plan, stageData]);
  const alternatives = useMemo(() => getAlternativeStages(plan, selected, data, stageData), [plan, selected, stageData]);

  function persistSelected(nextSelected: Set<MaterialId>) {
    setSelected(nextSelected);
    localStorage.setItem(selectedStorageKey, JSON.stringify(Array.from(nextSelected)));
  }

  function persistRanks(nextRanks: Set<number>) {
    setSelectedRanks(nextRanks);
    localStorage.setItem(rankStorageKey, JSON.stringify(Array.from(nextRanks).sort((a, b) => a - b)));
    setPage(1);
  }

  function toggleMaterial(material: MaterialId) {
    const nextSelected = new Set(selected);
    nextSelected.has(material) ? nextSelected.delete(material) : nextSelected.add(material);
    persistSelected(nextSelected);
  }

  function clearSelection() {
    persistSelected(new Set());
  }

  function toggleRank(rank: number) {
    const nextRanks = new Set(selectedRanks);
    nextRanks.has(rank) ? nextRanks.delete(rank) : nextRanks.add(rank);
    persistRanks(nextRanks);
  }

  function toggleAllRanks() {
    persistRanks(selectedRanks.size === ranks.length ? new Set() : new Set(ranks));
  }

  function handleQuery(nextQuery: string) {
    setQuery(nextQuery);
    setPage(1);
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
              <div className="pager" aria-label={t("sweep.pages")}>
                <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>
                  <ChevronLeft size={18} />
                </button>
                <span>{page} / {totalPages}</span>
                <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <label className="search-field">
            <Search size={18} />
            <input
              type="search"
              value={query}
              onChange={(event) => handleQuery(event.target.value)}
              placeholder={t("sweep.search.placeholder")}
            />
          </label>

          <button className="filter-toggle" type="button" onClick={() => setFiltersOpen((value) => !value)}>
            <Filter size={16} />
            <span>{t("sweep.rankFilter")}</span>
          </button>
          {filtersOpen ? (
            <div className="rank-options">
              <button className={selectedRanks.size === ranks.length ? "rank-option active" : "rank-option"} type="button" onClick={toggleAllRanks}>
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
          ) : null}

          <div className="catalog-grid">
            {visibleMaterials.map((material) => (
              <button
                className={selected.has(material) ? "material-card selected" : "material-card"}
                key={material}
                type="button"
                title={getMaterialName(material, locale)}
                onClick={() => toggleMaterial(material)}
              >
                <span className="material-rank">R{data[material].rank}</span>
                <img src={getMaterialImagePath(material, data[material].rank)} alt="" loading="lazy" onError={(event) => (event.currentTarget.style.display = "none")} />
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
                <span>{t("sweep.planSummary", { stamina: plan.length * 10 })}</span>
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
                            <button className="material-chip" key={material} type="button" onClick={() => toggleMaterial(material)} title={t("sweep.removeSelection")}>
                              <img src={getMaterialImagePath(material, data[material].rank)} alt="" onError={(event) => (event.currentTarget.style.display = "none")} />
                              <span>{getMaterialName(material, locale)}</span>
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
                                  <span>{alternative.materials.slice(0, 3).map((material) => getMaterialName(material, locale)).join(" / ")}</span>
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
