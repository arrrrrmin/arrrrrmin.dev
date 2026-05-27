import { JSDOM } from "jsdom";
import { getData, getChart } from "./lostindata.js";

const { window } = new JSDOM("");
const { document, DOMParser, XMLSerializer } = window;

const svgNode = getChart();
const xmlSerialiser = new window.XMLSerializer()
process.stdout.write(xmlSerialiser.serializeToString(svgNode), () => process.exit(0));
