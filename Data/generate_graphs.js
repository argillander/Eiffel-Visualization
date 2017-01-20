/**
 * Created by jonathan on 2016-12-24.
 */
"use strict";
let fs = require('fs');

let MongoClient = require('mongodb').MongoClient;
let argv = require('minimist')(process.argv.slice(2));
let cytoscape = require('cytoscape');
let cydagre = require('cytoscape-dagre');
let dagre = require('dagre');
cydagre( cytoscape, dagre );

let settingsParser = require('./utils/settingsParser');

let getDataValue = settingsParser.getDataValue;
let getIdentifierValue = settingsParser.getIdentifierValue;
let decorateNode = settingsParser.decorateNode;


let mongoDBUrl = "mongodb://localhost:3001/meteor";
let startEvent = "EiffelSourceChangeCreatedEvent";
let disallowedLinks = ['PREVIOUS_VERSION'];
let from_collection = "";
let to_collection = "graph_data";
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

var settings = JSON.parse(fs.readFileSync(settings_file, 'utf8'));

var recursive = 0;
function makeGraphRecursive(startNode, g, preventCycles, callback) {
    if (preventCycles.indexOf(startNode.meta.id) > -1) {
        return;
    }
    let decorate = decorateNode(startNode, settings);
    let key = startNode.meta.type;
    let ident = getIdentifierValue(startNode, settings);
    if (ident!=undefined){
        key = key +"_"+ ident
    }
    g.nodes.push({
        "data": {
            id: startNode.meta.id,
            label: decorate['label'],
            color: decorate['color'],
            shape: decorate['shape'],
            shapeHeight: decorate['shapeHeight'],
            shapeWidth: decorate['shapeWidth'],
            time: new Date(startNode.meta.time),
            type: startNode.meta.type,
            identifier: key,
            value: getDataValue(startNode, settings)
        }
    });

    preventCycles.push(startNode.meta.id);
    for (let j = 0; j < startNode.nextActivities.length; j++) {
        if (settings["disallowedLinks"].indexOf(startNode.nextActivities[j].type) > -1) {  //Skip all links that point back to earlier versions.
            continue;
        }
        if (startNode.nextActivities[j].ref.meta.type == settings["startEvent"]) {  //Skip all source changes except the first.
            let tmp = preventCycles.length == 1;
            if (!tmp) {
                continue;
            }

        }
        recursive++;
        g.edges.push({
            "data": {
                id: startNode.meta.id+"_"+startNode.nextActivities[j].ref.meta.id,
                //weight: 1,
                source: startNode.meta.id,
                target: startNode.nextActivities[j].ref.meta.id
            }
        });

        makeGraphRecursive(startNode.nextActivities[j].ref, g, preventCycles, callback);
        if (preventCycles.indexOf(startNode.nextActivities[j].ref.meta.id) > -1) {
            recursive--;
            if (recursive == 0){
                callback();
            }
        }
    }
}

function getData(query, collection, callback) {
    /**
     * Update the data set with data matching a mongodb query, or all data.
     * The only function that shall be talking to mongodb to don't fuck up the data.
     */

    let arrayGraphs = [];
    let eventDict = {};
    let startEvents = [];
    collection.find(query).toArray(
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
                        if(target == undefined) {
                            console.log(arrayGraphs[i].links[j].target);
                            continue;
                        }
                        arrayGraphs[i].links[j]['ref'] = target;
                        target.nextActivities.push({
                            'ref': arrayGraphs[i],
                            'target': arrayGraphs[i].meta.id,
                            'type': arrayGraphs[i].links[j].type
                        });
                    }
                }
            }
            callback(startEvents);
        }
    );  // Query for new data
}
function positionNodes(graph, layout) {
    let layoutObject;
    if(layout=="dagre"){
        layoutObject = {
            name: 'dagre',
                rankDir: "LR",
                rankSep: 30,
                nodeSep: 30,
                fit: false
        };
    }
    if(layout=="breadthfirst"){
        layout = {
            name: 'breadthfirst',
                directed: true,
                roots: '#'+graph['root'],
                padding: 0,
                fit: false, // whether to fit the viewport to the graph
                circle: false, // put depths in concentric circles if true, put depths top down if false
                spacingFactor: 1, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
                maximalAdjustments: 0, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
                animate: false, // whether to transition the node positions
        };
    }

    let cy = cytoscape({
        container: undefined,
        elements: {
            nodes: graph['nodes'],
            edges: graph['edges']
        },
        layout: layoutObject
    });

    if(layout=="dagre"){
        cy.one('layoutstop', function(){
            cy.nodes().positions(function(i, n){
                let pos = n.position();
                return { x: 12*pos.x, y: 12*pos.y };
            });
        }).layout({name: 'preset'});
    }
    if(layout=="breadthfirst"){
        // Add some spacing between nodes and switch from vertical to horizontal
        cy.one('layoutstop', function(){
            cy.nodes().positions(function(i, n){
                let pos = n.position();
                return { x: 150*2*pos.y, y: 150*pos.x };
            });
        }).layout({name: 'preset'});
    }

    let nodes = cy.json()['elements']['nodes'];
    graph['nodes'] = [];
    for (let i = 0; i < nodes.length; i++) {
        graph['nodes'].push({data: nodes[i]['data'], position: nodes[i]['position']});
    }
    return graph;
}

MongoClient.connect(mongoDBUrl, function (err, db) {
    try {
        db.collection('data').drop();
    } catch (err){
        if(err=="TypeError: Cannot read property 'collection' of null"){
            console.log("Problem with reading collections. Check your settings.");
            console.log("You must have meteor running in the background!");
            return;
        }
    }

    let from = db.collection(from_collection);
    let to = db.collection(to_collection);
    to.drop();
    let ts = + new Date();
    getData({}, from, function (startNodes) {
        for (let i = 0; i < startNodes.length; i++) {
            let startNode = startNodes[i];
            let tmp = {
                '_id': startNode.meta.id,
                'start_time': new Date(startNode.meta.time),
                'root': startNode.meta.id,
                'nodes': [],
                'edges': [],
            };
            let preventCycles = [];
            makeGraphRecursive(startNode, tmp, preventCycles, function () {
                let count = 0;
                let endTime = new Date(0);
                let identifiers = {};
                for (let l=0; l<tmp["nodes"].length; l++){
                    count++;
                    if (tmp['nodes'][l]['data']['time'].getTime()>endTime.getTime()){
                        endTime = tmp['nodes'][l]['data']['time'];
                    }
                    identifiers[tmp['nodes'][l]['data']['id']] = tmp['nodes'][l]['data']['identifier']
                }
                tmp['end_time'] = endTime;
                tmp['node_count'] = count;
                tmp['edge_count'] = tmp["edges"].length;
                for (let l=0; l<tmp["edges"].length; l++){
                    tmp["edges"][l]['data']["from_identifier"] = identifiers[tmp["edges"][l]['from']];
                    tmp["edges"][l]['data']["to_identifier"] = identifiers[tmp["edges"][l]['to']];
                }

                if(ts+500 < + new Date()){
                    let ts = + new Date();
                    process.stdout.write("" + ("      " + Math.floor((i/startNodes.length)*1000)/10.0).slice(-6) + "%\r");
                }
                tmp = positionNodes(tmp, "dagre");
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
