
var width = 800,
    height = 600;

var svg = d3.select("#steven-svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(50, 50)");

    d3.csv("cleanedDataByAgeGender.csv", function(data) {

      // Colors for the different Age
      var color = d3.scaleOrdinal()
        .domain(["<13", "13-15", "16-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80-84", "85+", "Total"])
        .range(d3.schemeSet2);
    
      // Size scale for the bubbles dependent on the totalDeaths
      var size = d3.scaleLinear()
        .domain([0, 38824])
        .range([7,55])  // circle will be between 7 and 55 px wide
    
      // creating the tooltip / hover
      var toolTip = d3.select("#steven")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
    
      //These functions below are the functions that control the functions of when the mouse is moving
      //Helps control the tooltip
      var mouseover = function(d) {
        toolTip
          .style("opacity", 1)
      }
      var mousemove = function(d) {
        toolTip
          .html('<u>' + d.Age + '</u>' + "<br>" + d.TotalDeaths + " deaths")
      }
      var mouseleave = function(d) {
        toolTip
          .style("opacity", 0)
      }
    
      //This creates a node that is each circle
      var node = svg.append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        // .append("text")
        //   .attr("text", function(d) {return d.Age})
        .append("circle")
          .attr("class", "node")
          .attr("r", function(d){ return size(d.TotalDeaths)})
          .attr("cx", width / 2)
          .attr("cy", height / 2)
          .style("fill", function(d){ return color(d.Age)})
          .style("fill-opacity", 0.8)
          .attr("stroke", "black")
          .style("stroke-width", 1)
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));
      // node.append("text")
      //   .text(function(d) {return d.Age})
      //   .
      //This is how the forces are being applied for the circles
      var simulation = d3.forceSimulation()
          .force("center", d3.forceCenter().x(width / 2).y(height / 2))
          .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
          .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.TotalDeaths)+3) }).iterations(1)) // Force that avoids circle overlapping
    
      // Apply these forces to the nodes and update their positions.
      // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
      simulation
          .nodes(data)
          .on("tick", function(d){
            node
                .attr("cx", function(d){ return d.x; })
                .attr("cy", function(d){ return d.y; })
          });
    

      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(.03).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }
      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(.03);
        d.fx = null;
        d.fy = null;
      }
  
})

// var pack = d3.layout.pack()
//     .size([width, height - 50])
//     .padding(10);

// d3.json("mydata.json", function(data) {
//     var nodes = pack.nodes(data);
//     console.log(nodes);

//     var node = svg.selectAll(".node")
//         .data(nodes)
//         .enter()
//         .append("g")
//             .attr("class", "node")
//             .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"});

//     node.append("circle")
//         .attr("r", function(d) {return d.r;})
//         .attr("fill", "steelblue")
//         .attr("opacity", 0.25)
//         .attr("stroke", "#ADADAD")
//         .attr("stroke-width", "2");
    
//     node.append("text")
//         .text(function (d) {return d.children ? "" : d.Age; })
// });