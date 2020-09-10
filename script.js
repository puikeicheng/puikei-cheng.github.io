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

  var x = d3.scaleBand().range([0, w]).padding(0.25),
      y = d3.scaleLinear().range([h, 0]);

  var w = 350;
  var margin = 50
  var barSpacing = 15;
  var barThickness = 10;
  var vertPadding = 5;
  var h = barSpacing * data.length + vertPadding;

  var svg = d3.select('.container')
          .append('svg')
          .attr('width', w+margin)
          .attr('height', h+margin);

  var group = svg.selectAll('g')
    .data(data)
    .enter()
    .append('g');

  var g = svg.append("g")
          .attr("transform", "translate(" + 50 + "," + ")");

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
    .ticks(data.map(function(d) { return d.Attribute; }));

  group.append("text")
     .attr("transform", "translate(100,0)")
     .attr("x", 0)
     .attr("y", 0)
     .attr("font-size", "18px")
     .text("Attribute vs Waste")

  /* ===== BARS =====*/

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

  g.append('g')
    .style('font', '16px arial')
    .attr('transform', 'translate(0,' + h + ')')
    .call(xAxis);

  g.append('g')
    .style('font', '16px arial')
    .call(yAxis);

 // text labels
 g.append("text")
       .attr("transform",
             "translate(" + (w/2) + " ," +
                            (h + margin + 20) + ")")
       .style("text-anchor", "middle")
       .text("Waste");

 // g.append("text")
 //      .attr("transform", "rotate(-90)")
 //      .attr("y", 0 - margin.left)
 //      .attr("x",0 - (height / 2))
 //      .attr("dy", "1em")
 //      .style("text-anchor", "middle")
 //      .text("Attribute");

  g.selectAll("g")
   .data(data)
   .on("mouseover", onMouseOver) //Add listener for the mouseover event
   .on("mouseout", onMouseOut)   //Add listener for the mouseout event
   .attr("y", function(d) { return x(d.Attribute); })
   .attr("x", function(d) { return y(d.Waste); })
   .attr("width", x.bandwidth())
   .attr("height", function(d) { return h - y(d.Waste); });

   /* --- bar initialize ---*/
   bars
     .transition().duration(100)
     .attr('width', function(d) {
         return xScale(d.Waste);
       });

   var textLabels = group
     .append('text')
     .text(function (d) {
       return (d.Waste*100).toFixed(2) + '%';
     })
     .attr('text-anchor', 'start')
     .attr('x', function(d) {
       return xScale(d.Waste) + 10;
     })
     .attr('y', function(d, i) {
       return i * (barSpacing) + vertPadding + (barSpacing /2);
     })
     .attr('font-family', 'arial, sans-serif')
     .attr('font-size', '12px')
     .attr('fill', '#333')
     .attr('opacity', 0)
     .transition().duration(100)
     .attr('opacity', 1)

  /* ===== Hover effects ===== */

    group.on('mouseover', function(d){
      d3.select(this)
        .select('rect')
        .transition().duration(250)
        .style('fill', 'DeepSkyBlue');
    })
      .append('title')
      .text(function (d) {
          return (d.Waste*100).toFixed(2) + '%' ;
    })

    group.on('mouseout', function(d, i){
        d3.select(this)
        .select('rect')
        .transition().duration(250)
        .style('fill', function(d,i){
          return setBarColors(d);
      });
    })

  /* ===== Functions ===== */

  /* --- BAR COLORS ---*/

  function setBarColors (d,i) {
      var colors = ['DarkGray'];
      return colors[0];
  };

  //mouseover event handler function
  function onMouseOver(d, i) {
      d3.select(this).attr('class', 'highlight');
      d3.select(this)
        .transition()     // adds animation
        .duration(100)
        .attr('width', x.bandwidth() + 5)
        .attr("y", function(d) { return y(d.Waste) - 10; })
        .attr("height", function(d) { return height - y(d.Waste) + 10; });

      g.append("text")
       .attr('class', 'val')
       .attr('x', function() {
           return x(d.Attribute);
       })
       .attr('y', function() {
           return y(d.Waste) - 15;
       })
       .text(function() {
           return [ '$' +d.Waste];  // Value of the text
       });
  }

  //mouseout event handler function
  function onMouseOut(d, i) {
      // use the text label class to remove label on mouseout
      d3.select(this).attr('class', 'bar');
      d3.select(this)
        .transition()     // adds animation
        .duration(400)
        .attr('width', x.bandwidth())
        .attr("y", function(d) { return y(d.Waste); })
        .attr("height", function(d) { return height - y(d.Waste); });

      d3.selectAll('.val')
        .remove()
  }
}
