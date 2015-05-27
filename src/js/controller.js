var loadJSON = require("./utilities/ajax").loadJSON,
    escapeRegExp = require("./utilities/regexp").escapeRegExp;

module.exports = {
    Controller: Controller,
    AJAXController: AJAXController,
};

/**
 * @callback searchCallback
 * @param {Object[]} data - An array of objects that represent possible matches to data. The data are mapped over a formatter to provide a consistent interface.
 */


/**
 * @constructor
 */
function Controller(formatter, view, options) {
    this.format = formatter;
    this.view = view;
    this.data = options.data;
}

/**
 * @method
 * @param {string} qry
 * @param {searchCallback} callback - Probably unnecessary...
 */
Controller.prototype.search = function search(qry, callback) {
    var data = this.data.filter(function(d) {
        var qryRE = new RegExp(escapeRegExp(qry), "i");
        return qryRE.test(d.name);
    });
    this.view.render(data);
};

/**
 * @constructor
 */
function AJAXController(formatter, view, options) {
    this.path = options.path;
    this.queryParameter = options.queryParameter;

    this._latestCall = null;
}
AJAXController.prototype = Object.create(Controller.prototype);

/**
 * @method
 * @param {string} qry
 * @param {searchCallback} callback - Callback that handles returned JSON data
 */
AJAXController.prototype.search = function search(qry, callback) {

    if (this._latestCall) this.latest.abort();  // caches ajax calls so we can cancel them as the input is updated
    var qryString = this.path +
                     "?" + this.queryParameter +
                     "=" + encodeURIComponent(qry);

    this._latestCall = loadJSON(qryString, this._callback.bind(this), ajaxError);
};

AJAXController.prototype._callback = function(data) {
    this.view.render(data.map(this.formatter));
};










/**
 * Renders possible matches into the popover. TODO - this should simply pass data to the view and let it sort shit out.
 * @method
 */
Controller.prototype.renderCurrentChoices = function renderCurrentChoices(data) {
    var noMatchFoundMessage;
    if (data && data.length > 0) {
        this.render(data);
    }
    else {
        // render helpful message about nothing matching so far...
        noMatchFoundMessage = this.noMatchHTML;
        if (noMatchFoundMessage) {
            this.view.render(noMatchFoundMessage);
        } else {
            this.hide();
        }
    }
};





function ajaxSuccess(callback, formatter) {
    return function(data) {
        if (callback) callback(data.map(formatter));
    };
}
function ajaxError(error) {
    console.log("Loading json errored...", error);
}

