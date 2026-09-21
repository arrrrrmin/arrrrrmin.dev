import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {deserialize} from "@observablehq/notebook-kit";
import {config, observable} from "@observablehq/notebook-kit/vite";
import {JSDOM} from "jsdom";
import {defineConfig} from "vite";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const TEMPLATE = join(ROOT, "main.tmpl");

const SITE_ORIGIN = "https://arrrrrmin.dev";
const SITE_NAME = "arrrrrmin.dev";
const AUTHOR = "arrrrrmin";

const REL = ["noopener"];

const parser = new (new JSDOM().window.DOMParser)();

export default defineConfig(({command}) => ({
  ...config(),
  root: ROOT,
  base: command === "serve" ? "/" : "./",
  build: {
    outDir: ".observable/dist",
    rollupOptions: {input: notebooks()}
  },
  plugins: [
    observable({
      template: TEMPLATE,
      transformTemplate,
      transformNotebook: (notebook) => ({...notebook, title: ""})
    }),
    externalLinks(),
    activeNav()
  ]
}));

/** Every notebook under docs the build entry points (no build cache). */
function notebooks() {
  return readdirSync(ROOT, {recursive: true, encoding: "utf-8"})
    .map((file) => file.split(/[\\/]/).join("/"))
    .filter((file) => file.endsWith(".html"))
    .filter((file) => !file.split("/").includes(".observable"))
    .map((file) => join(ROOT, file));
}

/** Fills the ${…} placeholders in the template from the notebook’s own metadata. */
async function transformTemplate(template, {filename, path}) {
  const source = readFileSync(filename, "utf-8");
  const notebook = deserialize(source, {parser});
  const meta = readMeta(source, filename);
  const isIndex = path.endsWith("/index.html");
  const isRoot = path === "/index.html";
  const name = meta.title ?? (isUntitled(notebook.title) ? navTitle(template, path) : notebook.title);
  const image = resolveImage(meta.image);
  return render(template, {
    title: isRoot || !name ? SITE_NAME : `${name} · ${SITE_NAME}`,
    description: meta.blurb,
    keywords: meta.tags?.join(", "),
    author: AUTHOR,
    canonical: SITE_ORIGIN + path.replace(/index\.html$/, ""),
    type: isIndex ? "website" : "article",
    published: meta.date,
    robots: meta.draft ? "noindex, nofollow" : undefined,
    card: image ? "summary_large_image" : "summary",
    siteName: SITE_NAME,
    image
  });
}

/** The <!-- @meta {…} --> block a notebook carries in a hidden markdown cell. */
function readMeta(source, filename) {
  const json = source.match(/@meta\s*(\{[\s\S]*?\})/)?.[1];
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch (error) {
    console.warn(`warning: invalid @meta in ${filename}: ${error.message}`);
    return {};
  }
}

/** Notebooks that never got a title in Observable Desktop. */
function isUntitled(title) {
  return !title || title === "Untitled";
}

/** Falls back to the section’s own label in the template’s nav. */
function navTitle(template, path) {
  const current = section(path);
  if (!current) return null;
  const start = template.search(/<nav[\s>]/i);
  const end = template.indexOf("</nav>", start);
  if (start < 0 || end < start) return null;
  for (const [, href, label] of template.slice(start, end).matchAll(/<a\s[^>]*href=["']?([^"'\s>]+)[^>]*>([^<]*)<\/a>/gi)) {
    if (section(href) === current) return label.trim();
  }
  return null;
}

/** Social images are given as public/name.png (or /public/name.png); serve them from the root. */
function resolveImage(image) {
  return image ? `${SITE_ORIGIN}/${image.replace(/^\//, "").replace(/^public\//, "")}` : undefined;
}

function render(template, data) {
  return template
    .replace(/\$\{(\w+)\}/g, (match, key) => (data[key] == null ? "" : escapeAttribute(String(data[key]))))
    .replace(/^[ \t]*<(?:meta|link)\b[^>]*\s(?:content|href)=""[^>]*>[ \t]*\r?\n/gm, "");
}

function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function activeNav() {
  return {
    name: "active-nav",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const current = section(ctx.path);
        return transformHeader(html, (tag) => {
          const href = readAttribute(tag, "href");
          if (href == null || section(href) !== current) return tag;
          const open = tag.slice(0, -1).replace(/\s*\/$/, "");
          return `${open} aria-current="page">`;
        });
      }
    }
  };
}

function section(path) {
  const [first = ""] = path.replace(/^\//, "").split("/");
  return first.replace(/\.html$/, "").replace(/^index$/, "");
}

function transformHeader(html, rewrite) {
  const start = html.search(/<header[\s>]/i);
  const end = html.indexOf("</header>", start);
  if (start < 0 || end < start) return html;
  return html.slice(0, start) + html.slice(start, end).replace(/<a\s[^>]*>/gi, rewrite) + html.slice(end);
}

function externalLinks() {
  return {
    name: "external-links",
    transformIndexHtml: {
      order: "post",
      handler: transformMain
    }
  };
}

/** Rewrites anchors in the pre-rendered cells (not for ${} cells). */
function transformMain(html) {
  const start = html.search(/<main[\s>]/i);
  const end = html.lastIndexOf("</main>");
  if (start < 0 || end < start) return html;
  return html.slice(0, start) + html.slice(start, end).replace(/<a\s[^>]*>/gi, rewriteAnchor) + html.slice(end);
}

function rewriteAnchor(tag) {
  const href = readAttribute(tag, "href");
  if (!href || !isExternal(href) || /\starget\s*=/i.test(tag)) return tag;
  const rel = mergeRel(readAttribute(tag, "rel"));
  const open = tag.slice(0, -1).replace(/\s*\/$/, "");
  return /\srel\s*=/i.test(tag)
    ? `${open.replace(/\srel\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i, ` rel="${rel}"`)} target="_blank">`
    : `${open} target="_blank" rel="${rel}">`;
}

function readAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match && (match[2] ?? match[3] ?? match[4]);
}

function mergeRel(rel) {
  return [...new Set([...(rel ? rel.trim().split(/\s+/) : []), ...REL])].join(" ");
}

function isExternal(href) {
  if (!/^(https?:)?\/\//i.test(href)) return false;
  if (!SITE_ORIGIN) return true;
  const absolute = href.replace(/^\/\//, "https://");
  return absolute !== SITE_ORIGIN && !absolute.startsWith(`${SITE_ORIGIN}/`);
}
