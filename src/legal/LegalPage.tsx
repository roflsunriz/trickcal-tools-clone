import type { MessageKey } from "../i18n";
import { useI18n } from "../i18n";

type LegalPageKind = "privacy" | "terms";

type LegalSection = {
  title: MessageKey;
  paragraphs?: MessageKey[];
  items?: MessageKey[];
};

const sections: Record<LegalPageKind, LegalSection[]> = {
  privacy: [
    {
      title: "legal.privacy.scope.title",
      paragraphs: ["legal.privacy.scope.body"],
    },
    {
      title: "legal.privacy.data.title",
      items: ["legal.privacy.data.local", "legal.privacy.data.googleAccount", "legal.privacy.data.drive"],
    },
    {
      title: "legal.privacy.purpose.title",
      items: ["legal.privacy.purpose.account", "legal.privacy.purpose.sync", "legal.privacy.purpose.support"],
    },
    {
      title: "legal.privacy.storage.title",
      paragraphs: ["legal.privacy.storage.body", "legal.privacy.storage.noServer"],
    },
    {
      title: "legal.privacy.google.title",
      paragraphs: ["legal.privacy.google.scope", "legal.privacy.google.limitedUse"],
    },
    {
      title: "legal.privacy.sharing.title",
      paragraphs: ["legal.privacy.sharing.body"],
    },
    {
      title: "legal.privacy.retention.title",
      items: ["legal.privacy.retention.local", "legal.privacy.retention.logout", "legal.privacy.retention.google"],
    },
    {
      title: "legal.privacy.security.title",
      paragraphs: ["legal.privacy.security.body"],
    },
    {
      title: "legal.privacy.services.title",
      paragraphs: ["legal.privacy.services.body"],
    },
    {
      title: "legal.privacy.changes.title",
      paragraphs: ["legal.privacy.changes.body"],
    },
    {
      title: "legal.contact.title",
      paragraphs: ["legal.contact.body"],
    },
  ],
  terms: [
    {
      title: "legal.terms.acceptance.title",
      paragraphs: ["legal.terms.acceptance.body"],
    },
    {
      title: "legal.terms.service.title",
      paragraphs: ["legal.terms.service.body"],
    },
    {
      title: "legal.terms.google.title",
      paragraphs: ["legal.terms.google.body"],
    },
    {
      title: "legal.terms.use.title",
      items: ["legal.terms.use.lawful", "legal.terms.use.security", "legal.terms.use.account"],
    },
    {
      title: "legal.terms.rights.title",
      paragraphs: ["legal.terms.rights.body"],
    },
    {
      title: "legal.terms.availability.title",
      paragraphs: ["legal.terms.availability.body"],
    },
    {
      title: "legal.terms.disclaimer.title",
      paragraphs: ["legal.terms.disclaimer.body"],
    },
    {
      title: "legal.terms.changes.title",
      paragraphs: ["legal.terms.changes.body"],
    },
    {
      title: "legal.contact.title",
      paragraphs: ["legal.contact.body"],
    },
  ],
};

export function LegalPage({ kind }: { kind: LegalPageKind }) {
  const { t } = useI18n();
  const prefix = kind === "privacy" ? "legal.privacy" : "legal.terms";

  return (
    <article className="legal-page">
      <header className="legal-heading">
        <p className="legal-eyebrow">Trickcal Tools</p>
        <h1>{t(`${prefix}.title` as MessageKey)}</h1>
        <p>{t(`${prefix}.summary` as MessageKey)}</p>
        <time dateTime="2026-10-24">{t("legal.updated")}</time>
      </header>

      <div className="legal-content panel">
        {sections[kind].map((section) => (
          <section key={section.title}>
            <h2>{t(section.title)}</h2>
            {section.paragraphs?.map((key) => (
              <p key={key}>{t(key)}</p>
            ))}
            {section.items ? (
              <ul>
                {section.items.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <nav className="legal-resources" aria-label={t("legal.resources")}>
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
            {t("legal.googlePolicy")}
          </a>
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
            {t("legal.googlePrivacy")}
          </a>
          <a href="https://github.com/roflsunriz/trickcal-tools-clone/issues" target="_blank" rel="noreferrer">
            {t("legal.contact.issues")}
          </a>
        </nav>
      </div>
    </article>
  );
}
