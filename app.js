
let width = 1000, height = 600;


let svg = d3.select("svg")
    .attr("viewBox", "0 0 " + width + " " + height)

var domain = [0, 5, 100, 500, 1000, 2000, 3000, 4000, 100000, 30000, 90000]
var colorScale = d3.scaleLinear()
  .domain(domain)
  .range(d3.schemeBlues[9])
  .interpolate(d3.interpolateLab);

//   var colorScheme = d3.schemeReds[6];
//   colorScheme.unshift("#eee")
//   var colorScale = d3.scaleThreshold()
//       .domain([0, 100, 500, 2000, 5000, 100000])
//       .range(colorScheme);

let geoData 
let populationData
// Load external data
Promise.all([d3.json("sgmap.json"), d3.csv("population2021.csv")]).then(data => {

    geoData = data[0]
    populationData = data[1]
    
// Map and projection
var projection = d3.geoMercator()
    .center([103.851959, 1.290270])
    .fitExtent([[20, 20], [980, 580]], data[0]);


let geopath = d3.geoPath().projection(projection);


var legend = d3.legendColor()
    .title("Legends (Amount of people)")
    .scale(colorScale);

svg.append("g")
    .attr("id", "districts")
    .selectAll("path")
    .data(data[0].features)
    .enter()
    .append("path")
    .attr("d", geopath)
    .attr("stroke", "grey")
    .attr("stroke-width", 0.5)
    .attr("fill", (d) => {
        let subzoneName = d.properties["Subzone Name"]

        console.log(d)
        let currentZone = populationData.find((s) => 
            s.Subzone.toLowerCase() == subzoneName.toLowerCase())

        if (currentZone != null) {
            
            if(currentZone.Population != "-") {
                return colorScale(currentZone.Population)
            } else {
                return colorScale(0)
            }
        }
        
    }).on("mouseover", (event, d) => {

        let subzoneName = d.properties["Subzone Name"]

        console.log(d)
        let currentZone = populationData.find((s) => 
            s.Subzone.toLowerCase() == subzoneName.toLowerCase())
        
        d3.select(".tooltip")
        .text(
            "Area name: " + d.properties.Name + "\n" 
            + "Population: " + currentZone.Population)
        .style("position", "absolute")
        .style("font-size", '30px')
        .style("background", "#fff")
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY) + "px");
        
    })
    .on("mouseout", (event, d) => {
        d3.select(".tooltip")
        .text("");
    })
         

    svg.append("g")
    .attr("transform", "translate(0, 20)")
    .call(legend);
})

