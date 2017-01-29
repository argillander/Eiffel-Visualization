let cytoscape = require('cytoscape');

class MakeGraphs {
    static drawGraphs(data, container) {
        /**
         * Generates and renders a list of graphs into the provided container.
         *
         * Input:
         *   data:
         *     List of data elements
         *   container:
         *     Element to render graphs in.
         *
         */
        for (let i = 0; i < data.length; i++) {
            MakeGraphs.drawGraph(data[i], container)
        }
    }

    static drawGraph(data, container) {
        /**
         * Generates a single graph and renders it into the provided container.
         *
         * Input:
         *   data:
         *     Graph element
         *   container:
         *     Element to render graph in.
         *
         */

        // Add container to draw graph in with _id as is
        container.append("<div id='"+data['_id']+"' style='height: 50vh; width: 90vw;'></div>");
        // 50vh is half the window height and 90 vw is 90% of the window width

        // Generate the graph
        cytoscape({
            container: document.getElementById(data['_id']),
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
                nodes: data['nodes'],
                edges: data['edges']
            },

            layout: {name: 'preset', fit: true},
        });
    }

    static removeGraph(id, container) {
        /**
         * Remove a rendered graph in the container with the provided id.
         */
        container.find('#'+id).remove();
    }

}

export default MakeGraphs;