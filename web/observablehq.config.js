import { getMetaFromPath, pages } from "./src/metadata.js";

const SITE_NAME = "arrrrrmin.dev";
const BASE_URL = "https://arrrrrmin.dev";

const escape = (str) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const head = ({ title, data, path }) => {
  let pieces = [];
  let description = getMetaFromPath({ path, meta: "description" });
  let publishedTime = getMetaFromPath({ path, meta: "date" });
  let url = BASE_URL;
  const siteName = SITE_NAME;
  const author = "arrrrrmin";
  const type = "website";
  const locale = "en_GB";
  const [imageWidth, imageHeight] = [512, 512];

  pieces.push(`<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96">`);
  pieces.push(`<link rel="icon" type="image/svg+xml" href="/favicon.svg">`);
  pieces.push(`<link rel="shortcut icon" href="/favicon.ico">`);
  pieces.push(`<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`);
  pieces.push(`<link rel="canonical" href="${BASE_URL}${path}"></link>`);
  // Fedi linking
  pieces.push(`<link rel="me" href="https://chaos.social/@arrrrrmin"></link>`);

  if (title) {
    pieces.push(`<title>${escape(title)}</title>`);
    pieces.push(`<meta property="og:title" content="${escape(title)}">`);
  }

  if (data.keywords) {
    pieces.push(`<meta name="keywords" content="${data.keywords.join(",")}">`);
  }

  if (description) {
    pieces.push(
      `<meta name="description" content="${escape(description)}">`,
      `<meta property="og:description" content="${escape(description)}">`,
    );
  }

  pieces.push(`<meta property="og:url" content="${BASE_URL}${path}">`);
  pieces.push(`<meta property="og:image" content="${BASE_URL}/web-app-manifest-512x512.png">`);
  pieces.push(`<meta property="og:image:width" content="${imageWidth}">`);
  pieces.push(`<meta property="og:image:height" content="${imageHeight}">`);

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

  if (publishedTime) {
    pieces.push(`<meta property="article:published_time" content="${publishedTime}">`);
  }
  pieces.push(`<meta name="robots" content="${BASE_URL}/robots.txt">`);
  // Post attribution
  pieces.push(`<meta name="fediverse:creator" content="@arrrrrmin@chaos.social">`);

  return pieces.join("\n");
};

const buildFooter = ({ path }) => {
  let pieces = [];
  pieces.push(
    `<div class="footer-social">`,
  );
  pieces.push(`<div><img src="/images/arrrrrmin.dev.svg" class="profile-image" /></div>`);
  pieces.push(`<div><a rel="me" href="https://chaos.social/@arrrrrmin">Mastodon</a>`);
  pieces.push(`<a rel="me" href="https://bsky.app/profile/arrrrrmin.dev">Bluesky</a></div></div>`);
  return pieces.join("\n");
};

// See https://observablehq.com/framework/config for documentation.
export default {
  title: SITE_NAME,
  pages: pages, // see pages in "./src/metadata.js"
  root: "src",
  head: head, // Content to add to the head of the page, e.g. for a favicon:
  search: true, // activate search
  // The path to the source root.
  // Some additional configuration options and their defaults:
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
  footer: ({ path }) => buildFooter({ path }),
  style: "/styles/global.css",
  dynamicPaths: [
    // Static things
    "/robots.txt",
    "/favicon-96x96.png",
    "/favicon.ico",
    "/favicon.svg",
    "/web-app-manifest-192x192.png",
    "/web-app-manifest-512x512.png",
    "/apple-touch-icon.png",
    // Images
    "/images/arrrrrmin.dev.svg",
    // Fonts
    "/sentient.css",
    "styles/fonts/Sentient-Variable.woff2",
    "styles/fonts/Sentient-Variable.woff",
  ],
  globalStylesheets: ["/styles/global.css"],
};
