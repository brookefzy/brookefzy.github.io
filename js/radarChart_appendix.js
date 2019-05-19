
const cfg = {
	w: 900,				//Width of the circle
	h: 900,				//Height of the circle
	margin: {top: 2, right: 2, bottom: 2, left: 1}, //The margins of the SVG
	levels: 3,				//How many levels or inner circles should there be drawn
	maxValue: 0, 			//What is the value that the biggest circle will represent
	labelFactor: 1.35, 	//How much farther than the radius of the outer circle should the labels be placed
	wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
	opacityArea: 0.35, 	//The opacity of the area of the blob
	dotRadius: 2, 			//The size of the colored circles of each blog
	opacityCircles: 0.1, 	//The opacity of the circles of each blob
	strokeWidth: 1.5, 		//The width of the stroke around each blob
	roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
 //  color: d3.scaleOrdinal(d3.schemeCategory10),	//Color function,
	format: '.2%',
	unit: '',
	legend: false
 };
const max = Math.max;
const sin = Math.sin;
const cos = Math.cos;
const HALF_PI = Math.PI / 2;

const RadarChart = function RadarChart(parent_selector, data, options) {
 //Wraps SVG text - Taken from http://bl.ocks.org/mbostock/7555321
 const wrap = (text, width) => {
	 text.each(function() {
		 var text = d3.select(this),
			 words = text.text().split(/\s+/).reverse(),
			 word,
			 line = [],
			 lineNumber = 0,
			 lineHeight = 1.4, // ems
			 y = text.attr("y"),
			 x = text.attr("x"),
			 dy = parseFloat(text.attr("dy")),
			 tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em").attr("fill","#fff").attr("font-size","9px");

		 while (word = words.pop()) {
			 line.push(word);
			 tspan.text(line.join(" "));
			 if (tspan.node().getComputedTextLength() > width) {
				 line.pop();
				 tspan.text(line.join(" "));
				 line = [word];
				 tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word).attr("fill","#fff").attr("font-size","9px");
			 }
		 }
	 });
 }//wrap


 //Put all of the options into a variable called cfg
 if('undefined' !== typeof options){
	 for(var i in options){
	 if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	 }//for i
 }//if


 let maxValue = 0;
 for (let j=0; j < data.length; j++) {
	 for (let i = 0; i < data[j].axes.length; i++) {
		 data[j].axes[i]['id'] = data[j].name;
		 if (data[j].axes[i]['value'] > maxValue) {
			 maxValue = data[j].axes[i]['value'];
		 }
	 }
 }
 maxValue = max(cfg.maxValue, maxValue);

 const allAxis = data[0].axes.map((i, j) => i.axis),	//Names of each axis
	 total = allAxis.length,					//The number of different axes
	 radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
	 Format = d3.format(cfg.format),			 	//Formatting
	 angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

 //Scale for the radius
 const rScale = d3.scaleLinear()
	 .range([0, radius])
	 .domain([0, maxValue]);

 /////////////////////////////////////////////////////////
 //////////// Create the container SVG and g /////////////
 /////////////////////////////////////////////////////////
 const parent = d3.select(parent_selector);

 //Remove whatever chart with the same id/class was present before
 parent.select("svg").remove();

 //Initiate the radar chart SVG
 let svg = parent.append("svg")
		 // .attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
		 // .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
		 .attr("preserveAspectRatio", "xMinYMin meet")
		 .attr("viewBox", "0 0 360 360")
		 .classed("svg-content", true);
		 // .attr("class", "radar");

 //Append a g element
 let g = svg.append("g")
		 .attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");

 /////////////////////////////////////////////////////////
 ////////// Glow filter for some extra pizzazz ///////////
 /////////////////////////////////////////////////////////

 //Filter for the outside glow
 let filter = g.append('defs').append('filter').attr('id','glow'),
	 feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
	 feMerge = filter.append('feMerge'),
	 feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
	 feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

 /////////////////////////////////////////////////////////
 /////////////// Draw the Circular grid //////////////////
 /////////////////////////////////////////////////////////

 //Wrapper for the grid & axes
 let axisGrid = g.append("g").attr("class", "axisWrapper");

 //Draw the background circles
 axisGrid.selectAll(".levels")
		.data(d3.range(1,(cfg.levels+1)).reverse())
		.enter()
	 .append("circle")
	 .attr("class", "gridCircle")
	 .attr("r", d => radius / cfg.levels * d)
	 .style("fill", "#CDCDCD")
	 .style("stroke", "#CDCDCD")
	 .style("fill-opacity", cfg.opacityCircles)
	 .style("filter" , "url(#glow)");

 //Text indicating at what % each level is
 axisGrid.selectAll(".axisLabel")
		.data(d3.range(1,(cfg.levels+1)).reverse())
		.enter().append("text")
		.attr("class", "axisLabel")
		.attr("x", 4)
		.attr("y", d => -d * radius / cfg.levels+10)
		.attr("dy", "0.4em")
		.style("font-size", "10px")
		.attr("fill", "#CDCDCD")
		.text(d => Format(maxValue * d / cfg.levels) + cfg.unit);

 /////////////////////////////////////////////////////////
 //////////////////// Draw the axes //////////////////////
 /////////////////////////////////////////////////////////

 //Create the straight lines radiating outward from the center
 var axis = axisGrid.selectAll(".axis")
	 .data(allAxis)
	 .enter()
	 .append("g")
	 .attr("class", "axis");
 //Append the lines
 axis.append("line")
	 .attr("x1", 0)
	 .attr("y1", 0)
	 .attr("x2", (d, i) => rScale(maxValue *1.1) * cos(angleSlice * i - HALF_PI))
	 .attr("y2", (d, i) => rScale(maxValue* 1.1) * sin(angleSlice * i - HALF_PI))
	 .attr("class", "line")
	 .style("stroke", "white")
	 .style("stroke-width", "0.5px");

 //Append the labels at each axis
 axis.append("text")
	 .attr("class", "legend")
	 .style("font-size", "10px")
	 .attr("text-anchor", "middle")
	 .attr("dy", "0.35em")
	 .attr("x", (d,i) => rScale(maxValue * cfg.labelFactor) * cos(angleSlice * i - HALF_PI))
	 .attr("y", (d,i) => rScale(maxValue * cfg.labelFactor) * sin(angleSlice * i - HALF_PI))
	 .text(d => d)
	 .call(wrap, cfg.wrapWidth);

 /////////////////////////////////////////////////////////
 ///////////// Draw the radar chart blobs ////////////////
 /////////////////////////////////////////////////////////

 //The radial line function
 const radarLine = d3.radialLine()
	 .curve(d3.curveLinearClosed)
	 .radius(d => rScale(d.value))
	 .angle((d,i) => i * angleSlice);

 if(cfg.roundStrokes) {
	 radarLine.curve(d3.curveCardinalClosed)
 }

 //Create a wrapper for the blobs
 const blobWrapper = g.selectAll(".radarWrapper")
	 .data(data)
	 .enter().append("g")
	 .attr("class", "radarWrapper");

 //Append the backgrounds
 blobWrapper
	 .append("path")
	 .attr("class", "radarArea")
	 .attr("d", d => radarLine(d.axes))
	 .style("fill", (d,i) => cfg.color(i))
	 .style("fill-opacity", cfg.opacityArea)
	 .on('mouseover', function(d, i) {
		 //Dim all blobs
		 parent.selectAll(".radarArea")
			 .transition().duration(200)
			 .style("fill-opacity", 0.1);
		 //Bring back the hovered over blob
		 d3.select(this)
			 .transition().duration(200)
			 .style("fill-opacity", 0.7);
	 })
	 .on('mouseout', () => {
		 //Bring back all blobs
		 parent.selectAll(".radarArea")
			 .transition().duration(200)
			 .style("fill-opacity", cfg.opacityArea);
	 });

 //Create the outlines
 blobWrapper.append("path")
	 .attr("class", "radarStroke")
	 .attr("d", function(d,i) { return radarLine(d.axes); })
	 .style("stroke-width", cfg.strokeWidth + "px")
	 .style("stroke", (d,i) => cfg.color(i))
	 .style("fill", "none")
	 .style("filter" , "url(#glow)");

 //Append the circles
 blobWrapper.selectAll(".radarCircle")
	 .data(d => d.axes)
	 .enter()
	 .append("circle")
	 .attr("class", "radarCircle")
	 .attr("r", cfg.dotRadius)
	 .attr("cx", (d,i) => rScale(d.value) * cos(angleSlice * i - HALF_PI))
	 .attr("cy", (d,i) => rScale(d.value) * sin(angleSlice * i - HALF_PI))
	 .style("fill", (d) => cfg.color(d.id))
	 .style("fill-opacity", 0.8);

 /////////////////////////////////////////////////////////
 //////// Append invisible circles for tooltip ///////////
 /////////////////////////////////////////////////////////

 //Wrapper for the invisible circles on top
 const blobCircleWrapper = g.selectAll(".radarCircleWrapper")
	 .data(data)
	 .enter().append("g")
	 .attr("class", "radarCircleWrapper");

 //Append a set of invisible circles on top for the mouseover pop-up
 blobCircleWrapper.selectAll(".radarInvisibleCircle")
	 .data(d => d.axes)
	 .enter().append("circle")
	 .attr("class", "radarInvisibleCircle")
	 .attr("r", cfg.dotRadius * 1.5)
	 .attr("cx", (d,i) => rScale(d.value) * cos(angleSlice*i - HALF_PI))
	 .attr("cy", (d,i) => rScale(d.value) * sin(angleSlice*i - HALF_PI))
	 .style("fill", "none")
	 .style("pointer-events", "all")
	 .on("mouseover", function(d,i) {
		 tooltip
			 .attr('x', this.cx.baseVal.value - 10)
			 .attr('y', this.cy.baseVal.value - 10)
			 .transition()
			 .style('display', 'block')
			 .text(Format(d.value) + cfg.unit);
	 })
	 .on("mouseout", function(){
		 tooltip.transition()
			 .style('display', 'none').text('');
	 });

 const tooltip = g.append("text")
	 .attr("class", "tooltip")
	 .attr('x', 0)
	 .attr('y', 0)
	 .style("font-size", "10px")
	 .style('display', 'none')
	 .attr("text-anchor", "middle")
	 .attr("dy", "0.35em")
	 .attr("fill","#fff");
 return svg;
}


