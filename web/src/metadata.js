
const default_description = {
  path: "/",
  description:
    "A blog mostly about learning journeys, data projects and visualisations to educate myself and others to actually creating a meaningful and interactive data exploration experience.",
};

// A lazy way to add descriptions to each sites meta
const descriptions = [
  {
    path: "chart_design",
    description: `An educational data project to see how datavis can mislead or suggest false conclusions through visual guidance.`,
    date: "2026-03-14",
  },
  {
    path: "lanz_mining",
    description: `A data project exploring media participation in German public service talk shows. Data collected over a period of more than a year is being analysed and visualised. `,
    date: "2025-05-27",
  },
];


export const pages = [
  {
    name: "Learning chart design",
    path: "/chart_design/",
    pages: [
      // { name: "Introduction", path: "/chart_design/" },
      { name: "Charting basics", path: "/chart_design/1_basics" },
      { name: "Efficient chart reading", path: "/chart_design/2_reading" },
      { name: "Misleading axis", path: "/chart_design/3_misleadingpatterns" },
      { name: "Missing data", path: "/chart_design/4_missingdata" },
    ],
  },
  {
    name: "Learning from professionals",
    path: "/learning_from_pros/",
    pages: [
      { name: "Visualising Climate Logo", path: "/learning_from_pros/visualising_climate" },
      { name: "WSJ made an analysis of Epstein mails", path: "/learning_from_pros/wsj_epstein_mails" },
    ]
  },
  {
    name: "Projects",
    open: true,
    pages: [{ name: "Lanz mining ↗", path: "https://lanz-mining.arrrrrmin.dev/" }],
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
