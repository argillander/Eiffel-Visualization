import Graph from "./Graph";
import GraphData from "./GraphData";
import Graphs from '../lib/collections';


Router.configure({
    layoutTemplate: 'Layout'
});
Router.route('/', function () {
    console.log("Landing");
    this.render('Landing', {});

    Template.Landing.helpers({
        events: function() {
            let gd = new GraphData(Graphs);
            return gd.getStartEventsFromDB();
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
