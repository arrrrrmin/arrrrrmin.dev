import * as Plot from "npm:@observablehq/plot";
import { extent, groups } from "npm:d3";
import { colours } from "../colours.js";

function getCentersPerCountry(data) {
  const extents = groups(data, (d) => d.code).map(
    ([_, group]) => group[parseInt(group.length / 2)],
  );
  return extents;
}

function getYearExtentEntries(data) {
  return groups(data, (d) => d.code).map(([_, group]) => {
    const sorted = group.sort((a, b) => a.year - b.year);
    return [sorted[0], sorted[sorted.length - 1]];
  });
}

export function ConnectedScatterPlot({ co2_and_gdp, selected_country_data, width, height }) {
  const [min_year, max_year] = extent(co2_and_gdp, (d) => d.year);
  const data = co2_and_gdp.filter((d) => d.entity !== selected_country_data[0].entity);
  return Plot.plot({
    title: "Economic development compared to CO₂ emissions",
    subtitle: `GDP and CO₂ emission development of selected countries between ${min_year} and ${max_year}. Data provided by ourworldindata.org`,
    width,
    height: height ? height : width,
    marginLeft: 20,
    marginRight: 40,
    x: { label: "GDP per capita (USD)", grid: true, tickFormat: "s", },
    y: { label: "Emissions per capita (tons of CO₂)" },
    marks: [
      Plot.line(data, {
        x: "gdp_per_capita",
        y: "emissions_total_per_capita",
        z: "entity",
        curve: "catmull-rom",
      }),
      Plot.dot(
        getYearExtentEntries(data).flatMap((d) => d),
        {
          x: "gdp_per_capita",
          y: "emissions_total_per_capita",
          fill: "black",
          r: 4,
          z: "entity",
        },
      ),
      Plot.text(
        getYearExtentEntries(data).flatMap((d) => d),
        {
          x: "gdp_per_capita",
          y: "emissions_total_per_capita",
          text: (d) => `${d.year}`,
          z: "entity",
          fill: "black",
          stroke: "white",
          fontSize: 14,
          fontWeight: 600,
          dy: -8,
          textAnchor: "start",
        },
      ),
      Plot.text(getCentersPerCountry(data), {
        x: "gdp_per_capita",
        y: "emissions_total_per_capita",
        text: (d) => d.entity,
        z: "entity",
        fill: "black",
        stroke: "white",
        fontSize: 20,
        fontWeight: 600,
        dy: -20,
      }),
      // Interactive country
      Plot.line(selected_country_data, {
        x: "gdp_per_capita",
        y: "emissions_total_per_capita",
        z: "entity",
        stroke: colours.accent,
        curve: "catmull-rom",
      }),
      Plot.dot(
        getYearExtentEntries(selected_country_data).flatMap((d) => d),
        {
          x: "gdp_per_capita",
          y: "emissions_total_per_capita",
          fill: colours.accent,
          r: 4,
          z: "entity",
        },
      ),
      Plot.text(
        getYearExtentEntries(selected_country_data).flatMap((d) => d),
        {
          x: "gdp_per_capita",
          y: "emissions_total_per_capita",
          text: (d) => `${d.year}`,
          z: "entity",
          fill: colours.accent,
          stroke: "white",
          fontSize: 14,
          fontWeight: 600,
          dy: -8,
          textAnchor: "start",
        },
      ),
      Plot.text(getCentersPerCountry(selected_country_data), {
        x: "gdp_per_capita",
        y: "emissions_total_per_capita",
        text: (d) => d.entity,
        z: "entity",
        fill: colours.accent,
        stroke: "white",
        fontSize: 20,
        fontWeight: 600,
        dy: -20,
      }),
    ],
  });
}
