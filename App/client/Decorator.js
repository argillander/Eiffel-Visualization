Decorator = function(){
}

var deco = new Decorator();
Decorator.prototype.decorateNode = function (data){
	var s = [];
	var id = data[0].meta.type;
	
	if (id === "EiffelSourceChangeCreatedEvent"){ // If node is of 'EiffelSourceChangeCreatedEvent' type, set shape, style and label of the node accordingly
		s.push("Changes Created" +"\n"+ data[0].meta.version +"\n" + deco.formatDate(data[0].meta.time) + "\n" + data[0].data.author.name + "\n" + data[0].data.author.group);
		s.push('fill: #66FF66');
		s.push('circle');
	}
	else if (id === "EiffelSourceChangeSubmittedEvent"){ // Set properties according to the node types
		s.push("Changes Submitted" +"\n"+ data[0].meta.version +"\n" + deco.formatDate(data[0].meta.time) + "\n" + data[0].data.submitter.name + "\n" + data[0].data.submitter.group);
		s.push('fill: #66FF66');
		s.push('circle');
	}
	else if (id === "EiffelArtifactCreatedEvent"){ // Set properties according to the node types
		s.push("Artifact Created" +"\n"+ data[0].meta.version +"\n" + deco.formatDate(data[0].meta.time));
		s.push('fill: #66FF66');
		s.push('circle');		
	}
	else if (id === "EiffelArtifactPublishedEvent"){ // Set properties according to the node types
		s.push("Artifact Published" +"\n"+ data[0].meta.version +"\n" + deco.formatDate(data[0].meta.time));
		s.push('fill: #66FF66');
		s.push('circle');		
	}		
	else if (id === "EiffelTestSuiteStartedEvent"){ // Set properties according to the node types
		s.push("Test Suite Started" +"\n"+ data[0].meta.version +"\n" + deco.formatDate(data[0].meta.time) + "\n" + data[0].data.name);
		s.push('fill: #66FF66');
		s.push('circle');		
	}		
	else if (id === "EiffelTestSuiteFinishedEvent"){ // Set properties according to the node types
		s.push("Test Suite Finished" +"\n"+ data[0].meta.version +"\n" + deco.formatDate(data[0].meta.time) + "\n" + data[0].data.outcome.verdict);
		if (data[0].data.outcome.verdict == "PASSED"){
			s.push('fill: #66FF66');			
		}
		else{
			s.push('fill: #FF0000');			
		}
		s.push('circle');		
	}		
	else if (id === "EiffelConfidenceLevelModifiedEvent"){ // Set properties according to the node types
		s.push("Confidence Level" +"\n"+ data[0].meta.version +"\n" + deco.formatDate(data[0].meta.time) + "\n" + data[0].data.name + "\n" + data[0].data.value);
		if (data[0].data.name == "stable"){
			s.push('fill: #66FF66');			
		}
		else{
			s.push('fill: #FF0000');			
		}
		s.push('circle');		
	}	
	return s;
};

// Formats the date to a particular format 
Decorator.prototype.formatDate = function(date){
	date = new Date (date);
	var day = date.getDate();
	var month = date.getMonth()+1;
	var year = date.getFullYear();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
			
	if(day<10){
		day = "0"+day;
	}
	if(month<10){
		month = "0"+month;
	}
	if(hours<10){
		hours = "0"+hours;
	}
	if(minutes<10){
		minutes = "0"+minutes;
	}	
	if(seconds<10){
		seconds = "0"+seconds;
	}	
	
	return year +"-"+ month +"-"+ day +" "+ hours +":"+ minutes +":"+ seconds;  	
};