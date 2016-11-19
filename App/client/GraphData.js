/**
 * Created by jonathan on 2016-11-19.
 */
class GraphData{
    constructor(Graphs){
        /**
         * Construct a Graph data element and initialize an empty data set.
         */
        this.arrayGraphs = []; // array to store parsed Eiffel graphs
        this.len = 0;
        this.eventDict = {};
        this.graphs = Graphs;
        this.startEvents = [];
        // Data types to model. Not used right now.
        this.startEvent = "EiffelSourceChangeCreatedEvent";
        this.acceptedEvents = [
            "EiffelSourceChangeCreatedEvent",
            "EiffelSourceChangeSubmittedEvent",
            "EiffelArtifactCreatedEvent",
            "EiffelArtifactPublishedEvent",
            "EiffelTestSuiteStartedEvent",
            "EiffelTestSuiteFinishedEvent",
            "EiffelConfidenceLevelModifiedEvent"
        ];

    }

    getStartEvents(){
        return this.startEvents;
    }

    getDateRange(start, end) {
        /**
         * Update the data set with data between to timestamps.
         */
        this.getData({'meta.time': {$gte: start, $lte: end}});
    }

    getData(query={}){
        /**
         * Update the data set with data matching a mongodb query, or all data.
         * The only function that shall be talking to mongodb to don't fuck up the data.
         */
        // Clear any old data from the data set.
        this.arrayGraphs = [];
        this.eventDict = {};
        this.startEvents = [];
        let dbData = this.graphs.find(query);  // Query for new data

        this.len = dbData.fetch().length;  // Number of records
        for (let i = 0; i < this.len; i++) {  // Fetch the eiffel data into a list and dict for easy access.
            let tmp = dbData.fetch()[i];
            tmp['nextActivities'] = [];
            this.arrayGraphs.push(tmp);
            this.eventDict[tmp.meta.id] = tmp;
            if(tmp.meta.type == this.startEvent){
                this.startEvents.push(tmp);
            }
        }
        this._linkEvents();
    }

    _linkEvents(){
        /**
         * Internal function for creating links between the objects in a newly collected data set.
         */
        for (let i = 0; i < this.arrayGraphs.length; i++) {
            if (this.arrayGraphs[i].links != null) {
                for (let j = 0; j < this.arrayGraphs[i].links.length; j++) {
                    let target = this.eventDict[this.arrayGraphs[i].links[j].target];
                    this.arrayGraphs[i].links[j]['ref'] = target;
                    target.nextActivities.push({
                        'ref':this.arrayGraphs[i],
                        'target':this.arrayGraphs[i].meta.id,
                        'type': this.arrayGraphs[i].links[j].type
                    });
                }
            }
        }
    }

}
export default GraphData;