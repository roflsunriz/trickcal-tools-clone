import { Languages, Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { tools } from "./app/tools";
import { CloudAccountControls } from "./cloud/CloudAccountControls";
import { markCloudStateChanged } from "./cloud/storage";
import { useI18n } from "./i18n";
import { LegalPage } from "./legal/LegalPage";

const defaultPath = "/sweep";

function basePath() {
  return import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");
}

function currentPath() {
  const base = basePath();
  const routePath =
    base && window.location.pathname.startsWith(base)
      ? window.location.pathname.slice(base.length)
      : window.location.pathname;
  const normalizedPath = routePath.replace(/\/$/, "") || "/";
  return normalizedPath === "/" ? defaultPath : normalizedPath;
}

function browserPath(path: string) {
  return `${basePath()}${path}`;
}

export function App() {
  const { locale, setLocale, t } = useI18n();
  const [path, setPath] = useState(currentPath);
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("trickcal_theme") as "light" | "dark") || "dark",
  );

  const legalKind = path === "/privacy" ? "privacy" : path === "/terms" ? "terms" : null;
  const tool = useMemo(() => tools.find((item) => item.path === path) ?? tools[0], [path]);

  useEffect(() => {
    const handlePopState = () => setPath(currentPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const pageTitle = legalKind ? t(`legal.${legalKind}.title`) : t(tool.labelKey);
    document.title = `${pageTitle} | Trickcal Tools`;
  }, [legalKind, t, tool.labelKey]);

  function navigate(nextPath: string) {
    window.history.pushState({}, "", browserPath(nextPath));
    setPath(nextPath);
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("trickcal_theme", nextTheme);
    markCloudStateChanged();
  }

  function toggleLocale() {
    setLocale(locale === "ja" ? "en" : "ja");
  }

  return (
    <div className="app" data-theme={theme}>
      <header className="site-header">
        <button className="brand" type="button" onClick={() => navigate("/sweep")}>
          <span className="brand-mark">T</span>
          <span>Trickcal Tools</span>
        </button>
        <nav className="tool-tabs" aria-label={t("app.tools")}>
          {tools.map(({ Icon, ...item }) => (
            <button
              className={!legalKind && item.path === tool.path ? "tool-tab active" : "tool-tab"}
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              title={t(item.descriptionKey)}
            >
              <Icon size={18} />
              <span>{t(item.labelKey)}</span>
            </button>
          ))}
        </nav>
        <CloudAccountControls />
        <button
          className="icon-button locale-button"
          type="button"
          onClick={toggleLocale}
          title={t("app.locale.toggle")}
        >
          <Languages size={18} />
          <span>{locale.toUpperCase()}</span>
        </button>
        <button className="icon-button" type="button" onClick={toggleTheme} title={t("app.theme.toggle")}>
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>
      <main className="app-main">{legalKind ? <LegalPage kind={legalKind} /> : <tool.Component />}</main>
      <footer className="site-footer">
        <span>{t("footer.description")}</span>
        <nav aria-label={t("footer.legal")}>
          <a
            className="footer-link"
            href="https://roflsunriz.github.io/trickcal-data/"
            target="_blank"
            rel="noreferrer"
          >
            {t("footer.data")}
          </a>
          <button
            className={path === "/privacy" ? "footer-link active" : "footer-link"}
            type="button"
            onClick={() => navigate("/privacy")}
            aria-current={path === "/privacy" ? "page" : undefined}
          >
            {t("footer.privacy")}
          </button>
          <button
            className={path === "/terms" ? "footer-link active" : "footer-link"}
            type="button"
            onClick={() => navigate("/terms")}
            aria-current={path === "/terms" ? "page" : undefined}
          >
            {t("footer.terms")}
          </button>
          <a
            className="footer-link"
            href="https://github.com/roflsunriz/trickcal-tools-clone/issues"
            target="_blank"
            rel="noreferrer"
          >
            {t("footer.contact")}
          </a>
        </nav>
      </footer>
    </div>
  );
}
