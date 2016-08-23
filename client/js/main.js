////////////////////////////////
// Developer: Mohtashim Abbas 
// July 8, 2016
///////////////////////////////

var dot = require('graphlib-dot'); // Library for reading a digraph
var dagD3Draw = require('dagre-d3'); // Library for drawing graph on canvas

//mongoDB collection name (same as in server)
Graphs = new Mongo.Collection('mygraphs');

var dbData = ""; // variable to store DB data
var len = 0; // number of DB records 
var arrayGraphs = []; // array to store parsed Eiffel graphs

// subscribe to the change in the mongoDB
const handle = Meteor.subscribe('graphs');

// Keep track every time the data changes in the database
Tracker.autorun(() => {
	
	const isReady = handle.ready(); // check if the data is ready 
	if(isReady){// When the data is ready to be fetched (bool=true)
			arrayGraphs = [];
			dbData = Graphs.find({},{sort: {'time':1}}); // query 
			len = dbData.fetch().length; // number of records 
			
			for(i=0; i<len; i++){
				// Fetch Eiffel graphs, convert to dot format and put it in array to process further 
				arrayGraphs.push(dot.read(dbData.fetch()[i].dot));
			}	
		    mainFunc(); 
		}
});

function mainFunc(){
	
	$(document).ready(function() {

		// At start selected graphs would be equal to total number of graphs, I think 
		selectedGraphs = arrayGraphs;
		
		// Current start and end date of the timeline 
		var timeLineStart = null;
		var timeLineEnd = null;
		
			////////////////////////////////
			// HeatMap
			////////////////////////////////
			
		// Returns the failed testcases according to their requirements 
		var jsonHeatMapInput = aggregatedRequirementsTestcases(arrayGraphs);
			
		// Related requirements: jsonHeatMapInput.xValue
		// Related testcases: jsonHeatMapInput.yValue 
		// Percentage of failures: jsonHeatMapInput.zValue
			
		// Set properties according to the aggregated results
		var options = setHeatMapProperties(jsonHeatMapInput.xValue, jsonHeatMapInput.yValue, jsonHeatMapInput.zValue, arrayGraphs);
			
		// Draw the heatmap
		var chart = new Highcharts.Chart(options);
				
		// On enter key press, search any text in the data to filter out relevent graphs and show them to the user
		$('#searchTextBox').keyup(function (e) {
			if (e.keyCode == 13) { // for checking enter key press

				if (selectedGraphs.length==0){ // Incase selected graph is empty, fetch records according to the selected date range in the timeline
					// Get records within the selected date range
					selectedGraphs = graphDateRange(timeLineStart, timeLineEnd, arrayGraphs);				
				}
				
				// Get records within the selected date range			
				selectedGraphs = searchText($('#searchTextBox').val(), selectedGraphs); // selects relevent graphs 
				$('p').text("Hits: "+ selectedGraphs.length); // show relevent graphs number to user 
				drawGraphs(selectedGraphs); // Draw graphs
			}
		});
			
			////////////////////////////////
			// Time Line 
			////////////////////////////////
		$('#timeline').empty();
		// Get timeLine properties Date range etc to draw the timeline accordingly
		var json = setTimeLineProperties();

		// Create a Timeline accroding to the properties
		var timeline = new vis.Timeline(json.container, json.items, json.options);
			
		// If the range is changed by the user, modify the heatMap accordingly 
		timeline.on("rangechanged", function (properties) {
				
			// Empty the HeatMap chart to draw new chart according to the selected graphs within that date range 
			$('#container').empty();		

			// To make the div empty for stop showing previous graphs to user
			makeEmpty();
			
			// Current start and end date selected in the timeline
			timeLineStart = properties.start.getTime();
			timeLineEnd = properties.end.getTime();
			
			// Get records within the selected date range
			selectedGraphs = graphDateRange(timeLineStart, timeLineEnd, arrayGraphs);
			
			jsonHeatMapInput = aggregatedRequirementsTestcases(selectedGraphs);

			// Related requirements: jsonHeatMapInput.xValue
			// Related testcases: jsonHeatMapInput.yValue 
			// Percentage of failures: jsonHeatMapInput.zValue

			// Set properties according to the aggregated results
			options = setHeatMapProperties(jsonHeatMapInput.xValue, jsonHeatMapInput.yValue, jsonHeatMapInput.zValue, selectedGraphs);
				
			// Draw new heatmap according to the records with selected date range
			chart = new Highcharts.Chart(options); // Draw the heatmap		
		});			
	});		
	
	
}


// Empty data in the container and stuff, call just this one fucntion when needed to empty things for new data or new input 
function makeEmpty(){
	
	// To make the div empty for stop showing previous graphs to user
	$('#graph-container').empty();
	$('#aggGraph-containerHM').empty();// Empty aggregated graph container
	
	$('p').text(''); // empty hits label					
	$('#searchTextBox').val(''); // empty the search textbox value
}

