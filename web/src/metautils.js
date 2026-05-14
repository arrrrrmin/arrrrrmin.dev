import { html } from "npm:htl";
import { pages } from "/metadata.js";

export const getPagerList = ({ index }) => {
    return html`<h3>${pages[index].name}</h3><ul>
    ${pages[index].pages.map(({ name, path }) => html`<li><a href="${path}">${name}</a></li>`)}
  </ul>`
}