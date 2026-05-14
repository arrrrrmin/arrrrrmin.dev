---
title: "Misleading axis"
keywords:
  - Chart axis
  - Misleading visualisations
sql:
  ger_population: "../data/12411-degen.parquet"
  lifeexpect_and_gdp: "../data/lifeexpect_and_gdp.parquet"
  ger_microcensus: "../data/12211-degen.parquet"
  trafficdeaths: "../data/23211.parquet"
---

# Misleading axis

Let's discover how bad actory are using their tooling to manipulate or mislead us.
**Disclaimer: It's not only on them**.

## A sense of objectivity

Authors of a study ([the perceptual power of data visualisations](https://vis.cs.ucdavis.edu/vis2014papers/TVCG/papers/2211_20tvcg12-pandey-2346419.pdf)) found that a data visualisation increases the sense of objectivity because the presented numbers carry evidence. Also people are more likely to change their mind on a subject, if they see a data visualisation and when they do not have a strong opinion on the subject. There is a problem, because researchers cannot tell if it's visual representation or the numbers themselves are the reason for the viewers impressions.

## Two attack vectors per coin

But since there is this sense of objectivity, people become prone to believe data visualisation are more accurate and more evidence based compared to written text or spoken words. This presumed evidence is also the reason why some bad actors can apply tricks like:

1. display wrong data
2. inappropriate amount of data
3. bad design
4. textual context bias
5. statistical confusion

But readers also play a role in this game, because they have their own attack vectors like:

1. Not being used to read charts (graphicacy/numeracy)
2. Reading with their own confirmation bias
3. Consumption patterns like (attention spans)

It's both ways imho we need an informed society, but also need to acknowledge that there is a level of effort you have to invest to get to the ground of what is shown to you. For most people it's impossible to look up the data in their daily lives. People are flooded in social media so they can either live with it and take what they are served (in times of AI the content we get is becoming average at best) or reduce the media consumption to a level where they can actually parse the information and think about it.

We should avoid the impression that every single one of us has to have at least an oppinion on every topic. Imho this is one cause why we don't actually look things up, we'r missing the time and skills to do so.

## Bad design

Designing charts in a bad way may have different reasons. Maybe designers don't know better. Proofing bad intention could be a very challenging task. We will have an [example]() for just how hard it is to proof. Here is a check list what **not** to do:

1. Classic axis trickery
2. Choosing an inappropriate symbol
3. Misleading visual guidance
4. Introduce confusion through statistics (there are book shelves only regarding this topic)
5. Droping information
6. Inadequite conclusions

A bad visualisation design is usually one where you'r getting a false impression through the use of data. There are classics most people have experienced themselves like the _cherrypicker_, _base stealer_ or the _time gap_ ticks to mislead people. There is an extensive list with fun names for the bad chart design patterns collected by [flowingdata.com](https://flowingdata.com/projects/dishonest-charts/).

## Axis manipulation

```js
import { pmk_colours } from "../components/colours.js";
```

There are many ways you can adjust the axis to give a false impression.
Let me pull up an example from the German statistic on politically motivated crime.
The federal criminal police department (BKA) publishes a yearly report on this statistics.
Let me try to mislead you by comparing <span style="color: #936639; text-decoration: underline">right</span> and <span style="color: #c1121f; text-decoration: underline">left</span> motivated crimes:

```js
import {
  OriginalCriminalCases,
  MisleadingCriminalCases1,
} from "../components/chart_design/pmk_cases.js";
```

```js
const pmk_data = await FileAttachment("../data/pmk_cases_2024.json").json();
```

<div class="card full">

```js
const form_degrees = [
  { level: 1, label: "Misleading" },
  { level: 2, label: "Dangerous" },
  { level: 3, label: "Absurd" },
];
const form1 = view(
  Inputs.form({
    degree: Inputs.select(form_degrees, {
      format: (d) => d.label,
      label: "Level of mislead",
      value: form_degrees[0],
    }),
  }),
);
```

<h2>Misleading representation of polically motivated criminal cases in Germany</h2>
<div class="grid grid-cols-2" style="align-items: baseline">
${resize((width) => MisleadingCriminalCases1({data:pmk_data, filter_type: "PMK Right", ...form1, width, height: 250}))}

${resize((width) => MisleadingCriminalCases1({data:pmk_data, filter_type: "PMK Left", ...form1, width, height: 250}))}

</div>
</div>

The chart above is one that could cause trouble when you lazily gaze over it or if the actual case labels are even dropped.
Sure this is an extreme case and we all know if no axis the chart says basically nothing. But for inexperienced or naive
people this might become dangerous. The example above was actually a little challenge to me. I wanted to build it quickly using
Observable Plot and there is no way I found to make independent facets of the y axis. It would always like to link the right and left axis, so you cannot make them separate.
Now I know why.

This is the [original chart](https://www.bka.de/DE/UnsereAufgaben/Deliktsbereiche/PMK/PMKZahlen2024/PMKZahlen2024_node.html)
published by the federal department, with one exception I excluded the total cases, because I think it's
a bad habbit to publish the data and sums in the same plot. Summing all up will add another line that will skew the y scale and
makes the lines less comparable because all lines but the total line will be moved together.

```js
const include_total = await view(Inputs.toggle({ label: "Include total", value: false }));
```

<div class="card full">
${resize((width) => OriginalCriminalCases({data:pmk_data, include_total, width}))}
</div>

### When to start y at 0?

This was something that confused me a while. I felt somewhat confident that I'm not doing any harm, but I wasn't exactly sure
when to start at 0 and when not to. For bar charts yes sure start at 0 no problem there. But do I have to do it for lines too?

> In short: _No start where reasonable, but make sure it really makes sense._

The long answer, at least as far as Alberto Carlo (who wrote _How charts lie_) takes the topic, it's a bit more complex then just one or the other side. He's doing an example that is compareble with the following.

```js
import {
  ScalingPopulation,
  ScaleLogarithmicExample,
  ScaleDiscreteColors,
} from "../components/chart_design/axis_examples.js";
```

```sql id=[...population]
SELECT time, gender, value FROM "ger_population" WHERE gender = 'Insgesamt' AND time >= '1990-01-01' ORDER by time;
```

```js
const alter_y = view(Inputs.toggle({ label: "Zero y-scale", value: false }));
```

<div class="card full">
${resize((width) => ScalingPopulation({data: population, alter_y, width}))}
</div>

The above example is a bit extreme, but it illustrates the whole problem with all these _it should always be this way_-rules, but mostly it's situational. Sometimes what's good practise can turn out to be bad behaviour. If you'r not quite sure, take the middle way and give the axis a bit more value room.

## No axis is right if we see nothing

Beyond these simple axis topics, we can also have an example like the following, where data diverges strongly. Let's put up an example before we make the point. Here is a life expectancy vs GDP per capita chart.

```sql id=[...regions]
SELECT distinct(owid_region) FROM "lifeexpect_and_gdp" WHERE year = '2023' AND owid_region NOT NULL;
```

```sql id=[...years]
SELECT distinct(year) FROM "lifeexpect_and_gdp" WHERE owid_region NOT NULL ORDER BY year;
```

```js
const lexp_inputs = view(
  Inputs.form({
    use_logarithm: Inputs.toggle({ label: "Use log", value: false }),
    highlight_region: Inputs.select(regions, {
      format: (d) => d.owid_region,
      label: "Highlight region",
      value: regions.find((d) => d.owid_region === "Africa"),
    }),
    year: Inputs.range(
      d3.extent(years, (d) => d.year),
      { label: "Year", step: 1, value: years[years.length - 1].year },
    ),
  }),
);
```

```sql id=[...lexpect_and_gdp]
SELECT * FROM "lifeexpect_and_gdp" WHERE year = ${lexp_inputs.year} AND owid_region NOT NULL AND life_expectancy_0 > 50;
```

<div class="card">
${resize((width) => ScaleLogarithmicExample({data: lexpect_and_gdp, inputs: lexp_inputs, width}))}
</div>

Sometimes we need to change axis such that we can show certain things, but we need to take care what it suggests. With the logarithm toggle above the chart turned on we'll be able to see better how the data is behaving for Africa, select it in the region, you'll see what I mean when you toggle the logarithm on and off. On the other hand when we put up this chart it visually suggests a linear trend (turn on the trend line). But that's not true. Even though the logarithm is useful to see countries like Uganda, Zimbabwe, Niger or Togo it can suggest something which is not actually true.

What I want to say is that the visual appreance can trick people with less experience on statistics or math in general, which makes the chart designers responsible to choose the right tool at the right time, depending on audiance.

> "_Like this we can not show what we want to show_" might be one of the most frequent reasons why designers perform data digging voodoo. In reality data often looks odd or is nearly uninspectable because of very few outliers.

For example in the GDP vs life expectancy chart above I excluded entries that have a life expectancy lower than 50, because of reasons the Central African Republic has a life expectancy of 18 in 2022. In 2023 it's back to 57. In 2022 this chart would be so heavily scewed, we would not be able to read it.

## Color gaze

```js
const ger_states = await FileAttachment("../data/german-states.geo.json").json();
```

```sql id=[...employ_states]
SELECT distinct(employ_state) FROM "ger_microcensus" WHERE year = '2024';
```

```sql id=[...income_labels]
SELECT distinct(income_label) FROM "ger_microcensus" WHERE year = '2024';
```

```sql id=[...microcensus]
SELECT * FROM ger_microcensus WHERE year = '2024' AND employ_state = ${census_form.employ_state.state} AND gender = 'Insgesamt';
```

```js
// poverty risk with income < 1.378
const poverty_risked = ["1000 bis unter 1250 EUR", "500 bis unter 1000 EUR", "unter 500 EUR"];

let microcensus_data = d3
  .groups(microcensus, (d) => d.state)
  .map(([state, group]) => ({
    state,
    total: group.find((d) => d.income_label === "Insgesamt").value,
    children: d3
      .groups(group, (d) => d.income_label)
      .map(([income_label, income_group]) => ({
        income_label: income_label,
        value: income_group[0].value,
        ...income_group[0],
      })),
  }));
microcensus_data = microcensus_data.map((state) => ({
  ...state,
  children: state.children
    .filter((d) => d.income_label !== "Insgesamt")
    .map((d) => ({ percent: (d.value / state.total) * 100, ...d })),
  poverty:
    d3.sum(
      state.children.filter((d) => poverty_risked.includes(d.income_label)),
      (d) => d.value,
    ) / state.total,
}));

// console.log(JSON.parse(JSON.stringify(microcensus_data)));

const new_features = ger_states.features.map((feature) => ({
  ...feature,
  properties: {
    ...feature.properties,
    // ...microcensus_data
    //   .find((d) => feature.properties.state === d.state)
    //   .children.find((d) => d.income_label === census_form.income_label),
    poverty: (
      microcensus_data.find((d) => feature.properties.state === d.state).poverty * 100
    ).toFixed(2),
  },
}));

let updated_states = { ...ger_states, features: new_features };
```

We can get in trouble with descrete color schemes as well as with other scales.
But this one is particular easy to cheat with. Colors are very _short gaze_-friendly.
What I want to say is people tend to quickly scan it and move on, especially with filled
shapes like the map we now look at. Following we explore the possibilities to cheat with
colors and give a false impression by using these to some advantage.

> **Quick note**: These color scales are easy to get wrong I believe. Starting at 0 will
> make some data uncomparable, always fitting 6 colours to a scale of 7 or 8 percent
> risk poverty over state populations, also won't make much sense.

The following chart takes a look at the micro-census (a yearly survey to update the population
statistics) in Germany. I calculated a number that expresses the percentage of state population
that is in risk of poverty and mapped it onto this little state map. Again see how the
impression may change when you select different color scale presets.

```js
const select_labels = [
  "3500 EUR und mehr",
  "3000 bis unter 3500 EUR",
  "2500 bis unter 3000 EUR",
  "2000 bis unter 2500 EUR",
  "1750 bis unter 2000 EUR",
  "1500 bis unter 1750 EUR",
  "1250 bis unter 1500 EUR",
  "1000 bis unter 1250 EUR",
  "500 bis unter 1000 EUR",
  "unter 500 EUR",
];

const select_employ_state = [
  { state: "Erwerbslose aus Hauptwohnsitzhaushalten", label: "Unemployed" },
  { state: "Erwerbstätige aus Hauptwohnsitzhaushalten", label: "Employed" },
  { state: "Bevölkerung in Hauptwohnsitzhaushalten", label: "All (including others)" },
];

const census_form = view(
  Inputs.form({
    scale_settings: Inputs.select(["Quantile", "Fixed 0 start", "Custom"], {
      label: "Color settings",
    }),
    employ_state: Inputs.select(select_employ_state, {
      label: "Employment",
      format: (d) => d.label,
      disabled: true,
    }),
  }),
);
```

```js
const scale_start = view(
  Inputs.range([0, 50], {
    step: 1,
    label: "Scale start",
    value: 30,
    disabled: census_form.scale_settings !== "Custom",
  }),
);
```

<div class="card" style="max-width: 640px;">
${resize((width) => ScaleDiscreteColors({geo: updated_states, inputs: census_form, scale_start, width}))}
</div>

See for yourself how the chart changes if you set the custom setting and move the scale start. The colors will be recalculated. When turning the scale start to 0 all the chart is in dark colours. Likewise if we turn it the other way the chart looks like everything is good and a low risk of poverty is expected. Since the top part is fixed,
some states will still look darker red. If we'd also increase the scale end, this will also change.
This is just like the population chart in [When to start y at 0](#when-to-start-y-at-0).

> Personally I'd go with something like 25 to 30, even though it's a hard call to see a 33% of unemployed people are in risk of poverty in the state of Schleswig-Holstein labeled light red. For the sake of comparison I'd choose this.

## Please don't yell at readers

Strong wording is a very strong suggestive pattern, that tries to influence the readers mindset, before looking at the data itself. To explain the effect I'd need to read into cognative science or psychology literature and to be honest that's hard. So I just want to mention that there are sciencists, that knows how this psychological trick works and when I get to it I may read into this aswell, but for now I leave it there and just illustrate an example.

If you'r not aware in Germany we have a long history of driving fast. We are one of the very few countries on earth where people are allowed to drive up to 200+ km/h.
You can imagine that there's an emotional debate about speed limits going in Germany. With the debate in mind, take a look at the following yelling chart:

```sql id=[...traffic]
select *, value::BIGINT from trafficdeaths WHERE age_label = 'Total' ORDER BY year;
```

```js
function DeadlyTrafficAccidents({ width }) {
  const totals = traffic.filter((d) => d.gender === "total");
  const [tmin, tmax] = d3.extent(totals, (d) => d.value);
  const total_in_2024 = totals.find((d) => d.year === 2024);
  const percentage_label = (((tmax - total_in_2024.value) / tmax) * 100).toFixed(2);
  const extent_entries = totals.filter((d) => [1980, 2024].includes(d.year));

  return Plot.plot({
    subtitle: "Yearly traffic accidents are on 40+ years historic lows",
    width,
    marginLeft: 10,
    y: { label: null, tickFormat: "s", ticks: 0 },
    x: { label: "Year", tickFormat: "d" },
    marks: [
      Plot.line(totals, { x: "year", y: "value", strokeWidth: 2 }),
      Plot.text(["⚠️ This chart is misleading"], {
        frameAnchor: "top-right",
        fontSize: 14,
        fontWeight: 600,
      }),
      // Plot.arrow([{ x1: 2024, y1: tmax, x2: 2024, y2: total_in_2024.value, gender: "Total" }], {
      //   x1: "x1",
      //   y1: "y1",
      //   x2: "x2",
      //   y2: "y2",
      //   strokeWidth: 3,
      //   strokeLinejoin: "miter",
      //   headLength: 8,
      //   stroke: "#29bf12",
      // }),
      Plot.text([`${percentage_label}% less\n accidents`], {
        x: 2003,
        y: tmax / 2,
        fill: "#29bf12",
        dy: -20,
        fontSize: 20,
        fontWeight: 600,
      }),
      Plot.dot(extent_entries, { x: "year", y: "value", fill: "black" }),
      Plot.text([extent_entries[0]], {
        x: "year",
        y: "value",
        fontSize: 14,
        dy: -10,
        fontWeight: 600,
        textAnchor: "start",
        text: (d) => d3.format("d")(d.value),
      }),
      Plot.text([extent_entries[1]], {
        x: "year",
        y: "value",
        fontSize: 14,
        dy: 10,
        fontWeight: 600,
        textAnchor: "end",
        text: (d) => d3.format("d")(d.value),
      }),
    ],
  });
}
```

<div class="card" style="max-width: 640px">
<h2 style="font-size: 24px">Never before in history has driving been so save!</h2>

<div class="full">
${resize((width) => DeadlyTrafficAccidents({width}))}

</div>

</div>

There is a simple trick that can be resolved by careful reading, <span class="underline green">traffic accidents</span> or
in the long version **accidents involving vehicles** includes bicycles, cars, trains, airplain and so on. This is a simple example, but illustrates how the title or the charts inner design influences how we preceive data shown to us. An y axis that surprisingly stops right where the designer want's to make the point. Also a good example for situations where one should start y at 0. The full height of the chart is also used to make the point: **Line goes down**, paired with the oversized chart heading and a limited width (emphasize the steep decline) readers view is heavily guided towards what they should preceive, not what the actual data tells.

I like to emphasize that this yelling chart pattern is important, because when you hide data as a data expert, you need to distract readers from what you did, so they focus on the yelled section, not the data or the context.

# Conclusion

If we go back to the list in [Bad design](#bad-design), we only touched on the first and to be honest we'r not even close to having completed all common axis tricks that might be used to suggest false conclusions.
As soon as I get to it I'll add more examples to new pages to get more perspective.
