/**
 * Created by jonathan on 2017-01-16.
 * File contains the filter function and a helper function update_timeline.
 */
"use strict";
import { formatDate } from '../lib/date_formatter';

function update_timeline(from, to, start_times, id_list, ref) {
    /**
     * Function used to update timeline showing selected graphs
     * Input:
     *   from:
     *     Left boundary for timeline presented as a timestamp in ms since 1970-01-01 00:00:00
     *   to:
     *     Right boundary for timeline presented as a timestamp in ms since 1970-01-01 00:00:00
     *   start_times:
     *     Array of graphs within the selected area with timestamp and id.
     *   id_list:
     *     Array of id:s of currently active graphs.
     *   ref:
     *     A postfix to add to the id of graphs to be able to match the data in the id_list with those in start_times.
     */
    let $timeline = $("#timeline");

    $timeline.empty();
    let timelineData = [
        {class: 'other', times: []},
        {class: 'chosen', times: []}
    ];

    // Sort the chosen graphs in one list and the rest in the other.
    for (let i = 0; i < start_times.length; i++) {
        let classIndex = 0;
        if(id_list.indexOf(start_times[i]['_id']+ref) > -1){
            classIndex = 1;
        }

        timelineData[classIndex].times.push({
            starting_time: start_times[i].start.getTime(),
            ending_time: start_times[i].start.getTime()+1,
        });
    }

    let chart = d3.timeline()
        .tickFormat({
            format: d3.time.format("%Y"),
            tickTime: d3.time.years,
            tickInterval: 10,
            tickSize: 2
        })
        .display("circle");
    chart.beginning(from);
    chart.ending(to);
    let svg = d3.select("#timeline").append("svg").attr("width", $timeline.width()+52)  // I do not know where the magic number of 52 comes from.
        .attr('style', 'margin-left: -25px')
        .datum(timelineData).call(chart);

    // color not displayed graphs gray
    d3.selectAll('circle.timelineSeries_other')[0].forEach(function(e){
        e.style.fill = 'rgba(221, 221, 221, 0.5)';
    });
    // color selected graphs blue
    d3.selectAll('circle.timelineSeries_chosen')[0].forEach(function(e){
        e.style.fill = 'rgba(0, 94, 255, 0.5)';
    });

    // Add texts about number of results and date span.
    $("#nr_of_results").text(id_list.length);
    $("#total_nr_of_results").text(start_times.length);
    $("#date_range").text("Date Range: " + formatDate(new Date(from)) + "  -  " + formatDate(new Date(to)));
}

