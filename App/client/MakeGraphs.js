
var dagD3Draw = require('dagre-d3'); // Library for drawing graph on canvas

class MakeGraphs {
    static makeGraph(gd) {

        let g = [];

        for (let i = 0; i < gd.length; i++) {
            g[i] = new dagD3Draw.graphlib.Graph().setGraph({});
            for (var k in gd[i]['nodes']) {
                if (gd[i]['nodes'].hasOwnProperty(k)) {
                    g[i].setNode(
                        k,
                        {label: gd[i]['nodes'][k]['label'], style: gd[i]['nodes'][k]['style'], shape: gd[i]['nodes'][k]['shape']}
                    );
                }

            }
            for (let j = 0; j < gd[i]['edges'].length; j++) {
                g[i].setEdge(gd[i]['edges'][j]['from'], gd[i]['edges'][j]['to'], {});
            }
        }
        return g;
    }
    static drawGraphs(myGraph, container, label) {

    let dagD3Draw = require('dagre-d3');

    // Renderer is used to draw and show final graph to user
    let renderer = new dagD3Draw.render();

    // Append the title
    container.append('<h3>' + label + '</h3>');

    for (let i = 0; i < myGraph.length; i++) {

        // Append graph to the div
        // Height of each graph can also be set from here
        container.append('<svg id="graph' + i + '" width="100%" height="50vh"> <g> </svg>');

        let svg = d3.select('#graph' + i);
        let inner = svg.select("g");

        // renderer.run(gr, inner); if graph is string use graphlib.parse(g) and then it to this function
        myGraph[i].graph().rankdir = "LR"; // Horizontal or vertical drawing property of graph
        myGraph[i].graph().ranksep = 30; // Horizontal size of the diplayed graph
        myGraph[i].graph().nodesep = 30; // Nodes' inter distances vertical
        // Draws the final aggregated graph
        renderer(inner, myGraph[i]);
        svgPanZoom('#graph' + i);
    }
}
}

export default MakeGraphs;