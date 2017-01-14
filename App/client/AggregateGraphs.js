/**
 * Created by jonathan on 2017-01-14.
 */

var dagD3Draw = require('dagre-d3'); // Library for drawing graph on canvas
function setColor(color, total) {
    let c = "#";
    for(let i = 0; i<3; i++) {
        let col = 0.0;
        for (let j in color) {
            if (color.hasOwnProperty(j)) {
                col += parseInt(color[j]['color'].substring(1+2*i, 3+2*i), 16)*(color[j]['nr']/total);
            }
        }
        let v = Math.floor(col);
        let sub = v.toString(16).toUpperCase();
        c += ('0'+sub).slice(-2);
    }
    return "fill: " + c;
}
class AggregateGraphs {
    static makeGraph(gd) {
        let events = {};
        let connections = {};
        for (let i = 0; i < gd.length; i++) {
            for (let k in gd[i]['nodes']) {
                if (gd[i]['nodes'].hasOwnProperty(k)) {
                    let key = gd[i]['nodes'][k]['identifier'];
                    if (!events.hasOwnProperty(key)){
                        events[key] = {"count": 1, "values": {}, "default_color": gd[i]['nodes'][k]['style'], "color": {}};
                        if (gd[i]['nodes'][k].value != undefined){
                            events[key]["values"][gd[i]['nodes'][k].value] = 1;
                            events[key]["color"][gd[i]['nodes'][k].value] = gd[i]['nodes'][k]['style'];
                        }

                    } else {
                        events[key]['count'] += 1;
                        if (gd[i]['nodes'][k].value != undefined){
                            if (events[key]["values"][gd[i]['nodes'][k].value] == undefined){
                                events[key]["values"][gd[i]['nodes'][k].value] = 1;
                                events[key]["color"][gd[i]['nodes'][k].value] = gd[i]['nodes'][k]['style'];
                            } else {
                                events[key]["values"][gd[i]['nodes'][k].value] += 1;
                            }
                        }
                    }
                }
            }
            for (let j = 0; j < gd[i]['edges'].length; j++) {
                let key = gd[i]['edges'][j]["from_identifier"] + "-" + gd[i]['edges'][j]["to_identifier"];
                if (!connections.hasOwnProperty(key)) {
                    connections[key] = {count: 1, from: gd[i]['edges'][j]["from_identifier"], to: gd[i]['edges'][j]["to_identifier"]}
                } else {
                    connections[key]['count'] += 1;
                }
            }
        }
        g = new dagD3Draw.graphlib.Graph().setGraph({});
        for (let k in events) {
            if (events.hasOwnProperty(k)) {
                let l = "";
                let total = 0;
                let colors = {};
                let use_default = true;
                let default_color = events[k]['default_color'];
                for (let v in events[k]['values']) {
                    use_default = false;
                    if (events[k]['values'].hasOwnProperty(v)) {
                        l = l + v + ": " + events[k]['values'][v] + "\n";
                        total += events[k]['values'][v];
                        if (events[k]['color'][v]!=undefined){
                            colors[v] = {"color": events[k]['color'][v].split("fill: ")[1], "nr": events[k]['values'][v]};
                        }
                    }
                }
                let color;
                if (use_default){
                    color = default_color;
                } else {
                    color = setColor(colors, total);
                }

                g.setNode(k, {label: k + "\n" + events[k]["count"]+"\n"+l, style: color, shape: "circle"});
            }
        }
        for (let k in connections) {
            g.setEdge(connections[k]['from'], connections[k]['to'], {label: connections[k]["count"]});
        }
        return g;
    }
    static drawGraphs(myGraph, container, label) {
        let dagD3Draw = require('dagre-d3');

        // Renderer is used to draw and show final graph to user
        let renderer = new dagD3Draw.render();

        // Append the title
        container.append('<h3>' + label + '</h3>');

        container.append('<svg id="graph" width="80%" height="100vh"> <g> </svg>');

        let svg = d3.select('#graph');
        let inner = svg.select("g");

        myGraph.graph().rankdir = "LR"; // Horizontal or vertical drawing property of graph
        myGraph.graph().ranksep = 30; // Horizontal size of the diplayed graph
        myGraph.graph().nodesep = 30; // Nodes' inter distances vertical

        renderer(inner, myGraph);
        try {
            svgPanZoom('#graph');
        } catch (e){}


    }

}

export default AggregateGraphs;