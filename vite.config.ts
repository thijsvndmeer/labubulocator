import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

const lovableLog = () => ({
  name: 'lovable-log',
  buildStart: () => {
    fs.writeFileSync('log.txt', 'Lovable Log\n');
    fs.appendFileSync('log.txt', `Build started at ${new Date().toISOString()}\n`);
  },
  transform: (code, id) => {
    fs.appendFileSync('log.txt', `Transformed ${id}\n`);
    return null;
  },
  buildEnd: () => {
    fs.appendFileSync('log.txt', `Build ended at ${new Date().toISOString()}\n`);
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), lovableLog(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
}));
