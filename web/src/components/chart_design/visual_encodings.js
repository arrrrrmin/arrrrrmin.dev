import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import { colours } from "../colours.js";

export function ChartVisualEncoding({ co2_and_gdp, ve_inputs, width }) {
  const height = 400;
  const textOptions = { fontSize: 16, fontWeight: 500, fill: colours.accent };
  const lineOptions = { strokeWidth: 2, stroke: colours.accent };
  const dotOptions = { r: 5, fill: colours.accent };

  const spain_data = co2_and_gdp.filter((d) => d.entity === "Spain");

  let marks = [];
  let x = {};
  let y = {};
  let r = {};
  let c = {};
  let title = "";
  let subtitle = "";
  const symbol = ve_inputs.symbol;
  const show_encodings = ve_inputs.encoding;

  if (symbol === "Arrow") {
    title = "GDP change to previous year in Spain since 2010";
    x = { tickFormat: "d" };
    y = { grid: true };
    let arrow_data = spain_data.filter((d) => d.year > 2009);
    let dp_length = spain_data.filter((d) => d.year >= 2019 && d.year <= 2020);
    const y1y2 = {
      y1: Plot.window({ k: 2, reduce: "first" }),
      y2: Plot.window({ k: 2, reduce: "last" }),
    };
    marks = [
      Plot.arrow(
        arrow_data,
        Plot.map(y1y2, {
          x: (d) => d.year + 1,
          y: "gdp_per_capita",
          stroke: colours.light,
        }),
      ),
      ...(show_encodings
        ? [
            // Length
            Plot.arrow(
              dp_length,
              Plot.map(y1y2, {
                x: (d) => d.year + 1,
                y: "gdp_per_capita",
                ...lineOptions,
              }),
            ),
            Plot.text(["Length"], {
              x: dp_length[0].year + 1,
              y: d3.mean(dp_length, (d) => d.gdp_per_capita),
              dx: 4,
              textAnchor: "start",
              ...textOptions,
            }),
            // Position
            Plot.dot(dp_length, {
              x: 2020,
              y: "gdp_per_capita",
              fill: (d, i) => (i === 0 ? colours.accent : "transparent"),
              stroke: colours.accent,
            }),
            Plot.text(
              dp_length.map((d, i) => ({
                ...d,
                text: i === 0 ? "Position" : "Direction",
              })),
              {
                x: 2020,
                y: "gdp_per_capita",
                text: "text",
                dx: -4,
                textAnchor: "end",
                ...textOptions,
              },
            ),
          ]
        : []),
    ];
  }
  if (symbol === "Circle") {
    title = "GDP and CO₂ emission of Spain since 2000";
    subtitle = "Circle radius indicates CO₂ emission of the corresponding year";
    const circle_data = spain_data.filter((d) => d.year > 2000);
    const dp_area = spain_data.filter((d) => d.year === 2007);
    x = { tickFormat: "d", ticks: 10 };
    r = {
      range: [4, 20],
      domain: d3.extent(circle_data, (d) => d.emissions_total_per_capita),
    };
    marks = [
      Plot.dot(circle_data, {
        x: "year",
        y: "gdp_per_capita",
        r: "emissions_total_per_capita",
        stroke: colours.light,
      }),
      ...(show_encodings
        ? [
            // Area
            Plot.dot(dp_area, {
              x: "year",
              y: "gdp_per_capita",
              r: "emissions_total_per_capita",
              fill: colours.accent,
            }),
            Plot.text(["Position, Area"], {
              x: dp_area[0].year,
              y: dp_area[0].gdp_per_capita,
              z: dp_area[0].emissions_total_per_capita,
              dy: -30,
              ...textOptions,
            }),
          ]
        : []),
    ];
  }
  if (symbol === "Rectangle 2") {
    title = "CO₂ emission in different countries since 1990";
    x = {
      axis: "top",
      tickPadding: 0,
      tickFormat: "d",
      tickSize: 0,
      label: null,
      tickRotate: -90,
      insetLeft: -11,
    };
    y = { axis: "right", tickSize: 0, label: null };
    c = {
      type: "sequential",
      legend: true,
      scheme: "Greys",
      domain: [0, d3.max(co2_and_gdp, (d) => d.emissions_total_per_capita)],
      label: "CO₂ emissions per capita",
    };

    const dp_position = co2_and_gdp.find((d) => d.entity === "France" && d.year === 2012);
    const dp_color = co2_and_gdp.find((d) => d.entity === "Spain" && d.year === 2006);
    const localdata = width > 600 ? co2_and_gdp : co2_and_gdp.filter(d => d.year >= 2002);

    marks = [
      Plot.rect(localdata, {
        x: "year",
        y: "entity",
        fill: "emissions_total_per_capita",
        inset: 0.5,
        rx: 2,
        stroke: "black",
      }),

      ...(show_encodings
        ? [
            // Position
            Plot.dot([dp_position], { x: "year", y: "entity", ...dotOptions }),
            Plot.text([{ ...dp_position, text: "Position" }], {
              x: "year",
              y: "entity",
              text: "text",
              dx: 10,
              textAnchor: "start",
              ...textOptions,
            }),
            // Position
            Plot.dot([dp_color], { x: "year", y: "entity", ...dotOptions }),
            Plot.text([{ ...dp_color, text: "Color / Hue" }], {
              x: "year",
              y: "entity",
              text: "text",
              dx: 10,
              textAnchor: "start",
              ...textOptions,
            }),
          ]
        : []),
    ];
  }
  if (symbol === "Rectangle") {
    title = "GDP in Spain since 2010";
    x = { tickFormat: "d", tickSize: 0, label: null };
    const xy = { x: "year", y: "gdp_per_capita" };
    const dp_position = spain_data.find((d) => d.year === 2020);
    marks = [
      Plot.barY(
        spain_data.filter((d) => d.year >= 2010),
        { ...xy, stroke: colours.light, fill: null },
      ),
      ...(show_encodings
        ? [
            // Position
            Plot.dotX([dp_position], {
              x: 2020,
              y: dp_position.gdp_per_capita,
              ...dotOptions,
            }),
            Plot.text(["Position"], {
              x: 2020,
              y: dp_position.gdp_per_capita,
              textAnchor: "start",
              dx: 10,
              ...textOptions,
            }),
            // Length
            Plot.ruleX(dp_position, {
              x: 2020,
              y1: dp_position.gdp_per_capita,
              y2: 0,
              ...lineOptions,
            }),
            Plot.text(["Length"], {
              x: 2020,
              y: dp_position.gdp_per_capita / 2,
              dx: 4,
              textAnchor: "start",
              ...textOptions,
            }),
          ]
        : []),
    ];
  }
  if (symbol === "Line") {
    title = "GDP in Spain since 2020";
    x = { ticks: 3, tickFormat: "d" };
    y = { tickFormat: "s" };
    const xy = { x: "year", y: "gdp_per_capita" };
    const dp_position = spain_data.find((d) => d.year === 2021);
    const dp_length = spain_data.filter((d) => d.year >= 2021 && d.year <= 2022);
    marks = [
      Plot.line(
        spain_data.filter((d) => d.year >= 2020),
        { ...xy, stroke: colours.light },
      ),
      ...(show_encodings
        ? [
            // Length
            Plot.line(dp_length, { ...xy, ...lineOptions }),
            Plot.text(["Length"], {
              x: d3.mean(dp_length, (d) => d.year),
              y: d3.mean(dp_length, (d) => d.gdp_per_capita),
              dy: -20,
              ...textOptions,
            }),
            // Slope
            Plot.lineX(dp_length, {
              x: 2022,
              y: "gdp_per_capita",
              ...lineOptions,
            }),
            Plot.textX(["Slope"], {
              x: 2022,
              y: d3.mean(dp_length, (d) => d.gdp_per_capita),
              dx: 2,
              textAnchor: "start",
              ...textOptions,
            }),
            // Position
            Plot.dot([dp_position], { ...xy, ...dotOptions }),
            Plot.text(["Position"], {
              x: dp_position.year,
              y: dp_position.gdp_per_capita,
              dy: 10,
              ...textOptions,
            }),
          ]
        : []),
    ];
  }
  return Plot.plot({
    title,
    subtitle: subtitle + "Data provided by ourworldindata.org",
    width,
    height,
    marginLeft: symbol === "Rectangle 2" ? 20 : 60,
    marginRight: symbol === "Rectangle 2" ? 80 : 20,
    x,
    y,
    r,
    color: c,
    marks,
  });
}

