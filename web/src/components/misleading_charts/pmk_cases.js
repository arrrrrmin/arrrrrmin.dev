import * as Plot from "npm:@observablehq/plot";
import {pmk_colours} from "../colours.js";


export function MisleadingCriminalCases1({ data, filter_type, degree, width, height }) {
  const localdata = data
    .filter((d) => d.type === filter_type)
    .map((d) => ({ ...d, color: pmk_colours[d.type] }));
  const value_label = localdata.find((d) => d.year === 2024);
  const y = degree.level > 1 ? { ticks: 0, label: null } : {label: "Cases"};
  return Plot.plot({
    width,
    height,
    color: { legend: true },
    x: { tickFormat: "d", label: null, grid: true, insetLeft: degree.level > 1 ? -30 : 0 },
    y,
    marks: [
      Plot.line(localdata, { x: "year", y: "value", stroke: "color", strokeWidth: 3 }),
      ...(degree.level < 3
        ? [
            Plot.text([value_label], {
              x: value_label.year,
              y: value_label.value,
              text: (d) => `${(d.value / 1000).toFixed(1)}k`,
              fill: "color",
              dy: -15,
            }),
          ]
        : []),
      Plot.text([value_label], {
        x: 2020,
        y: localdata.find((d) => d.year === 2020).value,
        text: "type",
        fill: "color",
        fontSize: 14,
        fontWeight: 600,
        dy: -15,
      }),
    ],
  });
}

export function OriginalCriminalCases({ data, include_total, width, height }) {
  const localdata = data.map((d) => ({ ...d, color: pmk_colours[d.type] }));
  if (include_total){
    pmk_colours.Total = "#00b4d8";
  } else {
    delete pmk_colours.Total;
  }
  return Plot.plot({
    title: "Original report of politically motivated cases German Federal Criminal Office (BKA)",
    subtitle:
      "PMAK was split into foreign and religious ideology in 2017. Data provieded by bka.de",
    width,
    height,
    color: { legend: true, range: Object.values(pmk_colours), domain: Object.keys(pmk_colours) },
    y: { grid: true, tickFormat: "s", label: "Number of cases" },
    x: { tickFormat: "d", label: "Year" },
    marks: [
      Plot.line(localdata, { x: "year", y: "value", z: "type", stroke: "color" }),
      Plot.dot(localdata, { x: "year", y: "value", fill: "color" }),
      // Plot.text(localdata, { x: "year", y: "value", fill: "color", text: "type" }),
      ...(include_total ?
        [Plot.line(localdata, Plot.groupX({y: "sum"}, { x: "year", y: "value", stroke: d => "Total"})),
          Plot.dot(localdata, Plot.groupX({y: "sum"}, { x: "year", y: "value", fill: d => "Total" }))
        ]: []
      )
    ],
  });
}
