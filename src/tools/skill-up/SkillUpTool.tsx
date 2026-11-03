import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { useI18n } from "../../i18n";
import type { MessageKey } from "../../i18n";
import communityData from "../community/data.json";
import type { CharacterRole, CommunityData } from "../community/types";
import { calculateAllSkillsCost, calculateSkillCost, isTargetSkillLevel, skillUpgrades } from "./skill-costs";
import type { SkillKind } from "./skill-costs";
import "./skill-up.css";

const wikiUrl =
  "https://wikiwiki.jp/thetrickal/%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E8%82%B2%E6%88%90";
const rosterWikiUrl = "https://wikiwiki.jp/thetrickal/%E4%BD%BF%E5%BE%92%E4%B8%80%E8%A6%A7";
const resources: { key: "low" | "medium" | "high" | "gold"; label: MessageKey }[] = [
  { key: "low", label: "skillUp.low" },
  { key: "medium", label: "skillUp.medium" },
  { key: "high", label: "skillUp.high" },
  { key: "gold", label: "skillUp.gold" },
];
const roles: { role: CharacterRole; label: MessageKey }[] = [
  { role: "guard", label: "skillUp.roleGuard" },
  { role: "attacker", label: "skillUp.roleAttacker" },
  { role: "supporter", label: "skillUp.roleSupporter" },
];
const characters = (communityData as CommunityData).characters;
const roleCounts = Object.values(characters).reduce<Record<CharacterRole, number>>(
  (counts, character) => ({ ...counts, [character.role]: counts[character.role] + 1 }),
  { guard: 0, attacker: 0, supporter: 0 },
);
const apostleCount = Object.keys(characters).length;
const allApostlesCost = calculateAllSkillsCost(apostleCount, 12);

export function SkillUpTool() {
  const { locale, t } = useI18n();
  const [kind, setKind] = useState<SkillKind>("active");
  const [targetLevel, setTargetLevel] = useState(7);
  const total = calculateSkillCost(kind, targetLevel);
  const visibleUpgrades = skillUpgrades.filter((upgrade) => upgrade.level <= targetLevel);
  const formatNumber = (value: number) => value.toLocaleString(locale);

  return (
    <section className="skill-up-root">
      <div className="sweep-heading">
        <div>
          <h1>{t("skillUp.heading.title")}</h1>
          <p>{t("skillUp.heading.description")}</p>
        </div>
      </div>

      <section className="panel skill-up-settings" aria-label={t("skillUp.settings")}>
        <div className="skill-up-controls">
          <div className="skill-up-field">
            <span className="skill-up-label" id="skill-kind-label">
              {t("skillUp.kind")}
            </span>
            <div className="segmented-control skill-kind-switch" role="group" aria-labelledby="skill-kind-label">
              {(["active", "passive"] as const).map((option) => (
                <button
                  key={option}
                  className={kind === option ? "segment active" : "segment"}
                  type="button"
                  aria-pressed={kind === option}
                  data-skill-kind={option}
                  onClick={() => setKind(option)}
                >
                  {t(option === "active" ? "skillUp.active" : "skillUp.passive")}
                </button>
              ))}
            </div>
          </div>

          <label className="skill-up-field">
            <span className="skill-up-label">{t("skillUp.target")}</span>
            <select
              value={targetLevel}
              data-testid="skill-target"
              onChange={(event) => {
                const level = Number(event.target.value);
                if (isTargetSkillLevel(level)) setTargetLevel(level);
              }}
            >
              {skillUpgrades.map(({ level }) => (
                <option key={level} value={level}>
                  {t("skillUp.level", { level })}
                </option>
              ))}
            </select>
          </label>

          <div className="skill-up-field">
            <span className="skill-up-label" id="skill-quick-label">
              {t("skillUp.quick")}
            </span>
            <div className="skill-quick-buttons" role="group" aria-labelledby="skill-quick-label">
              {[7, 12].map((level) => (
                <button
                  key={level}
                  className={targetLevel === level ? "quick-rank-button active" : "quick-rank-button"}
                  type="button"
                  aria-pressed={targetLevel === level}
                  data-quick-level={level}
                  onClick={() => setTargetLevel(level)}
                >
                  {t("skillUp.quickLevel", { level })}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="skill-up-results" aria-live="polite" aria-atomic="true">
          <h2>{t("skillUp.total", { level: targetLevel })}</h2>
          <p>{t("skillUp.oneSkill")}</p>
          <dl className="skill-up-summary">
            {resources.map(({ key, label }) => (
              <div className="skill-up-summary-card" key={key}>
                <dt>{t(label)}</dt>
                <dd data-resource={key}>{formatNumber(total[key])}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="skill-up-notes">
          <p>{t("skillUp.roleNote")}</p>
          <p>{t("skillUp.asideNote")}</p>
          <a href={wikiUrl} target="_blank" rel="noreferrer">
            {t("skillUp.source")}
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="panel skill-up-breakdown" aria-label={t("skillUp.breakdown")}>
        <h2>{t("skillUp.breakdown")}</h2>
        <p>{t("skillUp.breakdownNote")}</p>
        <table>
          <thead>
            <tr>
              <th scope="col">{t("skillUp.tableLevel")}</th>
              <th scope="col">{t("skillUp.tableLow")}</th>
              <th scope="col">{t("skillUp.tableMedium")}</th>
              <th scope="col">{t("skillUp.tableHigh")}</th>
              <th scope="col">{t("skillUp.gold")}</th>
            </tr>
          </thead>
          <tbody>
            {visibleUpgrades.map((upgrade) => (
              <tr key={upgrade.level} data-upgrade-level={upgrade.level}>
                <th scope="row">{t("skillUp.level", { level: upgrade.level })}</th>
                {upgrade[kind].map((count, index) => (
                  <td key={index}>{formatNumber(count)}</td>
                ))}
                <td>{formatNumber(upgrade.gold)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel skill-up-all" aria-label={t("skillUp.allTitle", { count: apostleCount })}>
        <h2>{t("skillUp.allTitle", { count: apostleCount })}</h2>
        <p>{t("skillUp.allNote")}</p>
        <dl className="skill-up-summary skill-up-all-summary">
          {resources.map(({ key, label }) => (
            <div className="skill-up-summary-card" key={key}>
              <dt>{t(label)}</dt>
              <dd data-all-resource={key}>{formatNumber(allApostlesCost[key])}</dd>
            </div>
          ))}
        </dl>
        <h3>{t("skillUp.allByRole")}</h3>
        <div className="skill-up-role-grid">
          {roles.map(({ role, label }) => {
            const cost = calculateAllSkillsCost(roleCounts[role], 12);
            return (
              <article className="skill-up-role-card" key={role} data-role={role}>
                <h4>
                  {t(label)} <span data-role-count={role}>{t("skillUp.roleCount", { count: roleCounts[role] })}</span>
                </h4>
                <dl>
                  {resources.map(({ key, label: resourceLabel }) => (
                    <div key={key}>
                      <dt>{t(resourceLabel)}</dt>
                      <dd data-role-resource={key}>{formatNumber(cost[key])}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
        <a className="skill-up-roster-source" href={rosterWikiUrl} target="_blank" rel="noreferrer">
          {t("skillUp.rosterSource")}
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </section>
    </section>
  );
}
