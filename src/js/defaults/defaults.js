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
 * @prop {function} format - Function used by a Controller instance to munge data into expected form.
 * @prop {boolean} hotkeys - If false, disables navigating the popover with the keyboard.
 * @prop {boolean} includeTrigger - Whether to prepend triggerSymbol to the inserted mention.
 * @prop {number} marginTop - Amount of margin to place on top of the popover. (Controls space, in px, between the line and the popover) 
 * @prop {RegExp} matcher - The regular expression used to trigger Controller#search
 * @prop {string} mentionClass - Prefixed with `ql-` for now because of how quill handles custom formats. The class given to inserted mention. 
 * @prop {string} noMatchMessage - A message to display 
 * @prop {string} noMatchTemplate - A template in which to display error message
 * @prop {string} template - A template for the popover, into which possible choices are inserted.
 * @prop {string} triggerSymbol - Symbol that triggers the mentioning state.
 */
var defaults = {
    ajax: false,
    choiceMax: 6,
    choices: [],
    choiceTemplate: "<li data-display=\"{{value}}\" data-mention=\"{{data}}\">{{value}}</li>",
    containerClassName: "ql-mentions",
    format: identity,
    hotkeys: true,
    includeTrigger: false,
    marginTop: 10,
    matcher: /@\w+$/i,
    mentionClass: "mention-item",
    noMatchMessage: "Ruh Roh Raggy!",
    noMatchTemplate: "<div class='ql-mention-no-match'><i>{{message}}</i></div>",
    template: '<ul>{{choices}}</ul>',
    triggerSymbol: "@",
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
 * Returns a configuration object for QuillMentions constructor.
 * @name defaultFactory
 */
function defaultFactory(options) {
    var result = extend({}, defaults, options);
    if (options.ajax) {
        result.ajax = extend({}, ajaxDefaults, options.ajax);
    }
    return result;
}
module.exports = defaultFactory;