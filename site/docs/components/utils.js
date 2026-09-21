import { html } from "npm:htl";
import * as d3 from "npm:d3";

/** Path correction for images → preview on hover and button click */
export const toImageURL = (image) =>
  !image ? null
    : /^https?:\/\//i.test(image) ? image
      : `/${image.replace(/^\/+/, "").replace(/^public\//, "")}`;

/** Map row element to post record, so listeners can access data. */
export const postFor = new WeakMap();

const MONTHS = Array.from({ length: 12 }, (_, i) => i);
const [w, h] = [100, 20];
const marginsX = 3;
const x = d3.scaleTime([0, 11], [marginsX, w - marginsX]);

/** Month indicator. */
const monthDots = (date) => {
  const svg = d3.create("svg")
    .attr("class", "month-dots")
    .attr("width", w)
    .attr("height", h)
    .attr("viewBox", [0, 0, w, h])
    .attr("aria-hidden", true)
    .attr("focusable", false);

  svg.append("g")
    .selectAll("circle")
    .data(MONTHS)
    .join("circle")
    .attr("cx", (d) => x(d))
    .attr("cy", h / 2)
    .attr("r", (d) => (date && date.getMonth() === d ? 3 : 1.5));

  return svg.node();
};

const previewToggle = (p) => html`<button class="post-preview-toggle" type="button"
    aria-expanded="false" aria-label="Preview ${p.title}">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14">
    <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
</button>`;

/** Render a single row */
export const row = (p) => {
  const date = p.date ? new Date(p.date) : null;
  const year = date ? String(date.getFullYear() % 100).padStart(2, "0") : "";
  const image = toImageURL(p.image);

  const el = html`<div class="post" data-href="${p.href}">
      <a href="${p.href}"><div class="post-title">${p.title}</div></a>
      <div class="post-meta">
        ${image ? previewToggle(p) : html`<span class="post-preview-spacer" aria-hidden="true"></span>`}
        ${monthDots(date)}
        <div class="post-date">/${year}</div>
      </div>
    </div>`;

  postFor.set(el, p);
  return el;
};


const group = (label, items, filtering) => html`<section class="post-section">
    ${label ? html`<h2 class="section-title">${label}</h2>` : ""}
    ${items.length
    ? html`<div class="post-list">${items.map(row)}</div>`
    : html`<div class="post-empty">${filtering ? "Sorry, I tried but found no posts 🤷‍♂️" : ""}</div>`}
  </section>`;

/**
 * query → filtered posts from Inputs.search
 * posts → the unfiltered set, to tell "no posts" from "no match"
 * sections → [[slug, label], …] to group by; omit for a flat list
 */
export const postList = (query, posts, { sections } = {}) => {
  const filtering = query.length !== posts.length;

  if (!sections) return html`<div class="sections">${group(null, query, filtering)}</div>`;

  // A subpage's walk only sees its own directory, so every post comes back with
  // section: null. When the page declares exactly one section, that is the one
  // they belong to — otherwise "Other" swallows the whole list. With several
  // sections declared there is nothing to infer from, so null stays "Other".
  const fallback = sections.length === 1 ? sections[0][0] : null;
  const sectionOf = (p) => p.section ?? fallback;

  const known = new Set(sections.map(([slug]) => slug));
  const other = query.filter((p) => !known.has(sectionOf(p)));

  const groups = sections
    .map(([slug, label]) => [label, query.filter((p) => sectionOf(p) === slug)])
    .filter(([, items]) => items.length || !filtering) // hide empty sections while searching
    .map(([label, items]) => group(label, items, filtering));

  // if (other.length) groups.push(group("Other", other, filtering));

  // Every section hidden and nothing left over: say so rather than render blank.
  if (!groups.length) groups.push(group(null, [], filtering));

  return html`<div class="sections">${groups}</div>`;
};


const OPEN_DELAY = 150;
const CLOSE_DELAY = 100;
const GAP = 12;

export function postPreview() {
  const card = html`<div class="preview-card" popover>
    <img class="preview-image" alt="" decoding="async">
    <div class="preview-blurb"></div>
  </div>`;
  const cardImage = card.querySelector(".preview-image");
  const cardBlurb = card.querySelector(".preview-blurb");

  let openTimer, closeTimer, current = null, isOpen = false;

  const setExpanded = (row, value) =>
    row?.querySelector(".post-preview-toggle")?.setAttribute("aria-expanded", String(value));

  function place(row, x) {
    const r = row.getBoundingClientRect();
    const { offsetWidth: w, offsetHeight: h } = card;
    const fitsBelow = r.bottom + GAP + h <= innerHeight - GAP;
    card.style.left = `${Math.max(GAP, Math.min((x ?? r.left + r.width / 2) - w / 2, innerWidth - w - GAP))}px`;
    card.style.top = `${fitsBelow ? r.bottom + GAP : Math.max(GAP, r.top - GAP - h)}px`;
  }

  function show(row, post, x, closeOnScroll) {
    const src = toImageURL(post?.image);
    if (!row || !src) return;
    cardImage.src = src;
    cardImage.alt = `Preview of ${post.title}`;
    cardBlurb.textContent = post.blurb ?? "";
    setExpanded(current, false);
    current = row;
    if (!isOpen) card.showPopover(), isOpen = true;
    place(row, x); // after showPopover — offsetWidth needs layout
    setExpanded(row, true);
    if (closeOnScroll) addEventListener("scroll", hide, { once: true, passive: true, capture: true });
  }

  function hide() {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    if (isOpen) card.hidePopover(); // toggle handler resets the state
  }

  function open(row, post, x, closeOnScroll = false) {
    clearTimeout(closeTimer);
    clearTimeout(openTimer);
    openTimer = setTimeout(() => show(row, post, x, closeOnScroll), OPEN_DELAY);
  }

  function close() {
    clearTimeout(openTimer);
    closeTimer = setTimeout(hide, CLOSE_DELAY);
  }

  function toggle(row, post) {
    isOpen && current === row ? hide() : show(row, post);
  }

  card.addEventListener("toggle", (event) => {
    if (event.newState !== "closed") return;
    isOpen = false;
    setExpanded(current, false);
    current = null;
  });

  return { element: card, open, close, toggle };
}

export function bindPreview(list, preview) {
  list.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse") return;
    const link = event.target.closest(".post a");
    if (!link) return;
    const post = link.closest(".post");
    preview.open(post, postFor.get(post), event.clientX, true);
  });

  list.addEventListener("pointerout", (event) => {
    if (event.pointerType !== "mouse") return;
    const post = event.target.closest(".post");
    if (post && !post.contains(event.relatedTarget)) preview.close();
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest(".post-preview-toggle");
    if (!button) return;
    event.preventDefault();
    const post = button.closest(".post");
    preview.toggle(post, postFor.get(post));
  });

  return list;
}
