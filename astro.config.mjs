import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://toko-23.pages.dev",
  output: "static",
  integrations: [sitemap()],
  build: {
    format: "file"
  }
});