// Data to be pass on to the timeline function to draw the timeline accordingly
function setTimeLineProperties(){
	
	// DOM element where the Timeline will be attached
	var container = document.getElementById('timeline');
	
	var sDate = (new Date(parseInt(arrayGraphs[0].node(arrayGraphs[0].nodes()[2]).time))).toISOString();
	var eDate = (new Date(parseInt(arrayGraphs[arrayGraphs.length-1].node(arrayGraphs[arrayGraphs.length-1].nodes()[2]).time))).toISOString();
	// Create a DataSet (allows two way data-binding)
	var items = new vis.DataSet([
		{start: sDate,
		end: eDate}
		
	]);
	
	// Data to pass on to Timeline function to draw timeline
	var options = {
		selectable: false
	};
	var json = {};   
	json.container = container; 
	json.items = items;       
	json.options = options; 
	
	return json;
}

// Select graphs only within the specified dates 
function graphDateRange(startDate, endDate, arrayGraphs){
	var graphDate = '';
	var selectedGraphs = [];
	
	for(var i = 0; i<arrayGraphs.length; i++){
		graphDate = arrayGraphs[i].node(arrayGraphs[i].nodes()[2]).time; // Gets time of the code change 
		
		if(graphDate >= startDate && graphDate <= endDate){ // Checks if the date lies between the selected date range 
			selectedGraphs.push(arrayGraphs[i]); // Selects the graphs if the code change lies with in the selected date range 
		}
	}
	// Returns the filtered graphs which lies within given date range
	return selectedGraphs	
}

// Search any text in all graphs inorder to filter out relevent graphs 
function searchText(searchText, arrayGraphs){
	var selectedGraph = [];
	var sizeArrayGraphs = arrayGraphs.length;
	for (var i=0; i< sizeArrayGraphs; i++){
		
		if (searchText === arrayGraphs[i].nodes()[0]){ // For component search
			selectedGraph.push(arrayGraphs[i]);			
		}
		else if(searchText === arrayGraphs[i].nodes()[1]){ // For requirement search
			selectedGraph.push(arrayGraphs[i]);
		}		
		else if (searchText === arrayGraphs[i].nodes()[2]){ // For code changes' search
			selectedGraph.push(arrayGraphs[i]);			
		}
		else if (searchText === arrayGraphs[i].nodes()[6]){ // For testcase_A search
			selectedGraph.push(arrayGraphs[i]);			
		}	
		else if (searchText === arrayGraphs[i].nodes()[7]){ // For testcase_B search
			selectedGraph.push(arrayGraphs[i]);			
		}	
		else if (searchText === arrayGraphs[i].nodes()[10]){ // For testcase_C search
			selectedGraph.push(arrayGraphs[i]);			
		}	
		else if (searchText === arrayGraphs[i].nodes()[11]){ // For testcase_D search
			selectedGraph.push(arrayGraphs[i]);			
		}
		else if (searchText === arrayGraphs[i].node(arrayGraphs[i].nodes()[2]).contributor){ // Search by the contributor of the code change 
			selectedGraph.push(arrayGraphs[i]);			
		}
	}
	// Returns the filtered graphs 
	return selectedGraph
}

// Gets the number of code changes for the selected requirement and testcase (clciked through heatMap)
function getCodeChanges(xValue, yValue, arrayReqs, arrayTestcases, arrayGraphs){
	
	var requirement = arrayReqs[xValue]; // Specific given requirement 
	var testcase = arrayTestcases[yValue]; // Specific given testcase
	var sizeArrayGraphs = arrayGraphs.length; // number of total graphs in the database
	var selectedGraphs = [];
	
	for (var i=0; i< sizeArrayGraphs; i++){
		if (requirement === arrayGraphs[i].nodes()[1]){ // Checks if the requirement is the same
		
			if(testcase === arrayGraphs[i].nodes()[6]){ // Checks if the testcase A is the same testcase as we are looking for  
				selectedGraphs.push(arrayGraphs[i]);
			}
			else if(testcase === arrayGraphs[i].nodes()[7]){ // Checks if the testcase B is the same testcase as we are looking for  
				selectedGraphs.push(arrayGraphs[i]);				 
			}	
			else if(testcase === arrayGraphs[i].nodes()[10]){ // Checks if the testcase C is the same testcase as user selected 
				selectedGraphs.push(arrayGraphs[i]);				 
			}	
			else if(testcase === arrayGraphs[i].nodes()[11]){ // Checks if the testcase D is the same testcase as user selected 
				selectedGraphs.push(arrayGraphs[i]);				 
			}				 
		}
	}
	// Returns filtered graphs (number of code changes) for the given requirement and testcase
	return selectedGraphs;
}

