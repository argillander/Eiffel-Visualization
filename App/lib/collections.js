/**
 * Created by jonathan on 2016-12-18.
 */
let data_collection = new Mongo.Collection('data');
let start_times_collection = new Mongo.Collection('start_times');
let aggregation_collection = new Mongo.Collection('graph_data_agg');
export { data_collection, start_times_collection, aggregation_collection };