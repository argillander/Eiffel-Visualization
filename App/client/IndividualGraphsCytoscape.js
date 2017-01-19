class MakeGraphs {
    static drawGraphs(data, container) {
        for (let i = 0; i < data.length; i++) {
            container.append("<div id='cy_"+i+"' style='height: 500px; width: 500px;'></div>");
            var cy = cytoscape({
                container: document.getElementById('cy_'+i),

                boxSelectionEnabled: false,
                autounselectify: true,

                style: cytoscape.stylesheet()
                    .selector('node')
                    .css({
                        'content': 'data(label)'
                    })
                    .selector('edge')
                    .css({
                        'target-arrow-shape': 'triangle',
                        'width': 10,
                        'line-color': '#ddd',
                        'target-arrow-color': '#ddd',
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

                layout: {
                    name: 'breadthfirst',
                    directed: true,
                    roots: '#'+data[i]['root'],
                    padding: 10
                }
            });

        }
    }
}

export default MakeGraphs;