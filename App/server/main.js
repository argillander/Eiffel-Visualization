import { Meteor } from 'meteor/meteor';
import Graphs from '../lib/collections';

Graphs['example3'] = new Mongo.Collection('example3');
Graphs['clean_list'] = new Mongo.Collection('clean_list');

Meteor.startup(() => {
    // code to run on server at startup
    Graphs['data'].remove(); // TODO: Remove this when done changing th structure.
    cleanUp();  // Remove old sessions and data from those.
    Meteor.publish('data', function() {
        console.log(this.userId);
        return Graphs['data'].find({userId: this.userId});
    });
    Meteor.methods({
        collect_data: function (from, to, limit, skip, ref) {
            let search1 = {"userId": this.userId, "ref": ref, "limit": {$ne: limit}, "skip": {$ne: skip}};
            search1['start_time'] = {$gte: new Date(to)};
            Graphs['data'].remove(search1);
            search1['start_time'] = {$lte: new Date(from)};
            Graphs['data'].remove(search1);
            let tmp = Graphs['example3'].find({'start_time': {$gte: new Date(from), $lte: new Date(to)}}, {skip: skip, limit: limit}).fetch();
            for (let i = 0; i < tmp.length; i++) {
                tmp[i]['userId'] = this.userId;
                tmp[i]["ref"] = ref;
                tmp[i]["_id"] = tmp[i]["_id"] + ref;
                tmp[i]["limit"] = limit;
                tmp[i]["skip"] = skip;
                try {
                    Graphs['data'].insert(tmp[i]);
                }
                catch (e){
                    if(e.code!=11000){
                        raise(e);
                    }
                }
            }
            return Graphs['example3'].find({'start_time': {$gte: new Date(from), $lte: new Date(to)}}).count();
        }
    });
});

function cleanUp() {
    let users = Meteor.users.find({}, {fields: {'_id':1}}).fetch();
    let before = new Date();
    before.setHours(before.getHours()-24); // remove account older than 24h.
    Accounts.removeOldGuests(before);
    let users_left = Meteor.users.find({}, {fields: {'_id':1}}).fetch();
    let diff = user_diff(users, users_left);
    for (let i = 0; i < diff.length; i++) {
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
