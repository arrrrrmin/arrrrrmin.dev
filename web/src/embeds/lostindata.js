import {JSDOM} from "jsdom";
import * as d3 from "d3";

// DOM
const { window } = new JSDOM("");
const { document, DOMParser, XMLSerializer } = window;

// Parameters
const [min, max] = [0, 200];
const settings = {
    count: 404,
    min,
    max,
    random: d3.randomInt,
    location: d3.randomInt
};
const emojiPath = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect id="head" width="100" height="100" rx="10" fill="black"/>
<rect x="23" y="68" width="60" height="10" rx="3" fill="white"/>
<rect x="22" y="24" width="20" height="20" rx="3" fill="white"/>
<rect class="rectmoji-eye" x="32" y="26" width="8" height="8" rx="3" fill="black"/>
<rect x="63" y="24" width="20" height="20" rx="3" fill="white"/>
<rect class="rectmoji-eye" x="73" y="26" width="8" height="8" rx="3" fill="black"/>
</svg>
`;
const emoji = new DOMParser()
    .parseFromString(emojiPath, "image/svg+xml").documentElement;

// Helper functions
export function getData() {
    const random_data = Float64Array.from(
        { length: settings.count },
        settings.random(settings.min, settings.max)
    );
    const nbins = 12;
    const bins = d3.bin()
        .thresholds(d3.range(0, settings.max, settings.max / nbins))
        (random_data);
    const location = Float64Array.from(
        { length: 1 },
        settings.location(1, bins.length - 1)
    )[0];
    return { bins, location };
}

// The main function
export function getChart() {
    const data = getData();
    const [width, height] = [640, 320];
    const svg = d3.select(document.body)
        .append("svg")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

    const g = svg.append("g");
    g.node().appendChild(emoji);

    const x = d3
        .scaleBand(d3.range(data.bins.length), [0, width])
        .paddingInner(0.05);
    const y = d3.scaleLinear(
        [0, d3.max(data.bins.map((b) => b.length - 2))],
        [0, height]
    );

    const emojiSvg = g.selectAll("svg")
        .attr("width", x.bandwidth())
        .attr("height", x.bandwidth());

    emojiSvg.append("style")
        .text(`
@keyframes look-around {
  0%, 100% { transform: translateX(0); }
  25%      { transform: translateX(-8px); }
  75%      { transform: translateX(0); }
}

.rectmoji-eye {
  animation: look-around 3s ease-in-out infinite;
}

@keyframes bar-pulse {
  0%, 100% { transform: scaleY(0.96); }
  50%      { transform: scaleY(1); }
}

.bar {
  transform-box: fill-box;     /* origin is the rect, not the viewport */
  transform-origin: bottom;    /* anchor the baseline */
  animation: bar-pulse 3s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
    .rectmoji-eye { animation: none; }
    .bar { animation: none; }
}

`
        )

    g
        .attr(
            "transform",
            `translate(${x(data.location)}, ${height - x.bandwidth()})`
        )

    svg
        .selectAll("rect.bar")
        .data(
            data.bins
                .map((b, i) => ({ length: b.length, i: i }))
                .filter((d, i) => i != data.location)
        )
        .join("rect")
        .attr("class", "bar")
        .attr("x", (b) => x(b.i))
        .attr("width", x.bandwidth())
        .attr("rx", 5)
        .attr("y", (b) => height - y(b.length - 2))
        .attr("height", (b) => y(b.length - 2) - y(0))
        .attr("fill", "black")
        .style("animation-delay", (_, i) => `${i * 0.12}s`);

    return svg.node();
}
