console.log('hello world from canvas!');

var width = 700;
var height = 700;

var ratio = window.devicePixelRatio || 1;

var canvas = d3.select('canvas');
canvas.attr('width', width * ratio)
  .attr('height', height * ratio)
  .style('width', width + 'px')
  .style('height', height + 'px');

var ctx = canvas.node().getContext('2d');
ctx.scale(ratio, ratio);

var area = d3.scaleSqrt()
  .range([2, 50]);

var color = d3.scaleLinear()
  .interpolate(d3.interpolateHcl)
  .range(['#007AFF', '#FEB24C']);

var quadtree = d3.quadtree()
  .x(function(d) { return d.x; })
  .y(function(d) { return d.y; })
  .extent([
    [0, 0],
    [width, height]
  ]);

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
    ctx.clearRect(0, 0, width, height);

    data.forEach(function(d) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, area(d.gdp), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = color(d.gdp);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.code, d.x, d.y);
    });

    tree = quadtree.addAll(data);
  }

  canvas.on('mousemove', function() {
    var mouse = d3.mouse(this),
      closest = tree.find(mouse[0], mouse[1]);

    tooltip
      .style('top', (d3.event.pageY - 10) + 'px')
      .style('left', (d3.event.pageX + 10) + 'px')
      .html(closest.name + '<br>' + '$' + closest.gdp.toLocaleString());
  });

  canvas.on('mouseover', function() {
    tooltip.style('visibility', 'visible');
  });

  canvas.on('mouseout', function() {
    tooltip.style('visibility', 'hidden');
  });
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
