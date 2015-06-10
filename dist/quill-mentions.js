(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


 function Controller(formatter, view, options) {
     this.format   = formatter;
     this.view     = view;
     this.database = this.munge(options.data);
     this.max      = options.max;
 }


 /**
  * @interface
  * @param {function} formatter - Munges data
  * @param {View} view
  * @param {object} options
  * @prop {function} format - Munges data 
  * @prop {View} view
  * @prop {number} max - Maximum number of matches to pass to the View.  
  */
function AbstractController(formatter, view, options) {
    this.format   = formatter;
    this.view     = view;
    this.max      = options.max;
}

 /**
  * @abstract
  */
 AbstractController.prototype.search = function search() {
    throw new Error("NYI");
 };

 /**
  * Transforms data to conform to config.
  * @method
  * @param {string} qry
  * @param {searchCallback} callback
  */
 AbstractController.prototype.munge = function(data) {
     return data.map(this.format);
 };


/**
 * @constructor
 * @prop {object[]} database - All possible choices for a given mention. 
 */
function Controller(formatter, view, options) {
    AbstractController.call(this, formatter, view, options);
    this.database = this.munge(options.data);
}
Controller.prototype = Object.create(AbstractController.prototype);

Controller.prototype.search = function search(qry, callback) {
    var qryRE = new RegExp(escapeRegExp(qry), "i"),
        data;

    data = this.database.filter(function(d) {
        return qryRE.test(d.value);
    }).sort(function(d1, d2) {
        return d1.value.indexOf(qry) - d2.value.indexOf(qry);
    });

    this.view.render(data.slice(0, this.max));
    if (callback) callback();
};


/**
 * @constructor
 * @augments Controller
 * @prop {string} path - The path from which to request data.
 * @prop {string} queryParameter - The name of the paramter in the request to Controller~path
 * @prop {Object} _latestCall - Cached ajax call. Aborted if a new search is made.
 */
function AJAXController(formatter, view, options) {
    AbstractController.call(this, formatter, view, options);
    this.path = options.path;
    this.queryParameter = options.queryParameter;
    this._latestCall = null;
}
AJAXController.prototype = Object.create(AbstractController.prototype);

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
},{"./utilities/ajax":6,"./utilities/regexp":10}],2:[function(require,module,exports){
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
},{"../utilities/extend":8,"../utilities/identity":9}],3:[function(require,module,exports){
(function (global){
global.QuillMentions = require("./mentions");
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mentions":5}],4:[function(require,module,exports){


var DOM = require("./utilities/dom"),
    addClass = DOM.addClass,
    removeClass = DOM.removeClass;

var SELECTED_CLASS = "ql-mention-choice-selected";

/**
 * Dispatches keyboard events to handlers
 * @namespace
 * @prop {function} 
 */
 /**
  * @namespace
  * @prop {Number} 13 - Handler for the enter key.
  * @prop {Number} 27 - Handler for the escape key.
  * @prop {Number} 38 - Handler for the up arrow key.
  * @prop {Number} 40 - Handler for the down arrow key.
  */
var keydown = {
    27: keydownEscape,
    38: keydownUpKey,
    40: keydownDownKey,
};

var keyup = {
    13: keyupEnter,
};

/**
 * @method
 * @this {QuillMentions}
 */
function keydownDownKey() {
    if (this.view.isHidden()) return;
    _moveSelection.call(this, 1);
}

/**
 * @method
 * @this {QuillMentions}
 */
function keydownUpKey() {
    if (this.view.isHidden()) return;
    _moveSelection.call(this, -1);
}

/**
 * @method
 * @this {QuillMentions}
 */
function keyupEnter() {
    var nodes,
        currIndex = this.selectedChoiceIndex,
        currNode;

    if (currIndex === -1) return;
    if (!this.view.hasMatches()) return;

    this.quill.setSelection(this._cachedRange);
    nodes = this.view.getMatches();
    currNode = nodes[currIndex];
    this.addMention(currNode);
    this.selectedChoiceIndex = -1;
}

/**
 * @method
 * @this {QuillMentions}
 */
function keydownEscape() {
    this.view.hide();
    this.selectedChoiceIndex = -1;
    this.quill.focus();
}

/**
 * Moves the selected list item up or down. (+steps means down, -steps means up) PUT THIS IN THE VIEW
 * @method
 * @private
 * @this {QuillMentions}
 */
function _moveSelection(steps) {
    var nodes,
        currIndex = this.selectedChoiceIndex,
        currNode,
        nextIndex,
        nextNode;

    nodes = this.view.container.querySelectorAll("li");

    if (nodes.length === 0) {
        this.selectedChoiceIndex = -1;
        return;
    }
    if (currIndex !== -1) {
        currNode = nodes[currIndex];
        removeClass(currNode, SELECTED_CLASS);
    }

    nextIndex = _normalizeIndex(currIndex + steps, nodes.length);
    nextNode = nodes[nextIndex];

    if (nextNode) {
        addClass(nextNode, SELECTED_CLASS);
        this.selectedChoiceIndex = nextIndex;
    }
    else {
        console.log("Indexing error on node returned by querySelectorAll");
    }

}

function _normalizeIndex(i, modulo) {
    if (modulo <= 0) throw new Error("TF are you doing? _normalizeIndex needs a nonnegative, nonzero modulo.");
    while (i < 0) {
        i += modulo;
    }
    return i % modulo;
}

module.exports = {keyup: keyup, keydown: keydown};
},{"./utilities/dom":7}],5:[function(require,module,exports){
/** @module mentions */

var AJAXController = require("./controller").AJAXController,
    Controller = require("./controller").Controller,
    View = require("./view");

var extend = require("./utilities/extend"),
    defaultFactory = require("./defaults/defaults"), // keep in defaults so we can write specific defaults for each object
    KEYUP = require("./keyboard").keyup,
    KEYDOWN = require("./keyboard").keydown;

module.exports = QuillMentions;

/**
 * @constructor
 * @param {Object} quill - An instance of `Quill`.
 * @param {Object} [options] - User configuration passed to the mentions module. It's mixed in with defaults.
 * @prop {Quill} quill
 * @prop {HTMLElement} container - Container for the popover (a.k.a. the View)
 * @prop {RegExp} matcher - Used to scan contents of editor for mentions.
 */
function QuillMentions(quill, options) {

    this.quill = quill;
    var modOptions = defaultFactory(options),
        container = this.quill.addContainer(modOptions.containerClassName);

    this.triggerSymbol = modOptions.triggerSymbol;
    this.includeTrigger = modOptions.includeTrigger;
    this.matcher = modOptions.matcher;
    this.mentionClass = modOptions.mentionClass;
    this.currentMention = null;

    this.selectedChoiceIndex = -1;

    this.setView(container, modOptions)
        .setController(modOptions)
        .listenTextChange(quill)
        .listenSelectionChange(quill)
        .listenClick(container)
        .addFormat();

    if (modOptions.hotkeys) {
        this.listenHotKeys(quill);
    }

    this._cachedRange = null;
    this.charSinceMention = 0;
}

/**
 * Sets QuillMentions.view to a View object
 * @method
 * @private
 * @param {HTMLElement} container
 * @param {Object} options - Configuration for the view
 */
QuillMentions.prototype.setView = function(container, options) {
    var templates = {},
        errMessage = options.noMatchMessage,
        marginTop = options.marginTop;
    templates.list = options.template;
    templates.listItem = options.choiceTemplate;
    templates.error = options.noMatchTemplate;
    this.view = new View(container, templates, {errMessage: errMessage, marginTop: marginTop });
    return this;
};

/**
 * Sets QuillMentions.controller to a Controller or AJAXController object (depending on options).
 * @method
 * @private
 * @param {Object} options - Configuration for the controller.
 */
QuillMentions.prototype.setController = function(options) {
    if (!this.view) throw new Error("Must set view before controller.");

    var formatter,
        config = {
            max: options.choiceMax,
        };
    if (!options.ajax) {
        formatter = options.format;
        config.data = options.choices;
        this.controller = new Controller(formatter, this.view, config);
    } else {
        formatter = options.ajax.format;
        extend(config, options.ajax);
        this.controller = new AJAXController(formatter, this.view, config);
    }
    return this;
};

/**
 * Sets a listener for text-change events on the given Quill instance
 * @method
 * @param {Quill} quill - An instance of Quill
 */
QuillMentions.prototype.listenTextChange = function listenTextChange(quill) {
    var eventName = this.quill.constructor.events.TEXT_CHANGE;
    quill.on(eventName, textChangeHandler.bind(this));
    return this;

    function textChangeHandler(delta, source) {
        if (source === "api") return;
        var mention = this.findMention(),
            query,
            _this;

        if (mention) {
            _this = this;

            this.charSinceMention = 0;
            this._cachedRange = quill.getSelection();
            this.currentMention = mention;
            this._addTemporaryMentionSpan();

            query = mention[0].replace(this.triggerSymbol, "");

            this.controller.search(query, function() {
                _this.view.show(_this.quill);
            });
        }
        else {
            this.charSinceMention++;
            this.view.hide();
        }
    }
};


/**
 * Sets a listener for selection-change events on the given Quill instance
 * @method
 * @param {Quill} quill - An instance of Quill
 */
QuillMentions.prototype.listenSelectionChange = function(quill) {
    var eventName = quill.constructor.events.SELECTION_CHANGE;
    quill.on(eventName, selectionChangeHandler.bind(this));
    return this;

    function selectionChangeHandler(range) {
        if (!range) this.view.hide();
    }
};

/**
 * Sets a listener for keyboard events on the given container.
 * Events are dispatched through the KEYS object.
 * @method
 * @param {Quill} quill - An instance of Quill
 */
QuillMentions.prototype.listenHotKeys = function(quill) {
    quill.container
        .addEventListener('keydown',
                           keydownHandler.bind(this)); // TIL keypress is intended for keys that normally produce a character

    quill.container
        .addEventListener('keyup',
                           keyupHandler.bind(this));

    return this;

    function keydownHandler(event) {
        var code = event.keyCode || event.which;
        if (!this.view.isHidden()) { // need special logic for enter key :sob:
            if (KEYDOWN[code]) {
                KEYDOWN[code].call(this);
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }
    function keyupHandler(event) {
        var code = event.keyCode || event.which;
        if (!this.view.isHidden() || this.charSinceMention === 1) { // this weird if condition solve an issue where hitting enter would hide the view and we wouldn't be able to insert the mention...
            if (KEYUP[code]) {
                KEYUP[code].call(this);
            }
        }
    }
};

/**
 * Listens for a click or touchend event on the View.
 * @method
 * @param {HTMLElement} elt
 */
QuillMentions.prototype.listenClick = function(elt) {

    elt.addEventListener("click", addMention.bind(this));
    elt.addEventListener("touchend", addMention.bind(this));
    return this;

    /** Wraps the QuillMentions~addMention method */
    function addMention(event) {
        var target = event.target || event.srcElement;
        if (target.tagName.toLowerCase() === "li") {
            this.addMention(target);
        }
        event.stopPropagation();
    }
};

/**
 * Looks for a string in the editor (up to the cursor's current position) for a match to QuillMentions~matcher
 * @method
 * @return {Match}
 */
QuillMentions.prototype.findMention = function findMention() {
    var range = this.quill.getSelection() || this._cachedRange;
    if (!range) return;
    var cursor = range.end,
        contents = this.quill.getText(0, cursor);

    return this.matcher.exec(contents);
};

/**
 * Needs to be refactored! QuillMention should be responsible for this action.
 * @method
 * @param {HTMLElement}
 */
QuillMentions.prototype.addMention = function addMention(node) {
    var insertAt = this.currentMention.index,
        toInsert = (this.includeTrigger ? this.triggerSymbol : "") + node.dataset.display,
        toFocus = insertAt + toInsert.length + 1;


    this.quill.deleteText(insertAt, insertAt + this.currentMention[0].length);
    this.quill.insertText(insertAt, toInsert, "mention", this.mentionClass+"-"+node.dataset.mention);
    this.quill.insertText(insertAt + toInsert.length, " ");
    this.quill.setSelection(toFocus, toFocus);

    this.view.hide();
};

QuillMentions.prototype._addTemporaryMentionSpan = function(range) {
    var insertAt = this.currentMention.index,
        toInsert = this.currentMention[0];

    this.quill.deleteText(insertAt, insertAt + this.currentMention[0].length);
    this.quill.insertText(insertAt, toInsert, "mention", "is-typing-mention");
};


 /**
  * Refactor.
  * @method
  */
 QuillMentions.prototype.hasSelection = function() {
     return this.selectedChoiceIndex !== -1;
 };

/**
 * Waiting on new custom formats in Quill to beef this up.
 * @method
 * @private
 */
 QuillMentions.prototype.addFormat = function(className) {
     this.quill.addFormat('mention', { tag: 'SPAN', "class": "ql-", }); // a mention is a span with the class prefix "ql-". the naming is an artifact of the current custom formats implementation
     return this;
 };


},{"./controller":1,"./defaults/defaults":2,"./keyboard":4,"./utilities/extend":8,"./view":12}],6:[function(require,module,exports){
/** @module utilities/ajax */
module.exports = {

    // from stackoverflow 
    // https://stackoverflow.com/questions/9838812/how-can-i-open-a-json-file-in-javascript-without-jquery
    /**
     * @function loadJSON
     */
    loadJSON: function loadJSON(path, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function()
        {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    if (success)
                        success(JSON.parse(xhr.responseText));
                } else {
                    if (error)
                        error(xhr);
                }
            }
        };
        xhr.open("GET", path, true);
        xhr.send();
        return xhr;
    },
};
},{}],7:[function(require,module,exports){
module.exports.addClass = addClass;
module.exports.getOlderSiblingsInclusive = getOlderSiblingsInclusive;
module.exports.hasClass = hasClass;
module.exports.removeClass = removeClass;

function addClass(node, className) {
    if (!hasClass(node, className)) {
        node.className += " "+className;
    }
}

function getOlderSiblingsInclusive(node) {
    var result = [node];
    if (!node) return [];
    while (node.previousSibling) {
        result.push(node.previousSibling);
        node = node.previousSibling;
    }
    return result;
}

function hasClass(node, className) {
    if (!node) return console.log("Called hasClass on an empty node");
    return node.className.indexOf(className) !== -1;
}

function removeClass(node, className) {
    if (!hasClass(node, className)) return;
    while (hasClass(node, className)) {
        node.className = node.className.replace(className, "");
    }
}
},{}],8:[function(require,module,exports){
/**
 * Extend module
 * @module utilities/extend
 */
module.exports = extend;

/**
 * Shallow-copies an arbitrary number of objects' properties into the first argument. Applies "last-in-wins" policy to conflicting property names.
 * @function extend
 * @param {...Object} o
 */
function extend(o) {
    var args   = [].slice.call(arguments, 0),
        result = args[0];

    for (var i=1; i < args.length; i++) {
        result = extendHelper(result, args[i]);
    }

    return result;
}

/**
 * Shallow-copies one object into another.
 * @function extendHelper
 * @param {Object} destination - Object into which `source` properties will be copied.
 * @param {Object} source - Object whose properties will be copied into `destination`.
 */
function extendHelper(destination, source) {
    // thanks be to angus kroll
    // https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/
    for (var k in source) {
        if (source.hasOwnProperty(k)) {
          destination[k] = source[k];
        }
    }
    return destination;
}
},{}],9:[function(require,module,exports){
/** @module utilities/identity */

module.exports = identity;

/** @function identity */
function identity(d) {
    return d;
}
},{}],10:[function(require,module,exports){
module.exports = {
    escapeRegExp: function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
};
},{}],11:[function(require,module,exports){
var escapeRegExp = require("./regexp").escapeRegExp;

module.exports = {
    all: replaceAll,
};

/**
 * @param {stirng} [options] - RegExp options (like "i").
 **/
function replaceAll(string, toReplace, replaceWith, options) {
    options = options || "";
    var reOpts = "g" + options,
        re     = new RegExp(escapeRegExp(toReplace), reOpts);

    return string.replace(re, replaceWith);
}
},{"./regexp":10}],12:[function(require,module,exports){
var DOM = require("./utilities/dom"),
    extend = require("./utilities/extend"),
    replaceAll = require("./utilities/string-replace").all,
    escapeRegExp = require("./utilities/regexp").escapeRegExp;

module.exports = View;


/**
 * @constructor
 * @param {HTMLElement} container
 * @param {Object} templates - a set of templates into which we render munged data
 * @param {Object} options
 */
function View(container, templates, options) {
    this.container = container;
    this.templates = extend({}, templates);
    this.marginTop = options.marginTop;
    this.errMessage = options.errMessage;
}

/**
 * Creates view from data and calls View~_renderSuccess. If there are no data, calls View~_renderError.
 * @method
 * @param {array} data
 */
View.prototype.render = function(data) {
    var templates = this.templates,
        items,
        err,
        toRender;
    if (!data || !data.length) {
        err = templates.error.replace("{{message}}", this.errMessage);
        this.container.innerHTML = err;
    }
    else {
        items = data.map(this._renderLI, this).join("");
        this.container.innerHTML = templates.list.replace("{{choices}}", items);
    }
    return this;
};

/**
 * Renders listItem template with a datum as the context
 * @method
 * @private
 * @param {object} datum - A piece of data 
 */
View.prototype._renderLI = function(datum) {
    var template = this.templates.listItem;
    return this._renderWithContext(template, datum);
};

/**
 * Renders a template given the context of an object
 * @method
 * @private
 * @param {string} template
 * @param {object} o - Context for a template string.
 */
View.prototype._renderWithContext = function(template, o) {
    var prop,
        result = template;

    for (prop in o) {
        if (o.hasOwnProperty(prop)) {
            result = replaceAll(result, "{{"+prop+"}}", o[prop]);
        }
    }

    return result;
};

/**
 * Makes the popover disappear
 * @method
 * @param {Quill} quill
 * @param {Object} range
 */
View.prototype.hide = function hide(quill, range) {
    DOM.removeClass(this.container, "ql-is-mentioning");
    this.container.style.marginTop = "0";
    if (range) quill.setSelection(range);
    return this;
};

/**
 * @method
 * @returns {HTMLElement[]}
 */
View.prototype.getMatches = function getMatches() {
    return this.container.querySelectorAll("li");
};

/**
 * @method
 * @returns {HTMLElement[]}
 */
View.prototype.hasMatches = function hasMatches() {
    return this.getMatches().length > 0;
};

/**
 * Returns whether the popover is in view. I had bad feels about this method but it's coming in hand re: keyboard events right now.
 * @method
 * @returns {boolean}
 */
View.prototype.isHidden = function isHidden() {
    return !DOM.hasClass(this.container, "ql-is-mentioning");
};

/**
 * Adds an active class to the mentions popover and sits it beneath the cursor.
 * [TODO - add active class to config]
 * @method
 * @param {Quill} quill
 */
View.prototype.show = function show(quill) {

    this.container.style.marginTop = this._getTopMargin(quill);
    this.container.style.marginLeft = this._getLeftMargin(quill);
    DOM.addClass(this.container, "ql-is-mentioning"); // TODO - config active class
    this.container.focus(); // Does this even do anything? It would if we were using form elements instead of LIs prob

    return this;
};

/**
 * Return an array of dom nodes corresponding to all lines at or before the line corresponding to the current range.
 * @method
 * @private
 * @param {Range} range
 * @return {Node[]}
 */
View.prototype._findOffsetLines = function(quill) {
    var node = this._findMentionContainerNode(quill);
    return DOM.getOlderSiblingsInclusive(node);
};

/**
 * Return the DOM node that encloses the line on which current mention is being typed.
 * @method
 * @private
 * @param {Range} range
 * @return {Node|null}
 */
View.prototype._findMentionContainerNode = function _findMentionContainerNode(quill) {
    var range = quill.getSelection(),
        leafAndOffset,
        leaf,
        offset,
        node;
       
                
    leafAndOffset = quill.editor.doc.findLeafAt(range.start, true);
    leaf = leafAndOffset[0];
    offset = leafAndOffset[1]; // how many chars in front of current range
    if (leaf) node = leaf.node;
    while (node) {
        if (node.tagName === "DIV") break;
        node = node.parentNode;
    }
    if (!node) return null;
    return node;
};

/**
 * Return the (hopefully inline-positioned) DOM node that encloses the mention itself.
 * @method
 * @private
 * @param {Range} range
 * @return {Node|null}
 */
View.prototype._findMentionNode = function _findMentionNode(quill) {
    var range = quill.getSelection(),
        leafAndOffset,
        leaf,
        offset,
        node;
       
                
    leafAndOffset = quill.editor.doc.findLeafAt(range.start, true);
    leaf = leafAndOffset[0];
    offset = leafAndOffset[1]; // how many chars in front of current range
    if (leaf) node = leaf.node;
    while (node) {
        if (node.tagName === "SPAN") break;
        node = node.parentNode;
    }
    if (!node) return null;
    return node;
};

View.prototype._getLeftMargin = function(quill) {
    var mentionNode = this._findMentionNode(quill),
        mentionParent = this._findMentionContainerNode(quill);

    var mentionRect = mentionNode.getBoundingClientRect(),
        parentRect = mentionParent.getBoundingClientRect(),
        editorRect = quill.container.getBoundingClientRect();

    var marginLeft = mentionRect.left - parentRect.left;

    var overflow = marginLeft + mentionRect.width - editorRect.width;

    if (overflow > 0) {
        marginLeft -= (overflow);
    }

    return marginLeft + "px";
};

/**
 * @method
 * @private
 */
View.prototype._getTopMargin = function(quill) {
    var qlEditor = quill.editor.root,
        qlLines,
        marginTop = this.marginTop,
        negMargin = -marginTop,
        range;

    qlLines = this._findOffsetLines(quill);

    negMargin += this._nodeHeight(qlEditor);
    negMargin -= qlLines.reduce(function(total, line) {
        return total + this._nodeHeight(line);
    }.bind(this), 0);

    return "-" + negMargin + "px";
};

/**
 * @method
 * @private
 */
View.prototype._nodeHeight = function(node) {
    return node.getBoundingClientRect().height;
};


// TODO - write QuillEditor View
function QuillEditorView() {
    throw new Error("NYI");
}
},{"./utilities/dom":7,"./utilities/extend":8,"./utilities/regexp":10,"./utilities/string-replace":11}]},{},[1,2,3,4,5,6,7,8,9,10,11,12]);
