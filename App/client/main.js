import Graphs from '../lib/collections';
import MakeGraphs from "./MakeGraphs"
import formatDate from '../lib/date_formatter'

const handle = Meteor.subscribe('data');
Tracker.autorun(() => {
    if (handle.ready()) {// When the data is ready to be fetched
        console.log("updated");
    }
});

Router.configure({
    layoutTemplate: 'Layout'
});
Router.route('/', function () {
    console.log("Landing");
    this.render('Landing', {});

    Template.Landing.helpers({
        nr_of_events: function() {
            return 2;
        },
        events: function() {
            return Graphs['data'].find({});
        }
    });
});

Router.route('/test', function () {
    console.log("Test");

    this.render('NewGraph', {});
    Template.NewGraph.rendered=function() { };

});

Router.route('/graph', function () {
    console.log("Graph");

    this.render('Graph', {});
    Template.Graph.rendered=function() { // Run this code when the elements are created

        $(document).ready(function () {
            let $btnHide = $('#btnHide');
            let $container = $('#container');

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
            let nr_of_results = $("#nr_of_results");
            let total_nr_of_results = $("#total_nr_of_results");
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
                Meteor.call('collect_data', timeLineStart, timeLineEnd, function(err,response) {
                    if(err) {
                        console.log('serverDataResponse', "Error:" + err.reason);
                        return;
                    }
                    total_nr_of_results.text(response);
                });
                $("label[for = lblDate1]").text("Date Range: " + formatDate(new Date(timeLineStart)) + "  -  " + formatDate(new Date(timeLineEnd)));
                var tmp = Graphs['data'].find({}).fetch();

                nr_of_results.text(tmp.length);
                var graph = MakeGraphs.makeGraph(tmp);
                MakeGraphs.drawGraphs(graph, $gc, 'Individual Instances'); // draw the graphs on canvas

            });
        });
    }

});

Router.route('/(.*)', function () { //404
    console.log("404");
    this.render('404', {});
});
