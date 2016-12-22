/**
 * Created by jonathan on 2016-12-22.
 */
import AggregatedView from './AggregatedView';
import HeatMapView from './HeatMapView';
import Decorator from './Decorator';
import MakeGraphs from './MakeGraphs';
import GraphData from './GraphData';
import Graphs from '../lib/collections';

class Graph {



// subscribe to the change in the mongoDB
// const handle = Meteor.subscribe('graphs');
//
// // Keep track every time the data changes in the database
// Tracker.autorun(() => {
//     if (handle.ready()) {// When the data is ready to be fetched
//         let gd = new GraphData(Graphs);
//
//         // Set references between the events.
//         mainFunc(gd);
//     }
// });

    static mainFunc() {
        var selectedGraphs = [];
        var listTracibleEventIDs = [];

        var agg = new AggregatedView(Graphs);
        var hm = new HeatMapView(Graphs);
        var mk = new MakeGraphs(Graphs);
        let gd = new GraphData(Graphs);
        $(document).ready(function () {
            let $btnHide = $('#btnHide');
            let $container = $('#container');

            //TODO: remove this:
            $container.hide();
            $btnHide.html('Show Heatmap');

            // Hide/show the heatmap view
            $btnHide.click(function () {
                // If already hidden then show, if already shown, hide
                if ($container.is(":visible")) {
                    $container.hide();
                    $btnHide.html('Show Heatmap');
                }
                else {
                    $container.show();
                    $btnHide.html('Hide Heatmap');
                }
            });
            //TODO: Fix heat map when the structure is completed
            // listTracibleEventIDs = mk.makeLinkedEvents(arrayGraphs, eventDict); // make related events linked
            // console.log(arrayGraphs);
            // let jsonHeatMapInput = hm.aggregatedCCTS(listTracibleEventIDs); // testcases and code changes for heatmap
            //
            // let options = hm.setHeatMapProperties(listTracibleEventIDs, jsonHeatMapInput.xValue, jsonHeatMapInput.yValue, jsonHeatMapInput.zValue); // set heatmap properties
            // // Draw the heatmap
            // let chart = new Highcharts.Chart(options);

            // Time Line

            $('#timeline').empty();

            // Get time line settings Date range etc to draw the timeline accordingly
            let timeline = new vis.Timeline(
                document.getElementById('timeline'), // DOM element where the Timeline will be attached
                new vis.DataSet([{start: new Date()}]), // Start place
                {
                    selectable: false,
                    showCurrentTime: false,
                    zoomable: true
                }  // Settings
            );

            // If the range is changed by the user, modify the heatMap accordingly
            timeline.on("rangechanged", function (properties) {

                // To make the div empty for stop showing previous graphs to user
                $container.empty();
                let $gc = $('#graph-container');
                let $ag = $('#aggGraph-containerHM');
                $gc.empty();
                $ag.empty();

                // Current start and end date selected in the timeline
                let timeLineStart = properties.start.getTime();
                let timeLineEnd = properties.end.getTime();

                // Get records within the selected date range
                gd.getDateRange(timeLineStart, timeLineEnd);

                // jsonHeatMapInput = hm.aggregatedCCTS(listTracibleEventIDs); // testcases and code changes for heatmap

                agg.drawGraphs(mk.makeGraph(gd), $gc, 'Individual Instances'); // draw the graphs on canvas

                //let jsonSepAggregated = agg.separateAggregatedGraphData(listTracibleEventIDs); // separate aggregated view data
                //agg.drawGraphs(agg.makeAggGraph(jsonSepAggregated), $ag, 'Aggregated Results'); // draw the aggregated graph on canvas

                // Related code changes: jsonHeatMapInput.xValue
                // Related test suite: jsonHeatMapInput.yValue
                // Result: jsonHeatMapInput.zValue

                // Set properties according to the aggregated results
                //let options = hm.setHeatMapProperties(listTracibleEventIDs, jsonHeatMapInput.xValue, jsonHeatMapInput.yValue, jsonHeatMapInput.zValue);

                // Draw new heatmap according to the records with selected date range
                //chart = new Highcharts.Chart(options); // Draw the heatmap

                // Date range selected in the timeline
                $("label[for = lblDate1]").text("Date Range: " + Decorator.formatDate(new Date(timeLineStart)) + "  -  " + Decorator.formatDate(new Date(timeLineEnd)));

                // Draw the heatmap
                //chart = new Highcharts.Chart(options);
            });
        });
    }
}


export default Graph;