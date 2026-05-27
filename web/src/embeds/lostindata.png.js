// OG images need .png files

import { JSDOM } from "jsdom";
import sharp from "sharp";
import { getData, getChart } from "./lostindata.js";

const { window } = new JSDOM("");
const { document, DOMParser, XMLSerializer } = window;

const svgNode = getChart();
const xmlSerialiser = new window.XMLSerializer();
const svg = xmlSerialiser.serializeToString(svgNode);
const png = await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .png()
    .toBuffer();

process.stdout.write(png);