
class MakeGraphs {
    static drawGraphs(data, $container) {
        Math.seedrandom('my seed value');
        $container.append('<div id="center-container"></div><div id="right-container">');
        let $cc = $('#center-container');

        let ua = navigator.userAgent;
        let iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i);
        let typeOfCanvas = typeof HTMLCanvasElement;
        let nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function');
        let textSupport = nativeCanvasSupport && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
        let labelType = (!nativeCanvasSupport || (textSupport && !iStuff)) ? 'Native' : 'HTML';

        function init() {

            for (let m = 0; m < data.length; m++){
                $cc.append('<div id="infovis_'+ m + '" style="position:relative; width:90vw; height:50vh; margin:auto; overflow:hidden;"></div>');

                let fd = new $jit.ForceDirected({
                    injectInto: 'infovis_'+ m,

                    Navigation: {
                        enable: true,
                        //Enable panning events only if we're dragging the empty
                        //canvas (and not a node).
                        panning: 'avoid nodes',
                        zooming: 10 //zoom speed. higher is more sensible
                    },
                    Node: {
                        overridable: true,
                        align: "left"
                    },
                    Edge: {
                        overridable: true,
                        color: '#23A4FF',
                        lineWidth: 0.4
                    },
                    //Native canvas text styling
                    Label: {
                        type: labelType, //Native or HTML
                        size: 3,
                        style: 'bold',
                        color: '#000',
                    },
                    //Add Tips
                    Tips: {
                        enable: false,
                    },
                    // Add node events
                    Events: {
                        enable: false,
                    },
                    //Number of iterations for the FD algorithm
                    iterations: 20,
                    //Edge length
                    levelDistance: 130,
                    // Add text to the labels. This method is only triggered
                    // on label creation and only for DOM labels (not native canvas ones).
                    onCreateLabel: function (domElement, node) {
                        domElement.innerHTML = node.name;
                        var style = domElement.style;
                        style.fontSize = "0.8em";
                        style.color = "#ddd";
                    },
                    // Change node styles when DOM labels are placed
                    // or moved.
                    onPlaceLabel: function (domElement, node) {
                        var style = domElement.style;
                        var left = parseInt(style.left);
                        var top = parseInt(style.top);
                        var w = domElement.offsetWidth;
                        style.left = (left - w / 2) + 'px';
                        style.top = (top + 10) + 'px';
                        style.display = '';
                    }
                });
                // load JSON data.
                fd.loadJSON(data[m]['data']);
                // compute positions incrementally and animate.
                fd.computeIncremental({
                    iter: 20,
                    property: 'end',
                    onStep: function (perc) {
                        console.log(perc + '% loaded...');
                    },
                    onComplete: function () {
                        console.log('done');
                        fd.animate({
                            modes: ['linear'],
                            transition: $jit.Trans.Elastic.easeOut,
                            duration: 0
                        });
                    }
                });
                // end

            }
        }
        init();
    }
}

export default MakeGraphs;