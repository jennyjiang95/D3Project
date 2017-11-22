//check if it works
console.log("Hello World by Shangjun (Jenny) Jiang")

//console.log(data);  check if the data can be fed.

//leter and frequency
// browser speak json the best 


var width = 960,
	height = 500,
	margin = {top: 50,
			  right: 20,
			  bottom: 30,
			  left: 40};

//always start with a select, then create something
// this reduce our width and height by margin 
var svg = d3.select('body').append('svg')
	.attr('width', width)
	.attr('height', height);
	//.attr('width', width - margin.left - margin.right)
	//.attr('height', height - margin.top - margin.bottom);

////////////////////VERY IMPORTANT

// reduce our width and height by our margins
//define it.
width = width - margin.left - margin.right
height = height - margin.top - margin.bottom


// bar chart

// two types of scale: Linear AND Band
// range: output, what we are drawing
// padding, how much percentage we want in between
var xScale = d3.scaleBand().rangeRound([0, width]).padding(0.1),
	yScale = d3.scaleLinear().rangeRound([height, 0]);



//////////////////// d3 format //////////////////

//create a formatter function for our labels at the top of the bars
var formatter = d3.format('.1%');


//////create an svg group element and translate its position from the default origin

// create a group of margins
// translate has a x and a y.
// add a string.
// the transformation only affects the things on the SVG and canvas, not the other things
var g = svg.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	// translate (30, 20) botoomtop 20

	// similar to the html div element,
	// so it would be easier to keep similar things together



///////////////// now we are ready to use our data ////////////////

// create a function that do things on the data.

// our function will set up and draw out chart
// it takes an argument 'dataset' (which is an array of objects)
function main (dataset) {
	console.log(dataset);

	//leter to be the x axis domain
	// frequency to be the y axis range
	// we use map a JavaScript built-in

	xScale.domain(dataset.map(function(d){
		//console.log(d);
		return d.letter;
	}));

	// set the domain from min 0 to the max of the dataset
	yScale.domain([
		0,   //0 to the bottom of our domain
		d3.max(dataset, 
			function(d){return d.frequency;})
		])

	 //another svg to create things that contain x axis


	// after set up the domain, then we can create stuff!


	/////////////////// create the x axis ////////////////////

	// if the transform is wrong, then the tick mark would be wrong. be very cautious.

	g.append('g')
	 .attr('class', 'axis axis--x') // for CSS, we can assign things multiple times????  //a class name
	 // use transform property to move things to the bottom.
	 .attr('transform', 'translate(0, ' + height + ')')     //height 500
	 // transform translate so it will start drawing from the bottom up 

	 //a d3 method CALL
	 //this is things that start to get tricky
	 //using call, we can access it. 
	 .call(d3.axisBottom(xScale));


	////////////////////// create the y axis ////////////////////
	g.append('g')
	 .attr('class', 'axis axis --y')  // give our X axis group a class of axis axis--y
	 .call(
	 	d3.axisLeft(yScale).ticks(10, '%') // add a percentage. 
	 	)

	 .append('text') //create a SVG text element
	 	.attr('transform', 'rotate(-90)')
	 	.attr('y', 6)
	 	.attr('dy', '0.71em')  //em a different way of specifying font size  pixel or em or percentage
	 	.attr('text-anchor', 'end')
	 	.text('Frequency');


	 // create a SVG rectangle elements for each letter/data point
	 // make a selection for sth. that has bar. 
	 // d3 will create an empty selection. it will wait and see what happens.
	 g.selectAll('.bar')
	  .data(dataset) //an empty selection   
	  // selection and data binding. CORE OF D3
	  // this enter is the update.
	  // update existing things

	  // there is also an exist. 
	  // exit old things
	  .enter().append('rect')

	  //__data__: frequency : 0.08167 letter : "A"
	  .attr('class', 'bar')
	  .attr('x', function(d){
	  	return xScale(d.letter);
	  })
	  // add y
	  .attr('y', function(d){
	  	return yScale(d.frequency);
	  })
	  // width
	  .attr('width', xScale.bandwidth())
	  .attr('height', function(d){
	  	return height - yScale(d.frequency);
	  })


	//create lables for the top of the each bar
	//selecting 
	// donimo name. p tag. class name. in a selector is by dot.
	// if we want to select everything has bar, then we use #.

	  g.selectAll('.bar-label')
	  //.for things that doesn't exist
	  // # for others
	  	// data binding
	  	.data(dataset)
	  	//enter
	  	.enter().append('text')
	  	.text(function(d){
	  		//format the labels
	  		return formatter(d.frequency);   ///this is where you add the format
	  	})
	  	.attr('class', 'bar-label')
	  	.attr('x', function(d){
	  		return xScale(d.letter);
	  	})
	  	.attr('y', function(d){
	  		return yScale(d.frequency) - 2;  // give them a 2 pixal buffer. 
	  	});


	  	//look a bit weird, so d3 has a format things very convenient
	  	// this will give you a pretty look label
	  	// d3 has a built-in method. which is awesome!

}

// if get errors, maybe look from bottom to top




main(data); 
//check if the data can be called.

//console.log(dataset)
// so dataset is only local to the function.




//////for next class, how to make new things, then update existing things 
////// change and responsive things
///// second dataset is shorter than the first, so what are we doing? if they don't correspond to them.

//// general update patterns.

///// d3 selection very important. very long but very informative.

















