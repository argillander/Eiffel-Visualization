var dagD3Draw = require('dagre-d3'); // Library for drawing graph on canvas

//mongoDB collection name (same as in server)
Graphs = new Mongo.Collection('example4');

var selectedGraphs = [];
var listTracibleEventIDs = [];

var agg = new AggregatedView();
var hm = new HeatMapView();
var deco = new Decorator();
var mk = new MakeGraphs();

// subscribe to the change in the mongoDB
const handle = Meteor.subscribe('graphs');

// Keep track every time the data changes in the database
Tracker.autorun(() => {
	var dbData = ""; // variable to store DB data
	var len = 0; // number of DB records 
	
	const isReady = handle.ready(); // check if the data is ready 
	if(isReady){// When the data is ready to be fetched (bool=true)
			arrayGraphs = []; // array to store parsed Eiffel graphs
			dbData = Graphs.find({}); // query 
			len = dbData.fetch().length; // number of records 
			
			for(i=0; i<len; i++){
				// Fetch Eiffel graphs, convert to dot format and put it in array to process further 
				arrayGraphs.push(dbData.fetch()[i]);
			}	
		    mainFunc(arrayGraphs); 
	}
});

function mainFunc(arrayGraphs){

	$(document).ready(function() {

		// Hide/show the heatmap view
		$('#btnHide').click(function(){
			// If already hidden then show, if already shown, hide
			if($('#container').is(":visible")){
				$('#container').hide();
				$("#btnHide").html('Show Heatmap');				
			}
			else{
				$('#container').show();
				$("#btnHide").html('Hide Heatmap');
			}
		});
		
		listTracibleEventIDs = mk.makeLinkedEvents(arrayGraphs); // make related events linked
		var jsonHeatMapInput = hm.aggregatedCCTS(listTracibleEventIDs); // testcases and code changes for heatmap
		var options = hm.setHeatMapProperties(listTracibleEventIDs, jsonHeatMapInput.xValue, jsonHeatMapInput.yValue, jsonHeatMapInput.zValue); // set heatmap properties
		// Draw the heatmap
		var chart = new Highcharts.Chart(options);
		
		// Time Line 
			
		$('#timeline').empty();
		
		// Get timeLine properties Date range etc to draw the timeline accordingly
		var json = setTimeLineProperties();

		// Create a Timeline accroding to the properties
		var timeline = new vis.Timeline(json.container, json.items, json.options);
			
		// If the range is changed by the user, modify the heatMap accordingly 
		timeline.on("rangechanged", function (properties) {
					
			// To make the div empty for stop showing previous graphs to user
			$('#container').empty();		
			$('#graph-container').empty();
			$('#aggGraph-containerHM').empty();
				
			// Current start and end date selected in the timeline
			timeLineStart = properties.start.getTime();
			timeLineEnd = properties.end.getTime();
				
			// Get records within the selected date range
			selectedGraphs = mk.queryReturnDateRange(timeLineStart, timeLineEnd);
				
		 	listTracibleEventIDs = mk.makeLinkedEvents(selectedGraphs); // make related events linked
			jsonHeatMapInput = hm.aggregatedCCTS(listTracibleEventIDs); // testcases and code changes for heatmap
			gList = mk.makeGraph(listTracibleEventIDs); // make graph format
			agg.drawGraphs(gList, '#graph-container', 'Individual Instances'); // draw the graphs on canvas

			jsonSepAggregated = agg.separateAggregatedGraphData (listTracibleEventIDs); // separate aggregated view data 
			gList = agg.makeAggGraph (jsonSepAggregated); // // make graph format for aggregated veiw  
			agg.drawGraphs(gList, '#aggGraph-containerHM', 'Aggregated Results'); // draw the aggregated graph on canvas
			
			// Related code changes: jsonHeatMapInput.xValue
			// Related test suite: jsonHeatMapInput.yValue 
			// Result: jsonHeatMapInput.zValue

			// Set properties according to the aggregated results
			var options = hm.setHeatMapProperties(listTracibleEventIDs, jsonHeatMapInput.xValue, jsonHeatMapInput.yValue, jsonHeatMapInput.zValue);
					
			// Draw new heatmap according to the records with selected date range
			chart = new Highcharts.Chart(options); // Draw the heatmap
				
			// Date range selected in the timeline
			$("label[for = lblDate1]").text("Date Range: "+ deco.formatDate( new Date(timeLineStart)) +"  -  "+ deco.formatDate(new Date(timeLineEnd)));
			
			// Draw the heatmap
			chart = new Highcharts.Chart(options);
		});	
	});	
}

// Data to be pass on to the timeline function to draw the timeline accordingly
function setTimeLineProperties(){
	
	// DOM element where the Timeline will be attached
	var container = document.getElementById('timeline');
	
	// Create a DataSet (allows two way data-binding)
	var items = new vis.DataSet([
		{start: new Date()}
	]);
	
	// Data to pass on to Timeline function to draw timeline
	var options = {
		selectable: false,
		//itemsAlwaysDraggable: false,
		showCurrentTime: false,
		zoomable: true
		//moveable: true,
		//zoomKey: 'z'
	};
	
    interaction: {
    };
	
	var json = {};   
	json.container = container; 
	json.items = items;       
	json.options = options; 
	
	return json;
}