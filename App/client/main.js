import Graphs from '../lib/collections';
import IndividualGraphs from "./IndividualGraphs"
import formatDate from '../lib/date_formatter'
import AggregateGraphs from "./AggregateGraphs"


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
Router.route('/agg', function () {
    console.log("Graph");
    var queryStringParams = this.params.query;
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
            let dates = [];
            if (queryStringParams['start'] == undefined){
                dates.push({start: new Date()});
            } else {
                dates.push({start: new Date(parseInt(queryStringParams['start']))});
            }
            if (queryStringParams['end'] != undefined){
                dates.push({start: new Date(parseInt(queryStringParams['end']))});
            }
            // Get time line settings Date range etc to draw the timeline accordingly
            let timeline = new vis.Timeline(
                document.getElementById('timeline'), // DOM element where the Timeline will be attached
                new vis.DataSet(dates), // Start place
                {
                    selectable: false,
                    showCurrentTime: false,
                    zoomable: true
                }  // Settings
            );
            let nr_of_results = $("#nr_of_results");
            let total_nr_of_results = $("#total_nr_of_results");
            // If the range is changed by the user, modify the heatMap accordingly
            let $gc = $('#graph-container');
            let $ag = $('#aggGraph-containerHM');
            timeline.on("rangechanged", function (properties) {

                // To make the div empty for stop showing previous graphs to user
                $container.empty();

                $gc.empty();
                $ag.empty();

                let timeLineStart = properties.start.getTime();
                let timeLineEnd = properties.end.getTime();
                Router.go("/agg?start=" + timeLineStart + "&end=" + timeLineEnd, {}, {notify: false});
                Meteor.call('collect_data', timeLineStart, timeLineEnd, 5000, 0, function(err,response) {
                    if(err) {
                        console.log('serverDataResponse', "Error:" + err.reason);
                        return;
                    }
                    total_nr_of_results.text(response);
                });
                $("label[for = lblDate1]").text("Date Range: " + formatDate(new Date(timeLineStart)) + "  -  " + formatDate(new Date(timeLineEnd)));
                var tmp = Graphs['data'].find({}).fetch();

                nr_of_results.text(tmp.length);
                let graph = AggregateGraphs.makeGraph(tmp);
                AggregateGraphs.drawGraphs(graph, $gc, 'Aggregated');

            });
            Tracker.autorun(() => {
                if (handle.ready()) {// When the data is ready to be fetched
                    $container.empty();
                    $gc.empty();
                    $ag.empty();
                    let tmp = Graphs['data'].find({}).fetch();
                    nr_of_results.text(tmp.length);
                    let graph = AggregateGraphs.makeGraph(tmp);
                    AggregateGraphs.drawGraphs(graph, $ag, 'Aggregated');
                }
            });
        });
    }
});

Router.route('/graph', function () {
    console.log("Graph");
    var queryStringParams = this.params.query;
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
            let dates = [];
            if (queryStringParams['start'] == undefined){
                dates.push({start: new Date()});
            } else {
                dates.push({start: new Date(parseInt(queryStringParams['start']))});
            }
            if (queryStringParams['end'] != undefined){
                dates.push({start: new Date(parseInt(queryStringParams['end']))});
            }
            // Get time line settings Date range etc to draw the timeline accordingly
            let timeline = new vis.Timeline(
                document.getElementById('timeline'), // DOM element where the Timeline will be attached
                new vis.DataSet(dates), // Start place
                {
                    selectable: false,
                    showCurrentTime: false,
                    zoomable: true
                }  // Settings
            );
            let nr_of_results = $("#nr_of_results");
            let total_nr_of_results = $("#total_nr_of_results");
            // If the range is changed by the user, modify the heatMap accordingly
            let $gc = $('#graph-container');
            let $ag = $('#aggGraph-containerHM');
            timeline.on("rangechanged", function (properties) {

                // To make the div empty for stop showing previous graphs to user
                $container.empty();

                $gc.empty();
                $ag.empty();

                let timeLineStart = properties.start.getTime();
                let timeLineEnd = properties.end.getTime();
                Router.go("/graph?start=" + timeLineStart + "&end=" + timeLineEnd, {}, {notify: false});
                Meteor.call('collect_data', timeLineStart, timeLineEnd, 20, 0, function(err,response) {
                    if(err) {
                        console.log('serverDataResponse', "Error:" + err.reason);
                        return;
                    }
                    total_nr_of_results.text(response);
                });
                $("label[for = lblDate1]").text("Date Range: " + formatDate(new Date(timeLineStart)) + "  -  " + formatDate(new Date(timeLineEnd)));
                var tmp = Graphs['data'].find({}).fetch();

                nr_of_results.text(tmp.length);
                var graph = IndividualGraphs.makeGraph(tmp);
                IndividualGraphs.drawGraphs(graph, $gc, 'Individual Instances'); // draw the graphs on canvas

            });
            Tracker.autorun(() => {
                if (handle.ready()) {// When the data is ready to be fetched
                    $container.empty();
                    $gc.empty();
                    $ag.empty();
                    let tmp = Graphs['data'].find({}).fetch();
                    nr_of_results.text(tmp.length);
                    let graph = IndividualGraphs.makeGraph(tmp);
                    IndividualGraphs.drawGraphs(graph, $gc, 'Individual Instances'); // draw the graphs on canvas
                }
            });
        });
    }

});

Router.route('/(.*)', function () { //404
    console.log("404");
    this.render('404', {});
});
