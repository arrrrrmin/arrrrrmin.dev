
const default_description = {
  path: "/",
  description:
    "Learning journeys on data projects and visualisations to educate myself and maybe others. Create meaningful and interactive data exploration experiences.",
};

// A lazy way to add descriptions to each sites meta
const descriptions = [
  {
    path: "chart_design",
    description: `An educational data project to see how datavis can mislead or suggest false conclusions through visual guidance.`,
    date: "2026-03-14",

  },
  {
    path: "lostindata",
    description: "A tiny excourse into data loaders, static svg routes in Framework and css keyframe animations embedded in SVGs.",
    date: "2026-05-25",
    preview: "/embeds/lostindata.png",
    previewWidth: 1200,
    previewHeight: 630,
  },
  {
    path: "withopenmaps",
    description: "The ARTE map is a visualisation the ARTE 'With open maps' format as a map. Currently in prototyping stage, the map allows to explore the format interactivly.",
    date: "2026-05-29",
    preview: "/projects/images/withopenmaps-preview.png",
    previewWidth: 1200,
    previewHeight: 630,
  },
  {
    path: "visualising_climate",
    description: "The Visualising Climate conference is taking place in November 2026 for the first time. I love their logo, beacuse it's a different way to present the state of climate. We rebuild their logo with publically available data.",
    date: "2026-05-03",
    preview: "/embeds/visualisingclimatelogo.png",
    previewWidth: 1200,
    previewHeight: 630,
  },
];


export const pages = [
  {
    name: "Learning from professionals",
    path: "/learning_from_pros/",
    pages: [
      { name: "Visualising Climate Logo", path: "/learning_from_pros/visualising_climate" },
      { name: "WSJ made an analysis of Epstein mails", path: "/learning_from_pros/wsj_epstein_mails" },
      { name: "NZZ scrolly telling economic crisis", path: "/learning_from_pros/nzz_economic_crisis" },
    ]
  },
  {
    name: "Misleading chart design",
    path: "/chart_design/",
    pages: [
      { name: "Charting basics", path: "/chart_design/1_basics" },
      { name: "Misleading axis", path: "/chart_design/3_misleadingpatterns" },
      { name: "Missing data", path: "/chart_design/4_missingdata" },
    ],
  },
  {
    name: "Experiments",
    open: true,
    pages: [
      { name: "Lost in data", path: "/experiments/lostindata" },
    ],
  },
  {
    name: "Projects",
    open: true,
    pages: [
      { name: "With open maps", path: "/projects/withopenmaps" },
      { name: "Lanz mining", path: "https://lanz-mining.arrrrrmin.dev/" }],
  },
];

export const getMetaFromPath = ({ path, meta }) => {
  const parts = path.split("/");

  let item = descriptions.find((d) => parts.includes(d.path));
  if (!item) {
    item = default_description;
  }
  return item[meta];
};
