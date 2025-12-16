import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "next-themes";
import { applyThemeConfig } from './lib/theme';

import { ConfigProvider } from "./context/ConfigContext";

applyThemeConfig();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </ThemeProvider>
  </BrowserRouter>
);
