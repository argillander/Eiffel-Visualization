class Decorator {
    constructor() {
    }

    static decorateNode(data) {
        let s = [];
        let id = data.meta.type;

        if (id === "EiffelSourceChangeCreatedEvent") { // If node is of 'EiffelSourceChangeCreatedEvent' type, set shape, style and label of the node accordingly
            s.push("Changes Created" + "\n" + data.meta.version + "\n" + Decorator.formatDate(data.meta.time) + "\n" + data.data.author.name + "\n" + data.data.author.group);
            s.push('fill: #66FF66');
            s.push('circle');
        }
        else if (id === "EiffelSourceChangeSubmittedEvent") { // Set properties according to the node types
            s.push("Changes Submitted" + "\n" + data.meta.version + "\n" + Decorator.formatDate(data.meta.time) + "\n" + data.data.submitter.name + "\n" + data.data.submitter.group);
            s.push('fill: #66FF66');
            s.push('circle');
        }
        else if (id === "EiffelArtifactCreatedEvent") { // Set properties according to the node types
            s.push("Artifact Created" + "\n" + data.meta.version + "\n" + Decorator.formatDate(data.meta.time));
            s.push('fill: #66FF66');
            s.push('circle');
        }
        else if (id === "EiffelArtifactPublishedEvent") { // Set properties according to the node types
            s.push("Artifact Published" + "\n" + data.meta.version + "\n" + Decorator.formatDate(data.meta.time));
            s.push('fill: #66FF66');
            s.push('circle');
        }
        else if (id === "EiffelTestSuiteStartedEvent") { // Set properties according to the node types
            s.push("Test Suite Started" + "\n" + data.meta.version + "\n" + Decorator.formatDate(data.meta.time) + "\n" + data.data.name);
            s.push('fill: #66FF66');
            s.push('circle');
        }
        else if (id === "EiffelTestSuiteFinishedEvent") { // Set properties according to the node types
            s.push("Test Suite Finished" + "\n" + data.meta.version + "\n" + Decorator.formatDate(data.meta.time) + "\n" + data.data.outcome.verdict);
            if (data.data.outcome.verdict == "PASSED") {
                s.push('fill: #66FF66');
            }
            else {
                s.push('fill: #FF0000');
            }
            s.push('circle');
        }
        else if (id === "EiffelConfidenceLevelModifiedEvent") { // Set properties according to the node types
            s.push("Confidence Level" + "\n" + data.meta.version + "\n" + Decorator.formatDate(data.meta.time) + "\n" + data.data.name + "\n" + data.data.value);
            if (data.data.name == "stable") {
                s.push('fill: #66FF66');
            }
            else {
                s.push('fill: #FF0000');
            }
            s.push('circle');
        }
        else {
            s.push(id);
            s.push('fill: #66FF66');

            s.push('circle');
        }
        return s;
    }

    static formatDate(date) {
        date = new Date(date);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        if (day < 10) {
            day = "0" + day;
        }
        if (month < 10) {
            month = "0" + month;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    }
}
export default Decorator;