var margin = { top: 60, right: 70, bottom: 60, left: 70 },
				 width = 230
				 height = 230


		 var radarChart = {
			 w: width,
			 h: height,
			 margin: margin,
			 maxValue: 40,
			 levels: 2,
			 roundStrokes: false,
			 color: d3.scaleOrdinal().range([ "#fff","#00A0B0" ,"#EDC951"]),
			 format: '.0f',
			 legend: { translateX: 140, translateY: 40 },
			 unit: '%'
		 };
		function formatdata(dataSelected){
		var all = []
		var all0 = {}
		all0.name = "State Average";
		all0.axes=[];
		for (var i = 0; i<dataSelected.length; i++){
		var row0 = {}
				row0.axis = dataSelected[i].industry;
			row0.value = dataSelected[i].distr*100
			all0.axes.push(row0)
		}all.push(all0)
		var all1 = {}
		all1.name = "Native Owned Business";
		all1.axes=[]
		for (var i = 0; i<dataSelected.length; i++){
		var row1 = {}
		row1.axis = dataSelected[i].industry;
			row1.value = dataSelected[i].distriNative*100;
			all1.axes.push(row1)
		}all.push(all1)
		var all2 = {}
		all2.name = "Immigrant Owned Business";
 
		all2.axes=[];
		for (var i = 0; i<dataSelected.length; i++){
		var row2 = {}
		row2.axis = dataSelected[i].industry;
		row2.value = dataSelected[i].distrImmi*100;
		all2.axes.push(row2)
		}all.push(all2)
 
		return all;
		}        
