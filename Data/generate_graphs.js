/**
 * Script for generating graphs from a MongoDB collection using a settings file for configurations.
 *
 * Created by jonathan on 2016-12-24.
 */
"use strict";

// Import everything needed
let fs = require('fs');
let MongoClient = require('mongodb').MongoClient;
let argv = require('minimist')(process.argv.slice(2));
let ggs = require('./utils/generate-graph-structure');
let getElements = ggs.getElements;
let makeGraphRecursive = ggs.makeGraphRecursive;
let generateAggregated = require("./utils/aggregate.js").generateAggregated;
let positionNodes = require('./utils/position-nodes').positionNodes;

// Get commandline arguments.
let mongoDBUrl = "mongodb://localhost:3001/meteor";
let from_collection = "";
let to_collection = "graph_data";
let agg_collection = "graph_data_agg";
let settings_file = "settings.json";


if (argv['mongodb'] != undefined || argv['m'] != undefined) {
    if (argv['mongodb'] != undefined) {
        mongoDBUrl = argv['mongodb'];
    } else {
        mongoDBUrl = argv['m'];
    }
}
if (argv['settings'] != undefined || argv['s'] != undefined) {
    if (argv['settings'] != undefined) {
        settings_file = argv['settings'];
    } else {
        settings_file = argv['s'];
    }
}
if (argv['_'].length != 1) {
    console.error("Wrong number of parameters, please read the help text below. \n");
    argv['h'] = true;
} else {
    from_collection = argv['_'][0];
}

if (argv['h'] == true || argv['help'] == true) {
    console.log("Usage: node generate_graphs.js [OPTIONS]... SOURCE");
    console.log("Parses start nodes from a SOURCE collection.\n");
    console.log("  -m, --mongodb           Mongodb url");
    console.log("  -h, --help              This help text");
    console.log("  -s, --settings          Settings file");
    console.log("\n\nBy default:");
    console.log("  --mongodb=mongodb://localhost:3001/meteor");
    console.log("  --settings=settings.json");
    return;
}

function writeToMongo(start_times, graph_data, graph, callback) {
    /**
     * Write the graph to both the start_times collection and the graph_data collection
     */
    let t = 0;
    start_times.insertOne({'_id': graph['_id'], 'start': graph['start_time'] }, function(err, result) {
        if(err != null){
            console.error(err);
        }
        t++;
        if (t==2){callback();}
    });
    graph_data.insertOne(graph, function(err, result) {
        if(err != null){
            console.error(err);
        }
        t++;
        if (t==2){callback();}
    });
}

function createAggregation (agg, to, settings, callback){
    /**
     * Create and save the aggregation.
     */
    to.find({}).toArray(
        function (err, items) {
            let elements = generateAggregated(items, settings);
            let aggregation = positionNodes(elements, settings['layout']);
            agg.insertOne(aggregation, function(err_agg, res) {
                if(err_agg != null) {
                    console.error(err);
                } else {
                    console.log("Generated positions for aggregations");
                }
                callback();
            });
        }
    );
}

function addMetaData(graph) {
    /**
     * Add meta data such as end_time, node_count, edge_count and identifier data (for aggregation).
     */
    let count = 0;
    let endTime = new Date(0);
    let identifiers = {};
    for (let l=0; l<graph["nodes"].length; l++){
        count++;
        if (graph['nodes'][l]['data']['time'].getTime()>endTime.getTime()){
            endTime = graph['nodes'][l]['data']['time'];
        }
        identifiers[graph['nodes'][l]['data']['id']] = graph['nodes'][l]['data']['identifier']
    }
    graph['end_time'] = endTime;
    graph['node_count'] = count;
    graph['edge_count'] = graph["edges"].length;
    for (let l=0; l<graph["edges"].length; l++){
        graph["edges"][l]['data']["from_identifier"] = identifiers[graph["edges"][l]['data']['source']];
        graph["edges"][l]['data']["to_identifier"] = identifiers[graph["edges"][l]['data']['target']];
    }
}

MongoClient.connect(mongoDBUrl, function (mongo_err, db) {
    if (mongo_err!=undefined){
        console.error("Problem with connecting to MongoDB.");
        console.error("You must have meteor running in the background!");
        process.exit();
    }

    // Parse settings file.
    let settings = JSON.parse(fs.readFileSync(settings_file, 'utf8'));

    // Select collections and empty the ones to write to.
    db.collection('data').drop();
    let from = db.collection(from_collection);
    let to = db.collection(to_collection);
    let agg = db.collection(agg_collection);
    let start_times = db.collection('start_times');
    start_times.drop();
    to.drop();
    agg.drop();
    to.createIndex( { "start_time": 1 } );
    start_times.createIndex( { "start_time": 1 } );

    let ts = + new Date();
    getElements({}, from, settings, function (startNodes) {
        for (let i = 0; i < startNodes.length; i++) {
            let startNode = startNodes[i];
            let graph = {
                '_id': startNode.meta.id,
                'start_time': new Date(startNode.meta.time),
                'root': startNode.meta.id,
                'nodes': [],
                'edges': [],
            };
            makeGraphRecursive(startNode, graph, [], settings, function () {
                addMetaData(graph);

                // Print progress
                if(ts+500 < + new Date()){
                    ts = + new Date();
                    process.stdout.write("" + ("      " + Math.floor((i/startNodes.length)*1000)/10.0).slice(-6) + "%\r");
                }

                positionNodes(graph, settings['layout']);
                writeToMongo(start_times, to, graph, function() {
                    if(i+1 == startNodes.length){
                        console.log(("      100").slice(-6) + "%");
                        console.log("Generated "+startNodes.length + " graphs");
                        createAggregation(agg, to, settings, process.exit);
                    }
                });
            });
        }
    });
});
