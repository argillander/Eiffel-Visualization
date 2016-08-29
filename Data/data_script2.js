//import './main.html';
//import './main.css';

var dot = require('graphlib-dot');
var MongoClient = require('mongodb').MongoClient;
var mongoDBUrl = "mongodb://localhost:3001/meteor";

insert_JSON();

function insert_JSON() {
	var arrayGraphs = "";
	// Connect using MongoClient
	MongoClient.connect(mongoDBUrl, function(err, db) {
		arrayGraphs = genGraphs(50, db);
	});
	return arrayGraphs;
}
// Generate number of graphs on given input 
function genGraphs(number, db){
	var gString = "";
	var g = "";
	var arrayGraphs = [];
	var codeChange = "";
    var contributor = "";
    var time = "";
	var mongoJsonDoc = "";
	var arrayMongoJson = [];
	
	for (var i=0; i<number; i++){
		
		gString = makeGraph();
		g = parseGraph(gString);
		codeChange = g.nodes()[2];
		contributor = g.node(codeChange).contributor
		time = parseInt(g.node(codeChange).time);

		mongoJsonDoc = {
			dot: gString,
			contributor: contributor,
			time: time
		};
		
		db.collection('mygraphs').insertOne(mongoJsonDoc);
		arrayMongoJson.push(mongoJsonDoc);
	}	
	return arrayMongoJson;
}

