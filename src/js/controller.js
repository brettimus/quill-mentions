// TODO - factor out data munging into separate object

/** @module controller */

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
    this.max = options.max;
}

/**
 * Looks for match to the qry in the given data.
 * @method
 * @param {string} qry
 * @param {searchCallback} callback - Probably unnecessary...
 */
Controller.prototype.search = function search(qry, callback) {
    var data = this.data.filter(function(d) {
        var qryRE = new RegExp(escapeRegExp(qry), "i");
        return qryRE.test(d.name);
    });

    this.view.render(data.slice(0, this.max)); // IDEA TODO - just don't render if there's no data & no error template
    if (callback) callback();
};


/**
 * @constructor
 * @augments Controller
 * @param {Function} formatter - munges callback data
 * @param {View} view
 * @param {Object} options
 */
function AJAXController(formatter, view, options) {
    this.path = options.path;
    this.queryParameter = options.queryParameter;
    this._latestCall = null;
}
AJAXController.prototype = Object.create(Controller.prototype);

/**
 * @method
 * @param {String} qry
 * @param {searchCallback} callback - Callback that handles returned JSON data
 */
AJAXController.prototype.search = function search(qry, callback) {

    if (this._latestCall) this.latest.abort();  // caches ajax calls so we can cancel them as the input is updated
    var qryString = this.path +
                     "?" + this.queryParameter +
                     "=" + encodeURIComponent(qry);

    this._latestCall = loadJSON(qryString, this._callback.bind(this), ajaxError);
};

/**
 * Munges the callback data
 * @method
 * @private
 * @param {array} data
 */
AJAXController.prototype._callback = function(data) {
    data = data.slice(0, this.max);
    this.view.render(data.map(this.formatter));
};

function ajaxError(error) {
    console.log("Loading json errored! Likely due to aborted request, but there's the error: ", error);
}