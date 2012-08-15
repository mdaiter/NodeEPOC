// Client Code

console.log('App Loaded');

/*
* D3 stuff section
*/

//Necessary for the force layout to manipulate crap
var forceLayoutAttr = d3.layout.force()
.distance(300)
		.charge(-1000)
		.gravity(0.025);
var graphLayoutAttr;
var widthScreen;
var heightScreen;
var svg;
var isFirst = false;
var isGraph = false;
var color = d3.scale.category20();

function screenLoad(){
	//Make fullscreen svg to draw on

	widthScreen = window.innerWidth;
	heightScreen = window.innerHeight;
	svg = d3.select("body").append("svg:svg").attr("width", widthScreen).attr("height",heightScreen)
	.attr("pointer-events", "all");

}

//Used for svg quick reload
function svgReload(){
	d3.select("svg").remove();
	svg = d3.select("body").append("svg:svg").attr("width", widthScreen).attr("height",heightScreen);
}

function changeToJSONGraph(json){
	svgReload();
	alert(json.data.length);

	var prevAppName;

	var dataForGraph = new Array();

	var tempGraphObj = new Object();
	tempGraphObj.values = new Array();
	tempGraphObj.key = new String();

	for (var i = 0; i < json.data.length; i++) {
		
		var indexForGraph = 0;

		var isSame;

		if (i === 0){
			prevAppName = json.data[0].appName;
		}
		else{
			prevAppName = json.data[i - 1].appName;
		}

		if (prevAppName === json.data[i].appName){
			isSame = true;
		}
		else{
			isSame = false;
		}
		var tempGraphObjArray = new Array();
		tempGraphObjArray[0] = new Date(json.data[json.data.length - 1 - i].date);
		//alert(tempGraphObjArray[0]);
		tempGraphObjArray[1] = json.data[json.data.length - 1 - i].emotion;
		//alert(tempGraphObjArray[1]);

		if (isSame === true){
			tempGraphObj.values[tempGraphObj.values.length] = tempGraphObjArray;
			if (i === json.data.length - 1){
				tempGraphObj.key = json.data[i].appName;
				dataForGraph[indexForGraph] = tempGraphObj;
				indexForGraph++;
			}
		}
		else{				
			tempGraphObj.key = json.data[i].appName;
			dataForGraph[indexForGraph] = tempGraphObj;
			// alert("Entered a new object: " + tempGraphObj + " for graph");
		}
		
	};

	nv.addGraph(function(){
		var chart = nv.models.lineWithFocusChart()
		.x(function(d){ 
			
			return d[0]; 
		})
		.y(function(d){ 
			return d[1]; 
		})
		.color(d3.scale.category10().range());

		chart.xAxis.tickFormat(
			function(d){
				//Strange cast...
				var lastDate = dataForGraph[0].values[dataForGraph[0].values.length - 1];
				lastDate = lastDate[0];
				var firstDate = dataForGraph[0].values[0];
				firstDate = firstDate[0];
				var differenceInDays = lastDate.getTime() - firstDate.getTime();
				differenceInDays /= 1000*60*60*24;

				//alert("differenceInDays is: " + differenceInDays);
				if (differenceInDays < 1){
					//alert("less than one day");
					return d3.time.format('%X')(new Date(d));
				}
				else{
					return d3.time.format('%x')(new Date(d));
				}
			});

		chart.yAxis.tickFormat(d3.format(',1f'));

		chart.x2Axis.tickFormat(
			function(d){
				var lastDate = dataForGraph[0].values[dataForGraph[0].values.length - 1];
				lastDate = lastDate[0];
				var firstDate = dataForGraph[0].values[0];
				firstDate = firstDate[0];
				var differenceInDays = lastDate.getTime() - firstDate.getTime();
				differenceInDays /= 1000*60*60*24;
				if (differenceInDays < 1){
					return d3.time.format('%X')(new Date(d));
				}
				else{
					return d3.time.format('%x')(new Date(d));
				}
			}
		);

		chart.y2Axis.tickFormat(d3.format(',1f'));

		svg
		.datum(dataForGraph)
		.transition().duration(500)
		.call(chart);

		nv.utils.windowResize(chart.update);

		return chart;
	});
}

function updateJSONGraph(json){

}

function initJSON(json){
	forceLayoutAttr = d3.layout.force()
		.nodes(json.data)
		.size([widthScreen, heightScreen])
		.links([])
		.start();

	var node = svg.selectAll("g.node")
		.data(json.data)
		.enter().append("g")
		.attr("class", "node")
		.attr("name", function(d){return d.appName;})
		.attr("index", function(d, i){return i;})
		.on("click", function(d){
			alert("Clicked!");
        	exports.changeToGraph(d.appName);
        })
		.call(forceLayoutAttr.drag);

    node.append("svg:circle")
    	.attr("class", "circle")
        .attr("r", function(d){return d.emotion;})
        .attr("name", function(d){return d.appName;})
        .style("stroke", "black")
        .style("stroke-width", 0)
        .style("opacity", 0.7)
        .style("fill", function(){return color(
        	Math.random*50)});

    node.append("text")
      .attr("dx", 1)
      .attr("dy", ".01em")
      .text(function(d) { 
      	var text = d.appName + "\n" + d.emotion;
      	return text; 
      });


	node.append("title").text(
		function(d){
			return d.appName;
		}
	);
	forceLayoutAttr.on("tick", function(){
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });	});

	
}

d3.timer(forceLayoutAttr.resume);

function handleJSONOnceReturned(json){
	forceLayoutAttr = d3.layout.force()
		.nodes(json.data)
		.size([widthScreen, heightScreen])
		.links([]);

	var node = svg.selectAll("g.node")
		.data(json.data)
		.enter().append("g")
		.attr("class", "node")
		.attr("name", function(d){return d.appName;})
		.attr("index", function(d, i){return i;})
		.on("click", function(d){
			alert("Clicked!");
        	exports.changeToGraph(d.appName);
        })
		.call(forceLayoutAttr.drag);

    node.append("svg:circle")
    	.attr("class", "circle")
        .attr("r", function(d){return d.emotion;})
        .attr("name", function(d){return d.appName;})
        .style("stroke", "black")
        .style("stroke-width", 0)
        .style("opacity", 0.7)
        .style("fill", function(){return color(
        	Math.random*50)});

    node.append("text")
      .attr("dx", 1)
      .attr("dy", ".01em")
      .text(function(d) { 
      	var text = d.appName + "\n" + d.emotion;
      	return text; 
      });


	node.append("title").text(
		function(d){
			return d.appName;
		}
	);
	forceLayoutAttr.on("tick", function(){
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });	});

}

// Listen out for newData events coming from the server
ss.event.on('newData', function(message) {
	//Put d3 stuff here
	//Get json
	//alert(message);
	if (isFirst === false){
		initJSON(message);
		isFirst = true;
	}
	else{
		initJSON(message);

	}
});

exports.changeToGraph = function(appName){
	alert(appName);
	var inputVal = $('input[name=Emotion]:checked').val();
	return ss.rpc('serverMain.changeToGraph', inputVal, appName);
}

ss.event.on('changeToGraph', function(message){
	isGraph = true;
	changeToJSONGraph(message);
});

// Demonstrates sharing code between modules by exporting function
exports.send = function() {
	if (!isGraph){
		var inputVal = $('input[name=Emotion]:checked').val();
 	   return ss.rpc('serverMain.updateData', inputVal);
	}
};

//Loads after doc ready
$(document).ready(function() {
	screenLoad();
});

exports.send();

setInterval(function(){exports.send()}, 30000);