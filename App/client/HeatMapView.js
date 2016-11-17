import AggregatedView from './AggregatedView';
import Decorator from './Decorator';

var dagD3Draw = require('dagre-d3'); // Library for drawing graph on canvas
var agg = new AggregatedView();

// Fetch the record on heatmap click


class HeatMapView {
    constructor(Graphs) {
        this.graphs = Graphs;
    }

// Setting the properties for heatMap chart
    setHeatMapProperties(listTraceableEventIDs, x, y, z) {
        let chart = { // Chart type
            renderTo: 'container',
            type: 'heatmap',
            // inverted: true,
            marginTop: 35,
            marginRight: 65,
            marginLeft: 100,
            marginBottom: 100
        };

        let title = { // Title of the chart
            text: 'HeatMap: Test Suites Valid for Code Changes',
            marginTop: 0
        };
        let xAxis = { // x value which are requirements in our case
            categories: x
        };
        let yAxis = { // y value which are testcases in our case
            categories: y,
            title: null
        };
        let colorAxis = { // Changing the color in heatMap according to the nature of the data is done from here
            min: 0,
            stops: [
                //["", '#FFFFFF'],
                [0, '#FF0000'],
                [1, '#00FF00']
            ]
            // minColor: '#FFFFFF',
            // maxColor: Highcharts.getOptions().colors[0]
        };
        let legend = { // Bar which is shown along with the heatMap, shows scale (0-100) and color accordingly
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
        let tooltip = { // Tool tip
            formatter: function () {
                let toolTip = '';

                if (this.point.value === "") {// This means testcase is not valid for a code change
                    toolTip = 'NA';

                }
                else { // Shows failed test suite as a tool tip
                    toolTip = 'Failed ' + this.series.yAxis.categories[this.point.y] + '<br> for <br>'
                        + this.series.xAxis.categories[this.point.x];
                }
                return toolTip;
            }
        };
        let credits = { // Set this property to false otherwise it shows HighChart logo and link
            enabled: false
        };
        let series = [{ // Link between testcases and code changes
            name: 'Percentage failure of testcases per requirement',
            borderWidth: 1,
            data: z,
            dataLabels: {
                enabled: true,
                color: '#000000'
            }
        }];
        let self = this;
        let plotOptions = { // Click event of heatMap which shows individual instance of selected record
            series: {
                events: {
                    click: function (event) {
                        let $graphContainer = $('#graph-container');
                        let $aggGraphContainerHM = $('#aggGraph-containerHM');
                        // Empty aggregated graph containers
                        $graphContainer.empty();
                        $aggGraphContainerHM.empty();

                        // As user clicks on heatmap function returns the related record
                        let json = self.clickEventHM(listTraceableEventIDs, event.point.options.x, event.point.options.y, x, y);

                        if (json.length > 0) {

                            agg.drawGraphs(json, '#aggGraph-containerHM', x[event.point.options.x] + '<br>' + y[event.point.options.y]); // Draws grpah

                            $("body").animate({scrollTop: 1000}, '600', 'swing'); // Scroll down from heatMap chart to displyed graphs
                            $aggGraphContainerHM.height('700px');
                        }
                        else {
                            $graphContainer.empty(); // If no record empty the container
                        }
                    }
                }
            }
        };

        // HeatMap properties to be passed on to the final function to draw heatMap chart according to these properties
        let json = {};
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

// Fetch input data for heatmap
    aggregatedCCTS(listTraceableEventIDs) {
        let xValue = [];
        let yValue = [];
        let zValue = [];

        for (let i = 0; i < listTraceableEventIDs.length; i++) {

            for (let j = 0; j < listTraceableEventIDs[i].length; j++) {

                let queryData = this.graphs.find({'meta.id': listTraceableEventIDs[i][j]}).fetch();

                if (queryData[0].meta.type == "EiffelSourceChangeCreatedEvent") {
                    xValue.push("code_change# " + queryData[0].meta.id);
                }
                else if (queryData[0].meta.type == "EiffelTestSuiteFinishedEvent") {
                    yValue.push("test_suite# " + queryData[0].meta.id);

                    if (queryData[0].data.outcome.verdict == "PASSED") {
                        zValue.push([xValue.length - 1, yValue.length - 1, 1]);
                    }
                    else {
                        zValue.push([xValue.length - 1, yValue.length - 1, 0]);
                    }
                }
            }
        }
        // Input data for heatMap to be pass on to another function draw heatMap chart on this input data
        let jsonHeatMapInput = {};

        jsonHeatMapInput.xValue = xValue; // code changes
        jsonHeatMapInput.yValue = yValue; // testcases
        jsonHeatMapInput.zValue = zValue; // linked code changes and testcases

        return jsonHeatMapInput;

    };

    clickEventHM(listTraceableEventIDs, pointX, pointY, x, y, arrayGraphs) {

        let g = [];
        g[0] = new dagD3Draw.graphlib.Graph().setGraph({});

        for (let j = 0; j < listTraceableEventIDs[pointX].length; j++) {

            let queryData1 = this.graphs.find({'meta.id': listTraceableEventIDs[pointX][j]}).fetch();

            let decorate = Decorator.decorateNode(queryData1);
            g[0].setNode(queryData1[0].meta.type, {label: decorate[0], style: decorate[1], shape: decorate[2]});

            if (j != listTraceableEventIDs[pointX].length - 1) {

                let queryData2 = this.graphs.find({'meta.id': listTraceableEventIDs[pointX][j + 1]}).fetch();
                g[0].setEdge(queryData1[0].meta.type, queryData2[0].meta.type, {});

            }
        }

        return g;

    };
}
export default HeatMapView;