/**
 * Created by jonathan on 2016-12-24.
 */
var mongoDBUrl = "mongodb://localhost:3001/meteor";
var startEvent = "EiffelSourceChangeCreatedEvent";
var disallowedLinks=['PREVIOUS_VERSION'];
var from_collection = "";
var to_collection = "";
var argv = require('minimist')(process.argv.slice(2));

if(argv['mongodb'] != undefined || argv['m'] != undefined){
    if(argv['mongodb'] != undefined){
        mongoDBUrl = argv['mongodb'];
    } else {
        mongoDBUrl = argv['m'];
    }
}
if(argv['type'] != undefined || argv['t'] != undefined){
    if(argv['type'] != undefined){
        startEvent = argv['type'];
    } else {
        startEvent = argv['t'];
    }
}
if(argv['disallowed-links'] != undefined || argv['d'] != undefined){
    if(argv['disallowed-links'] != undefined){
        disallowedLinks = argv['disallowed-links'].split(',');
    } else {
        disallowedLinks = argv['d'].split(',');
    }
}
if(argv['_'].length != 2){
    console.error("Wrong number of parameters, please read the help text below. \n");
    argv['h']=true;
} else {
    from_collection = argv['_'][0];
    to_collection = argv['_'][1];
}
if(argv['h']==true || argv['help']==true){
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
console.log(from_collection);
console.log(to_collection);
var MongoClient = require('mongodb').MongoClient;


MongoClient.connect(mongoDBUrl, function(err, db) {
//    db.collection('example1')
//     for (var i = 0; i < arr2.length; i++){
//         var o = arr2[i];
//         o['_id'] = o.meta.id;  // Use id as MongoDB id to prevent duplicated entries, since it is too easy to import the data twice... :)
//         try {
//             db.collection('example1').insertOne(o);
//             console.log('.');
//         } catch (e) {
//             console.log(e);
//         }
//     }
//     //console.log("Done");
//
});
