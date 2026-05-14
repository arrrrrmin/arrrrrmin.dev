import * as Plot from "npm:@observablehq/plot";
import { min } from "npm:d3";

export const SingleFacetChart = ({ height, sector_data, sector_code, sector_events, labels_map, getIndexByCode, colors_map, helpers, controls }) => {
    const data = sector_data.filter(d => d.industry_code === sector_code)
    const tips = sector_events.filter(d => d.industry_code === sector_code).map((d) => ({
        ...d,
        label: labels_map[d.industry_code],
        index: getIndexByCode(d.industry_code),
        color: colors_map[d.industry_code],
    }));
    const xticks = [
        new Date(Date.UTC(1995, 0, 1)),
        new Date(Date.UTC(2000, 0, 1)),
        new Date(Date.UTC(2005, 0, 1)),
        new Date(Date.UTC(2010, 0, 1)),
        new Date(Date.UTC(2015, 0, 1)),
        new Date(Date.UTC(2020, 0, 1)),
        new Date(Date.UTC(2025, 0, 1)),
    ];

    return Plot.plot({
        title:
            `Production indexes for sectors in Germany (original by NZZ)`,
        subtitle:
            `PI ${labels_map[sector_code]}; Data provided by destatis.de`,
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
                Plot.windowY(7, {
                    x: "time",
                    y: "value",
                    fill: (d) => helpers.colors.alter[d.color].light,
                    opacity: 0.5,
                }),
            ),
            Plot.lineY(
                data,
                Plot.windowY(7, {
                    x: "time",
                    y: "value",
                    stroke: (d) => helpers.colors.alter[d.color].dark,
                    strokeWidth: 2,
                }),
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
                        Plot.windowY(7, {
                            x: "time",
                            y: "value",
                        }),
                    ),
                ]
                : []),
            Plot.ruleX(data, Plot.pointerX(Plot.windowY(7, {
                x: "time",
                y: "value",
                stroke: (d) => helpers.colors.alter[d.color].dark,
                strokeWidth: 2,
            }))),
            Plot.dot(data, Plot.pointerX(Plot.windowY(7, {
                x: "time",
                y: "value",
                stroke: (d) => helpers.colors.alter[d.color].dark,
                strokeWidth: 2,
            }))),
            Plot.text(data, Plot.pointerX(
                {
                    ...Plot.window(7, {
                        px: "time",
                        py: "value",
                        strokeWidth: 2,
                    }),
                    px: "time",
                    py: "value",
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