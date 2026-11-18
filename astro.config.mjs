import { existsSync } from "node:fs";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Dev only: folder index pages live at src/pages/<folder>/index/index.astro, so the dev server
// serves them at /<folder>/index. The site links to /<folder>/index.html (which is what the build emits),
// so map that URL to the dev route. Has no effect on `astro build`.
const devFolderIndexHtml = {
  name: "dev-folder-index-html",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      // Real files in public/ (e.g. /admin/index.html) are served as they are.
      const filePath = req.url ? "public" + req.url.split("?")[0] : "";
      if (req.url && !existsSync(filePath) && /^\/[^/?]+\/index\.html(\?|$)/.test(req.url)) {
        req.url = req.url.replace("/index.html", "/index");
      }
      next();
    });
  },
};

export default defineConfig({
  site: "http://localhost:4321",
  output: "static",
  integrations: [sitemap()],
  build: {
    format: "file"
  },
  vite: {
    plugins: [devFolderIndexHtml]
  }
});
