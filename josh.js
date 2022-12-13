var selectStart = document.getElementById("selectYear-start");
for (var i = 1976; i <= 2020; i++) {
  var option = document.createElement('option');
  option.value = i;
  option.innerHTML = i;
  selectStart.appendChild(option);
}

var selectEnd = document.getElementById("selectYear-end");
for (var i = 1975; i <= 2020; i++) {
  var option = document.createElement('option');
  option.value = i;
  option.innerHTML = i;
  selectEnd.appendChild(option);
}

function onYearChanged() {
    var selectStart = d3.select('#selectYear-start').node();
    var selectEnd = d3.select('#selectYear-end').node();
    var startYear = Number(selectStart.options[selectStart.selectedIndex].value);
    var endYear = Number(selectEnd.options[selectEnd.selectedIndex].value);

    updateChart(startYear, endYear);
}

function dataPreProcessor_ByYear_ByAge(row) {
    return {
        year: +row['Year'],
        age: row['Age'],
        pop: +row['Population'],
        death: +row['DeathCount'],
        rate: +row['Rate']
    };
}

var svg = d3.select("#josh-svg")
var chartG = svg.append('g')
    .attr('id', 'chartG')
    .attr("transform", "translate(0,60)");
var chartG_width = chartG.offsetWidth;
var chartG_height = chartG.offsetHeight;

var width = 790;
var height = 600;

// Title
svg.append("text")
    .attr("x", 485)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .text("US Transportation Fatalities, by Age Group, 1975-2020")
    .style("fill", "black")
    .style("font-size", 28)
    .style("font-family", "Arial Black")

// Don't forget to use "python -m http.server 8080"
const filename = "TransportationFatalities_ByYear_ByAge.csv";
var data;
d3.csv(filename, dataPreProcessor_ByYear_ByAge).then(function(dataset) {
    data = dataset;

    updateChart(1975, 2020);
});

function updateChart(start, end) {
    if (end >= start) { // Ensures user doesn't select start: 2000 and end: 1985
        createLineGraph(start, end);
    }
}

function createLineGraph(start, end) {
    var selectedYears = data.filter(d => d.year >= start && d.year <= end);

    // Reset Axes and Gridlines
    chartG.selectAll('.axis').remove();
    chartG.selectAll('.gridline').remove();

    // Scale xAxis and yAxis
    xScale = d3.scaleTime().domain([start, end]).range([110, 900])
    yScale = d3.scaleLinear().domain([0, 22000]).range([600, 0])

     // Render grid lines
     var yGridLines = d3.axisLeft() // Like latitudes
        .scale(yScale)
        .tickSize(-width)
        .tickFormat('');
    
    var xGridLines = d3.axisBottom() // Like longitudes
        .scale(xScale)
        .tickSize(-height)
        .tickFormat('');

    chartG.append('g').call(yGridLines)
        .attr('class', 'gridline')
        .attr('transform', 'translate(110,20)');

    chartG.append('g').call(xGridLines)
        .attr('class', 'gridline')
        .attr('transform', 'translate(0,620)');

    // xAxis
    xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("d"));
    chartG.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0,620)")
        .call(xAxis)
        .append("text")
        .attr("x", (900+70)/2) //middle of the xAxis
        .attr("y", "50") // a little bit below xAxis
        .text("Year");


    // yAxis
    yAxis = d3.axisLeft().scale(yScale).ticks(10);
    chartG.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(110,20)`) 
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", "-250")
        .attr("y", "-75")
        .attr("text-anchor", "end")
        .text("Deaths")

    var sumstat = d3.nest()
        .key(d => d.age)
        .entries(selectedYears);  

    var ageGroupName = sumstat.map(d => d.key) 
    var color = d3.scaleOrdinal().domain(ageGroupName).range(colorbrewer.Set2[6])

    // Reset line graphs
    chartG.selectAll('.line-path').remove();

    // Create line graphs
    chartG.selectAll(".line")
        .append("g")
        .attr("class", "line")
        .data(sumstat)
        .enter()
        .append("path")
        .attr('class', 'line-path')
        .attr("d", function (d) {
            return d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d.death)).curve(d3.curveCardinal)
                (d.values)
        })
        .attr("fill", "none")
        .attr("stroke", d => color(d.key))
        .attr("stroke-width", 4);

    // Clear previous insight, if any
    d3.select('#insights').selectAll('h3').remove();

    if (end > start) {
        generateInsight1(start, end, selectedYears);
    }

    // Legend
    var legend = chartG.selectAll('g.legend')
    .data(sumstat)
    .enter()
    .append("g")
    .attr("class", "legend");

    legend.append("circle")
    .attr("cx", 1000)
    .attr('cy', (d, i) => i * 30 + 275)
    .attr("r", 6)
    .style("fill", d => color(d.key))

    legend.append("text")
    .attr("x", 1020)
    .attr("y", (d, i) => i * 30 + 280)
    .text(d => d.key)
}

function generateInsight1(start, end, selectedYears) {
    var insightStart = selectedYears.filter(d => d.year == start);
    const sumStart = insightStart.reduce((temp, object) => {
        return temp + object.death;
    }, 0);

    var insightEnd = selectedYears.filter(d => d.year == end);
    const sumEnd = insightEnd.reduce((temp, object) => {
        return temp + object.death;
    }, 0);

    var change = "increased";
    var changeAmount = 0;
    if (sumStart > sumEnd) { // Fatality has decreased
        change = "decreased"
        changeAmount = (((sumEnd/sumStart)-1)*-100).toFixed(2);
    } else if (sumStart < sumEnd) { // Fatality has increased
        changeAmount = (((sumEnd/sumStart)-1)*100).toFixed(2);
    }

    d3.select("#insights")
        .append('h3')
        .text(`Since ${start}, ` + `fatalities ${change} by ` + changeAmount + '%.');

    const sumStart_formatted = Intl.NumberFormat('en-US').format(sumStart); // Add comma if thousands involved
    const sumEnd_formatted = Intl.NumberFormat('en-US').format(sumEnd); // Add comma if thousands involved

    d3.select("#insights")
        .append('h3')
        .text(`${sumStart_formatted} ` + `people died on America's roads in ${start}` + '.');

    d3.select("#insights")
        .append('h3')
        .text(`${sumEnd_formatted} ` + `people died on America's roads in ${end}` + '.');
}