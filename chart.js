// data
const daysByCountry = {
  "Germany": 5,
  "Italy": 10,
  "Netherlands": 31,
  "Belgium": 4,
  "France": 8,
  "Spain": 4,
  "Portugal": 3,
  "Iceland": 1
};

// Cities I visited, I used Claude to give me the longitude and latitude for each city
const places = [
  { name: "Gießen",     lon: 8.68,   lat: 50.58, label: true },
  { name: "Dolomites",  lon: 11.85,  lat: 46.43, label: true },
  { name: "Padua",      lon: 11.88,  lat: 45.41, label: false },
  { name: "Ravenna",    lon: 12.20,  lat: 44.42, label: false },
  { name: "Pennabilli", lon: 12.27,  lat: 43.82, label: false },
  { name: "Arezzo",     lon: 11.88,  lat: 43.46, label: false },
  { name: "Florence",   lon: 11.26,  lat: 43.77, label: true },
  { name: "Sirmione",   lon: 10.61,  lat: 45.49, label: true },
  { name: "Rotterdam",  lon: 4.48,   lat: 51.92, label: true },
  { name: "Amsterdam",  lon: 4.90,   lat: 52.37, label: false },
  { name: "Delft",      lon: 4.36,   lat: 52.01, label: false },
  { name: "Utrecht",    lon: 5.12,   lat: 52.09, label: false },
  { name: "Brussels",   lon: 4.35,   lat: 50.85, label: false },
  { name: "Antwerp",    lon: 4.40,   lat: 51.22, label: false },
  { name: "Paris",      lon: 2.35,   lat: 48.86, label: true },
  { name: "Nice",       lon: 7.27,   lat: 43.70, label: true },
  { name: "Madrid",     lon: -3.70,  lat: 40.42, label: true },
  { name: "Lisbon",     lon: -9.14,  lat: 38.72, label: true },
  { name: "Reykjavík",  lon: -21.94, lat: 64.15, label: true }
];

// chart

const width = 800;
const height = 600;

const svg = d3.select("#chart")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`);

const tooltip = d3.select("#chart")
  .append("div")
  .attr("class", "tooltip");

const europeBox = {
  type: "Feature",
  geometry: {
    type: "MultiPoint",
    coordinates: [[-25, 36], [20, 36], [20, 66], [-25, 66]]
  }
};

const projection = d3.geoMercator().fitSize([width, height], europeBox);
const path = d3.geoPath(projection);

const color = d3.scaleLinear()
  .domain([0, d3.max(Object.values(daysByCountry))])
  .range(["#dce8d9", "#457359"]);

d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
  .then(function (world) {

    const countries = topojson.feature(world, world.objects.countries);

    // Draw the countries
    svg.selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", function (d) {
        const days = daysByCountry[d.properties.name];
        return days ? color(days) : "#f0eded"; // gray if not visited
      })
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .on("mouseover", function (event, d) {
        const days = daysByCountry[d.properties.name];
        if (!days) return; // no tooltip for countries I didn't visit
        tooltip.style("opacity", 1)
          .html(`<strong>${d.properties.name}</strong><br>${days} days`);
      })
      .on("mousemove", function (event) {
        const [x, y] = d3.pointer(event, document.getElementById("chart"));
        tooltip.style("left", (x + 12) + "px")
               .style("top", (y - 10) + "px");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });

    // City dots
    svg.selectAll("circle")
      .data(places)
      .enter()
      .append("circle")
      .attr("cx", d => projection([d.lon, d.lat])[0])
      .attr("cy", d => projection([d.lon, d.lat])[1])
      .attr("r", 4)
      .attr("fill", "#D37897")
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    // City labels
    svg.selectAll(".city-label")
      .data(places.filter(d => d.label))
      .enter()
      .append("text")
      .attr("class", "city-label")
      .attr("x", d => projection([d.lon, d.lat])[0] + 7)
      .attr("y", d => projection([d.lon, d.lat])[1] + 4)
      .text(d => d.name);

    // Key
    const maxDays = d3.max(Object.values(daysByCountry));
    const legend = svg.append("g")
      .attr("transform", `translate(20, ${height - 100})`);

    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", color(0));
    gradient.append("stop").attr("offset", "100%").attr("stop-color", color(maxDays));

    legend.append("text")
      .attr("class", "legend-text")
      .attr("y", 0)
      .text("Days spent in each country");

    legend.append("rect")
      .attr("y", 10)
      .attr("width", 200)
      .attr("height", 12)
      .attr("rx", 6)
      .attr("fill", "url(#legend-gradient)");

    const legendScale = d3.scaleLinear().domain([0, maxDays]).range([0, 200]);

    legend.append("g")
      .attr("transform", "translate(0, 24)")
      .call(d3.axisBottom(legendScale).ticks(4))
      .select(".domain").remove();

    legend.append("circle")
      .attr("cx", 6)
      .attr("cy", 64)
      .attr("r", 5)
      .attr("fill", "#D37897")
      .attr("stroke", "white");

    legend.append("text")
      .attr("class", "legend-text")
      .attr("x", 18)
      .attr("y", 68)
      .text("Cities I visited");
  });