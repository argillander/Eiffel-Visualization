/**
 * Created by jonathan on 2017-01-14.
 */

var cytoscape = require('cytoscape');

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
    return c;
}

class AggregateGraphs {

    static drawGraphs(data, agg_positions, container) {

        if (agg_positions.length!=1){
            // wait for positions to be received.
            return;
        }
        let tmp = agg_positions[0];
        container.append("<div id='cy' style='height: 50vh; width: 100vw;'></div>");
        let dict = {};
        for(let i=0; i<tmp['nodes'].length; i++){
            dict[tmp['nodes'][i]['data']['id']] = i;
            tmp['nodes'][i]['data']['count'] = {'default': {"color": tmp['nodes'][i]['data']['color']['default'], "nr": 0}, '_total': 0};
            if(tmp['nodes'][i]['data']['color']['values'] !== undefined){
                for (let k in tmp['nodes'][i]['data']['color']['values']){
                    if(tmp['nodes'][i]['data']['color']['values'].hasOwnProperty(k)){
                        tmp['nodes'][i]['data']['count'][k] = {"color": tmp['nodes'][i]['data']['color']['values'][k], "nr": 0};

                    }
                }
            }
        }

        for(let i=0; i<data.length; i++){
            for(let j=0; j<data[i]['nodes'].length; j++) {
                let k = "default";
                if ([undefined, null, ""].indexOf(data[i]['nodes'][j]['data']['value'])<0) {
                    k = data[i]['nodes'][j]['data']['value'];
                }
                tmp['nodes'][dict[data[i]['nodes'][j]['data']['identifier']]]['data']['count'][k]['nr'] += 1;
                tmp['nodes'][dict[data[i]['nodes'][j]['data']['identifier']]]['data']['count']['_total'] += 1;
            }
        }

        for(let i=0; i<tmp['nodes'].length; i++){
            let total = tmp['nodes'][i]['data']['count']['_total'];
            delete tmp['nodes'][i]['data']['count']['_total'];
            tmp['nodes'][i]['data']['bgcolor'] = setColor(tmp['nodes'][i]['data']['count'], total);

            tmp['nodes'][i]['data']['label'] += "\nTotal: " + total;
            for (let k in tmp['nodes'][i]['data']['count']){
                if(tmp['nodes'][i]['data']['count'].hasOwnProperty(k)){
                    if(k=="default"){
                        continue;
                    }
                    tmp['nodes'][i]['data']['label'] += "\n"+k+ ": " + tmp['nodes'][i]['data']['count'][k]["nr"];
                }
            }
        }

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
                nodes: agg_positions[0]['nodes'],
                edges: agg_positions[0]['edges']
            },

            layout: {name: 'preset', fit: true}
        });
    }
}

export default AggregateGraphs;