// Caluculates the aggregated results for the selected requirement and testcases (selected by clicking heatMap )
function getAggregatedNumbersOnClickHM (xValue, yValue, arrayReqs, arrayTestcases, arrayGraphs){
	
	var requirement = arrayReqs[xValue]; // The 'requirement' clicked by the user through heatmap
	var testcase = arrayTestcases[yValue]; // The 'testcase' clicked/picked by the user through heatmap 
	var sizeArrayGraphs = arrayGraphs.length; // size of the selected graphs 
	
	var tCodeChanges = 0; // Total code changes
	var tPatchVerif = 0; // Total patch verifications 
	var fPatchVerif = 0; // Failed patch verifications 
	var tCodeReviews = 0; // Total code reviews 
	var fCodeReviews = 0; // Fialed code reviews 
	var tBuilds = 0; // Total builds  
	var fBuilds = 0; // Failed builds 
	var tATestcases = 0; // Total number of times, this testcase performed 
	var fATestcases = 0; // Total number of times, this testcase failed
	var tArtifacts = 0; // Total artifacts 

	for (var i=0; i< sizeArrayGraphs; i++){
		if (requirement === arrayGraphs[i].nodes()[1]){ // If the requirement matches, search for the selected testcase 
		
			if(testcase === arrayGraphs[i].nodes()[6]){ // If it is the same testcase (if from A category of testcases)as we are looking for then aggregate results for this graph 
				
				arrayGraphs[i].nodes().forEach(function(id){ 
					node = arrayGraphs[i].node(id);
					
					if (node.type === 'code_change'){ // Count number of of code changes 
						tCodeChanges++;
					}
					
					else if (node.type === 'code_review'){ // Count total number of code reviews and failures 
						if(node.status == 'fail'){
							fCodeReviews++;
						}
						tCodeReviews++;
					}			
	
					else if (node.type === 'patch_verification'){ // Count total number of patch verifications and failures
						if(node.status == 'fail'){
							fPatchVerif++;
						}
						tPatchVerif++;
					}
					
					else if (node.type === 'build'){ // Count total number of builds and failures
						if(node.status == 'fail'){
							fBuilds++;
						}
						tBuilds++;
					}

					else if (node.type === 'test_A'){ // Count total number of times this particular testcase (selected by user) perfomed and failed
						if(node.status == 'fail'){
							fATestcases++;
						}
						tATestcases++;
					}

					else if (node.type === 'artifact'){ // Count total number of artifacts
						tArtifacts++;
					}					
				});					
			}
				
			else if(testcase === arrayGraphs[i].nodes()[7]){ // Else if this is the same testcase (if from B category of tests ) as we are looking for, then aggregate results for this graph 
				
				arrayGraphs[i].nodes().forEach(function(id){
					
					node = arrayGraphs[i].node(id);
					
					if (node.type === 'code_change'){ // Count total number of code changes and failures
						tCodeChanges++;
					}
					else if (node.type === 'code_review'){ // Count total number of code reviews and failures
				
						if(node.status == 'fail'){
							fCodeReviews++;
						}
						tCodeReviews++;
					}			
	
					else if (node.type === 'patch_verification'){ // Count total number of patch verifications and failures
				
						if(node.status == 'fail'){
							fPatchVerif++;
						}
						tPatchVerif++;
					}
					
					else if (node.type === 'build'){ // Count total number of builds and failures
			
						if(node.status == 'fail'){
							fBuilds++;
						}
						tBuilds++;
					}

					else if (node.type === 'test_B'){ // Count total number of times this particular testcase (selected by user) perfomed and failed
			
						if(node.status == 'fail'){
							fATestcases++;
						}
						tATestcases++;
					}

					else if (node.type === 'artifact'){ // Count total number of artifacts
						tArtifacts++;
					}
				});				 
			}	
				
			else if(testcase === arrayGraphs[i].nodes()[10]){ // Else if this is the same testcase (if from C category of tests ) as we are looking for, then aggregate results for this graph

				arrayGraphs[i].nodes().forEach(function(id){
					
					node = arrayGraphs[i].node(id);
					
					if (node.type === 'code_change'){ // Count total number of code changes
						tCodeChanges++;
					}
					else if (node.type === 'code_review'){ // Count total number of code reviews and failures
				
						if(node.status == 'fail'){
							fCodeReviews++;
						}
						tCodeReviews++;
					}			
	
					else if (node.type === 'patch_verification'){ // Count total number of patch verifications and failures
				
						if(node.status == 'fail'){
							fPatchVerif++;
						}
						tPatchVerif++;
					}
					
					else if (node.type === 'build'){ // Count total number of builds and failures
			
						if(node.status == 'fail'){
							fBuilds++;
						}
						tBuilds++;
					}

					else if (node.type === 'test_C'){ // Count total number of times this particular testcase (selected by user) perfomed and failed
			
						if(node.status == 'fail'){
							fATestcases++;
						}
						tATestcases++;
					}

					else if (node.type === 'artifact'){ // Count total number of artifacts
						tArtifacts++;
					}
				});				
			}	
			
			else if(testcase === arrayGraphs[i].nodes()[11]){ // Else if this is the same testcase (if from D category of tests) as we are looking for, then aggregate results for this graph

				arrayGraphs[i].nodes().forEach(function(id){ 
					
					node = arrayGraphs[i].node(id);
					
					if (node.type === 'code_change'){ // Count total number of code changes
						tCodeChanges++;
					}
					else if (node.type === 'code_review'){ // // Count total number of code reviews and failures
				
						if(node.status == 'fail'){
							fCodeReviews++;
						}
						tCodeReviews++;
					}			
	
					else if (node.type === 'patch_verification'){ // Count total number of patch verifications and failures
				
						if(node.status == 'fail'){
							fPatchVerif++;
						}
						tPatchVerif++;
					}
					
					else if (node.type === 'build'){ // Count total number of builds and failures
			
						if(node.status == 'fail'){
							fBuilds++;
						}
						tBuilds++;
					}

					else if (node.type === 'test_D'){ // Count total number of times this particular testcase (selected by user) perfomed and failed
			
						if(node.status == 'fail'){
							fATestcases++;
						}
						tATestcases++;
					}

					else if (node.type === 'artifact'){ // Count total number of artifacts
						tArtifacts++;
					}
				});					
			}				 
		}
	}
	
	var json = {};
	// Prepare this aggregated data to pass on to another function to decorate node and assign labels and color accordingly  
	json.requirement = requirement;
	json.codeChanges = 'Code changes ('+ tCodeChanges +'/'+ tCodeChanges +')';
	json.patchVerif = 'Patch verfications\nfailed: '+ fPatchVerif +'/'+ tPatchVerif;
	json.patchVerifStyle = colorPassFail(fPatchVerif/tPatchVerif);	
	json.codeReviews = 'Code reviews\nfailed: '+ fCodeReviews +'/'+ tCodeReviews;	
	json.codeReviewsStyle = colorPassFail(fCodeReviews/tCodeReviews);
	json.builds = 'Builds\nfailed:'+ fBuilds +'/'+ tBuilds;	
	json.buildsStyle = colorPassFail(fBuilds/tBuilds);	
	json.test_A = testcase+'\nfailed: '+ fATestcases +'/'+ tATestcases;
	json.test_AStyle = colorPassFail(fATestcases/tATestcases);
	json.artifacts = 'Artifacts: ('+ tArtifacts +'/'+ tArtifacts +')';
	json.confidence = 'Confidence level\nvalue: '+(1-(fATestcases/tATestcases).toFixed(2)).toFixed(2); // 1-(faliure ratio) to calculate confidence value	
	json.confidenceStyle = colorPassFail(fATestcases/tATestcases);
	return json;
}

