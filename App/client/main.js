import Graphs from '../lib/collections';
import IndividualGraphs from "./IndividualGraphs";
import AggregateGraphs from "./AggregateGraphs";
import filter from "./filter";


const handle = Meteor.subscribe('data');
const handle_agg = Meteor.subscribe('graph_data_agg');
const handle_start_times = Meteor.subscribe('start_times');

Router.configure({
    layoutTemplate: 'Layout'
});
Router.route('/', function () {
    console.log("Landing");
    this.render('Landing', {});
    let start_times = Graphs['start_times'].find({}, {sort: {'start': 1}});
    Template.Landing.helpers({
        nr_of_events: function() {
            return start_times.count();
        },
        events: function() {
            return start_times.fetch();
        }
    });
});

Router.route('/agg', function () {
    let queryStringParams = this.params.query;
    this.render('Graph', {});
    let start_times = Graphs['start_times'];
    Template.Graph.rendered=function() { // Run this code when the elements are created
        $(document).ready(function () {
            filter("Aggregate", queryStringParams, "_agg", 500, "/agg", Graphs['data'], handle, handle_start_times, start_times, function (data, $container) {
                let agg = Graphs['graph_data_agg'].find({}).fetch();
                AggregateGraphs.drawGraphs(data, agg, $container);
            })
        });
    }
});

Router.route('/graph', function () {
    let queryStringParams = this.params.query;
    this.render('Graph', {});
    let start_times = Graphs['start_times'];
    Template.Graph.rendered=function() { // Run this code when the elements are created
        $(document).ready(function () {
            filter("Individual Instances", queryStringParams, "_ind", 20, "/graph", Graphs['data'], handle, handle_start_times, start_times, function (data, $container) {
                IndividualGraphs.drawGraphs(data, $container); // draw the graphs on canvas
            })
        });
    }

});

Router.route('/(.*)', function () { //404
    console.log("404");
    this.render('404', {});
});
