console.log('hello world!');

var width = 960,
    height = 600;

var svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

var defs = svg.append('defs');

defs.append('filter')
  .attr('id', 'blur')
  .append('feGaussianBlur')
  .attr('stdDeviation', 5);

var overdoses = d3.map();

var path = d3.geoPath();

var color = d3.scaleOrdinal();

d3.queue()
  .defer(d3.json, 'data/us-10m.topojson')
  .defer(d3.csv, 'data/2015_sorted.csv', function(d) {
    if (d.FIPS.length < 5) d.FIPS = '0' + d.FIPS;
    overdoses.set(d.FIPS, d.Rate);
  })
  .await(main);

function main(error, us) {
  if (error) throw error;

  console.log(topojson.feature(us, us.objects.counties).features);

  var categories = overdoses.values()
    .reduce(function(acc, cur) {
      if (acc.indexOf(cur) === -1) {
        acc.push(cur);
      }
      return acc;
    }, [])
    .sort(function(a, b) {
      var first = +a.split('-')[0];
      var second = +b.split('-')[0];
      return first - second;
    });

    var idx = categories.indexOf('>30');
    categories.push(
      categories.splice(idx, 1)[0]
    );
    var numCategories = categories.length;

    color.domain(categories)
      .range(categories.map(function(d, i) {
        return d3.interpolateYlGnBu(i / (numCategories - 1));
      }));

    svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(875, 225)');

    var legend = d3.legendColor()
      .title('Drug overdose deaths, per 100,000 ppl 2015')
      .titleWidth(75)
      .scale(color);

    svg.select('.legend')
      .call(legend);

    defs.append('path')
      .attr('id', 'nation')
      .attr('d', path(topojson.feature(us, us.objects.nation)));

    svg.append('use')
      .attr('xlink:href', '#nation')
      .attr('fill-opacity', 0.4)
      .attr('filter', 'url(#blur)');

    svg.append('use')
      .attr('xlink:href', '#nation')
      .attr('fill', '#fff');

    svg.append('g')
      .attr('class', 'counties')
      .selectAll('path')
      .data(topojson.feature(us, us.objects.counties).features)
      .enter().append('path')
      .attr('fill', function(d) {
        d.Rate = overdoses.get(d.id);
        return color(d.Rate);
      })
      .attr('d', path)
      .on('mouseover', function(d) {
        var c = d3.select(this)
          .attr('stroke', 'red')
          .attr('stroke-width', 2);

        this.parentNode.appendChild(this);
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 0);
      })
      .append('title')
      .text(function(d) { return d.Rate; });

    svg.append('path')
      .datum(topojson.mesh(us, us.objects.states, function (a, b) {
        return a !== b;
      }))
      .attr('class', 'states')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('d', path);

};















  ////
