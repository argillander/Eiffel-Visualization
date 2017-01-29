/**
 * Created by jonathan on 2017-01-29.
 */
"use strict";
function generateAggregated(graph_list, settings) {
    /**
     * Aggregate the graphs in graph_list using info from settings
     *
     */
    let events = {};  // Mapping used to only add a node one time
    let connections = {};  // Mapping used to only add a connection one time
    let elements = {'edges': [], 'nodes': []};

    if (graph_list.length>0 && graph_list[0]['nodes'].length>0){
        elements['root'] = graph_list[0]['nodes'][0]['data']['identifier'];
    }
    for (let i = 0; i < graph_list.length; i++) {
        // Add nodes grouped by identifier.
        for (let j = 0; j < graph_list[i]['nodes'].length; j++) {
            let key = graph_list[i]['nodes'][j]['data']['identifier'];
            if (!events.hasOwnProperty(key)){  // Add the node only once.
                events[key] = true;
                let id = graph_list[i]['nodes'][j]['data']['type'];
                if (settings["events"][id]==undefined){
                    id = "default";
                }

                elements['nodes'].push({"data": {
                    "id": key,
                    "label": graph_list[i]['nodes'][j]['data']['name'],
                    "color": settings["events"][id]["color"],
                    "shape": settings["events"][id]["shape"]["shape"],
                    "shapeHeight": settings["events"][id]["shape"]["height"],
                    "shapeWidth": settings["events"][id]["shape"]["width"]
                }});
            }
        }
        // Add all possible connections once.
        for (let j = 0; j < graph_list[i]['edges'].length; j++) {
            let key = graph_list[i]['edges'][j]['data']["from_identifier"] + "-" + graph_list[i]['edges'][j]['data']["to_identifier"];
            if (!connections.hasOwnProperty(key)) {  // Add the connection only once.
                connections[key] = true;
                elements['edges'].push({'data': {id: key, source: graph_list[i]['edges'][j]['data']["from_identifier"], target: graph_list[i]['edges'][j]['data']["to_identifier"]}});
            }
        }
    }
    return elements;
}

module.exports = {
    generateAggregated: generateAggregated
};