function filter(name, queryStringParams, ref, limit, url, collection, start_times, eventHandler) {
    /**
     * This function is handling the filtering using the timeline and/or the url parameters.
     * It is also responsible for updating the timeline with placement of graphs.
     * Input:
     *   name:
     *     Name displayed under the timelines.
     *   queryStringParams:
     *     Object containing the initial url parameters.
     *     The used parameters are:
     *       start:
     *         Left boundary for timeline presented as a timestamp in ms since 1970-01-01 00:00:00
     *       end:
     *         Right boundary for timeline presented as a timestamp in ms since 1970-01-01 00:00:00
     *       limit:
     *         Number of graphs to display. The graphs with the highest timestamps are displayed first.
     *         Overrides the limit parameter.
     *       offset:
     *         Number of graphs to skip of the graphs with the highest timestamps.
     *   ref:
     *     A postfix to add to the id of graphs to be able to use this function in parallel for each user.
     *     (one for individual graphs and one for aggregation at the time of writing)
     *   limit:
     *     Default limit of number of graphs to display.
     *     This can be overridden by the limit parameter in the queryStringParams.
     *   url:
     *     Base url for the view.
     *   collection:
     *     MongoDB collection containing the graphdata.
     *   start_times:
     *     MongoDB collection containing only the id and start times for fast access.
     *   eventHandler:
     *     Object containing functions for performing different events.
     *     Supported events:
     *       addOne: Used to signal that one element has been received from the server.
     *         function header: function(data, $container)
     *         Parameters:
     *           data: received element.
     *           $container: JQuery element to render graph in.
     *     Ex:
     *        {
     *          'addOne': function(data, $container) {},
     *          'removeOne': function(id, $container) {}
     *        }
     *
     */
    let id_list = [];  // Array of id:s of currently active graphs.

    // Select the container element and append the specific container elements to it.
    let $container = $('#container');
    $container.append('<h3>' + name + '</h3>');
    $container.append("<p>Showing <span id='nr_of_results'></span> of <span id='total_nr_of_results'></span>.</p>");
    $container.append("<div id='graph" + ref + "'></div>");
    let $graph = $("#graph" + ref);


    // Parse the data from queryStringParams
    let dates = [];
    let offset = 0;
    let from= new Date();
    from.setDate(from.getDate() - 7);
    let to = new Date();
    if (queryStringParams['start'] != undefined){
        from = new Date(parseInt(queryStringParams['start']));
    }
    if (queryStringParams['end'] != undefined) {
        to = new Date(parseInt(queryStringParams['end']));
    }
    dates.push({start: from});
    dates.push({start: to});
    if (queryStringParams['limit'] != undefined){
        limit = parseInt(queryStringParams['limit']);
    }
    if (queryStringParams['offset'] != undefined){
        offset = parseInt(queryStringParams['offset']);
    }
    
    // Initialize the timeline
    let selectable_timeline = new vis.Timeline(
        document.getElementById('selectable_timeline'), // DOM element where the Timeline will be attached
        new vis.DataSet(dates), // Start place
        {
            selectable: false,
            showCurrentTime: false,
            zoomable: true
        }  
    );

    // Run update_timeline once to initialise the view.
    let st = start_times.find({'start': {$gte: new Date(from), $lte: new Date(to)}}, {sort: {'start': 1}}).fetch();
    update_timeline(from, to, st, id_list, ref);

    // Variables for polling changes.
    let rangechanged = true;
    let changed = false;

    // Set what should happen when the range is changed
    selectable_timeline.on("rangechanged", function (properties) {
        // Update from and to variables used for receiving data.
        from = properties.start.getTime();
        to = properties.end.getTime();

        // Update url without reload.
        Router.go(url+"?start=" + from + "&end=" + to + "&limit=" + limit + "&offset=" + offset, {}, {notify: false});

        // Mark the data as changed.
        rangechanged = true;
    });

    // Observer that triggers when the changes from the server reaches the client.
    collection.find().observeChanges({
        added: function(id, fields) {
            // New graph added, only add it if the ref is right.
            if(fields['ref']==ref){
                id_list.push(id);  // Add graph to list of graphs rendered.
                fields['_id'] = id;  // The id is for some reason removed so it is added again.
                eventHandler['addOne'](fields, $graph);  // Trigger the addOne event
                changed = true;
            }
        },
        removed: function(id) {
            eventHandler['removeOne'](id, $graph);  // Trigger the removeOne event

            // Remove graph from list of graphs rendered.
            let index = id_list.indexOf(id);
            if (index > -1) {
                id_list.splice(index, 1);
                changed = true;
            }
        }
    });

    // Observer for the start times collection.
    start_times.find().observeChanges({
        added: function(id, fields) {
            changed = true;
        },
        removed: function(id) {
            changed = true;
        }
    });

    // This is to prevent multiple calls to update the range which makes the browser slow down and crash.
    // It works simply by polling for updates using the variables changed and rangechanged to know if there are any
    // changes in the data that needs to be updated in the browser.
    // It is not the most beautiful solution, it does however make it work fairly good...
    setInterval(function(){
        if(rangechanged){
            rangechanged = false;
            // Ask server for new data.
            Meteor.call('collect_data', from, to, limit, offset, ref, function(err, response) {
                if(err){console.log('serverDataResponse', "Error:" + err.reason);}
            });
            // Run find query to sooner or later receive the new data.
            collection.find({'start_time': {$gte: new Date(from), $lte: new Date(to)}, ref: ref, skip: offset, limit: limit}).fetch();

            st = start_times.find({'start': {$gte: new Date(from), $lte: new Date(to)}}, {sort: {'start': 1}}).fetch();
            update_timeline(from, to, st, id_list, ref);
        }
    }, 500);
    setInterval(function(){
        if(changed){
            changed = false;
            st = start_times.find({'start': {$gte: new Date(from), $lte: new Date(to)}}, {sort: {'start': 1}}).fetch();
            update_timeline(from, to, st, id_list, ref);
        }
    }, 1000);
}

export { filter };
