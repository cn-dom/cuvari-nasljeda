import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    // Resolve from this config file, not the repository root or Vite's current directory.
    // This makes the quiz's Tailwind theme load consistently in CI and Cloudflare builds.
    tailwindcss: { config: resolve(configDirectory, "tailwind.config.js") },
    autoprefixer: {},
  },
};
