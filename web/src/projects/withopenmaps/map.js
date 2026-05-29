import { groups, sum, create, zoom, zoomIdentity, scaleLinear, max, geoMercator, geoPath, line, curveBundle, easeCubic } from "npm:d3";
import * as topojson from "npm:topojson-client";

// Group geolocations to exclude duplicates
export function groupGeolocations(geolocations) {
    return groups(geolocations, (gl) => gl.name).map(
        ([name, items]) => ({
            name,
            weight: sum(items, i => i.weight),
            location: items[0].location,
        })
    )
}

// Get a single episode by name
export function filterEpisodes(data, name) {
    return data.outputs.filter(output => output.geolocations.filter(
        (gl) => gl.name === name).length > 0
    )
}

// Get all locations related through at least on episode
// Returns all episodes for a geolocation name and all related geolocations
export function findRelatedLocations(data, name) {
    const episodes = filterEpisodes(data, name);
    let related = groupGeolocations(
        data.outputs.filter(
            ({ title }) => episodes.map((e) => e.title).includes(title)
        ).flatMap(
            episode => episode.geolocations.map(gl => gl)
        )
    );
    const source = related.find(gl => gl.name === name);
    related = related.filter(gl => gl.name !== source.name);

    return { episodes, related, source }
}

export async function ArteMap(data, lmap, cmap) {
    let land = topojson.merge(lmap, lmap.objects.land.geometries);
    let countries = topojson.mesh(cmap, cmap.objects.countries, (a, b) => a !== b);

    const svg = create("svg")
        .attr("id", "map-content")
        .attr("overflow", "hidden")
        .attr("style", "background-color: #8ecae6; border-radius: 11px;");
    const root = svg.append("g");
    const g = {
        basemap: root.append("g"),
        dots: root.append("g"),
    }

    function zoomed(event) {
        const { transform } = event;
        root.attr("transform", transform);
    }
    const zooming = zoom()
        .scaleExtent([1, 10])
        .on("zoom", zoomed);

    const radiusScale = scaleLinear()
        .domain([1, max(Object.values(data.lookup_by_name), (d) => d.episodes.length)])
        .range([1, 12])

    svg.call(zooming);

    function render({ source, related, width, height }) {
        svg.attr("viewBox", [0, 0, width, height])

        // Projection updates through width on resize
        const projection = geoMercator()
            .translate([width / 2, height / 2]);

        function zoomingCenterOn({ lon, lat }, k = 3) {
            const [x, y] = projection([lon, lat]);

            const transform = zoomIdentity
                .translate(width / 2, height / 2)
                .scale(k)
                .translate(-x, -y);

            svg.transition()
                .duration(700)
                // Fires "zoom" event which in turn calls zoomed
                .call(zooming.transform, transform);
        }

        const path = geoPath().projection(projection);

        const link = line()
            .x(d => projection([d.lon, d.lat])[0])
            .y(d => projection([d.lon, d.lat])[1])
            .curve(curveBundle.beta(0.9));

        g.basemap.selectAll("path.land")
            .data([land])
            .join("path")
            .attr("class", "land")
            .attr("d", path);

        g.basemap.selectAll("path.country-interior")
            .data([countries])
            .join("path")
            .attr("class", "country-interior")
            .attr("stroke-width", 0.5)
            .attr("d", path);


        function checkHightlight(name) {
            let className = "location";
            if (name === source.name || related.filter((r) => r.name === name).length > 0) {
                className = "location-highlight";
            }
            return className;
        }

        const t = svg.transition().duration(700).ease(easeCubic);

        const circleData = Object.entries(data.lookup_by_name).map(
            ([key, values]) => ({
                title: key,
                r: radiusScale(values.episodes.length),
                xy: projection([...values.origin_coords].reverse())
            })
        )

        g.dots.selectAll("circle")
            .data(circleData)
            .join(
                (enter) => enter.append("circle")
                    .attr("class", ({ title }) => checkHightlight(title))
                    .attr("title", ({ title }) => title)
                    .transition(t)
                    .attr("r", ({ title, r }) => checkHightlight(title).includes("highlight") ? r : 1)
                    .attr("cx", ({ xy }) => xy[0])
                    .attr("cy", ({ xy }) => xy[1]),
                (update) => update
                    .attr("class", ({ title }) => checkHightlight(title))
                    .attr("title", ({ title }) => title)
                    .attr("r", 1)
                    .transition(t)
                    .attr("r", ({ title, r }) => checkHightlight(title).includes("highlight") ? r : 1)
                    .attr("cx", ({ xy }) => xy[0])
                    .attr("cy", ({ xy }) => xy[1]),
                (exit) => exit
            );

        g.dots.selectAll("path.link")
            .data(related.map(target => [source.location, target.location]))
            .join("path")
            .attr("class", "link")
            .attr("d", link)

        const labelsData = [source, ...related].map(
            (d) => ({ ...circleData.find(c => c.title === d.name) })
        )

        g.dots.selectAll("text.label")
            .data(labelsData)
            .join(
                enter => {
                    enter.append("text")
                        .attr("class", "label")
                        .attr("x", d => d.xy[0])
                        .attr("y", d => d.xy[1])
                        .attr("dy", 0)
                        .transition(t)
                        .delay(350)
                        .attr("font-size", 8)
                        .attr("font-weigth", 600)
                        .attr("dy", d => -(d.r + 1))
                        .attr("text-anchor", "middle")
                        .text(d => d.title)
                },
                update => {
                    update
                        .attr("x", d => d.xy[0])
                        .attr("y", d => d.xy[1])
                        .attr("dy", 0)
                        .transition(t)
                        .delay(350)
                        .attr("dy", d => -(d.r + 1))
                        .text(d => d.title)
                },
                exit => {
                    exit
                        .transition()
                        .duration(350)
                        .remove()
                }
            )

        zoomingCenterOn(source.location);

        return svg.node();
    }
    return { render };
}