
class MakeGraphs {
    static drawGraphs(data, $container) {
        for (let m = 0; m < data.length; m++){
            let nodelist = [];
            for (let k in data[m]['nodes']){
                if (data[m]['nodes'].hasOwnProperty(k)) {
                    nodelist.push(data[m]['nodes'][k]);
                }
            }
            let nodes = new vis.DataSet(nodelist);
            let edges = new vis.DataSet(data[m]['edges']);

            // create a network
            $container.append('<div id="graph' + m + '" style="width: 100%; height: 50vh"></div>');

            let container = document.getElementById('graph' + m + '');
            // provide the data in the vis format
            let tmp = {
                nodes: nodes,
                edges: edges
            };
            let options = {
                layout:{
                    randomSeed:2,
                    improvedLayout: false,
                    // hierarchical: {
                    //     enabled: true,
                    //     parentCentralization: false,
                    //     direction: "LR",
                    //     sortMethod: "directed"
                    // }
                },
                physics: {
                    enabled: true
                },
            };

            // initialize your network!
            let network = new vis.Network(container, tmp, options);
        }
    }
}

export default MakeGraphs;