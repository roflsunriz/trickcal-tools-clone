import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { CloudProvider } from "./cloud/CloudProvider";
import { I18nProvider } from "./I18nProvider";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CloudProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </CloudProvider>
  </StrictMode>,
);
