var loadJSON = require("./utilities/ajax").loadJSON;

module.exports = function addSearch(Mentions) {
    Mentions.prototype.search = function search(qry, callback) {
        if (this.options.ajax) {
            this.ajaxSearch(qry, callback);
        }
        else {
            this.staticSearch(qry, callback);
        }
    };

    Mentions.prototype.staticSearch = function staticSearch(qry, callback) {
        qry = qry.replace("@", "");
        var data = this.options.choices.filter(function(choice) {
            // TODO - use case insensitive regexp
            return choice.name.toLowerCase().indexOf(qry.toLowerCase()) !== -1;
        });
        if (!callback) console.log("Warning! staticSearch was not provided a callback. It's probably definitely going to error after this message, you ding-dong.");
        callback.call(this, data);
    };

    Mentions.prototype.ajaxSearch = function ajaxSearch(qry, callback) {
        qry = qry.replace("@", "");
        var qryString = encodeURIComponent(this.options.ajax + "?" + this.options.queryParameter + "=" + qry);
        loadJSON(this.options.ajax, function(data) {
            console.log("Ajax success! Here's the data: ", data);
            if (callback) {
                callback(data);
            } else {
                console.log("Warning! No callback provided to ajax success...");
            }
        }.bind(this), function(error) {
            console.log("Loading json errored...", error);
        });
    };
};