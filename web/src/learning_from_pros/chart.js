import * as d3 from "npm:d3";

export function beeswarmForce() {
    let x = d => d[0];
    let y = d => d[1];
    let r = d => d[2];
    let ticks = 300;

    function beeswarm(data) {
        const entries = data.map(d => {
            return {
                x0: typeof x === "function" ? x(d) : x,
                y0: typeof y === "function" ? y(d) : y,
                r: typeof r === "function" ? r(d) : r,
                data: d
            }
        });

        const simulation = d3.forceSimulation(entries)
            .force("x", d3.forceX(d => d.x0))
            .force("y", d3.forceY(d => d.y0))
            .force("collide", d3.forceCollide(d => d.r));

        for (let i = 0; i < ticks; i++) simulation.tick();

        return entries;
    }

    beeswarm.x = f => f ? (x = f, beeswarm) : x;
    beeswarm.y = f => f ? (y = f, beeswarm) : y;
    beeswarm.r = f => f ? (r = f, beeswarm) : r;
    beeswarm.ticks = n => n ? (ticks = n, beeswarm) : ticks;

    return beeswarm;
}

export function BeeswarmForcePlot({ forced_data, x_scale, person, width, height, data_width, margin }) {
    const personMentioned = (d) => d.data.mentioned.includes(person);
    const svg = d3.create("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", [0, 0, data_width, height]);

    const g = svg.append("g");

    let x = x_scale.range([margin.left, data_width - 60 - margin.right]);
    // const xticks = d3.range(2008, 2020).map(y => new Date(y, 0, 1))
    // console.log(xticks);
    g.append("g")
        .call(d3.axisBottom(x))
        .call(g => g.select("path.domain").remove())
        .call(g => g.select("g.tick text").attr("text-anchor", "start"))
        .attr("transform", `translate(0, ${height + margin.top - margin.bottom - 10})`);

    g.selectAll("circle")
        .data(forced_data.sort((a, b) => personMentioned(a) - personMentioned(b)))
        .join("circle")
        .attr("fill", d => personMentioned(d) ? "#46BECB" : "#CCC")
        .attr("opacity", d => personMentioned(d) ? 1.0 : 0.6)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 2.5);

    return svg.node();
}

export function prepareClimateAnomalyData(temperature_anomalies) {
    const year_columns = d3.range(2025, 1978, -1).map(year => `_${year}`);
    return temperature_anomalies.flatMap((row_month) =>
        year_columns
            .map((year_col_name) => {
                return {
                    entity: row_month.entity,
                    code: row_month.code,
                    day: new Date(Date.UTC(year_col_name.slice(1), row_month.month - 1, 15)),
                    month: row_month.month,
                    year: parseInt(year_col_name.slice(1)),
                    temperature_anomaly: row_month[year_col_name]
                };
            })
            .sort((a, b) => a.day - b.day)
    )
}

export function climateAnomalyScales({ width, fixed, years, anomalies, compare }) {
    // Everything needed to interpret the temperature anomaly and time values
    const margin = 10;
    const rInner = 10;
    const rOuter = width / 2 - margin;

    const minMaxYears = d3.extent(years.map((d) => d[0]));

    const x = d3
        .scaleUtc()
        .domain([
            new Date(Date.UTC(fixed, 0, 1)),
            new Date(Date.UTC(fixed, 11, 31)),
        ])
        .range([0, 2 * Math.PI]);

    let anomaly_min = d3.min([-1, d3.min(anomalies, d => d.temperature_anomaly)])
    const y = d3.scaleLinear().domain(
        compare ? [anomaly_min, 1] : [anomaly_min, d3.max(anomalies, d => d.temperature_anomaly)]
    ).range([rInner, rOuter]);

    // A helper function to make the line's `angle` function look cleaner
    const dateOnRing = (d) => {
        const isoDateMonth = d.day.toISOString().slice(5, 7);
        const isoDateDay = "01";
        return x(new Date(`${fixed}-${isoDateMonth}-${isoDateDay}`));
    };

    const l = d3
        .lineRadial()
        .curve(d3.curveCardinalClosed.tension(0.1))
        .angle((D) => dateOnRing(D))
        .radius((D) => y(D.temperature_anomaly));

    const c = d3.scaleSequential(
        [...minMaxYears].reverse(),
        d3.interpolateRdYlBu
    );

    const a = Object.fromEntries([...years].reverse().map(([year, _], i) => [year, i * 20]));

    const toCartesian = (anomaly) => {
        const theta = dateOnRing(anomaly);
        const r = y(anomaly.temperature_anomaly);
        const [a, b] = d3.pointRadial(theta, r);
        return { x: a, y: b };
    };

    // We calculate the values so the visualisation becomes more tidy
    return years.map(([year, anoms]) => ({
        year,
        d: l(anoms),
        fill: c(year),
        delay: a[year],
        anoms: anoms.map((a) => ({
            ...a,
            ...toCartesian(a),
            fill: c(a.year),
        }))
    }));

}

