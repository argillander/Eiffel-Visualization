/**
 * Created by jonathan on 2017-01-29.
 */
"use strict";
let cytoscape = require('cytoscape');
let cydagre = require('cytoscape-dagre');
let dagre = require('dagre');
cydagre( cytoscape, dagre );

function positionNodes(graph, layout) {
    /**
     * Generate node coordinates for the graph.
     * Possible layouts are dagre and breadthfirst.
     */
    let layoutObject;
    if(layout=="dagre"){
        layoutObject = {
            name: 'dagre',
            rankDir: "LR",
            rankSep: 30,
            nodeSep: 30,
            fit: false
        };
    }
    if(layout=="breadthfirst"){
        layout = {
            name: 'breadthfirst',
            directed: true,
            roots: '#'+graph['root'],
            padding: 0,
            fit: false, // whether to fit the viewport to the graph
            circle: false, // put depths in concentric circles if true, put depths top down if false
            spacingFactor: 1, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
            maximalAdjustments: 0, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
            animate: false, // whether to transition the node positions
        };
    }

    let cy = cytoscape({
        container: undefined,
        elements: {
            nodes: graph['nodes'],
            edges: graph['edges']
        },
        layout: layoutObject
    });

    if(layout=="dagre"){
        cy.one('layoutstop', function(){
            cy.nodes().positions(function(i, n){
                let pos = n.position();
                return { x: 12*pos.x, y: 12*pos.y };
            });
        }).layout({name: 'preset'});
    }
    if(layout=="breadthfirst"){
        // Add some spacing between nodes and switch from vertical to horizontal
        cy.one('layoutstop', function(){
            cy.nodes().positions(function(i, n){
                let pos = n.position();
                return { x: 150*2*pos.y, y: 150*pos.x };
            });
        }).layout({name: 'preset'});
    }

    let nodes = cy.json()['elements']['nodes'];
    graph['nodes'] = [];
    for (let i = 0; i < nodes.length; i++) {
        graph['nodes'].push({data: nodes[i]['data'], position: nodes[i]['position']});
    }
    return graph;
}

module.exports = {
    positionNodes: positionNodes
};