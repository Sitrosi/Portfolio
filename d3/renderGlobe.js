const getGlobeData = () => {
    return {
        scale: 300,
        colour: "#69b3a2",
        clipAngle: 90
    }
}

const renderGlobe = (selector, globeData) => {    
    const {scale, colour, clipAngle} = globeData;
    // Select the existing SVG container
    const svg = d3.select(selector);

    // Set the dimensions of the globe
    const width = +svg.attr("width"), height = +svg.attr("height");

    // Define the projection for the globe
    const projection = d3.geoOrthographic()
        .scale(scale)
        .translate([width / 2, height / 2])
        .clipAngle(clipAngle);

    // Create a path generator using the projection
    const path = d3.geoPath().projection(projection);

    // Append a sphere (the globe) to the SVG
    svg.append("path")
        .datum({type: "Sphere"})
        .attr("class", "sphere")
        .attr("d", path)
        .attr("fill", colour);
}

document.addEventListener('DOMContentLoaded', function() {
    renderGlobe("#globe", getGlobeData());
});

window.addEventListener('resize', () => {
    // Clear the existing SVG
    d3.select("#globe").selectAll("*").remove();
    
    // Redraw the globe
    renderGlobe("#globe", getGlobeData());
});
