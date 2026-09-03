---
title: "With open maps (WIP)"
keywords:
  - D3js
  - Maps
  - Geocoding
style: "./withopenmaps/styles/withopenmaps.css"
---

# With open maps (WIP)

Up front, WIP stands for _work in progress_. I'm not sure where this project goes, but I like it and want to continue.
Originally I started this project in [October 2025](https://chaos.social/@arrrrrmin/115434464469706882), but life took me elsewhere and it moved into the back of my head. Now in May 2026 I want to continue with it.

TLDR: [Just give me the vis](#creating-a-map), here you go.

## The idea

Since I like to consume [ARTE](https://arte.tv) (a German-French cooperative public broadcasting TV station), I noticed that there is a lot of potential to one of their formats for a DataVis. The format is called _With Open Maps_ translated from the German original _Mit offenen Karten_ where _Karten_ can mean a game card or map. It's available in German, French and Polish and covers certain geo-political aspects each episode. A usual episode ranges between 12 to 20 minutes of video time. Here's a random example of what such an episode can look like, in this case it's about gun violence in Brazil and the episodes title [_From Bolsonaro to Lula: Where is Brazil heading?_](https://www.arte.tv/de/videos/125533-026-A/mit-offenen-karten/)

![A map of southamerica provided by the ARTE fromat "with open maps", showing Brazil yellow coloured, venezuela in red and argentina in blue. Images of Luiz Inácio Lula da Silva, Javier Milei and an image of fifth January 2026 event where Nicolás Maduro was taken arrested in USA military intervention, show the political context surrounding Brazil.](../images/ARTE-open-maps-example-brazil-2025-05-30.png)

> **💡** Why not make a map of their maps?

Like some metadata map, where you can find episodes linked to geolocations and coocuring locations inside an episode. This way we could navigate their geopolitical coverage on a map.

## Data landscape

Since ARTE is a public broadcasting TV station open to everyone, I don't need to click an account or pass any paywalls. First, this is super nice for a data project and important for quality journalism (but that's a different topic). To link episodes to regions of interests (ROI), we need to find out which episode concerns which region. Inspecting metadata of each page tells us that each episode comes with a description tag, which does exactly that. For the scope of the map we need to decide, do we want to:
1. Present each and every mentioned region, city, river, ...
2. or do we want to navigate the geo-political context?

I want to go with the second option. Making the map fine-granular would make it visually overloaded and it doesn't really serve the navigation purposes of a geopolitical format which in most cases will at some point be interstate/intercontinental. Also transcribing each and every episode is tidious and AI transcripts are still way to flawed for a data correctness goal of > 70%, which is not much at all. For this project I'd like to have as much _correct_ or at least reasonable data as possible.

In the header we can find most of what we may want:

```html run=false
<head>
  ...
  <!-- Title and description -->
  <title>Mit offenen Karten - Von Bolsonaro zu Lula: Wohin steuert Brasilien? - Die ganze Doku | ARTE</title>
  <meta name="description" content="Geopolitik einordnen und die Welt verstehen: Zusammenhänge der Globalisierung einfach erklärt anhand von Karten. In dieser Ausgabe von &quot;Mit offenen Karten&quot; werden anlässlich der Präsidentschaftswahlen im Oktober 2026 die Stärken und Schwächen Brasiliens beleuchtet.">
  <!-- Preview image -->
  <meta property="og:image" content="https://api-cdn.arte.tv/img/v2/image/iPxRCYfvaZk9DtnLKtics4/1920x1080?type=TEXT&watermark=true">
  <meta property="og:image:width" content="1920">
  <meta property="og:image:height" content="1080">
  <!-- Linked data -->
  <script>
    {
      "@context":"http://schema.org",
      "@type":"VideoObject",
      "name":"Mit offenen Karten - Von Bolsonaro zu Lula: Wohin steuert Brasilien?",
      "description":"Geopolitik einordnen und die Welt verstehen: Zusammenhänge ...",
      "url":"https://www.arte.tv/de/videos/125533-026-A/mit-offenen-karten/",
      "embedUrl":"https://www.arte.tv/embeds/de/125533-026-A",
      "contentUrl":"https://www.arte.tv/de/videos/125533-026-A/mit-offenen-karten/",
      "duration":"PT730S",
      "uploadDate":"2026-05-22T16:16:07.000+02:00",
      "interactionStatistic":{
        "@type":"InteractionCounter",
        "interactionType": {
          "@type":"WatchAction"
        }
      },
      "genre":["Doku"]
    }
    ...
  </script>
</head>
```

### Collect data

Using my beloved Obsidian Web Clipper tool, we can simply search the ARTE site and clip all sites, but first we need a template that searches for our satisfied data entries. For my first prototype I took the following parameters:

- `description` and `url` from the `<meta>`-tags
- `preview` from the `og:image` (OG stands for [Open Graph](https://ogp.me))
- `title`, `published` date and `length` from the linked data schema `@VideoObject`

This is the full json template you can import to your Clipper if you want to, but be aware it includes my chosen vault path `Arte/Mit Offenen Karten/` you may want to change it: 

```js
{
  "schemaVersion": "0.1.0",
  "name": "Arte - Mit offenen Karten",
  "behavior": "create",
  "noteContentFormat": "",
  "properties": [
    {
      "name": "title",
      "value": "{{schema:@VideoObject:name}}",
      "type": "text"
    },
    {
      "name": "description",
      "value": "{{description}}",
      "type": "text"
    },
    {
      "name": "preview",
      "value": "{{meta:property:og:image}}",
      "type": "text"
    },
    {
      "name": "published",
      "value": "{{schema:@VideoObject:uploadDate}}",
      "type": "date"
    },
    {
      "name": "source",
      "value": "{{url}}",
      "type": "text"
    },
    {
      "name": "length",
      "value": "{{schema:@VideoObject:duration}}",
      "type": "number"
    }
  ],
  "triggers": [
    "https://www.arte.tv/de/videos/125533-003-A/mit-offenen-karten/"
  ],
  "noteNameFormat": "{{schema:@VideoObject:uploadDate|date:\"YYYY-MM-DD\"}} | Mit offenen Karten",
  "path": "Arte/Mit Offenen Karten/"
}
```

Web Clipper is very nice when you don't have to much data to scrape. You set up the template and go through the sites and directly see what information was found in a nice UI. I should write another little documentation article about Obsidian Web Clipper and the things it's capable of, but I feel like I'm always repeating the original docs, so maybe one day when I really got something valuable to say. Until then [here's the official docs page](https://obsidian.md/help/web-clipper).

### Processing markdown files

What we end up with is a bunch of markdown files that hold data in the frontmatter. We can further process this in a pipeline, that is not yet as stable as I'd like it to be so I won't go through all of it. The basic gist is that we search fields like `title` and `description` for geolocations and weight their relevance, based on the frequency in which they appear and the field itself. A finding in `title` is weighted higher than one in `description`.
We point the processing pipeline to the path where the obsidian vault is living and go through all episodes (each is a .md at this point). What we get out is a json file with:
- the execution date
- outputs where each episode provides it's base info and the found geolocations (with lat, lon location)
- connections with origin and target coords
- and a lookup entry where each geolocation entry with a unique name holds episodes and it's origin coords

Here you can see an example version of the results with three episodes:
```js
const example = display(await FileAttachment("./withopenmaps/data/example-geolocations.json").json())
```

There is a lot to do at this end. For example when a country and it's capital are mentioned choosing one would be a good idea. That's an open todo for me. As I said not very stable.

```js
import * as maps from "./withopenmaps/map.js";
```

```js
let data = await FileAttachment("./withopenmaps/data/arte-open-maps-geolocations.json").json().then(d => ({
  ...d, 
  outputs: d.outputs.map(output => ({
    ...output, 
    geolocations: maps.groupGeolocations(output.geolocations)
  }))
}));
const nolocation_episodes = await data.outputs.filter(o => o.geolocations.length < 1);
```

Currently there are some episodes (${nolocation_episodes.length} out of 160) where no geolocation was found. Neither in the title nor the description. I'll need to find a solution to present these as well. Although the actual problem is the NER (Name Entity Recognition) model, which searches for location names in the texts. It sometimes misses entities, where we humans instantly see them, but that's a different story. For this project I'm not going to try to improve existing NLP model, just to get 2+ handfull of episodes mapped to locations.
You can inspect them here:

```js
display(nolocation_episodes)
```

## Country overview

Before we go straight ahead to build the map, I'd like to take a little time to give an overview over the coverage.
Over the ${data.outputs.length} episodes in the dataset we got two types of episodes either long ones or short narrowly scoped episodes.
The shorter ones are a subformat inside _With open maps_ and are called _In focus_. These are usually around 4-5 minutes in length and 
care more about recent events, while the longer episodes are around 20-25 minutes in length and mostly come with literature recommendations
regarding the episodes topic.

Here is an overview which countries are frequently mentioned in which type of format:

```js
const sortCriteria = view(Inputs.radio(["total", "long", "short"], {label: "Format", value: "total"}));
```

```js
const wide_data = Object.entries(data.lookup_by_name).map(
  ([name, entry]) => {
    const total = entry.episodes.length;
    const short = entry.episodes.filter(({title}) => title.includes("Mit offenen Karten - Im Fokus -")).length;
    const long = total - short;
    return {
      name: name === "Vereinigte Staaten von Amerika" ? "USA" : name, 
      total,
      long,
      short,
    }
  }
).sort((a, b) => b[sortCriteria] - a[sortCriteria]);
const dist_data = wide_data.flatMap((entry) => [
  {name: entry.name, total: entry.total, count: entry.long, format: "long"}, 
  {name: entry.name, total: entry.total, count: entry.short, format: "short"}
]);
```

```js
import {groups} from "npm:d3";

function getEpisodeDistributionPlot(width, height) {
  const n = width > 500 ? 20 : 10
  const top20 = groups(dist_data, d => d.name).slice(0, n).flatMap(([_, group]) => group);
  const names20 = groups(dist_data, d => d.name).slice(0, n).flatMap(([key, group]) => ({name: key, total: group[0].total}));

  const sortedDomain = wide_data
    .toSorted((a, b) => b[sortCriteria] - a[sortCriteria])
    .slice(0, n)
    .map(d => d.name);
  const reversedOrder = sortCriteria === "short"
  const labelX = sortCriteria === "short" ? 0 : "total";
  const labelAnchor = sortCriteria === "short" ? "start" : "end"
  const labelDX = sortCriteria === "short" ? 4 : -4

  let xConfig = {grid: true, label: "Num. of episodes"};
  let yConfig = {label: null, ticks: [], domain: sortedDomain};
  if (width <= 500) {
    xConfig = {label: null, ticks: [], domain: sortedDomain};
    yConfig = {grid: true, label: "Num. of episodes"};
  }

  return Plot.plot({
    title: `Top ${n} countries mentioned in ARTE Open Maps episodes`,
    subtitle: "Arte publishes the format in a long and short version. The short version is called 'in focus'.",
    width,
    height: height ?? 400,
    marginTop: width > 500 ? 0: 40,
    marginLeft: width > 500 ? 4: 20,
    marginRight: 10,
    marginBottom: width > 500 ? 30: 8,
    x: xConfig,
    y: yConfig,
    color: {legend: true, scheme: "Reds", reverse: true},
    marks: [
      ...(
        width > 500 ? 
        [
          Plot.barX(top20, {y: "name", x: "count", rx: 4, fill: "format", order: "format", reverse: reversedOrder, }),
          Plot.textX(names20, {y: "name", x: labelX, text: "name", textAnchor: labelAnchor, dx: labelDX})
        ]: [
          Plot.barY(top20, {x: "name", y: "count", rx: 4, fill: "format", order: "format", reverse: reversedOrder,}),
          Plot.textY(names20, {x: "name", y: "total", text: "name", textAnchor: "middle", dy: -8})
        ])
    ]
  });
}
```

<div class="card">
${resize((width) => getEpisodeDistributionPlot(width, width > 600 ? width / 1.5: width))}
</div>

At this point I finally realised that all data is in German, which by now I forgot and I look pretty silly realising it now.
But that's the way it is now, apologies.


## Creating a map

Most map-vis projects get to the point where: "_Ok I got data, now I need geo information about the countries and continents_". Sadly we don't live in a worlds where I "no border, no nations just human" is common sense, so we need this data. We got different options to build maps on the web.
- Some map graphics library like [maplibre](https://maplibre.org), [Mapbox](https://www.mapbox.com) or [deck.gl](https://deck.gl) for GPU support
- or we build it as an simple 2D SVG using D3js to have all the freedom, but also all the stuggles.
- There are plenty more I guess, but these are the ones known to me. 

For a prototype I took the simple answer: existing topojson from [topojson/world-atlas](https://github.com/topojson/world-atlas) and build it in D3js. For the prototype below I took the 110m variant of land and countries, since it's the smallest for fast loading. The map is more about the rough regions and searching through ARTEs video content, not the actual correct border.

These are all the countries we found by searching geo coordinates by name (via [OSM](https://www.openstreetmap.org/), which is simply a great project):

```js
const {episodes, related, source} = maps.findRelatedLocations(data, locationName);
```

```js
import {ArteMap} from "./withopenmaps/map.js"
```

```js
const lmap = await FileAttachment("../data/geo/land-110m.json").json();
const cmap = await FileAttachment("../data/geo/countries-110m.json").json();
```

```js
const map = ArteMap(data, lmap, cmap);
```

```js
function renderResultEpisodes (episodes) {
  const episodesSorted = episodes.sort(
    (a, b) => new Date(b.published) - new Date(a.published)
  );
  const containers = episodesSorted.map(e => html`<div class="card result-card">
      <h3><a href="${e.source}" target="_blank">${e.title}</a></h3>
      <span>${new Date(e.published).toLocaleString()}</span>
      <div><p class="truncated">${e.description}</p></div>
      <div class="preview"><img src="${e.preview}" /></div>
    </div>`
  );
  return html`<div class="grid grid-cols-2" style="margin:0;">
    ${containers}
  </div>`
}
```

```js
const locationName = view(Inputs.select(Object.keys(data.lookup_by_name).sort(), {value: "Kanada"}));
```

```js
const container = html`<div style="margin-bottom: 1rem;"></div>`;
display(container);
```

```js
const aspectString = width > 600 ? "4/3" : "4/5";
container.style.aspectRatio = aspectString;
container.replaceChildren(
  resize((width, height) => map.render({ source, related, width, height }))
);
```

<div>
${renderResultEpisodes(episodes)}
</div>

---

## Future updates

I think this project has potential. Maybe the people at ARTE have interesting data and want to share it. I'll write them an e-mail and see what happens. But on the technical data preparation side is a lot to do. Checking for capitals and map them to the country might be a good idea. Additionally continental mapping would be intersting. With this feature people would have the option to search everything by continent. 
Easier data cleaning tools through appropriate tests is another thing that would make life a lot easier.

On the frontend-side I'd like to try some Map GL library, maybe orthographic projections in these libraries is able to wrap the Bering Street - Russia connection the short way instead of drawing a across the whole map. 

There's a lot one can think of. Maybe you have a feature request or an idea and want to reach out to me. You can do so via [Mastodon](https://chaos.social/@arrrrrmin) or [Bluesky](https://bsky.app/profile/arrrrrmin.dev).
