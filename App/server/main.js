import { Meteor } from 'meteor/meteor';
import Graphs from '../lib/collections';

Graphs['example3'] = new Mongo.Collection('example3');

Meteor.startup(() => {
    // code to run on server at startup
    cleanUp();  // Remove old sessions and data from those.
    Meteor.publish('data', function() {
        console.log(this.userId);
        return Graphs['data'].find({userId: this.userId});
    });
    Meteor.methods({
        collect_data: function (from, to) {
            Graphs['data'].remove({userId: this.userId});
            var tmp = Graphs['example3'].find({'start_time': {$gte: new Date(from), $lte: new Date(to)}}, {skip: 0, limit: 20}).fetch();
            for (var i = 0; i < tmp.length; i++) {
                tmp[i]['userId'] = this.userId;
                Graphs['data'].insert(tmp[i]);
            }
            return Graphs['example3'].find({'start_time': {$gte: new Date(from), $lte: new Date(to)}}).count();
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
        Graphs['data'].remove({userId: diff[i]});
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
