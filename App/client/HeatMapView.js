HeatMapView = function(){
	
}

var dagD3Draw = require('dagre-d3'); // Library for drawing graph on canvas
var deco = new Decorator();
var agg = new AggregatedView();
// Setting the properties for heatMap chart
HeatMapView.prototype.setHeatMapProperties = function (listTracibleEventIDs, x, y , z) {
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
		text: 'HeatMap: Test Suites Valid for Code Changes',  
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
			[0, '#FF0000'],
            [1, '#00FF00']
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
			
			if (this.point.value ===""){// This means testcase is not valid for a code change 
				toolTip = 'NA';				
			
			}
			else{ // Shows failed test suite as a tool tip
				toolTip = 'Failed ' + this.series.yAxis.categories[this.point.y] + '<br> for <br>' 
				+ this.series.xAxis.categories[this.point.x];				
			}
			return toolTip;
		}
	};
	var credits = { // Set this property to false otherwise it shows HighChart logo and link 
      enabled: false
	};
	var series = [{ // Link between testcases and code changes 
		name: 'Percentage failure of testcases per requirement',
		borderWidth: 1,
		data: z,
		dataLabels: {
			enabled: true,
			color: '#000000'
		}
	}]; 
	var plotOptions = { // Click event of heatMap which shows individual instance of selected record
		series: {
			events: {
				click: function (event) {
					
					// Empty aggregated graph containers
					$('#graph-container').empty();
					$('#aggGraph-containerHM').empty();
					
					// As user clicks on heatmap function returns the related record
					var json = clickEventHM (listTracibleEventIDs, event.point.options.x, event.point.options.y, x, y);
					
					if(json.length>0){
						
						agg.drawGraphs(json, '#aggGraph-containerHM', x[event.point.options.x] +'<br>' +y[event.point.options.y]); // Draws grpah
						
						$("body").animate({scrollTop:1000}, '600', 'swing'); // Scroll down from heatMap chart to displyed graphs 
						$('#aggGraph-containerHM').height('700px');
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

// Fetch the record on heatmap click
function clickEventHM (listTracibleEventIDs, pointx, pointy, x, y, arrayGraphs){

	var g = [];	
	g[0] = new dagD3Draw.graphlib.Graph().setGraph({});
		
	for(var j=0; j<listTracibleEventIDs[pointx].length; j++){
		
		queryData1 = Graphs.find({'meta.id': listTracibleEventIDs[pointx][j]}).fetch();	
		
		decorate = deco.decorateNode(queryData1);
		g[0].setNode(queryData1[0].meta.type, {label: decorate[0], style: decorate[1], shape: decorate[2]}); 
			
		if (j != listTracibleEventIDs[pointx].length-1){
				
			queryData2 = Graphs.find({'meta.id': listTracibleEventIDs[pointx][j+1]}).fetch();
			g[0].setEdge(queryData1[0].meta.type, queryData2[0].meta.type, {});	
					
		}			
	}
		
	return g;
	
};

// Fetch input data for heatmap
HeatMapView.prototype.aggregatedCCTS = function  (listTracibleEventIDs){	
	xValue = [];
	yValue = [];
	zValue = [];
	
	for(var i=0; i< listTracibleEventIDs.length; i++){
		
		for (var j=0; j< listTracibleEventIDs[i].length; j++){

			queryData = Graphs.find({'meta.id':listTracibleEventIDs[i][j]}).fetch();
			
			if (queryData[0].meta.type == "EiffelSourceChangeCreatedEvent"){
				xValue.push("code_change# "+queryData[0].meta.id);
			}
			else if (queryData[0].meta.type == "EiffelTestSuiteFinishedEvent"){
				yValue.push("test_suite# "+queryData[0].meta.id);	
				
				if (queryData[0].data.outcome.verdict == "PASSED"){
					zValue.push([xValue.length-1, yValue.length-1, 1]);
				}
				else{
					zValue.push([xValue.length-1, yValue.length-1, 0]);
				}
			}			
		}	
	}
	// Input data for heatMap to be pass on to another function draw heatMap chart on this input data
	var jsonHeatMapInput = {};
	
	jsonHeatMapInput.xValue = xValue; // code changes  
	jsonHeatMapInput.yValue = yValue; // testcases 
	jsonHeatMapInput.zValue = zValue; // linked code changes and testcases 
	
	return jsonHeatMapInput;
	
};