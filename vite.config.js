import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: (chunk) => chunk.name === "globalPlayer" ? "assets/global-player.js" : "assets/[name]-[hash].js",
      },
      input: {
        main: "index.html",
        videoArhiva: "video-arhiva.html",
        globalPlayer: "src/global-player-entry.jsx",
        hrvatskiVal: "hrvatski-val.html",
      },
    },
  },
});