// Assigns color according to the pass fail ratio 
function colorPassFail (avgValue){
	
	var passColor = {r: 95, g: 255, b: 95};
	var failColor = {r: 240, g: 128, b: 128};
	
	return {
		r: Math.round(failColor.r*avgValue + passColor.r*(1-avgValue)),
		g: Math.round(failColor.g*avgValue + passColor.g*(1-avgValue)),
		b: Math.round(failColor.b*avgValue + passColor.b*(1-avgValue))
	};	
}
// Displays/Draws aggregated graph when user clicks on the heatMap to select particular record   
function drawAggregatedViewGraphOnClickHM (json){
	
	// Basic aggregated graph structure
	var mainAggregatedGraph = 'digraph {\n' +
		'    requirement \n' +	
		'    code_change \n' +
		'    code_review \n' +
		'    patch_verification \n' +
		'    build \n' +
		'    test_A \n' +
		'    artifact \n' +
		'    confidence_level \n' +
		'    code_change -> requirement [label=cause];\n' +		
		'    patch_verification -> code_change [label=cause];\n' +
		'    code_review -> code_change [label=cause];\n' +
		'    build -> code_review [label=cause];\n' +
		'    build -> patch_verification [label=cause];\n' +
		'    test_A -> build [label=cause];\n' +
		'    artifact -> build [label=cause];\n' +
		'    confidence_level -> test_A [label=cause];\n' +
		'    confidence_level -> artifact [label=subject];\n' +
		'    }';
		
	// Reads the String format digraph and converts it to proper graph 	
	mainAggregatedGraph = dot.read(mainAggregatedGraph);

	var svg = '';
	var node = '';
	
	// Empty previous graph before drawing new one  
	$('#aggGraph-containerHM').empty();
	
	// Renderer is used to draw and show final graph to user  
	var renderer = new dagD3Draw.render();
	
	// Decorates every node of single aggregated graph 
	mainAggregatedGraph.nodes().forEach(function (id){
		node = mainAggregatedGraph.node(id);
		// node, nodeName (id), and labels related data (json)
		decorateAggNodes(node, id, json);
	});		
		
	// Append graph to the div
	// Height of each graph can also be set from here
	$('#aggGraph-containerHM').append('<h3>Aggregated Result</h3><svg id="graph" width="100%" height="45%"> <g> </svg>');
      
	svg = d3.select('#graph'),
		inner = svg.select("g");

	//renderer.run(gr, inner); if graph is string use graphlib.parse(g) and then it to this function 
	mainAggregatedGraph.graph().rankdir = "RL"; // Horizontal or vertical drawing property of graph
	mainAggregatedGraph.graph().ranksep = 35; // Horizontal size of the diplayed graph
	mainAggregatedGraph.graph().nodesep = 15; // Nodes' inter distances vertical
	
	// Draw the final aggregated graph
	renderer(inner, mainAggregatedGraph);
	
}

