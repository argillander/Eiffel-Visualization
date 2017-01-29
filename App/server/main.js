import { Meteor } from 'meteor/meteor';
import { data_collection, start_times_collection, aggregation_collection } from '../lib/collections';

let graph_data = new Mongo.Collection('graph_data');

Meteor.startup(() => {
    // code to run on server at startup
    data_collection._ensureIndex({ "start_time": 1});
    cleanUp();  // Remove old sessions and data from those.
    Meteor.publish('data', function() {
        return data_collection.find({userId: this.userId});
    });
    Meteor.publish('graph_data_aggregation', function() {
        return aggregation_collection.find({});
    });
    Meteor.publish('start_times', function() {
        return start_times_collection.find({}, {sort: {'start_time': 1}});
    });
    Meteor.methods({
        collect_data: function (from, to, limit, skip, ref) {
            let search1 = {"userId": this.userId, "ref": ref};
            search1['start_time'] = {$gte: new Date(to)};
            data_collection.remove(search1);
            search1['start_time'] = {$lte: new Date(from)};
            data_collection.remove(search1);
            data_collection.remove({"userId": this.userId, "ref": ref, "limit": {$ne: limit}, "skip": {$ne: skip}});
            let tmp = graph_data.find({'start_time': {$gte: new Date(from), $lte: new Date(to)}}, {skip: skip, limit: limit, sort: {start_time: -1}}).fetch();

            for (let i = 0; i < tmp.length; i++) {
                tmp[i]['userId'] = this.userId;
                tmp[i]["ref"] = ref;
                tmp[i]["_id"] = tmp[i]["_id"] + ref;
                tmp[i]["limit"] = limit;
                tmp[i]["skip"] = skip;
                try {
                    data_collection.insert(tmp[i]);
                }
                catch (e){
                    if(e.code!=11000){
                        console.log(e);
                    }
                }
            }
            let res = data_collection.find({"userId": this.userId, "ref": ref, "limit": limit, "skip": skip, 'start_time': {$gte: new Date(from), $lte: new Date(to)}}, {skip: limit, limit: limit, sort: {start_time: -1}}).fetch();
            for (let j = 0; j < res.length; j++) {
                data_collection.remove({'_id': res[j]['_id']});
            }
            return graph_data.find({'start_time': {$gte: new Date(from), $lte: new Date(to)}}).count();
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
        data_collection.remove({userId: diff[i]});
        Meteor.guestUsers.remove({user_id: diff[i]});
    }
}

function user_diff (a1, a2) {
    let a = [], diff = [];
    for (let i = 0; i < a1.length; i++) {
        a[a1[i]['_id']] = true;
    }
    for (let i = 0; i < a2.length; i++) {
        if (a[a2[i]['_id']]) {
            delete a[a2[i]['_id']];
        }
    }
    for (let k in a) {
        diff.push(k);
    }
    return diff;
}
