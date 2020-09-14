var d3
var defectData = "https://raw.githubusercontent.com/puikeicheng/puikeicheng.github.io/master/INSP_defect_rate.csv";
var wasteData = "https://raw.githubusercontent.com/puikeicheng/puikeicheng.github.io/master/INSP_waste_rate.csv";

d3.csv(wasteData, function(dataset) {
  wData = dataset;

  Line_Pie('#SupplierWaste', wData);
});
d3.csv(defectData, function(dataset) {
  data = dataset;
  Bar_Line('#AttributeDefect', data)
});


/* ---------------------- Line and Pie dashboard ---------------------- */

function Line_Pie(id, data){

  // Pre-process data (nested array)
    var wData = [];
    for (var i = 0; i < data.length; i++) {
      wData.push({Date: data[i]['Date'],
                  Waste: {Sup1: +data[i]['Sup1'],
                         Sup2: +data[i]['Sup2']}});
    }
    // calculate total waste by segment for all date.
    wData.forEach(function(d){d.total=d.Waste.Sup1+d.Waste.Sup2;
                                d.mean=d.total/2});
    // compute total for each date.
    var tF = ['Sup1','Sup2'].map(function(d){
        return {type:d, Waste: d3.mean(wData.map(function(t){return t.Waste[d];}))};
    });
    // calculate total waste by date for all segment.
    var sF = wData.map(function(d){return [d.Date,d.total];});

    var barColor = 'DarkGray';
    function segColor(c){ return {Sup1:"DarkGreen", Sup2:"SteelBlue"}[c]; }

  // Create and update subplots
    var hG = histoGram(sF), // create the histogram.
        pC = pieChart(tF), // create the pie-chart.
        leg= legend(tF);  // create the legend.

    // function to handle histogram.
    function histoGram(fD){
        var hG={},    hGDim = {t: 60, r: 0, b: 30, l: 0};
        hGDim.w = 500 - hGDim.l - hGDim.r,
        hGDim.h = 300 - hGDim.t - hGDim.b;

        //create svg for histogram.
        var hGsvg = d3.select(id).append("svg")
            .attr("width", hGDim.w + hGDim.l + hGDim.r)
            .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
            .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

        // create function for x-axis mapping.
        var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
                .domain(fD.map(function(d) { return d[0]; }));

        // Add x-axis to the histogram svg.
        hGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hGDim.h + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"));

        // Create function for y-axis map.
        var y = d3.scale.linear().range([hGDim.h, 0])
                .domain([0, d3.max(fD, function(d) { return d[1]; })]);

        // Create bars for histogram to contain rectangles and waste labels.
        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                .append("g").attr("class", "bar");

        //create the rectangles.
        bars.append("rect")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.rangeBand())
            .attr("height", function(d) { return hGDim.h - y(d[1]); })
            .attr('fill',barColor)
            .on("mouseover",mouseover)// mouseover is defined below.
            .on("mouseout",mouseout);// mouseout is defined below.

        //Create the waste labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(",")(d[1])})
            .attr("x", function(d) { return x(d[0])+x.rangeBand()/2; })
            .attr("y", function(d) { return y(d[1])-5; })
            .attr("text-anchor", "middle");

        function mouseover(d){  // utility function to be called on mouseover.
            // filter for selected date.
            var st = wData.filter(function(s){ return s.Date == d[0];})[0],
                nD = d3.keys(st.Waste).map(function(s){ return {type:s, Waste:st.Waste[s]};});

            // call update functions of pie-chart and legend.
            pC.update(nD);
            leg.update(nD);
        }

        function mouseout(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.
            pC.update(tF);
            leg.update(tF);
        }

        // create function to update the bars. This will be used by pie-chart.
        hG.update = function(nD, color){
            // update the domain of the y-axis map to reflect change in waste.
            y.domain([0, d3.max(nD, function(d) { return d[1]; })]);

            // Attach the new data to the bars.
            var bars = hGsvg.selectAll(".bar").data(nD);

            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) { return hGDim.h - y(d[1]); })
                .attr("fill", color);

            // transition the waste labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return y(d[1])-5; });
        }
        return hG;
    }

    // function to handle pieChart.
    function pieChart(pD){
        var pC ={},    pieDim ={w:150, h: 150};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

        // create svg for pie chart.
        var piesvg = d3.select(id).append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");

        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d.Waste; });

        // Draw the pie slices.
        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            .on("mouseover",mouseover).on("mouseout",mouseout);

        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        }
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
            // call the update function of histogram with new data.
            hG.update(wData.map(function(v){
                return [v.Date,v.Waste[d.data.type]];}),segColor(d.data.type));
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            hG.update(wData.map(function(v){
                return [v.Date,v.total];}), barColor);
        }
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }
        return pC;
    }

    // function to handle legend.
    function legend(lD){
        var leg = {};

        // create table for legend.
        var legend = d3.select(id).append("table").attr('class','legend');

        // create one row per segment.
        var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");

        // create the first column for each segment.
        tr.append("td").append("svg").attr("width", '14').attr("height", '14').append("rect")
            .attr("width", '14').attr("height", '14')
			      .attr("fill",function(d){ return segColor(d.type); });

        // create the second column for each segment.
        tr.append("td").text(function(d){ return d.type;});

        // create the third column for each segment.
        tr.append("td").attr("class",'legendFreq')
            .text(function(d){ return d3.format(".2%")(d.Waste);});

        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return getLegend(d,lD);});

        // Utility function to be used to update the legend.
        leg.update = function(nD){
            // update the data attached to the row elements.
            var l = legend.select("tbody").selectAll("tr").data(nD);

            // update waste.
            l.select(".legendFreq").text(function(d){ return d3.format(".2%")(d.Waste);});

            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});
        }

        function getLegend(d,aD){ // Utility function to compute percentage.
            return d3.format(".2%")(d.Waste/d3.sum(aD.map(function(v){ return v.Waste; })));
        }

        return leg;
    }
}

