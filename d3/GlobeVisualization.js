class GlobeVisualization {
    constructor(selector, config) {
        this.selector = selector;
        this.config = { ...config };
        // Defer initialization to ensure DOM elements are ready.
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    async init() {
        const {scale, clipAngle, globeColour, countriesUrl, countriesBoundaryColour} = this.config;
        this.svg = d3.select(this.selector);
        // Ensure this.svg is not null by checking if node() returns a valid element
        if (!this.svg.node()) {
            console.error("SVG element not found:", this.selector);
            return;
        }

        const svgNode = this.svg.node();
        const width = svgNode.getBoundingClientRect().width;
        const height = svgNode.getBoundingClientRect().height;

        this.projection = d3.geoOrthographic()
            .scale(scale)
            .translate([width / 2, height / 2])
            .clipAngle(clipAngle);

        this.path = d3.geoPath().projection(this.projection);

        this.svg.append("path")
            .datum({ type: "Sphere" })
            .attr("d", this.path)
            .attr("fill", globeColour);

        try {
            const world = await d3.json(countriesUrl);
            this.countriesData = topojson.feature(world, world.objects.countries).features;
            this.renderGlobe();
            this.renderBoundaries(world, countriesBoundaryColour);
        } catch (error) {
            console.error("Error loading or processing countries data:", error);
        }
    }

    renderGlobe() {
        if (!Array.isArray(this.countriesData)) {
            console.log("Waiting for country data");
            return; // Exit if countriesData is not iterable
        }

        // Render countries
        this.svg.selectAll(".country")
            .data(this.countriesData)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", this.path)
            .attr("fill", this.config.countryColour);
    }

    renderBoundaries(world, countriesBoundaryColour) {
        // Render country boundaries
        const datum = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
        this.svg.append("path")
            .datum(datum)
            .attr("class", "boundary")
            .attr("d", this.path)
            .attr("fill", "none")
            .attr("stroke", countriesBoundaryColour)
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 1);
    }
}

export default GlobeVisualization;
