import { Languages, Moon, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { tools } from "./app/tools";
import { useI18n } from "./i18n";

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

  const tool = useMemo(() => tools.find((item) => item.path === path) ?? tools[0], [path]);

  function navigate(nextPath: string) {
    window.history.pushState({}, "", browserPath(nextPath));
    setPath(nextPath);
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("trickcal_theme", nextTheme);
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
              className={item.path === tool.path ? "tool-tab active" : "tool-tab"}
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
      <main className="app-main">
        <tool.Component />
      </main>
    </div>
  );
}
