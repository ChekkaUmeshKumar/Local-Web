import { defineConfig } from "vitest/config";
import path from "node:path";

// Standalone test config: mirrors the `@` alias without loading the
// Tailwind/Tauri-specific plugins from vite.config.ts.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
