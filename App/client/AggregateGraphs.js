/**
 * Created by jonathan on 2017-01-14.
 */

var dagD3Draw = require('dagre-d3'); // Library for drawing graph on canvas

class AggregateGraphs {
    static makeGraph(gd) {
        let events = {};
        let connections = [];
        for (let i = 0; i < gd.length; i++) {
            for (var k in gd[i]['nodes']) {
                if (gd[i]['nodes'].hasOwnProperty(k)) {
                    let key = gd[i]['nodes'][k].type;
                    if (gd[i]['nodes'][k]['identifier']!=undefined){
                        key = key +"_"+ gd[i]['nodes'][k]['identifier']
                    }
                    if (!events.hasOwnProperty(key)){
                        events[key] = {count: 1, values: [gd[i]['nodes'][k].value]}
                    } else {
                        events[key]['count'] += 1;
                        events[key]['values'].push(gd[i]['nodes'][k].value);
                    }
                }
            }
        }
        console.log(events)
    }
    static drawGraphs(myGraph, container, label) {

    }

}

export default AggregateGraphs;