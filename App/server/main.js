import { Meteor } from 'meteor/meteor';
import Graphs from '../lib/collections';

Meteor.startup(() => {
  // code to run on server at startup
});
//
//
// Meteor.publish('graphs', function tasksPublication() {
// 	let tmp = Graphs.find();
// 	console.log(tmp);
// 	return tmp;
// });