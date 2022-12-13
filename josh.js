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

// don't forget to use "python -m http.server 8080"
const filename = "TransportationFatalities_ByYear_ByAge.csv";
var data;
d3.csv(filename, dataPreProcessor_ByYear_ByAge).then(function(dataset) {
    data = dataset;

    updateChart(1975, 2020);
});

function updateChart(start, end) {
    if (end > start) {
        createLineGraph(start, end);
    } else if (end == start) {
        createBarGraph(start);
    }
}

function createLineGraph(start, end) {
    var selectedYears = data.filter(d => d.year >= start && d.year <= end);

    // reset Axes
    svg.selectAll('.axis').remove();

    // scale xAxis and yAxis
    xScale = d3.scaleTime().domain([start, end]).range([110, 900])
    yScale = d3.scaleLinear().domain([0, 22000]).range([600, 0])

    // xAxis
    xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("d"));
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0,620)")
        .call(xAxis)
        .append("text")
        .attr("x", (900+70)/2) //middle of the xAxis
        .attr("y", "50") // a little bit below xAxis
        .text("Year");


    // yAxis
    yAxis = d3.axisLeft().scale(yScale).ticks(10);
    svg.append("g")
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

    // reset line graphs
    svg.selectAll('.line-path').remove();

    // create line graphs
    svg.selectAll(".line")
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
        .attr("stroke-width", 2)
}

function createBarGraph(year) {

}