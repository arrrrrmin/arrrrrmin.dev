---
title: "NZZ scrolly telling the German economic crisis"
keywords:
  - Learning
  - Datavis
  - DDJ
  - Scrolly telling
  - Redesign charts
sql:
  prodindexes: "../data/redesigns/42153-minimal.parquet"
---

```js run=true
const helpers = {
  colors: {
    original: {
      orange: { light: "#F8E3E0", dark: "#CE4631" },
      red: { light: "#F3D9E5", dark: "#AC004F" },
      green: { light: "#E3EEE6", dark: "#478C5B" },
      blue: { light: "#DDEDF2", dark: "#1B87AA" },
    },
    alter: {
      orange: { light: "#F7E9DF", dark: "#F59D4B" },
      red: { light: "#F3D9E5", dark: "#CE4760" },
      green: { light: "#E3EEE6", dark: "#78BC61" },
      blue: { light: "#DDEDF2", dark: "#6290C8" },
    },
  },
};

const labels = {
  key: html`<span
    style="background: ${helpers.colors.original.orange.light}; color: ${helpers.colors.original
      .orange.dark}; text-decoration: underline; padding: 0px 4px; border-radius: 4px;"
    >key</span
  >`,
  traditional: html`<span
    style="background: ${helpers.colors.original.red.light}; color: ${helpers.colors.original.red
      .dark}; text-decoration: underline; padding: 0px 4px; border-radius: 4px;"
    >traditional</span
  >`,
  surprise: html`<span
    style="background: ${helpers.colors.original.green.light}; color: ${helpers.colors.original
      .green.dark}; text-decoration: underline; padding: 0px 4px; border-radius: 4px;"
    >surprise</span
  >`,
  structural: html`<span
    style="background: ${helpers.colors.original.blue.light}; color: ${helpers.colors.original.blue
      .dark}; text-decoration: underline; padding: 0px 4px; border-radius: 4px;"
    >structural</span
  >`,
};
```

# NZZ scrolly telling the German economic crisis

