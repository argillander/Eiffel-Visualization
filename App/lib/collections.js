/**
 * Created by jonathan on 2016-12-18.
 */
var Graphs = {};
Graphs['data'] = new Mongo.Collection('data');
Graphs['graph_data_agg'] = new Mongo.Collection('graph_data_agg');
export default Graphs;