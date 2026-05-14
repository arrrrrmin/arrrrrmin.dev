---
title: "Efficient chart reading"
keywords:
  - Reading charts
sql:
  co2_and_gdp_per_capita: ../data/co2_and_gdp_per_capita.csv
---

# Efficient chart reading

Alberto Cairo, author of [How charts lie](https://wwnorton.com/books/9781324001560) has but it in a nice and catchy phrase:

> _A good chart isn't an illustration but a visual argument or a part of an argument._

Just like literacy, graphicacy is a necessary skill to be able to follow a visual argument. And this skill is not only
(but especially) important for data presenters like chart designers or scientific practitioneers that e.g. wants to show their
results.

## Suggested order

He highlights a certain order so we have an order we can practise every time we see a chart:
The better we get at reading the visual argument, the faster we get and the better we can follow the argument made by the chart:

1. Title, introduction, caption and source
2. Measurements, units, scales and legends
3. Methods of visual encoding
4. Annotations inside the chart content
5. Take a bird's eye view to spot patterns

I practise this order (as of the writing) for a few months and start noticing that I usually have a good impression of what's coming after point the scales and units. You will spot the most bad actors by simply checking on the axis.
Others are more subtile, or not even proofable bad actors, but make such minor adjustments that we will only have a vage feeling by
following this order.

At least we don't gaze over it and may get it wrong. **We can also get a stable feeling for what designers want us to look at, which enables us to ask why or what we can not see.**

<div class="card full">
<img src="/images/efficiently-reading-charts.png" alt="Diagram comparing economic development, based on GDP with CO2 emissions per country. Image is 80% desaturated scaled so annotations about reading order is readable. Dips almost for all show countries, in 2020 during corona pandemic. Largest CO2 emittor amongst shown China, Germany, India, World average and others is the USA, followed by Germany."/>
<caption>An example with one chart that compares the GDP to CO₂ emission per country from 1990 to 2024 with annotated reading order.</caption>
</div>

After annotating this image I noticed I got no african countries in there. I'm honestly sorry for the european gaze.
But as you can see not all mistages make designers bad actors.

The chart above is a little more complex chart for most readers, since we go away from e.g. the known time scale X axis on the bottom and used this scale for the GDP so we can draw line based on the position of x: GDP and y: CO₂ emission.
The years are labeled per coloured country line at the start and end. We have three scales (x, y and color), annotations and a information box on this map. Most non-expert readers will trouble skimming throug this chart. It took some time for me, the first time I saw such a chart.

> But using the reading order will prevent us from skimming, instead forces us to read the chart. That will increases the chance we get it right.

## Discover data

Sometimes you get the opportunity to look at data freely by choosing examples. Somthing I would wish to happen more often, especially in data driven news coverage. In these instances you can discover the data freely, but that also makes it harder for authors to tell a story, because they can't know what you where discovering in the data. There is a simple solution embed static charts like the one above, to show what you wanted to highlight. In the above example it's amongst others that emissions and GDP suffered for many countries during corona. When people read to the end, authors can choose to add the interactive chart so users can replicate the static chart image and discover more trends.

```js
import { ConnectedScatterPlot } from "../components/chart_design/gdp_co2.js";
```

```sql id=[...countries]
SELECT distinct(entity) FROM "co2_and_gdp_per_capita";
```

```js
const discover_inputs = view(
  Inputs.form({
    country: Inputs.select(
      countries.map((d) => d.entity),
      { sort: true, label: "Country", value: "France" },
    ),
    start: Inputs.range([1990, 2023], {
      label: "Start year",
      step: 1,
      value: 1990,
      focus: false,
    }),
  }),
);
```

```sql id=[...co2_and_gdp]
SELECT * FROM "co2_and_gdp_per_capita" WHERE entity in ('World', 'United States', 'Germany', 'China', 'Brazil', 'Canada') AND year >= ${discover_inputs.start};
```

```sql id=[...selected_country_data]
SELECT * FROM "co2_and_gdp_per_capita" WHERE entity in (${discover_inputs.country}) AND year >= ${discover_inputs.start};
```

<div class="card">
${resize((width) => ConnectedScatterPlot({ co2_and_gdp, selected_country_data, width}))}
</div>

Personally I like [OurWorldInData](https://ourworldindata.org/), which is also the source of this data. Not only do we get very well researched data stories, but they give you the opportunity to download the data (even through an API as you can see in the [dataworks](https://github.com/arrrrrmin/arrrrrmin.dev/blob/main/dataworks/duckdb_sql/owid.sql) repository of this project) and see for yourself.
