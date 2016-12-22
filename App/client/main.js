import Graph from "./Graph";
Router.configure({
    layoutTemplate: 'Layout'
});
Router.route('/', function () {
    console.log("Landing");
    this.render('Landing', {});
});
Router.route('/graph', function () {
    console.log("Graph");
    this.render('Graph', {});
    Template.Graph.rendered=function(){ // Run this code when the elements are created
        Graph.mainFunc();
    };

});
Router.route('/(.*)', function () { //404
    console.log("404");
    this.render('404', {});
});
