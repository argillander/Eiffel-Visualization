import Graphs from '../lib/collections';
import MakeGraphs from "./MakeGraphs"

const handle = Meteor.subscribe('books');
const handle2 = Meteor.subscribe('graphs');
Tracker.autorun(() => {
    if (handle.ready()) {// When the data is ready to be fetched
        console.log("updated");
    }
    if (handle2.ready()){
        console.log("updated2");
    }
});

Router.configure({
    layoutTemplate: 'Layout'
});
Router.route('/', function () {
    console.log("Landing");
    this.render('Landing', {});
    Meteor.call('welcome', "hej", function(err,response) {
        if(err) {
            console.log('serverDataResponse', "Error:" + err.reason);
            return;
        }
        console.log(response);
    });

    Template.Landing.helpers({
        nr_of_events: function() {
            return 2;
        },
        events: function() {
            return Graphs['books'].find({});
        }
    });
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
                var tmp = Graphs['example3'].find({}).fetch();
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