export function SimpleClimateAnomalyRadial({ temperature_anomalies, width }) {
    let _anomalies = prepareClimateAnomalyData(temperature_anomalies);
    const years = d3.groups(_anomalies, (d) => d.day.getFullYear()).reverse();
    const fixed = d3.min(years, (d) => d[0]);

    const data = climateAnomalyScales({ width, fixed, years, anomalies: _anomalies, compare: false });

    const svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", width)
        .attr("viewBox", [-width / 2, -width / 2, width, width])
        .attr("style", "max-width: 100%; height: auto;");

    svg
        .selectAll("g.year-circle")
        .data(data)
        .join(
            (enter) => {
                const g = enter.append("g")
                    .attr("class", "year-circle")
                    .attr("id", (d) => `_${d.year}`)
                g.selectAll("path")
                    .data((d) => [d])
                    .join("path")
                    .attr("id", (d) => `_${d.year}`)
                    .attr("data-name", (d) => d.year)
                    .attr("stroke", (d) => d.fill)
                    .attr("fill", "none")
                    .attr("stroke-width", 2)
                    .attr("d", (d) => d.d);
                // For debugging the actual xy positions
                g.selectAll("circle")
                    .data((d) => d.anoms)
                    .join("circle")
                    .attr("data-name", (a) => `${a.year}-${a.month}`)
                    .attr("cx", (a) => a.x)
                    .attr("cy", (a) => a.y)
                    .attr("r", 2)
                    .attr("stroke", "#474448")
                    .attr("fill", "transparent")
                    .on("mouseover", function (e, d) {
                        console.log(d);
                        d3.select(this).attr("fill", d => d.fill)
                            .attr("r", 4);
                        svg.selectAll("g.year-circle path")
                            .attr("stroke", "#474448")
                            .attr("opacity", 0.25);
                        svg.selectAll(`g#_${d.year} path`)
                            .attr("fill", d => d.fill)
                            .attr("fill-opacity", 0.8)
                            .attr("stroke", d.fill)
                            .attr("opacity", 1).attr("stroke-width", 4);
                        tipdate.text(`${new Date(d.year, d.month - 1, 15).toLocaleString("en-GB", { year: "numeric", month: "short" })}`);
                        tipanom.text(`${d.temperature_anomaly.toFixed(2)} °C`);
                    })
                    .on("mouseout", function (e, d) {
                        svg.selectAll("g.year-circle path")
                            .attr("fill", "none")
                            .attr("stroke", D => D.fill)
                            .attr("stroke-width", 2)
                            .attr("opacity", 1);
                        d3.select(this).attr("fill", "transparent")
                            .attr("r", 2);
                        d3.select()
                        tipdate.text("");
                        tipanom.text("");
                    });
            },
            (exit) => {
                exit.select("g")
                    .transition()
                    .duration(800)
                    .delay((_, i) => (data.length - (i + 1)) * 14)
                    .attr("transform", "scale(0, 0)")
                exit.remove();
            }
        );

    const tip = svg.append("g").attr("id", "tip").attr("transform", `translate(${width / 2}, ${width / 2}})`);
    const tipdate = tip.append("text").attr("id", "tip-date").attr("text-anchor", "middle").attr("dy", -5);
    const tipanom = tip.append("text").attr("id", "tip-anom").attr("text-anchor", "middle").attr("dy", 15);

    return svg.node()
}

export function ClimateAnomalyRadial({ temperature_anomalies, width, compare, animate, peakLabel }) {
    let _anomalies = prepareClimateAnomalyData(temperature_anomalies)
    // Group anomalies per year as [year, anomalies]
    const years = d3.groups(_anomalies, (d) => d.day.getFullYear()).reverse();
    const fixed = d3.min(years, (d) => d[0]);

    const data = climateAnomalyScales({ width, fixed, years, anomalies: _anomalies, compare })

    const svg = d3
        .create("svg")
        .attr("class", animate ? "visclimate-logo" : "")
        .attr("width", width)
        .attr("height", width)
        .attr("viewBox", [-width / 2, -width / 2, width, width])
        //.attr("viewBox", [0, 0, width, width])
        .attr("style", "max-width: 100%; height: auto;");

    svg
        .selectAll("g")
        .data(data)
        .join(
            (enter) => {
                const g = enter.append("g")
                    .attr("id", (d) => `_${d.year}`)
                    .attr("style", (d) => animate ? `animation-delay:${d.delay}ms` : ``)
                g.selectAll("path")
                    .data((d) => [d])
                    .join("path")
                    .attr("id", (d) => `_${d.year}`)
                    .attr("data-name", (d) => d.year)
                    .attr("style", (d) => animate ? `animation-delay:${d.delay / 2}ms` : ``)
                    .attr("fill", (d) => d.fill)
                    .attr("fill-opacity", 1)
                    .attr("stroke", "black")
                    .attr("stroke-width", 0.5)
                    .attr("d", (d) => d.d);
            },
            (exit) => {
                exit.select("g")
                    .transition()
                    .duration(800)
                    .delay((_, i) => (data.length - (i + 1)) * 14)
                    .attr("transform", "scale(0, 0)")
                exit.remove();
            }
        );

    const peak_anomaly = d3.max(_anomalies, d => d.temperature_anomaly)

    if (peakLabel) {
        svg.select("g#_1979")
            .append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", 24)
            .text(`Peak: ${peak_anomaly.toFixed(3)}°C`)
    }
    return svg.node();
}