// Make a single graph of specific format 
function makeGraph(){
	
	// Select from options
	var arrayStatus = ['pass', 'fail'];
	var arrayContributers = ['Mohtashim', 'Ola', 'Kristian', 'Alfons', 'David'];
	
	// Data attributes with version numbers
	var rand_component = "Component_"+ genRandomNumber(5,1);	
	var rand_requirement = "Requirement_"+ genRandomNumber(20,1);
	var rand_codeChange = "Code_Change_"+ genRandomNumber(100,1);
	var rand_patchVerification = "Patch_Verfication_"+ genRandomNumber(100,1);
	var rand_codeReview = "Code_Review_"+ genRandomNumber(100,1);	
	var rand_build = "Build_"+ genRandomNumber(100,1);
	var rand_testCase_A = "Testcase_"+ genRandomNumber(5,1);
	var rand_testCase_B = "Testcase_"+ genRandomNumber(10,6);
	var rand_artifact = "Artifact_"+ genRandomNumber(100,1);	
	var rand_testCase_C = "Testcase_"+ genRandomNumber(15,11);
	var rand_testCase_D = "Testcase_"+ genRandomNumber(20,16);	
	var startDate = new Date('Wed Jun 01 2016 08:10:01'); //1464761401000
	var endDate = new Date('Wed Aug 31 2016 21:13:01');//1472670781000
    //var rand_date = genRandomDateTime(startDate, endDate);
	var confidence_level = "Confidence_Level";
	
	// Dependencies bewteen requirements
	var dependent_Req = "Requirement_"+genRandomNumber(20,1) +"dot"+ "Requirement_" +genRandomNumber(20,1);

	// Activities' names and their properties
	var ComponentData = ""+rand_component+" ["+ "time="+genRandomDateTime(startDate, endDate)+",type=component]\n";
	var requirementData = ""+rand_requirement+" ["+ "time="+genRandomDateTime(startDate, endDate)+",type=requirement,contributor="+pickRandomValue(arrayContributers)+",dependencies="+dependent_Req+"]\n";
	var codeChangeData = ""+rand_codeChange+" ["+ "time="+genRandomDateTime(startDate, endDate)+",type=code_change,contributor="+pickRandomValue(arrayContributers)+"]\n";
	var codeReviewData = ""+rand_codeReview+" ["+ "time="+genRandomDateTime(startDate, endDate)+",type=code_review,contributor="+pickRandomValue(arrayContributers)+", status=pass]\n";
	var patchVerificationData = ""+rand_patchVerification+" ["+ "time="+genRandomDateTime(startDate, endDate)+",type=patch_verification, status="+pickRandomValue(arrayStatus)+"]\n";
	var buildData = ""+rand_build+" ["+ "time="+genRandomDateTime(startDate, endDate)+",type=build, status=pass]\n";
	var artifactData = ""+rand_artifact+" ["+ "time="+genRandomDateTime(startDate, endDate)+",type=artifact]\n";	
	var testCaseAData = ""+rand_testCase_A+" ["+ "time="+genRandomDateTime(startDate, endDate)+",type=test_A, status="+pickRandomValue(arrayStatus)+"]\n";
	var testCaseBData = ""+rand_testCase_B+" ["+ "time="+genRandomDateTime(startDate, endDate)+",type=test_B, status="+pickRandomValue(arrayStatus)+"]\n";
	var confidenceLevelData = ""+confidence_level+" [type=confidence_level, value=0.4]\n";
	var testCaseCData = ""+rand_testCase_C+" ["+ "time="+genRandomDateTime(startDate, endDate)+",type=test_C, status="+pickRandomValue(arrayStatus)+"]\n";
	var testCaseDData = ""+rand_testCase_D+" ["+ "time="+genRandomDateTime(startDate, endDate)+",type=test_D, status="+pickRandomValue(arrayStatus)+"]\n";
	
	var edgeLabel = "[label=cause]";
	
	// Prepare the graph according to the format 
	var g = 'digraph {\n' +
	            '    '+ComponentData+
				'    '+requirementData+
				'    '+codeChangeData+
				'    '+codeReviewData+
				'    '+patchVerificationData+
				'    '+buildData+
				'    '+testCaseAData+
				'    '+testCaseBData+
				'    '+artifactData+				
				'    '+confidenceLevelData+
				'    '+testCaseCData+
				'    '+testCaseDData+
				'    '+rand_requirement+' -> '+rand_component+ ' '+edgeLabel+';\n' +
				'	 '+rand_codeChange+' -> '+rand_requirement+ ' '+edgeLabel+';\n' +
				'	 '+rand_patchVerification+' -> '+rand_codeChange+ ' '+edgeLabel+';\n' +	
				'	 '+rand_codeReview+' -> '+rand_codeChange+ ' '+edgeLabel+';\n' +
				'	 '+rand_build+' -> '+rand_codeReview+ ' '+edgeLabel+';\n' +
				'	 '+rand_build+' -> '+rand_patchVerification+ ' '+edgeLabel+';\n' +	
				'	 '+rand_testCase_A+' -> '+rand_build+ ' '+edgeLabel+';\n' +	
				'	 '+rand_testCase_B+' -> '+rand_build+ ' '+edgeLabel+';\n' +
				'	 '+rand_artifact+' -> '+rand_build+ ' '+edgeLabel+';\n' +				
				'	 '+confidence_level+' -> '+rand_testCase_A+ ' '+edgeLabel+';\n' +	
				'	 '+confidence_level+' -> '+rand_testCase_B+ ' '+edgeLabel+';\n' +
				'	 '+confidence_level+' -> '+rand_artifact+ ' [label=subject]'+';\n' +				
				'	 '+rand_testCase_C+' -> '+confidence_level+ ' '+edgeLabel+';\n' +
				'	 '+rand_testCase_D+' -> '+confidence_level+ ' '+edgeLabel+';\n' +		
				'    }'
	// Return Eiffel String format single graph
	return g;
}

// Pick random value from the given array
function pickRandomValue (myArray) {
	var randValue = myArray[Math.floor(Math.random() * myArray.length)];
	return randValue;
}
// Random number within specified range
function genRandomNumber (uR,lR){
	var randNum = Math.floor((Math.random() * uR) + lR);
	return randNum;
}
// Random datetime within given range
function genRandomDateTime (start, end){
	var date = new Date(+start + Math.random() * (end - start));
	return date.getTime();
}
// Read graph
function parseGraph(g) {
	var g = dot.read(g);
	return g;
}