// Decorates each node of the aggregated graph and sets labels according to nodes' properties 
// Arguments: node, nodeName (id), node labels related data (json)
function decorateAggNodes (node, id, json){
	
	// Initially the label and style of nodes is empty
	node.label = '';
	node.style = '';

	if (id ==='requirement'){ // If node is of 'requirement' type, set shape, style and label of the node accordingly
		node.shape = 'rect';
		node.style = 'fill: #FFFFFF';
		node.label = json.requirement;
	}	
	else if (id ==='code_change'){ // If node is of 'code_change' type, set shape, style and label of the node accordingly
		node.shape = 'circle';
		node.style = 'fill: #FFFFFF';
		node.label = json.codeChanges;
	}
	else if (id ==='patch_verification'){ // If node is of 'patch_verification' type, set shape, style and label of the node accordingly 
		node.shape = 'rect';
		node.label = json.patchVerif;	
		node.style = 'fill: rgb('+ json.patchVerifStyle.r + ',' + json.patchVerifStyle.g + ',' + json.patchVerifStyle.b + ');';			
	}			
	else if (id ==='code_review'){ // If node is of 'code_review' type, set shape, style and label of the node accordingly
		node.shape = 'rect';
		node.label = json.codeReviews;
		node.style = 'fill: rgb('+ json.codeReviewsStyle.r + ',' + json.codeReviewsStyle.g + ',' + json.codeReviewsStyle.b + ');';			
	}
	else if (id ==='build'){ // If node is of 'build' type, set shape, style and label of the node accordingly
		node.shape = 'rect';
		node.label = json.builds;
		node.style = 'fill: rgb('+ json.buildsStyle.r + ',' + json.buildsStyle.g + ',' + json.buildsStyle.b + ');';			
	}
	else if (id ==='test_A'){ // If node is of 'test_A' type, set shape, style and label of the node accordingly
		node.shape = 'rect';
		node.label = json.test_A;
		node.style = 'fill: rgb('+ json.test_AStyle.r + ',' + json.test_AStyle.g + ',' + json.test_AStyle.b + ');';		
	}	
	else if (id ==='artifact'){ // If node is of 'artifact' type, set shape, style and label of the node accordingly
		node.shape = 'circle';
		node.style = 'fill: #9999FF';
		node.label = json.artifacts;
	}				
	else if (id ==='confidence_level'){ // If node is of 'confidence_level' type, set shape, style and label of the node accordingly
		node.shape = 'circle';
		node.label = json.confidence;
		node.style = 'fill: rgb('+ json.confidenceStyle.r + ',' + json.confidenceStyle.g + ',' + json.confidenceStyle.b + ');';
	}				

	// Returns a decorated node ready to be displayed in the graph
	return node;
}

// Returns the requirements and accordingly failed testcases for displaying it in heatMap chart  
function aggregatedRequirementsTestcases (arrayGraphs){
	var arrayRequirementIDs = []; // List of total number of requirements in the DB
	var arrayUniqueRequirementIDs = []; // Unique requirements' list
	var sizeArrayGraphs = arrayGraphs.length 
	var arrayTestcases = []; // List of the testcases
	var tTestCasesCount = 0; // Count: total number of testcases
	var fTestcasesCount = 0; // Count: total number of failed testcases
	var tFailPercentage = 0; // Failing percentage of testcases
	var xValue = []; // x value is requirements' list to be provided as an input to heatMap
	var yValue = []; // y value is testcases' list to be provided as an input to heatMap
	// z value is the list of the links between requirements and testcases (which testcases are valid for which requirements) to be provided as an input to heatMap
	var zValue = [];
	var jsonHeatMapInput = {}; // To be passed as an input argument heatMap 
	
	for (var i=0; i<sizeArrayGraphs; i++){
		
		if(arrayGraphs[i].nodes().toString().match('Requirement')!=null){ // Checks if the node is of requirement type 
			arrayRequirementIDs[i] = arrayGraphs[i].nodes()[1]; // Store the requirement ID (name) in an array
		}
	}
	
	// Identify unique requirements from the array which carries all the requirements (repeated values because of the code changes, 
	// one requirement can refer to multiple chanegs)
	arrayUniqueRequirementIDs = returnUniqueValues(arrayRequirementIDs);

	for (var i=0; i<arrayUniqueRequirementIDs.length; i++){ // Loop to the number of unique requirement in DB
		
		for (var j=0; j<sizeArrayGraphs; j++){ // Loop to total number of graphs to find out the testcases against those unique requirements
			
			if(arrayUniqueRequirementIDs[i] == arrayGraphs[j].nodes()[1]){ // Checks if the requirement name matches 
				
				// Makes an array of total testcases in all the graphs 
				if(arrayGraphs[j].nodes()[6]!=null){
					arrayTestcases.push(arrayGraphs[j].nodes()[6]);
				}
				if(arrayGraphs[j].nodes()[7]!=null){
					arrayTestcases.push(arrayGraphs[j].nodes()[7]);
				}
				if(arrayGraphs[j].nodes()[10]!=null){
					arrayTestcases.push(arrayGraphs[j].nodes()[10]);
				}
				if(arrayGraphs[j].nodes()[11]!=null){
					arrayTestcases.push(arrayGraphs[j].nodes()[11]);
				}							
			}
		}
	}
	// Sorted unique requirements and testcases	
	xValue = arrayUniqueRequirementIDs.sort(sortAlphaNum); // Array of unique requirements
	yValue = returnUniqueValues(arrayTestcases).sort(sortAlphaNum);	// Array of uniquemtestcases

	// Link between testcases and requirements (which testcases are valid for which requirements)
	for (var i = 0; i< xValue.length; i++){ // Loop to the number unique requirements
		
		for (j = 0; j<yValue.length; j++){ // Loop to the number of unique testcases
			tTestCasesCount = 0; // Total number of testcases performed 
			fTestcasesCount = 0; // Number of failed testcases 
			
			for (k = 0; k<sizeArrayGraphs; k++){ // Loop to the size of total number of graphs to identify the valid testcases against each requirement 
			
				if(xValue[i] == arrayGraphs[k].nodes()[1]){ // If the requirement matches 
					
					if(yValue[j] == arrayGraphs[k].nodes()[6]){ // Checks one by one every testcase A in the DB against every single requirement 
						tTestCasesCount ++;	// If matches calculate number of time testcase performed and number of times failed for a particular requirement
						if(arrayGraphs[k].node(arrayGraphs[k].nodes()[6]).status == 'fail'){
							fTestcasesCount ++;
						}						
					}
					
					if(yValue[j] == arrayGraphs[k].nodes()[7]){ // Checks one by one every testcase B in the DB against every single requirement 
						tTestCasesCount ++; // If matches calculate number of time testcase performed and number of times failed for a particular requirement
						if(arrayGraphs[k].node(arrayGraphs[k].nodes()[7]).status == 'fail'){
							fTestcasesCount ++;
						}						
					}
					
					if(yValue[j] == arrayGraphs[k].nodes()[10]){ // Checks one by one every testcase C in the DB against every single requirement
						tTestCasesCount ++; // If matches calculate number of time testcase performed and number of times failed for a particular requirement
						if(arrayGraphs[k].node(arrayGraphs[k].nodes()[10]).status == 'fail'){
							fTestcasesCount ++;
						}						
					}
					
					if(yValue[j] == arrayGraphs[k].nodes()[11]){ // Checks one by one every testcase D in the DB against every single requirement
						tTestCasesCount ++; // If matches calculate number of time testcase performed and number of times failed for a particular requirement
						if(arrayGraphs[k].node(arrayGraphs[k].nodes()[11]).status == 'fail'){
							fTestcasesCount ++;
						}						
					}					
				}					
			}
			
			// Calculate failed percentage of the testcases against their respective requirements 
			if(tTestCasesCount!=0){
				failPercentage = parseInt((fTestcasesCount/tTestCasesCount)*100);
			}
			else{// If a testcase is not valid for a particular requirement set percentage of failing to empty string for that case   
				failPercentage ='';
			}
		    
			// zValue carries link between testcases and their respective requirements
			zValue.push([i,j,failPercentage]);
		}
	}	
	
	// Input data for heatMap to be pass on to another function draw heatMap chart on this input data
	var jsonHeatMapInput = {};
	
	jsonHeatMapInput.xValue = xValue; // Requirements 
	jsonHeatMapInput.yValue = yValue; // Testcases 
	jsonHeatMapInput.zValue = zValue; // Link between requirements and testcases (which testcases are valid for which testcases requirements)
	
	return jsonHeatMapInput
}

