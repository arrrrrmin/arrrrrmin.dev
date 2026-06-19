import { axisBottom } from "d3";
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";

const xticks = [
    new Date(Date.UTC(1990, 0, 1)),
    new Date(Date.UTC(1995, 0, 1)),
    new Date(Date.UTC(2000, 0, 1)),
    new Date(Date.UTC(2005, 0, 1)),
    new Date(Date.UTC(2010, 0, 1)),
    new Date(Date.UTC(2015, 0, 1)),
    new Date(Date.UTC(2020, 0, 1)),
    new Date(Date.UTC(2025, 0, 1)),
];


const sector_labels = {
    "Baugewerbe": "Construction",
    "Dienstleistungsbereiche": "Service Sectors",
    "Erbringung v. Finanz- u. Versicherungsdienstleist.": "Financial and Insurance Services",
    "Grundstücks- und Wohnungswesen": "Real Estate and Housing",
    "Handel, Verkehr, Gastgewerbe": "Trade, Transportation, and Hospitality",
    "Information und Kommunikation": "Information and Communication",
    "Insgesamt": "Total",
    "Land- und Forstwirtschaft, Fischerei": "Agriculture, Forestry, and Fishing",
    "Produzierendes Gewerbe": "Production sector (total industry)",
    "Produzierendes Gewerbe ohne Baugewerbe": "Manufacturing (excluding construction)",
    "Sonstige Dienstleister": "Other Service Providers",
    "Unternehmensdienstleister": "Business Services",
    "Verarbeitendes Gewerbe": "Manufacturing",
    "Öffentliche Dienstleister, Erziehung, Gesundheit": "Public Services, Education, and Health Care"
}
const production_sector_labels = [
    "Baugewerbe",
    "Verarbeitendes Gewerbe",
];
const service_sector_labels = [
    "Sonstige Dienstleister",
    "Erbringung v. Finanz- u. Versicherungsdienstleist.",
    "Information und Kommunikation",
    "Grundstücks- und Wohnungswesen",
    "Unternehmensdienstleister",
    "Handel, Verkehr, Gastgewerbe",
    "Öffentliche Dienstleister, Erziehung, Gesundheit",
];
const useful_sectors = [
    ...production_sector_labels, ...service_sector_labels
]

