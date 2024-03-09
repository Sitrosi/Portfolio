const getGlobeData = () => {
    return {
        scale: 300,
        globeColour: "#87CEEB", // Sea blue for the globe
        countryColour: "#228B22", // Land green for the countries
        countriesBoundaryColour: "#000", // Black for country boundaries
        clipAngle: 90,
        countriesUrl: "countries-110m.json"
    }
}

const renderGlobe = (selector, globeData) => {    
    const {
        scale,
        globeColour,
        countryColour,
        countriesBoundaryColour,
        clipAngle,
        countriesUrl
    } = globeData;

    const svg = d3.select(selector);
    const width = +svg.attr("width"), height = +svg.attr("height");
    const projection = d3.geoOrthographic()
        .scale(scale)
        .translate([width / 2, height / 2])
        .clipAngle(clipAngle);
    const path = d3.geoPath().projection(projection);
    svg.append("path")
        .datum({type: "Sphere"})
        .attr("class", "sphere")
        .attr("d", path)
        .attr("fill", globeColour);

    d3.json(countriesUrl).then(world => {
        const countries = topojson.feature(world, world.objects.countries).features;

        // Render countries
        svg.selectAll(".country")
           .data(countries)
           .enter().append("path")
           .attr("class", "country")
           .attr("d", path)
           .attr("fill", countryColour);

        // Render country boundaries
        svg.append("path")
           .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
           .attr("class", "boundary")
           .attr("d", path)
           .attr("fill", "none")
           .attr("stroke", countriesBoundaryColour)
           .attr("stroke-linejoin", "round")
           .attr("stroke-width", 1);
    }).catch(error => console.error(error));
}

document.addEventListener('DOMContentLoaded', () => {
    renderGlobe("#globe", getGlobeData());
});

window.addEventListener('resize', () => {
    // Clear the existing SVG
    d3.select("#globe").selectAll("*").remove();
    
    // Redraw the globe
    renderGlobe("#globe", getGlobeData());
});
