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
var jsonNodes = new Object();

var chart;
var chartArr = new Array();

var IEObj = new Object();
 IEObj.values = new Array();
 IEObj.key = "Internet Explorer";

var FirefoxObj = new Object();
 FirefoxObj.values = new Array();
 FirefoxObj.key = "Firefox";

var ChromeObj = new Object();
 ChromeObj.values = new Array();
 ChromeObj.key = "Chrome";

var SafariObj = new Object();
 SafariObj.values = new Array();
 SafariObj.key = "Safari";


function screenLoad(){
	//Make fullscreen svg to draw on

	widthScreen = window.innerWidth;
	heightScreen = window.innerHeight;
	svg = d3.select("body").append("svg:svg").attr("width", widthScreen).attr("height",heightScreen)
	.attr("pointer-events", "all");
}

function initChart(){
	var inputValues = new Array("IE", "Firefox", "Safari", "Chrome");

	var inputVal = $('input[name=Emotion]:checked').val();
	console.log(inputValues);
	ss.rpc('serverMain.changeToGraph', inputVal, inputValues);
}

//Used for svg quick reload
function svgReload(){
	d3.select("svg").remove();
	svg = d3.select("body").append("svg:svg").attr("width", widthScreen).attr("height",heightScreen);
	console.log("Erased the svg!");
}

function updateJSONGraphWithNewValues(name){
	//svgReload();
	console.log("Updating the JSON graph...");
	//chartArr = new Array();
	//They should really make enums for Javascript...
	name = String(name);

	chartArr.splice(1,1);

	console.log("Splice result: " + chartArr);

	if (name === "IE"){
		chartArr[1] = IEObj;
		console.log("Called IE");
	} 
	else if (name === "Safari"){
		chartArr[1] = SafariObj;
		console.log("Called Safari");
	} 
	else if (name === "Chrome"){
		chartArr[1] = ChromeObj;
		console.log("Called CHrome");

	} 
	else if (name === "Firefox"){
		chartArr[1] = FirefoxObj;
		console.log("Called Firefox");
	}
	else{
		console.log("Was none of the above..." + typeof name);
	}
	console.log("Going with: " + chartArr[1].key);
}

function changeToJSONGraph(appNameArr){
	svgReload();

	chartArr = new Array();
	//They should really make enums for Javascript...
	
	if (appNameArr[0] === "IE"){
		chartArr[0] = IEObj;
		console.log("Was IE");
	}
	if (appNameArr[0] === "Safari"){
		chartArr[0] = SafariObj;
	}
	if (appNameArr[0] === "Chrome"){
		chartArr[0] = ChromeObj;
	}
	if (appNameArr[0] === "Firefox"){
		chartArr[0] = FirefoxObj;
	}

	nv.addGraph(function(){
		svg
		.datum(chartArr)
		.transition().duration(500)
		.call(chart);

		nv.utils.windowResize(chart.update);

		return chart;
	});

	document.getElementById("selectList").style.visibility = "visible";
}

function initGraph(json){
	console.log("Initiating graph");
	console.log("Json.data.length: " + json.data.length);
	var IEIndex = 0;
	var FirefoxIndex = 0;
	var ChromeIndex = 0;
	var SafariIndex = 0;

	for (var i = 0; i < json.data.length; i++) {
		var tempGraphObjArray = new Array();
		//console.log("Values going in: " + json.data[i].date);
		tempGraphObjArray[0] = new Date(json.data[i].date);
		tempGraphObjArray[1] = json.data[i].emotion;
		//console.log(tempGraphObjArray[0] + tempGraphObjArray[1]);
		//console.log(json.data[json.data.length - 1].appName);
		//They should really make enums for Javascript...
		if (json.data[i].appName === "IE"){
			IEObj.values[IEIndex] = tempGraphObjArray;
			IEIndex++;
			// console.log("tempGraphObjArray : " + tempGraphObjArray[0] + tempGraphObjArray[1]);
			// console.log("Triggered IE: " + IEObj.values[i - 1]);
		}
		if (json.data[i].appName === "Safari"){
			SafariObj.values[SafariIndex] = tempGraphObjArray;
			SafariIndex++;
		}
		if (json.data[i].appName === "Chrome"){
			ChromeObj.values[ChromeIndex] = tempGraphObjArray;
			ChromeIndex++;
		}
		if (json.data[i].appName === "Firefox"){
			FirefoxObj.values[FirefoxIndex] = tempGraphObjArray;
			FirefoxIndex++;
		}	
	};
	console.log("IEObj val is: " + IEObj.values[0]);
}

function setPrefsChart(){
		chart = nv.models.lineWithFocusChart()
		.x(function(d){
			return d[0]; 
		})
		.y(function(d){ 
			return d[1]; 
		})
		.color(d3.scale.category10().range());

		chart.xAxis.tickFormat(
			function(d){
				return d3.time.format('%x')(new Date(d));
			});

		chart.yAxis.tickFormat(d3.format(',1f'));

		chart.x2Axis.tickFormat(
			function(d){
				return d3.time.format('%x')(new Date(d));
			}
		);

		chart.y2Axis.tickFormat(d3.format(',1f'));

}

function updateJSONGraph(json){

}

function initJSON(json){
	svgReload();
	jsonNodes = json.data;
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
			console.log("Clicked!");
			var x = new Array(d.appName);
			console.log(x);
        	changeToJSONGraph(x);
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
	svgReload();
	forceLayoutAttr = d3.layout.force()
		.nodes(json)
		.size([widthScreen, heightScreen])
		.links([])
		.start();

	var node = svg.selectAll("g.node")
		.data(json)
		.enter().append("g")
		.attr("class", "node")
		.attr("name", function(d){return d.appName;})
		.attr("index", function(d, i){return i;})
		.on("click", function(d){
			console.log("Clicked!");
			var x = new Array(d.appName);
			console.log(x);
        	changeToJSONGraph(x);
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
	//console.log(message);
	if (isFirst === false){
		initJSON(message);
		isFirst = true;
	}
	else{
		initJSON(message);

	}
});

exports.changeToGraph = function(appName){
	console.log(appName);
	var inputVal = $('input[name=Emotion]:checked').val();
	return ss.rpc('serverMain.changeToGraph', inputVal, appName);
}

ss.event.on('initGraph', function(message){
	initGraph(message);
});

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

	$('#selectList').change(function(){
        var x = $('#selectList').val();
        console.log(x);
        updateJSONGraphWithNewValues(x);
        console.log("Called");
      });

	$('#appToggle').click(function(){
		console.log(jsonNodes);
		document.getElementById("selectList").style.visibility = "hidden";
		handleJSONOnceReturned(jsonNodes);
	});

});

initChart();

function s(){

	exports.send();

	setPrefsChart();
}

s();
