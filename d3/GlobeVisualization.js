class GlobeVisualization {
    constructor(selector, config) {
        this.selector = selector;
        this.config = { ...config };
        this.dragging = false;
        // Defer initialization to ensure DOM elements are ready.
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    async init() {
        const {scale, clipAngle, globeColour, countriesUrl} = this.config;
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
            this.world = await d3.json(countriesUrl);
            this.countriesData = topojson.feature(this.world, this.world.objects.countries).features;
            this.renderGlobe();
        } catch (error) {
            console.error("Error loading or processing countries data:", error);
        }

        this.initializeDragBehavior();
    }

    initializeDragBehavior() {
        const drag = d3.drag()
            .on('start', this.dragStarted.bind(this))
            .on('drag', this.dragged.bind(this))
            .on('end', this.dragEnded.bind(this));

        this.svg.call(drag);
        this.lastRender = 0;
    }

    dragStarted(event) {
        this.dragging = true;
        // Capture the starting point and current rotation of the drag
        this.startRotation = this.projection.rotate();
        this.startDragPoint = [event.x, event.y];
    }

    dragged(event) {
        if (this.dragging) {
            const now = Date.now();
            if (now - this.lastRender < 10) return; // Throttle updates to every 10ms

            // Calculate the new rotation based on the drag movement
            const dx = event.x - this.startDragPoint[0];
            const dy = event.y - this.startDragPoint[1];
            const rotation = this.startRotation[0] + dx * 0.5; // Adjust sensitivity as needed
            const tilt = Math.max(-45, Math.min(45, this.startRotation[1] - dy * 0.5)); // Adjust tilt limits as needed

            this.projection.rotate([rotation, tilt]);

            requestAnimationFrame(() => this.updateGlobe());
            this.lastRender = now;
        }
    }

    dragEnded() {
        this.dragging = false;
    }

    updateGlobe() {
        // Redraw the globe with the new projection
        this.svg.selectAll('.country').attr('d', this.path);
        this.svg.selectAll('.boundary').attr('d', this.path);
    }

    renderGlobe() {
        // Ensure that this.svg is cleared only of specific elements to prevent removing the background unintentionally
        this.svg.selectAll(".country, .boundary").remove();

        // Check for the existence of the sphere path, create or update it
        const sphere = this.svg.selectAll(".sphere").data([{ type: "Sphere" }]);
        sphere.enter()
            .append("path")
            .attr("class", "sphere")
            .merge(sphere)
            .attr("d", this.path)
            .attr("fill", this.config.globeColour);

        // Ensure country data is loaded before proceeding
        if (!Array.isArray(this.countriesData)) {
            console.error("Waiting for country data");
            return;
        }

        // Render countries
        const countries = this.svg.selectAll(".country")
            .data(this.countriesData)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", this.path)
            .attr("fill", this.config.countryColour);

        // Apply hover effects to countries
        countries.on("mouseover", (event, d) => {
                d3.select(event.currentTarget).attr("fill", this.config.countryHoverColour);
                document.getElementById('countryName').textContent = d.properties.name; // Assuming an element with the id 'countryName' exists
            })
            .on("mouseout", (event, d) => {
                d3.select(event.currentTarget).attr("fill", this.config.countryColour);
                document.getElementById('countryName').textContent = "";
            });

        // Re-render boundaries if needed
        this.renderBoundaries();
    }

    renderBoundaries() {
        // Ensure the correct reference to countriesBoundaryColour from the configuration
        const countriesBoundaryColour = this.config.countriesBoundaryColour;

        // Correctly access the TopoJSON objects for world and countries
        const boundaries = topojson.mesh(this.world, this.world.objects.countries, (a, b) => a !== b);

        // Render country boundaries
        this.svg.append("path")
            .datum(boundaries)
            .attr("class", "boundary")
            .attr("d", this.path)
            .attr("fill", "none")
            .attr("stroke", countriesBoundaryColour)
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 1);
    }
}

export default GlobeVisualization;
