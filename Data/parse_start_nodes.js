/**
 * Created by jonathan on 2016-12-24.
 */
"use strict";

var mongoDBUrl = "mongodb://localhost:3001/meteor";
var startEvent = "EiffelSourceChangeCreatedEvent";
var disallowedLinks = ['PREVIOUS_VERSION'];
var from_collection = "";
var to_collection = "";
var argv = require('minimist')(process.argv.slice(2));

if (argv['mongodb'] != undefined || argv['m'] != undefined) {
    if (argv['mongodb'] != undefined) {
        mongoDBUrl = argv['mongodb'];
    } else {
        mongoDBUrl = argv['m'];
    }
}
if (argv['type'] != undefined || argv['t'] != undefined) {
    if (argv['type'] != undefined) {
        startEvent = argv['type'];
    } else {
        startEvent = argv['t'];
    }
}
if (argv['disallowed-links'] != undefined || argv['d'] != undefined) {
    if (argv['disallowed-links'] != undefined) {
        disallowedLinks = argv['disallowed-links'].split(',');
    } else {
        disallowedLinks = argv['d'].split(',');
    }
}
if (argv['_'].length != 2) {
    console.error("Wrong number of parameters, please read the help text below. \n");
    argv['h'] = true;
} else {
    from_collection = argv['_'][0];
    to_collection = argv['_'][1];
}
if (argv['h'] == true || argv['help'] == true) {
    console.log("Usage: node parse_start_nodes.js [OPTIONS]... SOURCE DEST");
    console.log("Parses start nodes from a SOURCE collection to a DESTination collection of a\n specified type.\n");
    console.log("  -m, --mongodb           Mongodb url");
    console.log("  -t, --type              Event type as start node.");
    console.log("  -d, --disallowed-links  Disallowed links in structure. Comma separated list");
    console.log("                          without space ex. -d LINK1,LINK2 ");
    console.log("  -h, --help              This help text");
    console.log("\n\nBy default:");
    console.log("  --mongodb=mongodb://localhost:3001/meteor");
    console.log("  --type=EiffelSourceChangeCreatedEvent");
    console.log("  --disallowed-links=PREVIOUS_VERSION");
    return;
}

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(mongoDBUrl, function (err, db) {


    function decorateNode(data) {
        let s = [];
        let id = data.meta.type;

        if (id === "EiffelSourceChangeCreatedEvent") { // If node is of 'EiffelSourceChangeCreatedEvent' type, set shape, style and label of the node accordingly
            s.push("Changes Created" + "\n" + data.meta.version + "\n" + formatDate(data.meta.time) + "\n" + data.data.author.name + "\n" + data.data.author.group);
            s.push('fill: #66FF66');
            s.push('circle');
        }
        else if (id === "EiffelSourceChangeSubmittedEvent") { // Set properties according to the node types
            s.push("Changes Submitted" + "\n" + data.meta.version + "\n" + formatDate(data.meta.time) + "\n" + data.data.submitter.name + "\n" + data.data.submitter.group);
            s.push('fill: #66FF66');
            s.push('circle');
        }
        else if (id === "EiffelArtifactCreatedEvent") { // Set properties according to the node types
            s.push("Artifact Created" + "\n" + data.meta.version + "\n" + formatDate(data.meta.time));
            s.push('fill: #66FF66');
            s.push('circle');
        }
        else if (id === "EiffelArtifactPublishedEvent") { // Set properties according to the node types
            s.push("Artifact Published" + "\n" + data.meta.version + "\n" + formatDate(data.meta.time));
            s.push('fill: #66FF66');
            s.push('circle');
        }
        else if (id === "EiffelTestSuiteStartedEvent") { // Set properties according to the node types
            s.push("Test Suite Started" + "\n" + data.meta.version + "\n" + formatDate(data.meta.time) + "\n" + data.data.name);
            s.push('fill: #66FF66');
            s.push('circle');
        }
        else if (id === "EiffelTestSuiteFinishedEvent") { // Set properties according to the node types
            s.push("Test Suite Finished" + "\n" + data.meta.version + "\n" + formatDate(data.meta.time) + "\n" + data.data.outcome.verdict);
            if (data.data.outcome.verdict == "PASSED") {
                s.push('fill: #66FF66');
            }
            else {
                s.push('fill: #FF0000');
            }
            s.push('circle');
        }
        else if (id === "EiffelConfidenceLevelModifiedEvent") { // Set properties according to the node types
            s.push("Confidence Level" + "\n" + data.meta.version + "\n" + formatDate(data.meta.time) + "\n" + data.data.name + "\n" + data.data.value);
            if (data.data.name == "stable") {
                s.push('fill: #66FF66');
            }
            else {
                s.push('fill: #FF0000');
            }
            s.push('circle');
        }
        else {
            s.push(id);
            s.push('fill: #66FF66');

            s.push('circle');
        }
        return s;
    }

    function formatDate(date) {
        date = new Date(date);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        if (day < 10) {
            day = "0" + day;
        }
        if (month < 10) {
            month = "0" + month;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    }

    var recursive = 0;
    function makeGraphRecursive(startNode, g, preventCycles, callback) {
        if (preventCycles.indexOf(startNode.meta.id) > -1) {
            return;
        }
        let decorate = decorateNode(startNode);
        g.nodes[startNode.meta.id]= {
            label: decorate[0],
            style: decorate[1],
            shape: decorate[2],
            time: new Date(startNode.meta.time)
        };

        preventCycles.push(startNode.meta.id);
        for (let j = 0; j < startNode.nextActivities.length; j++) {
            if (startNode.nextActivities[j].type == "PREVIOUS_VERSION") {  //Skip all links that point back to earlier versions.
                continue;
            }
            if (startNode.nextActivities[j].ref.meta.type == "EiffelSourceChangeSubmittedEvent") {  //Skip all source changes except the first.
                let tmp = preventCycles.length == 1;
                if (!tmp) {
                    continue;
                }

            }
            recursive++;
            g.edges.push({from: startNode.meta.id, to: startNode.nextActivities[j].ref.meta.id});

            makeGraphRecursive(startNode.nextActivities[j].ref, g, preventCycles, callback);
            if (preventCycles.indexOf(startNode.nextActivities[j].ref.meta.id) > -1) {
                recursive--;
                if (recursive == 0){
                    callback();
                }
            }
        }
    }

    function getData(query, callback) {
        /**
         * Update the data set with data matching a mongodb query, or all data.
         * The only function that shall be talking to mongodb to don't fuck up the data.
         */
        let from = db.collection(from_collection);
        let arrayGraphs = [];
        let eventDict = {};
        let startEvents = [];
        let dbData = from.find(query).toArray(
            function (err, items) {

                let len = items.length;  // Number of records
                for (let i = 0; i < len; i++) {  // Fetch the eiffel data into a list and dict for easy access.
                    let tmp = items[i];
                    tmp['nextActivities'] = [];
                    arrayGraphs.push(tmp);
                    eventDict[tmp.meta.id] = tmp;
                    if (tmp.meta.type == startEvent) {
                        startEvents.push(tmp);
                    }
                }
                for (let i = 0; i < arrayGraphs.length; i++) {
                    if (arrayGraphs[i].links != null) {
                        for (let j = 0; j < arrayGraphs[i].links.length; j++) {
                            let target = eventDict[arrayGraphs[i].links[j].target];
                            arrayGraphs[i].links[j]['ref'] = target;
                            target.nextActivities.push({
                                'ref': arrayGraphs[i],
                                'target': arrayGraphs[i].meta.id,
                                'type': arrayGraphs[i].links[j].type
                            });
                        }
                    }
                }
                return callback(startEvents);
            }
        );  // Query for new data
    }
    let to = db.collection(to_collection);
    to.drop();
    let g = [];
    getData({}, function (startNodes) {
        for (let i = 0; i < startNodes.length; i++) {
            let startNode = startNodes[i];
            let tmp = {
                '_id': startNode.meta.id,
                'start_time': new Date(startNode.meta.time),
                'nodes': {},
                'edges': [],
            };
            let preventCycles = [];
            makeGraphRecursive(startNode, tmp, preventCycles, function () {
                let count = 0;
                let endTime = new Date(0);
                for (var k in tmp['nodes']) {
                    if (tmp['nodes'].hasOwnProperty(k)) {
                        count++;
                        if (tmp['nodes'][k]['time'].getTime()>endTime.getTime()){
                            endTime = tmp['nodes'][k]['time'];
                        }
                    }

                }
                tmp['end_time'] = endTime;
                tmp['node_count'] = count;
                tmp['edge_count'] = tmp["edges"].length;

                to.insert(tmp, function(err, result) {
                    if(err != null){
                        console.log(err);
                    }
                    if(i+1 == startNodes.length){
                        console.log("Generated "+startNodes.length + " graphs");
                        process.exit()
                    }
                });
            });
        }
    });
});
