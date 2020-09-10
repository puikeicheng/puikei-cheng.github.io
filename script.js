var d3;
var data = "INSP_defect_rate.csv";

d3.csv(data, function(dataset) {
  // if (error) {
  //     throw error;
  // }

  data = dataset;
  buildChart();
});

function buildChart() {

  /* ===== SET UP CHART =====*/

  var w = 500;
  var barSpacing = 20;
  var barThickness = 15;
  var vertPadding = 5;
  var h = barSpacing * data.length + vertPadding;
  var margin = {top: 20, right: 20, bottom: 50, left: 60},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

  var g = d3.select('.container')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom + 50)
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xScale = d3.scaleLinear()
    .domain([0, 1.1 * d3.max(data, function(d) { return d.Waste; })])
    .range([0,w]);
  var yScale = d3.scaleBand()
    .domain(data.map(function(d) { return d.Attribute; }))
    .range([0,h]);

  var xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(5)
    .tickSize(-h, 0);
  var yAxis = d3.axisLeft()
    .scale(yScale);

  var group = g.selectAll('g')
    .data(data)
    .enter()
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + 0 + ")");

  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "toolTip")
    .style("opacity", 0.8);

/* --- Bar initialize ---*/
  var bars = group
      .append('rect')
      .attr('y', function(d, i) {return i * (barSpacing) + vertPadding})
      .attr('height', function(d) {
        return h - (barSpacing-barThickness) - yScale(
          data.map(function(d) {return d.Attribute; })[data.length-1])})
      .attr('width', function(d) {return xScale(d.Waste)})
      .attr('fill', function (d,i) {return setBarColors(d,i);});

  g.append('g')
    .style('font', '16px arial')
    .attr('transform', 'translate(' + margin.left + ',' + h + ')')
    .call(xAxis);

  g.append('g')
    .style('font', '16px arial')
    .attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
    .call(yAxis);

 /* ===== LABELS =====*/

 g.append("text")
    .attr("transform", "translate(0,0)")
    .attr("x", width/2)
    .attr("y", 0)
    .attr("font-size", "18px")
    .text("Attribute vs Waste")

 g.append("text")
       .attr("transform",
             "translate(" + ((width/2) + margin.left) + "," +
                            (h+40) + ")")
       .style("text-anchor", "middle")
       .text("Waste");

 g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Attribute");

/* ===== Mouse effects ===== */
  g.selectAll("g")
   .data(data)
   .attr("class", "bar")
   .on("click",     onMouseClick) //Add listener for the mouseclick event
   .on("mouseover", function(d) {onMouseOver(d)}) //Add listener for the mouseover event
   .on("mouseout",  onMouseOut)   //Add listener for the mouseout event
   .attr("x",       function(d) { return xScale(d.Attribute); })
   .attr("y",       function(d) { return yScale(d.Waste); })
   .attr("width",   function(d) { return xScale(d.Waste); })
   .attr("height",  h - (barSpacing-barThickness) -
                     function(d) { return yScale(d.Waste); })

  /* ===== Functions ===== */

  /* --- BAR COLORS ---*/

  function setBarColors (d,i) {
      var colors = ['DarkGray'];
      return colors[0];
  };

  //mouseover event handler function
  function onMouseClick() {
    d3.selectAll('rect')
      .style('fill', setBarColors());
    d3.select(this)
      .select('rect')
      .transition().duration(50)
      .style('fill', 'DeepSkyBlue');
  }

  //mouseover event handler function
  function onMouseOver(d) {
    tooltip.style("left", d3.event.pageX - 50 + "px")
        .style("top", d3.event.pageY - 70 + "px")
        .style("display", "inline-block")
        .text((d.Waste*100).toFixed(2) + '%');
  }

  //mouseout event handler function
  function onMouseOut() {
    tooltip.style("display", "none");
  }
}
