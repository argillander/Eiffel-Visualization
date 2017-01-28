/**
 * Created by jonathan on 2017-01-16.
 */
import formatDate from '../lib/date_formatter'
function filter(name, queryStringParams, ref, limit, url, collection, handle, handle_start_times, start_times, drawGraph) {
    // Time Line
    let $container = $('#container');
    $container.append('<h3>' + name + '</h3>');
    $container.append("<p>Showing <span id='nr_of_results" + ref + "'></span> of <span id='total_nr_of_results" + ref + "'></span>.</p>");
    $container.append("<div id='graph" + ref + "'></div>");
    let dates = [];
    let offset = 0;
    if (queryStringParams['start'] == undefined){
        dates.push({start: new Date()});
    } else {
        dates.push({start: new Date(parseInt(queryStringParams['start']))});
    }
    if (queryStringParams['end'] != undefined){
        dates.push({start: new Date(parseInt(queryStringParams['end']))});
    }
    if (queryStringParams['limit'] != undefined){
        limit = parseInt(queryStringParams['limit']);
    }
    if (queryStringParams['offset'] != undefined){
        offset = parseInt(queryStringParams['offset']);
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
    let nr_of_results = $("#nr_of_results" + ref);
    let total_nr_of_results = $("#total_nr_of_results" + ref);
    // If the range is changed by the user, modify the heatMap accordingly
    let $graph = $("#graph" + ref);
    let from;
    let to;
    timeline.on("rangechanged", function (properties) {
        // To make the div empty for stop showing previous graphs to user
        $graph.empty();

        from = properties.start.getTime();
        to = properties.end.getTime();
        Router.go(url+"?start=" + from + "&end=" + to + "&limit=" + limit + "&offset=" + offset, {}, {notify: false});
        Meteor.call('collect_data', from, to, limit, offset, ref, function(err,response) {
            if(err) {
                console.log('serverDataResponse', "Error:" + err.reason);
                return;
            }
            total_nr_of_results.text(response);
        });
        $("#date_range").text("Date Range: " + formatDate(new Date(from)) + "  -  " + formatDate(new Date(to)));
        let tmp = collection.find({'start_time': {$gte: new Date(from), $lte: new Date(to)}, ref: ref, skip: offset, limit: limit}).fetch();
        nr_of_results.text(tmp.length);
        drawGraph(tmp, $graph);
        // let st = start_times.find({'start': {$gte: new Date(from), $lte: new Date(to)}}, {sort: {'start': 1}}).fetch();
        // console.log(st);

    });
    Tracker.autorun(() => {
        if (handle.ready()) {// When the data is ready to be fetched
            $graph.empty();
            let tmp = collection.find({'start_time': {$gte: new Date(from), $lte: new Date(to)}, ref: ref, skip: offset, limit: limit}).fetch();
            nr_of_results.text(tmp.length);
            drawGraph(tmp, $graph);

        }
        if (handle_start_times.ready()) {// When the data is ready to be fetched
            //timeline.setItems(new vis.DataSet(start_times.fetch()));
        }
    });
}
export default filter;