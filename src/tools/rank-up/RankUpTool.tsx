import { ExternalLink, Info, Swords, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import rawData from "../sweep/data.json";
import { getMaterialImagePath, getMaterialName } from "../sweep/materialNames";
import type { WeaponType } from "../sweep/quickEquipment";
import type { SweepData } from "../sweep/types";
import { createRankUpPlan, estimatedDropRate } from "./rankPlan";
import "./rank-up.css";

const data = rawData as SweepData;
const equipmentWikiUrl = "https://wikiwiki.jp/thetrickal/%E8%A3%85%E5%82%99%E8%A8%AD%E8%A8%88%E5%9B%B3";

export function RankUpTool() {
  const { locale, t } = useI18n();
  const [weaponType, setWeaponType] = useState<WeaponType>("physical");
  const plan = useMemo(() => createRankUpPlan(weaponType, data), [weaponType]);
  const ranks = useMemo(() => [...new Set(plan.stages.map((stage) => stage.rank))], [plan.stages]);

  return (
    <section className="rank-up-root">
      <div className="sweep-heading">
        <div>
          <h1>{t("rankUp.heading.title")}</h1>
          <p>{t("rankUp.heading.description")}</p>
        </div>
      </div>

      <section className="panel rank-up-controls" aria-label={t("rankUp.settings.aria")}>
        <div className="rank-up-control-row">
          <div>
            <h2>{t("rankUp.settings.title")}</h2>
            <p>{t("rankUp.settings.description")}</p>
          </div>
          <div className="segmented-control rank-up-weapon-switch">
            <button
              className={weaponType === "physical" ? "segment active" : "segment"}
              type="button"
              aria-pressed={weaponType === "physical"}
              onClick={() => setWeaponType("physical")}
            >
              <Swords size={18} />
              <span>{t("sweep.physicalWeapon")}</span>
            </button>
            <button
              className={weaponType === "magic" ? "segment active" : "segment"}
              type="button"
              aria-pressed={weaponType === "magic"}
              onClick={() => setWeaponType("magic")}
            >
              <WandSparkles size={18} />
              <span>{t("sweep.magicWeapon")}</span>
            </button>
          </div>
        </div>

        <div className="rank-up-summary">
          <div className="rank-up-summary-card">
            <span>{t("rankUp.summary.recommended")}</span>
            <strong>{t("rankUp.runs", { count: plan.totalRecommendedRuns })}</strong>
          </div>
          <div className="rank-up-summary-card">
            <span>{t("rankUp.summary.stamina")}</span>
            <strong>{plan.totalRecommendedStamina.toLocaleString(locale)}</strong>
          </div>
          <div className="rank-up-summary-card">
            <span>{t("rankUp.summary.minimum")}</span>
            <strong>{t("rankUp.runs", { count: plan.totalMinimumRuns })}</strong>
          </div>
        </div>

        <div className="rank-up-notes">
          <p>
            <Info size={18} aria-hidden="true" />
            <span>{t("rankUp.rankTwoNote")}</span>
          </p>
          <p>{t("rankUp.dropRateNote", { rate: Math.round(estimatedDropRate * 100) })}</p>
          <a href={equipmentWikiUrl} target="_blank" rel="noreferrer">
            {t("rankUp.source")}
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="rank-up-plan" aria-label={t("rankUp.plan.aria")}>
        <div className="rank-up-plan-heading">
          <h2>{t("rankUp.plan.title")}</h2>
          <span>{t("rankUp.plan.checkInventory")}</span>
        </div>

        {ranks.map((rank) => {
          const rankStages = plan.stages.filter((stage) => stage.rank === rank);
          const materialQuantity = rankStages[0]?.materialQuantity ?? 0;
          return (
            <section className="panel rank-plan-section" key={rank}>
              <div className="rank-plan-heading">
                <h3>Rank {rank}</h3>
                <span>{t("rankUp.materialQuantity", { count: materialQuantity })}</span>
              </div>
              <div className="rank-plan-grid">
                {rankStages.map((stage) => (
                  <article className="rank-stage-card" key={`${rank}-${stage.stage}`}>
                    <div className="rank-stage-header">
                      <strong>{stage.stage}</strong>
                      <span>{t("rankUp.runs", { count: stage.recommendedRuns })}</span>
                    </div>
                    <div className="rank-stage-materials">
                      {stage.materials.map((material) => (
                        <div className="rank-stage-material" key={material}>
                          <img src={getMaterialImagePath(material, data[material].rank)} alt="" />
                          <span>{getMaterialName(material, locale)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rank-stage-detail">
                      <span>
                        {t("rankUp.runRange", {
                          minimum: stage.optimisticRuns,
                          maximum: stage.conservativeRuns,
                        })}
                      </span>
                      <span>{t("rankUp.minimumRuns", { count: stage.minimumRuns })}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </section>
  );
}
