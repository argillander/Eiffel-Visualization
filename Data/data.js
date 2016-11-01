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
// var arr = JSON.parse(fs.readFileSync(basePath+'confidence-level-joining/events.json', 'utf8'));
var arr2 = JSON.parse(fs.readFileSync("./Eiffel sample data file.txt", 'utf8'));

MongoClient.connect(mongoDBUrl, function(err, db) {
    for (var i = 0; i < arr2.length; i++){
        var o = arr2[i];
        db.collection('example2').insertOne(o);
    }
    console.log("Done");
});
