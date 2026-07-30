import { defineConfig } from "vite";

export default defineConfig({
  // Keep this matched to the GitHub repository name.
  base: "/resilience-routes/",
  build: {
    outDir: "dist",
    sourcemap: false
  }
});
