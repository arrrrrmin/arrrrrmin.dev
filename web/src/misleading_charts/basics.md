---
title: "Charting basics"
keywords:
  - Learning charts
  - Visual encodings
  - Symbols
  - Reading charts
sql:
  co2_and_gdp_per_capita: ../data/co2_and_gdp_per_capita.csv
---

```js
// Import all the modules
import {
  ChartVisualEncoding,
  ChartVisualEncodingSimpleCompare,
} from "../components/misleading_charts/visual_encodings.js";
```

```sql id=[...co2_and_gdp]
-- Load some data
SELECT * FROM "co2_and_gdp_per_capita" WHERE entity in ('World', 'United States', 'China', 'India', 'United Kingdom', 'Germany', 'France', 'Spain', 'Brazil', 'Canda', 'Mexico', 'Chile', 'Iran');
```

# Charting basics

First we need to learn what a visualisation is made of. We basically have three components to get started:
Visual encodings, symbols and annotation. From my personal experience I can tell you learning about the dry
theory enabled me to scan chart faster, which come is very handy even in day to day news cycles.

## Visual encodings

Encodings hold the data and give us the mechanisms to transform data into visuals.
Encodings are the smalles unit (the atom) of charts and most charts use multiple encodings to show data.
Known ones are: **Position**, **Length**, **Slope**, **Area** or **Color**.
Depending on which symbol you choose to encode your data you will use different encodings.
A bar chart usually used position and length, while a line chart also encodes data with a slope that is
created by the angle of the line between two points. You can see examples of common encodings in the vis.

## Symbols

Symbols take different encodings and transform you data through the encodings into a visual.
Commonly known ones are: **Lines**, **bars**, **rectangle**, **circle** or **arrows**.
Here are a few examples of encoding for traditional kind of charts.
The examples show different perspectives of the GDP (gross domestic product) and CO₂ emission development over the year for Spain.

```js
const ve_inputs = view(
  Inputs.form({
    symbol: Inputs.select(["Line", "Rectangle", "Rectangle 2", "Circle", "Arrow"], {
      label: "Select a symbol",
    }),
    encoding: Inputs.toggle({ label: "Encodings", value: true }),
  }),
);
```

<div class="card">
${resize((width) => ChartVisualEncoding({ co2_and_gdp, ve_inputs, width }))}
</div>

Don't get hung up in the data itself, we'll explore this data later on in more detail.
First we only need to understand how we get from data to a representation.

## Symbols are precieved differently

As you may already guess from the example before there are symbols that encode the same data differently from
others. The reason for this behaviour lives in the way we precieved shapes. Here is a simplified example:

```js
const ve_inputs2 = view(
  Inputs.form({
    symbol: Inputs.select(["Rectangle", "Circle"], {
      label: "Select a symbol",
    }),
  }),
);
```

<div class="card">
${resize((width) => ChartVisualEncodingSimpleCompare({ co2_and_gdp, ...ve_inputs2, width, height: 320 }))}
</div>

Most people don't think the circles are in the right proportion, since they think in terms of size (length, width or radius)
instead of area. The rectangles encoding is length and the circles encoding is radius/area.

## Annotation

Text on a chart is another layer to present data to you. Often in charts you don't get a classic scale,
but texts that are aligned without a ruler directly on the data. Annotations are mostly used to guide readers
or to highlight certain areas or aspects in the chart.


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

![Diagram comparing economic development, based on GDP with CO2 emissions per country. Image is 80% desaturated scaled so annotations about reading order is readable. Dips almost for all show countries, in 2020 during corona pandemic. Largest CO2 emittor amongst shown China, Germany, India, World average and others is the USA, followed by Germany.](../images/efficiently-reading-charts.png)


After annotating this image I noticed I got no african countries in there. I'm honestly sorry for the european gaze.
But as you can see not all mistages make designers bad actors.

The chart above is a little more complex chart for most readers, since we go away from e.g. the known time scale X axis on the bottom and used this scale for the GDP so we can draw line based on the position of x: GDP and y: CO₂ emission.
The years are labeled per coloured country line at the start and end. We have three scales (x, y and color), annotations and a information box on this map. Most non-expert readers will trouble skimming throug this chart. It took some time for me, the first time I saw such a chart.

> But using the reading order will prevent us from skimming, instead forces us to read the chart. That will increases the chance we get it right.

## Discover data

Sometimes you get the opportunity to look at data freely by choosing examples. Somthing I would wish to happen more often, especially in data driven news coverage. In these instances you can discover the data freely, but that also makes it harder for authors to tell a story, because they can't know what you where discovering in the data. There is a simple solution embed static charts like the one above, to show what you wanted to highlight. In the above example it's amongst others that emissions and GDP suffered for many countries during corona. When people read to the end, authors can choose to add the interactive chart so users can replicate the static chart image and discover more trends.

```js
import { ConnectedScatterPlot } from "../components/misleading_charts/gdp_co2.js";
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

```sql id=[...co2_and_gdp2]
SELECT * FROM "co2_and_gdp_per_capita" WHERE entity in ('World', 'United States', 'Germany', 'China', 'Brazil', 'Canada') AND year >= ${discover_inputs.start};
```

```sql id=[...selected_country_data]
SELECT * FROM "co2_and_gdp_per_capita" WHERE entity in (${discover_inputs.country}) AND year >= ${discover_inputs.start};
```

<div class="card">
${resize((width) => ConnectedScatterPlot({ co2_and_gdp: co2_and_gdp2, selected_country_data, width}))}
</div>

Personally I like [OurWorldInData](https://ourworldindata.org/), which is also the source of this data. Not only do we get very well researched data stories, but they give you the opportunity to download the data (even through an API as you can see in the [dataworks](https://github.com/arrrrrmin/arrrrrmin.dev/blob/main/dataworks/duckdb_sql/owid.sql) repository of this project) and see for yourself.
