var DOM = require("./utilities/dom"),
    extend = require("./utilities/extend"),
    replaceAll = require("./utilities/string-replace").all;

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
        toRender = templates.list.replace("{{choices}}", err);
        return this._renderError(toRender);
    }

    items = data.map(this._renderLI, this).join("");
    toRender = templates.list.replace("{{choices}}", items);
    return this._renderSucess(toRender);
};

/**
 * Renders list item data to the list item template
 * @method
 * @param {array} data
 */
View.prototype._renderSucess = function(html) {
    this.container.innerHTML = html;
    return this;
};

/**
 * Renders the error template
 * @method
 * @param {string} error - Message to paste into the popover (most likely html, but text works too!)
 */
View.prototype._renderError = function(error) {
    this.container.innerHTML = error;
    return this;
};


/**
 * Renders a datump into a listItem template
 * @method
 * @private
 * @param {string} error - Message to paste into the popover (most likely html, but text works too!)
 */
View.prototype._renderLI = function(datum) {
    var result = this.templates.listItem;
    result = replaceAll(result, "{{value}}", datum.name); // TODO change .name property name
    result = replaceAll(result, "{{data}}", datum.data);   // TODO change .data property name
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

    this.container.style.marginTop = this._getNegativeMargin(quill);
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
    var node = this._findMentionNode(quill);
    return DOM.getOlderSiblingsInclusive(node);
};

/**
 * Return the DOM node that encloses the line on which current mention is being typed.
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
        if (node.tagName === "DIV") break;
        node = node.parentNode;
    }
    if (!node) return null;
    return node;
};

/**
 * @method
 * @private
 */
View.prototype._getNegativeMargin = function(quill) {
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