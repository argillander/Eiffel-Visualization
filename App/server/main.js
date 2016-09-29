import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

Graphs = new Mongo.Collection('example2');	

if (Meteor.isServer) {
	//This code only runs on the server
	Meteor.publish('graphs', function tasksPublication() {
		return Graphs.find();
  }); 
}	