I stumbled over [this NZZ data story](https://www.nzz.ch/visuals/die-deutsche-industrie-schrumpft-diese-zahlen-belegen-wie-dramatisch-der-abstieg-wirklich-ist-ld.1911067) of November 2025, because I was looking through the NZZ's data visualisation department.
Out of curiousity I sometimes look through the works of DDJ (data driven journalism) teams even when I didn't subscribed to it. Sometimes there are free articles like in this case.

## What is it about

The German economy is crumbling according to the article at hand and they can proof just how bad it is with data: "_The decline began gradually—and long before the pandemic. The following charts show how industrial production in Germany has evolved since 1995—across nine sectors, ranging from the automotive industry to the arms industry._"

The authors chose to present the largest portion of the story as a _scrolly telly_. Meaning you get data and facts as you scroll through the page. Using this navigation pattern users are told a story, as the name suggests. It's a very popular web presentation pattern (as of March 2026).

## The story at scroll

This is a longer section since there are different chart layouts due to the scrolly telling format. First we are introduced to the data and as we scroll we go through the following steps. **You can [skip this section](#about-the-data) as it's very long and tedious (like the original)**.

1. We are shown five line/area charts
   - three in a red color (labeled ${labels.key} industries)
   - two in dark red color (${labels.traditional} industries)
   - below we find four hidden lines
2. The upper lines are hidden now and the lower ones are introduced as:
   - two green lines (labeled as ${labels.surprise} industries)
   - two more for ${labels.structural} industries (meaning sucessors) in blue
3. The bottom lines are hidden again and the key industries take over the space
   - This time they get more space since the two traditional are hidden too
   - Axis appear y are percentages, x is time/year spanning from 1995 to 2025
   - Also we got two dashed vertical lines appearing in 2008 (financial crisis) and 2020 (corona pandemic)
   - At first glace all these chart behave the same
   - Line charts are growing until 2008 and stay almost static until before 2020
   - We also get a fixed bottom div with an question mark icon labeled "Whats the percentages about?", we get to this one later.
4. The first chart is highlighted and reveals it's the car industry
   - employs 720k people at 24% industry revenue share
5. The car industry chart is seperated with a vertical line that highlights the section since 2018.
   - It tells electic cars hits the classic supply chain and 120k jobs are gone.
6. The car industry chart moves forward to 2023 (_next shock_)
   - China produces subsidized cars, shock stays to today and energy prices and CO₂ regualtion hit this industry the text box says.
7. Next mechanical engineering
   - Another text box informs us 930k people employsed with 11% revenue share
8. Next highlight section, again in 2018
   - Industry slows down, demand goes back, china strong and low energy and labor costs, as a result 70k jobs are gone, the text box informs us
9. Moving on to the third key industry we now know is the chemical industry
   - 320k jobs at 6.7% industry share
10. You guessed it we hightlight another section but no! It's 2022.
    - CO₂ pricing, energy transformation and nuclear phase-out make energy expensive
    - Even worse environment and climate regulations also target this industry, we are told by a lovely text box
    - Another text box, just to shake it a bit up plants are closed in Frankfurt and Ludwigshafen. China in contrast keeps growing.
11. We surpassed the key- and move on the the traditional industries. First: clothing and textiles
    - More text boxing 64k employees, ...
    - Textiles once been a heavy weight for the German industry, ...
    - This is the first line/area chart we see that is degrowing heavily

At this point I'm already asleep. At this point I'm just writing for achivements sake. Let's scroll on:

12. Next text box, ... breweries
    - Not as rapidly degrowing but noticable. 23k employees in the beer industry, ...
    - Oh another text box informs us that demographic change makes older drink less younger differently
    - Exports static, while netherlands companies dominate interationally
    - Interesting I always had the impression young people drink way less compared to older, but anyways.
13. the former charts are hidden now and we are shown the latter 4 charts. But the labels have changed
    - blue is now "against the trend" are post crisis better than before
    - green "just risen" industries are rising through tax money, unknown if they succeed asia is strong the text box tells us
14. Scrolling on we see the batterie industry
    - Another variant this chart (an the other green one) is not sharing the space with other expanded charts thus it's larger.
    - The first rising chart this lightly growing until 2020
15. Highlight section at 2020, our loyal companion the horizontally centered text box is speaking:
    - Rapid growth due to e-car boom, drop in 2023 due to governmental funding is running out.
    - Past 2023 the line is continuing to grow on a volatile coarse
16. Next green chart: Weapons industry 15k employees, 0.6 global revenue share
    - Since cold war manufacturing of weapons and ammunition was drifts along states the text box
    - The chart is the most volatile shape and inceases lately
17. Highlight section at 2022 Ukrain war, weapon industry grows at steep angle
    - Tank industry is not included (often confidential, thus not included)

We almost got it, now hang in there.

18. Shared view next we get the last two (blue) lines (logically at half height)
    - First highlighted _chip industry_ 77k employees, 1.7% total revenue share
    - Car and instry chips produced by Bosch and Infineon. TSMC also coming to Germany
    - Thanks to a billions (1000k, German and English billion differ) in funding program
    - The blue lines both growing at a stable rate
19. Medical tech industry - 110k employees, 1.3% industry revenue share - increasingly older people make this sector grow reliably over the shown time

## About the data

Sorry If this bothered you a little, but I had to finish this an for me it felt exactly the same way it reads. At one point I even felt like in an IKEA store walking the indended way when you don't know where the shortcut is. You get the point of beeing guided. But I want to analyse and learn from their work so first I want to see what we got without the scrolling.

Therefore we need to find out what data was used, the authors added a note at the bottom of their data story, which says the used destatis data (data from federal statistics office). If you go to the [destatis database](https://www-genesis.destatis.de/datenbank/online) and type in 'production index', you get the statistics they used.
More precisely it's the statistics code [42153-0003](https://www-genesis.destatis.de/datenbank/online/statistic/42153/). You can find the way I processed the data in the [repos datawork folder](https://github.com/arrrrrmin/arrrrrmin.dev/tree/main/dataworks).

The authors additionally said: _The figures are adjusted for price, calendar and seasonal effects_. So we know we need to get the corrected X13 series. Make a few adjustments so we get a date type in the data base by concating `year` and `month`. This comes handy now because we need to reduce the data to the articles time span. Which I believe is around May or July. Doesn't really matter in this case since a few months won't make much of a difference in a 35 year scope.

```sql id=[...prodindexes]
SELECT *, concat(year, '-', month, '-01')::DATE as time FROM 'prodindexes' WHERE processed_level_code = 'X13JDKSB' AND year >= 1995 AND year < 2026 AND time < '2025-09-01'::DATE AND industry_code IN ('WZ08-29', 'WZ08-28', 'WZ08-20', 'WZ08-13', 'WZ08-1105', 'WZ08-272', 'WZ08-254', 'WZ08-261', 'WZ08-325');
```

```sql id=[...windowedindexes]
SELECT *, concat(year, '-', month, '-01')::DATE as time, avg("value") OVER seven AS moving_avrg FROM 'prodindexes' WHERE processed_level_code = 'X13JDKSB' AND year >= 1995 AND year < 2026 AND time < '2025-09-01'::DATE AND industry_code IN ('WZ08-29', 'WZ08-28', 'WZ08-20', 'WZ08-13', 'WZ08-1105', 'WZ08-272', 'WZ08-254', 'WZ08-261', 'WZ08-325')
WINDOW seven AS (
    PARTITION BY "industry_code"
    ORDER BY "time" ASC
    RANGE BETWEEN INTERVAL 3 MONTH PRECEDING
              AND INTERVAL 3 MONTH FOLLOWING)
ORDER BY 1, 2;
```

<div class="card">
${Inputs.table(windowedindexes)}
</div>

```js
// Keep this here so I can use it independently in other js cells
const codes = [
  "WZ08-29", // Kraftwagen und Kraftwagenteilen
  "WZ08-28", // Maschinenbau
  "WZ08-20", // chemischen Erzeugnissen
  "WZ08-13", // Textilien
  "WZ08-1105", // Bier
  "WZ08-272", // Batterien
  "WZ08-254", // Waffen
  "WZ08-261", // elektronischen Bauelementen und Leiterplatten
  "WZ08-325", // med. u. zahnmed. Apparaten und Materialien
];
```

```js
// Cell runs before it's value `y_domains` is used in `y_domains_map`
const y_domains = codes.map((code) => {
  return [0, d3.max(windowedindexes.filter((d) => d.industry_code === code), (d) => d.moving_avrg)];
});
```

```js
const en_labels = [
  "Automotive",
  "Mech. Engineering",
  "Chemicals",
  "Textile",
  "Breweries",
  "Batteries",
  "Weapons and ammunition",
  "Chip industry",
  "Medical technologies",
];
const color_labels = ["orange", "orange", "orange", "red", "red", "green", "green", "blue", "blue"];
const en_labels_map = Object.fromEntries(d3.zip(codes, en_labels));
const y_domains_map = Object.fromEntries(d3.zip(codes, y_domains));
const colors_map = Object.fromEntries(d3.zip(codes, color_labels));
const scaling_per_sector_map = Object.fromEntries(
  codes.map((c) => [c, d3.scaleLinear(y_domains_map[c], [0, 100])]),
);
const getIndexByCode = (code) => codes.indexOf(code);
const isInCodes = (code) => codes.includes(code);
```

```js
const sector_events = [
  {
    time: new Date(Date.UTC(2018, 0, 1)),
    text: "In 2018 the need for electric cars made different for formerly good running supply chains unneeded",
    value: 60,
    industry_code: "WZ08-29",
  },
  {
    time: new Date(Date.UTC(2023, 0, 1)),
    text: "The exports to china where crumbling. China produces cars, especially electric cars themselves.",
    value: 30,
    industry_code: "WZ08-29",
  },
  {
    time: new Date(Date.UTC(2018, 0, 1)),
    text: "The mechanical engineering sector has also been struggling since 2018. Demand is falling, and China is emerging as an increasingly formidable competitor",
    value: 50,
    industry_code: "WZ08-28",
  },
  {
    time: new Date(Date.UTC(2022, 0, 1)),
    text: "With the end of Russian supplies, the chemical industry is losing its locational advantage.",
    value: 50,
    industry_code: "WZ08-20",
  },
  {
    time: new Date(Date.UTC(2020, 0, 1)),
    text: "German batteries are primarily used in electric cars – and with the boom in the sector, production is skyrocketing. But this growth is fragile: production is set to plummet in 2023, partly due to the phasing out of electric car subsidies.",
    value: 70,
    industry_code: "WZ08-272",
  },
  {
    time: new Date(Date.UTC(2022, 0, 1)),
    text: "Since the war in Ukraine, production has picked up significantly—even more so than in other defense-related sectors such as aerospace. Tank production falls into a separate, partly confidential category and is not included in these figures.",
    value: 70,
    industry_code: "WZ08-254",
  },
];
const major_events = [
  { name: "Financial crisis", time: new Date(Date.UTC(2008, 0, 1)) },
  { name: "Corona pandemic", time: new Date(Date.UTC(2020, 0, 1)) },
];
```

## Without the scrolly

After a little while of searching I found the actual codes used in the visualisations, so we can filter for these and reduce the data further. We create for colors, english labels and the maximas. We need the maximas because of a small thing the authors did to the y axis. Remember the percentage scale? This is why. When we hover the question mark icon on the bottom of the original article we'r informed that the 100% tick on y axis corresponds to maximum value of each industry sector in the given time span. Further it reads the percentages are not compareable amongst each other.
In short the authors mapped `max(car_industry)` to 100%. We can replicate that by using a linear scaling.

The basic plot outside a scrolly telling scenario would look like so:

```js
function prepareData(normalize = false) {
  return windowedindexes
    .filter((d) => isInCodes(d.industry_code))
    .map((d) => ({
      ...d,
      // replace the value with the moving average
      value: normalize ? scaling_per_sector_map[d.industry_code](d.moving_avrg) : d.moving_avrg,
      time: new Date(Date.UTC(d.year, d.month - 1, 1)),
      index: getIndexByCode(d.industry_code),
      industry_label: en_labels_map[d.industry_code],
      color: colors_map[d.industry_code],
    }))
    .sort((a, b) => b.time - a.time);
}
```

```js
await windowedindexes;
const sector_data = prepareData(true);
```

```js
const basic_facet_chart = () => {
  const tip_data = sector_events.map((d) => ({
    ...d,
    label: en_labels_map[d.industry_code],
    index: getIndexByCode(d.industry_code),
    color: colors_map[d.industry_code],
  }));
  const xticks = [
    new Date(Date.UTC(1995, 0, 1)),
    new Date(Date.UTC(2010, 0, 1)),
    new Date(Date.UTC(2025, 0, 1)),
  ];

  return Plot.plot({
    title:
      "Reproduced production indexes for different industry sectors in Germany",
    subtitle:
      "Industry type labeled by the original authors of NZZ over 35 years from 1995 to 2025. Original work by NZZ authors. Data provided by destatis.de.",
    width: 1000,
    height: 1800,
    x: { ticks: xticks },
    y: {
      ticks: [0, 100],
      label: "Production index (%)",
      tickFormat: (d) => `${d}%`,
    },
    fy: { label: null, axis: null },
    marks: [
      Plot.areaY(
        sector_data,
        {
          x: "time",
          y: "value",
          fill: (d) => helpers.colors.original[d.color].light,
          fy: "index", 
        },
      ),
      Plot.lineY(
        sector_data,
        {
          x: "time",
          y: "value",
          stroke: (d) => helpers.colors.original[d.color].dark,
          strokeWidth: 2,
          fy: "index",
        }
      ),
      Plot.text(
        d3
          .groups(sector_data, (d) => d.industry_label)
          .map(([label, group]) => ({ text: label, index: group[0].index })),
        {
          fy: "index",
          frameAnchor: "top-left",
          dx: 4,
          dy: 4,
          fontSize: 14,
          fontWeight: 600,
          text: "text",
        },
      ),
      Plot.ruleX(major_events, { x: "time", strokeDasharray: [4, 5] }),
      Plot.textX(major_events, {
        x: "time",
        text: "name",
        y: 0,
        dx: -4,
        dy: -10,
        textAnchor: "end",
        fontSize: 12,
      }),
      // Per sector events
      Plot.ruleX(tip_data, {
        x: "time",
        fy: "index",
        stroke: (d) => helpers.colors.original[d.color].dark,
        strokeWidth: 2,
        tip: true,
        title: "text",
        anchor: "right",
      }),
    ],
  });
};
```

<div class="card">
${resize((width) => basic_facet_chart())}
</div>

### Looking at the scales

We got three different types of scales: (1) y which shows the performance of this sector in %, (2) a classic time scale on x and (3) a colour palette of four colours.
The **x axis** ranges from 1995 to 2025, which are 30 years of data.
We can also note that the only tick we get is 2010, so we can suspect
that we don't need much more than that context (at least for the time scale).

```js
const xAxisStandAlone = ({ width }) =>
  Plot.plot({
    width,
    height: 60,
    y: { ticks: 0 },
    marks: [Plot.axisX([1995, 2010, 2025], { anchor: "bottom", tickFormat: "d" })],
  });
```

<div class="card">
${resize((width) => xAxisStandAlone({width}))}
</div>

The **y axis** ranges from 0 to 100, which obviously correspond to the percentages, mapped to the maximum value of each sector. The authors also state that the values are only comparable inside one graphic. We'll later explore why (also why you should).

```js
const yAxisStandAlone = ({ width }) =>
  Plot.plot({
    width,
    height: 160,
    marks: [
      Plot.axisY([0, 100], {
        anchor: "left",
        tickFormat: (d) => `${d}%`,
      }),
    ],
  });
```

<div class="card">
${resize((width) => yAxisStandAlone({width}))}
</div>

The **color scale** shows us four different colours for the different lines and another four light versions for areas. Colours are some common pattern to guide readers perception. Red and dark red are preserved for key and traditional industries, while. Blue is preserved for structural winners that go against the (suggested) general decline. Green sectors are recently growing surprise industries while orange is used for the key industries and red is used for two examples that are declining in a long term trend.

```js
const cAxisStandAlone = ({original}) =>{
  const pallet = original ? helpers.colors.original : helpers.colors.alter;
  return Plot.plot({
    width: 400,
    height: 160,
    margin: 20,
    marginLeft: 40,
    marginTop: 0,
    y: { label: null },
    marks: [
      Plot.rect(
        Object.entries(pallet).map(([name, d], i) => ({
          name,
          color: d.dark,
          type: "dark",
          index: i,
        })),
        { x: (d) => `${d.name}`, y: "type", fill: "color", r: 6 },
      ),
      Plot.rect(
        Object.entries(pallet).map(([name, d], i) => ({
          name,
          color: d.light,
          type: "light",
          index: i,
        })),
        { x: (d) => `${d.name}`, y: "type", fill: "color", r: 4 },
      ),
    ],
  });
}
```
<div style="max-width: 640px; display: flex; flex-direction: column; align-items: center;">
<h4>Original colours</h4>
<div class="card" style="max-width: 400px;">
${cAxisStandAlone({original: true})}
</div>

<h4>Alternative colours</h4>
<div class="card" style="max-width: 400px;">
${cAxisStandAlone({original: false})}
</div>
</div>

Imho this colour pallet is pretty dark and matches the article title "_... figures show just how dramatic the decline really is_". A pallet like the following in contrast would not suite the story. 


## Tone

My impression is that if you read through the text boxes the basic gist is _everything bad_ and if something is good it's either war or subsidised by tax payers (implicitly suggesting it's not actually good performance - _free market_ you know). The authors mention regulations or political decision as negative factors: environmental and climate regulations, energy transformation, CO₂ pricing and energy prices in general.

> But I'm not experienced enough to finally rate a tone here. That's journalists work. I'm a visualisation nerd with an impression.

## Percentages on Y

The authors have chosen to normalise the production index values to a scale of 0 to 100%. This causes every line chart to start at 0 and end at 100.
The production indecies are originally normalised anyways since each series corresponds to a anchor value (2021=100) which is a value measured in a reference year. So normalising to % is a good pattern since users understand percentages easily. I was first wondering why they didn't choose to compare the values, but because each series is normalised by it's own 2021 value (2021=100 production index) as baseline 100 for mechanincal engineering means something different then a battery industries 100. Percent is also a bit misleading since one cannot explain of to which total this percentage share corresponds to. But this is nitty gritty stuff. 

I'm annoyed by the way they present it and make you scroll through 27k pixels just to get a dozend of textboxes with minimal informativness that throw market values at you without putting them into context.

# A bit scrolly


<style>
/* Experimental */
.scrolly { display: flex; flex-direction: column; gap: 2rem; }
.sticky { position: sticky; top: 0; height: 500px; background: white; }
.step { min-height: 500px; padding: 1rem; border-bottom: 1px solid #d1d5db; }
</style>

```js
import {SingleFacetChart} from "./nzz_economic_crisis.js";
```

```js
const step = Mutable(0);
const setStep = (i) => step.value = i;
```


<div class="full scrolly">
  <div class="sticky">
    <div>

```js
const controls = view(Inputs.form({
  comments: Inputs.toggle({ label: "Show comments", value: true }),
  trend: Inputs.toggle({ label: "Show trend", value: false }),
  year: Inputs.range(
    [d3.min(sector_data, (d) => d.year), d3.max(sector_data, (d) => d.year - 2)],
    {
      label: "Trend start",
      step: 1,
      value: d3.min(sector_data, (d) => d.year),
    },
  ),
}));
```
  </div>
  <div>${chart}</div>
  </div>
  <div class="steps">
    <div class="step" data-step="0">Here is a simple scrolly version of their work, extended with a bit more interactivity. It's not as clean as the original one but gives you the option to explore for yourself</div>
    <div class="step" data-step="1">
    <p>First I added more ticks on x and y plus a grid for the y axis. It does not look as clean anymore but users are able to find their way around a little bit better.</p>
    </div>
    <div class="step" data-step="2">
      <p>Next we have some fun interactive things, like the tip that shows you time and value on hover.</p>
    </div>
    <div class="step" data-step="3">
      <p>The line plus dot indicators on hover show you where you are, again increased readability.</p>
    </div>
    <div class="step" data-step="4">
      <p>You can toggle a trend line to see the regression trend for yourself.</p>
    </div>
    <div class="step" data-step="5">
      <p>Also comments are toggleable you'r not forced to go through every single comment one after another.</p>
    </div>
    <div class="step" data-step="6">
      <p>The trend start control let's you define the start of regression trend line. Move it around and see for yourself.</p>
    </div>
    <div class="step" data-step="7">
      <p>Over all this is more explorative but the same navigation pattern - scrolly.</p>
    </div>
    <div class="step" data-step="8"></div>
  </div>
</div>


```js
const chart = SingleFacetChart({height: 300, sector_data, sector_code: codes[step], sector_events, labels_map: en_labels_map, getIndexByCode, colors_map, helpers, controls});
```

```js
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      setStep(+entry.target.dataset.step);
    }
  }
}, {threshold: 0.5});

for (const el of document.querySelectorAll(".step")) {
  observer.observe(el);
}

invalidation.then(() => observer.disconnect());
```

[Please let me skip the scrolling](#a-bit-scrolly)

Over all this is not better then the original one, because I do the same mistake. The basic problem here the monotonious scrolling that is beeing done. Scrolly telling imho only works for a few sections before it becomes tidious. 

# Conclusion

So I learned that when building scrolly tellings one should be cautions about the number of scroll states to chain. Another thingi is that I got the impression that giving people the tools to explore data themselves instead of telling them a story is a bit more honest. But it's based on the assumption that users are willing to do that. 

A very awesome example for well used scrolly telling is the wonderful work of Nadieh Bremer & Emily Barone: [Searching for Birds](https://searchingforbirds.visualcinnamon.com). I got to mention that the comparison is a unfair. First these two are absolute professionals in what they do and second they have time to their piece. A DDJ team usually want's to publish fast and can't affort to publish after the attention peak. But anyways it's a wonderful piece of art.

**I do want to acknowledge that this story part was fully reproducible so that's really nice and helps me to learn from their work**. Although I think it's not intended that random guys on the internet can learn from their content, it's more about the credibility as journalists. Please note that there is more but I didn't want to check on the rest of the story, where the authors show a chart to argue that government is growing while industry is shrinking, that's a part of journalism I don't want to get into. There may be a part of relation but that would require me to dig far deeper into the matter - again journalists work.
