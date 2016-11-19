import Decorator from './Decorator';

var dagD3Draw = require('dagre-d3'); // Library for drawing graph on canvas

class MakeGraphs {
    constructor(Graphs) {
        this.graphs = Graphs;
        this.acceptedEventTypes = [
            'BASE',
            'CHANGE',
            'ELEMENT',
            "COMPOSITION",
            "CAUSE",
            "CONTEXT"
        ];
    }
    makeGraphRecursive(startNode, g, preventCycles){
        if (preventCycles.indexOf(startNode.meta.id) > -1){
            return;
        }
        let decorate = Decorator.decorateNode(startNode);
        g.setNode(
            startNode.meta.type,
            {label: decorate[0], style: decorate[1], shape: decorate[2]}
        );
        preventCycles.push(startNode.meta.id);
        for (let j = 0; j < startNode.nextActivities.length; j++) {
            //if( this.acceptedEventTypes.indexOf(startNode.nextActivities[j].type) > -1){  // Only use accepted types.
                g.setEdge(startNode.meta.type, startNode.nextActivities[j].ref.meta.type, {});

                this.makeGraphRecursive(startNode.nextActivities[j].ref, g, preventCycles);
            //}
        }
    }
    makeGraph(gd) {

        let g = [];

        for (let i = 0; i < gd.getStartEvents().length; i++) {
            let startNode = gd.getStartEvents()[i];
            g[i] = new dagD3Draw.graphlib.Graph().setGraph({});
            let preventCycles = [];
            this.makeGraphRecursive(startNode, g[i], preventCycles);
        }
        return g;
    }
}

export default MakeGraphs;