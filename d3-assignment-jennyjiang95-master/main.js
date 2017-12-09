//knowledge points:
// 1. d3-force: charge and collide
// 2. GeoJSON and CSV: d3.queue()
// 3. 

// Define margin
var margin = { top: 20, right: 20, bottom: 100, left: 40 },
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom,
	padding = 3;

// Set properties of the SVG element
var svg = d3.select('body').append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', `translate(${margin.left}, ${margin.top})`);
	
// var area = d3.scaleSqrt()
//  .range([2, 50]);

// Define the radius
var radius = d3.scaleSqrt()
	.range([01, 25]);

// Define the color scheme
var color = d3.scaleQuantize()
	.range(['#f1eef6', '#bdc9e1', '#74a9cf', '#2b8cbe', '#045a8d']);
	// .range(["white", "steelblue"]);
	
// Define the projection 
var projection = d3.geoAlbersUsa();

// Load two datasets using d3.queue
d3.queue()
	.defer(d3.csv, 'data/acs_pop_income.csv')
	.defer(d3.json, 'data/us-states-centroids.json')
	.await(main);

// define tooltips
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


// We will use this boolean flag to keep track of the toggle status
var populationMode = true;

// @function main()
// @param error
// @param {array} pop_income: the population income data
// @param {array} geojson: the US states geoJson data
function main(error, pop_income, geojson) {

	if (error) throw error;  // if error throw error

	// Call the first render of the chart
	setupChart(pop_income, geojson);

	// Add the toggle button
	var button = d3.select('body')
	  .append('button')
	  .text('Update');
  
	// Binding updateChart() to handling 'click' button of the one 
	// we just added
	button.on('click', function() {
	  console.log('thanks for clicking me!');
	  updateChart(pop_income, geojson);
	});

}; ///////////////////////////////  end of the main function

// @function setupChart: contains the logic necessary to create the chart's first render
// @param {array} pop_income: The population income parsed data
// @param {array} geojson: The geojson parsed data
function setupChart(pop_income, geojson) {

	// Define domain of values for radious of bubbles
	// from 0, to the total population
	radius.domain(
		[0, d3.max(pop_income, function (m) {
			return m.toal_pop;
		})]
	);

	// Check if the radius work!
	console.log("Radius check: %O", radius(11000));

	// this is to make sure the id works. call back below
	var population = d3.map(pop_income, (d) => d.id);

	//check if the population reads in correct.
	console.log("Population is %O", population);

	// read in the data combining the geoJson with the income data by ID
	var nodes = geojson.features.map(function (d) {
		// Link geoJson and population income by ID
		var point = projection(d.geometry.coordinates),
			value = population.get(parseInt(d.id)); 

		// Return the object defining each map element
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

	// Check if the data load in correct
	console.log("Nodes is %O", nodes);

	// Set colour to radius (population)
	color.domain(d3.extent(nodes, d => d.r));

	// Define all force simulation objects
	var simulation = d3.forceSimulation(nodes)
		.force('charge', d3.forceManyBody().strength(1))  // strength is 1
		.force(
			'collision',
			d3.forceCollide().strength(1)  // strength is 1
				.radius(function (d) {
					return radius(d.pop);
				}))
		.stop();


	// Tick each simulation object
	for (var i = 0; i < 200; i++) {
		simulation.tick();
	}

	// Call ticked with nodes
	ticked(nodes);

	// draw legend
	var legend = svg.selectAll(".legend")
	.data(color.range())
	.enter()
	.append("g")
	.attr("class", "legend")
	.attr("transform", function(d, i) { return "translate(-850," + i * 30 + ")"; });

	// draw legend colored rectangles
	legend.append("rect")
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
}

// @function updateChart Contains the logic for updating the chart simulation
// @param {array} pop_income: The population income parsed data
// @param {array} geojson: The geoJson parsed data
function updateChart(pop_income, geojson) {
	//call this to make sure we are updating chart
	console.log("Updating chart");

	// toggle mode
	populationMode = !populationMode;

	if (populationMode) {
		radiusValue = 'toal_pop';
	} else {
		radiusValue = 'median_income';
	}

	// from 0, to the total population
	radius.domain(
		[0, d3.max(pop_income, function (m) {
			return m[radiusValue];
		})]
	);

	var population = d3.map(pop_income, (d) => d.id);

	// read in the data combining the geoJson with the income data by ID
	var nodes = geojson.features.map(function (d) {
		// Link geoJson and population income by ID
		var point = projection(d.geometry.coordinates),
			value = population.get(parseInt(d.id)); 

		// Return the object defining each map element
		return {
			id: d.id,
			name: d.properties.name,
			label: d.properties.label,
			coords: d.geometry.coordinates,
			x: point[0],
			y: point[1],
			x0: point[0],
			y0: point[1],
			r: radius(value[radiusValue]),   // this value will depend on the toggle status
			value: value, 
			pop: value.toal_pop,
			income: value.median_income
		};
	});

	// Define all force simulation objects
	var simulation = d3.forceSimulation(nodes)
	.force('charge', d3.forceManyBody().strength(1))
	.force(
		'collision',
		d3.forceCollide().strength(1)
			.radius(function (d) {
				return radius(d.income);
			}))
	.stop();

	console.log("Simulation is %O", simulation);

	// Tick each simulation object
	for (var i = 0; i < 200; i++) {
		console.log("Ticking simulation");
		simulation.tick();
	}

		// Call ticked with nodes
		ticked(nodes);
}


// @function ticker: This function renders the bubble chart and is re-used by setupChart and updateChart
// @param {array} nodes: The already linked data
function ticked(nodes) {
	
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
			.attr('r', (d) => d.r)   
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


}

