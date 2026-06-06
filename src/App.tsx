import { Moon, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { tools } from "./app/tools";

function currentPath() {
  return window.location.pathname === "/" ? "/sweep" : window.location.pathname;
}

export function App() {
  const [path, setPath] = useState(currentPath);
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("trickcal_theme") as "light" | "dark") || "dark",
  );

  const tool = useMemo(() => tools.find((item) => item.path === path) ?? tools[0], [path]);

  function navigate(nextPath: string) {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("trickcal_theme", nextTheme);
  }

  return (
    <div className="app" data-theme={theme}>
      <header className="site-header">
        <button className="brand" type="button" onClick={() => navigate("/sweep")}>
          <span className="brand-mark">T</span>
          <span>Trickcal Tools</span>
        </button>
        <nav className="tool-tabs" aria-label="Tools">
          {tools.map(({ Icon, ...item }) => (
            <button
              className={item.path === tool.path ? "tool-tab active" : "tool-tab"}
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              title={item.description}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="icon-button" type="button" onClick={toggleTheme} title="テーマ切替">
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>
      <main className="app-main">
        <tool.Component />
      </main>
    </div>
  );
}
