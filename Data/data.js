"use strict";

var MongoClient = require('mongodb').MongoClient;
var mongoDBUrl = "mongodb://localhost:3001/meteor";

var fs = require('fs');
var arr2 = JSON.parse(fs.readFileSync("./Eiffel sample data file.txt", 'utf8'));

MongoClient.connect(mongoDBUrl, function(err, db) {
    db.collection('example4').drop();
    for (let i = 0; i < arr2.length; i++){
        var o = arr2[i];
        db.collection('example4').insertOne(o, function (err, data) {
            if(i+1 == arr2.length){
                console.log("Done");
                process.exit();
            }
        });
    }
});
