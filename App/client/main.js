import Graph from "./Graph";
import GraphData from "./GraphData";
import Graphs from '../lib/collections';
import AggregatedView from './AggregatedView';


Router.configure({
    layoutTemplate: 'Layout'
});
Router.route('/', function () {
    console.log("Landing");
    this.render('Landing', {});
    let gd = new GraphData(Graphs['example3']);
    let start_events = gd.getStartEventsFromDB({}, 0, 3);

    Template.Landing.helpers({
        nr_of_events: function() {
            return start_events.count();
        },
        events: function() {
            return start_events;
        }
    });
});

Router.route('/graph', function () {
    console.log("Graph");
    this.render('Graph', {});
    Template.Graph.rendered=function(){ // Run this code when the elements are created
        Graph.mainFunc();
    };

});
Router.route('/graph2', function () {
    console.log("Graph2");
    this.render('Graph', {});
    Template.Graph.rendered=function() { // Run this code when the elements are created

        var selectedGraphs = [];
        var listTracibleEventIDs = [];

        var agg = new AggregatedView(Graphs['example2']);
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

                let timeLineStart = properties.start.getTime();
                let timeLineEnd = properties.end.getTime();
                var tmp;
                tmp = Graphs['example3'].find({"_isDirected":true}).fetch();
                console.log(tmp);
                //agg.drawGraphs(tmp, $gc, 'Individual Instances'); // draw the graphs on canvas

            });
        });
    }

});

Router.route('/(.*)', function () { //404
    console.log("404");
    this.render('404', {});
});
