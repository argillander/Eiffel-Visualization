var cytoscape = require('cytoscape');

class MakeGraphs {
    static drawGraphs(data, container) {
        for (let i = 0; i < data.length; i++) {
            // height: 50vh; width: 100vw;
            container.append("<div id='cy_"+i+"' style='height: 50vh; width: 100vw;'></div>");

            let cy = cytoscape({
                container: document.getElementById('cy_'+i),
                boxSelectionEnabled: false,
                autounselectify: true,
                style: cytoscape.stylesheet()
                    .selector('node')
                    .css({
                        'shape': 'data(shape)',
                        'height': 'data(shapeHeight)',
                        'width': 'data(shapeWidth)',
                        'border-color': '#000',
                        'border-width': 3,
                        'border-opacity': 0.5,
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'content': 'data(label)',
                        'color': '#000',
                        'font-size': 20,
                        'background-color': 'data(color)',
                        'min-zoomed-font-size': 3,
                        'text-wrap': "wrap"
                    })
                    .selector('edge')
                    .css({
                        'target-arrow-shape': 'triangle',
                        'width': 2,
                        'line-color': '#111',
                        'target-arrow-color': '#111',
                        'curve-style': 'bezier'
                    })
                    .selector('.highlighted')
                    .css({
                        'background-color': '#61bffc',
                        'line-color': '#61bffc',
                        'target-arrow-color': '#61bffc',
                        'transition-property': 'background-color, line-color, target-arrow-color',
                        'transition-duration': '0.5s'
                    }),

                elements: {
                    nodes: data[i]['nodes'],
                    edges: data[i]['edges']
                },

                layout: {name: 'preset', fit: true},
                // layout: {
                //     name: 'dagre',
                //     rankDir: "LR",
                //     rankSep: 30,
                //     nodeSep: 30,
                //     fit: true
                // },
            });

            // cy.one('layoutstop', function(){
            //     console.log("hej");
            //     cy.nodes().positions(function(i, n){
            //         let pos = n.position();
            //         //console.log(pos);
            //         return { x: Math.floor((Math.random() * 200) + 1)+2*pos.y, y: pos.x };
            //     });
            //
            //     //cy.fit(); // fit to new node positions
            // }).layout({name: 'preset'});

        }
    }

    static drawGraphsOld(data, container) {
        for (let i = 0; i < data.length; i++) {
            //container.append("<div id='cy_"+i+"' style='height: 50vh; width: 100vw;'></div>");
            //var btn = document.createElement("div");
            //console.log(JSON.stringify(document.getElementById('cy_'+i)));
            //btn.setAttribute("style", 'height: 100px; width: 100px;');
            let btn = $('<div></div>');
            //btn.x1=0;
            let cy = cytoscape({
                container: btn, //document.getElementById('cy_'+i),

                boxSelectionEnabled: false,
                autounselectify: true,

                style: cytoscape.stylesheet()
                    .selector('node')
                    .css({
                        'height': 300,
                        'width': 300,
                        'border-color': '#000',
                        'border-width': 3,
                        'border-opacity': 0.5,
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'content': 'data(label)',
                        'color': 'white',
                        'text-outline-width': 2,
                        'text-outline-color': '#888'
                    })
                    .selector('edge')
                    .css({
                        'target-arrow-shape': 'triangle',
                        'width': 2,
                        'line-color': '#111',
                        'target-arrow-color': '#111',
                        'curve-style': 'bezier'
                    })
                    .selector('.highlighted')
                    .css({
                        'background-color': '#61bffc',
                        'line-color': '#61bffc',
                        'target-arrow-color': '#61bffc',
                        'transition-property': 'background-color, line-color, target-arrow-color',
                        'transition-duration': '0.5s'
                    }),

                elements: data[i]['data'],

                // layout: {
                //     name: 'breadthfirst',
                //     directed: true,
                //     roots: '#'+data[i]['root'],
                //     padding: 0,
                //     fit: false, // whether to fit the viewport to the graph
                //     circle: false, // put depths in concentric circles if true, put depths top down if false
                //     spacingFactor: 1, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
                //     maximalAdjustments: 0, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
                //     animate: false, // whether to transition the node positions
                // },
                layout: {
                    name: 'dagre',
                    rankDir: "LR",
                    rankSep: 30,
                    nodeSep: 30
                },
            });
            // cy.one('layoutstop', function(){
            //     cy.nodes().positions(function(i, n){
            //         let pos = n.position();
            //         console.log(pos);
            //         return { x: Math.floor((Math.random() * 200) + 1)+2*pos.y, y: pos.x };
            //     });
            //
            //     cy.fit(); // fit to new node positions
            // }).layout({name: 'preset'});
            console.log(cy)
        }
    }
}

export default MakeGraphs;