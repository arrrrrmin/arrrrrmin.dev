import * as Plot from "npm:@observablehq/plot";
import { extent, max, scaleLinear } from "npm:d3";
import { colours } from "../colours.js";

const example2helpers = ({ data, inputs }) => {
  const scale = scaleLinear([inputs.ystart, inputs.yend], [400, 0]);
  const sortedBars = data.sort((a, b) => a.y - b.y); // Smallest y first
  const [ymin, ymax] = extent(data, (d) => d.y);
  const dataContext = {
    name: "Data",
    x: sortedBars[sortedBars.length - 1].x,
    y1: inputs.ystart,
    y2: ymax,
  };
  const relationContext = {
    name: "Relation",
    x: sortedBars[0].x,
    y1: ymin,
    y2: ymax,
  };
  const windowContext = {
    name: "Window",
    x: undefined, // Add to new undefined bar
    y1: inputs.ystart,
    y2: inputs.yend,
    anchor: "right",
  };
  const lines = [dataContext, relationContext, windowContext].map((c) => ({
    ...c,
    label: `${c.name}: ${Math.floor(scale(c.y1) - scale(c.y2))}px`,
  }));
  return { lines, domain: scale.domain() };
};

export function ScaleBaseExample({ data, inputs, width, height }) {
  const yDomain = [inputs.ystart, inputs.yend];
  const title = "The relation between each bar is revelant in categorical scales";
  const subtitle = "Play around with the y axis params to see how the chart changes";

  const helper_lines = example2helpers({ data, inputs }).lines;
  const contextLines = Plot.ruleX(helper_lines, {
    x: "x",
    y1: "y1",
    y2: "y2",
    strokeWidth: 1.5,
    markerEnd: "tick",
    markerStart: "tick",
  });

  const contextTips = Plot.tip(helper_lines, {
    x: "x",
    y1: "y1",
    y2: "y2",
    title: "label",
  });

  return Plot.plot({
    title: title,
    subtitle: subtitle,
    width,
    height,
    x: { label: null },
    y: { domain: yDomain, label: "Frequency" },
    color: {
      type: "ordinal",
      scheme: "Set2",
    },
    marks: [
      Plot.barY(data, {
        x: "x",
        y1: (d) => d.y,
        y2: (d) => inputs.ystart,
        fill: "x",
        rx: 2,
      }),
      contextLines,
      contextTips,
    ],
  });
}

export function ScalingPopulation({ data, alter_y, width }) {
  const localdata = data.map((d) => ({ ...d, time: new Date(d.time).getFullYear() }));
  const domain = alter_y ? [0, max(localdata, (d) => d.value)] : extent(localdata, (d) => d.value);
  const tipdata = [
    {
      ...localdata.find((d) => d.time === 2011),
      text: "Eu-wide census resulted more than 1 million people diff for population counts",
    },
  ];
  return Plot.plot({
    title: "German population since 1990",
    subtitle:
      "In 2011 an eu-wide census was carried out and is since then used as a new baseline. Data provided by destatis.",
    width,
    x: { label: "Time", tickFormat: "d" },
    y: { tickFormat: "s", label: "Population", domain },
    marks: [
      Plot.line(localdata, { x: "time", y: "value", stroke: colours.accent }),
      Plot.dot(localdata, { x: "time", y: "value", fill: colours.accent }),
      Plot.tip(tipdata, {
        x: "time",
        y: "value",
        title: "text",
        anchor: alter_y ? "top" : "right",
      }),
    ],
  });
}

export function ScaleLogarithmicExample({ data, inputs, width }) {
  const year_of_data = data[0].year;
  const fillOrHighlight = (d) =>
    d.owid_region === inputs.highlight_region.owid_region ? colours.accent : "black";
  return Plot.plot({
    title: `Life expectancy at birth (in ${year_of_data}) compared to GDP, per country`,
    subtitle:
      "GDP scale is in logarithm to actually see the highlighted countries of Africa. " +
      "Data provided by owerworldindata.org.",
    width,
    height: width - 100,
    x: {
      label: "GDP (USD) per person",
      type: inputs.use_logarithm ? "log" : "linear",
      base: inputs.use_logarithm ? 10 : null,
      grid: true,
    },
    y: { label: "Life expectancy (years)" },
    color: { legend: true },
    marks: [
      Plot.dot(data, {
        x: "gdp_per_capita",
        y: "life_expectancy_0",
        fill: fillOrHighlight,
        r: 3,
      }),
      Plot.text(
        data.filter((d) => d.owid_region === inputs.highlight_region.owid_region),
        {
          x: "gdp_per_capita",
          y: "life_expectancy_0",
          text: "entity",
          dy: 10,
          fill: fillOrHighlight,
        },
      ),
      Plot.tip(
        data,
        Plot.pointer({
          x: "gdp_per_capita",
          y: "life_expectancy_0",
          title: (d) =>
            `Country: ${d.entity}\nGDP: ${d.gdp_per_capita}\nLife expectancy: ${d.life_expectancy_0}\nYear:${d.year}`,
        }),
      ),
    ],
  });
}

export function ScaleDiscreteColors({ geo, inputs, scale_start, width }) {
  const color_params = {};
  if (inputs.scale_settings === "Fixed 0 start") {
    color_params.domain = [0, max(geo.features, (d) => d.properties.poverty)];
  } else if (inputs.scale_settings === "Custom") {
    color_params.domain = [scale_start, max(geo.features, (d) => d.properties.poverty)];
  }

  return Plot.plot({
    title: `Poverty rates of ${inputs.employ_state.label.toLowerCase()} persons based on the German micro-census`,
    subtitle:
      "A person in risk of poverty is by German definition earning  less then 1378€ monthly, as of 2024.",
    width,
    projection: { type: "mercator", domain: geo },
    color: {
      type: "quantile",
      // type: "linear",
      n: 6,
      scheme: "reds",
      label: `% of ${inputs.employ_state.label.toLowerCase()} in risk of poverty`,
      legend: true,
      tickFormat: ".1f",
      ...color_params,
    },
    marks: [
      Plot.geo(geo, {
        fill: (d) => d.properties.poverty,
        // fill: d => data.filter(D => D.state === d.state)[0].value,
        title: (d) => `${d.properties.state} ${d.properties.poverty}%`,
        tip: true,
        stroke: "black",
      }),
    ],
  });
}
