
export function projectOverview(items) {
    const wrap = el("div", "project-overview");
    for (const d of items) wrap.append(card(d));
    return wrap;
}

function card(d) {
    const a = el("a", "project-overview__card");
    a.href = d.path || d.href || "#";

    const media = el("div", "project-overview__media");
    if (d.preview) {
        const img = el("img", "project-overview__img");
        img.src = d.preview;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        if (d.previewWidth && d.previewHeight) {
            img.width = d.previewWidth;
            img.height = d.previewHeight;
        }
        media.append(img);
    } else {
        media.classList.add("is-fallback");
    }

    const body = el("div", "project-overview__body");
    const title = el("p", "project-overview__title");
    title.textContent = d.name || d.path || "Untitled";
    body.append(title);
    a.append(media, body);
    return a;
}

function el(tag, className) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    return n;
}
