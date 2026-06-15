import { getMetaFromPath, pages } from "./src/metadata.js";

import { readdirSync } from "node:fs";

const fonts = readdirSync("src/fonts")
  .filter(f => f.endsWith(".woff2"))
  .map(f => f.replace(/\.woff2$/, ""));

const embeds = readdirSync("src/embeds")
  .filter(f => /\.(svg|png)\.js$/.test(f))
  .map(f => f.replace(/\.js$/, ""));

const previews = readdirSync("src/embeds/static");

console.log(previews);

const SITE_NAME = "arrrrrmin.dev";
const BASE_URL = "https://arrrrrmin.dev";

const head = ({ title, data, path }) => {
  let pieces = [];
  let description = getMetaFromPath({ path, meta: "description" });
  let publishedTime = getMetaFromPath({ path, meta: "date" });
  let preview = getMetaFromPath({ path, meta: "preview" });
  let [imageWidth, imageHeight] = [512, 512];
  if (preview) {
    imageWidth = getMetaFromPath({ path, meta: "previewWidth" });
    imageHeight = getMetaFromPath({ path, meta: "previewHeight" });
  } else {
    preview = "/web-app-manifest-512x512.png";

  }
  let url = BASE_URL;
  const siteName = SITE_NAME;
  const author = "arrrrrmin";
  const type = "website";
  const locale = "en_GB";

  pieces.push(`<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96">`);
  pieces.push(`<link rel="icon" type="image/svg+xml" href="/favicon.svg">`);
  pieces.push(`<link rel="shortcut icon" href="/favicon.ico">`);
  pieces.push(`<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`);
  pieces.push(`<link rel="canonical" href="${BASE_URL}${path}"></link>`);
  // Fedi linking
  pieces.push(`<link rel="me" href="https://chaos.social/@arrrrrmin"></link>`);

  if (title) {
    pieces.push(`<meta property="og:title" content="${title}">`);
  }

  if (data.keywords) {
    pieces.push(`<meta name="keywords" content="${data.keywords.join(",")}">`);
  }

  if (description) {
    pieces.push(
      `<meta name="description" content="${description}">`,
      `<meta property="og:description" content="${description}">`,
    );
  }

  pieces.push(`<meta property="og:url" content="${BASE_URL}${path}">`);
  pieces.push(`<meta property="og:image" content="${BASE_URL}${preview}">`);

  if (siteName) {
    pieces.push(`<meta property="og:site_name" content="${siteName}">`);
  }

  if (locale) {
    pieces.push(`<meta property="og:locale" content="${locale}">`);
  }

  if (type) {
    pieces.push(`<meta property="og:type" content="${type}">`);
  }

  if (author) {
    pieces.push(`<meta name="author" content="${author}">`);
  }

  pieces.push(`<meta name="twitter:card" content="summary_large_image">`)
  if (description) {
    pieces.push(`<meta name="twitter:description" content="${description}">`);
  }

  pieces.push(`<meta name="twitter:image" content="${BASE_URL}${preview}">`)
  pieces.push(`<meta name="twitter:title" content="${title}">`)

  if (publishedTime) {
    pieces.push(`<meta property="article:published_time" content="${publishedTime}">`);
  }
  pieces.push(`<meta name="robots" content="index, follow">`);
  // Post attribution
  pieces.push(`<meta name="fediverse:creator" content="@arrrrrmin@chaos.social">`);
  const isBuild = process.env.npm_lifecycle_event === "build"
  if (isBuild) {
    pieces.push(`<script defer src="https://interim.arrrrrmin.dev/delivery" data-website-id="a559becc-c181-40d6-b329-0d3d913851d1"></script>`)
  }
  pieces.push(`<link rel="stylesheet" href="/fonts.css">`)
  return pieces.join("\n");
};

const buildFooter = ({ path }) => {
  let pieces = [];
  pieces.push(
    `<div class="footer-social">`,
  );
  pieces.push(`<div style="display: flex; flex-direction: column; gap: 4px;"><div><a rel="me" href="https://chaos.social/@arrrrrmin">Mastodon</a></div>`);
  pieces.push(`<div><a rel="me" href="https://bsky.app/profile/arrrrrmin.dev">Bluesky</a></div></div></div>`);
  pieces.push(`<img src="/images/arrrrrmin.dev.svg" class="profile-image" />`);
  return pieces.join("\n");
};

// See https://observablehq.com/framework/config for documentation.
export default {
  title: SITE_NAME,
  pages: pages, // see pages in "./src/metadata.js"
  root: "src",
  search: true, // activate search
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
  base: "/",
  head: head,
  footer: ({ path }) => buildFooter({ path }),
  dynamicPaths: [
    // Static things
    "/robots.txt",
    "/favicon-96x96.png",
    "/favicon.ico",
    "/favicon.svg",
    "/web-app-manifest-192x192.png",
    "/web-app-manifest-512x512.png",
    "/apple-touch-icon.png",
    "/sitemap.xml",
    "/images/arrrrrmin.dev.svg",
    "/fonts.css",
    // Fonts, embeddables and previews
    ...fonts.map(name => `/fonts/${name}.woff2`),
    ...embeds.map(name => `/embeds/${name}`),
    ...previews.map(name => `/embeds/static/${name}`),
  ],
  style: "global.css",
  globalStylesheets: ["/global.css"],
};
