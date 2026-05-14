---
title: "Charting basics"
keywords:
  - Learning charts
  - Visual encodings
  - Symbols
sql:
  co2_and_gdp_per_capita: ../data/co2_and_gdp_per_capita.csv
---

```js
// Import all the modules
import {
  ChartVisualEncoding,
  ChartVisualEncodingSimpleCompare,
} from "../components/chart_design/visual_encodings.js";
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
