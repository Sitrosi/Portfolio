import GlobeVisualization from './GlobeVisualization.js';

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

const gv = new GlobeVisualization("#globe", getGlobeData());
document.addEventListener('DOMContentLoaded', () => {
    gv.renderGlobe();
});

window.addEventListener('resize', () => {
    // Clear the existing SVG
    d3.select("#globe").selectAll("*").remove();
    
    // Redraw the globe
    gv.renderGlobe();
});