mapboxgl.accessToken = 'pk.eyJ1IjoiYnJvb2tlZnp5IiwiYSI6ImNqdWFtZHNmdTA0N3o0M21oZG9peDU2NXMifQ.fbFnwmA72jGPO8IHcfEeRA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-95.9345, 41.2565],
    zoom: 4,
    minZoom: 3,
    maxZoom: 100,
    });

    var overlay = document.getElementById("statename")
		var hoveredStateId =  null;

    map.on('load', function () {
    map.addSource("states", {
    "type": "geojson",
    "data": "https://raw.githubusercontent.com/TianyuSu/Innovation-Immigration/master/Data%20For%20Maps/USState_Industry.geojson"
    });

    // The feature-state dependent fill-opacity expression will render the hover effect
    // when a feature's hover state is set to true.
    map.addLayer({
    "id": "state-fills",
    "type": "fill",
    "source": "states",
    "layout": {},
    "paint": {
    "fill-color": 'white',
    "fill-opacity": ["case",
    ["boolean", ["feature-state", "hover"], false],
    0.2,
    0
    ]
    }
    });
     		
var mydata = d3.csv("https://raw.githubusercontent.com/TianyuSu/Innovation-Immigration/master/Data_Radar/2017_radar_full.csv")
		 .then(function(mydata){(mydata)
 ///////////////////helper function/////////////////////////////////////////
							nest = d3.nest()
									.key(function(d){
											return d.State;
									})
									.entries(mydata)
									
					var initialChart = function(state){
							var selectState = nest.filter(function(d){
									return d.key ==state;
							})
							console.log(selectState)
					var dataSelected = selectState[0].values
					var data = formatdata(dataSelected);
					let svg_radar = RadarChart("div#container", data, radarChart);
					}
					///Create Initial Chart
					initialChart("Maine");


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

 

     
    // When the user moves their mouse over the metro-fill layer, we'll update the
    // feature state for the feature under the mouse.
    map.on("mousemove", "state-fills", function(e) {
    if (e.features.length > 0) {
    if (hoveredStateId) {
    map.setFeatureState({source: 'states', id: hoveredStateId}, { hover: false});
    }
    hoveredStateId = e.features[0].id;
    map.setFeatureState({source: 'states', id: hoveredStateId}, { hover: true});
    
    var feature = e.features[0];

    overlay.innerHTML = '';
    var title = document.createElement('regular');
    var selectedState = feature.properties.STATE_NAME;
    title.textContent ="New Business' Industrial Distribution in " + selectedState;
    title.setAttribute("class","row");
    overlay.appendChild(title);
		overlay.style.display = 'block';
		console.log(selectedState)
		initialChart(selectedState)



}
    });
     
 
    map.on("mouseleave", "state-fills", function() {
    if (hoveredStateId) {
    map.setFeatureState({source: 'states', id: hoveredStateId}, { hover: false});
    }
    hoveredStateId =  null;
    overlay.style.display = 'block';
    });
		});
		
	})


