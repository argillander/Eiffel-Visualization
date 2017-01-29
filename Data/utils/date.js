/**
 * Created by jonathan on 2017-01-20.
 */
"use strict";
module.exports = {
    formatDate: function (date) {
        /**
         * Formats a date to the form "YYYY-MM-DD hh:mm:ss"
         */
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
};