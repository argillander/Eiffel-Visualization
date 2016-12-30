import { Meteor } from 'meteor/meteor';
import Graphs from '../lib/collections';

Meteor.startup(() => {
    // code to run on server at startup
    cleanUp();  // Remove old sessions and data from those.
    Meteor.publish('books', function() {
        console.log(this.userId);
        return Graphs['books'].find({userId: this.userId});
    });
    Meteor.publish('graphs', function() {
        return Graphs['example3'].find({});
    });
    Meteor.methods({
        welcome: function (name) {
            if(name==undefined || name.length<=0) {
                throw new Meteor.Error(404, "Please enter your name");
            }
            Graphs['books'].remove({userId: this.userId});
            Graphs['books'].insert({userId: this.userId, title: "hej"});
            return "Welcome " + name;
        }
    });
});

function cleanUp() {
    var users = Meteor.users.find({}, {fields: {'_id':1}}).fetch();
    var before = new Date();
    before.setHours(before.getHours()-24); // remove account older than 24h.
    Accounts.removeOldGuests(before);
    var users_left = Meteor.users.find({}, {fields: {'_id':1}}).fetch();
    var diff = user_diff(users, users_left);
    for (var i = 0; i < diff.length; i++) {
        Graphs['books'].remove({userId: diff[i]});
        Meteor.guestUsers.remove({user_id: diff[i]});
    }

}

function user_diff (a1, a2) {
    var a = [], diff = [];
    for (var i = 0; i < a1.length; i++) {
        a[a1[i]['_id']] = true;
    }
    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]['_id']]) {
            delete a[a2[i]['_id']];
        }
    }
    for (var k in a) {
        diff.push(k);
    }
    return diff;
}
