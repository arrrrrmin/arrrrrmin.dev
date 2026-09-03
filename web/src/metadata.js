
const default_description = {
  path: "/",
  description:
    "Learning journeys on data projects and visualisations to educate myself and maybe others.",
};

export const pages = [
  {
    name: "Learning from pros",
    open: true,
    pages: [
      {
        name: "ARTEs piece on glacial lake floods",
        path: "/learning_from_pros/glofs_nepal",
        description: "Threads that come from glacial lake floods (glofs). Let's explore what data and information ARTE germany uses to build the basics for one of their info movies.",
        date: "2026-08-31",
      },
      {
        name: "Visualising Climate Logo",
        path: "/learning_from_pros/visualising_climate",
        description: "The Visualising Climate conference is taking place in November 2026 for the first time. I love their logo, because it's a different way to present the state of climate. We rebuild their logo with publically available data.",
        date: "2026-05-03",
        preview: "/embeds/static/visualising-climate-logo.png",
        previewWidth: 1200,
        previewHeight: 630,
      },
      { name: "WSJ analysis of Epstein mails", path: "/learning_from_pros/wsj_epstein_mails" },
      { name: "NZZ scrolly telling economic crisis", path: "/learning_from_pros/nzz_economic_crisis" },
    ]
  },
  {
    name: "Misleading charts",
    open: true,
    pages: [
      { name: "Charting basics", path: "/misleading_charts/basics" },
      { name: "Misleading axis", path: "/misleading_charts/misleadingpatterns" },
      {
        name: "Missing data", path: "/misleading_charts/missingdata",
        description: "Illustrations on how harmful cherrypicking data really is. An example shows how right wing propaganda tries to use missing data as a manipulative pattern.",
        date: "2026-04-04",
        preview: "/embeds/static/manipulative-charts-missingdata.png",
        previewWidth: 658,
        previewHeight: 600,
      },
    ],
  },
  {
    name: "Experiments",
    open: false,
    pages: [
      {
        name: "Lost in data",
        path: "/experiments/lostindata",
        description: "A tiny excourse into data loaders, static svg routes in Framework and css keyframe animations embedded in SVGs.",
        date: "2026-05-25",
        preview: "/embeds/lostindata.png",
        previewWidth: 1200,
        previewHeight: 630,
      },
      {
        name: "With open maps",
        path: "/experiments/withopenmaps",
        description: "The ARTE map is a visualisation the ARTE 'With open maps' format as a map. Currently in prototyping stage, the map allows to explore the format interactivly.",
        date: "2026-05-29",
        preview: "/embeds/static/withopenmaps-preview.png",
        previewWidth: 1200,
        previewHeight: 630,
      },
    ],
  },
  {
    name: "Projects",
    open: false,
    pages: [
      { name: "Lanz mining", path: "https://lanz-mining.arrrrrmin.dev/" }],
  },
];

export const getPagesFlat = () => {
  return pages.flatMap((section) => section.pages)
}

export const getMetaFromPath = ({ path, meta }) => {
  const parts = path.split("/");
  const items = getPagesFlat();
  let item = default_description;
  if (items) {
    item = { ...item, ...items.find((page) => page.path === path) }
  }
  return item[meta];
};
