import * as d3 from "npm:d3";


function directionToLookAt(data, eyesX) {
    const barSizeRight = data.bins[data.location + 1].length;
    const barSizeLeft = data.bins[data.location - 1].length;
    let newEyesX = eyesX;
    if (barSizeLeft > barSizeRight) {
        newEyesX = newEyesX.map((x) => x - 8);
    }
    return newEyesX;
}


export function Chart(emoji, emojiPath) {
    const svg = d3.create("svg");
    const g = svg.append("g");
    g.node().appendChild(emoji);
    const eyes = d3.select(emoji).selectAll("rect.eye");
    let eyesX = d3.map(eyes, (e) => parseFloat(d3.select(e).attr("x")));

    function render(width, data, aspectString) {
        const [widthAspect, heightAspect] = (aspectString ? aspectString : "4/3").split("/").map(s => parseInt(s))
        const height = width * (heightAspect / widthAspect);

        const x = d3
            .scaleBand(d3.range(data.bins.length), [0, width])
            .paddingInner(0.05);
        const y = d3.scaleLinear(
            [0, d3.max(data.bins.map((b) => b.length - 2))],
            [0, height]
        );

        svg
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        const eyeX = directionToLookAt(data, eyesX);

        const t = svg.transition().duration(1000).ease(d3.easeCubic);

        g.selectAll("svg")
            .attr("width", x.bandwidth())
            .attr("height", x.bandwidth())
            .attr("rx", 5);

        // Only on initial load we already define the x location
        // This way our rect-moji drops in right location, without moving across the svg
        if (svg.selectAll("rect.bar")._groups[0].length === 0) {
            g.attr("transform", `translate(${x(data.location)}, 0)`);
        }

        g.transition(t * 0.25)
            .attr("transform", `translate(${x(data.location)}, ${height})`)
            .transition(t * 0.5)
            .attr(
                "transform",
                `translate(${x(data.location)}, ${height - x.bandwidth()})`
            )
            .selectAll("rect.eye")
            .transition(t * 0.25)
            .attr("x", (_, i) => eyeX[i]);

        svg
            .selectAll("rect.bar")
            .data(
                data.bins
                    .map((b, i) => ({ length: b.length, i: i }))
                    .filter((d, i) => i != data.location)
            )
            .join(
                (enter) =>
                    enter
                        .append("rect")
                        .attr("class", "bar")
                        .attr("x", (b) => x(b.i))
                        .attr("width", x.bandwidth())
                        .attr("y", height)
                        .attr("rx", 5)
                        .transition(t * 0.9)
                        .attr("y", (b) => height - y(b.length - 2))
                        .attr("height", (b) => y(b.length - 2) - y(0))
                        .attr("fill", "black"),
                (update) =>
                    update.call((update) =>
                        update
                            .transition(t * 0.9)
                            .attr("x", (b) => x(b.i))
                            .attr("width", x.bandwidth())
                            .attr("y", (b) => height - y(b.length - 2))
                            .attr("height", (b) => y(b.length - 2) - y(0))
                    ),
                (exit) =>
                    exit.call((exit) =>
                        exit
                            .transition(t * 0.9)
                            .attr("y", height)
                            .remove()
                    )
            );

        return svg.node();
    }
    return { render };
}