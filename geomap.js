//help from Diana Flores
// sources:
//https://github.com/scottpham/california-counties
//https://stackoverflow.com/questions/45226063/d3-js-onclick-switching-other-line-color
//https://bl.ocks.org/mbostock/5562380
//Define Margin
    var margin = {left: 80, right: 80, top: 50, bottom: 50 }, 
        width = 1400 - margin.left -margin.right,
        height = 500 - margin.top - margin.bottom;


//blues 
var blues = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(d3.schemeBlues[9]);

//brBG
var purple = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(d3.schemeBuPu[8]);

//color array for boundary 
var color = [purple, blues]

//current color for toggle purposes
var currColor = 0; 

//currend boarder color for purposes/ the opacity
var currBoarder = 1; 

//Define SVG
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

//projeciton definition
var projection = d3.geoMercator()
        .scale(2000 * 2)
        .center([-87, 36])
        //.translate([width/2, height/2]);//works but tried another method above


//path and projection so we can see the map
var path = d3.geoPath().projection(projection);
    //Define Scales  
var x = d3.scaleSqrt()
    .domain([0, 4500])
    .rangeRound([440, 950]);


function render(obj) {
    
    
//legend
var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

//colors for legend and adding rectangles 
g.selectAll("rect")
  .data(color[currColor].range().map(function(d) {
      d = color[currColor].invertExtent(d);
      if (d[0] == undefined) d[0] = 0; 
      return d;
    }))


    
//rectange defintion * their rendering
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color[currColor](d[0]); });
    
    

//adding text to the legend
g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Population per square mile");


//calling axis to display
g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickValues(color[currColor].domain()))
  .select(".domain")
    .remove();

                            
//reading the json file with geocoordinates and population information
d3.json("TNC.json").then(function(topology) {

    console.log("hi");
    console.log(topology);
    console.log(topojson.feature(topology, topology.objects.subunits));
    //console.log(topojson.feature(topology, topology.objects.counties));

    //adding tennessee map
    
    //adds the colors according to population
    svg.append("g")
    .selectAll("path")
    .data(topojson.feature(topology, topology.objects.subunits).features)
    .enter().append("path")
      .attr("fill", function(d) { return color[currColor](d.properties.POP/ ((0.00000038610 * d.properties.ALAND))); })
      .attr("d", path);
    
    //draws the map path
   svg.append("path")
      .datum(topojson.feature(topology, topology.objects.subunits))
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-opacity", currBoarder)
      .attr("d", path);
    
    
    svg.selectAll(".subunit")
			  .data(topojson.feature(topology, topology.objects.subunits).features)
    //adds colors
    .enter().append("path")
			.attr("class", function(d) { return "subunit " + d.properties.NAME; })
			.attr("d", path)
            .attr("fill", "transparent")
    
    
    //tooltip
	.on("mouseover", function(d){ //tooltip displays popualtion and county 
				div.transition()
					.duration(200)
					.style("opacity", .9);
                //displaying county name
				div.html(d.properties.NAME + " County" + "<br/>" + "Population: " + d.properties.POP )
					.style("left", (d3.event.pageX) + 10 + "px")
					.style("top", (d3.event.pageY - 30) + "px"); 
    			})
			.on("mouseout", function(d) { 
				div.transition()
					.duration(500)
					.style("opacity", 0.0);
			});

    
    //this is for the exterior boundary

    
        var exteriorBoundary = svg.append("path")
			.datum(topojson.mesh(topology, topology.objects.subunits, function(a, b) { return a === b;}))
			.attr("d", path)
			.attr("class", "exterior-boundary");

		//tooltop declaration
		var div = d3.select("body").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);
    
   console.log("after path append");
    
});
}

//call to render
    
    
d3.json("TNC.json").then(render);
    
    
        
    //change colors
    function updateColor()
    {
        if (currColor == 0) {
            currColor = 1; 
        }
        else {
            currColor = 0; 
        }
        d3.json("TNC.json").then(render);
    }
    
    function updateBorder() {
        if (currBoarder == 1) {
            currBoarder = 0;
        }
        else {
            currBoarder = 1;
        }
        
        d3.json("TNC.json").then(render);
        }
