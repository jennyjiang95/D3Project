// feel free to remove this, it's just to help you make sure you're loading the correct file
console.log('hello world from punchcard.js!');

// set up chart area
var margin = { top: 20, right: 30, bottom: 30, left: 80 };
var width = 800 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

// set up scales!
var xScale = d3.scalePoint().padding(0.3);
var yScale = d3.scalePoint().padding(0.1);
var radius = d3.scaleSqrt();
var color = d3.scaleOrdinal();

// set up some axis functions
var yAxis = d3.axisLeft().scale(yScale);
var xAxis = d3.axisBottom()
  .tickFormat(function(d) { return d; })
  .scale(xScale);

var maxYield = null;
var years = [];
var genTypes = [];

var svg = null;
var g = null;

var dispatch = d3.dispatch('load', 'statechange');

// asynchronously load our barley.json data,
// and invoke the renderChart function upon a successful network request
d3.json('./data/barley.json', renderChart);

// function that renders the punchcard chart and is passed to d3.json() above
// takes two args: error (object) which is passed if the network request failed
// data: (object) the JSON response, in this case an array of objects
function renderChart(error, data) {
  // check to see if something went wrong
  // "throw" the error which will prevent the rest of the code from running
  if (error) throw error;

  maxYield = d3.max(data, function(d) { return d.yield; });

  // create an array of the unique years in our dataset
  years = data.reduce(function(acc, cur) {
    if (acc.indexOf(cur.year) === -1) {
      acc.push(cur.year);
    }
    return acc;
  }, []);

  // create an array of the unique gen types in our dataset
  genTypes = data.reduce(function(acc, cur) {
    if (acc.indexOf(cur.gen) === -1) {
      acc.push(cur.gen);
    }
    return acc;
  }, []);

  var nested = d3.nest()
    .key(function(d) { return d.site; })
    .key(function(d) { return d.gen; })
    .entries(data);

  var map = d3.map(nested, function(d) { return d.key; });

  // dispatch custom events
  // first one will create our dropdown menu
  dispatch.call('load', this, map);
  dispatch.call('statechange', this, map.get('Morris'));
} // end renderChart

// register a listener for "load" and create the select / dropdown element
dispatch.on('load.menu', function(map) {
  var header = d3.select('body')
    .append('div')
    .attr('class', 'header')
    .style('width', width + margin.left + margin.right + 'px');

  header.append('h3')
    .style('margin-left', '20px');

  var select = header.append('select')
    .on('change', function() {
      var site = this.value;
      dispatch.call('statechange', this, map.get(site));
    });

  select.selectAll('option')
    .data(map.keys().sort())
    .enter().append('option')
    .attr('value', function(d) { return d; })
    .text(function(d) { return d; });

  dispatch.on('statechange.menu', function(site) {
    select.property('value', site.key);
  });
});

// Second event listener
// Set up scales, create the svg element and main group, create axises
dispatch.on('load.chart', function(map) {
  xScale.range([0, width]).domain(years);

  yScale.range([0, height]).round(true);

  color.range(d3.schemeCategory20).domain(genTypes);

  radius.range([0, 15]).domain([0, maxYield]);

  svg = d3.select('body').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

  g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top +  ')');

  g.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  g.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0, ' + height + ')')
    .call(xAxis);
});


// Third event listener functions
// make the chart update, go through the general update pattern
// previously this was the update chart function
dispatch.on('statechange.chart', function(site) {
  var t = g.transition().duration(750);

  yScale.domain(
    site.values.map(function (d) {
      return d.key;
    })
    .sort()
  );

  // reset the x axis yscale
  yAxis.scale(yScale);

  // redrawing the y axis
  t.select("g.y.axis").call(yAxis);

  // binding the outer most values array to the main svg group element
  g.datum(site.values);

  // create an empty selection of groups for each genetic variety of barley
  // bind data and set the data binding key
  var gens = g.selectAll('g.site')
    .data(
      function(d) { return d; },
      function(d) { return d.key; } // "key" here represents barely genetic variety
    );

  // remove group elements that no longer exist in our new data
  var removed = gens.exit().remove();

  // update existing groups left over from the previous data
  gens
    .transition(t)
    .attr('transform', function(d) {
      return 'translate(0, ' + yScale(d.key) + ')';
    });

  // create new groups if our new data has more elements then our old data
  gens.enter().append('g')
    .attr('class', 'site')
    .transition(t)
    .attr('transform', function(d) {
      return 'translate(0, ' + yScale(d.key) + ')';
    });

  // reselect our gen site groups
  gens = g.selectAll('g.site');

  // nested selection
  // empty selection of circles that may or may not yet exist
  // join inner values array for each gen type
  var circles = gens.selectAll('circle')
    .data(
      function(d) { return d.values; }, // represents our actual data
      function(d) { return d.year; }
    );

  // go through the general update pattern again
  // exit remove circles
  circles.exit()
    .transition(t)
    .attr('r', 0)
    .style('fill', 'rgba(255, 255, 255, 0)')
    .remove();

  // update existing circles
  circles
    .attr('cy', 0)
    .attr('cx', function(d) { return xScale(d.year); })
    .transition(t)
    .attr('r', function(d) { return radius(d.yield); })
    .attr('fill', function(d) { return color(d.gen); });

  // create new circles
  circles
    .enter().append('circle')
    .attr('cy', 0)
    .attr('cx', function(d) { return xScale(d.year); })
    .transition(t)
    .attr('r', function(d) { return radius(d.yield); })
    .attr('fill', function(d) { return color(d.gen); });

  d3.select('.header > h3').text(site.key);
});




















//