// Setting the properties for heatMap chart
function setHeatMapProperties(x, y , z, arrayGraphs) {
	var selectedGraphs = [];
	
	var chart = { // Chart type     
        renderTo: 'container',	
		type: 'heatmap',
		// inverted: true,
		marginTop: 35,
        marginRight: 65,
        marginLeft: 100,		
		marginBottom: 100	
	};

	var title = { // Title of the chart 
		text: 'HeatMap: Testcases Valid for Requirements (Percentage of failed testcases)',  
		marginTop: 0
	};
	var xAxis = { // x value which are requirements in our case
		categories: x
	};
	var yAxis = { // y value which are testcases in our case
		categories: y,
		title: null,
	};
	var colorAxis = { // Changing the color in heatMap according to the nature of the data is done from here  
		min: 0,
        stops: [
			//["", '#FFFFFF'],
			[0, '#00FF00'],
			//[0.1, '#00FF00'],			
			//[0.3, '#FFFF00'],
            [0.5, '#FFFF00'],
			[0.6, '#43C6DB'],
			[0.7, '##FFA500'],
            [1, '#FF0000']
        ]		
		// minColor: '#FFFFFF',
		// maxColor: Highcharts.getOptions().colors[0]
	};
	var legend = { // Bar which is shown along with the heatMap, shows scale (0-100) and color accordingly  
		//align: 'right',
		layout: 'vertical',
		margin: 300,
		verticalAlign: 'top',
		floating: true,
		x: 375,		
		y: 20,
		reversed: false,
		symbolHeight: 673
	};
	var tooltip = { // Tool tip 
		formatter: function () {
			var toolTip = '';
			
			if (this.point.value ===""){// This means testcase is not valid for a requirement 
				toolTip = 'NA';				
			
			}
			else{ // Shows percentage of failure of a testcase for a requirement as a tool tip
				toolTip = 'Failure of ' + this.series.yAxis.categories[this.point.y] + '<br> for <br>' 
				+ this.series.xAxis.categories[this.point.x] + ' : '+ this.point.value+'%';				
			}
			return toolTip;
		}
	};
	var credits = { // Set this property to false otherwise it shows HighChart logo and link 
      enabled: false
	};
	var series = [{ // Link between testcases and requirements (Percentage failure of testcases per requirement)
		name: 'Percentage failure of testcases per requirement',
		borderWidth: 1,
		data: z,
		dataLabels: {
			enabled: true,
			color: '#000000'
		}
	}]; 
	var plotOptions = { // Click event of heatMap which shows aggregated view and individual instances of events on user click
		series: {
			events: {
				click: function (event) {
					// alert('x: ' + event.point.options.x +'\ny: '+ event.point.options.y);
					
					// To make the div empty for removing previous graphs and add new ones according to user input
					// Empty 'hits' label
					// Empty the search textbox value
					makeEmpty();
					
					// As user clicks on heatmap, this function selects the relevent graphs (Individual instances)
					selectedGraphs = getCodeChanges(event.point.options.x, event.point.options.y, x, y, arrayGraphs);
					
					// As user clicks on heatmap, this function calculates aggregated results (total number and number of failures) from 
					// the selected graphs which are individual code changes
					var json = getAggregatedNumbersOnClickHM (event.point.options.x, event.point.options.y, x, y, selectedGraphs);
					
					// If there is record then display selected code changes to the user as 'individual instances' and 'aggregated view' 
					// in the form of one concrete graph otherwise empty div container 
					if(selectedGraphs.length>0){
						// $("body").animate({"scrollTop": $('#searchTextBox').offset().top}, 1000);
						
						drawAggregatedViewGraphOnClickHM(json); // Draws aggregated grpah
						$("body").animate({scrollTop:700}, '500', 'swing'); // Scroll down from heatMap chart to displyed graphs 
						
						drawGraphs(selectedGraphs); // Draws individual graphs
					}
					else{
						$('#graph-container').empty(); // If no record empty the container
					}
				}
			}
		}
	}
	
	// HeatMap properties to be passed on to the final function to draw heatMap chart according to these properties 
	var json = {};   
	json.chart = chart; 
	json.title = title;       
	json.xAxis = xAxis; 
	json.yAxis = yAxis; 
	json.colorAxis = colorAxis; 
	json.legend = legend; 
	json.tooltip = tooltip;
	json.credits = credits;
	json.series = series;     
	json.plotOptions = plotOptions;
	
	return json;
};

