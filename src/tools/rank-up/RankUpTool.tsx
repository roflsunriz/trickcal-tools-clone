import { Clock3, ExternalLink, Info, Swords, UserRound, Users, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import communityData from "../community/data.json";
import type { CommunityData } from "../community/types";
import rawData from "../sweep/data.json";
import { getMaterialImagePath, getMaterialName } from "../sweep/materialNames";
import type { WeaponType } from "../sweep/quickEquipment";
import type { SweepData } from "../sweep/types";
import {
  calculateCandyIncome,
  daysForCandy,
  defaultCandyIncomeSettings,
  eliefPurchaseOptions,
  maximumOfferingResearchStage,
  subscriptionCandyPerTerm,
  totalCandyForApostles,
} from "./candy";
import { createRankUpPlan, estimatedDropRate } from "./rankPlan";
import "./rank-up.css";

const data = rawData as SweepData;
const community = communityData as CommunityData;
const equipmentWikiUrl = "https://wikiwiki.jp/thetrickal/%E8%A3%85%E5%82%99%E8%A8%AD%E8%A8%88%E5%9B%B3";
const shrineWikiUrl = "https://wikiwiki.jp/thetrickal/%E6%95%99%E5%9B%A3%E6%9C%AC%E9%83%A8";
const candyWikiUrl =
  "https://wikiwiki.jp/thetrickal/%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E8%82%B2%E6%88%90";
const premiumShopWikiUrl =
  "https://wikiwiki.jp/thetrickal/%E3%83%97%E3%83%AC%E3%83%9F%E3%82%A2%E3%83%A0%E3%82%B7%E3%83%A7%E3%83%83%E3%83%97";

const apostleCounts = Object.values(community.characters).reduce(
  (counts, character) => ({ ...counts, [character.attackType]: counts[character.attackType] + 1 }),
  { physical: 0, magic: 0 },
);

export function RankUpTool() {
  const { locale, t } = useI18n();
  const [weaponType, setWeaponType] = useState<WeaponType>("physical");
  const [candySettings, setCandySettings] = useState(defaultCandyIncomeSettings);
  const plans = useMemo(
    () => ({ physical: createRankUpPlan("physical", data), magic: createRankUpPlan("magic", data) }),
    [],
  );
  const plan = plans[weaponType];
  const ranks = useMemo(() => [...new Set(plan.stages.map((stage) => stage.rank))], [plan.stages]);
  const candyIncome = useMemo(() => calculateCandyIncome(candySettings), [candySettings]);
  const allApostlesCandy = useMemo(
    () =>
      totalCandyForApostles(
        plans.physical.totalRecommendedStamina,
        plans.magic.totalRecommendedStamina,
        apostleCounts.physical,
        apostleCounts.magic,
      ),
    [plans],
  );
  const oneApostleDays = daysForCandy(plan.totalRecommendedStamina, candyIncome.totalPerDay);
  const allApostlesDays = daysForCandy(allApostlesCandy, candyIncome.totalPerDay);
  const selectedEliefOption = eliefPurchaseOptions[candySettings.eliefPurchasesPerDay];
  const formatNumber = (value: number, maximumFractionDigits = 1) =>
    value.toLocaleString(locale, { maximumFractionDigits });

  function updateCandySettings(update: Partial<typeof candySettings>) {
    setCandySettings((current) => ({ ...current, ...update }));
  }

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

      <section className="panel candy-calculator" aria-label={t("rankUp.candy.aria")}>
        <div className="candy-calculator-heading">
          <div>
            <h2>{t("rankUp.candy.title")}</h2>
            <p>{t("rankUp.candy.description")}</p>
          </div>
          <Clock3 size={24} aria-hidden="true" />
        </div>

        <div className="candy-settings-grid">
          <label className="candy-setting">
            <span>{t("rankUp.candy.shrineLevel")}</span>
            <select
              value={candySettings.shrineLevel}
              onChange={(event) => updateCandySettings({ shrineLevel: Number(event.target.value) })}
            >
              {Array.from({ length: 30 }, (_, index) => index + 1).map((level) => (
                <option key={level} value={level}>
                  {t("rankUp.candy.level", { level })}
                </option>
              ))}
            </select>
          </label>

          <label className="candy-setting">
            <span>{t("rankUp.candy.researchStage")}</span>
            <select
              value={candySettings.offeringResearchStage}
              onChange={(event) => updateCandySettings({ offeringResearchStage: Number(event.target.value) })}
            >
              {Array.from({ length: maximumOfferingResearchStage + 1 }, (_, stage) => (
                <option key={stage} value={stage}>
                  {t("rankUp.candy.researchOption", { stage, bonus: stage * 10 })}
                </option>
              ))}
            </select>
          </label>

          <label className="candy-setting">
            <span>{t("rankUp.candy.eliefPurchases")}</span>
            <select
              value={candySettings.eliefPurchasesPerDay}
              onChange={(event) => updateCandySettings({ eliefPurchasesPerDay: Number(event.target.value) })}
            >
              {eliefPurchaseOptions.map((option) => (
                <option key={option.purchases} value={option.purchases}>
                  {t("rankUp.candy.eliefOption", {
                    purchases: option.purchases,
                    candy: option.candy,
                    elief: option.elief,
                  })}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="candy-toggle-grid">
          <label>
            <input
              type="checkbox"
              checked={candySettings.includeNaturalRecovery}
              onChange={(event) => updateCandySettings({ includeNaturalRecovery: event.target.checked })}
            />
            <span>{t("rankUp.candy.includeNaturalRecovery")}</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={candySettings.includeDailyMail}
              onChange={(event) => updateCandySettings({ includeDailyMail: event.target.checked })}
            />
            <span>{t("rankUp.candy.includeMail")}</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={candySettings.includeDailyShop}
              onChange={(event) => updateCandySettings({ includeDailyShop: event.target.checked })}
            />
            <span>{t("rankUp.candy.includeShop")}</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={candySettings.includeSubscription}
              onChange={(event) => updateCandySettings({ includeSubscription: event.target.checked })}
            />
            <span>{t("rankUp.candy.includeSubscription")}</span>
          </label>
        </div>

        <div className="candy-calculation-layout">
          <div className="candy-breakdown">
            <h3>{t("rankUp.candy.breakdown")}</h3>
            <dl>
              <div>
                <dt>{t("rankUp.candy.natural")}</dt>
                <dd>{t("rankUp.candy.perDay", { count: formatNumber(candyIncome.natural) })}</dd>
              </div>
              <div>
                <dt>{t("rankUp.candy.offering")}</dt>
                <dd>{t("rankUp.candy.perDay", { count: formatNumber(candyIncome.offering) })}</dd>
              </div>
              <div>
                <dt>{t("rankUp.candy.mail")}</dt>
                <dd>{t("rankUp.candy.perDay", { count: formatNumber(candyIncome.dailyMail) })}</dd>
              </div>
              <div>
                <dt>{t("rankUp.candy.shop")}</dt>
                <dd>{t("rankUp.candy.perDay", { count: formatNumber(candyIncome.dailyShop) })}</dd>
              </div>
              <div>
                <dt>{t("rankUp.candy.subscription")}</dt>
                <dd>{t("rankUp.candy.perDay", { count: formatNumber(candyIncome.subscription) })}</dd>
              </div>
              <div>
                <dt>{t("rankUp.candy.elief")}</dt>
                <dd>{t("rankUp.candy.perDay", { count: formatNumber(candyIncome.elief) })}</dd>
              </div>
              <div className="candy-total-row">
                <dt>{t("rankUp.candy.total")}</dt>
                <dd>{t("rankUp.candy.perDay", { count: formatNumber(candyIncome.totalPerDay) })}</dd>
              </div>
            </dl>
            <p>
              {t("rankUp.candy.eliefCost", {
                count: selectedEliefOption.elief.toLocaleString(locale),
              })}
            </p>
          </div>

          <div className="candy-duration-results">
            <article>
              <UserRound size={22} aria-hidden="true" />
              <span>{t("rankUp.candy.oneApostle")}</span>
              <strong>{t("rankUp.candy.days", { count: formatNumber(oneApostleDays) })}</strong>
              <small>
                {t("rankUp.candy.required", { count: plan.totalRecommendedStamina.toLocaleString(locale) })}
              </small>
            </article>
            <article>
              <Users size={22} aria-hidden="true" />
              <span>{t("rankUp.candy.allApostles", { count: apostleCounts.physical + apostleCounts.magic })}</span>
              <strong>{t("rankUp.candy.days", { count: formatNumber(allApostlesDays) })}</strong>
              <small>
                {t("rankUp.candy.yearsAndTypes", {
                  years: formatNumber(allApostlesDays / 365, 2),
                  physical: apostleCounts.physical,
                  magic: apostleCounts.magic,
                })}
              </small>
              <small>{t("rankUp.candy.required", { count: allApostlesCandy.toLocaleString(locale) })}</small>
            </article>
          </div>
        </div>

        <div className="candy-assumptions">
          <p>
            <Info size={18} aria-hidden="true" />
            <span>{t("rankUp.candy.assumptions")}</span>
          </p>
          <p>
            {t("rankUp.candy.subscriptionNote", {
              count: subscriptionCandyPerTerm.toLocaleString(locale),
            })}
          </p>
          <nav aria-label={t("rankUp.candy.sources")}>
            {[
              [shrineWikiUrl, t("rankUp.candy.sourceShrine")],
              [candyWikiUrl, t("rankUp.candy.sourceCandy")],
              [premiumShopWikiUrl, t("rankUp.candy.sourceSubscription")],
            ].map(([href, label]) => (
              <a href={href} target="_blank" rel="noreferrer" key={href}>
                {label}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            ))}
          </nav>
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
