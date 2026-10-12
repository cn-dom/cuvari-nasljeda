import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/kviz/",
  build: { outDir: "../dist/kviz", emptyOutDir: false, sourcemap: false },
});
