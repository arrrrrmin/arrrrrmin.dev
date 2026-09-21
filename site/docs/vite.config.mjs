const SITE_ORIGIN = "https://arrrrrmin.dev";

/** "noreferrer" ? */
const REL = ["noopener"];

export default {
  plugins: [externalLinks(), activeNav()]
};

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
