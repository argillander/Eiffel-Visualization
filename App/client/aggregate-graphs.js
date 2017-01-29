/**
 * Created by jonathan on 2017-01-14.
 * File containing the code for the generation of the aggregation graph.
 *
 */

let cytoscape = require('cytoscape');
import { setColor } from '../lib/color';


class AggregateGraphs {

    static drawGraphs(data, agg_positions, container) {
        /**
         * Generates and renders an aggregated view over the elements in the 'data' parameter using the positions from
         *  the agg_positions variable in to the provided container.
         *
         *  OBS: agg_positions is modified in the function so its important to only provide a copy of the object.
         *
         * Input:
         *   data:
         *     List of data elements
         *   agg_positions:
         *     Objects containing the graph structure and positions to always get the same layout.
         *   container:
         *     Element to render graph in.
         *
         */

        // Add or empty the cy object in the container
        let $cy = $("#cy");
        if ($cy.length == 0) {
            container.append("<div id='cy' style='height: 50vh; width: 90vw;'></div>");
            // 50vh is half the window height and 90 vw is 90% of the window width
        } else {
            $cy.empty();
        }

        let dict = {};  // Dictionary for storing the node id as key and its index in the 'data' list as value.

        // Populates the 'dict' and sets up structure for counting number of
        // object with results to display on the nodes and to mix colors later.
        for(let i=0; i<agg_positions['nodes'].length; i++){
            dict[agg_positions['nodes'][i]['data']['id']] = i;
            agg_positions['nodes'][i]['data']['count'] = {
                'default': {
                    "color": agg_positions['nodes'][i]['data']['color']['default'],
                    "nr": 0
                },
                '_total': 0
            };
            if(agg_positions['nodes'][i]['data']['color']['values'] !== undefined){
                for (let k in agg_positions['nodes'][i]['data']['color']['values']){
                    if(agg_positions['nodes'][i]['data']['color']['values'].hasOwnProperty(k)){
                        agg_positions['nodes'][i]['data']['count'][k] = {
                            "color": agg_positions['nodes'][i]['data']['color']['values'][k],
                            "nr": 0
                        };
                    }
                }
            }
        }

        // Count the objects of each type and on result type.
        for(let i=0; i<data.length; i++){
            for(let j=0; j<data[i]['nodes'].length; j++) {
                let k = "default";
                if ([undefined, null, ""].indexOf(data[i]['nodes'][j]['data']['value'])<0) {
                    k = data[i]['nodes'][j]['data']['value'];
                }
                agg_positions['nodes'][dict[data[i]['nodes'][j]['data']['identifier']]]['data']['count'][k]['nr'] += 1;
                agg_positions['nodes'][dict[data[i]['nodes'][j]['data']['identifier']]]['data']['count']['_total'] += 1;
            }
        }

        for(let i=0; i<agg_positions['nodes'].length; i++){

            let total = agg_positions['nodes'][i]['data']['count']['_total'];

            // remove the total number from the dict so that it can be sent to set color.
            delete agg_positions['nodes'][i]['data']['count']['_total'];

            agg_positions['nodes'][i]['data']['bgcolor'] = setColor(agg_positions['nodes'][i]['data']['count'], total);

            // Set the label on the nodes
            agg_positions['nodes'][i]['data']['label'] += "\nTotal: " + total;
            for (let k in agg_positions['nodes'][i]['data']['count']){
                if(agg_positions['nodes'][i]['data']['count'].hasOwnProperty(k)){
                    if(k=="default"){
                        continue;
                    }
                    agg_positions['nodes'][i]['data']['label'] += "\n"+k+ ": " + agg_positions['nodes'][i]['data']['count'][k]["nr"];
                }
            }
        }

        // Generate the graph
        let cy = cytoscape({
            container: document.getElementById('cy'),
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
                    'background-color': 'data(bgcolor)',
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
                nodes: agg_positions['nodes'],
                edges: agg_positions['edges']
            },

            layout: {name: 'preset', fit: true}
        });
    }
}

export default AggregateGraphs;