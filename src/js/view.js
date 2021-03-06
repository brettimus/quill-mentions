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