var dataset = [10, 20, 30, 40, 50];
var dataset2 = [50, 60, 70, 80, 90, 100, 110];
var t = d3.transition().duration(3000).ease(d3.easeLinear);

var svg = d3.select('svg');

var circle = svg.selectAll('circle')
  .data(dataset, function(d) { return d; })
  .enter()
  .append('circle')
  // .transition(t)
  .attr('cx', function(d) { return d * 2; })
  .attr('cy', 50)
  .attr('r', 5)
  .attr('fill', 'red');

var circleNewData = circle.data(dataset2, function(d) { return d; });

var exited = circleNewData.exit();

var removed = circleNewData
  .exit()
  .transition(t)
  .attr('fill', 'rgba(0,0,0,0)')
  .remove();

circleNewData
  .enter()
  .append('circle')
  .transition(t)
  .attr('cx', function(d) { return d * 2; })
  .attr('cy', 50)
  .attr('r', 5)
  .attr('fill', 'red');

var updated = circleNewData
  .transition(t)
  .delay(function(d, i) {
    return (i + 1) * 1000;
  })
  .attr('cx', function(d) { return d * 2; });