// Draws graph to the user (Individual instances)  
function drawGraphs (myGraph){

	var svg = '';
	var node = ''; // Stores node of graph
	$('#graph-container').empty(); // Empty the conatainer at start
	
	// Renderer is used to draw and show final graph to user  
	var renderer = new dagD3Draw.render();
	
	// Append the title
	this.$('#graph-container').append('<h3>Individual Instances</h3>');
	
	for(var i = 0; i<myGraph.length; i++){

		// Append graph to the div
		// Height of each graph can also be set from here
		this.$('#graph-container').append('<svg id="graph' + i + '" width="100%" height="40%"> <g> </svg>');
      
		svg = d3.select('#graph' + i),
          inner = svg.select("g");
		  
		this.passCount = 0; // Counter to check the passed preceding activites
		this.tCount = 0; // Counter to check total preceding activites for calculating confidence level of an artifact 
	
	    // Decorates every node of of each graph
		myGraph[i].nodes().forEach(function (id){
			node = myGraph[i].node(id);
			// Arguments: node as a whole, nodeName (id) 
			node = decorateNode(node, id); // decorate every node according to its properties  
		});	

		// renderer.run(gr, inner); if graph is string use graphlib.parse(g) and then it to this function 
		myGraph[i].graph().rankdir = "RL"; // Horizontal or vertical drawing property of graph
		myGraph[i].graph().ranksep = 10; // Horizontal size of the diplayed graph
		myGraph[i].graph().nodesep = 15; // Nodes' inter distances vertical
		
		// Draws the final aggregated graph
		renderer(inner, myGraph[i]);
	
	}

	// Optional - resize the SVG element based on the contents
	var svg = document.querySelector('#graph-container');
	//var bbox = svg.getBBox();
	svg.style.width =  100 + "%";
	svg.style.height = 750 + "px";	
	
}

