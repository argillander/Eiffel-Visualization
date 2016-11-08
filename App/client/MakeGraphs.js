import Decorator from './Decorator';
var arrayEvents = [];
var dagD3Draw = require('dagre-d3'); // Library for drawing graph on canvas

class MakeGraphs {
    constructor(Graphs){
        this.graphs = Graphs;
    }

    getEventInfo(ID, arrayGraphs) {
    for (var i = 0; i < arrayGraphs.length; i++) {

        if (arrayGraphs[i].meta.id == ID) {

            if (arrayGraphs[i].links != null) {

                for (var j = 0; j < arrayGraphs[i].links.length; j++) {
                    arrayEvents.push(arrayGraphs[i].links[j].target);
                    this.getEventInfo(arrayGraphs[i].links[j].target, arrayGraphs);
                    break;  // WHY?!?!
                }
            }
        }
    }
}
    
    makeLinkedEvents(arrayGraphs) {

        var listTracibleEventIDs = [];

        for (var i = 0; i < arrayGraphs.length; i++) {

            if (arrayGraphs[i].meta.type == "EiffelSourceChangeCreatedEvent") {

                arrayEvents.push(arrayGraphs[i].meta.id);
                this.getEventInfo(arrayGraphs[i].meta.id, arrayGraphs);
            }
            if (arrayEvents.length != 0) {
                listTracibleEventIDs.push(arrayEvents);
                arrayEvents = [];
            }
        }

        return listTracibleEventIDs;

    }

    queryReturnDateRange(start, end) {
        return this.graphs.find({'meta.time': {$gte: start, $lte: end}}).fetch();
    }

    makeGraph(listTracibleEventIDs) {

        var g = [];
        var states = ["EiffelSourceChangeCreatedEvent", "EiffelSourceChangeSubmittedEvent", "EiffelArtifactCreatedEvent", "EiffelArtifactPublishedEvent",
            "EiffelTestSuiteStartedEvent", "EiffelTestSuiteFinishedEvent", "EiffelConfidenceLevelModifiedEvent"];

        for (var i = 0; i < listTracibleEventIDs.length; i++) {

            g[i] = new dagD3Draw.graphlib.Graph().setGraph({});

            for (var j = 0; j < listTracibleEventIDs[i].length; j++) {

                var query1 = this.graphs.find({'meta.id': listTracibleEventIDs[i][j]}).fetch();

                if (j != listTracibleEventIDs[i].length - 1) {

                    var query2 = this.graphs.find({'meta.id': listTracibleEventIDs[i][j + 1]}).fetch();
                    g[i].setEdge(query1[0].meta.type, query2[0].meta.type, {});
                }
                var decorate = Decorator.decorateNode(query1);
                g[i].setNode(query1[0].meta.type, {label: decorate[0], style: decorate[1], shape: decorate[2]});
            }
        }
        return g;
    }
}

export default MakeGraphs;