/**
 * Created by jonathan on 2016-12-24.
 */
"use strict";
var fs = require('fs');
var mongoDBUrl = "mongodb://localhost:3001/meteor";
var startEvent = "EiffelSourceChangeCreatedEvent";
var disallowedLinks = ['PREVIOUS_VERSION'];
var from_collection = "";
var to_collection = "";
var settings_file = "settings.json";
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
if (argv['settings'] != undefined || argv['s'] != undefined) {
    if (argv['settings'] != undefined) {
        settings_file = argv['settings'];
    } else {
        settings_file = argv['s'];
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
    console.log("Usage: node generate_graphs.js [OPTIONS]... SOURCE DEST");
    console.log("Parses start nodes from a SOURCE collection to a DESTination collection of a\n specified type.\n");
    console.log("  -m, --mongodb           Mongodb url");
    console.log("  -t, --type              Event type as start node.");
    console.log("  -d, --disallowed-links  Disallowed links in structure. Comma separated list");
    console.log("                          without space ex. -d LINK1,LINK2 ");
    console.log("  -h, --help              This help text");
    console.log("  -s, --settings          Settings file");
    console.log("\n\nBy default:");
    console.log("  --mongodb=mongodb://localhost:3001/meteor");
    console.log("  --type=EiffelSourceChangeCreatedEvent");
    console.log("  --disallowed-links=PREVIOUS_VERSION");
    console.log("  --settings=settings.json");
    return;
}

var settings = JSON.parse(fs.readFileSync(settings_file, 'utf8'));

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
function getValueFromPath(str, data) {
    let path = str.split(".");
    let value = data;
    for(let j=0; j<path.length; j++){
        try {
            value = value[path[j]];
        } catch(err) {
            value = undefined;
        }
        if(value== undefined){
            value = "";
            break;
        }
    }
    return value;
}
function formatSettingsString(str, data) {
    let res_str = "";
    let tmp = str.split("{");
    for(let i=0; i<tmp.length; i++){
        if (tmp[i].indexOf('}') > -1){
            let tmp_list = tmp[i].split("}");
            let func = function (str) {
                return str
            };
            if (tmp_list[0].indexOf('date>') > -1){
                tmp_list[0] = tmp_list[0].split('date>')[1];
                func = function (str) {
                    return formatDate(str)
                };
            } else if (tmp_list[0].indexOf('listDict>') > -1){
                tmp_list[0] = tmp_list[0].split('listDict>')[1];
                let temp = tmp_list[0].split('[');
                tmp_list[0] = temp[0];
                let key = temp[1].split(']')[0];
                func = function (obj) {
                    for (let k=0; k<obj.length; k++){
                        if(obj[k]["key"]==key){
                            return obj[k]["value"]
                        }
                    }
                    return "";
                };

            }
            let value = getValueFromPath(tmp_list[0], data);
            res_str = res_str + func(value) + tmp_list[1];
        } else {
            res_str = res_str + tmp[i];
        }
    }
    return res_str;
}
function getDataValue(node) {
    if (settings["events"][node.meta.type]!=undefined){
        if (settings["events"][node.meta.type]["value"]!=undefined){
            return formatSettingsString(settings["events"][node.meta.type]["value"], node)
        }
    }
    return undefined;
}
function getIdentifierValue(node) {
    if (settings["events"][node.meta.type]!=undefined){
        if (settings["events"][node.meta.type]["identifier"]!=undefined){
            return formatSettingsString(settings["events"][node.meta.type]["identifier"], node)
        }
    }
    return undefined;
}

function convertStructureToJit(data) {
    let newStructure = [];
    for (let k in data['nodes']) {
        if (data['nodes'].hasOwnProperty(k)) {
            let tmp = {
                "data": {
                    // "$color": "#83548B",
                    // "$type": "circle",
                    // "$dim": 11
                },
                "id": k,
                "name": data['nodes'][k]['label'],
                "adjacencies": []
            };
            for (let l=0; l<data["edges"].length; l++){
                if(data["edges"][l]['from']==k){
                    tmp['adjacencies'].push({
                        "nodeTo": data["edges"][l]['to'],
                        "nodeFrom": k,
                        "data": {
                            // "$color": "#557EAA"
                        }
                    });
                }
            }
            newStructure.push(tmp);
        }
    }
    return {'start_time': data['start_time'], 'data': newStructure};
}
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(mongoDBUrl, function (err, db) {


    function decorateNode(data) {
        let s = [];
        let id = data.meta.type;
        let key = id;
        if (settings["events"][id]==undefined){
            key = "default";
        }
        s.push(formatSettingsString(settings["events"][key]["text"], data));
        let color = settings["events"][key]["color"]["default"];
        if (settings["events"][key]["color"]["path"]!=undefined) {
            let value = formatSettingsString(settings["events"][key]["color"]["path"], data);
            if (settings["events"][key]["color"]["values"][value]!=undefined) {
                color = settings["events"][key]["color"]["values"][value];
            }
        }
        s.push('fill: '+color);
        s.push(settings["events"][key]["shape"]);

        return s;
    }

    var recursive = 0;
    function makeGraphRecursive(startNode, g, preventCycles, callback) {
        if (preventCycles.indexOf(startNode.meta.id) > -1) {
            return;
        }
        let decorate = decorateNode(startNode);
        let key = startNode.meta.type;
        let ident = getIdentifierValue(startNode);
        if (ident!=undefined){
            key = key +"_"+ ident
        }
        g.nodes[startNode.meta.id]= {
            label: decorate[0],
            style: decorate[1],
            shape: decorate[2],
            time: new Date(startNode.meta.time),
            type: startNode.meta.type,
            identifier: key,
            value: getDataValue(startNode)
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
                            if(target == undefined) {
                                console.log(arrayGraphs[i].links[j].target);
                                continue
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
                for (let k in tmp['nodes']) {
                    if (tmp['nodes'].hasOwnProperty(k)) {
                        tmp['nodes'][k]['id'] = k;
                        count++;
                        if (tmp['nodes'][k]['time'].getTime()>endTime.getTime()){
                            endTime = tmp['nodes'][k]['time'];
                        }
                    }

                }
                tmp['end_time'] = endTime;
                tmp['node_count'] = count;
                tmp['edge_count'] = tmp["edges"].length;
                for (let l=0; l<tmp["edges"].length; l++){
                    tmp["edges"][l]["from_identifier"] = tmp['nodes'][tmp["edges"][l]['from']]["identifier"];
                    tmp["edges"][l]["to_identifier"] = tmp['nodes'][tmp["edges"][l]['to']]["identifier"];
                }
                tmp = convertStructureToJit(tmp);
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
