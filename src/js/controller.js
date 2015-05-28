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
 * @param {function} formatter - Munges data
 * @param {View} view
 * @param {object} options
 * @prop {function} format - Munges data 
 * @prop {View} view
 * @prop {object[]} database - All possible choices for a given mention. 
 * @prop {number} max - Maximum number of matches to pass to the View.  
 */
function Controller(formatter, view, options) {
    this.format   = formatter;
    this.view     = view;
    this.database = this.munge(options.data);
    this.max      = options.max;
}

/**
 * Looks for match to the qry in the given data.
 * @method
 * @param {string} qry
 * @param {searchCallback} callback
 */
Controller.prototype.search = function search(qry, callback) {
    var qryRE = new RegExp(escapeRegExp(qry), "i"),
        data;

    data = this.database.filter(function(d) {
        return qryRE.test(d.name);
    });

    this.view.render(data.slice(0, this.max));
    if (callback) callback();
};

/**
 * Transforms data to conform to config.
 * @method
 * @param {string} qry
 * @param {searchCallback} callback
 */
Controller.prototype.munge = function(data) {
    return data.map(this.format);
};


/**
 * @constructor
 * @augments Controller
 * @prop {string} path - The path from which to request data.
 * @prop {string} queryParameter - The name of the paramter in the request to Controller~path
 * @prop {Object} _latestCall - Cached ajax call. Aborted if a new search is made.
 */
function AJAXController(formatter, view, options) {
    Controller.call(this, formatter, view, options);
    this.path = options.path;
    this.queryParameter = options.queryParameter;
    this._latestCall = null;
}
AJAXController.prototype = Object.create(Controller.prototype);

/**
 * @method
 * @param {String} qry
 * @param {searchCallback} callback
 */
AJAXController.prototype.search = function search(qry, callback) {

    if (this._latestCall) this._latestCall.abort();  // caches ajax calls so we can cancel them as the input is updated
    var qryString = this.path +
                     "?" + this.queryParameter +
                     "=" + encodeURIComponent(qry);

    this._latestCall = loadJSON(qryString, success.bind(this), ajaxError);

    function success(data) {
        this._callback(data);
        if (callback) callback();
    }
};

/**
 * Munges the callback data
 * @method
 * @private
 * @param {array} data
 */
AJAXController.prototype._callback = function(data) {
    data = this.munge(data).slice(0, this.max);
    this.view.render(data);
};

function ajaxError(error) {
    console.log("Loading json errored! Likely due to aborted request, but there's the error: ", error);
}