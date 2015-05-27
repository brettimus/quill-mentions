/**
 * @module defaults/defaults
 */

var extend = require("../utilities/extend"),
    identity = require("../utilities/identity");

/**
 * @namespace
 * @prop {object} ajax - The default ajax configuration.
 * @prop {number} choiceMax - The maximum number of possible matches to display.
 * @prop {object[]} choices - A static array of possible choices. Ignored if `ajax` is truthy.
 * @prop {string} choiceTemplate - A string used as a template for possible choices.
 * @prop {string} containerClassName - The class attached to the mentions view container.
 * @prop {regexp} matcher - The regular expression used to trigger Mentions#search
 * @prop {string} mentionClass - Prefixed with `ql-` for now because of how quill handles custom formats. The class given to inserted mention. 
 * @prop {number} offset - I forogt where this is even used. Probably has to do with calculating position of popover.
 * @prop {string}
 * @prop {string} template - A template for the popover, into which possible choices are inserted. 
 */
var defaults = {
    ajax: false,
    choiceMax: 6,
    choices: [],
    choiceTemplate: "<li data-mention=\"{{data}}\">{{choice}}</li>",
    containerClassName: "ql-mentions",
    hideMargin: '-10000px',
    matcher: /@\w+$/i,
    mentionClass: "mention-item",
    offset: 10,
    template: '<ul>{{choices}}</ul>',
};

/**
 * @namespace
 * @prop {function} format - Mapped onto the array of possible matches returned by call to `path`. Should yield the expected interface for data, which is an object with `name` and `data` properties.
 * @prop {string} path - The path to endpoint we should query for possible matches.
 * @prop {string} queryParameter - The name of the query paramater in the url sent to `path`.
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