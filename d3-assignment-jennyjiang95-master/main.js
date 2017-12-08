//knowledge points:
// 1. d3-force: charge and collide
// 2. GeoJSON and CSV: d3.queue()
// 3. 

// define margin
var margin = { top: 20, right: 20, bottom: 100, left: 40 },
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom,
	padding = 3;


var svg = d3.select('body').append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', `translate(${margin.left}, ${margin.top})`);

// var area = d3.scaleSqrt()
//  .range([2, 50]);

//define the radius
var radius = d3.scaleSqrt()
	.range([01, 25]);


//define the color scheme
var color = d3.scaleQuantize()
	.range(['#f1eef6', '#bdc9e1', '#74a9cf', '#2b8cbe', '#045a8d']);
	// .range(["white", "steelblue"]);

//define the projection 
var projection = d3.geoAlbersUsa();

// load two datasets using d3.queue
d3.queue()
	.defer(d3.csv, 'data/acs_pop_income.csv')
	.defer(d3.json, 'data/us-states-centroids.json')
	.await(main);

function main(error, pop_income, geojson) {
	if (error) throw error;  // if error throw error



	radius.domain([0, d3.max(pop_income, function (m) {
			return m.toal_pop;
		})]);


	//chekc if the radius work!
	console.log(radius(11000));


	// color.domain([d3.min(pop_income, function(m) {
	// 		return m.toal_pop;}), 
	// 		d3.max(pop_income, function (m) {
	// 		return m.toal_pop;
	// 	})]);

	// this is to make sure the id works. call back below
	var population = d3.map(pop_income, (d) => d.id);

	// read in the data
	var nodes = geojson.features.map(function (d) {
		var point = projection(d.geometry.coordinates),
			value = population.get(parseInt(d.id))
			// value = population.get(parseInt(d.id)).toal_pop;   

		return {
			id: d.id,
			name: d.properties.name,
			label: d.properties.label,
			coords: d.geometry.coordinates,
			x: point[0],
			y: point[1],
			x0: point[0],
			y0: point[1],
			r: radius(value.toal_pop),   //right now just to do it use total population
			value: value, 
			pop: value.toal_pop,
			income: value.median_income
		};
	});

	//check if the data load in correct
	console.log(nodes);


	color.domain(d3.extent(nodes, d => d.r));

	// color.domain(radius);


	// var extent = d3.extent(nodes, function(d) {
	// 	return d.r;
	// });

	// radius.domain(extent);


	// color.domain(extent);


	// 	//define the radius
	// var radius = d3.scaleSqrt()
	// 	.domain([0, d3.max(pop_income, function (m) {
	// 		return m.toal_pop;
	// 	})])
	// 	.range([01, 25]);



	// var color = d3.scaleQuantize()
	// 	.domain([d3.min(pop_income, function(m) {
	// 		return m.toal_pop;}), 
	// 		d3.max(pop_income, function (m) {
	// 		return m.toal_pop;
	// 	})])
	// 	.range(["white", "steelblue"]);




	// color.domain(d3.extent(nodes, d => d.r));





	// simulations

	var simulation = d3.forceSimulation(nodes)
		.force('charge', d3.forceManyBody().strength(1))
		.force(
		'collision',
		d3.forceCollide().strength(1)
			.radius(function (d) {
				return radius(d.pop);
			}))
		.stop();


	for (var i = 0; i < 150; i++) {
		simulation.tick();
	}
	ticked();


	function ticked() {

		var bubbles = d3.select('svg')
			.selectAll('circle')
			.data(nodes, function (d) {
				return d.label;
			});


		bubbles.enter()
			.append('circle')
			.merge(bubbles)  // the merge, will allow us to create the circle and udpate bubbles at the same time
			// .append('text')
			.attr('r', (d) => d.r)   // i can't change the radius
			// .attr('r', function(d) {
			// 	return radius(d.pop);
			// })
			.attr('cx', function (d) {
				return d.x;
			})
			.attr('cy', function (d) {
				return d.y;
			})
			.attr('fill', (d) => color(d.r))
			// .attr('fill', function (d) {
			// 	return color(d.toal_pop);
			// })
			.attr('stroke', '#333')
      		.text(function(d) { return d.label;})
			.on('mouseover', function(d) {
		        tooltip.html(d.name + "<br>" + d.r.toLocaleString());
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

		   bubbles.enter()
			.append('circle')
			.merge(bubbles)  // the merge, will allow us to create the circle and udpate bubbles at the same time
			.append('text')
			.attr('r', (d) => d.r)   // i can't change the radius
			// .attr('r', function(d) {
			// 	return radius(d.pop);
			// })
			.attr('cx', function (d) {
				return d.x;
			})
			.attr('cy', function (d) {
				return d.y;
			})
			.attr('fill', (d) => color(d.r))
			// .attr('fill', function (d) {
			// 	return color(d.toal_pop);
			// })
			.attr('stroke', '#333')
      		.text(function(d) { return d.label;})


	}; 



  // // create a legend for our chart, outside of the chart itself
  // // we'll house the legend inside a div element
  // var legend = d3.select('body')
  //   .append('div')
  //   .classed('legend', true)
  //   .datum(color.domain()); // bind country names data as a singular bound datum

  // // create the legend items with color boxes and labels
  // legend.selectAll('.legend-item')
  //   .data(function(d) { return d; }) // binding the data using values from legend.datum() above
  //   .enter().append('div') // make a div for each country name
  //   .classed('legend-item', true)
  //   .each(function(d) { // we haven't gone over selection.each() yet, think of it like a "for loop"
  //     console.log(d, this);
  //     // select the individual div.legend-item
  //     var item = d3.select(this);

  //     // add another div for the color box
  //     item.append('div')
  //       .classed('color-box', true)
  //       .style('background-color', function(d) { return color(d); })

  //     // add the label
  //     item.append('p')
  //       .text(d);
  //   });



    // draw legend
  var legend = svg.selectAll(".legend")
      .data(color.range())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // draw legend colored rectangles
  legend.append("circle")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d) {return d;});

  // draw legend text
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d;});


}; ///////////////////////////////  end of the main function


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



















	// var data = pop_income.map(function (m) {
	// 	return {
	// 		population: m.toal_pop,
	// 		income: m.median_income
	// 	};
	// });

















































