console.log('this is solution two!');

// chart margins and dimensions
var margin = {
  top: 10,
  right: 10,
  bottom: 25,
  left: 25
},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// create our svg element and set the dimensions
var svg = d3.select('body').append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right);

// create our main svg group element
var g = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)
  .attr('class', 'group-main');

// Set up our 3 scales
// x and y scales will be linear as fortunately most of our variables from our dataset will work with such a scale
// color scale is ordinal, because we will use one of the categorical variables to be represented by color
var xScale = d3.scaleLinear().range([0, width]),
    yScale = d3.scaleLinear().range([height, 0]),
    color = d3.scaleOrdinal().range(d3.schemeCategory10);

// Set up our x and y axises, passing in our x and y scales
var xAxis = d3.axisBottom(xScale),
    yAxis = d3.axisLeft(yScale);

// load the auto data async using d3-request's d3.csv()
// NOTE: I'm using './' not '/' for specifying the path to data/data.csv
// Using '/' will point to the root directory of your server
// If the 'data' folder isn't in the root directory of your server (it typically wouldn't be IRL),
// then using just a slash won't load it and the network request would fail.
// Using a dot slash means relative to the current working directory
d3.csv('./data/data.csv', function(error, response) {
  // throw the error if one occurs and prevent the rest of the code from running
  if (error) throw error;

  // Use Array.prototype.map to create a new array that contains the parsed data from response.
  // Alternatively we could use Array.prototype.forEach() to iterate over the response
  // keep in mind though that forEach doesn't return anything, so we'd have do data = response;
  // before using forEach.
  var data = response.map(function(d) {
    return {
      mpg: +d.mpg,
      cylinders: +d.cylinders,
      displacement: +d.displacement,
      weight: +d.weight,
      acceleration: +d.acceleration,
      year: +d.year,
      origin: d.origin,
      name: d.name,
    };
  });

  // take a look at our data to make sure it looks okay
  console.log(data);

  // set some variables for our x and y scales
  var x1 = 'weight',
      x2 = 'displacement',
      y1 = 'acceleration',
      y2 = 'mpg';

  // set up a couple selection transitions we can use later for the chart updates
  var t1 = d3.transition().duration(750).delay(3000),
      t2 = d3.transition().duration(750).delay(6000);

  // set our x scale's domain to first x var
  xScale.domain(d3.extent(data, function(d) {
    return d[x1]; // <-- this is a way to access a property of an object using a variable in JS
  }));

  // set our y scale's domain to first y var
  yScale.domain(d3.extent(data, function(d) {
    return d[y1];
  }));

  // set our color scale's domain to the distinct country names in the origin variable of the dataset
  color.domain(
    // Array.prototype.reduce() returns a new array
    // MDN has a thorough explanation of reduce: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
    data.reduce(function(countries, d) {
      if (!countries.includes(d.origin)) {
        countries.push(d.origin);
      }
      return countries;
    }, [])
  );

  ////////// FIRST CHART RENDER //////////
  // create the svg circle elements within the main svg group element
  g.selectAll('circle')
    .data(data) // bind the parsed data
    .enter().append('circle') // call selection.enter() and then append() to create the elements for each data point
    .attr('cx', function(d) { return xScale(d[x1]); }) // set circle x position
    .attr('cy', function(d) { return yScale(d[y1]); }) // set circle y position
    .attr('r', 5) // set circle radius
    .attr('fill', function(d) { return color(d.origin); }); // set circle fill color

  // create a new svg group that will contain the y axis and the label for the y variable
  g.append('g')
    .classed('axis-y', true) // alternative way of setting a class name on an element
    .call(yAxis)
    .append('text') // we can append text because the thing we are appending to is a SVG group element
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('y', 10)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'end')
    .attr('fill', '#333')
    .text(y1); // notice how we can reuse x1 and y1 over and over through out setupChart()

  // create a new svg group that will contain the x axis and the label for the x variable
  g.append('g')
    .classed('axis-x', true)
    .attr('transform', `translate(0, ${height})`) // make sure to translate our x axis group to the bottom of the chart
    .call(xAxis)
    .append('text')
    .attr('class', 'axis-label')
    .attr('x', width)
    .attr('y', -10)
    .attr('text-anchor', 'end')
    .attr('fill', '#333')
    .text(x1);


  ////////// FIRST CHART UPDATE ///////////////
  // update the x scale's domain using the new x variable
  xScale.domain(d3.extent(data, function(d) {
    return d[x2];
  }));

  // update our x axis
  g.select('.axis-x') // select the x axis using its css class name
    .transition(t1) // use the shared transition so that each thing being updated is delayed by 3 seconds
    .call(xAxis);

  // update the x axis label
  // select the label using both the x-axis and axis-label class names.
  // the space between .axis-x and .axis-label is a way of selecting the child element (g.axis-label) of a parent element (g.axis-x)
  g.select('.axis-x .axis-label')
    .transition(t1) // use the shared transition so that each thing being updated is delayed by 3 seconds
    .text(x2);

  // update the x position of the circles
  g.selectAll('circle')
    .transition(t1) // use the shared transition so that each thing being updated is delayed by 3 seconds
    .attr('cx', function(d) { return xScale(d[x2]); });


  ////////// SECOND CHART UPDATE ///////////////
  // update the y scale's domain using the new y variable
  yScale.domain(d3.extent(data, function(d) {
    return d[y2];
  }));

  // update the y axis
  g.select('.axis-y')
    .transition(t2) // use the shared transition so that each thing being updated is delayed by 6 seconds
    .call(yAxis);

  // update the y axis label
  g.select('.axis-y .axis-label')
    .transition(t2) // use the shared transition so that each thing being updated is delayed by 6 seconds
    .text(y2);

  // update the circles y positions
  g.selectAll('circle')
    .transition(t2) // use the shared transition so that each thing being updated is delayed by 6 seconds
    .attr('cy', function(d) { return yScale(d[y2]); });


  //////////// RENDER LEGEND ////////////
  // create a legend for our chart, outside of the chart itself
  // we'll house the legend inside a div element
  var legend = d3.select('body')
    .append('div')
    .classed('legend', true)
    .datum(color.domain()); // bind country names data as a singular bound datum

  // create the legend items with color boxes and labels
  legend.selectAll('.legend-item')
    .data(function(d) { return d; }) // binding the data using values from legend.datum() above
    .enter().append('div') // make a div for each country name
    .classed('legend-item', true)
    .each(function(d) { // we haven't gone over selection.each() yet, think of it like a "for loop"
      console.log(d, this);
      // select the individual div.legend-item
      var item = d3.select(this);

      // add another div for the color box
      item.append('div')
        .classed('color-box', true)
        .style('background-color', function(d) { return color(d); })

      // add the label
      item.append('p')
        .text(d);
    });
}); // end d3.csv()
