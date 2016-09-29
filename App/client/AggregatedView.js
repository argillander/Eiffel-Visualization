AggregatedView = function(){
}

var dagD3Draw = require('dagre-d3'); // Library for drawing graph on canvas
AggregatedView.prototype.separateAggregatedGraphData = function (listTracibleEventIDs){
	
	var tEiffelSourceChangeCreatedEvent = 0;
	var tEiffelSourceChangeSubmittedEvent = 0;
	var tEiffelArtifactCreatedEvent = 0;
	var tEiffelArtifactPublishedEvent = 0;
	var tEiffelTestSuiteStartedEvent = 0;
	var tEiffelTestSuiteFinishedEvent = 0;
	var fEiffelTestSuiteFinishedEvent = 0;	
	var tEiffelConfidenceLevelModifiedEvent = 0;
	var fEiffelConfidenceLevelModifiedEvent = 0;
	
	var id = "";
	
	for (var i=0; i< listTracibleEventIDs.length; i++){
		
		for(var j=0; j< listTracibleEventIDs[i].length; j++){
			
			queryData = Graphs.find({'meta.id':listTracibleEventIDs[i][j]}).fetch();
			
			id = queryData[0].meta.type;
			
			if (id === "EiffelSourceChangeCreatedEvent"){ // event type count 
				tEiffelSourceChangeCreatedEvent++;
			}
			else if (id === "EiffelSourceChangeSubmittedEvent"){ // event type count
				tEiffelSourceChangeSubmittedEvent++;
			}
			else if (id === "EiffelArtifactCreatedEvent"){ // event type count
				tEiffelArtifactCreatedEvent++;		
			}
			else if (id === "EiffelArtifactPublishedEvent"){ // event type count
				tEiffelArtifactPublishedEvent++;		
			}		
			else if (id === "EiffelTestSuiteStartedEvent"){ // event type count
				tEiffelTestSuiteStartedEvent++;		
			}		
			else if (id === "EiffelTestSuiteFinishedEvent"){ // event type count
				tEiffelTestSuiteFinishedEvent++;
				if (queryData[0].data.outcome.verdict == "PASSED"){
					fEiffelTestSuiteFinishedEvent++;			
				}
				else{			
				}
			}		
			else if (id === "EiffelConfidenceLevelModifiedEvent"){ // event type count
				tEiffelConfidenceLevelModifiedEvent++;
				if (queryData[0].data.name == "stable"){			
					fEiffelConfidenceLevelModifiedEvent++;
				}
				else{			
				}	
			}	
		}	
	}
			
	var json = {};
	// Aggregated results
	json.eiffelSourceChangeCreatedEvent = '  Changes Created ('+ tEiffelSourceChangeCreatedEvent +'/'+ tEiffelSourceChangeCreatedEvent +')     ';
	json.eiffelSourceChangeSubmittedEvent = 'Changes Submitted ('+ tEiffelSourceChangeSubmittedEvent +'/'+ tEiffelSourceChangeSubmittedEvent +')';
	json.eiffelArtifactCreatedEvent = 'Artifacts Created ('+ tEiffelArtifactCreatedEvent +'/'+ tEiffelArtifactCreatedEvent+')';	
	json.eiffelArtifactPublishedEvent = 'Artifacts Published ('+ tEiffelArtifactPublishedEvent +'/'+ tEiffelArtifactPublishedEvent +')';	
	json.eiffelTestSuiteStartedEvent = 'Test Suits Started ('+ tEiffelTestSuiteFinishedEvent +'/'+ tEiffelTestSuiteFinishedEvent +')';	
	json.eiffelTestSuiteFinishedEvent = 'Test Suits Finished \npassed: '+ fEiffelTestSuiteFinishedEvent +'/'+ tEiffelTestSuiteFinishedEvent;
	json.eiffelConfidenceLevelModifiedEvent = 'Confidence Level \npassed: '+ fEiffelConfidenceLevelModifiedEvent +'/'+ tEiffelConfidenceLevelModifiedEvent;	
	json.testSuite_Style = colorPassFail(fEiffelTestSuiteFinishedEvent/tEiffelTestSuiteFinishedEvent);	
	json.confidenceStyle = colorPassFail(fEiffelConfidenceLevelModifiedEvent/tEiffelConfidenceLevelModifiedEvent);	
	
	return json;
};

