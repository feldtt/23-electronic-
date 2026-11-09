import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mockupRoot = path.join(repoRoot, "mockup", "toko-23");
const pagesRoot = path.join(repoRoot, "src", "pages");
const publicRoot = path.join(repoRoot, "public");

// Design artifacts that must NOT be copied into the deployed site.
const SKIP_ENTRIES = new Set(["screenshots", ".thumbnail"]);

if (!existsSync(mockupRoot)) {
  throw new Error(`Mockup folder not found: ${mockupRoot}`);
}

rmSync(pagesRoot, { recursive: true, force: true });
mkdirSync(pagesRoot, { recursive: true });
mkdirSync(publicRoot, { recursive: true });

function walkHtmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP_ENTRIES.has(entry.name)) {
      return [];
    }

    const current = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walkHtmlFiles(current);
    }

    return entry.isFile() && entry.name.endsWith(".html") ? [current] : [];
  });
}

function preserveScripts(html) {
  // Astro treats raw `{` / `}` in page markup as JSX expressions. In these
  // mockups every `{` lives inside a <script> element — inline JS, <script src>,
  // or <script type="application/ld+json">. Marking ALL script tags as is:inline
  // tells Astro to emit them verbatim, which protects every brace and keeps the
  // client-side partials.js loader working unchanged.
  let out = html.replace(/<script(?![^>]*\bis:inline\b)/g, "<script is:inline");

  // Rewrite bare root-relative asset references (href="/x" / src="/x") to keep a
  // leading slash so they resolve under build.format:'file'. The mockup uses
  // page-relative paths (assets/... and ../assets/...) which already resolve, so
  // this is a defensive no-op here but keeps the importer general.
  out = out.replace(/(\b(?:href|src)=")\/(?!\/)/g, "$1/");

  return out;
}

/**
 * Map a mockup HTML file to its Astro page path.
 *
 * The mockup was authored as a plain static site where each folder has an
 * index.html (e.g. produk/index.html) and pages link to it as "produk/index.html"
 * / "index.html" / "../index.html". Astro's build.format:'file' collapses
 * src/pages/produk/index.astro to /produk.html, which would break every one of
 * those authored links. To keep the site byte-for-byte faithful (no link
 * rewriting), a folder index is emitted at its authored URL /<folder>/index.html
 * by nesting it as src/pages/<folder>/index/index.astro. The root index.html and
 * all leaf pages keep their natural one-to-one mapping.
 */
function toAstroPath(relativePath) {
  if (relativePath === "index.html") {
    return path.join(pagesRoot, "index.astro");
  }

  const dir = path.dirname(relativePath);
  const base = path.basename(relativePath);

  if (base === "index.html" && dir !== ".") {
    // produk/index.html -> src/pages/produk/index/index.astro -> /produk/index.html
    return path.join(pagesRoot, dir, "index", "index.astro");
  }

  // produk/ac.html -> src/pages/produk/ac.astro -> /produk/ac.html
  return path.join(pagesRoot, relativePath.replace(/\.html$/, ".astro"));
}

for (const sourcePath of walkHtmlFiles(mockupRoot)) {
  const relativePath = path.relative(mockupRoot, sourcePath);
  const astroPath = toAstroPath(relativePath);

  mkdirSync(path.dirname(astroPath), { recursive: true });
  writeFileSync(astroPath, preserveScripts(readFileSync(sourcePath, "utf8")));
}

// Copy EVERY non-.html file/dir into public/, preserving relative paths,
// except design artifacts (screenshots/, .thumbnail).
function copyAssets(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_ENTRIES.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(dir, entry.name);
    const relativePath = path.relative(mockupRoot, sourcePath);
    const targetPath = path.join(publicRoot, relativePath);

    if (entry.isDirectory()) {
      copyAssets(sourcePath);
      continue;
    }

    if (entry.isFile() && !entry.name.endsWith(".html")) {
      mkdirSync(path.dirname(targetPath), { recursive: true });
      cpSync(sourcePath, targetPath);
    }
  }
}

copyAssets(mockupRoot);
