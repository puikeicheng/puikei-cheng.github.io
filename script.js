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

  var x = d3.scaleBand().range([0, w]),
      y = d3.scaleLinear().range([h, 0]);

  var w = 400;
  var barSpacing = 15;
  var barThickness = 10;
  var vertPadding = 5;
  var h = barSpacing * data.length + vertPadding;
  var margin = {top: 20, right: 20, bottom: 50, left: 75},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

  var g = d3.select('.container')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xScale = d3.scaleLinear()
    .domain([0, 1.1 * d3.max(data, function(d) { return d.Waste; })])
    .range([0,w]);

  var yScale = d3.scaleLinear()
    .domain([0, data.length])
    .range([h,0]);

  var xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(5)
    .tickSize(-h, 0)

  var yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(data.map(function(d) { return d.Attribute; }))

  var group = g.selectAll('g')
    .data(data)
    .enter()
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + 0 + ")");

  var bars = group
      .append('rect')
      .attr('y', function(d, i) {
        return i * (barSpacing) + vertPadding
      })
      .attr('height', function(d) {
        return h - yScale(barThickness/barSpacing);
      })
      .attr('fill', function (d,i) {
        return setBarColors(d,i);
      });

  /* --- Bar initialize ---*/
  bars.attr('width', function(d) {
        return xScale(d.Waste)});

  g.append('g')
    .style('font', '16px arial')
    .attr('transform', 'translate(' + margin.left + ',' + h + ')')
    .call(xAxis);

  g.append('g')
    .style('font', '16px arial')
    .attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
    .call(yAxis);

     /* ===== LABELS =====*/

     group.append("text")
        .attr("transform", "translate(0,0)")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-size", "18px")
        .text("Attribute vs Waste")

     g.append("text")
           .attr("transform",
                 "translate(" + (w/2) + "," +
                                (h + margin.bottom) + ")")
           .style("text-anchor", "middle")
           .text("Waste");

     g.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Attribute");

/* ===== Hover effects ===== */
  g.selectAll("g")
   .data(data)
   .on("click",     onMouseClick) //Add listener for the mouseclick event
   .on("mouseover", onMouseOver) //Add listener for the mouseover event
   .on("mouseout",  onMouseOut)   //Add listener for the mouseout event
   .attr("x", function(d) { return x(d.Attribute); })
   .attr("y", function(d) { return y(d.Waste); })
   .attr("width", x.bandwidth())
   .attr("height", function(d) { return h - y(d.Waste); })

  /* ===== Functions ===== */

  /* --- BAR COLORS ---*/

  function setBarColors (d,i) {
      var colors = ['DarkGray'];
      return colors[0];
  };

  //mouseover event handler function
  function onMouseClick(d) {
    d3.select(this)
      .select('rect')
      .transition().duration(50)
      .style('fill', 'DeepSkyBlue');
  }

  //mouseover event handler function
  function onMouseOver(d) {
    group.append('title')
      // .attr('class', 'val')
      .text(function (d) {
        return (d.Waste*100).toFixed(2) + '%';
      })
      // .attr('text-anchor', 'start')
      .attr('x', function(d) { return x(d.Attribute); } + 10)
      .attr('y', function(d) { return y(d.Waste); })
      // .attr('font-family', 'arial, sans-serif')
      // .attr('font-size', '12px')
      // .attr('fill', '#333')
      // .attr('opacity', 0)
      // .transition().duration(250)
      // .attr('opacity', 1)
  }

  //mouseout event handler function
  function onMouseOut(d) {
      d3.selectAll('.val')
        .remove()
  }
}
