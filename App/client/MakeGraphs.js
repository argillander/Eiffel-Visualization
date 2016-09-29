MakeGraphs = function(){
}

var arrayEvents = [];
var dagD3Draw = require('dagre-d3'); // Library for drawing graph on canvas
var deco = new Decorator(); // To decorate
function getEventInfo(ID){
	for (var i=0; i<arrayGraphs.length; i++){	
		
		if (arrayGraphs[i].meta.id == ID){
			
			if (arrayGraphs[i].links != null){
				
				for (var j = 0; j< arrayGraphs[i].links.length; j++){
					
					arrayEvents.push(arrayGraphs[i].links[j].target);
					getEventInfo(arrayGraphs[i].links[j].target);
					break;
				}
			}	
		}
	}	
};

MakeGraphs.prototype.makeLinkedEvents = function (arrayGraphs){
	
	var listTracibleEventIDs = [];
	
	for (var i=0; i<arrayGraphs.length; i++){

		if (arrayGraphs[i].meta.type == "EiffelSourceChangeCreatedEvent"){
			
			arrayEvents.push(arrayGraphs[i].meta.id);
			getEventInfo(arrayGraphs[i].meta.id);
		}
		if(arrayEvents.length!=0){
			listTracibleEventIDs.push(arrayEvents);
			arrayEvents = [];
		}
	}	
	
	return listTracibleEventIDs;

};

MakeGraphs.prototype.queryReturnDateRange = function (start, end){
	return Graphs.find({'meta.time':{$gte : start , $lte : end}}).fetch();
};

MakeGraphs.prototype.makeGraph = function (listTracibleEventIDs){
	
	var g = [];
	var states = [ "EiffelSourceChangeCreatedEvent", "EiffelSourceChangeSubmittedEvent", "EiffelArtifactCreatedEvent", "EiffelArtifactPublishedEvent",
               "EiffelTestSuiteStartedEvent", "EiffelTestSuiteFinishedEvent", "EiffelConfidenceLevelModifiedEvent"];

	for(var i=0; i< listTracibleEventIDs.length; i++){
		
		g[i] = new dagD3Draw.graphlib.Graph().setGraph({});
		
		for (var j=0; j< listTracibleEventIDs[i].length; j++){
						
			query1 = Graphs.find({'meta.id': listTracibleEventIDs[i][j]}).fetch();
			
			if (j != listTracibleEventIDs[i].length-1){
				
				query2 = Graphs.find({'meta.id': listTracibleEventIDs[i][j+1]}).fetch();
				g[i].setEdge(query1[0].meta.type, query2[0].meta.type, {});	
			}
			decorate = deco.decorateNode(query1);
			g[i].setNode(query1[0].meta.type, {label: decorate[0], style: decorate[1], shape: decorate[2]}); 
		}
	}
	return g;
};