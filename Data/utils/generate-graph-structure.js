/**
 * Created by jonathan on 2017-01-29.
 */
"use strict";
let settingsParser = require('./settings-parser');

let getDataValue = settingsParser.getDataValue;
let getIdentifierValue = settingsParser.getIdentifierValue;
let decorateNode = settingsParser.decorateNode;

let recursive = 0;
function makeGraphRecursive(currentEvent, graph, preventCycles, settings, callback) {
    /**
     * Converts the eiffel structure to the structure cytoscape can handle.
     * This is performed by recursively iterating over the links elements removing links defined in the settings object
     * as disallowedLinks and links to events defined in the settings object as startEvent.
     * The new structure is stored in the second parameter graph.
     * Input:
     *   currentEvent: Current eiffel event.
     *   graph: Object for new structure.
     *   preventCycles: List of previously added nodes.
     *   settings: Settings object
     *   callback: Function called when no more recursions are left.
     */
    if (preventCycles.indexOf(currentEvent.meta.id) > -1) {  // Check if event is already added.
        return;
    }

    // Decorate and add event.
    let decorate = decorateNode(currentEvent, settings);
    let key = currentEvent.meta.type;
    let ident = getIdentifierValue(currentEvent, settings);
    if (ident!=undefined){
        key = key +"_"+ ident
    }
    graph.nodes.push({
        "data": {
            id: currentEvent.meta.id,
            label: decorate['label'],
            name: decorate['name'],
            color: decorate['color'],
            shape: decorate['shape'],
            shapeHeight: decorate['shapeHeight'],
            shapeWidth: decorate['shapeWidth'],
            time: new Date(currentEvent.meta.time),
            type: currentEvent.meta.type,
            identifier: key,
            value: getDataValue(currentEvent, settings)
        }
    });
    preventCycles.push(currentEvent.meta.id);

    // Add links and call the function recursively with next event in the
    for (let j = 0; j < currentEvent.nextActivities.length; j++) {
        //Skip all links that are disallowedLinks, (usually disallowed because they point back to earlier events).
        if (settings["disallowedLinks"].indexOf(currentEvent.nextActivities[j].type) > -1) {
            continue;
        }
        if (currentEvent.nextActivities[j].ref.meta.type == settings["startEvent"]) {  // Skip all start events except the first.
            let tmp = preventCycles.length == 1;
            if (!tmp) {
                continue;
            }

        }
        recursive++;
        graph.edges.push({
            "data": {
                id: currentEvent.meta.id+"_"+currentEvent.nextActivities[j].ref.meta.id,
                source: currentEvent.meta.id,
                target: currentEvent.nextActivities[j].ref.meta.id
            }
        });
        makeGraphRecursive(currentEvent.nextActivities[j].ref, graph, preventCycles, settings, callback);
        if (preventCycles.indexOf(currentEvent.nextActivities[j].ref.meta.id) > -1) {
            recursive--;
            if (recursive == 0){
                callback();
            }
        }
    }
}

function getElements(query, collection, settings, callback) {
    /**
     * Collects all eiffel events matching the query in the collection.
     * Adds a reference to the elements in the links list in the eiffel events.
     * Returns a list of all start events found.
     */

    let arrayGraphs = [];  // Temporary list of all events.
    let eventDict = {};  // key: value mapping between the id and the event
    let startEvents = [];  // list of all events matching the startEvent property in the settings object.
    collection.find(query).toArray(
        function (err, items) {
            // Find start events and populate the arrayGraphs and eventDict.
            for (let i = 0; i < items.length; i++) {  // Fetch the eiffel data into a list and dict for easy access.
                let tmp = items[i];
                tmp['nextActivities'] = [];
                arrayGraphs.push(tmp);
                eventDict[tmp.meta.id] = tmp;
                if (tmp.meta.type == settings["startEvent"]) {
                    startEvents.push(tmp);
                }
            }
            // Create references on the links.
            for (let i = 0; i < arrayGraphs.length; i++) {
                if (arrayGraphs[i].links != null) {
                    for (let j = 0; j < arrayGraphs[i].links.length; j++) {

                        let target = eventDict[arrayGraphs[i].links[j].target];
                        if(target == undefined) {
                            console.error(arrayGraphs[i].links[j].target);
                            continue;
                        }
                        arrayGraphs[i].links[j]['ref'] = target;
                        target.nextActivities.push({
                            'ref': arrayGraphs[i],
                            'target': arrayGraphs[i].meta.id,
                            'type': arrayGraphs[i].links[j].type
                        });
                    }
                }
            }
            callback(startEvents);
        }
    );
}

module.exports = {
    getElements: getElements,
    makeGraphRecursive: makeGraphRecursive
};