export const InteractiveGrossDevelopmentChart = ({ data, width, height, sectorFocus, percentages }) => {
    const _data = data.filter(d => useful_sectors.includes(d.sector)).map(
        (d) => {
            return {
                ...d,
                date: new Date(d.date),
                sector: sector_labels[d.sector],
                original_sector: d.sector,
                is_service_sector: service_sector_labels.includes(d.sector),
            }
        }
    )
    const _width = width ?? 800;
    const _height = height ?? 500;
    const marginTop = percentages ? 20 : 40;
    const margins = { left: 40, top: marginTop, right: 10, bottom: 30 };
    const en_production_sector_labels = production_sector_labels.map((l) => sector_labels[l]);
    const en_service_sector_labels = service_sector_labels.map((l) => sector_labels[l]);

    const keys = [...new Set(_data.map(d => d.sector))];

    const stacking = d3.stack()
        .keys([...en_service_sector_labels, ...en_production_sector_labels])
        .value(([, D], key) => D.get(key).value)
        .order(d3.stackOrderNone)

    if (percentages) {
        stacking.offset(d3.stackOffsetExpand)
    }
    const series = stacking(d3.index(_data, d => d.date, d => d.sector))

    const x = d3.scaleUtc()
        .domain(d3.extent(_data, d => d.date))
        .range([margins.left, width - margins.right]);

    const yDomain = percentages ? [0, 1] : [0, d3.max(series, d => d3.max(d, d => d[1]))];
    const y = d3.scaleLinear()
        .domain(yDomain)
        .rangeRound([height - margins.bottom, margins.top]);

    const svg = d3.create("svg")
        .attr("width", _width)
        .attr("height", _height)
        .attr("viewBox", [0, 0, _width, _height])
        .attr("style", "max-width: 100%; height: auto;");

    const interpolator = d3.interpolateGreens;
    const n = series.length;
    const productionColors = d3.quantize(d3.interpolateBlues, en_production_sector_labels.length)
    const seriveColors = d3.quantize(d3.interpolateOranges, en_service_sector_labels.length)
    const colorCategories = {
        "Production": d3.scaleOrdinal().domain(en_production_sector_labels).range(["#9ecae1", "#1f4e79"]),
        "Service": d3.scaleOrdinal().domain(en_service_sector_labels).range(seriveColors),
    };

    const area = d3.area()
        .x(d => x(d.data[0]))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    function getColorFromKey(key) {
        const category = en_service_sector_labels.includes(key) ? "Service" : "Production";
        return colorCategories[category](key)
    }

    function getLabelColorFromKey(key) {
        const c = getColorFromKey(key);
        return d3.lab(c).l < 50 ? d3.rgb("#fff").darker(0.5) : d3.rgb("#000").brighter(0.5)
    }

    svg.append("g")
        .selectAll()
        .data(series)
        .join("path")
        .attr("fill", d => getColorFromKey(d.key))
        .attr("d", area)
        .append("title")
        .text(d => d.key);

    const labels = series.map(s => {
        const d = s[s.length - 1];                 // last timestep
        return { key: s.key, y: (y(d[0]) + y(d[1])) / 2 };
    });

    svg.append("g")
        .attr("font-size", 12).attr("font-weight", 600)
        .selectAll("text").data(labels).join("text")
        .attr("x", width)
        .attr("dx", -12)
        .attr("y", d => d.y)
        .attr("dy", "0.32em")
        .attr("fill", d => getLabelColorFromKey(d.key))
        .attr("text-anchor", "end")
        .text(d => d.key);

    svg.append("g")
        .attr("transform", `translate(0,${_height - margins.bottom})`)
        .call(d3.axisBottom(x).ticks(width < 300 ? 5 : 8).tickSizeOuter(0));

    svg.append("g")
        .attr("transform", `translate(${margins.left}, 0)`)
        .call(d3.axisLeft(y).tickFormat(d3.format(percentages ? ".0%" : "")).tickSizeOuter(0))
        .call(g => g.append("text")
            .attr("x", -margins.left)
            .attr("y", margins.top - 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(percentages ? "" : "↑ Mrd. €"));

    return Object.assign(svg.node(), { scales: { colorCategories } });
}

export const SingleFacetChart = ({ height, sector_data, sector_code, sector_events, labels_map, getIndexByCode, colors_map, helpers, controls }) => {
    const data = sector_data.filter(d => d.industry_code === sector_code)
    const tips = sector_events.filter(d => d.industry_code === sector_code).map((d) => ({
        ...d,
        label: labels_map[d.industry_code],
        index: getIndexByCode(d.industry_code),
        color: colors_map[d.industry_code],
    }));

    return Plot.plot({
        title:
            `${labels_map[sector_code]} production indexes in Germany`,
        subtitle:
            `Original work by original by NZZ authors. Data provided by destatis.de`,
        width: 800,
        height,
        x: { ticks: xticks },
        y: {
            ticks: [0, 25, 50, 75, 100],
            grid: true,
            label: "Production index (%)",
            tickFormat: (d) => `${d}%`,
        },
        fy: { label: null, axis: null },
        marks: [
            Plot.areaY(
                data,
                {
                    x: "time",
                    y: "value",
                    fill: (d) => helpers.colors.alter[d.color].light,
                    opacity: 0.5,
                },
            ),
            Plot.lineY(
                data,
                {
                    x: "time",
                    y: "value",
                    stroke: (d) => helpers.colors.alter[d.color].dark,
                    strokeWidth: 2,
                },
            ),
            // Per sector events
            ...(controls.comments ?
                [Plot.ruleX(tips, {
                    x: "time",
                    stroke: (d) => helpers.colors.alter[d.color].dark,
                    strokeWidth: 2,
                    title: "text",
                    anchor: "right",
                }),
                Plot.tip(tips, {
                    x: "time",
                    y: "value",
                    title: "text",
                    fontSize: 12,
                })] : []),
            ...(controls.trend
                ? [
                    Plot.linearRegressionY(
                        data.filter((d) => d.time.getFullYear() >= controls.year),
                        { x: "time", y: "value" }
                    ),
                ]
                : []),
            Plot.ruleX(data, Plot.pointerX({
                x: "time",
                y: "value",
                stroke: (d) => helpers.colors.alter[d.color].dark,
                strokeWidth: 2,
            })),
            Plot.dot(data, Plot.pointerX({
                x: "time",
                y: "value",
                stroke: (d) => helpers.colors.alter[d.color].dark,
                strokeWidth: 2,
            })),
            Plot.text(data, Plot.pointerX(
                {

                    px: "time",
                    py: "value",
                    strokeWidth: 2,
                    dy: 10,
                    dx: 20,
                    frameAnchor: "top",
                    fontVariant: "tabular-nums",
                    fontSize: 12,
                    text: (d) => [
                        `Date ${Plot.formatIsoDate(d.time)}`,
                        `Index (%) ${d.value.toFixed(2)}`].join("  "),
                }
            ))
        ],
    });
};