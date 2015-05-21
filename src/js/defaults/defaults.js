/**
 * @module defaults/defaults
 */

var extend = require("../utilities/extend"),
    identity = require("../utilities/identity");

/**
 * @namespace
 * @property {object} ajax - The default ajax configuration.
 * @property {number} choiceMax - The maximum number of possible matches to display.
 * @property {object[]} choices - A static array of possible choices. Ignored if `ajax` is truthy.
 * @property {string} choiceTemplate - A string used as a template for possible choices.
 * @property {string} hideMargin - The margin used to hide the popover.
 * @property {regexp} matcher - The regular expression used to trigger Mentions#search
 * @property {string} mentionClass - The class given to inserted mention. Prefixed with `ql-` for now.
 * @property {number} offset - I forogt where this is even used. Probably has to do with calculating position of popover.
 * @property {string} template - A template for the popover, into which possible choices are inserted. 
 */
var defaults = {
    ajax: false,
    choiceMax: 10,
    choices: [],
    choiceTemplate: "<li>{{choice}}</li>",
    hideMargin: '-10000px',
    matcher: /@\w+$/i,
    mentionClass: "mention-item",
    offset: 10,
    template: '<ul>{{choices}}</ul>',
};

/**
 * @namespace
 * @property {function} format - Mapped onto the array of possible matches returned by call to `path`. Should yield the expected interface for data, which is an object with a `name` property.
 * @property {string} path - The path to endpoint we should query for possible matches.
 * @property {string} queryParameter - The name of the query paramater in the url sent to `path`.
 */
var ajaxDefaults = {
    format: identity,
    path: null,
    queryParameter: "q",
};

/**
 * Returns a configuration object for Mentions constructor.
 */
function defaultFactory(options) {
    var result = extend({}, defaults, options);
    if (options.ajax) {
        result.ajax = extend({}, ajaxDefaults, options.ajax);
    }
    return result;
}

module.exports = defaultFactory;