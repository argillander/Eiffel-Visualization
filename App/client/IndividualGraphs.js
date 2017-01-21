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
            });
        }
    }
}

export default MakeGraphs;