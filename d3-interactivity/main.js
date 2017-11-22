console.log('hello world!');

var the_data = null;

var margin = { top: 20, right: 20, bottom: 50, left: 50 };
var width = 600 - margin.left - margin.right;
var height = 320 - margin.top - margin.bottom;

var svg = d3.select('body').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom);

var g = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.right})`);

var xScale = d3.scaleTime().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);

var valueLine = d3.area()
  .x(function(d) { return xScale(d.t); })
  .y0(function(d) { return yScale(d.v); })
  .y1(function(d) { return yScale(-3); })
  .curve(d3.curveBasis);

var baseURL = 'https://tidesandcurrents.noaa.gov/api/datagetter';

var params = {
  begin_date: '20171010',
  end_date: '20171011',
  interval: 'h',
  station: 9414290,
  product: 'predictions',
  datum: 'MSL',
  units: 'english',
  time_zone: 'lst',
  application: 'd3-tidal-chart',
  format: 'json',
};

var queryString = Object.keys(params)
  .reduce(function(str, key, idx, array) {
    str += key + '=' + params[key];

    if (idx !== array.length - 1) {
      str += '&'
    }

    return str;
  }, '');

var queryURL = baseURL + '?' + queryString;

var parseTime = d3.timeParse('%Y-%m-%d %H:%M');
var formatTime = d3.timeFormat('%B %d %I%p');
var bisectDate = d3.bisector(function(d) { return d.t; }).left;

d3.json(queryURL, function(error, res) {
  if (error) throw error;

  console.log(res);

  var data = res.predictions.map(function(d) {
    return {
      v: parseFloat(d.v, 10),
      t: parseTime(d.t),
    };
  });

  console.log(data);

  var minYVal = d3.min(data, function(d) { return d.v; });
  console.log(minYVal);

  valueLine.y1(function(d) { return yScale(minYVal); });

  xScale.domain(d3.extent(data, function(d) { return d.t; }));
  yScale.domain(d3.extent(data, function(d) { return d.v; }));


  g.append('path')
    .datum(data)
    .attr('class', 'line')
    .attr('fill', 'steelblue')
    .attr('stroke', 'none')
    .attr('stroke-width', 2)
    .attr('d', valueLine);

  g.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  g.append('g')
    .call(d3.axisLeft(yScale));

  // grid lines
  g.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0, ${height})`)
    .call(
      d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat('')
    );

  g.append('g')
    .attr('class', 'grid')
    .call(
      d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-width)
        .tickFormat('')
    );

  var tooltip = g.append('g')
    .attr('class', 'tooltip')
    .style('display', 'none');

  tooltip.append('line')
    .attr('class', 'y-hover-line')
    .attr('y1', 0)
    .attr('y2', height)
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '3,3');

  tooltip.append('line')
    .attr('class', 'x-hover-line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '3,3');

  tooltip.append('circle')
    .attr('r', 5)
    .attr('fill', '#fff')
    .attr('stroke', 'orange')
    .attr('stroke-width', 4);

  var textbox = g.append('g')
    .attr('class', 'text-box')
    .attr('transform', 'translate(10, 10)')
    .style('display', 'none');

  textbox.append('text')
    .attr('dy', '0.35em')
    .style('font-size', '12px')
    .append('tspan')
    .text('');

  g.append('rect')
    .attr('class', 'tooltip-overlay')
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', function() {
      tooltip.style('display', 'initial');
      textbox.style('display', 'initial');
    })
    .on('mouseout', function() {
      tooltip.style('display', 'none');
      textbox.style('display', 'none');
    })
    .on('mousemove', _.throttle(mousemove, 50));
    // .on('mousemove', mousemove);

    function mousemove() {
      if (!d3.event) return;

      var mouseX = d3.mouse(this)[0];
      console.log(mouseX);

      var xValue = xScale.invert(mouseX);
      var i = bisectDate(data, xValue, 1);
      var d0 = data[i - 1];
      var d1 = data[i];
      var d = xValue - d0.t > d1.t - xValue ? d1 : d0;

      tooltip.attr('transform', `translate(${xScale(d.t)}, ${yScale(d.v)})`);
      tooltip.select('.y-hover-line')
        .attr('y2', height - yScale(d.v));
      tooltip.select('.x-hover-line')
        .attr('x2', -xScale(d.t));

      d3.select('g.text-box')
        .select('text')
          .text(function() { return formatTime(d.t); })
        .append('tspan')
          .text(function() { return ` ${d.v} ft`; })
          .style('font-weight', 'bold');

    }



}); // end d3.json()

// var body = d3.select('body')
//   .style('height', '1200000000px')
//   .on('mousewheel', _.debounce(handleScroll, 200, { leading: true, trailing: true }));
//
// function handleScroll() {
//   console.log('scrolled! time ellapsed: ' + d3.now());
// }












// console.log('this will finish before d3.json callback!');
