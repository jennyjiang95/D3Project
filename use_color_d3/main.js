console.log('hello world from main.js!');

var margin = {
  top: 40,
  right: 50,
  bottom: 70,
  left: 50
};

var days = ['Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];
var times = d3.range(24);

var width = 750 - margin.left - margin.right - 20,
  gridSize = Math.floor(width / times.length),
  height = gridSize * (days.length + 2),
  legendWidth = Math.floor(width * 0.6),
  legendHeight = 10;

var chartTitle = d3.select('body')
  .append('h3')
  .style('color', '#333')
  .text('New York City Vehicle Collision Injuries 2016');

var svg = d3.select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom);

var g = svg.append('g')
  .classed('main-group', true)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

var color = d3.scaleLinear()
  .range(d3.schemeGnBu[3])
  .interpolate(d3.interpolateLab);

var defs = svg.append('defs');

var linearGradient = defs.append('linearGradient')
  .attr('id', 'linear-gradient');

linearGradient
  .attr('x1', '0%')
  .attr('y1', '0%')
  .attr('x2', '100%')
  .attr('y2', '0%');

linearGradient.selectAll('stop')
  .data(color.range())
  .enter().append('stop')
  .attr('offset', function(d, i) { return i / (color.range().length - 1); })
  .attr('stop-color', function(d) { return d; });

var legendContainer = g.append('g')
  .classed('legend', true)
  .attr('transform', `translate(${legendWidth / 4}, ${height})`);

legendContainer.append('rect')
  .attr('width', legendWidth)
  .attr('height', legendHeight)
  .style('fill', 'url(#linear-gradient)');

legendContainer.append('text')
  .classed('legend-title', true)
  .attr('x', legendWidth / 3)
  .attr('y', -5)
  .text('Number of Persons Injured');

var dayLabels = g.selectAll('.dayLabel')
  .data(days)
  .enter().append('text')
  .text(function(d) { return d; })
  .classed('dayLabel', true)
  .attr('x', 0)
  .attr('y', function(d, i) { return i * gridSize; })
  .style('text-anchor', 'end')
  .attr('transform', `translate(-6, ${gridSize / 1.5})`);

var timeLabels = g.selectAll('.timeLabel')
  .data(times)
  .enter().append('text')
  .text(function(d) { return d; })
  .classed('timeLabel', true)
  .attr('x', function(d, i) { return i * gridSize; })
  .attr('y', 0)
  .style('text-anchor', 'middle')
  .attr('transform', `translate(${gridSize / 2}, -6)`);

d3.csv('data/nyc_collisions.csv', function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.day = +d.day;
    d.hour = +d.hour;
    d.total_injured = +d.total_injured;
  });

  console.log(data);

  var maxInjured = d3.max(data, function(d) {
    return d.total_injured;
  });

  color.domain([
    0,
    maxInjured / 2,
    maxInjured
  ]);

  g.selectAll('.hour')
    .data(data)
    .enter().append('rect')
    .attr('x', function(d) { return d.hour * gridSize })
    .attr('y', function(d) { return (d.day - 1) * gridSize })
    .classed('hour bordered', true)
    .attr('width', gridSize)
    .attr('height', gridSize)
    .style('stroke', '#fff')
    .style('stroke-opacity', 0.6)
    .style('fill', function(d) { return color(d.total_injured); });

  var xScale = d3.scaleLinear()
    .range([0, legendWidth])
    .domain([0, maxInjured]);

  var xAxis = d3.axisBottom(xScale)
    .tickValues([0, 100, 200, 300, 400, 500, 600, maxInjured]);

  legendContainer.append('g')
    .classed('no-axis', true)
    .attr('transform', `translate(0, ${legendHeight})`)
    .call(xAxis);

});




///
