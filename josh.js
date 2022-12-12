var select = document.createElement('select');
var date = new Date();
var year = date.getFullYear();
for (var i = year - 4; i <= year + 3; i++) {
  var option = document.createElement('option');
  option.value = option.innerHTML = i;
  if (i === year) option.selected = true;
  select.appendChild(option);
}
document.body.appendChild(select);


function dataPreProcessor_ByYear(row) {
    return {
        year: +row['Year'],
        pop: +row['Population'],
        car_occupant: +row['Car_Occupant'],
        pedestrian: +row['Pedestrian'],
        motorcycle: +row['Motorcycle'],
        bike: +row['Bicycle'],
        truck: +row['Trucks'],
        total: +row['Total']
    };
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

    updateChart('All');

    var sumstat = d3.nest()
        .key(d => d.age)
        .entries(data);  
    
    var ageGroupName = sumstat.map(d => d.key) 
    var color = d3.scaleOrdinal().domain(ageGroupName).range(colorbrewer.Set2[6])

    svg.selectAll(".line")
        .append("g")
        .attr("class", "line")
        .data(sumstat)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d.death)).curve(d3.curveCardinal)
                (d.values)
        })
        .attr("fill", "none")
        .attr("stroke", d => color(d.key))
        .attr("stroke-width", 2)
});

function updateChart(year) {
    var selectedYear;

    if (year === 'All') {
        selectedYear = data.filter(d => d.year != year);
    } else {
        selectedYear = data.filter(d => d.year == year);
    }
}

function onYearChanged() {
    var select = d3.select('#selectYear').node();
    var year = select.options[select.selectedIndex].value;

    updateChart(startYear, endYear);
}


//scale xAxis and yAxis
xScale = d3.scaleTime().domain([1975, 2020]).range([110, 900])
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


//yAxis
yAxis = d3.axisLeft().scale(yScale).ticks(10);
svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(110,20)`) //use variable in translate
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", "-250")
    .attr("y", "-75")
    .attr("text-anchor", "end")
    .text("Deaths")

