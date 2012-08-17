// Client Code

console.log('App Loaded');

/*
* D3 stuff section
*/

//Necessary for the force layout to manipulate crap
var forceLayoutAttr = d3.layout.force()
.distance(300)
		.gravity(-0.01)
		.friction(0.9);
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
 IEObj.key = "IE";

var FirefoxObj = new Object();
 FirefoxObj.values = new Array();
 FirefoxObj.key = "Firefox";

var ChromeObj = new Object();
 ChromeObj.values = new Array();
 ChromeObj.key = "Chrome";

var uTorrentObj = new Object();
 uTorrentObj.values = new Array();
 uTorrentObj.key = "UTorrent";

var transmissionObj = new Object();
 transmissionObj.values = new Array();
 transmissionObj.key = "Transmission";

var eclipseObj = new Object();
 eclipseObj.values = new Array();
 eclipseObj.key = "Eclipse";

// var iTunesObj = new Object();
//  iTunesObj.values = new Array();
//  iTunesObj.key = "iTunes";

// var battlefieldObj = new Object();
//  battlefieldObj.values = new Array();
//  battlefieldObj.key = "Battlefield";

// var WOWObj = new Object();
//  WOWObj.values = new Array();
//  WOWObj.key = "World of Warcraft";

// var SpotifyObj = new Object();
//  SpotifyObj.values = new Array();
//  SpotifyObj.key = "Spotify";

var appArr = new Array(IEObj, FirefoxObj, ChromeObj, uTorrentObj, transmissionObj, eclipseObj);


function screenLoad(){
	//Make fullscreen svg to draw on

	widthScreen = window.innerWidth;
	heightScreen = window.innerHeight * .5;
	svg = d3.select("body").append("svg:svg").attr("width", widthScreen).attr("height",heightScreen)
	.attr("pointer-events", "all");
	chart.width(widthScreen)
	.height(heightScreen * 1.5);
}

function initChart(){
	var inputValues = new Array("IE", "Firefox", "Chrome", "UTorrent", "Transmission", "Eclipse");

	var inputVal = $('#radioButtons').val();
	console.log(inputValues);
	ss.rpc('serverMain.changeToGraph', String(inputVal), inputValues);
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

	for (var i = appArr.length - 1; i >= 0; i--) {
		if (appArr[i].key === name){
			chartArr[1] = appArr[i];
			console.log("Called " + appArr.key);
		}
	};

	console.log("Going with: " + chartArr[1].key);
}

function changeToJSONGraph(appNameArr){
	svgReload();

	chartArr = new Array();
	//They should really make enums for Javascript...
	
	for (var i = appArr.length - 1; i >= 0; i--) {
		if (appArr[i].key === appNameArr[0]){
			chartArr[0] = appArr[i];
			console.log("Was " + appArr[i].key);
		}
	};

	nv.addGraph(function(){
		svg
		.datum(chartArr)
		.transition().duration(500)
		.call(chart);

		nv.utils.windowResize(chart.update);

		return chart;
	});

	document.getElementById("selectList").style.visibility = "visible";
	document.getElementById("headerSelectList").style.visibility = "visible";
}

function initGraph(json){
	console.log("Initiating graph");
	console.log("Json.data.length: " + json.data.length);

	for (var i = 0; i < json.data.length; i++) {
		var tempGraphObjArray = new Array();
		//console.log("Values going in: " + json.data[i].date);
		tempGraphObjArray[0] = new Date(json.data[i].date);
		tempGraphObjArray[1] = json.data[i].emotion;
		//console.log(tempGraphObjArray[0] + tempGraphObjArray[1]);
		//console.log(json.data[json.data.length - 1].appName);
		//They should really make enums for Javascript...

		for (var j = appArr.length - 1; j >= 0; j--) {
			if (appArr[j].key === json.data[i].appName){
				appArr[j].values[appArr[j].values.length] = tempGraphObjArray;
			}
		};
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

	console.log(appArr);

	forceLayoutAttr.on("tick", function(){
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });	});

	forceLayoutAttr.charge(function(d){
			var x = -Math.pow(d.emotion, 2.0)/8;
		console.log(x);
			return x;
		});
	forceLayoutAttr
		.start();
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

		forceLayoutAttr.charge(function(d){
			var x = -Math.pow(d.emotion, 2.0)/8;
		console.log(x);
			return x;
		});
	forceLayoutAttr
		.start();
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
	var inputVal = $('#radioButtons').val();
	return ss.rpc('serverMain.changeToGraph', String(inputVal), appName);
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
		var inputVal = $('#radioButtons').val();
		console.log(inputVal);
		console.log(typeof inputVal);
 	   return ss.rpc('serverMain.updateData', String(inputVal));
	}
};

//Loads after doc ready
$(document).ready(function() {
	screenLoad();

	$('#radioButtons').change(function(){
		console.log("Changed val of radio button!");
		exports.send();	
		initChart();
	});

	$('#selectList').change(function(){
        var x = $('#selectList').val();
        console.log(x);
        updateJSONGraphWithNewValues(x);
        console.log("Called");
      });

	$('#appToggle').click(function(){
		console.log(jsonNodes);
		document.getElementById("selectList").style.visibility = "hidden";
		document.getElementById("headerSelectList").style.visibility = "hidden";
		handleJSONOnceReturned(jsonNodes);
	});

});

initChart();

function s(){

	exports.send();

	setPrefsChart();
}

s();
