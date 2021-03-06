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

//define the color scheme
var color = d3.scaleQuantize()
	.domain([0, 1])
	.range(["white", "steelblue"]);

//define the projection 
var projection = d3.geoAlbersUsa();

// load two datasets using d3.queue
d3.queue()
	.defer(d3.csv, 'data/acs_pop_income.csv')
	.defer(d3.json, 'data/us-states-centroids.json')
	.await(main);

function main(error, pop_income, geojson) {
	if (error) throw error;  // if error throw error

	var radius = d3.scaleSqrt()
		.domain([0, d3.max(pop_income, function (m) {
			return m.population;
		})])
		.range([01, 56]);

	var population = d3.map(pop_income, (d) => d.id);

	var nodes = geojson.features.map(function (d) {
		var point = projection(d.geometry.coordinates),
			value = population.get(parseInt(d.id)).toal_pop;   // this does not work! LOL

		return {
			id: d.id,
			name: d.properties.name,
			label: d.properties.label,
			coords: d.geometry.coordinates,
			x: point[0],
			y: point[1],
			x0: point[0],
			y0: point[1],
			r: radius(value),
			value: value,
			check: d.toal_pop,
			pop: value.toal_pop,
		};
	});

	var data = pop_income.map(function (m) {
		return {
			population: m.toal_pop,
			income: m.median_income
		};
	});


	// var extent = d3.extent(nodes, function(m) {
	// 	return d.pop;
	// });

	// radius.domain(extent);
	// color.domain(extent);

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
				return d.name;
			});


		bubbles.enter()
			.append('circle')
			.merge(bubbles)  // the merge, will allow us to create the circle and udpate bubbles at the same time
			.attr('r', 10)   // i can't change the radius
			// .attr('r', function(d) {
			// 	return radius(d.pop);
			// })
			.attr('cx', function (d) {
				return d.x;
			})
			.attr('cy', function (d) {
				return d.y;
			})
			.attr('fill', function (d) {
				return color(d.toal_pop);
			})
			.attr('stroke', '#333')

	}; ///////////////////////////////  end of the main function


};



































































