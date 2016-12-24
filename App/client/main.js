import Graph from "./Graph";
import GraphData from "./GraphData";
import Graphs from '../lib/collections';


Router.configure({
    layoutTemplate: 'Layout'
});
Router.route('/', function () {
    console.log("Landing");
    this.render('Landing', {});
    let gd = new GraphData(Graphs);
    let start_events = gd.getStartEventsFromDB({}, 1, 3);
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
Router.route('/(.*)', function () { //404
    console.log("404");
    this.render('404', {});
});
