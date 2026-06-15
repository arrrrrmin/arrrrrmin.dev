import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { pages } from "./metadata.js";

const SITE_URL = "https://arrrrrmin.dev";

const root = dirname(fileURLToPath(import.meta.url));

function isInternal(path) {
  // Uused to exclude external links
  return path.startsWith("/") && !path.startsWith("//");
}

function collectPaths(items, out = []) {
  for (const item of items ?? []) {
    if (item && typeof item.path === "string" && isInternal(item.path)) {
      out.push(item.path);
    }
    if (item && Array.isArray(item.pages)) collectPaths(item.pages, out);
  }
  return out;
}

function routeToFile(route) {
  let rel = route.replace(/^\//, "");
  rel += rel === "" || rel.endsWith("/") ? "index.md" : ".md";
  return join(root, rel);
}

function lastmod(route) {
  try {
    return statSync(routeToFile(route)).mtime.toISOString().slice(0, 10);
  } catch {
    return null; // not a real .md page (e.g. a generated/grouping route) — omit
  }
}

function escapeXml(s) {
  return s.replace(/[&<>'"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&apos;", '"': "&quot;" }[c])
  );
}

const routes = Array.from(new Set(["/", ...collectPaths(pages)]));

const urls = routes
  .map((route) => ({ loc: SITE_URL + route, lastmod: lastmod(route) }))
  .sort((a, b) => a.loc.localeCompare(b.loc));

process.stdout.write(
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(({ loc, lastmod }) =>
      `  <url><loc>${escapeXml(loc)}</loc>` +
      (lastmod ? `<lastmod>${lastmod}</lastmod>` : ``) +
      `</url>`
    )
    .join("\n") +
  `\n</urlset>\n`
);