export function ChartVisualEncodingSimpleCompare({ co2_and_gdp, symbol, width, height }) {
  const pandemic = co2_and_gdp
    .filter((d) => ["Germany", "India"].includes(d.entity) && [2019, 2020].includes(d.year))
    .sort((a, b) => b.year - a.year);

  const data = d3
    .groups(pandemic, (d) => d.entity)
    .map(([_, group]) => ({
      ...group[0],
      diff_emissions_total_per_capita:
        group[0].emissions_total_per_capita - group[1].emissions_total_per_capita,
      diff_gdp_per_capita: (group[0].gdp_per_capita - group[1].gdp_per_capita) * -1,
    }));
  const strokeOption = { fill: null, stroke: colours.accent, strokeWidth: 2 };
  let x =
    symbol === "Circle" ? { grid: true, label: null } : { grid: true, label: "GDP loss (US$)" };
  let y = symbol === "Circle" ? { grid: true, label: null } : { padding: 0.6, label: null };
  const marks =
    symbol === "Rectangle"
      ? [
          Plot.barX(data, {
            x: "diff_gdp_per_capita",
            y: "entity",
            ...strokeOption,
            rx: 2,
          }),
        ]
      : [
          Plot.dot(data, {
            x: "entity",
            y: "year",
            r: (d) => d.diff_gdp_per_capita * -1,
            ...strokeOption,
          }),
          Plot.text(data, {
            x: "entity",
            y: "year",
            text: (d) => `${d3.format(".2s")(d.diff_gdp_per_capita)}\nUS$`,
            fontSize: 16,
            fill: colours.accent,
            fontWeight: 500,
          }),
        ];

  return Plot.plot({
    title: "Per capita GDP loss in 2020 for India and Germany",
    subtitle: "See how you persive different symbols showing the exact same data",
    width,
    height,
    marginLeft: symbol === "Circle" ? 0 : 52,
    x,
    y,
    r: { range: [0, 60] },
    marks,
  });
}