AggregatedView.prototype.drawGraphs = function(myGraph, container, label){

	var svg = '';
	var node = ''; // Stores node of graph
	var dagD3Draw = require('dagre-d3'); 
	
	$(container).empty(); // Empty the conatainer at start
	
	// Renderer is used to draw and show final graph to user  
	var renderer = new dagD3Draw.render();
	
	// Append the title
	$(container).append('<h3>'+label+'</h3>');
	
	for(var i = 0; i<myGraph.length; i++){

		// Append graph to the div
		// Height of each graph can also be set from here
		$(container).append('<svg id="graph' + i + '" width="100%" height="45%"> <g> </svg>');
      
		svg = d3.select('#graph' + i),
          inner = svg.select("g");

		// renderer.run(gr, inner); if graph is string use graphlib.parse(g) and then it to this function 
		myGraph[i].graph().rankdir = "LR"; // Horizontal or vertical drawing property of graph
		myGraph[i].graph().ranksep = 30; // Horizontal size of the diplayed graph
		myGraph[i].graph().nodesep = 30; // Nodes' inter distances vertical
		
		// Draws the final aggregated graph
		renderer(inner, myGraph[i]);
	
	}

	// Optional - resize the SVG element based on the contents
	var svg = document.querySelector(container);
	//var bbox = svg.getBBox();
	svg.style.width =  100 + "%";
	svg.style.height = 750 + "px";	
	
};

// make graph format for separated aggregated view 
AggregatedView.prototype.makeAggGraph = function (json){
	
	var g = [];
	var states = [ "EiffelSourceChangeCreatedEvent", "EiffelSourceChangeSubmittedEvent", "EiffelArtifactCreatedEvent", "EiffelArtifactPublishedEvent",
               "EiffelTestSuiteStartedEvent", "EiffelTestSuiteFinishedEvent", "EiffelConfidenceLevelModifiedEvent"];

	g[0] = new dagD3Draw.graphlib.Graph().setGraph({});
	
	states.forEach(function(state) { 
		if(state=="EiffelSourceChangeCreatedEvent"){
			g[0].setNode(state, { label: json.eiffelSourceChangeCreatedEvent}); 
		}
		else if(state=="EiffelSourceChangeSubmittedEvent"){
			g[0].setNode(state, { label: json.eiffelSourceChangeSubmittedEvent }); 
		}
		else if(state=="EiffelSourceChangeCreatedEvent"){
			g[0].setNode(state, { label: json.eiffelSourceChangeCreatedEvent, style: 'fill: #66FF66' }); 
		}
		else if(state=="EiffelArtifactCreatedEvent"){
			g[0].setNode(state, { label: json.eiffelArtifactCreatedEvent, style: '' }); 
		}
		else if(state=="EiffelArtifactPublishedEvent"){
			g[0].setNode(state, { label: json.eiffelArtifactPublishedEvent, shape:'circle', style: 'fill: #9B50D2' }); 
		}
		else if(state=="EiffelTestSuiteStartedEvent"){
			g[0].setNode(state, { label: json.eiffelTestSuiteStartedEvent }); 
		}
		else if(state=="EiffelTestSuiteFinishedEvent"){
			g[0].setNode(state, { label: json.eiffelTestSuiteFinishedEvent, style: 'fill: rgb('+ json.testSuite_Style.r + ',' + json.testSuite_Style.g + ',' + json.testSuite_Style.b + ');' }); 
		}		
		else if(state=="EiffelConfidenceLevelModifiedEvent"){
			g[0].setNode(state, { label: json.eiffelConfidenceLevelModifiedEvent, shape:'circle', style: 'fill: rgb('+ json.confidenceStyle.r + ',' + json.confidenceStyle.g + ',' + json.confidenceStyle.b + ');' }); 
		}			
	});				
	for (var i=0; i< states.length-1; i++){
		g[0].setEdge(states[i], states[i+1], {});	
	}
	return g;
}

// Assigns color according to the pass fail ratio 
function colorPassFail (avgValue){
	
	var passColor = {r: 95, g: 255, b: 95};
	var failColor = {r: 240, g: 128, b: 128};
	
	return {
		r: Math.round(passColor.r*avgValue + failColor.r*(1-avgValue)),
		g: Math.round(passColor.g*avgValue + failColor.g*(1-avgValue)),
		b: Math.round(passColor.b*avgValue + failColor.b*(1-avgValue))
	};	
}


