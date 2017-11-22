console.log('Hello World!');

// set up chart area
var margin = { top: 20, right: 30, bottom: 30, left: 120 };
var width = 800 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var maxYield = d3.max(data, function(d) { return d.yield; });

var years = data.reduce(function(acc, cur) {
  if (acc.indexOf(cur.year) === -1) {
    acc.push(cur.year);
  }

  return acc;
}, []);


var genTypes = data.reduce(function(acc, cur) {
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

// set up scales!
var xScale = d3.scalePoint().padding(0.3);
var yScale = d3.scalePoint().padding(0.1);
var radius = d3.scaleSqrt();
var color = d3.scaleOrdinal();

xScale.range([0, width]).domain(years);

yScale.range([0, height]).round(true);

color.range(d3.schemeCategory20).domain(genTypes);

radius.range([0, 15]).domain([0, maxYield]);

// set up some axis functions
var yAxis = d3.axisLeft().scale(yScale);
var xAxis = d3.axisBottom()
  .tickFormat(function(d) { return d; })
  .scale(xScale);

var h3 = d3.select('body').append('h3').text('Hey!');

var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

var g = svg.append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top +  ')');

g.append('g')
  .attr('class', 'y axis')
  .call(yAxis);

g.append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate(0, ' + height + ')')
  .call(xAxis);

// this will create and update our chart
function updateChart(site) {
  console.log(site);
  var t = g.transition().duration(750);

  yScale.domain(
    site.values.map(function (d) {
      return d.key;
    })
    .sort()
  );

  // reset the x axis yscale
  yAxis.scale(yScale);

  // redraw the y axis
  t.select("g.y.axis").call(yAxis);

  // binding the outer most values array to the main svg group element
  g.datum(site.values);

  // select all existing svg groups with the class "site", none exist yet this will be an "empty selection"
  // then bind data and set the key for the data join (similar to relational database joins)
  var gens = g.selectAll('g.site')
    .data(
      function(d) { return d; },
      function(d) { return d.key; } // "key" here represents barely genetic variety
    );

  // General Update Pattern
  // 1. remove group elements that no longer exist in our new data
  gens.exit().remove();

  // 2. update existing groups left over from the previous data
  // Here "gens", without chaining .exit() or .enter(), is what we got from .data() above
  gens
    .transition(t)
    .attr('transform', function(d) {
      return 'translate(0, ' + yScale(d.key) + ')';
    });

  // 3. create new groups if our new data has more elements then our old data
  gens.enter().append('g')
    .attr('class', 'site')
    .transition(t)
    .attr('transform', function(d) {
      return 'translate(0, ' + yScale(d.key) + ')';
    });

  // reselect our svg .site groups to make sure our "gens" variable contains new elements
  // otherwise "gens" won't contain the result from our .enter() the first time we render the chart
  gens = g.selectAll('g.site');

  // Here we get into nested selections
  // For each of our svg .site groups, select all the circles within the group
  // This could return an empty selection if the circles don't yet exist
  // We bind the inner most "values" array from our nested data structure for each gen type to our "circles" selection
  var circles = gens.selectAll('circle')
    .data(
      function(d) { return d.values; }, // represents our actual data
      function(d) { return d.year; } // data join key, this time using the "year" attribute of the data
    );

  // Now we go through the general update pattern again
  // 1. exit & remove circles that no longer need to exist in each svg .site group
  circles.exit()
    .transition(t)
    .attr('r', 0)
    .style('fill', 'rgba(255, 255, 255, 0)')
    .remove();

  // 2. update any existing circles in each svg .site group
  circles
    .attr('cy', 0)
    .attr('cx', function(d) { return xScale(d.year); })
    .transition(t)
    .attr('r', function(d) { return radius(d.yield); })
    .attr('fill', function(d) { return color(d.gen); });

  // 3. create new circles in each svg .site group
  circles
    .enter().append('circle')
    .attr('cy', 0)
    .attr('cx', function(d) { return xScale(d.year); })
    .transition(t)
    .attr('r', function(d) { return radius(d.yield); })
    .attr('fill', function(d) { return color(d.gen); });

  // update the title to show what site we are looking at
  h3.text(site.key);
}

// invoke the first chart render
updateChart(map.get('Morris'));

// This function will cycle endlessly through our data
function cycle() {
  nested.forEach(function(site, i) {

    d3.timeout(function(elapsed) {
      updateChart(map.get(site.key));

      // check it out: our chart is updating about 1x every 3000 milliseconds
      // console.log(elapsed);

      if (elapsed > 3000 * nested.length) {
        // recursively call cycle once we've reached the last chart update
        cycle();
      }
    }, 3000 * (i + 1));
  });
}

// start cycling through all the sites for our data
// make sure to comment out this next line if you need to debug your code!
cycle();

// if you disable cycle(), you can update the chart in the JS console, for example:
// updateChart(map.get('Duluth'))
