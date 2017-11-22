console.log('hello world!');

var svg = d3.select('svg'),
    width = +svg.attr('width'),
    height = +svg.attr('height');

var area = d3.scaleSqrt()
  .range([2, 50]);

var color = d3.scaleLinear()
  .interpolate(d3.interpolateHcl)
  .range(['#007AFF', '#FEB24C']);

d3.queue()
  .defer(d3.csv, 'data/country_names_codes.csv')
  .defer(d3.csv, 'data/gapminder_gdp.csv')
  .await(main);

function main(error, name_map, gdp_data) {
  if (error) throw error;

  var data = gdp_data.map(function(d) {
    return {
      gdp: +d.gdp_per_capita_cppp,
      code: d.geo,
      name: name_map.filter(function(m) {
        return m.geo === d.geo;
      })
      .map(function(k) { return k.name; })[0],
    };
  });

  console.log(data);

  var extent = d3.extent(data, function(d) {
    return d.gdp;
  });

  area.domain(extent);
  color.domain(extent);

  var simulation = d3.forceSimulation(data)
    .force('charge', d3.forceManyBody().strength(-1))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'collision',
      d3.forceCollide()
        .strength(1)
        .radius(function(d) {
          return area(d.gdp);
      }))
    .stop();
    // .on('tick', ticked);

  for (var i = 0; i < 150; i++) {
    simulation.tick();
  }
  ticked();

  function ticked() {
    var bubbles = d3.select('svg')
      .selectAll('circle')
      .data(data, function(d) {
        return d.code;
      });


    bubbles.enter()
      .append('circle')
      .merge(bubbles)
      .attr('r', function(d) {
        return area(d.gdp);
      })
      .attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      })
      .attr('fill', function(d) {
        return color(d.gdp);
      })
      .attr('stroke', '#333')
      .on('mouseover', function(d) {
        tooltip.html(d.name + "<br>" + "$" + d.gdp.toLocaleString());
        tooltip.style('visibility', 'visible');
        d3.select(this).attr('stroke', 'green');
      })
      .on('mousemove', function() {
        tooltip.style('top', (d3.event.pageY - 10) + 'px')
          .style('left', (d3.event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        tooltip.style('visibility', 'hidden');
        d3.select(this).attr('stroke', '#333');
      });
  }
}

var tooltip = d3.select('body')
  .append('div')
  .style('position', 'absolute')
  .style('visibility', 'hidden')
  .style('color', 'white')
  .style('padding', '8px')
  .style('background-color', '#626D71')
  .style('border-radius', '6px')
  .style('text-align', 'center')
  .style('font-family', 'monospace')
  .text('');
















///
