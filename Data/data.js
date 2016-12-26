var MongoClient = require('mongodb').MongoClient;
var mongoDBUrl = "mongodb://localhost:3001/meteor";
	
// var mongoJsonDoc = {"employees":[
//     {"firstName":"John", "lastName":"Doe"},
//     {"firstName":"Anna", "lastName":"Smith"},
//     {"firstName":"Peter", "lastName":"Jones"}
// ]};
//
// MongoClient.connect(mongoDBUrl, function(err, db) {
// 	db.collection('example2').insertOne(mongoJsonDoc);
// });


var fs = require('fs');
// var arr2 = JSON.parse(fs.readFileSync('./confidence-level-joining.json', 'utf8'));
// var arr2 = JSON.parse(fs.readFileSync("./Eiffel sample data file.json", 'utf8'));
var arr2 = JSON.parse(fs.readFileSync("./generated_eiffel_events.json", 'utf8'));
//var arr2 = JSON.parse(fs.readFileSync("./events.json", 'utf8'));

MongoClient.connect(mongoDBUrl, function(err, db) {
    for (var i = 0; i < arr2.length; i++){
        var o = arr2[i];
        o['_id'] = o.meta.id;  // Use id as MongoDB id to prevent duplicated entries, since it is too easy to import the data twice... :)
        try {
            db.collection('example3').insertOne(o);
            console.log('.');
        } catch (e) {
            console.log(e);
        }
    }
    //console.log("Done");

});
