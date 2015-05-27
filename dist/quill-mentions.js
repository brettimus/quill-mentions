(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function addController(QuillMentions) {

    /**
     * @method
     */
    QuillMentions.prototype.renderCurrentChoices = function renderCurrentChoices() {
        if (this.hasChoices()) {
            this.render(this._getChoicesHTML());
        }
        else {
            // render helpful message about nothing matching so far...
            this.render(this.noMatchHTML);
        }
    };

    /**
     * Adds markup to template and puts it inside the container.
     * @method
     * @private
     */
    QuillMentions.prototype.render = function(choices) {
        var template = this.options.template,
            result   = template.replace("{{choices}}", choices);

        this.container.innerHTML = result;
    };

    /**
     * Maps the current array of possible choices to one long string of HTML.
     * @method
     * @private
     */
    QuillMentions.prototype._getChoicesHTML = function() {
        return this
                .currentChoices
                .map(this._renderChoice, this)
                .join("");
    };

    /**
     * Replaces the {{choice}} and {{data}} fields in a template.
     * @method
     * @private
     */
    QuillMentions.prototype._renderChoice = function(choice) {
        var template = this.options.choiceTemplate,
            result;
        result = template
                    .replace("{{choice}}", choice.name)
                    .replace("{{data}}", choice.data);
        return result;
    };

    /**
     * Returns whether or not there are any choices to display.
     * @method
     * @private
     */
    QuillMentions.prototype.hasChoices = function() {
        return this.currentChoices && this.currentChoices.length;
    };
};
},{}],2:[function(require,module,exports){
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
 * @prop {string} noMatchMessage - A message to display 
 * @prop {number} offset - I forogt where this is even used. Probably has to do with calculating position of popover.
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
    noMatchMessage: "Ruh roh raggy!",
    noMatchTemplate: "<li class='no-match'><i>{{message}}</i></li>",
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
},{"../utilities/extend":9,"../utilities/identity":10}],3:[function(require,module,exports){
module.exports = addFormat;

function addFormat(QuillMentions) {
    /**
     * @method
     */
    QuillMentions.prototype.addFormat = function(className) {
        this.quill.addFormat('mention', { tag: 'SPAN', "class": "ql-", });
    };
}
},{}],4:[function(require,module,exports){
(function (global){
global.QuillMentions = require("./mentions");
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mentions":5}],5:[function(require,module,exports){
var addController = require("./controller"),
    addFormat = require("./format"),
    addSearch = require("./search"),
    addView = require("./view");

var defaultFactory = require("./defaults/defaults");

addController(QuillMentions);
addFormat(QuillMentions);
addSearch(QuillMentions);
addView(QuillMentions);

module.exports = QuillMentions;

/**
 * @constructor
 * @param {Object} quill - An instance of `Quill`.
 * @param {Object} [options] - User configuration passed to the mentions module. It's mixed in with defaults.
 * @property {Object} quill - Instance of quill editor.
 * @property {Object} options - Default configuration mixed in with user configuration.
 * @property {Object} container - DOM node that contains the mention choices.
 * @property {Object[]|null} currentChoices - 
 * @property {Object|null} currentMention
 */
function QuillMentions(quill, options) {

    this.quill = quill;
    this.options = defaultFactory(options);
    this.container = this.quill.addContainer(this.options.containerClassName);
    this.currentChoices = null;
    this.currentMention = null;

    this.hide();
    this.addFormat(); // adds custom format for mentions
    this.addListeners();

    // TODO - (re)move this. just putting it here as a reminder...
    this.hotKeys = {
        38: [
            { // up arrow
                callback: function() {
    
                },
                key: 38,
                metaKey: false,
            },
            ],
        40: [
            { // down arrow
                callback: function() {
    
                },
                key: 40,
                metaKey: false,
            },
            ],
    };
}

/**
 * @method
 */
QuillMentions.prototype.addListeners = function addListeners() {
    var textChangeHandler = this.textChangeHandler.bind(this),
        addMentionHandler = this.addMentionHandler.bind(this);

    this.quill.on(this.quill.constructor.events.TEXT_CHANGE, textChangeHandler);

    this.container.addEventListener('click', addMentionHandler, false);
    this.container.addEventListener('touchend', addMentionHandler, false);
};

/**
 * @method
 */
QuillMentions.prototype.textChangeHandler = function textChangeHandler(_delta) {
    var mention = this.findMention(),
        queryString,
        that;
    if (mention) {
        this.currentMention = mention;
        queryString = mention[0].replace("@", "");
        that = this;
        this.search(queryString, function(data) {
            that.currentChoices = data.slice(0, that.options.choiceMax);
            that.renderCurrentChoices();
            that.show();
        });
    }
    else if (this.container.className.search(/ql\-is\-mentioning/) !== -1) {
        this.currentMention = null;
        this.range = null;   // Prevent restoring selection to last saved
        this.hide();
    }
};

/**
 * @method
 * @return {Match}
 */
QuillMentions.prototype.findMention = function findMention() {
    var contents,
        match;

    this.range = this.quill.getSelection();
    if (!this.range) return;
    contents = this.quill.getText(0, this.range.end);
    match = this.options.matcher.exec(contents);
    return match;
};



/**
 * @method
 */
QuillMentions.prototype.addMentionHandler = function addMentionHandler(e) {
    var target = e.target || e.srcElement,
        insertAt = this.currentMention.index,
        toInsert = "@"+target.innerText,
        toFocus = insertAt + toInsert.length + 1;

    this.hide(); // sequencing?

    this.quill.deleteText(insertAt, insertAt + this.currentMention[0].length);
    this.quill.insertText(insertAt, toInsert, "mention", this.options.mentionClass);
    this.quill.insertText(insertAt + toInsert.length, " ");
    this.quill.setSelection(toFocus, toFocus);
    e.stopPropagation();
};


},{"./controller":1,"./defaults/defaults":2,"./format":3,"./search":6,"./view":11}],6:[function(require,module,exports){
// TODO - rename to "model"
var loadJSON = require("./utilities/ajax").loadJSON;
/**
 * @callback searchCallback
 * @param {Object[]} data - An array of objects that represent possible matches to data. The data are mapped over a formatter to provide a consistent interface.
 */

function search(qry, callback) {
    var searcher = this.options.ajax ? this.ajaxSearch : this.staticSearch;
    searcher.call(this, qry, callback);
}

module.exports = function addSearch(QuillMentions) {
    /**
     * Dispatches search for possible matches to a query.
     * @method 
     * @param {string} qry
     * @param {searchCallback} callback - Callback that handles the possible matches
     */
    QuillMentions.prototype.search = search;

    /**
     * @method
     * @param {string} qry
     * @param {searchCallback} callback - Callback that handles possible matches
     */
    QuillMentions.prototype.staticSearch = function staticSearch(qry, callback) {
        var data = this.options.choices.filter(staticFilter(qry));
        if (!callback) noCallbackError("staticSearch");
        callback(data);
    };

    /**
     * @method
     * @param {string} qry
     * @param {searchCallback} callback - Callback that handles possible matches
     */
    QuillMentions.prototype.ajaxSearch = function ajaxSearch(qry, callback) {
        // TODO - remember last ajax request, and if it's still pending, cancel it.
        //       ... to that end, just use promises.

        if (ajaxSearch.latest) ajaxSearch.latest.abort();

        var path = this.options.ajax.path,
            formatData = this.options.ajax.format,
            queryParameter = this.options.ajax.queryParameter,
            qryString = path + "?" + queryParameter + "=" + encodeURIComponent(qry);

        ajaxSearch.latest = loadJSON(qryString, ajaxSuccess(callback, formatData), ajaxError);
    };
};

function staticFilter(qry) {
    return function(choice) {
        // TODO - use case insensitive regexp
        return choice.name.toLowerCase().indexOf(qry.toLowerCase()) !== -1;
    };
}

function ajaxSuccess(callback, formatter) {
    return function(data) {
        if (callback) callback(data.map(formatter));
        else noCallbackError("ajaxSearch");
    };
}

function ajaxError(error) {
    console.log("Loading json errored...", error);
}

function noCallbackError(functionName) {
    console.log("Warning!", functionName, "was not provided a callback. Don't be a ding-dong.");
}
},{"./utilities/ajax":7}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
module.exports.getOlderSiblingsInclusive = getOlderSiblingsInclusive;

function getOlderSiblingsInclusive(node) {
    var result = [node];
    if (!node) return [];
    while (node.previousSibling) {
        result.push(node.previousSibling);
        node = node.previousSibling;
    }
    return result;
}
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
/** @module utilities/identity */

module.exports = identity;

/** @function identity */
function identity(d) {
    return d;
}
},{}],11:[function(require,module,exports){
var getOlderSiblingsInclusive = require("./utilities/dom").getOlderSiblingsInclusive;

module.exports = function addView(QuillMentions) {


    /**
     * @method
     */
    QuillMentions.prototype.hide = function hide() {
        this.container.className = this.container.className.replace(/ql\-is\-mentioning/g, "");
        this.container.style.marginTop = "0";
        if (this.range) this.quill.setSelection(this.range);
        this.range = null;
    };

    /**
     * @method
     * @param {Object} reference
     */
    QuillMentions.prototype.show = function show(reference) {

        var qlContainer = this.quill.container,
            qlEditor = this.quill.editor.root,
            qlLines,
            paddingTop = 10,
            negMargin = -paddingTop;


        this.range = this.quill.getSelection();
        qlLines = this._findOffsetLines(this.range);

        negMargin += qlEditor.getBoundingClientRect().height;
        negMargin -= qlLines.reduce(function(total, line) {
            console.log(line, total);
            return total + line.getBoundingClientRect().height;
        }, 0);

        this.container.style.marginTop = "-"+negMargin+'px';
        this.container.className += " ql-is-mentioning";

        // add keyboard listeners?
        // or have keyboard listeners filter action based on "ql-is-mentioning";

        this.container.focus(); // has no effect...
    };


    /**
     * Return the DOM node that encloses the line on which current mention is being typed.
     * @method
     * @private
     * @param {Range} range
     * @return {Node|null}
     */
    QuillMentions.prototype._findMentionNode = function _findMentionNode(range) {
        var leafAndOffset,
            leaf,
            offset,
            node;

        leafAndOffset = this.quill.editor.doc.findLeafAt(range.start, true);
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
     * Return an array of dom nodes corresponding to all lines at or before the line corresponding to the current range.
     * @method
     * @private
     * @param {Range} range
     * @return {Node[]}
     */
    QuillMentions.prototype._findOffsetLines = function(range) {
        var node = this._findMentionNode(range);
        return getOlderSiblingsInclusive(node);
    };


    /**
     * Render and return the "no matches found" template string
     * @getter
     * @private
     * @return {string}
     */
    Object.defineProperty(QuillMentions.prototype, "noMatchHTML", {
        get: function() {
            var template = this.options.noMatchTemplate,
                notFound = this.options.noMatchMessage;
            return template.replace("{{message}}", notFound);
        }
    });

};
},{"./utilities/dom":8}]},{},[1,2,3,4,5,6,7,8,9,10,11]);
