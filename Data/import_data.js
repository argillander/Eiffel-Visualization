/**
 * Script for importing events from a json file to a MongoDB collection.
 */
"use strict";
let MongoClient = require('mongodb').MongoClient;

let mongoDBUrl = "mongodb://localhost:3001/meteor";
let fs = require('fs');

let collection = "";
let file = "";
let argv = require('minimist')(process.argv.slice(2));

if (argv['mongodb'] != undefined || argv['m'] != undefined) {
    if (argv['mongodb'] != undefined) {
        mongoDBUrl = argv['mongodb'];
    } else {
        mongoDBUrl = argv['m'];
    }
}

if (argv['_'].length != 2) {
    console.error("Wrong number of parameters, please read the help text below. \n");
    argv['h'] = true;
} else {
    file = argv['_'][0];
    collection = argv['_'][1];
}
if (argv['h'] == true || argv['help'] == true) {
    console.log("Usage: node import_data.js [OPTIONS]... FILE DEST");
    console.log("Parses start nodes from a json FILE to a DESTination collection.\n");
    console.log("If the collection exists the content will be dropped.\n");
    console.log("The json file should be in utf8.\n");
    console.log("  -m, --mongodb           Mongodb url");
    console.log("  -h, --help              This help text");
    console.log("\n\nBy default:");
    console.log("  --mongodb=mongodb://localhost:3001/meteor");
    return;
}
console.log("Started to parse json file.");
let events = JSON.parse(fs.readFileSync(file, 'utf8'));
console.log("Done parsing json file.");

MongoClient.connect(mongoDBUrl, function(err, db) {
    let col;
    try {
        col = db.collection(collection);
    } catch (err){
        if(err=="TypeError: Cannot read property 'collection' of null"){
            console.log("Problem with reading collections. Check your settings.");
            console.log("You must have meteor running in the background!");
            return;
        }
    }
    col.drop();
    let ts = + new Date();
    console.log("Starting write to MongoDB.");
    process.stdout.write("" + ("       0").slice(-6) + "%\r");
    for (let i = 0; i < events.length; i++){
        let o = events[i];
        o['_id'] = o.meta.id;  // Use id as MongoDB id to prevent duplicated entries, since it is too easy to import the data twice... :)

        col.insertOne(o, function(err, result) {
            if(err != null){
                console.log(err);
            }
            if(ts+500 < + new Date()){
                ts = + new Date();
                process.stdout.write("" + ("      " + Math.floor((i/events.length)*1000)/10.0).slice(-6) + "%\r");
            }
            if(i+1 == events.length){
                console.log(("      100").slice(-6) + "%");
                console.log("\nAdded "+events.length + " entries");
                process.exit()
            }
        });
    }
});