/* ---------------------- Bar and Line dashboard ---------------------- */

function Bar_Line(id, data) {

  /* ===== SET UP CHART =====*/

  var w = 400;
  var barSpacing = 20;
  var barThickness = 15;
  var vertPadding = 5;
  var h = barSpacing * data.length + vertPadding;
  var margin = {top: 50, right: 50, bottom: 100, left: 100},
    width = w + margin.left + margin.right,
    height = h + margin.top + margin.bottom;

  var hB = d3.select(id)
          .append('svg')
          .attr('width', width )
          .attr('height', height )
          // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xScale = d3.scaleLinear()
    .domain([0, 1.05 * d3.max(data, function(d) { return d.Waste; })])
    .range([0,w]);
  var yScale = d3.scaleBand()
    .domain(data.map(function(d) { return d.Attribute; }))
    .range([0,h]);

  var xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(5,'.2%')
    .tickSize(-h, 0)
  var yAxis = d3.axisLeft()
    .scale(yScale);

  var group = hB.selectAll('hB')
    .data(data)
    .enter()
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "toolTip")
    .style("opacity", 0.75);

/* --- INITIALIZE BARS ---*/

  var hbars = group
      .append('rect')
      .attr('y', function(d, i) {return i * (barSpacing) + vertPadding})
      .attr('height', function(d) {
        return h - (barSpacing-barThickness) - yScale(
          data.map(function(d) {return d.Attribute; })[data.length-1])})
      .attr('width', function(d) {return xScale(d.Waste)})
      .attr('fill', function (d,i) {return setBarColors(d,i);});

  /* Axis and gridlines */
  hB.append('g')
    .style('font', '16px arial')
    .attr('transform', 'translate(' + margin.left + ',' + (h + margin.top) + ')')
    .call(xAxis);
  hB.append('g')
    .style('font', '16px arial')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .call(yAxis);

 /* ===== LABELS =====*/

 hB.append("text")
    .attr("transform", "translate(0,0)")
    .attr("x", w/2 + margin.left)
    .attr("y", margin.top/2)
    .attr("font-size", "18px")
    .text("Attribute vs Waste")

 hB.append("text")
    .attr("transform",
       "translate(" + ((w/2) + margin.left) + "," +
                      (h + margin.bottom) + ")")
    .style("text-anchor", "middle")
    .text("Waste");

 hB.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 )
    .attr("x", 0 - (h / 2) + margin.top)
    .attr("font-size", "18px")
    .style("text-anchor", "middle")
    .text("Attribute");

/* ===== Mouse effects ===== */
  hB.selectAll("g")
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

  //bar colors//
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
      .style('fill', 'SteelBlue');
  }
  //mouseover event handler function
  function onMouseOver(d) {
    tooltip.style("left", d3.event.pageX + 50 + "px")
        .style("top", d3.event.pageY - 25 + "px")
        .style("display", "inline-block")
        .text(d.Attribute +":  " + (d.Waste*100).toFixed(2) + "%");
  }
  //mouseout event handler function
  function onMouseOut() {
    tooltip.style("display", "none");
  }
}
