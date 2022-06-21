let width = 1000, height = 600;
let svg = d3.select("svg")
    .attr("viewBox", "0 0 " + width + " " + height)

var domain = [0, 5, 100, 500, 1000, 2000, 3000, 4000, 100000, 30000, 90000]
var colorScale = d3.scaleLinear()
  .domain(domain)
  .range(d3.schemeBlues[9])
  .interpolate(d3.interpolateLab);

let geoData 
let populationData

function getNum(val) {
    if(isNaN(val)) {
        return 0;
    }
    return val;
}

// Load external data
Promise.all([d3.json("sgmap.json"), d3.csv("population2021.csv")]).then(data => {

    geoData = data[0]
    populationData = data[1]

    console.log(populationData)
    //Get min max from populationData 
    var pMin = Math.min(...(populationData.map(i => getNum(i.Population))))

    var pMax = Math.max(...(populationData.map(i => getNum(i.Population))))
    

    console.log(pMin)
    console.log(pMax)
    
var colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateGnBu)
    .domain([pMin, pMax])
// Map and projection
var projection = d3.geoMercator()
    .center([103.851959, 1.290270])
    .fitExtent([[20, 20], [980, 580]], data[0]);


let geopath = d3.geoPath().projection(projection);


var legend = d3.legendColor()
    .title("Legends (Amount of people)")
    .scale(colorScale)
    .labelFormat(d3.format(".0f"))

var tooltip = d3.select(".tooltip")

svg.append("g")
    .attr("id", "districts")
    .selectAll("path")
    .data(data[0].features)
    .enter()
    .append("path")
    .attr("d", geopath)
    .attr("stroke", "grey")
    .attr("stroke-width", 0.8)
    .attr("fill", (d) => {
        let subzoneName = d.properties["Subzone Name"]

        console.log(d)
        let currentZone = populationData.find((s) => 
            s.Subzone.toLowerCase() == subzoneName.toLowerCase())

        if (currentZone != null) {
            if(currentZone.Population != "-") {
                return colorScale(currentZone.Population)
            } else if (currentZone.Population == "-"){
                return colorScale(0)
            } else {
                return colorScale(0)
            }
        }
        
    }).on("mouseover", function(e) {
        tooltip.style("visibility", "visible")

        d3.select(e.currentTarget)
        .attr("class", "hover")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("left", (e.pageX) + "px")
        .style("top", (e.pageY) + "px");
    }) 
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");

        })
        .on("mousemove", function(e, d) {
            let subzoneName = d.properties["Subzone Name"]
            let currentZone = populationData.find((s) => 
            s.Subzone.toLowerCase() == subzoneName.toLowerCase())

            tooltip
            .style("top", (e.pageY + 10) + "px")
            .style("left", (e.pageX + 10) + "px")
                .html(
                    `${d.properties.Name} - 
                    ${d.properties["Planning Area Name"]} <br> 
                    <h5> Population: ${currentZone.Population} `
                )
        })

    svg.append("g")
    .attr("transform", "translate(0, 20)")
    .call(legend);
})