// Decorates each node of the graph and sets labels according to nodes' properties 
function decorateNode (node, id){
	
	// Set the label and style of node empty at start
	node.label = '';
	node.style = '';
	
	var nodeDate = new Date(parseInt(node.time)); // Converts time in milliseconds to date 
	var nodeDate = formatDate(nodeDate); // Format the date 
	var nodeStatus = node.status; // status: pass/fail 	
	
	if (node.type ==='component'){ // If node is of 'component' type, set shape, style and label of the node accordingly
		node.shape = 'rect';
		node.style = 'fill: #66FF66';
		node.label = id+"\n"+nodeDate;
	}
	else if (node.type ==='requirement'){ // If node is of 'requirement' type, set shape, style and label of the node accordingly 
		node.shape = 'rect';
		node.style = 'fill: #66FF66';
		node.label = id+"\n("+ node.contributor +")\n"+ nodeDate;				
	}
	else if (node.type ==='code_change'){ // If node is of 'code_change' type, set shape, style and label of the node accordingly
		node.shape = 'circle';
		node.style = 'fill: #FFFFFF';
		node.label = id +"\n(" + node.contributor +")\n" + nodeDate;
	}
	else if (node.type ==='patch_verification'){ // If node is of 'patch_verification' type, set shape, style and label of the node accordingly
		node.shape = 'rect';
		node.label = id + "\n" + nodeDate;	
				
		if(nodeStatus == 'pass'){
			node.style = 'fill: #66FF66'; // pass color 				
		}
		else{
			node.style = 'fill: #FF9999'; // fail color 				
		}				
	}			
	else if (node.type ==='code_review'){ // If node is of 'code_review' type, set shape, style and label of the node accordingly
		node.shape = 'rect';
		node.label = id + "\n(" + node.contributor +")\n" + nodeDate;
				
		if(nodeStatus == 'pass'){
			node.style = 'fill: #66FF66'; // pass color 
		}
		else{
			node.style = 'fill: #FF9999'; // fail color 					
		}					
	}
	else if (node.type ==='build'){ // If node is of 'build' type, set shape, style and label of the node accordingly
		node.shape = 'rect';
		node.label = id + "\n" + nodeDate;

		if(nodeStatus == 'pass'){
			node.style = 'fill: #66FF66'; // pass color 				
		}
		else{
			node.style = 'fill: #FF9999'; // fail color 	
		}					
	}
	else if (node.type ==='test_A'){ // If node is of 'test_A' type, set shape, style and label of the node accordingly
		node.shape = 'rect';
		node.label = id + "\n" + nodeDate;
				
		if(nodeStatus == 'pass'){
			node.style = 'fill: #66FF66'; // pass color
			this.passCount++; // Number of passed testcases of category A
		}
		else{
			node.style = 'fill: #FF9999'; // fail color					
		}
		this.tCount++; // Total testcases of category A
	}	
	else if (node.type ==='test_B'){ // If node is of 'test_B' type, set shape, style and label of the node accordingly
		node.shape = 'rect';
		node.label = id + "\n" + nodeDate;		

		if(nodeStatus == 'pass'){
			node.style = 'fill: #66FF66'; // pass color	
			this.passCount++; // Number of passed testcases of category B	
		}
		else{
			node.style = 'fill: #FF9999'; // fail color						
		}
		this.tCount++; // Total testcases of category B
	}
	else if (node.type ==='artifact'){ // If node is of 'component' type, set shape, style and label of the node accordingly
		node.shape = 'circle';
		node.style = 'fill: #9999FF';
		node.label = id + "\n" + nodeDate;
	}				
	else if (node.type ==='confidence_level'){ // If node is of 'confidence_level' type, set shape, style and label of the node accordingly
		node.shape = 'circle';

		confidenceValue = (this.passCount/this.tCount).toFixed(2); // Confidence level according to the number of passed testcases and total testcases
		node.label = id +"\nvalue: " + confidenceValue;
		
		// Color of the node according to the confidence value 
		if(confidenceValue === '0.00'){
			node.style = 'fill: #FF9999';
		}
		else if (confidenceValue === '0.50'){
			node.style = 'fill: #CCFF99';
		}
		else{
			node.style = 'fill: #66FF66';	
		}
	}	
	else if (node.type ==='test_C'){ // If node is of 'test_C' type, set shape, style and label of the node accordingly	
		node.shape = 'rect';
		node.label = id + "\n" + nodeDate;

		if(nodeStatus == 'pass'){ // pass color 
			node.style = 'fill: #66FF66';					
		}
		else{
			node.style = 'fill: #FF9999'; // fail color					
		}				
	}	
	else if (node.type ==='test_D'){ // If node is of 'test_D' type, set shape, style and label of the node accordingly
		node.shape = 'rect';
		node.label = id + "\n" + nodeDate;

		if(nodeStatus == 'pass'){
			node.style = 'fill: #66FF66'; // pass color					
		}
		else{
			node.style = 'fill: #FF9999'; // fail color				
		}				
	}				
	else{
		node.shape = 'circle';
		node.style = 'fill: #66FF66';				
	}
	
	// Returns the decorated node to display in the graph 
	return node;
}

// Formats the date to a particular format 
function formatDate (date){
	var day = date.getDate();
	var month = date.getMonth()+1;
	var year = date.getFullYear();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
			
	if(day<10){
		day = "0"+day;
	}
	if(month<10){
		month = "0"+month;
	}
	if(hours<10){
		hours = "0"+hours;
	}
	if(minutes<10){
		minutes = "0"+minutes;
	}	
	if(seconds<10){
		seconds = "0"+seconds;
	}	
	
	return year +"-"+ month +"-"+ day +" "+ hours +":"+ minutes +":"+ seconds;  	
}


// Returns unique values from given array
function returnUniqueValues(array){
	var arrayUniqueIDs = []; 
	
	for(var i = 0; i < array.length; i++) {
		
		if (arrayUniqueIDs.indexOf(array[i]) == -1) {
			if(typeof array[i]!= "undefined"){
				arrayUniqueIDs.push(array[i]);
			}
		}	
	}
	return arrayUniqueIDs;		
}

// Returns sorted alphanumeric values
function sortAlphaNum(a,b) {
	
	var reA = /[^a-zA-Z]/g;
	var reN = /[^0-9]/g;
    var aA = a.replace(reA, "");
    var bA = b.replace(reA, "");
	
    if(aA === bA) {
        var aN = parseInt(a.replace(reN, ""), 10);
        var bN = parseInt(b.replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
}