"use strict";
var MongoClient = require('mongodb').MongoClient;

var mongoDBUrl = "mongodb://localhost:3001/meteor";
var fs = require('fs');

var collection = "";
var file = "";
var argv = require('minimist')(process.argv.slice(2));

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

var arr2 = JSON.parse(fs.readFileSync(file, 'utf8'));

MongoClient.connect(mongoDBUrl, function(err, db) {
    var col = db.collection(collection);
    col.drop();
    for (let i = 0; i < arr2.length; i++){
        var o = arr2[i];
        o['_id'] = o.meta.id;  // Use id as MongoDB id to prevent duplicated entries, since it is too easy to import the data twice... :)

        col.insert(o, function(err, result) {
            if(err != null){
                console.log(err);
            }
            process.stdout.write('.');
            if(i+1 == arr2.length){
                console.log("\nAdded "+arr2.length + " entries");
                process.exit()
            }
        });
    }

});
