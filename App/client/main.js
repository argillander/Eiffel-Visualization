import Graphs from '../lib/collections';
import IndividualGraphs from "./IndividualGraphs";
import IndividualGraphsInfoVis from "./IndividualGraphsInfoVis";
import AggregateGraphs from "./AggregateGraphs";
import filter from "./filter";


const handle = Meteor.subscribe('data');

Router.configure({
    layoutTemplate: 'Layout'
});
Router.route('/', function () {
    console.log("Landing");
    this.render('Landing', {});

    Template.Landing.helpers({
        nr_of_events: function () {
            return 2;
        },
        events: function () {
            return Graphs['data'].find({});
        }
    });
});
Router.route('/infovis', function () {
    let queryStringParams = this.params.query;
    this.render('Graph', {});
    Template.Graph.rendered = function () { // Run this code when the elements are created
        $(document).ready(function () {
            filter("Individual Instances", queryStringParams, "_ind", 20, "/infovis", Graphs['data'], handle, function (data, $container) {
                IndividualGraphsInfoVis.drawGraphs(data, $container)
            })
        });
    }
});
Router.route('/agg', function () {
    let queryStringParams = this.params.query;
    this.render('Graph', {});
    Template.Graph.rendered = function () { // Run this code when the elements are created
        $(document).ready(function () {
            let tmp = undefined;
            filter("Aggregate", queryStringParams, "_agg", 500, "/agg", Graphs['data'], handle, function (data, $container) {
                // TODO: Add check if still same data and then don't update
                //tmp = data;

                let graph = AggregateGraphs.makeGraph(data);
                AggregateGraphs.drawGraphs(graph, $container);
            })
        });
    }
});

Router.route('/graph', function () {
    let queryStringParams = this.params.query;
    this.render('Graph', {});
    Template.Graph.rendered = function () { // Run this code when the elements are created
        $(document).ready(function () {
            filter("Individual Instances", queryStringParams, "_ind", 20, "/graph", Graphs['data'], handle, function (data, $container) {
                // TODO: Add check if still same data and then don't update
                let graph = IndividualGraphs.makeGraph(data);
                IndividualGraphs.drawGraphs(graph, $container); // draw the graphs on canvas
            })
        });
    }

});

Router.route('/(.*)', function () { //404
    console.log("404");
    this.render('404', {});
});
