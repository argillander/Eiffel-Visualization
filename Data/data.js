var MongoClient = require('mongodb').MongoClient;
var mongoDBUrl = "mongodb://localhost:3001/meteor";
	
var mongoJsonDoc = {"employees":[
    {"firstName":"John", "lastName":"Doe"},
    {"firstName":"Anna", "lastName":"Smith"},
    {"firstName":"Peter", "lastName":"Jones"}
]};

MongoClient.connect(mongoDBUrl, function(err, db) {
	db.collection('example2').insertOne(mongoJsonDoc);	
});
