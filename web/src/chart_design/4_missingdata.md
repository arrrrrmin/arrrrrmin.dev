---
title: Missing data
keywords:
  - Misleading data
  - Datavis
  - Manipulative
  - Visualisations
sql:
  fertility_rates: "../data/fertility_rates.csv"
  gdp_per_co2: "../data/co2_and_gdp_per_capita.csv"
---

# Missing data

I want to recall the small list of manipulation attack vectors mentioned in [Misleading patters](/chart_design/3_misleadingpatterns#two-attack-vectors-per-coin):

- display wrong data
- inappropriate amount of data
- [bad design](/chart_design/3_misleadingpatterns#bad-design)
- textual context bias
- statistical confusion

At this point we mentioned a few examples that use bad design to either try to mislead us or that want to suggest something inappropriate (given the data shown).
In this section I'd like to show a misleading/manipulative tricks that use an _inappropriate amount of data_.

## Hidden data serves a purpose

That purpose is not to inform, but more likely to mislead or manipulate us. The subtile manipulation is what worries me most.
Here is an example originally made by Alberto Carlo (How to lie with charts). A very wide spread believe spread by the the extreme right and sometimes conservatives, is that feminism, atheism or _wokeness_ leads to sterility which in turn leads to migration.

> The forumlar right extremes prompt is simple: (Feminism, wokeness, atheism, plug in what every you feel) = sterility = migration

A small personal sidenote here: As long as people live in free democracies, it must be legitamite to choose not to have children. But apart from my maybe simplistic view regarding this topic, the position is often supported using fertility data (in our case it's EU scoped, since I live here). Extreme people want to give the impression that there is some kind of plan behind _sterility_ or forced migration.

If you are interested here are a few notes on the aspects of fertility data, provided by [owerworldindata](https://ourworldindata.org):
- [fertility rate](https://ourworldindata.org/fertility-rate): _it captures the average number of births per woman_
- [replacement rate](https://ourworldindata.org/grapher/replacement-fertility-rate?tab=table#explore-the-data): _expresses the fertility rate needed to keep the population size stable over time, without migration_
- [data source & further reading](https://ourworldindata.org/search?topics=Fertility+Rate&resultType=all)


The raw version is one _proof_ from extremes. I added a selection to highlight certain countries based on tendencies and criteria put up it the extrem claim.

```js
import { colours } from "../components/colours.js";

const polit_eu = ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden"]; // prettier-ignore
```

```sql id=[...fertility]
-- Query data to look at the claim europe is to queer, woke or atheistic to reproduce it's population
select f.entity, f.fertility_rate_hist, f.year, f.code, g.gdp_per_capita, g.owid_region from fertility_rates as f inner join gdp_per_co2 as g on g.code = f.code and g.year = f.year where g.owid_region NOT NULL and f.year >= 1990 ORDER BY f.year;
```

```js
const input_selections = [
  { label: "Raw", value: "raw", focus: [] },
  {
    label: "Less atheistic countries",
    value: "less_atheistic",
    focus: ["Poland", "Spain", "Portugal", "Hungary", "Russia"],
  },
  {
    label: "Southern countries",
    value: "southern",
    focus: ["Spain", "Portugal", "Italy", "Greece", "Malta", "Cyprus"],
  },
  {
    label: "Eastern countries",
    value: "eastern",
    focus: ["Slovakia", "Slovenia", "Romania", "Estonia", "Lithuania", "Albania", "Bulgaria"],
  },
  {
    label: "Secular countries",
    value: "secular",
    focus: ["Finland", "Sweden", "Denmark", "Belgium"],
  },
];

const fertility_inputs = view(
  Inputs.form({
    region: Inputs.radio(["Continental Europe", "European Union"], {
      label: "Region",
      value: "Continental Europe",
    }),
    focus: Inputs.select(input_selections, { label: "Focus", format: (d) => d.label }),
  }),
);
```

```js
// Add a function to group each country (individually per year) either low, medium or high income country
const region_fertility = await fertility.map((d) => ({
  ...d,
  income_region: d.gdp_per_capita < 10_000 ? "low" : d.gdp_per_capita < 20_000 ? "medium" : "high",
}));
// Filter based on `fertility_inputs.region`
const eu_fertility = region_fertility.filter((d) => {
  if (fertility_inputs.region === "European Union") {
    return polit_eu.includes(d.entity);
  }
  return d.owid_region === "Europe";
});
```

```js
// Find the first or last average value
function findAverageInYear({ data, year, scope }) {
  const data_average = d3.mean(
    data.filter((d) => d.year === year),
    (d) => d.fertility_rate_hist,
  );
  return { x: year, y: data_average, text: scope };
}

// We also need a function to filter the input data for certain countries to highlight
function getFocusCountries(data) {
  let countries = [];
  const selection = input_selections.find((d) => d.value === fertility_inputs.focus.value);
  return data.filter((d) => selection.focus.includes(d.entity));
}

// Average line mark scoped by the data you pass
function getAverageLineMark({ data, options, scope, text_options }) {
  const average_last = findAverageInYear({ data, year: 1990, scope });
  return [
    Plot.line(
      data,
      Plot.groupX({ y: "mean" }, { x: "year", y: "fertility_rate_hist", ...options }),
    ),
    Plot.textY([average_last], {
      y: "y",
      x: "x",
      text: "text",
      textAnchor: "start",
      dy: -10,
      fill: options.fill || options.stroke,
      fontSize: 14,
      fontWeight: 600,
      ...text_options,
    }),
  ];
}

// A function to plot a single country use it for inline plotting
function getFertilityPlotLineMark({ width, height, data, country, stroke }) {
  const country_data = data.filter((d) => d.entity === country);
  const [start, end] = d3.extent(country_data, (d) => d.year);
  const dots_data = country_data.filter((d) => [start, end].includes(d.year));
  return Plot.plot({
    width,
    height,
    axis: null,
    marginLeft: 2,
    marginTop: 2,
    marginRight: 3,
    marginBottom: 3,
    marks: [
      Plot.line(country_data, {
        x: "year",
        y: "fertility_rate_hist",
        z: "entity",
        stroke: stroke,
        strokeWidth: 1,
      }),
      Plot.dot(dots_data, {
        x: "year",
        y: "fertility_rate_hist",
        fill: stroke,
        r: 1.5,
      }),
      Plot.ruleY([2.1], { stroke: "black", strokeWidth: 1.5, strokeDasharray: [4, 3] }),
    ],
  });
}

const inlinePreset = (country) =>
  getFertilityPlotLineMark({
    width: 60,
    height: 18,
    data: region_fertility,
    country: country,
    stroke: "black",
  });
```

```js
// EU scoped fertility chart with interactive elements
function fertilityEUChart({ width, data, scope }) {
  const average_last = findAverageInYear({ data, year: 1990, scope });
  const data_in_focus = getFocusCountries(data);
  return Plot.plot({
    title: `Fertility rates ${scope} wide`,
    subtitle:
      "Each line represents one country. Replacement rate is the fertility rate to keep a population stable over long time (usually ~2.1)",
    width,
    height: 400,
    y: { label: "Fertility rate" },
    x: { label: "Year", tickFormat: "d" },
    color: { legend: fertility_inputs.focus.value !== "raw" },
    marks: [
      Plot.line(data, {
        x: "year",
        y: "fertility_rate_hist",
        z: "entity",
        stroke: colours.light,
        strokeOpacity: 0.5,
        mixBlendMode: "multiply",
      }),
      Plot.ruleY([2.1], { stroke: "#255f85", strokeWidth: 2, strokeDasharray: [4, 3] }),
      Plot.text(["2.1 (replacement rate)"], {
        frameAnchor: "left",
        y: 2.1,
        dy: -10,
        fontSize: 14,
        fill: "#255f85",
        textAnchor: "start",
        fontWeight: 600,
      }),
      getAverageLineMark({
        data: data,
        scope: "EU average",
        options: {
          stroke: "#255f85",
          strokeWidth: 2,
          strokeDasharray: [2, 4],
        },
      }),
      // Data in focus
      Plot.line(data_in_focus, {
        x: "year",
        y: "fertility_rate_hist",
        z: "entity",
        stroke: "entity",
      }),
      Plot.text(["⚠️ This chart is misleading"], {
        frameAnchor: "top-right",
        fontSize: 14,
        fontWeight: 600,
      }),
    ],
  });
}
```

<div class="card">
${resize((width) => fertilityEUChart({width, data: eu_fertility, scope: "EU"}))}
</div>

When we select the raw version of this misleading vis, we can see many line, the replacement rate and how far the european average is from the _reproduction target_. The charts for continental Europe and the European Union only differ marginally.
The Y axis is alittle distorted on continental Europe mode, since Albania ${inlinePreset("Albania")} had one of the highest fertility rates and experienced a huge decreace since 1990. Aside from this outlier both behave the same and show the average below the replacement line.

When you highlight some of the countries in this suggestive chart, and inspect _less atheistic countries_ for example Poland ${inlinePreset("Poland")} or Spain ${inlinePreset("Spain")} are known to have a population with strong christian tradition. They are all far below the 2.1 line. So the atheism part seems to be false.

What about the _wokeness_? I think culturally countries like russia should meet the right wing narrative, right? They are not known to politically restrict LGBTQAI+ movements and they have a wide spread orthodox christian population. Masters of reproduction one would thing, but no ${inlinePreset("Russia")} although Russia's fertility rate was rising until 2015 it is declining slowly but regularly. Not for once crossing the magical 2.1 line.

## That was cherry picking

We can go on cherry picking and digging inside a biased chart but the actual problem with this chart is that is does

- Force a story bias (claim first data second)
- Select (cherry picking) data that at first glace supports the claim
- Distract from the missing comparibility by narrowing down to a mean

If we stop thinking about the claim inside the data this claim presents we might be able to find the hints for the reasons why Europe's fertility rate is so low. In the section on axis variants and bad design habbits we compared [GDP per person to life expectancy](/chart_design/3_misleadingpatterns#no-axis-is-right-if-we-see-nothing). This data comes in handy now. Join the yearly GDPs per person per country with the fertility rates and calculate the fertility mean based on GDP, instead of countries:

```js
const gdp_spread = 5000;
const fertility_gdp = view(
  Inputs.range([gdp_spread, 55000 - gdp_spread], {
    step: 1000,
    label: "Center GDP",
    value: gdp_spread * 2,
  }),
);
```

```js
// Global fertility chart
function fertilityGlobalChart({ width, data, scope, center_gdp }) {
  const data_by_dgp = data.filter(
    (d) =>
      center_gdp - gdp_spread <= d.gdp_per_capita && d.gdp_per_capita <= center_gdp + gdp_spread,
  );
  const variance = d3.variance(data_by_dgp, (d) => d.fertility_rate_hist);

  const bottom_gdp_labels = Math.floor(center_gdp - gdp_spread);
  const top_gdp_labels = Math.floor(center_gdp + gdp_spread);
  return Plot.plot({
    title: `Fertility rates ${scope} wide`,
    subtitle:
      "Each line represents one country. Replacement rate is the fertility rate to keep a population stable over long time (usually ~2.1)",
    width,
    height: 600,
    y: { label: "Fertility rate", domain: [0.5, 8.0] },
    x: { label: "Year", tickFormat: "d" },
    marks: [
      Plot.line(data, {
        x: "year",
        y: "fertility_rate_hist",
        z: "entity",
        stroke: colours.light,
        strokeOpacity: 0.5,
        mixBlendMode: "multiply",
      }),
      Plot.ruleY([2.1], { stroke: "#255f85", strokeWidth: 2, strokeDasharray: [4, 3] }),
      Plot.text(["2.1 (replacement rate)"], {
        frameAnchor: "right",
        y: 2.1,
        dy: -10,
        fontSize: 14,
        fill: "#255f85",
        textAnchor: "end",
        fontWeight: 600,
      }),
      getAverageLineMark({
        data: data_by_dgp,
        scope: `Average by GDP ${bottom_gdp_labels} and ${top_gdp_labels}`,
        options: {
          stroke: colours.accent,
          strokeWidth: 2,
          strokeDasharray: [2, 4],
        },
        text_options: {
          dy: -20,
        },
      }),
      Plot.areaY(
        data_by_dgp,
        Plot.groupX(
          { y1: "mean", y2: "mean" },
          {
            x: "year",
            y: "fertility_rate_hist",
            y1: (d) => d.fertility_rate_hist - variance, // - variance_per_year[d.year] / 2,
            y2: (d) => d.fertility_rate_hist + variance, // + variance_per_year[d.year] / 2,
            fill: colours.accent,
            opacity: 0.1,
          },
        ),
      ),
      // Still got income_region === "low", "medium" or "high" available if needed
    ],
  });
}
```

<div class="card">
${resize((width) => fertilityGlobalChart({width, data: region_fertility, scope: "World", center_gdp: fertility_gdp}))}
</div>

When you use the Center GDP knob fertility rates are grouped by countries with center GDP ± 5000 US$ per capita. From this rage we calculate the mean again and we can find the pattern. It's roughly the richer average population of a country (higher GDP) the lower the fertility rate. We can also see this behaviour by watching the variance of the mean (how far the fertatility rates are for a GDP group) which represented by the area around the pink line. It's pretty wide (measurements vary more) in low income regions, while int narrows down the higher the GDP is. Statistically seen this also supported in very high GDP regions, because there are fewer regions in the world.

```sql id=[...gdp_averages]
-- Query to see how many countries exist that actually have a GDP around 55k, and beyond
select
  mean(gdp_per_capita) as average_gdp,
  mean(f.fertility_rate_hist) as average_fertility_rate,
  first(g.owid_region) as owid_region,
  g.entity
from gdp_per_co2 as g
inner join fertility_rates as f on g.code = f.code
where g.owid_region NOT NULL and g.year >= 1990 GROUP BY g.entity;
```

```js
// Add a dodge chart to show how few countries exist above 50k DGP
function dodgeGDPGroups({ width, height, data }) {
  const thresholds = d3.range(
    0,
    d3.max(gdp_averages, (d) => d.average_gdp),
    gdp_spread * 2,
  );
  const binner = d3
    .bin()
    .value((d) => d.average_gdp)
    .thresholds(thresholds);
  const gdp_groups = binner(data).flatMap((bin, i) =>
    bin.map((b) => ({ ...b, center_gdp: (thresholds[i] + gdp_spread) / 1000 })),
  );
  return Plot.plot({
    title: "Average GDP and fertility rate per country since 1990",
    subtitle: "Center GDP groups measured in 1000 per US-Dollar per person",
    width,
    height,
    fy: { type: "band", grid: true, label: "Center average GDP (in k US$/person)" },
    x: { label: "Average fertility rate" },
    color: { legend: true },
    marks: [
      Plot.dot(
        gdp_groups,
        Plot.dodgeY("middle", {
          fy: "center_gdp",
          x: "average_fertility_rate",
          stroke: "owid_region",
          strokeWidth: 2,
          r: 4,
        }),
      ),
      Plot.dot(
        gdp_groups,
        Plot.pointer(
          Plot.dodgeY("middle", {
            fy: "center_gdp",
            x: "average_fertility_rate",
            fill: "owid_region",
            r: 4,
          }),
        ),
      ),
      Plot.tip(
        gdp_groups,
        Plot.pointer(
          Plot.dodgeY("middle", {
            fy: "center_gdp",
            x: "average_fertility_rate",
            fill: "owid_region",
            r: 4,
            frameAnchor: "top-right",
            title: (d) =>
              [
                d.entity,
                `Average fertility: ${d.average_fertility_rate.toFixed(2)}`,
                `Average GDP: ${d.average_gdp.toFixed(2)}`,
              ].join("\n"),
          }),
        ),
      ),
    ],
  });
}
```

<div class="card" style="max-width: 640px">
${resize((width) => dodgeGDPGroups({width, height: 800, data: gdp_averages}))}
</div>

Btw the chart above reproduces the same behaviour and shows the reason why it's good to capped GDP ranges at 55k GDP. There are very few countries with such a high GDP. Calculating a mean on only few (10 or less) examples would also give a wrong impression. That's also a way to distort a charts metric towards the designers liking. I did that too, I chose to not include certain countries. But I did it to prevent a false impression.

Now we gained a new perspective, by increasing the data scope and found a more reasonable explaination for the low fercility rate in Europe, compared to the initial claim driven (mostly but not only) by nationalist and right extremists.

> **Disclaimer**: This could also happend when designers are simply not thinking long enough about a chart, but for certain groups of people like right wing activists, it's a plesent gift to but their world view on top of a chart and try to fish for believers.

## Measures on a spectrum

Above we saw how the presented data and the corresponsing average tricks people into believing something totally unrelated. Statistic measures like mean, median, variance are used to narrow down dimension of the data to a single value. What happens is we reduce a spectrums coming from one or more dimensions of data to a single value. If we don't really know what these measures express, we become prone to false suggestions. The problem with a single value is we can't reverse engineer what the original spectrum looked like. We simply got to believe the value. So in short statistical measures can also be used to hide data from readers.

## To be continued

I'll continue this learning journey as soon as I get to it.
