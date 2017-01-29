import { data_collection, start_times_collection, aggregation_collection } from '../lib/collections';
import IndividualGraphs from "./individual-graphs";
import AggregateGraphs from "./aggregate-graphs";
import { filter } from "./filter";

Meteor.subscribe('data');
Meteor.subscribe('graph_data_aggregation');
Meteor.subscribe('start_times');

Router.configure({
    layoutTemplate: 'Layout'
});

Router.route('/', function () {
    /**
     * Landing
     */
    this.render('Landing', {});
});

Router.route('/aggregation', function () {
    /**
     * Aggregation view
     */
    let queryStringParams = this.params.query;
    this.render('Graph', {});
    let agg;  // Hold the pre-generated structure for the aggregation.
    let loaded = false; // Variable for marking if the aggregated structure has loaded.

    // Load agg variable.
    aggregation_collection.find().observeChanges({
        added: function(id, fields) {
            agg = fields;
            loaded = true;
        }
    });
    aggregation_collection.find({}).fetch();

    Template.Graph.rendered=function() { // This code is executed after the page has rendered.
        $(document).ready(function () {
            let data_list = [];  // Array of all graphs to aggregate
            let id_list = [];  // Array with exact same order as data_list for index lookups.
            let changed = false;  // Polling variable.
            let $c;  // Container variable that needs to be accessed outside of the filter call.
            filter(
                "Aggregate",
                queryStringParams,
                "_agg",
                500,
                "/aggregation",
                data_collection,
                start_times_collection,
                {
                    'addOne': function(data, $container) {
                        $c = $container;
                        data_list.push(data);
                        id_list.push(data['_id']);
                        changed = true;
                    },
                    'removeOne': function(id, $container) {
                        let index = id_list.indexOf(id);
                        if (index > -1) {
                            id_list.splice(index, 1);
                            data_list.splice(index, 1);
                            changed = true;
                        }
                    }
                }
            );
            // Poll for changes to the aggregation every second second to not crash the view in the browser.
            setInterval(function(){
                if(changed && loaded){
                    changed = false;
                    AggregateGraphs.drawGraphs(data_list, JSON.parse(JSON.stringify(agg)), $c);
                }
            }, 2000);
        });
    }
});

Router.route('/graph', function () {
    /**
     * Individual graphs view
     */
    let queryStringParams = this.params.query;
    this.render('Graph', {});
    Template.Graph.rendered=function() { // Run this code when the elements are created
        $(document).ready(function () {
            filter(
                "Individual Instances",
                queryStringParams,
                "_ind",
                20,
                "/graph",
                data_collection,
                start_times_collection,
                {
                    'addOne': function(data, $container) {
                        IndividualGraphs.drawGraph(data, $container);
                    },
                    'removeOne': function(id, $container) {
                        IndividualGraphs.removeGraph(id, $container);
                    }
                }
            )
        });
    }

});

Router.route('/(.*)', function () { //404
    /**
     * 404 view
     */
    this.render('404', {});
});
