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
    // Needed so `import blocksCss from "…​/blocks.css?raw"` returns the real
    // file content in tests (vitest replaces CSS with empty strings by default).
    css: true,
  },
});
