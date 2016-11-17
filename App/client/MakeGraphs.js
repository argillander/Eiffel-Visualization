import Decorator from './Decorator';

var dagD3Draw = require('dagre-d3'); // Library for drawing graph on canvas

class MakeGraphs {
    constructor(Graphs) {
        this.graphs = Graphs;
    }

    getEventInfo(ID, arrayGraphs, arrayEvents) {
        /**
            Build chain recursively.
         */
        for (let i = 0; i < arrayGraphs.length; i++) {
            if (arrayGraphs[i].links != null) {
                for (let j = 0; j < arrayGraphs[i].links.length; j++) {
                    if(arrayGraphs[i].links[j].target === ID){
                        arrayEvents.push(arrayGraphs[i].links[j].target);
                        this.getEventInfo(arrayGraphs[i].meta.id, arrayGraphs, arrayEvents);
                    }
                }
            }
        }
    }

    makeLinkedEvents(arrayGraphs) {
        /**
         * Generate a list of lists that are the chains for the flow
         */
        let listTraceableEventIDs = [];
        let arrayEvents = [];
        for (let i = 0; i < arrayGraphs.length; i++) {
            if (arrayGraphs[i].meta.type == "EiffelSourceChangeCreatedEvent") { // first node in flow
                arrayEvents.push(arrayGraphs[i].meta.id);
                this.getEventInfo(arrayGraphs[i].meta.id, arrayGraphs, arrayEvents);
            }
            if (arrayEvents.length != 0) {
                // add chain to listTraceableEventIDs and reset chain
                listTraceableEventIDs.push(arrayEvents);
                arrayEvents = [];
            }
        }

        return listTraceableEventIDs;
    }

    queryReturnDateRange(start, end) {
        return this.graphs.find({'meta.time': {$gte: start, $lte: end}}).fetch();
    }

    makeGraph(listTracibleEventIDs) {

        let g = [];
        let states = ["EiffelSourceChangeCreatedEvent", "EiffelSourceChangeSubmittedEvent", "EiffelArtifactCreatedEvent", "EiffelArtifactPublishedEvent",
            "EiffelTestSuiteStartedEvent", "EiffelTestSuiteFinishedEvent", "EiffelConfidenceLevelModifiedEvent"];

        for (let i = 0; i < listTracibleEventIDs.length; i++) {

            g[i] = new dagD3Draw.graphlib.Graph().setGraph({});

            for (let j = 0; j < listTracibleEventIDs[i].length; j++) {

                let query1 = this.graphs.find({'meta.id': listTracibleEventIDs[i][j]}).fetch();

                if (j != listTracibleEventIDs[i].length - 1) {

                    let query2 = this.graphs.find({'meta.id': listTracibleEventIDs[i][j + 1]}).fetch();
                    g[i].setEdge(query1[0].meta.type, query2[0].meta.type, {});
                }
                let decorate = Decorator.decorateNode(query1);
                g[i].setNode(query1[0].meta.type, {label: decorate[0], style: decorate[1], shape: decorate[2]});
            }
        }
        return g;
    }
}

export default MakeGraphs;